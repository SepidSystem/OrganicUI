import { Utils, JsonInspector } from "@organic-ui";

OrganicUI.devTools.set('Reinvent|Show State', target => {     
    target.devElement = <OrganicUI.JsonInspector data={target.state} />;
    target.forceUpdate();
});
