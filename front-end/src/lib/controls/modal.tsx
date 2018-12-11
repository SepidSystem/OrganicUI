import { Dialog, DialogTitle, DialogContent, DialogActions } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';
import { SelfBind } from '../core/decorators';
import { i18n } from '../core/shared-vars';
import { AdvButton } from '../core/ui-elements';
import { Utils, changeCase } from '../core/utils';
import * as error from '../../../icons/ic_error.svg';
import * as warning from '../../../icons/warning.svg';
interface IState {
    isOpen: boolean;
}
export class Modal extends BaseComponent<OrganicUi.ModalProps, IState>{
    static icons = { error, warning };
    @SelfBind()
    close() {
        this.repatch({ isOpen: false });
    }
    renderContent() {
        this.defaultState({ isOpen: true });
        const __html = Modal.icons[this.props.type];
        const { isOpen } = this.state;
        const { children, buttons } = this.props;
        return <Dialog open={isOpen} onClose={this.close} className="ux-modal" >
            {this.props.title && <DialogTitle>{i18n(this.props.title as any)}</DialogTitle>}
            <DialogContent>
                {!!__html && <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', width: '100%' }}>
                    <div style={{ minHeight: '5.33rem', minWidth: '5.33rem', maxWidth: '5.33rem', maxHeight: '5.33rem' }} dangerouslySetInnerHTML={{ __html }} ></div>
                </div>}
                <div style={{ margin: '0 3.665rem', minWidth: '20rem', marginTop: '1.3rem', fontSize: '1.67rem' }}>
                    {children}
                </div>
            </DialogContent>
            <DialogActions style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', flexDirection: 'row-reverse' }}>
                {this.renderActions(buttons)}
            </DialogActions>
        </Dialog>
    }
    async handleModalButtonClick(action: Function) {
        const result = await action();
        this.close();
        return result;
    }
    renderActions(buttons: { [key: string]: Function }) {
        return buttons && <>
            {Utils.entries(buttons).map(([key, action], idx) => (<AdvButton
                className={`ux-button ${idx == 0 ? 'primary' : ''}`}
                onClick={this.handleModalButtonClick.bind(this, action)} >{i18n(changeCase.paramCase(key))} </AdvButton>))}
        </>
    }
    static defaultProps: {
        type: 'error'
    }
}
