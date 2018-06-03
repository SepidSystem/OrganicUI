
/// <reference path="../organicUI.d.ts" />

const { Fabric } = OrganicUI.FabricUI;
const { menuBar, templates, Component, icon, route, Utils } = OrganicUI;
import Collapsible from 'react-collapsible';

const { View, DeveloperBar } = OrganicUI;


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
const showIcon = (icon: string) => !!icon && <i className={Utils.classNames("icon", icon.split('-')[0], icon)} />;
class BaseView extends Component {

    render() {

        //    const dialogFunc = OrganicUI.dialogArray[OrganicUI.dialogArray.length - 1];
        const heightForContent = window.innerHeight;

        const menuItems = OrganicUI.appData.appModel.getMenuItems().map(({ menu }) => menu);
        const selectedMenuItem = menuItems.filter(mi => location.pathname.startsWith(mi.routerLink))[0];
        console.log({ selectedMenuItem });
        return ((<Fabric className="master-page">

            {/*<header className="hero is-light cover-section" style={{ height: '40px' }}>
                <div className="hero-head">
                    <div className="container " style={{ display: "flex" }}>

                        <GeneralHeader />

                    </div>
                </div>
    </header>*/}
            <aside>
                {menuItems.filter(m => !m.parentId).map(m => (
                    m.routerLink ?
                        <div className={Utils.classNames("router", !!selectedMenuItem && selectedMenuItem.id == m.id && 'active')}>
                            {showIcon(m.icon)}{' '}
                            <a href={m.routerLink}>{m.title}

                            </a>
                            <span className="triangle"></span>
                        </div> :

                        <Collapsible overflowWhenOpen="visible" open={!!selectedMenuItem &&
                            ((selectedMenuItem.parentId == m.id))} trigger={[ showIcon(m.icon), m.title]} >


                            <ul>
                                {menuItems.filter(childMenu => childMenu.parentId === m.id).map(m =>
                                    <li className={Utils.classNames("router", !!selectedMenuItem && selectedMenuItem.id == m.id && 'active')}>
                                        {showIcon(m.icon)}{' '}
                                        <a href={m.routerLink}>
                                            {m.title}

                                        </a> <span className="triangle"></span></li>
                                )}

                            </ul>
                        </Collapsible>))}
            </aside>
            <main className="view   main-container" dir='rtl' style={{ textAlign: 'right', flex: '1' }} >


                <div className="extra-section">
                </div>

                <section style={{ padding: '5px' }}>
                    <DeveloperBar />
                    {this.props.children}
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
