
/// <reference path="../../organicUI.d.ts" />
const { JssProvider, createGenerateClassName, MenuIcon, Collapsible, i18n } = OrganicUI;




const { AppBar, IconButton, Toolbar } = OrganicUI;
const generateClassName = createGenerateClassName({
    dangerouslyUseGlobalCSS: true,
    productionPrefix: '',
});
const { Fabric } = OrganicUI.FabricUI;
const { menuBar, templates, Component, icon, route, Utils } = OrganicUI;

const { DeveloperBar } = OrganicUI;
const { showIcon, classNames } = Utils;

function GeneralHeader() {
    return <div className="columns" style={{ width: '100%' }}>
        <div className="column is-1">
            lin.project
    </div>
        <div className="column  is-9">
            <OrganicUI.FabricUI.SearchBox />
        </div>
        <div className="column is-2">
            {icon('fav-')}
        </div>
    </div>;
}
const root = document.querySelector('#root');
class BaseView extends Component {
    adjustedHeight: any;
    adjustSide() {
        const { mainContainer } = this.refs;
        if (!mainContainer) return;
        if (this.adjustedHeight == mainContainer.clientHeight) return;
        this.adjustedHeight = mainContainer.clientHeight;
        this.forceUpdate();
    }
    refs: {
        mainContainer: HTMLElement;
    }
    timerId: any;
    componentWillMount() {
        this.timerId = setInterval(this.adjustSide.bind(this), 300);
    }
    componentWillUnmount() {
        clearInterval(this.timerId);
    }
    render() {

        //    const dialogFunc = OrganicUI.dialogArray[OrganicUI.dialogArray.length - 1];
        const heightForContent = window.innerHeight;

        const menuItems = OrganicUI.appData.appModel.getMenuItems().map(({ menu }) => menu);
        const selectedMenuItem = menuItems.filter(mi => location.pathname.startsWith(mi.routerLink))[0];
        return ((<Fabric className="master-page">

            {/*<header className="hero is-light cover-section" style={{ height: '40px' }}>
                <div className="hero-head">
                    <div className="container " style={{ display: "flex" }}>

                        <GeneralHeader />

                    </div>
                </div>
    </header>*/}
            <JssProvider generateClassName={generateClassName}>
                <aside key="aside" style={{ minHeight: this.adjustedHeight ? `${this.adjustedHeight}px` : 'auto', transform: 'all' }}>
                    <header>
                        <a className="logo" >
                            <span className="start">سپید </span><span className="ng">استار</span>
                        </a>
                        <div className="columns">
                            <div className="column user-info">
                                {i18n('user-title')}
                                {Utils.showIcon('fa-user-circle')}
                            </div>
                            <div className="column" style={{ maxWidth: '110px',marginLeft:'10px' }}>
                                <MaterialUI.Button >
                                    {Utils.showIcon('fa-sign-out')}
                                    {i18n('sign-out')}
                                </MaterialUI.Button>
                            </div>
                        </div>
                    </header>
                    {menuItems.filter((m, idx) => !m.parentId).map((m, idx) => (
                        m.routerLink ?
                            <div key={"router" + idx} className={classNames("router", !!selectedMenuItem && selectedMenuItem.id == m.id && 'active')}>
                                {showIcon(m.icon)}{' '}
                                <a className="nav" href={m.routerLink}>{m.title}

                                </a>
                                <span className="triangle"></span>
                            </div> :

                            <Collapsible key={"router" + idx} overflowWhenOpen="visible" open={!!selectedMenuItem &&
                                ((selectedMenuItem.parentId == m.id))} trigger={[showIcon(m.icon), m.title] as any}  >


                                <ul>
                                    {menuItems.filter(childMenu => childMenu.parentId === m.id).map(m =>
                                        <li key={m.routerLink} className={classNames("router", !!selectedMenuItem && selectedMenuItem.id == m.id && 'active')}>
                                            {showIcon(m.icon)}{' '}
                                            <a className="nav" href={m.routerLink}>
                                                {m.title}

                                            </a> <span className="triangle"></span></li>
                                    )}

                                </ul>
                            </Collapsible>))}
                </aside>
            </JssProvider>
            <main className="view   main-container" ref="mainContainer" dir='rtl' style={{ textAlign: 'right', flex: '1' }} >


                <div className="extra-section">
                </div>

                <section style={{ padding: '5px' }}>
                    <DeveloperBar />
                    <JssProvider generateClassName={generateClassName}>
                        {this.props.children}
                    </JssProvider>
                </section>
                <div className="container" style={{ visibility: 'hidden', maxHeight: '2px' }}>
                    <div className=" " style={{ display: "flex", justifyContent: "space-around", alignItems: 'center' }}>
                        {Object.keys(OrganicUI.menuBar.data).map(key => (
                            <a href={OrganicUI.menuBar.data[key]}
                                className={` nav column ${location.pathname.startsWith(OrganicUI.menuBar.data[key]) ? 'is-active' : ''}`}
                            >
                                {Utils.showIconAndText(key)}
                            </a>))}
                    </div>
                </div>
            </main>
            {/*    <footer className="hero is-white footer-section" style={{ height: '60px', maxHeight: '60px', minHeight: '60px' }}>
                <div className="container">
                    <div className=" " style={{ display: "flex", justifyContent: "space-around" }}>
                        {Object.keys(OrganicUI.menuBar.data).map(key => (
                            <a href={(OrganicUI.menuBar(key)) as string}
                                className={` nav column ${location.pathname.startsWith((OrganicUI.menuBar(key) as string)) ? 'is-active' : ''}`}
                            >
                                {Utils.showIconAndText(key)}
                            </a>))}
                    </div>
                </div>
                        

            </footer>*/}


        </Fabric>))
    }
}
templates.set('default', BaseView as any);
