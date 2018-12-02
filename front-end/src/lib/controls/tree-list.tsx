/// <reference path="../../dts/globals.d.ts" />

import { BaseComponent } from '../core/base-component';
import { Utils } from '../core/utils';
import TextField from '@material-ui/core/TextField'
import { Spinner } from '../core/spinner';
import { ITreeListNode, ITreeListProps } from '@organic-ui';
import { Checkbox, Button } from './inspired-components';
import { SelfBind } from '../core/decorators';
import { SearchIcon } from './icons';
import { i18n } from '../core/shared-vars';
interface IState {
    searching: string;
}
export class TreeList extends BaseComponent<ITreeListProps, IState>{
    static defaultProps = {
        mapping: { key: 'key', parentKey: 'parentKey', text: 'text' }
    }
    foundedKeys: any;
    nodeByKey: any;
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
    internalExpandedKeys: any = {};
    isExpanded(key) {
        return (this.internalExpandedKeys[key] || this.expandedKeys[key]);
    }
    @SelfBind()
    handleExpandToggle(e: React.MouseEvent<any>) {
        const key = Utils.getCascadeAttribute(e.target as any, 'data-key', true);
        this.expandedKeys[key] = !this.isExpanded(key);
        delete this.internalExpandedKeys[key];
        this.forceUpdate();
    }
    parentKeys: any = {};
    getNodes(parentKey) {
        const { mapping } = this.props;

        let nodes = parentKey instanceof Array ? parentKey as any[] : this.cache[parentKey];
        if (!(mapping.key && mapping.text && mapping.parentKey))
            throw `invalid mapping`;

        if (!nodes) {
            nodes = this.props.nodes;
            if (nodes instanceof Array && nodes.length == 0) nodes = null;
            nodes = this.props.nodes || (this.props.value instanceof Array ? JSON.parse(JSON.stringify(this.props.value)) : []);
            nodes = parentKey ? nodes.filter(n => n[mapping.parentKey] == parentKey) : nodes.filter(n => !n[mapping.parentKey]);
            this.cache[parentKey] = nodes;
        }
        return nodes;
    }
    renderNodes(parentKey) {
        const { mapping } = this.props;

        if (this.parentKeys[parentKey])
            throw `renderNodes:${parentKey}`;
        const p = this.props;
        const nodes = this.getNodes(parentKey);
        if (nodes.length == 0) return null;

        this.parentKeys[parentKey] = true;


        const result = <ul className={parentKey ? "subitems" : ""}>
            {nodes.filter(n => this.expandedKeys[n[mapping.parentKey]] || !this.foundedKeys || this.foundedKeys[n[mapping.key]])
                .map(node => {
                    let { checkBoxStatus } = node;
                    const childNodes = this.getNodes(node[mapping.key]);
                    if (childNodes.length > 0 && !checkBoxStatus) {
                        checkBoxStatus = childNodes.map(c => c && c.checkBoxStatus).filter(checkBoxStatus => checkBoxStatus)[0];
                    }
                    return (<li key={node[mapping.key]} className={
                        Utils.classNames(this.isExpanded(node[mapping.key]) ? "expanded" : "collapsed", this.isLeafNode(node) ? 'leaf ' : '',
                            p.getNodeClass instanceof Function && p.getNodeClass(node)
                        )} data-node-key={node[mapping.key]} onClick={p.onNodeClick} >
                        <Button variant="flat" data-area="expand" data-key={node[mapping.key]} className={Utils.classNames("expand-icon",
                            (this.isExpanded(node[mapping.key])) ? "expanded" : "collapsed")} onClick={this.handleExpandToggle} >
                            <i className="fa fa-chevron-left" aria-hidden="true"></i>
                            <i className="fa fa-chevron-down" aria-hidden="true"></i>
                        </Button>

                        <span className="node" data-area="text">

                            {p.showCheckBoxes && <Checkbox color={node.checkBoxStatus == 2 ? "secondary" : "primary"} onClick={this.changeCheckStatus.bind(this, node, '+')}
                                checked={p.onGetCheckBoxStatus ? p.onGetCheckBoxStatus(node) : !!checkBoxStatus} indeterminate={node.checkBoxStatus == 2}
                                centerRipple
                                checkedIcon={undefined && <i className={TreeList.checkBoxClassNames[(checkBoxStatus || 0)]} style={{ fill: "#ff0000" }} />}
                            />}
                            <span>{node[mapping.text]}</span>

                            {p.showCheckBoxes && <span className="choices" >
                                {classNameForCheckBoxStatuses.map(
                                    (clsName, idx) => (<i className={`choice-flag    ${clsName}`}
                                        onClick={this.changeCheckStatus.bind(this, node, idx)} />))}

                            </span>}
                        </span>
                        {(this.isExpanded(node[mapping.key])) && this.renderNodes(node[mapping.key])}
                    </li>);

                })
            }
        </ul>;
        delete this.parentKeys[parentKey];
        return result;
    }
    @SelfBind()
    handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const { currentTarget } = e;
        if (!currentTarget) return;
        this.foundedKeys = null;
        this.repatch({ searching: currentTarget.value });

    }
    filterNode(node) {
        const { mapping } = this.props;
        const { searching } = this.state;
        const text = node[mapping.text];
        return text.includes(searching);
    }
    getFoundedKey() {
        this.internalExpandedKeys = {};
        if (!this.state.searching) return null;
        const foundedKeys = {};
        const { mapping } = this.props;
        this.filterNode = this.filterNode.bind(this);
        for (const node of this.props.nodes) {
            if (!this.filterNode(node)) continue;
            let targetNode = node;
            while (targetNode) {
                foundedKeys[targetNode[mapping.key]] = true;
                this.internalExpandedKeys[targetNode[mapping.key]] = true;
                targetNode = this.nodeByKey[targetNode[mapping.parentKey]];
            }
        }
        return foundedKeys;
    }
    renderContent() {
        const p = this.props;
        const rootNodes = p.nodes instanceof Array && p.nodes.filter(n => !n[p.mapping.parentKey]);
        this.nodeByKey = this.nodeByKey || (p.nodes instanceof Array && p.nodes.reduce((accum, node) => Object.assign(accum, { [node[p.mapping.key]]: node }), {}));
        this.foundedKeys = this.foundedKeys || this.getFoundedKey();
        return <div className="tree-list" style={{ height: p.height ? `${p.height}px` : null, display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>


            <div style={{ display: 'none'/*'flex'*/ }}>
                <TextField placeholder={i18n.get('search-in-treelist')}
                    type="text" style={{ flex: 1 }} onChange={this.handleSearch} />

                <SearchIcon style={{ width: '1.6rem' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: '1' }}>
                {p.nodes instanceof Promise ? <Spinner /> : this.renderNodes(rootNodes)}
            </div>
        </div>
    }
}
const classNameForCheckBoxStatuses = ['fa fa-square', 'fa fa-check-square', 'fa fa-times-rectangle']
TreeList['field-className'] = 'no-material no-label';
