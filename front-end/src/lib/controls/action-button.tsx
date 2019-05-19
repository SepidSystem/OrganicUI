import { BaseComponent } from "../core/base-component";
import { Menu, Button, MenuItem } from "./inspired-components";
import { ButtonProps } from '@material-ui/core/Button';
import { IContextualMenuItem } from "office-ui-fabric-react/lib/components/ContextualMenu";
import { i18n } from "../core/shared-vars";
export default class ActionButton extends BaseComponent<IProps, IState> {
    static lastShowedButton: ActionButton;
    closeLastButton() {
        const { lastShowedButton } = ActionButton;
        if (!lastShowedButton) return;
        ActionButton.lastShowedButton = null;
        lastShowedButton.doOpenMenu(false, null);
    }
    handleClick(callback: Function, e: MouseEvent) {
        try {
            callback(e);
        } finally {
            this.doOpenMenu(false, e);
        }
    }
    render() {
        const { menuItems, children, ...otherProps } = this.props;
        const { currentTarget } = this.state;
        return <>
            <Button data-isOpen={!!currentTarget} variant="outlined" color="default" style={{ background: '#fff' }} {...otherProps}
                onClick={this.doOpenMenu.bind(this, [!currentTarget])}
            >{children}</Button>
            {!!currentTarget && <Menu
                anchorEl={currentTarget} modal={false}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }} ModalClasses={{ root: 'zIndex0' }}
                transformOrigin={{
                    horizontal: 'left', vertical: 'bottom'
                }}

                open={currentTarget instanceof HTMLElement}
                onClose={this.doOpenMenu.bind(this, [false])}
            >
                {menuItems instanceof Array && menuItems.filter(mi => mi.name).map(menuItem => (<MenuItem
                    style={{ direction: /^[a-z]/i.test(menuItem.name) ? 'ltr' : 'rtl' }}
                    onMouseUp={this.doOpenMenu.bind(this, [false])}
                    onClick={this.handleClick.bind(this, menuItem.onClick)} key={menuItem.key} >{i18n(menuItem.name)} </MenuItem>))}
            </Menu>}
        </>
    }
    doOpenMenu(isOpen, evt) {
        this.closeLastButton();

        if (isOpen) ActionButton.lastShowedButton = this;
        this.repatch({ currentTarget: isOpen && evt.currentTarget })
    }
}
interface IState {
    currentTarget: HTMLElement;
}
interface IProps extends ButtonProps {
    menuItems: IContextualMenuItem[];
}