import { TextField, Popover } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';

export class DataLookupPopOver extends BaseComponent<OrganicUi.IDataLookupPopupModeProps, any>  {
    render() {
        const p = this.props;
        const rects = p.target && p.target.getClientRects();
        const rect = rects && rects[0];
        const targetIsTop = rect && (rect.top < window.innerHeight * 0.7);
        return <Popover open={p.isOpen} onClose={() => {
            p.onClose && p.onClose();
            document.documentElement.classList.remove('overflowY-hidden');
        }}
            anchorEl={p.target}

            anchorOrigin={{
                vertical: targetIsTop ? 'top' : 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: targetIsTop ? 'top' : 'bottom',
                horizontal: 'right',
            }}
        >
            {p.children}
        </Popover>

    }
    static renderButtons = (p:OrganicUi.DataLookupProps) => (<span className="caretDownWrapper  ">
        <svg className="MuiSvgIcon-root MuiSelect-icon" width={20} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5z"></path>
        </svg>
    </span>);
    static inlineMode:boolean=true;

}