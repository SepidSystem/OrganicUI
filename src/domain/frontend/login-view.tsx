
import { masterPage } from './master-page-minimal';
import { AuthenticationController, IResponseForLogin } from './sepid-rest-api';
import { ViewBox, routeTable, i18n, Utils, BaseComponent, i18nAttr } from '@organic-ui';

interface IState {
    flipperHeight: number;
    serverResponse: IResponseForLogin;
    failModeMessage: any;
}
class loginView extends BaseComponent<any, IState>{
    static defaultProperties = {
        message: 'login-fail-message'
    }

    refs: {
        root: HTMLElement;
        back: HTMLElement;
        front: HTMLElement;
        userNameInput: HTMLInputElement;
        passwordInput: HTMLInputElement;
    }
    handleSignIn() {
        const { userNameInput, passwordInput } = this.refs;
        const username = userNameInput.value;
        const password = passwordInput.value;

        return AuthenticationController.login({ username, password })
            .then(serverResponse => this.repatch({ serverResponse }));
    }
    componentDidMount() {
        const { back, front } = this.refs;
        const flipperHeight = Math.max(back.clientHeight, front.clientHeight);
        this.repatch({ flipperHeight });
    }
    componentWillMount() {
        this.state.serverResponse = !!this.props.message && { message: this.props.message, success: false } as IResponseForLogin;
    }
    render() {
        const { serverResponse } = this.state;
              return <ViewBox options={{ className: 'login-box content col-lg-4 col-md-6 col-10' }} params={this.props} actions={{}}>
            <div ref="root" className={Utils.classNames("flip-container", this.state.serverResponse && "applied")}>
                <div className="flipper" style={{ minHeight: this.state.flipperHeight || null }}>
                    <div ref="front" className="front">
                        <header className=" login-header">
                            {Utils.showIcon('fa-sign-in')}
                            <div className="title is-3">
                                {i18n('productName')}
                            </div>
                        </header>
                        <div className="field">
                            <div className="control">
                                <input ref="userNameInput" className="input is-primary" type="text" placeholder={i18nAttr('user-name')} />
                            </div>
                        </div>
                        <div className="field">
                            <div className="control">
                                <input ref="passwordInput" className="input is-primary" type="password" placeholder={i18nAttr('password')} />
                            </div>
                        </div>
                        <footer>
                            <button onClick={this.handleSignIn.bind(this)} className="button is-primary">{i18n('sign-in')}</button>
                        </footer>

                    </div>
                    <div ref="back" className="back">
                        {serverResponse && serverResponse.success && <section className="success-mode">
                            <h2 className="center title is-1" style={{ fontSize:'100px'}}>✔</h2>
                            <div className="center  title is-3"  style={{ fontSize:'20px'}}>
                                {i18n('login-redirect')}
                            </div>
                        </section>}
                        {serverResponse && serverResponse.success === false && <section className="fail-mode">
                            <h2 className="title is-2  center" style={{ fontSize: '40px' }}>
                                <i className="fa fa-lock" style={{ fontSize: '40px' }}></i>
                            </h2>


                            <div className="center">
                                {i18n(serverResponse.message || this.props.message || loginView.defaultProperties.message)}
                            </div>
                            <br /> <br />
                            <button className="button  "
                                onClick={() => this.repatch({ serverResponse: null })} type="submit">
                                {i18n('login-retry')}</button>

                        </section>}
                    </div>
                </div>
            </div>
        </ViewBox >
    }
}
Object.assign(loginView, { masterPage });
routeTable.set('/view/auth/login', loginView);
routeTable.set('/view/auth/login/:a', loginView);
