
const shelljs =require(  'shelljs');
const child = shelljs.exec('npm run build:watch', { async: true });
child.stdout.on('data',console.log);
const child2 = shelljs.exec('npm run build:sass:watch', { async: true });
child2.stdout.on('data',console.log);
const jsonServer = require('json-server');
const path = require('path');
const express = require('express');
 
//const reload = require('require-reload')(require);
const server = express();
var expressWs = require('express-ws')(server);

const bodyParser = require('body-parser');
require('./sql');

server.use('/api', bodyParser.json(), require('./api'));
server.use('/view', (req, res) => res.sendFile(path.join(__dirname, '../assets/single-page-app.html')));
const assetsPath = path.join(__dirname, '../assets');
server.use('/assets/domain', express.static(path.join(__dirname, '..', 'assets', 'domain')));
server.use('/assets', express.static(assetsPath));
server.get('/', (req, res) => res.redirect('/view/dashboard'));
const allWebSockets = [];
const notifyToAllUserForFileChanging = () => console.warn('notifyToAllUserForFileChanging');
server.ws('/watch', function (ws, req) {
    ws.on('message', function (msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});
server.listen(3000);
const sourceDir = path.join(process.cwd(), 'src');
const DirectoryWatcher = require('directory-watcher');
DirectoryWatcher.create(sourceDir, function (err, watcher) {
    /* watcher.on('change', notifyToAllUserForFileChanging);
     watcher.on('delete', notifyToAllUserForFileChanging);
     watcher.on('add', notifyToAllUserForFileChanging);*/
    watcher.once('change', function (files) {
        console.log('will fire once');
    });

    watcher.on('delete', function (files) {
        console.log('%s deleted', files);
    });

    watcher.on('add', function (files) {
        console.log('%s added', files);
    });
});
