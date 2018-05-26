import { IStateListener,StateListener } from "./state-listener";

export class BaseComponent<P, S> extends React.Component<P, S>{
    base: any;
    linkState: any;
    state: S;
    refs: any;
    stateListener: IStateListener[];
    constructor(props: P) {
        super(props);
        this.repatch = this.repatch.bind(this);
        this.state = {} as any;
        this.stateListener = React.Children.toArray(this.props.children || [])
            .filter((r: React.ReactElement<any>) => r.type == StateListener)
            .map(child => (child as any).props);


    }
    componentDidMount() {
        const { root } = this.refs;
        root && Object.assign(root, { vdom: this, componentRef: this });

    }
    repatch(delta: Partial<S>, target?) {
        target = target || this.state;
        Object.assign(target, delta);
        const keys = Object.keys(delta);
        for (var key in keys) {
            const matchedStateListeners = this.stateListener.filter(sl => sl.target == key);
            matchedStateListeners.forEach(sl => sl.onChange(delta[sl.target]));
        }
        this.forceUpdate();
    }

}