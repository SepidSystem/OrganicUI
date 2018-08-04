import { Utils, JsonInspector } from "@organic-ui";

OrganicUI.devTools.set('ChainView|Show State', target => {     
    target.devElement = <OrganicUI.JsonInspector data={target.state} />;
    target.forceUpdate();
});
