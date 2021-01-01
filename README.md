# ProgMobile
Repo de la matière Programmation Mobile M2

## Clone & Setup
`git clone https://github.com/Gaalee/ProgMobile.git`

Ouvrir deux terminaux, client et serveur avec l'environnement cordova en utilisant LaunchCordova.bat du cours.
Se placer à la racine du clone.

### Serveur Setup
`cd Server`

`npm install`

`node Server.js`

### Client Setup
`cd Client`

`npm install`

`cordova platform add browser`

`cordova build browser`

`cordova run browser`

Vous pouvez remplacer browser par n'importe quelle platforme de votre choix (android...).

Votre client serveur sont en communication.
