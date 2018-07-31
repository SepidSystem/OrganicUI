/// <reference path="./organic-ui.d.ts" />
import * as OrganicUIMod from '@organic-ui';
import * as  ReactMod from 'react';
import * as  ReactDomMod from 'react-dom';
import * as LRU_mod from 'lru-cache';
import { AxiosRequestConfig } from 'axios';
declare global {
  export type FuncComponent<P, S> = (p: P, s: S, repatch: (delta, target?) => void) => React.ReactNode;
  export type PureView<TState, TAPI> =
    (state: TState, api?: TAPI, discover?, repatch?: (delta, target?) => void) => React.ReactNode;
  export const React: typeof ReactMod;
  export const ReactDOM: typeof ReactDomMod;
  export const OrganicUI: typeof OrganicUIMod;
  export const LRU: any;
  export const BUILD_DATE:string;
  export const BUILD_NUMBER:string;
}
