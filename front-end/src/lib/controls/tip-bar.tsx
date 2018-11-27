import { BaseComponent } from "../core/base-component";
import { Utils } from "../core/utils";
import { Button } from "./inspired-components";
import { SelfBind } from "../core/decorators";

export class TipsBar extends BaseComponent<OrganicUi.ITipsProps, IState> {
    @SelfBind()
    handleNavigate(movement: number, e: React.MouseEvent<HTMLElement>) {
        e && e.preventDefault();
        const { tips } = this.props;
        this.repatch({ activeTipIndex: Utils.indicateNum(this.state.activeTipIndex, movement, tips.length) });
    }
    renderContent() {
        const { tips, defaultActiveTipIndex } = this.props;
        if (!tips || tips.length == 0) return  <i style={{display:'none'}} />;
        this.defaultState({ activeTipIndex: defaultActiveTipIndex || 0 });
        const { activeTipIndex } = this.state;
        return <section style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
                {tips[activeTipIndex]}
            </div>
            <span style={this.getStyleForButtonPlace(60)} >
                <Button onClick={this.handleNavigate.bind(this, -1)}> {Utils.showIcon('fa-chevron-right')} </Button>
            </span>
            <span style={this.getStyleForButtonPlace(60)} >
                <Button onClick={this.handleNavigate.bind(this, +1)}> {Utils.showIcon('fa-chevron-left')} </Button>
            </span>


        </section>
    }
    getStyleForButtonPlace(width: number): Partial<React.CSSProperties> {
        return { minWidth: width, maxWidth: width, width };
    }
}
interface IState {
    activeTipIndex: number;
}