
/// <reference path="../../dts/globals.d.ts" />
/// <reference path="../../dts/organic-ui.d.ts" />

import { BasicController, IResponseForGetCurrentUser, AuthenticationController } from "./sepid-rest-api";


import { BaseComponent, SubRender, createGenerateClassName, Collapsible, i18n, icon, Utils, DeveloperBar, AdvButton } from '@organic-ui';
const JssProvider: any = OrganicUI.JssProvider;

const generateClassName = createGenerateClassName({
    dangerouslyUseGlobalCSS: true,
    productionPrefix: '',
});
const { Fabric } = OrganicUI.FabricUI;


const { showIcon, classNames } = Utils;
function handleSignOut() {
    localStorage.removeItem('token');
    return Utils.navigate('/view/auth/login');
}
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
export interface IState {
    versionInfo: string;
    currentUser: IResponseForGetCurrentUser;
}
export class DefaultMasterPage extends BaseComponent<any, IState> {
    static versionInfo: string;
    static currentUser: IResponseForGetCurrentUser;
    adjustedHeight: any;
    constructor(p) {
        super(p);

    }
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
        this.state.versionInfo = DefaultMasterPage.versionInfo || BasicController.getVersion().then(versionInfo => this.repatch({ versionInfo })) as any;
        this.state.currentUser = DefaultMasterPage.currentUser || AuthenticationController.getCurrentUserInformation().then(currentUser => this.repatch({ currentUser })) as any;
    }
    componentWillUnmount() {
        clearInterval(this.timerId);
    }
    @SubRender()
    renderVersionInfo(version: string) {
        return [
            <label key='label' >{i18n('app-version')}</label>,
            <span key='ver' className="app-version">{version.split('_').join('.')}</span>]
    }
    @SubRender()
    renderUserInfo(currentUser: IResponseForGetCurrentUser) {
        return currentUser.username;
    }
    render() {

        //    const dialogFunc = OrganicUI.dialogArray[OrganicUI.dialogArray.length - 1];
        const heightForContent = window.innerHeight;
        DefaultMasterPage.versionInfo = this.state.versionInfo;
        DefaultMasterPage.currentUser = this.state.currentUser;
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
                                {this.renderUserInfo(this.state.currentUser)}
                                {Utils.showIcon('fa-user-circle')}
                            </div>
                            <div className="column" style={{ maxWidth: '110px', marginLeft: '10px' }}>
                                <AdvButton onClick={handleSignOut}>
                                    {Utils.showIcon('fa-sign-out')}
                                    {i18n('sign-out')}
                                </AdvButton>
                            </div>

                        </div>
                        <div className="version-container" style={{ width: '100%' }}>
                            {this.renderVersionInfo(this.state.versionInfo)}
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

            <OrganicUI.AppUtils />
        </Fabric>))
    }
}
