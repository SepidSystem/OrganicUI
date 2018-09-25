/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from '../core/shared-vars';

import { Icon, Paper, Button } from '../controls/inspired-components';
import { reinvent } from '../reinvent/reinvent';
import { BaseComponent } from '../core/base-component';
 
export class Blank extends BaseComponent<any, never>{
    handleNavigate() {

    }
    renderContent() {

        const { options } = this.props;
        return <section className=" single-view  " ref="root">
            {options && options.title && <h1 className="animated fadeInUp  title is-3 columns" style={{ margin: '0', fontSize: '2.57rem' }}>
                <div className="column  " style={{ flex: '10' }}>
                    {i18n(options.title)}
                </div>
                <div className="column" style={{ minWidth: '140px', maxWidth: '140px', paddingLeft: '0', paddingRight: '0', direction: 'rtl' }}>
                    <Button variant="raised" fullWidth className="singleview-back-btn button-icon-ux" onClick={this.handleNavigate}   >
                        {i18n('back')}
                        <Icon iconName="Back" />
                    </Button >
                </div>
            </h1>}
            <Paper className="main-content">
                {this.props.children}

            </Paper>

        </section>
    }

}
Object.assign(reinvent.templates, { blank: Blank });
