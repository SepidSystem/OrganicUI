
const jsonServer = require('json-server');
const path = require('path');
const express = require('express');
//const reload = require('require-reload')(require);
const server = express();
const bodyParser = require('body-parser');
require('./sql');

server.use('/api', bodyParser.json(), require('./api'));
server.use('/view', (req, res) => res.sendFile(path.join(__dirname, '../assets/single-page-app.html')));
const assetsPath = path.join(__dirname, '../assets');
server.use('/assets/ext-react', express.static(path.join(__dirname, '..', 'ext','build')));

server.use('/assets/domain', express.static(path.join(__dirname, '..', 'assets', 'domain')));
server.use('/assets', express.static(assetsPath));
server.get('/', (req, res) => res.redirect('/view/dashboard'));
server.listen(3000);

