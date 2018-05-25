/// <reference path="../organicUI.d.ts" />   
import { tags } from "../platform";
declare const React:any;
const { View, ActionManager, routeTable, i18n, icon, showIconAndText, showIconText, funcAsViewClass } = OrganicUI;
 
class API extends ActionManager {
   
}
const childViews = {

};
const view: FuncView<any, API> = (p, s, repatch, api) => {
    return <div className="container">
        {Object.keys(tags.data).map(key => (
            <div className="">
                <div className="m5"  >
                    <div className="tags">
                        <div className="tag is-large">sdfsdf</div>
                        <div className="tag is-large">sdfsdf</div>
                        <div className="tag is-large">sdfsdf</div>
                        <div className="tag is-large">sdfsdf</div>
                        <div className="tag" style={{ visibility: 'hidden' }}></div>
                    </div>
                </div><hr /></div>
        ))}


    </div>;

}
const SettingView = funcAsViewClass(view, API, childViews);
 routeTable.set('/view/tag', View);
routeTable.set('/view/tag/:name', View);
 