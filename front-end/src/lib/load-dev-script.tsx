
import {loadScript } from './bootstrapper';
export function loadDevScript() {
    const devtoolsSrc = Array.from(document.querySelectorAll('script')
    ).map(ele => ele.getAttribute('data-devtools')).filter(x => !!x)[0];
    if (!devtoolsSrc) {
        alert('data-devtools is not set');
        return;
    }
    return loadScript(devtoolsSrc);
}
