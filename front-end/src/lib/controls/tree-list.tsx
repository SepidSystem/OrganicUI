/// <reference path="../../dts/globals.d.ts" />

import { BaseComponent } from '../core/base-component';
import { Utils } from '../core/utils';

import { Spinner } from '../core/spinner';
import { ITreeListNode, ITreeListProps } from '@organic-ui';
import { Checkbox, Button } from './inspired-components';

export class TreeList extends BaseComponent<ITreeListProps, any>{
    static defaultProps = {
        mapping: { key: 'key', parentKey: 'parentKey', text: 'text' }
    }
    constructor(p) {
        super(p);
        this.handleToggle = this.handleToggle.bind(this);
    }
    cache: any = {};
    clearCache() {
        this.cache = {};
    }
    isLeafNode(node: ITreeListNode): any {
        const { mapping } = this.props;
        if (!('isLeaf' in node)) node.isLeaf = !this.props.nodes.some(n => n[mapping.parentKey] == node[mapping.key]);
        return !!node.isLeaf;
    }
    changeCheckStatus(targetNode: ITreeListNode, delta: string | number) {
        const { mapping, onGetCheckBoxStatus } = this.props;
        const oldCheckBoxStatus = onGetCheckBoxStatus instanceof Function ? onGetCheckBoxStatus(targetNode) : targetNode.checkBoxStatus;
        const checkBoxStatus = delta == '+' ?
            (((oldCheckBoxStatus || 0) + 1) % 3) : +(delta);

        if (!this.props.onChangeCheckBoxStatus) {
            targetNode.checkBoxStatus = checkBoxStatus;
            if (!this.isLeafNode(targetNode)) {
                this.props.nodes
                    .filter(x => x[mapping.parentKey] == targetNode[mapping.key])
                    .forEach(x => this.changeCheckStatus(x, targetNode.checkBoxStatus));
            }
        }
        this.forceUpdate();
        this.props.onChange instanceof Function && this.props.onChange(this.props.nodes);
        this.props.onChangeCheckBoxStatus instanceof Function && this.props.onChangeCheckBoxStatus(targetNode, delta);

    }
    static checkBoxClassNames = ["type-flag type-flag0 fa fa-square-o",
        "type-flag  type-flag1 fa fa-check-square ",
        "type-flag  type-flag2 fa   fa-times-rectangle ",
        "type-flag  type-flag3 fa  fa-dot-circle-o  "];
    expandedKeys: any = {};
    handleToggle(e: React.MouseEvent<any>) {
        const key = Utils.getCascadeAttribute(e.target as any, 'data-key', true);
        this.expandedKeys[key] = !this.expandedKeys[key];
        this.forceUpdate();
    }
    parentKeys: any = {};
    renderNodes(parentKey) {
        if (this.parentKeys[parentKey])
            throw `renderNodes:${parentKey}`;
        const p = this.props;
        const { mapping } = this.props;
        let nodes = this.cache[parentKey];
        if (!(mapping.key && mapping.text && mapping.parentKey))
            throw `invalid mapping`;

        if (!nodes) {
            nodes = this.props.nodes;
            if (nodes instanceof Array && nodes.length == 0) nodes = null;
            nodes = this.props.nodes || (this.props.value instanceof Array ? JSON.parse(JSON.stringify(this.props.value)) : []);
            nodes = parentKey ? nodes.filter(n => n[mapping.parentKey] == parentKey) : nodes.filter(n => !n[mapping.parentKey]);
            this.cache[parentKey] = nodes;
        }
        if (nodes.length == 0) return null;

        this.parentKeys[parentKey] = true

        const result = <ul className={parentKey ? "subitems" : ""}>
            {nodes.map(node => ([<li key={node[mapping.key]} className={
                Utils.classNames(this.expandedKeys[node[mapping.key]] ? "expanded" : "collapsed", this.isLeafNode(node) ? 'leaf ' : '',
                    p.getNodeClass instanceof Function && p.getNodeClass(node)
                )} data-node-key={node[mapping.key]} onClick={p.onNodeClick} >
                <Button variant="flat" data-area="expand" data-key={node[mapping.key]} className={Utils.classNames("expand-icon",
                    this.expandedKeys[node[mapping.key]] ? "expanded" : "collapsed")} onClick={this.handleToggle} >
                    <i className="fa fa-chevron-left" aria-hidden="true"></i>
                    <i className="fa fa-chevron-down" aria-hidden="true"></i>
                </Button>

                <span className="node" data-area="text">

                    {p.showCheckBoxes && <Checkbox color={node.checkBoxStatus == 2 ? "secondary" : "primary"} onClick={this.changeCheckStatus.bind(this, node, '+')}
                        checked={p.onGetCheckBoxStatus ? p.onGetCheckBoxStatus(node) : !!node.checkBoxStatus} indeterminate={node.checkBoxStatus == 2}
                        centerRipple
                        checkedIcon={undefined && <i className={TreeList.checkBoxClassNames[(node.checkBoxStatus || 0)]} style={{ fill: "#ff0000" }} />}
                    />}
                    <span>{node[mapping.text]}</span>

                    {p.showCheckBoxes && <span className="choices" >
                        {classNameForCheckBoxStatuses.map(
                            (clsName, idx) => (<i className={`choice-flag  ${clsName}`}
                                onClick={this.changeCheckStatus.bind(this, node, idx)} />))}

                    </span>}
                </span>

                {this.renderNodes(node[mapping.key])}
            </li>]))}
        </ul>;
        delete this.parentKeys[parentKey];
        return result;


    }
    render() {
        const p = this.props;
        if (p.nodes instanceof Promise) return <Spinner />;
        return <div className="tree-list" style={{ maxHeight: p.height ? `${p.height}px` : null, height: p.height ? `${p.height}px` : null, overflow: 'scroll', overflowX: 'hidden' }}>
            {this.renderNodes(0)}
        </div>
    }
}
const classNameForCheckBoxStatuses = ['fa-square', 'fa-check-square', 'fa-times-rectangle']
TreeList['field-className'] = 'no-material no-label';
