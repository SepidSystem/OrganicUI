import { Utils } from "./utils";
import { ITreeListNode } from "@organic-ui";
import { renderViewToComplete, appData } from "./bootstrapper";
import { i18n } from "./shared-vars";

export function scanAllPermission(table: { data }): Promise<ITreeListNode[]> {
    if (Utils['scaningAllPermission']) {

        return Promise.resolve([]);
    }
    Utils['scaningAllPermission'] = +new Date();

    const result: ITreeListNode[] = [];
    let appliedUrls = [];
    const urls = table && table.data && Object.keys(table.data);
    OrganicUI.Utils.setNoWarn(+new Date() as any);
    return new Promise(resolve => {

        urls.forEach(url => {
            const temp = document.createElement('div');
            renderViewToComplete(url, temp).then(() => {

                const criticalArray = Array.from(temp.querySelectorAll('.critical-content'));
                const treeList: ITreeListNode[] =
                    criticalArray.map(ele =>
                        ({ value: ele.getAttribute('data-value'), identifiter: ele.getAttribute('data-key') }))
                        .map<ITreeListNode>(({ identifiter, value }) =>
                            ({ key: value, text: i18n.get(identifiter), parentKey: url, checkBoxStatus: 0, extraValue: value }));
                if (treeList.length) {
                    treeList.unshift({
                        key: url,
                        parentKey: 0,
                        text: Array.from(temp.querySelectorAll('.page-title-value')).map(p => p.getAttribute('data-page-title')).join('')

                            || url,
                        checkBoxStatus: 0
                    })
                }
                result.push(...treeList);
                appliedUrls.push(url);
                if (appliedUrls.length == urls.length) {
                    Utils['scaningAllPermission'] = 0;
                    OrganicUI.Utils.setNoWarn(false);
                    resolve(result);
                    return;
                }
            }, () => Utils['scaningAllPermission'] = 0);
        });
    });
}
export function checkPermission(permissionKey) {
    if (!appData || !appData.appModel) return true;
    return appData.appModel.checkPermission(permissionKey);
}
 
