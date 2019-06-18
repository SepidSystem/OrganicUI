import { BaseComponent } from "../core/base-component";
import { Trello, Dialog, TextField, Button } from "./inspired-components";
import { AdvButton } from "../controls/adv-button";

import { IContextualMenuItem } from "office-ui-fabric-react";
import { Alert } from "../controls/inspired-components";
import { Utils } from "../core/utils";
import { MenuItemProps } from "@organic-ui";
import { i18n } from "../core/shared-vars";
import { AppUtils } from "../core/app-utils";

export default class Board<TCard> extends BaseComponent<OrganicUi.BoardProps<TCard>, IState> {
    static Instance: Board<any>;
    refs: {
        root: HTMLElement;
    }
    getCards() {
        const { cards } = this.state;
        return cards instanceof Function ? cards() : cards;
    }

    updateCard(cardId, data) {
        let cards = this.getCards();
        const [_, cardType, id] = cardId.split('|');
        /*   for (const lane of lanes) {
               lane.cards = (lane.cards instanceof Array) && lane.cards
                   .map(card => card.id == cardId ? { ...card, data } : card)
                   .filter(notFalse => notFalse);
           }
            this.handleDataChange(this.data);*/
        cards = cards.map(card => card.id == id && card.cardType == cardType ? data : card)
            .filter(notFalse => notFalse);

        this.repatch({ cards, boardKey: +new Date() });
    }
    getData() {
        const lanes = this.mapLanes(this.getLanes(), this.getCards());
        return { lanes };
    }
    normalizeCard<T>(cardData: T, card) {
        const { cardMapping } = this.props;
        const { id } = card as any;
        const cardType = (card as any)[cardMapping.cardType];
        let strId: string = id ? id.toString() : '';
        if (!strId.includes('|')) {
            strId = `card|${cardType}|${id}`;
        }
        return { ...cardData, id: strId };


    }
    mapCards(cards: TCard[], laneId?) {
        const { cardMapping, cardTypes } = this.props;
        const getCardId = card => card[cardMapping.id];

        const getCardType = card => card[cardMapping.cardType];
        const getLaneId = card => card[cardMapping.laneId];

        cards = laneId ? cards.filter(card => getLaneId(card) == laneId) : cards;
        return (cards || []).map(card => {
            const cardType = getCardType(card);
            const cardId = getCardId(card);
            const id = ['card', cardType, cardId].join('|');
            const trelloCard = cardTypes[cardType];
            const data = (card as any).data || card;
            const menuItems: MenuItemProps[] =
                trelloCard.actions && trelloCard.actions.filter(a => !a.isAccessible || a.isAccessible()).map(action => ({
                    key: action.text, name: <>
                        {Utils.showIcon(action.iconName)}<span className="sep" />{i18n(action.text)}
                    </> as any,

                    onClick: action.handler.bind(this, data, {
                        onUpdate: this.updateCard.bind(this, id),
                        onDelete: this.updateCard.bind(this, id, null),

                    } as MenuItemProps) as any
                }));

            return {

                id,
                title: <section style={{ display: 'flex', width: '100%' }}>

                    <div style={{ flex: 1 }}>
                        {React.createElement(trelloCard.titleComponent, data || card)}
                    </div>
                    <div style={{ maxWidth: '4rem' }}>
                        <AdvButton menuItems={menuItems} variant="text">{Utils.showIcon('mdi-menu')} </AdvButton>
                    </div>
                </section>,
                description: React.createElement(trelloCard.contentComponent, data),
                data
            }
        })

    }
    static cardIdentityCounter = -10000;
    componentDidUpdate() {

        const { root } = this.refs;
        if (root) {
            // const lastSpan = Array.from(root.querySelectorAll('span')).slice(-1)[0];
            //lastSpan && (lastSpan.style.visibility = 'hidden');
        }
        setTimeout(() => {
            if (!root) return;
            const nodes: HTMLElement[] = Array.from(root.querySelectorAll('*'));
            for (const node of nodes) node.removeAttribute && node.removeAttribute('title');
        }, 400);
    }
    static isUniqueId(s: string) {
        return (typeof s == 'string' && s.includes('|'));
    }
    mapLanes(lanes, cards?) {
        return lanes instanceof Array ? lanes.map(lane => ({
            ...lane,
            id: lane.id,
            title: <div className="lane-title-wrapper"
                style={{ position: 'relative', minHeight: '2rem', width: '100%' }}>

                <Button variant="text" style={{ position: 'absolute', right: 5, top: -6, color: '#aa1122' }}
                    onClick={Board.handleRemoveLane.bind(null, this, lane.id)}
                    data-action="remove"   >{Utils.showIcon('mdi-folder-remove')}</Button>
                <Button variant="text" style={{ position: 'absolute', right: 30, top: -6, color: '#666' }}
                >{Utils.showIcon('mdi-settings')}</Button>

                <span className="lane-title" data-id={lane.id}>{lane.laneTitle} </span>
                <Button variant="text" style={{ position: 'absolute', left: 0, top: -6 }} color="primary" data-action="add"
                    onClick={this.handleNewCard.bind(this, lane.id)}
                >{Utils.showIcon('mdi-comment-plus')}</Button>
                <Button variant="text" style={{ position: 'absolute', left: 30, top: -6 }}
                    onClick={this.handleEditLane.bind(this)}
                    color="secondary" data-action="add"   >{Utils.showIcon('mdi-folder-edit')}</Button>
            </div>,

            cards: cards ? this.mapCards(cards, lane.id) : (lane.cards || []),
        })) : [];
    }

