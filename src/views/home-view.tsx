/// <reference path="../core.d.ts" /> 
/// <reference path="../platform.d.ts" />     
module HomeView {
    const { ActionManager, routeTable, i18n, icon } = Core;
    const { View } = Core;
    const { DropDownButton, Tabs, SearchInput } = Core.Components;
    const { listViews } = Platform;
    class API extends ActionManager {
        findFolderById(id: number): any {
            return this.refetch('GET', `/api/folder/${id}`);
        }
        readFolderList() {
            return this.refetch('GET', "/api/folder");
        }
        readPaperListByFolderId(folderId) {
            return this.refetch('GET', `/api/paper?folderId=${folderId}`);
        }
    }
    class HomeView extends View<any, any, API> {

        actionManager: API;
        state: {
            folders: any[];
            papers: any[];
            paperTypes: { [key: string]: true }
            selectedFolder: any;
            sheets: string[];
        }

        renderContent() {
            const { repatch } = this;
            const s = this.state;
            const folderId = 1;
            this.api = this.api || new API();
            this.state.sheets = ['Dashboard', 'section#2', 'user-history', 'dev'];
            const { api } = this;
            s.folders = s.folders || api.readFolderList().then(folders => repatch({ folders })) as any;
            s.papers = s.papers || api.readPaperListByFolderId(folderId).then(papers => repatch({ papers })) as any;
            s.paperTypes = s.papers instanceof Array && s.papers.reduce((a, b) => (a[b.type] = true, a), {});
            s.selectedFolder = s.selectedFolder || api.findFolderById(folderId).then(selectedFolder => repatch({ selectedFolder }));
            return <section className="" >

                <div className="card-header is-shadowless is-medium">
                </div>



            </section>;
        }
    }
    routeTable.set('/view/home', HomeView);
    class Lists extends View<any, any, API> {

        actionManager: API;
        state: {
            folders: any[];
            papers: any[];
            paperTypes: { [key: string]: true }
            selectedFolder: any;
            sheets: string[];
        }

        renderContent() {
            const { repatch } = this;
            const s = this.state;
            const folderId = 1;
            this.api = this.api || new API();
            this.state.sheets = Object.keys(listViews.data);
            const { api } = this;
            s.folders = s.folders || api.readFolderList().then(folders => repatch({ folders })) as any;
            s.papers = s.papers || api.readPaperListByFolderId(folderId).then(papers => repatch({ papers })) as any;
            s.paperTypes = s.papers instanceof Array && s.papers.reduce((a, b) => (a[b.type] = true, a), {});
            s.selectedFolder = s.selectedFolder || api.findFolderById(folderId).then(selectedFolder => repatch({ selectedFolder }));
            return <section className="" >

                <div className="card-header is-shadowless is-medium">
                </div>



            </section>;
        }
    }
    routeTable.set('/view/lists', Lists);
    listViews.set('customer', '/view/lists');
    listViews.set('license', '/view/lists');

}