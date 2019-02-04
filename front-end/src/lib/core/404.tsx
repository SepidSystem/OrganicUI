
import { routeTable } from "./router";
import { i18n } from "./shared-vars";

export class NotFoundView extends React.Component<any, any> {
    renderForRootPage() {
        return <div className="card-content">
            <div className="content" dir="rtl">
                <div className="title is-2">
                    {i18n`please-wait`}
                </div><br />
            </div>
        </div>
    }
    render() {
        console.log(Object.keys(routeTable.data));
        const isRootPage = location.pathname == "/";
        return <div className="card animated fadeIn" dir="rtl" style={{ textAlign: "left", animationDelay: '0.6s' }}>
            <header className="card-header" style={{ display: 'flex', justifyContent: 'center', justifyItems: 'center' }}>
                <p className="card-header-title" style={{ fontSize: '3rem' }}>
                    {i18n`logo-text`}
                </p>

            </header>
            {isRootPage && this.renderForRootPage()}
            {!isRootPage && <div className="card-content">
                <div className="content" dir="ltr">
                    <div className="title is-2">
                        This page is not defined
                </div><br />
                <div className="title is-2">
                    Your Address:
                        <code>{location.pathname}</code>
                    </div>

                </div>
            </div>}

        </div>


    }
}