    async handleAddLane() {
        await this.repatch({ fullScreen: false });
        await Utils.delay(100);
        const alertResult = await Alert({ input: 'text' });
        if (!alertResult || alertResult.dismiss) throw 'cancel-by-user';
        let lanes = this.getLanes();
        const freshLane = {
            id: this.props.accquireLaneId(),
            laneTitle: alertResult.value,
            cards: []
        };
        lanes = [...lanes, freshLane];
        this.repatch({ lanes });
    }
    getLanes() {
        const { lanes } = this.state;

        return lanes instanceof Function ? lanes() : lanes;
    }
    handleFullScreenClick() {
        this.repatch({ fullScreen: !this.state.fullScreen });
    }
    renderInnerContent() {

        return <>  <header className="sepid-board-header" style={{ display: 'flex', margin: 4 }}>
            <Button variant="outlined" onClick={this.handleFullScreenClick.bind(this)}>{Utils.showIcon(this.state.fullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen')}</Button>
            <Button variant="outlined" onClick={this.handleAddLane.bind(this)}>{Utils.showIcon('mdi-book-plus')}</Button>

        </header>
            <Trello.Board
                key={this.state.boardKey || 0}

                draggable
                editable
                data={this.getData()}
                hideCardDeleteIcon
                newCardTemplate={React.createElement(NewCard, { ...this.props, board: this } as any) as any}
                collapsibleLanes
                onDataChange={this.handleDataChange.bind(this)}
                style={{ width: '100%' }}
                addCardLink={Board.showAddLink(this.props, this)}

            /></>
    }
    renderContent() {
        this.defaultState(this.props as any);

        Object.assign(window, { board: this });
        if (this.state.fullScreen) return <Dialog className="sepid-board" fullScreen open>
            {this.renderInnerContent()}
        </Dialog>

        return <section className="sepid-board" ref="root" >
            {this.renderInnerContent()}
        </section>
    }
    static handleToggleLane(board, e: React.MouseEvent<HTMLElement>) {
        const { currentTarget } = e;
        if (currentTarget instanceof HTMLElement) {
            //currentTarget.
            let section = currentTarget;
            while (section) {
                if (section.tagName.toUpperCase() == 'SECTION') break;
                section = section.parentElement;
            }
            const lastSpan = Array.from(section.querySelectorAll('span')).slice(-1)[0];
            //  lastSpan.style.visibility = null;
            //  Utils.simulateClick(lastSpan);
            //  lastSpan.style.visibility = 'hidden';
        }
    }


    static getLaneIdByElement(target: HTMLElement) {
        while (target) {
            if (target.classList.contains('react-trello-lane')) break;
            target = target.parentElement;
        }
        const laneTitleSpan = target && target.querySelector('.lane-title');
        if (laneTitleSpan)
            return laneTitleSpan.getAttribute('data-id');

    }
    async handleEditLane(evt: React.MouseEvent<HTMLElement>) {

        // evt.currentTarget;
        const laneId = Board.getLaneIdByElement(evt.currentTarget);
        let lanes = this.getLanes() as any;
        const lane = lanes.filter(l => l.id == laneId)[0];
        if (!lane) return;
          const alertResult = await Alert({ inputValue: lane.laneTitle, input: 'text', type: 'question' })

        if (!alertResult || alertResult.dismiss) return;
        const { value: laneTitle } = alertResult;
        lanes = lanes.map(l => (l.id == laneId ? { ...l, laneTitle } : l));

        this.repatch({ lanes, boardKey: +new Date() });

    }

    static async handleRemoveLane(board: Board<any>, laneId) {
        const { cardMapping, cardTypes } = board.props;
        const getLaneId = card => card[cardMapping.laneId];
        const cards = board.getCards().filter(c => getLaneId(c) == laneId);
        if (cards.length) {
            return Alert({ type: 'error', text: 'unremovable-lane' });
        }
        if (!await AppUtils.confrim('are-you-sure')) return;
        let lanes = board.getLanes() as any;
        lanes = lanes.filter(l => l.id != laneId);
        await board.repatch({ lanes, boardKey: +new Date() });
    }
    static showAddLink(p: OrganicUi.BoardProps<any>, board: Board<any>) {
        return <></>
    }

    handleDataChange(data) {

        const { cardMapping, onDataChange } = this.props;
        if (!(onDataChange instanceof Function)) return;
        const lanes = data.lanes.map(l => {

            const { id } = l;
            return { id, laneTitle: l.laneTitle || l.title }
        });
        const cards = data.cards ? data.cards : [].concat(...data.lanes.map(l => {
            const laneId = l.id;

            return l.cards instanceof Array ? l.cards.map(card => {
                const [_, cardType, id] = card.id.split('|');
                return {
                    ...(card.data || card),
                    [cardMapping.cardType]: cardType,
                    [cardMapping.id]: +id,
                    [cardMapping.laneId]: laneId,
                };
            }) : [];
        }));
        const delta = { lanes, cards };
        Object.assign(this.state, delta);
        onDataChange(delta);
    }
    async handleNewCard(laneId: string) {
        const { cardTypes, cardMapping } = this.props;
        async function getCardType() {
            const entries = Utils.entries(cardTypes).map<[string, string]>(([key]) => ([key, key]));
            //if (entries.length < 2)
            return entries[0][0];
            const alertResult = await Alert({
                input: 'select', inputAttributes: {

                    size: "8"
                }, inputOptions: Utils.fromEntries(entries), showCancelButton: true
            });
            if (!alertResult || alertResult.dismiss) throw `cancel-by-user`;
            const _cardType = alertResult.value;
            return _cardType;
        }
        const _cardType = await getCardType();
        const cardType = cardTypes[_cardType] as OrganicUi.ITrelloCard<any>;

        const _card = await cardType.fetchNewCard();
        Object.assign(_card, { [cardMapping.cardType]: _cardType });
        //   const [card] = this.mapCards([_card]);
        const id = (--Board.cardIdentityCounter);
        Object.assign(_card, { [cardMapping.id]: id })
        Object.assign(_card, { [cardMapping.cardType]: _cardType });
        Object.assign(_card, { [cardMapping.laneId]: laneId });
        Object.assign(_card, { _new: true });
        const [card] = this.mapCards([_card]);
        Object.assign(card, { [cardMapping.cardType]: _cardType });
        Object.assign(card, { [cardMapping.laneId]: laneId });
        Object.assign(card, { _new: true });
        let cards = this.getCards();
        cards = [card,...cards];

        await this.repatch({ cards, boardKey: +new Date() });
        this.handleDataChange({ cards, lanes: this.getLanes() });

        //this._handleNewButton = null;
    }
}

class NewCard extends BaseComponent<OrganicUi.BoardProps<any> & { onCancel, onAdd, board }, any> {
    static Instance: NewCard;


    _handleNewButton: any;
    render() {
        NewCard.Instance = this;
        //  this._handleNewButton = this._handleNewButton || this.handleNewButton();
        return <>
            {Board.showAddLink(this.props, this.props.board)}

        </>
        /*
        const { onCancel } = this.props
        return (<Dialog open={true}>
            <div style={{ background: 'white', borderRadius: 3, border: '1px solid #eee', borderBottom: '1px solid #ccc' }}>
                <div style={{ padding: 5, margin: 5 }}>
                    <div>
                        <div style={{ marginBottom: 5 }}>
                            <input type="text" onChange={evt => this.updateField('title', evt)} placeholder="Title" />
                        </div>
                        <div style={{ marginBottom: 5 }}>
                            <input type="text" onChange={evt => this.updateField('description', evt)} placeholder="Description" />
                        </div>
                    </div>
                    <button onClick={this.handleAdd}>Add</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div></Dialog>*/

    }
}

interface IState {
    fullScreen: boolean;
    cards: any[];
    lanes: any[];
    boardKey: number;

}
