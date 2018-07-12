const path = require('path');
const serverConfig = require('./config')
const shelljs = require('shelljs');
const fs = require('fs');


const checkFileExists = s => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))
checkFileExists(path.join(__dirname, '../src/domain/domain.tsx')).then(result => {
    if (!result) return;
    const child = shelljs.exec('npm run build:watch', { async: true });
    child.stdout.on('data', data => {
        if ((data || '').includes('size'))
            setTimeout(() => notifyToAllUserForFileChanging('reloadAllTargetedItems'), 1000);
        console.log(data);
    });
    shelljs.exec('npm run build:sass', { async: true });
    const child2 = shelljs.exec('npm run build:sass:watch', { async: true });
    child2.stdout.on('data', console.log);
});
const express = require('express');

const jsonServer = require('json-server');
const router = jsonServer.router('database.json');
const server = express();
var expressWs = require('express-ws')(server);

const bodyParser = require('body-parser');

server.use('/api', bodyParser.json(), router)

server.use('/view', (req, res) => res.sendFile(path.join(__dirname, '../assets/single-page-app.html')));
const assetsPath = path.join(__dirname, '../assets');
server.use('/assets/domain', express.static(path.join(__dirname, '..', 'assets', 'domain')));
server.use('/assets', express.static(assetsPath));
server.get('/', (req, res) => res.redirect('/view/dashboard'));
let allWebSockets = [];
const notifyToAllUserForFileChanging = msg => {

    allWebSockets.forEach(ws => {
        ws.readyState == 1 && ws.send(JSON.stringify(msg));
    }
    );
}
let allWebSocketsChangeCounter = 0;
server.ws('/watch', function (ws, req) {
    if (allWebSocketsChangeCounter++ > 1000) {
        allWebSocketsChangeCounter = 0;
        allWebSockets = allWebSockets.filter(ws => ws.readyState == 1);
    }
    allWebSockets.push(ws);
});
server.listen(serverConfig.port, () => console.log(`listening on port ${serverConfig.port}`));
checkFileExists(path.join(__dirname, '../src/domain/domain.tsx')).then(result => {
    if(!result) return;
    const sourceDir = path.join(process.cwd(), 'src');
    const recursiveWatch = require('recursive-watch');

    recursiveWatch(sourceDir, files => notifyToAllUserForFileChanging('serverChanged'));
});