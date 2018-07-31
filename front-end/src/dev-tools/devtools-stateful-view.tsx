import { Utils, JsonInspector } from "@organic-ui";

OrganicUI.devTools.set('StatefulView|Show Repatch', target => {     
    target.devElement = <OrganicUI.JsonInspector data={target.state} />;
    target.forceUpdate();
});
