
import { getCurrentUserLangauge, changeUserLanguage } from "../lib/core/bootstrapper";
import { uiKits } from "../lib/core/shared-vars";

function Kit() {
    return <a className="ui-mod change-lanauge" onClick={handleClick}>

        {getCurrentUserLangauge()}
    </a>
}
function handleClick(e: React.MouseEvent<any>) {
    e.preventDefault();

    const lang = (getCurrentUserLangauge() == 'EN_US') ? 'FA_IR' : 'EN_US';
    localStorage.setItem('lang', lang);
    changeUserLanguage(lang);

}
uiKits('change-user-language', Kit);