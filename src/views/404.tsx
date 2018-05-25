
import { routeTable } from "../organicUI";

import { View } from "../lib/view";
import * as React from "react";

export class NotFoundView extends React.Component<any, any> {

    render() {
        return <div className="card" dir="ltr" style={{ textAlign: "left" }}>
            <header className="card-header">
                <p className="card-header-title">
                    Not Found -  404
                </p>

            </header>
            <div className="card-content">
                <div className="content">
                    <div className="title is-2">
                        Oops,You want to below URL
                </div>
                    <div className="title is-5">
                        {location.pathname}
                    </div>
                    <small className="">{/*React.createElement('code',{}, ` please set View to routeTable
                            routeTable.set('${location.pathname}',View)` as any)*/}
                    </small>
                    <hr />
                    <ul className="items">
                        {Object.keys(routeTable.data).map(r => <li className="item">{r}</li>)}
                    </ul>
                </div>
            </div>

        </div>


    }
}