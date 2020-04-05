require('dotenv').config();

const mongodb = require('mongodb');
const fs = require('fs');
const path = require('path');
const _ = require('underscore');

const url = process.env.MONGO_URL;
const filesDir = process.env.FILES_DIR;
const trackedExtensions = ['.ini', '.txt', '.brz'];

mongodb.connect(url, async (err, client) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados: ", err);
  }

  console.log("Conectado ao banco de dados.");

  const db = client.db(process.env.MONGO_DATABASE);

  try {
    await syncDir(db, filesDir);
    client.close();
  } catch (err) {
    return console.error(err);
  }
});

const syncDir = async (db, dir, parentCollection) => {
  const files = fs.readdirSync(dir);
  const buffer = [];

  for (const i in files) {
    const absolutePath = path.resolve(dir, files[i]);
    const stat = fs.statSync(absolutePath);
    const fileInfo = path.parse(absolutePath);

    const extension = fileInfo.ext;
    const fileName = fileInfo.name;

    let collectionName = absolutePath
      .replace(filesDir, "")
      .replace(files[i], "")
    ;

    if (!collectionName) {
      collectionName = fileName;
    }

    collectionName = parseCollectionName(collectionName);

    // console.log('>>>> collectionOrigin ', collectionOrigin);

    if (stat.isDirectory()) {
      await syncDir(db, absolutePath, collectionName);
    }

    if (!stat.isFile() || trackedExtensions.indexOf(extension) === -1) {
      continue;
    }

    const fileContents = fs.readFileSync(absolutePath);
    const ini = parseIni(fileContents.toString());

    if (ini) {
      ini["__UID"] = fileName;
      addToBuffer(buffer, collectionName, ini);
    }
  }

  await flushBuffer(db, buffer);
};

const addToBuffer = (buffer, collection, ini) => {
  if (!buffer[collection]) {
    buffer[collection] = [];
  }

  ini['MONGODB_SYNC'] = new Date();

  buffer[collection].push(ini);
};

const parseCollectionName = (collectionName) => {
  return collectionName.replace(/\/$/, "").replace(/\//g, "_").toLowerCase();
};

const flushBuffer = async (db, buffers) => {
  for (const collectionName in buffers) {
    const collection = db.collection(collectionName);

    const ids = _.pluck(buffers[collectionName], "__UID");

    const results = await collection.find({"__UID": {$in: ids}});

    const docs = await results.toArray();

    const idsToUpdate = _.pluck(docs, "__UID");

    const docsToInsert = _.filter(buffers[collectionName], buffer => idsToUpdate.indexOf(buffer["__UID"]) == -1);
    const docsToUpdate = _.filter(docs, buffer => idsToUpdate.indexOf(buffer["__UID"]) !== -1);

    console.log(`[${collectionName}] Irá adicionar ${docsToInsert.length} documentos`);
    console.log(`[${collectionName}] Irá atualizar ${idsToUpdate.length} documentos`);

    if (docsToUpdate.length) {
      for (const i in docsToUpdate) {
        delete docsToUpdate[i]['_id'];

        const data = _.find(buffers[collectionName], buffer => buffer["__UID"] === docsToUpdate[i]["__UID"]);
        await collection.updateOne({"__UID": data["__UID"]}, {$set: data});
      }
    }

    if (docsToInsert.length) {
      await collection.insertMany(docsToInsert, (err, result) => {
        if (err) {
          return console.error("Erro ao fazer buffer da collection " + collectionName, err);
        }
      });
    }
  }
};

const parseIni = (contents) => {
  const lines = contents.split("\n");

  const model = {};

  for (const i in lines) {
    const line = lines[i];
    const split = line.split("=");

    if (split.length < 2) {
      continue;
    }

    const property = split[0];
    const value = split.splice(1).join("=").replace(/\r?\n|\r/g, "");

    if (!property || !property.trim().length) {
      continue;
    }

    model[property.trim()] = value.trim();

    if (!isNaN(parseInt(model[property.trim()]))) {
      if ((parseFloat(model[property.trim()]) + "").length === model[property.trim()].length) {
        model[property.trim()] = parseFloat(model[property.trim()]);
      } else if ((parseInt(model[property.trim()]) + "").length === model[property.trim()].length) {
        model[property.trim()] = parseInt(model[property.trim()]);
      }
    }
  }

  if (!Object.keys(model).length) {
    return false;
  }

  return model;
};
