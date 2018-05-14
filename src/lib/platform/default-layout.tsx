
/// <reference path="../../core.d.ts" />

const { Fabric } = Core.FabricUI;
const { menuBar, templates, Component, showIconText, icon, route, showIconAndText } = Core;

const { View } = Core;


function GeneralHeader() {
    return <div className="columns" style={{ width: '100%' }}>
        <div className="column is-1">
            lin.project
    </div>
        <div className="column  is-9">
            <Core.FabricUI.SearchBox />
        </div>
        <div className="column is-2">
            {icon('fav-')}
        </div>
    </div>;
}
const root = document.querySelector('#root');
class BaseView extends Component {

    render() {
        const content = this['renderContent'] instanceof Function && this['renderContent']();
        const viewClass = (route(location.pathname, {}) || View) as typeof View;

        const dialogFunc = Core.dialogArray[Core.dialogArray.length - 1];
        const heightForContent = window.innerHeight - 100;
        return ((<Fabric className="master-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

            <header className="hero is-light cover-section" style={{ height: '40px' }}>
                <div className="hero-head">
                    <div className="container " style={{ display: "flex" }}>

                        <GeneralHeader />

                    </div>
                </div>
            </header>
            <section className="view container main-container" dir='rtl' style={{ textAlign: 'right', flex: '1' }} >


                <div className="extra-section">
                </div>

                <section style={{ padding: '5px', maxHeight: heightForContent + 'px', minHeight: heightForContent + 'px', overflow: 'hidden' }}>
                    {content}
                    {!(this['renderContent'] instanceof Function) && (this.props.children || 'renderContent Not Found')}
                </section>
                <div className="container" style={{ visibility: 'hidden', maxHeight: '2px' }}>
                    <div className=" " style={{ display: "flex", justifyContent: "space-around", alignItems: 'center' }}>
                        {Object.keys(Core.menuBar.data).map(key => (
                            <a href={Core.menuBar.data[key]}
                                className={` nav column ${location.pathname.startsWith(Core.menuBar.data[key]) ? 'is-active' : ''}`}
                            >
                                {showIconAndText(key)}
                            </a>))}
                    </div>
                </div>
            </section>
            <footer className="hero is-white footer-section" style={{ height: '60px', maxHeight: '60px', minHeight: '60px' }}>
                <div className="container">
                    <div className=" " style={{ display: "flex", justifyContent: "space-around" }}>
                        {Object.keys(Core.menuBar.data).map(key => (
                            <a href={(Core.menuBar(key)) as string}
                                className={` nav column ${location.pathname.startsWith((Core.menuBar(key) as string)) ? 'is-active' : ''}`}
                            >
                                {showIconAndText(key)}
                            </a>))}
                    </div>
                </div>


            </footer>
            {dialogFunc && <div className="modal is-active">
                <div className="modal-background"></div>
                <div className="modal-content">

                </div>}
  <button className="modal-close is-large" aria-label="close"></button>
            </div>}
        </Fabric>))
    }
}
templates.set('base', BaseView as any);
