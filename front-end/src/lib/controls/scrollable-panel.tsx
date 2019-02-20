import { BaseComponent } from "../core/base-component";
import { Utils } from "../core/utils";
interface IState {
    accualHeight: number;
}
export class ScrollablePanel extends BaseComponent<OrganicUi.ScrollablePanelProps, IState>{
    refs: {
        content: HTMLElement;
        scrollerY: HTMLElement;
        scrollerX: HTMLElement;
        focusInput: HTMLElement;
        root: HTMLElement;
    }
    /**
     *
     */
    constructor(p) {
        super(p);

        this.noRetryCheckRef = true;

    }

    scrollTimeouts: Object = {};
    contentTop: number;
    avoidSync: boolean;
    disableAutoRepatch: boolean;
    componentDidMount() {
        super.componentDidMount();
        if (!this.disableAutoRepatch) {
            this.disableAutoRepatch = true;
            this.repatch({}, null, 200);
            setTimeout(() => this.refs.root && this.refs.root.classList.add('after-one-second'), 500);
        }
    }
    overWheelCount: number;
    handleWheel(e: React.WheelEvent<HTMLElement>) {

        const { scrollerY, scrollerX } = this.refs;
        const maxY = scrollerY && (scrollerY.scrollHeight - scrollerY.clientHeight);
        const maxX = scrollerX && (scrollerX.scrollWidth - scrollerX.clientWidth);
        const scrollTop = Utils.limitNumber((this.scrollY || 0) + Math.round(e.deltaY / 5), 0, maxY);
        let scrollLeft = Utils.limitNumber((this.scrollX || 0) + Math.round(e.deltaX / 5)
            , 0, maxX);

        if ((e.deltaY < 0 && scrollTop > 0) ||
            (e.deltaY > 0 && scrollTop < maxY) || e.deltaX) {
            this.overWheelCount = 0;
            e.stopPropagation();
            e.preventDefault();
        }
        else {
            if (this.overWheelCount++ < 5) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
        this.doScroll(scrollTop, scrollLeft, null);
        scrollerY && (scrollerY.scrollTop = scrollTop);

    }
    scrollY: number;
    scrollX: number;

    doScroll(y, x, target) {
        const { content, scrollerY } = this.refs;
        this.avoidSync = true;
        this.scrollY = y;
        if (this.scrollX != x)
            this.refs.content && (this.refs.content.style.marginRight = `-${x}px`);
        this.scrollX = x;
        if (this.props.avoidContentClip)
            content.style.top = `-${y}px`;
        else
            [content, scrollerY]
                .filter(c => target != c && c)
                .forEach(c => c.scrollTop = y);
        const { onSyncScroll } = this.props;
        onSyncScroll instanceof Function &&
            onSyncScroll({ y, x });
        this.avoidSync = false;
    }
    syncScrollY(e: React.MouseEvent<HTMLElement>) {
        const refAttr = e.currentTarget.getAttribute('data-ref');
        if (this.avoidSync) return;


        const target: HTMLElement = this.refs[refAttr];

        if (this.scrollTimeouts[refAttr]) clearTimeout(this.scrollTimeouts[refAttr]);
        this.scrollTimeouts[refAttr] = setTimeout(() => {
            this.scrollTimeouts[refAttr] = null;
            this.doScroll(target.scrollTop, this.scrollX, target);

        }, 10);
    }
    syncScrollX(e: React.MouseEvent<HTMLElement>) {
        if (this.avoidSync) return;
        const refAttr = e.currentTarget.getAttribute('data-ref');
        const target: HTMLElement = this.refs[refAttr];
        if (this.scrollTimeouts[refAttr]) clearTimeout(this.scrollTimeouts[refAttr]);
        this.scrollTimeouts[refAttr] = setTimeout(() => {
            this.scrollTimeouts[refAttr] = null;
            const x = target.scrollWidth - target.clientWidth - target.scrollLeft;
            this.doScroll(this.scrollY, x, target);
        }, 10);
    }
    setScrollY(y: number) {
        this.doScroll(y, this.scrollX, null);
    }
    showScrollBarY(minHeight) {
        const scrollHeight = this.props.onGetInnerHeight ?
            this.props.onGetInnerHeight()
            : (this.refs.root ? this.refs.root.clientHeight : 0);// this.evalFromRef('root', ele => ele.clientHeight);
        if (!scrollHeight) {
            this.repatch({}, null, 10);
            return;
        }
        return <div className="scrollBarY scrollBar" ref="scrollerY"
            style={{
                //                visibility: minHeight < scrollHeight ? 'hidden' : 'visible',
                height: scrollHeight, order: 0, marginRight: 5,
                display: minHeight < scrollHeight ? 'none' : null
            }}
            data-ref="scrollerY"
            data-scrollHeight={scrollHeight}
            data-minHeight={minHeight}
            onScroll={this.syncScrollY.bind(this)}>
            <div style={{ minHeight, minWidth: 2 }}></div>

        </div>
    }

    rootHeight: number;

    renderContent() {
        if (this.props.ignore)
            return <>{this.props.children}</>
        const { root } = this.refs;
        const minHeight = this.props.onGetHeight instanceof Function ?
            this.props.onGetHeight() :
            this.evalFromRef('content', c => c.querySelector('section').clientHeight);
        const rootWidth = root && root.clientWidth
        const minWidth = this.evalFromRef('root', c => c.querySelector('section').clientWidth);
        const accutalWidth = this.props.onGetWidth instanceof Function ? this.props.onGetWidth() : 0;
        const hasLoadingState = this.evalFromRef('root', r => r.querySelector('.loading-state'), true);
        if (hasLoadingState) {
            this.repatch({}, null, 100);
        }

        this.rootHeight = this.evalFromRef('root', root => Utils.getComputedHeight(root));


        const p = this.props;
        return <div {...p} className={Utils.classNames(p.className, this.props.reversed && 'scrollable-panel-reversed', "scrollable-panel")} ref="root"
            onWheel={this.handleWheel.bind(this)}
            style={{
                ...(p.style || {}),
                //visibility: (this.rootHeight || 0) > 20 ? null : 'hidden', display: 'flex'
            }}>
            {p.reversed && this.showScrollBarY(minHeight)}
            <section
                ref="content"
                data-ref="content"
                className={Utils.classNames(this.rootHeight && "hidden-scroll2", 'content-scroll', this.props.contentClassName)}
                onScroll={this.syncScrollY.bind(this)}
                style={{
                    flex: 1,
                    overflow: 'visible', minHeight: this.rootHeight,
                    position: p.avoidContentClip ? 'relative' : null
                }}>
                <div ref="content" style={{
                    width: '100%',
                    position: p.avoidContentClip ? 'relative' : null,
                    top: this.contentTop + 'px'
                }}  >
                    <section style={{ minHeight: '100%' }}>
                        {this.props.children}
                    </section>
                </div>
            </section>
            {!p.reversed && this.showScrollBarY(minHeight)}
            {this.props.onGetWidth && accutalWidth && <div className="scrollBar scrollBarX" ref="scrollerX"
                data-ref="scrollerX"
                style={{ display: (!accutalWidth || !minWidth || (Math.max(accutalWidth, rootWidth, minWidth) - Math.min(accutalWidth, rootWidth)) < 45) ? 'none' : undefined }}
                data-width={minWidth || 0}
                data-rootWidth={rootWidth}
                data-get-width={accutalWidth || 0}
                onScroll={this.syncScrollX.bind(this)}>
                <div style={{ minHeight: 2, minWidth:Math.max(accutalWidth, rootWidth, minWidth) }}></div>
            </div>}
        </div>
    }


}