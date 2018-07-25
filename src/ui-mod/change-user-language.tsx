import { UiModule } from "../lib/ui-mod";
import { getCurrentUserLangauge, changeUserLanguage } from "../lib/bootstrapper";

function Component() {
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
UiModule.registeredModules('change-user-language', Component);