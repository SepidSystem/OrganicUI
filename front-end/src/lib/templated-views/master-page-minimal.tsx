import { AppUtils } from '../core/app-utils';
import {DeveloperBar} from '../core/developer-features';

export const masterPage = p => <article className="blank minimal master-page">
    <DeveloperBar />

    {p.children}
    <AppUtils />
</article>;