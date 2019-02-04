
import * as OrganicUI from './organicUI'
import {createElement as h} from 'react';
Object.assign(window, { OrganicUI });
const FabricConfig = {
    fontBaseUrl: `http://${location.host}/assets/fonts/`
};
Object.assign(window, { h});
Object.assign(window, { FabricConfig });

OrganicUI.reinvent['prefix']='frontend';