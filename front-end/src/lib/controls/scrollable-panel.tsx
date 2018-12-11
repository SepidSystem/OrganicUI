import { BaseComponent } from "../core/base-component";
import { Utils } from "../core/utils";
interface IState {
    accualHeight: number;
}
export class ScrollablePanel extends BaseComponent<OrganicUi.ScrollablePanelProps, IState>{
    refs: {
        content: HTMLElement;
        scroller: HTMLElement;
    }
    scrollTimeout: any;
    contentTop: number;
    syncScroll(e: React.MouseEvent<HTMLElement>) {
        if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.scrollTimeout = null;
            const { content, scroller } = this.refs;
            const contentTop = -scroller.scrollTop;
            this.contentTop = contentTop;
            content.style.top = contentTop + 'px';
            const { onSyncScroll } = this.props;
            onSyncScroll instanceof Function &&
                onSyncScroll(e);

        }, 10); 
    }

    renderContent() {
        const minHeight = this.props.onGetHeight instanceof Function ?
            this.props.onGetHeight() :
            this.evalFromRef('content', c => c.querySelector('section').clientHeight);
        const p = this.props;
        return <div {...p} className={Utils.classNames(p.className, "scrollable-panel")} ref="root" style={{ ...(p.style || {}), display: 'flex' }}>
            <div className="scrollBar" ref="scroller" style={{ width: 7, overflowY: 'auto', marginRight: 5 }} onScroll={this.syncScroll.bind(this)}>
                <div style={{ minHeight, minWidth: 2 }}></div>
            </div>
            <section className={this.props.contentClassName} style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
                <div ref="content" style={{ width: '100%', position: 'absolute', top: this.contentTop + 'px' }}  >
                    <section style={{ minHeight: '100%' }}>
                        {this.props.children}
                    </section>
                </div>
            </section>
        </div>
    }
}