const path = require('path');
const serverConfig = require('./config')
const shelljs = require('shelljs');
const fs = require('fs');


const checkFileExists = s => new Promise(r => fs.access(s, fs.F_OK, e => r(!e)))
const fileExists = filePath => {
    const filePathArray = filePath instanceof Array ? filePath : [filePath];
    try {
        for (const fileName of filePathArray) {
            const r = fs.statSync(fileName);
            if (!r.size) return false;
        }
        return true;
    }
    catch(exc){
        console.log(exc);
        return false;
    }
}
const child = shelljs.exec('npm run build:watch', { async: true });
child.stdout.on('data', data => {
    if ((data || '').includes('size'))
        setTimeout(() => notifyToAllUserForFileChanging('reloadAllTargetedItems'), 1000);
    console.log(data);
});
if (fileExists(path.join(process.cwd(), './src/styles/all.scss'))) {
    shelljs.exec('npm run build:sass', { async: true });
    const child2 = shelljs.exec('npm run build:sass:watch', { async: true });
    child2.stdout.on('data', console.log);
}
const express = require('express');
const server = express();
require('express-ws')(server);
server.use('/view', (req, res) => res.sendFile(path.join(process.cwd(), 'assets/single-page-app.html')));
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
    if (!result) return;
    const sourceDir = path.join(process.cwd(), 'src');
    const recursiveWatch = require('recursive-watch');

    recursiveWatch(sourceDir, files => notifyToAllUserForFileChanging('serverChanged'));
});