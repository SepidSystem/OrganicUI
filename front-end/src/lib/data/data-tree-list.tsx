import { DataList } from "./data-list";
import { TreeList } from "../controls/tree-list";
import { Utils } from "../core/utils";
import { IFieldProps } from "@organic-ui";
import { Field } from "./field";
export class DataTreeList extends DataList {
    checkedIds: any = {};
    static isDataList = true;
    nodes: any[];
    mapping: any;
    constructor(p) {
        super(p);
        this.handleNodeClick = this.handleNodeClick.bind(this);
        this.handleGetCheckBoxStatus = this.handleGetCheckBoxStatus.bind(this);
    }
    getSelectedKeyCollection() {
        return this.props.selection.selectedNodeKeys;
    }
    handleGetCheckBoxStatus(targetNode) {
        return this.props.selection.selectedNodeKeys[targetNode[this.mapping.key]] ? 1 : 0;
    }
    renderItems(nodes) {
        this.nodes = nodes;
        this.mapping = this.mapping || Object.keys(this.childrenByRole)
            .reduce((accum, key) => Object.assign({ [key]: Field.getAccessorName(this.childrenByRole[key][0].props.accessor) }, accum), {});
        const { mapping } = this;
        if (this.props.selection)
            this.props.selection.treeList = this;
        if (nodes && nodes.length)

            return <TreeList {...this.props} {...{ nodes, mapping }} showCheckBoxes={true} onNodeClick={this.handleNodeClick.bind(this)}
                onChangeCheckBoxStatus={() => 0}
                onGetCheckBoxStatus={this.handleGetCheckBoxStatus}
            />
    }
    static getSelectionClass() {
        return TreeSelection as any;
    }
    handleNodeClick(e: React.MouseEvent<HTMLElement>, delta?) {
        if (e.target instanceof HTMLElement) {
            const target = e.target as HTMLElement;
            if (Utils.getCascadeAttribute(target, 'data-area') != 'text') return;
            e.stopPropagation();
            e.preventDefault();
        }
        const key = e.target instanceof HTMLElement ? Utils.getCascadeAttribute(e.target as any, 'data-node-key') : e[this.mapping.key];
        if (this.props.multiple) this.props.selection.selectedNodeKeys[key] = !this.props.selection.selectedNodeKeys[key];
        else this.props.selection.selectedNodeKeys = { [key]: true };
        this.repatch({});

    }



}
class TreeSelection {
    selectedNodeKeys: any = {};
    /**
    *
    */
    constructor(public treeList: DataTreeList) {


    }
    setItems(items: any[], shouldClear?: boolean): void {
        throw 'setItems is no-thing';
    }
    getItems(): any[] {
        return this.treeList.nodes;
    }
    getSelection(): any[] {
        throw 'getSelection is no-thing';
    }

    getSelectedCount(): number {
        return Object.keys(this.selectedNodeKeys).filter(key => this.selectedNodeKeys[key]).length
    }
    getSelectedIndices(): number[] {
        return Object.keys(this.selectedNodeKeys)
            .map((key, idx) => ({ key, idx, selected: this.selectedNodeKeys[key] }))
            .filter(({ selected }) => selected)
            .map(({ idx }) => idx)

    }
    isRangeSelected(fromIndex: number, count: number) {
        throw 'isRangeSelected is no-thing';
    }
    isAllSelected(): boolean {
        return this.selectedNodeKeys.length == this.treeList.nodes.length;
    }
    isKeySelected(key: string): boolean {
        throw 'isKeySelected is no-thing';
    }
    isIndexSelected(index: number): boolean {
        throw 'isIndexSelected is no-thing';
    }
    getSelectedKey() {
        return Object.keys(this.selectedNodeKeys)[0];
    }
}