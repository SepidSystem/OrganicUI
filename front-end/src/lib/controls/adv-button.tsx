import { BaseComponent } from "../core/base-component";
import { ButtonProps } from "@material-ui/core/Button";
import { IAdvButtonProps } from "@organic-ui";
import { Utils } from "../core/utils";
import { Spinner } from "../core/spinner";
import { Callout, Button, Menu, MenuItem } from '../controls/inspired-components';
import { i18n } from "../core/shared-vars";
import { DirectionalHint } from "office-ui-fabric-react/lib/components/Callout";
import { MenuItemProps } from "@material-ui/core/MenuItem";
interface IState extends IAdvButtonProps {
    isError: boolean;
    fixedSize: { width, height };
    currentTargetForCallout: HTMLElement;
    currentTargetForMenuItems: HTMLElement;

}
export class AdvButton extends BaseComponent<ButtonProps & IAdvButtonProps, IState>{
    refs: {
        root: Element
    }
    closeCallOut() {
        this.repatch({ callout: null });
    }
    handleClick(e: React.MouseEvent<HTMLElement>) {
        if (this.props.menuItems) {

            return this.doOpenMenu(true, e);
        }
        const { currentTarget } = e;
        const fixedSize = currentTarget && { width: currentTarget.clientWidth, height: currentTarget.clientHeight };


        const s = this.state, p = this.props, { repatch } = this;
        e.preventDefault();

        if (s.callout) return this.repatch({ callout: null });
        const asyncClick = async () => {
            const resultAsync: any = (p.onClick instanceof Function) && p.onClick(e);

            if (resultAsync instanceof Promise) {
                this.repatch({ isLoading: true, callout: null, fixedSize });

                resultAsync.catch(error => {
                    console.log('Advanced Button Error>>>>>', error);
                    repatch({ isLoading: false, callout: null, isError: true, fixedSize: undefined });
                    repatch({ isError: false }, null, 2000);

                    return error;
                })
            }
            const clickResult = await resultAsync;
            const lastMod = +new Date();
            React.isValidElement(clickResult) && setTimeout(() => this.repatch({ isLoading: false, callout: clickResult, lastMod, currentTargetForCallout: currentTarget }), 500);
            !React.isValidElement(clickResult) && repatch({ isLoading: false, callout: null, fixedSize: undefined });


        }
        !this.getIsLoading() && asyncClick();

    }
    doOpenMenu(isOpen, evt) {
        this.closeLastButton();

        if (isOpen) AdvButton.lastShowedButton = this;

        this.repatch({ currentTargetForMenuItems: isOpen && evt.currentTarget })
    }
    static lastShowedButton: AdvButton;

    closeLastButton() {
        const { lastShowedButton } = AdvButton;
        if (!lastShowedButton) return;
        AdvButton.lastShowedButton = null;
        lastShowedButton.doOpenMenu(false, null);
    }
    getIsLoading() {
        return !this.props.noSpinMode && !!this.state.isLoading;
    }
    renderContent() {
        const p = this.props, s = this.state, repatch = this.repatch;
        const { menuItems } = this.props;
        const isLoading = this.getIsLoading();
        const className = Utils.classNames("adv-button", p.className, p.fixedWidth && 'is-fixed-width', s.isLoading && 'is-loading', p.size && 'is-' + p.size);
        const advButton = <Button className={className} data-isLoading={isLoading}
            {...p}
            onClick={this.handleClick.bind(this)}
            style={s.fixedSize && {
                minWidth: !p.fullWidth ? s.fixedSize.width + 'px' : undefined, maxWidth: s.fixedSize.width + 'px', minHeight: s.fixedSize.height + 'px', maxHeight: s.fixedSize.height + 'px', overflow: 'hidden'
                , ...(p.style || {})
            }}
        >
            {!s.isError && !isLoading && !s.callout && p.children}
            {!isLoading && s.callout && i18n('hide-result')}
            {!s.isError && !isLoading && !s.callout && !!p.iconName && Utils.showIcon(p.iconName)}
            {!s.isError && !isLoading && !s.callout && !!p.text && i18n(p.text)}
            {!!s.isError && <i className="fa fa-exclamation-triangle"></i>}
            {isLoading && <Spinner />}
        </Button>;
        const { currentTargetForMenuItems } = this.state;
        return <>
            {advButton}
            {React.isValidElement(s.callout) &&
                React.createElement(Callout, {
                    directionalHint: DirectionalHint.topCenter,
                    calloutWidth: p.calloutWidth || 500,
                    onDismiss: () => this.repatch({ callout: null, lastMod: +new Date() }),
                    target: this.state.currentTargetForCallout
                }, s.callout)}
            {currentTargetForMenuItems && menuItems instanceof Array && <Menu
                anchorEl={currentTargetForMenuItems}

                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                transformOrigin={{
                    horizontal: 'left', vertical: 'top'
                }}
                marginThreshold={0}
                open={currentTargetForMenuItems instanceof HTMLElement}
                onClose={this.doOpenMenu.bind(this, false)}

            >
                {menuItems.filter(mi => mi.name)
                    .map(menuItem => (React.createElement(MenuItem, {
                        ...(menuItem || {}),
                        button: true, component: 'a',
                        style: currentTargetForMenuItems && { ...(menuItem.style || {}), minWidth: currentTargetForMenuItems.clientWidth }
                    } as MenuItemProps, i18n(menuItem.name))))}

            </Menu>}
        </>
    }

}
