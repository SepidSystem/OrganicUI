import * as React from "react";
declare const h:any;
export function Tiles(p:any){ 
        let children=p.children instanceof Array ?  p.children : [p.children];
        children=children.filter(vdom=>vdom instanceof Object);
        return (<div className="tiles">
        {children.map(vdom=>(<div className="col-md-12 col-sm-4">{vdom}</div>))}
    </div>);
    }
