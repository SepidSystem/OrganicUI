export { PureComponent, Component, createElement, cloneElement } from 'react';
import { assignVendors } from './imported-vendors';
assignVendors();

//----- Core Lib 
export { NotFoundView } from './lib/core/404';
export { openRegistry } from './lib/core/registry';
export { editorByAccessor, i18n, icon, menuBar, i18nAttr } from './lib/core/shared-vars';
export { listViews, tags, reports, acl, dashboardBlocks } from './lib/core/shared-vars';
export { funcAsComponentClass, FuncComponent } from './lib/core/functional-component';
export { BaseComponent, CriticalContent } from './lib/core/base-component';
export { route, routeTable } from './lib/core/router';
export { Utils, changeCase } from './lib/core/utils';
export { /*remoteApiProxy, remoteApi, refetch,*/ createClientForREST } from './lib/core/rest-api';
export { Anchor } from './lib/core/anchor';
export { IStateListener, StateListener } from './lib/core/state-listener';
export { mountViewToRoot, renderViewToComplete, startApp, setAfterLoadCallback, appData, scanAllPermission } from './lib/core/bootstrapper';
export { AppUtils } from './lib/core/app-utils';
export { SubRender, Action, Helper } from './lib/core/decorators';
export { AdvButton, DropDownButton, Panel, Placeholder, SearchInput } from './lib/core/ui-elements';
export { Spinner } from './lib/core/spinner';
export { ComboBox } from './lib/core/combo-box'
export { Menu } from './lib/core/models';
export { loadDevScript } from './lib/core/load-dev-script';
export { moduleManager } from './lib/core/module-manager';
export { devTools, JsonInspector, DeveloperBar, isProdMode } from './lib/core/developer-features';

//----- Import Data Lib ** Advanced Level
export { Field } from './lib/data/field';
export { default as SimpleTable } from './lib/data/simple-table';
export { DataList } from './lib/data/data-list';
export { DataForm } from './lib/data/data-form';
export { DataPanel } from './lib/data/data-panel';
export { DataListPanel } from './lib/data/data-list-panel';
export { FilterPanel } from './lib/data/filter-panel';
export { ArrayDataView } from './lib/data/array-data-view';
// DataLookup  ** Medium Level
export { DataLookup } from './lib/data-lookup/data-lookup';
import './lib/data-lookup/data-lookup-action';
export { DatePicker } from './lib/data-lookup/date-picker';
export { DataTreeList } from './lib/data/data-tree-list';
//----- Import Box Lib ** Advanced Level
export { default as OrganicBox } from './lib/box/organic-box';
export { SingleViewBox } from './lib/box/single-view-box';
export { ViewBox } from './lib/box/view-box';
export { DashboardBox } from './lib/box/dashboard-box';
export { ReportViewBox } from './lib/box/report-view-box';
export { ListViewBox } from './lib/box/list-view-box';
import './lib/box/login-view';
import './lib/box/blank-view';
//----- Import Reinvent  
export { reinvent } from './lib/reinvent/reinvent';
import './lib/reinvent/reinvent';
import './lib/reinvent/base-frontend-reinvent';
import './lib/reinvent/crud-frontend-reinvent';
import './lib/reinvent/dashboard-reinvent';

export { default as Collapsible } from 'react-collapsible';
// Controls ** Beginnner Level
export { SnackBar } from './lib/controls/snack-bar';
export { TimeSlot } from './lib/controls/time-slot';
export { default as Version } from './version';
export { UiKit } from './ui-kit/ui-kit';
export { default as C3Chart } from 'react-c3js';
export { TreeList } from './lib/controls/tree-list';
export { TextField, Checkbox, Select, Button, RadioGroup, FormControlLabel, Callout, DefaultButton, DetailsList, Icon, MessageBar, IconButton, SnackbarContent, Tab, Tabs, Fabric, Paper, Radio, Switch } from './lib/controls/inspired-components';
export { GridList, GridListTile } from './lib/controls/inspired-components';
export { Headline } from './lib/controls/head-line';
export let currentView: any
export { MenuIcon, ExpandMoreIcon } from './lib/controls/icons';
import * as  _Icons from './lib/controls/icons';
export const Icons = _Icons;


// Others 
import "./customization-material";
export { default as JssProvider } from 'react-jss/lib/JssProvider';
export { createGenerateClassName } from '@material-ui/core/styles';

