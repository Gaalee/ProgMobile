# ProgMobile
Repo de la matière Programmation Mobile M2

## Clone & Setup
`git clone https://github.com/Gaalee/ProgMobile.git`

Ouvrir deux terminaux, client et serveur avec l'environnement cordova en utilisant LaunchCordova.bat du cours.
Se placer respectivement dans les dossiers client et serveur.

### Serveur Setup
`npm install`
`node Server.js`
Le serveur est écoute.

### Client Setup
`npm install`
`cordova platform add broawser`
`cordova build browser`
`cordova run browser`
Vous pouvez remplacer browser par n'importe quelle platforme de votre choix (android...).

Votre client serveur doivent communiquer.
