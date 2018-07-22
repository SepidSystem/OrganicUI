const path = require('path');

const shelljs = require('shelljs');
const fs = require('fs');
let { argv } = require('yargs');

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
    catch (exc) {
        return false;
    }
}
const serverConfig = fileExists('./server-config.json') ? require(path.join(process.cwd(), 'server-config')) : require('./config');
process.argv = process.argv.filter(arg => !arg.includes(path.sep))
process.argv.some(arg => arg == 'production') && Object.assign(argv, { buildMode: 'production' });
if (!argv.action && process.argv[0] && !process.argv[0].startsWith('-'))
    argv.action = process.argv[0];
argv = Object.assign({ action: 'dev-server', buildMode: 'development', port: serverConfig.port || 3000 }, argv);
let allWebSockets = [];
const notifyToAllUserForFileChanging = msg => allWebSockets.forEach(ws => ws.readyState == 1 && ws.send(JSON.stringify(msg)));

let allWebSocketsChangeCounter = 0;

if (argv.action == 'build' || argv.action == 'dev-server') {
    const webpackCommand = [path.join(__dirname, '../node_modules/.bin/webpack')
        , `--mode ${argv.buildMode}`, ``
        , argv.buildMode == 'development' && '--watch',
        , `--config`, path.join(__dirname, `/../config/webpack.js`)].filter(x => !!x);
    shelljs.env['sourceDir'] = process.cwd();
    const child = shelljs.exec(webpackCommand.join(' '), { async: true });

    child.stdout.on('data', data => {
        if ((data || '').includes('size'))
            setTimeout(() => notifyToAllUserForFileChanging('reloadAllTargetedItems'), 1000);
        console.log(data);
    });

    if (fileExists(path.join(process.cwd(), './src/styles/all.scss'))) {
        shelljs.exec('npm run build:sass', { async: true });
        if (argv.buildMode == 'development') {
            const child2 = shelljs.exec('npm run build:sass:watch', { async: true });
            child2.stdout.on('data', console.log);
        }
    }
}
if (argv.action.includes('server')) {
    const express = require('express');
    const server = express();
    require('express-ws')(server);
    server.use('/view', (req, res) => res.sendFile(path.join(__dirname, '../assets/single-page-app.html')));
    const assetsPath = path.join(__dirname, '../assets');
    const assetsPath2 = path.join(process.cwd(), 'assets');
    server.use('/assets/bundle/domain', express.static(path.join(process.cwd(), 'dist')));
    server.use('/assets', express.static(assetsPath), express.static(assetsPath2));
    server.get('/', (req, res) => res.redirect('/view/dashboard'));

    server.ws('/watch', function (ws, req) {
        if (allWebSocketsChangeCounter++ > 1000) {
            allWebSocketsChangeCounter = 0;
            allSockets = allWebSockets.filter(ws => ws.readyState == 1);
        }
        allWebSockets.push(ws);
    });
    const port = argv.port || serverConfig.port;
    server.listen(port, () => console.log(`listening on port ${port}`));


    if (argv.buildMode == 'development') {
        const sourceDir = path.join(process.cwd(), 'src');
        const recursiveWatch = require('recursive-watch');

        recursiveWatch(sourceDir, files => notifyToAllUserForFileChanging('serverChanged'));
    }

}