import { UiModule } from "../lib/ui-mod";
import { getCurrentUserLangauge } from "../lib/bootstrapper";

function Component(){
    return <a className="ui-mod change-lanauge" onClick={handleClick}>
    
    {getCurrentUserLangauge()}
        </a> 
}
function handleClick(e:React.MouseEvent<any>){
e.preventDefault();
}
UiModule.registeredModules('change-user-language',Component);