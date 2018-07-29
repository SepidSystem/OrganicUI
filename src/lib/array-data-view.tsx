import { BaseComponent } from "./base-component";
import { Utils } from "./utils";

export class ArrayDataView<T> extends BaseComponent<OrganicUi.IArrayDataViewProps<T>, OrganicUi.IArrayDataViewProps<T>>{
    getValue(): T[] {
        return this.state.value;
    }
    doChange() {
        this.props.onChange instanceof Function &&
            this.props.onChange(this.state.value);
    }
    fireAppend() {
        this.state.value.push(this.getDefaultItem());
        this.repatch({});
        this.doChange();
    }
    fireRemove(idx, length = 1) {
        this.state.value.splice(idx, length);
        this.repatch({});
        this.doChange();
    }
    actions: { append: Function; remove: Function };

    componentWillMount() {
        this.actions = {
            append: this.fireAppend.bind(this),
            remove: this.fireRemove.bind(this)
            
        }
    }
    getDefaultItem() {
        const { defaultItem } = this.props;
        return defaultItem instanceof Function ? defaultItem() : defaultItem as T;

    }
    renderContent() {
        const contentFunc: OrganicUi.IContentFunction<T, any> = this.props.children;
        this.state.value = this.state.value || Utils.clone(this.props.value) || [];
        const { value } = this.state;

        if (!value) return <span />;
        const { minCount } = this.props;
        Array.from({ length: minCount }).forEach((_, i) => value[i] = value[i] || this.getDefaultItem());
        if (!(contentFunc instanceof Function)) {
            console.log('ArrayDataView.contentFunc>>>>', contentFunc);
            return this.renderErrorMode('contentFunc is invalid', '');
        }
        if (!(value instanceof Array)) {
            console.log('ArrayDataView.value>>>>', value);
            return this.renderErrorMode('value is invalid', '');
        }
        const { actions } = this;
        const p = this.props;
        const elements = value.map((item, index) => {
            const alt = {
                index, itemNo: index + 1,
                isFirst: index == 0, isLast: (value.length - 1) == index
            };
            return contentFunc({ actions, item, alt } as any);
        });
        return <div style={p.style} className={Utils.classNames("array-data-view", p.className)} > {elements}</div >;
    }

}