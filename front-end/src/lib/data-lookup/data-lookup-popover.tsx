import { Popover } from '../controls/inspired-components';
import { BaseComponent } from '../core/base-component';
import { PopoverProps } from '@material-ui/core/Popover';
interface IState {
    innerHeight: number;
}
/*
class Popover extends BaseComponent<any, IState>{
    refs: {
        inner: HTMLElement;
    }

    renderContent() {
        const p = this.props, s = this.state;
        if (p.open) {
            const { inner } = this.refs;

            if (!inner)
                this.repatch({}, null, 30);
            else {
                const content = inner.children[0];
                if (inner && p.innerHeight != content.clientHeight) {
                    this.repatch({ innerHeight: content.clientHeight }, null, 10);
                }
            }
        }
        return <>
            {!!p.open &&
                <div style={{ maxHeight: 0, overflow: 'visible', display: 'flex', zIndex: 1000 * 1000 }}>
                    <div className="Xpop-XXover"
                        style={{ minHeight: s.innerHeight, display: 'flex',zIndex:10000*1000 }}>
                        <div ref="inner">{p.children}</div>
                    </div>
                </div>}
        </>
    }
}*/
export class DataLookupPopOver extends BaseComponent<OrganicUi.IDataLookupPopupModeProps, any>  {
    static lastOpen: DataLookupPopOver;
     
    render() {
        const p = this.props;
        const rects = p.target && p.target.getClientRects();
        const rect = rects && rects[0];
         if(p.isOpen){ 
            document.documentElement.classList.add('overflowY-hidden');
            document.body.classList.add('overflowY-hidden');
            DataLookupPopOver.lastOpen=this;
        }
        else if(DataLookupPopOver.lastOpen==this){
            DataLookupPopOver.lastOpen=null;
            document.documentElement.classList.remove('overflowY-hidden');
            document.body.classList.remove('overflowY-hidden');
        }
        const targetIsTop = rect && (rect.top < window.innerHeight * 0.7);
        return <Popover open={p.isOpen}
        
        style={{ zIndex: 2000000 }} onClose={() => {
            
            document.documentElement.classList.remove('overflowY-hidden');
            document.body.classList.remove('overflowY-hidden');
            
            p.onClose && p.onClose();
        }}
            anchorEl={p.target}
              
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: targetIsTop ? 'top' : 'bottom',
                horizontal: !p.reversed ? 'left' : 'right',
            }}
            transformOrigin={{
                vertical: targetIsTop ? 'top' : 'bottom',
                horizontal: 'center',
            }}
            
        >
            {p.children}
        </Popover>

    }
    static renderButtons = (p: OrganicUi.DataLookupProps, extraProps) => (<span className="caret-down-wrapper  " {...extraProps} >
        <svg className="MuiSvgIcon-root MuiSelect-icon" width={20} focusable="false" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5z"></path>
        </svg>
    </span>);
    static inlineMode: boolean = true;

}