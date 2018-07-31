import { SnackBar } from './snack-bar';
import { BaseComponent } from './base-component';
import { i18n } from './shared-vars';
import { IAdvSectionProps } from '@organic-ui';
import { Utils } from './utils';
export class AdvSection extends BaseComponent<IAdvSectionProps, any>{
    render() {
        const p = this.props;
        return (
            <section {...p} className={Utils.classNames('advanced-section', p.className)}>
                {p.children}
                {'errorMessage' in p && <div className={Utils.classNames("error-message", !!p.errorMessage ? 'has-message' : 'no-message')} style={{ margin: '5px', visibility: !p.errorMessage ? 'hidden' : 'visible' }}>
                    <SnackBar variant="error" onClose={p.onCloseMessage} >{i18n(p.errorMessage || ' ')}</SnackBar>
                </div>}
            </section>);
    }
}