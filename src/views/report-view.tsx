/// <reference path="../organicUI.d.ts" />   
module ReportView {
    const { ActionManager, View, routeTable, i18n, icon, showIconAndText, showIconText } = OrganicUI;
    const { Panel } = OrganicUI.UiKit;
    const Card = (p) => p.children;
    class API extends ActionManager {
        getFolder(id: number): any {
            return this.refetch('GET', `/api/folder/${id}`);
        }
        getFolders() {
            return this.refetch('GET', "/api/folder");
        }
        getPapers(folderId) {
            return this.refetch('GET', `/api/paper?folderId=${folderId}`);
        }
    }
    class ReportView extends View<any, API> {
        static Template = 'base';
        state: {
            folders: any[];
            papers: any[];
            paperTypes: { [key: string]: true }
            selectedFolder: any;
        }
        renderContent() {
            const { repatch } = this;
            const s = this.state;
            const folderId = +this.props.id;
            this.api = this.api || new API();
            const { api } = this;
            return <section className="">
                <br />
                <div className="columns is-tablet">

                    <div className="column is-4 is-hidden-mobile">
                        <Panel blocks={Array.from({ length: 10 }, (_, idx) => 'sdgfsdf' + idx)} header="available-reports" hasSearch={true}
                            actions={['hsdf']} selectedBlock={0}
                        >
                        </Panel>
                    </div>
                    <div className="column">


                        <Card header={showIconText('report-filter')} actions={['dfg']}>
                            <br /><br /><br />
                        </Card> </div>
                </div>

                <div className="columns is-tablet">

                    <div className="column is-4">
                        <Panel blocks={['sdgfsdf']} header="report-options" selectedBlock={0} >
                        </Panel>
                    </div>
                    <div className="column">
                        <Card header={showIconText('desired-report')} actions={['dfg']}>
                            <br /><br /><br />
                        </Card> </div>
                </div>
                <div className="buttons is-centered" >

                    <button className="button is-primary">{showIconText('take-report')}</button>
                </div>


            </section>;
        }
    }
    routeTable.set('/view/report', ReportView);
    routeTable.set('/view/report/:name', ReportView);
    routeTable.set('/view/reports', ReportView);
}