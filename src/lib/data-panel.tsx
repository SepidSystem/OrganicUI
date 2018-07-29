import { BaseComponent } from "./base-component";
import { i18n, icon } from "./shared-vars";
import { Utils } from "./utils";
import { Panel } from "./ui-elements";

interface IDataPanelProps {
    header: any;
    primary?: boolean;
    editable?: boolean;
    className?: string;
}
interface IDataPanelState {
    readonly?: boolean;

}

export class DataPanel extends BaseComponent<IDataPanelProps, IDataPanelState>{
    root: HTMLElement;

    componentDidMount() {
        const p = this.props;
        Object.assign(this.state, { editable: p.editable === undefined ? (!p.primary) : p.editable });

    }
    handledActions = {
        edit: () => {
            OrganicUI.Utils.makeWritable(this.root);
            this.repatch({ readonly: false });
        },
        'done-edit': () => {
            OrganicUI.Utils.makeReadonly(this.root);
            this.repatch({ readonly: true });
        }
    }
    render(p: IDataPanelProps = this.props) {
        const s: IDataPanelState = this.state;
        const header = [i18n(p.header),
        <span key="lock-toggle" style={{ "visibility": s.readonly ? 'visible' : 'hidden' }}>
            {icon('lock')}</span>];


        return <div className={Utils.classNames("data-panel ", p.className, p.primary && 'primary-data-panel', s.readonly ? 'readonly' : 'editable')}>

            {React.createElement(Panel, Object.assign({}, p, { header }))}
        </div>;
    }
    defaultProps = {
        dataListHeight: 200
    }
}

