import * as OrganicUIMod from '../organicUI';
import * as Components from "bloomer";

import * as UiKit from '../lib/ui-kit';
import * as  FabricUiMod from 'office-ui-fabric-react';
import * as  MaterialUiMod from '@material-ui/core';

import * as  ReactMod from 'react';
import * as  ReactDomMod from 'react-dom';
import * as LRU_mod from 'lru-cache';
import { AxiosRequestConfig } from 'axios';
 
declare global {
   
   export type FuncComponent<P, S> = (p: P, s: S, repatch: (delta, target?) => void) => React.ReactNode;
   
  
  export type PureView<TState, TAPI> =
    (state: TState, api?: TAPI, discover?, repatch?: (delta, target?) => void) => React.ReactNode;

  export const FabricUI: typeof FabricUiMod;
  export const MaterialUI: typeof MaterialUiMod;
  export const React: typeof ReactMod;
  export const ReactDOM: typeof ReactDomMod;
  export const OrganicUI: typeof OrganicUIMod;
  export const LRU: any;


  
}


