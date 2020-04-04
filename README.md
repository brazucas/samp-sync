## SAMP SYNC

Lê toda a árvore de arquivos persistidos do servidor e alimenta um banco de dados não relacional, atualmente hardcoded para o MongoDB.

Utilizado principalmente para alimentar o banco de dados utilizado no https://brz.gg.

## Diagrama

<img src="https://github.com/brazucas/rpgmgs-sync/raw/master/diagrama.png" width="300px"/>

#### Exemplos

Arquivo ```brazucas.brz```:

```ArrecadacaoR = 1680478
Arrecadacao = -5769794
TempBan_ID_0_UnbanTime = 1672033194
Gamemode = 2
BondeParado=0
Crimes = 1
TempoEstacao=1546375738
BrazucasAutos = 0
PrefeitoAtual = Ninguem
Candidato1 = (null)
Candidato2 = (null)
Candidato3 = (null)
Candidatos = 0
Votos = 0
VotosCandidato1 = 0
VotosCandidato2 = 0
VotosCandidato3 = 0
PeriodoEleitoral = 0
DiasDoPeriodo = 0
ArrecadacaoD = 7450272
Hospitalizados = 0
Mortes = 0
BrazucasImoveis = 0
Presos = 0
```

É transformado no seguinte documento no mongodb, numa collection "brazucas" (Nome do arquivo):

```$xslt
{
    "_id": {
      "$oid": "5e87f5ec0997f25c71f1ebae"
    },
    "ArrecadacaoR": {
      "$numberInt": "1680478"
    },
    "Arrecadacao": {
      "$numberInt": "-5769794"
    },
    "TempBan_ID_0_UnbanTime": {
      "$numberInt": "1672033194"
    },
    "Gamemode": {
      "$numberInt": "2"
    },
    "BondeParado": {
      "$numberInt": "0"
    },
    "Crimes": {
      "$numberInt": "1"
    },
    "TempoEstacao": {
      "$numberInt": "1546375738"
    },
    "BrazucasAutos": {
      "$numberInt": "0"
    },
    "PrefeitoAtual": "Ninguem",
    "Candidato1": "(null)",
    "Candidato2": "(null)",
    "Candidato3": "(null)",
    "Candidatos": {
      "$numberInt": "0"
    },
    "Votos": {
      "$numberInt": "0"
    },
    "VotosCandidato1": {
      "$numberInt": "0"
    },
    "VotosCandidato2": {
      "$numberInt": "0"
    },
    "VotosCandidato3": {
      "$numberInt": "0"
    },
    "PeriodoEleitoral": {
      "$numberInt": "0"
    },
    "DiasDoPeriodo": {
      "$numberInt": "0"
    },
    "ArrecadacaoD": {
      "$numberInt": "7450272"
    },
    "Hospitalizados": {
      "$numberInt": "0"
    },
    "Mortes": {
      "$numberInt": "0"
    },
    "BrazucasImoveis": {
      "$numberInt": "0"
    },
    "Presos": {
      "$numberInt": "0"
    },
    "__UID": "brazucas"
}
```
