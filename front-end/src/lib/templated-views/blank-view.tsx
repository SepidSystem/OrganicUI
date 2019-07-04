/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from '../core/shared-vars';

import { Icon, Paper, Button } from '../controls/inspired-components';
import { reinvent } from '../reinvent/reinvent';
import { BaseComponent } from '../core/base-component';
import Svg from '../controls/svg';
import * as ArrowLeftSvg from './arrow-left.svg'
export class Blank extends BaseComponent<any, never>{
    handleNavigate() {
        const { options } = this.props;
         if (options.onBackButtonClick instanceof Function)
            options.onBackButtonClick()
    }
    renderContent() {

        const { options } = this.props;
        return <section className=" single-view  " ref="root">
            {options && options.title && <h1 className="animated fadeInUp  title is-3 columns" style={{ margin: '0', fontSize: '2.57rem' }}>
                <div className="column  " style={{ flex: '10' }}>
                    {i18n(options.title)}
                </div>
                <div className="column" style={{ minWidth: '140px', maxWidth: '140px', paddingLeft: '0', paddingRight: '0', direction: 'rtl' }}>
                    <Button variant="raised" fullWidth className="singleview-back-btn button-icon-ux" onClick={this.handleNavigate.bind(this)}   >
                        {i18n('back')}
                        <Svg image={ArrowLeftSvg} width={32} height={32} />
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
