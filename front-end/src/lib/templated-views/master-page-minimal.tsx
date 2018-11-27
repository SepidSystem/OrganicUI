import { AppUtils } from '../core/app-utils';
import {DeveloperBar} from '../core/developer-features';

export const MinimalMasterPage = p => <article className="blank minimal master-page" style={{ flexWrap: 'wrap' }}>
    <DeveloperBar />

    {p.children}
    <AppUtils />
</article>;