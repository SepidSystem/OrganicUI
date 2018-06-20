const recursiveWatch = require('recursive-watch');
const shelljs = require('shelljs');
const fse = require('fs-extra');
const child = shelljs.exec('npm run build:watch', { async: true });
child.stdout.on('data', data => {
    if ((data || '').includes('size'))
        setTimeout(() => notifyToAllUserForFileChanging('reloadAllTargetedItems'), 1000);
    console.log(data);
});
shelljs.exec('npm run build:sass', { async: true });
const child2 = shelljs.exec('npm run build:sass:watch', { async: true });
child2.stdout.on('data', console.log);
const jsonServer = require('json-server');
const path = require('path');
const express = require('express');

const router = jsonServer.router('database.json');
//const reload = require('require-reload')(require);
const server = express();
var expressWs = require('express-ws')(server);

const bodyParser = require('body-parser');
require('./sql');
server.use('/api', bodyParser.json(), router)
//server.use('/api', bodyParser.json(), require('./api'));
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
server.listen(3000);
const sourceDir = path.join(process.cwd(), 'src');
recursiveWatch(sourceDir, files => notifyToAllUserForFileChanging('serverChanged')); 