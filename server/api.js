const express = require('express')
const router = express.Router()
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const assetsPath = path.join(__dirname, '../assets');
const customers = {};
const sampleCustomer = { id: 0, customerCode: 2, customerName: 'N', phone: '021', address: '', manager: {}, payment: {} };
const generateCustomer = id => Object.assign({}, sampleCustomer,
    { customerCode:id,customerName: `Title${id}`, id });

router.get('/customer', (req, res) => res.json({
    totalRows: 1000000, rows:
        Array.from({ length: req.query.rowCount || 10 }, (_, idx) => customers[+req.query.startFrom + idx + 1] || generateCustomer(+req.query.startFrom + idx + 1))
}
));
router.get('/customer/:id',
    (req, res) => res.json(customers[req.params.id] || generateCustomer(req.params.id)));
router.put('/customer/:id', (req, res) => {
    customers[req.params.id] = req.body;
    res.json({ success: true })
});
router.post('/customer', (req, res) => (res.json({ success: true })));

router.post('/deploy/:name', bodyParser.text(),
    (req, res) => {
        const filePath = `${assetsPath}/domain/${req.params.name}.js`;
        console.log(filePath, req.body);
        fs.writeFile(filePath, req.body, 'utf-8', err => res.json(err || { success: true }));

    });
function getDomainModule(modPath) {

    let mod;
    try {
        mod = reload(path.join('./src/domain/', modPath));
    } catch (ex) {
        return { statusCode: 404, message: ex.message };
    }
    if (mod instanceof Object) {
        const orginValue = mod;
        mod = () => orginValue;
    }
    return mod;
}
function runDomainModule(modPath, body) {
    const mod = getDomainModule(modPath);
    return (mod instanceof Function) && mod(body);
}
const replyToServer = (req, res, result) => {
    if (result instanceof Promise)
        result.then(result => res.status(result.statusCode || 200).json(result));
    else
        res.status(result.statusCode || 200).json(result);
}
const nameIsInvalid = s => s.indexOf('.') > 0 || s.includes('_');

const httpMethodsForCRUD = {
    POST: 'create',
    GET: 'read',
    PUT: 'update',
    DELETE: 'delete'
}


router.all(['/:moduleName/:lastPart', '/:moduleName'], (req, res) => {
    const { moduleName, lastPart } = req.params;
    const suffix = httpMethodsForCRUD[req.method] || lastPart;
    const result = runDomainModule(path.join(moduleName, `${moduleName}-${suffix}`)) || {};
    replyToServer(req, res, result);
});



module.exports = router;