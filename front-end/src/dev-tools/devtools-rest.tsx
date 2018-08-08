/// <reference path="../dts/globals.d.ts" />

import { Utils, AdvButton, AppUtils, BaseComponent, SingleViewBox, ListViewBox, FormControlLabel, Checkbox, Tabs, Tab } from "@organic-ui";



function restMonitor({ method, url, data, result }) {
    console.groupCollapsed(`Monitor ${method} ${url}`);
    !!data && console.log('REQUEST BODY >>>>', data);
    console.dir(result);
    console.groupEnd();
    return result;
}
interface IRestInspectorProps {
    method, url, data, result, resolve, error, options, mode?;
    showResponse: boolean;
    onProceed: Function;
};
class RestInspector extends BaseComponent<IRestInspectorProps, IRestInspectorProps>{
    static showResponse: boolean;
    componentWillMount() {
        Object.assign(this.state, this.props);
        this.state.showResponse = RestInspector.showResponse;

    }
    repatch(delta) {
        super.repatch(delta);
        if ('showResponse' in delta)
            RestInspector.showResponse = delta.showResponse;
    }
    handleChange(event, mode) {
        this.repatch({ mode });
    }
    renderColumns() {
        const baseURL = localStorage.getItem('baseURL');
        const { error } = this.state;

        const { message, response } = error || {} as any;
        if (this.props.mode == 2 && !response)
            return null;

        return <div className="columns">
            <FormControlLabel
                className="column  " style={{ visibility: this.props.mode == 2 ? 'hidden' : 'visible', flex: '1', padding: 0 }}
                control={
                    <Checkbox
                        defaultChecked={this.state.showResponse}
                        onChange={event => this.repatch({ showResponse: event.target.checked })}

                    />
                }
                label="Show Response"
            />
            <div className="key-value column " dir='ltr' style={{ display: 'flex', flex: '2', direction: 'ltr', alignItems: 'center' }}>

                {this.props.mode != 2 && <span style={{ margin: '0px 8px' }}>
                    <input type="text" spellCheck={false}
                        onClick={e => (e.target as any).select()}
                        value={baseURL} style={{ border: 'none', outline: 'none', margin: '3px' }} />
                </span>}

                
                {this.props.mode == 2 && response && <div style={{ margin: '0px 8px' }} >
                    <b>Response Status : </b>{response.status}{' '}{response.statusText}
                </div>}
            </div>
        </div>
    }
    render() {
        const { error, method, url, mode, options, resolve } = this.state;
        const opts = options instanceof Function ? options() : options;
        const data = (mode == 0 && this.state.data) ||
            (mode == 1 && opts.headers) ||
            (mode == 2 && (error || this.state.result || this.props.data));


        return <section dir='ltr' style={{ direction: 'ltr' }} className={Utils.classNames("rest-confrim", error && 'server-side-error')}>
            {!error && this.props.mode != 2 && <div className="title is-4">
                <i className="fa fa-cloud-upload"></i>
                <span>
                    Request to Server
                </span>
            </div>}
            {!error && this.props.mode == 2 && <div className="title is-4">
                <i className="fa fa-cloud-download"></i>
                <span>
                    Server Response
                </span></div>}
            {!!error && <div className="title is-4">
                <i className="fa fa-exclamation-triangle"></i>
                <span>
                    Server Side Error
                </span></div>}
            <div className={`columns http-method ${(method || '').toLowerCase()}`} style={{ width: '100%' }}>
                <div className="column" style={{ maxWidth: '80px', minWidth: '80px' }} >
                    <span className="verb">
                        {method}
                    </span>
                </div>

                <div className="column" style={{ paddingLeft: '30px' }} >
                    <input type="text" spellCheck={false}
                        onClick={e => (e.target as any).select()}
                        value={url} style={{ border: 'none', outline: 'none', margin: '3px', minWidth: '200px', width: '100%' }} />
                </div>

            </div>
            <hr />
            {this.renderColumns()}
            {!!error && <hr />}


            <Tabs
                value={this.state.mode}
                indicatorColor="primary"
                textColor="primary"
                onChange={this.handleChange.bind(this)}
            >
                <Tab label="Request Body" disabled={!this.props.data} />
                <Tab label="Headers" />
                {this.props.mode == 2 && <Tab label="Response" />}

            </Tabs>
            <main style={{ marginTop: '3px', minHeight: '320px', maxHeight: '320px' }}>


                {<OrganicUI.JsonInspector isExpanded={() => true} data={data} />}
            </main>
            <footer>
                <div className="secondary-actions">
                    <AdvButton variant="flat" color="default"
                        onClick={() => {
                            const { instances } = OrganicUI.createClientForREST as any;
                            if (instances instanceof Array) instances.forEach(target => {
                                target['confrim'] = null;
                                target['failLogger'] = null;

                            });
                            localStorage.removeItem('REST-Inspection');
                            alert('Monitoring  is disabled');
                        }}
                    >Disable Inspector</AdvButton>


                </div>
                <div className="primary-actions">
                    <AdvButton variant="raised" color="primary" fullWidth
                        onClick={() => {
                            OrganicUI.AppUtils.showDialog(null);
                            if (this.props.onProceed instanceof Function)
                                return this.props.onProceed();
                            setTimeout(() => this.props.resolve(!!this.state.showResponse), 10);
                        }}
                    >
                        <span className="animated tada">
                            Proceed
                </span></AdvButton>
                </div>
            </footer>
        </section>
    }
}
function restInspector(p) {
    return new Promise(resolve => OrganicUI.AppUtils.showDialog(React.createElement(RestInspector,
        Object.assign({ resolve }, p))));
}
OrganicUI.devTools.set('REST|Set Base URL', target => {
    let { options } = target as any;
    options = options instanceof Function ? options() : options;
    const baseURL = prompt('baseURL',options.baseURL || '');
     
    baseURL &&  options.setBaseURL( baseURL);

});
OrganicUI.devTools.set('REST|Enable/Disable Inspector', target => {
    const isEnabled = target['confrim'] == restInspector;
    target['confrim'] = isEnabled ? null : restInspector;
    target['failLogger'] = isEnabled ? null : restInspector;


    if (!isEnabled) localStorage.setItem('REST-Inspection', '1');
    else localStorage.removeItem('REST-Inspection');
    OrganicUI.AppUtils.afterREST = isEnabled ? null : restMonitor;
    isEnabled && alert('it is disabled');
    !isEnabled && alert('✔✔✔   Inspector was disabled , it is enable  ✔✔✔');

});
const hasClient = OrganicUI.createClientForREST['instances'] instanceof Array && OrganicUI.createClientForREST['instances'].length;
setTimeout(function () {

    if (localStorage.getItem('REST-Inspection') == '1') {
        const { instances } = OrganicUI.createClientForREST as any;
        if (instances instanceof Array) instances.forEach(target => {
            target['confrim'] = restInspector
            target['failLogger'] = restInspector;

        });
    }
}, hasClient ? 2 : 1000);
const fetchFail = p => React.createElement(RestInspector, Object.assign({}, p, { mode: 2 }));
Object.assign(SingleViewBox, { fetchFail });
Object.assign(ListViewBox, { fetchFail });