const { argv } = require('yargs'), fs = require('fs');
const changeCase = require('change-case-object');
const prettyCase = s => s.substr(0, 1).toUpperCase() + s.substr(1);
const getPath={

}
const codeTemplates = {
    crud_create: entiyId => `
    
    `, 
    crud_read: entityId => `
    
    `, 
    crud_update: entityId => `
    
    `, 
    crud_delete: entityId => `
    
    `,
    'data-access':tableName=>`
SELECT * FROM  ${tableName}
WHERE (1=1)`,
    view: (viewId) => (
        `/// <reference path="../dts/globals.d.ts" />   
module ${prettyCase(viewId)}View {
    const { BaseView, ActionManager, routeTable, i18n, icon, showIconAndText, showIconText,funcAsViewClass } = OrganicUI;
    const { Card, Panel,SearchInput } = OrganicUI.Controls;
    class ActionManager extends ActionManager {
        // ActionManager with OOP Appoarch
    }
    // childViews for easier maintenace
    const childViews={

    };
    const view:FuncView<any,ActionManager>=(p,s,repatch,actions,childViews)=>{
        return  <div className="temp">
        Code here with FP Appoarch
    </div>;

    }
    const View=funcAsViewClass(view,ActionManager);
    routeTable.set('/view/${viewId}', View);
    routeTable.set('/view/${viewId}/:name', View);     
}`
    )
};
const viewId = argv.view;
if (viewId) {
    const contents = codeTemplates.view(viewId);
    const filePath = `./src/views/${viewId}-view.tsx`;
    fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
    console.log(filePath + ' created');
}