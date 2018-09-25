
import { masterPage } from './master-page-minimal';
import { reinvent } from '../reinvent/reinvent';
import { Utils } from '../core/utils';
import { BaseComponent } from '../core/base-component';
import { i18n, i18nAttr } from '../core/shared-vars';
export interface IResponseForLogin {
    success: boolean;
    message: string;
    token: string;
}
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

        return this.props.actions.login({ username, password })
            .then(serverResponse => this.repatch({ serverResponse }));
    }
    componentDidMount() {
        const { back, front } = this.refs;
        if (back && front) {
            const flipperHeight = Math.max(back.clientHeight, front.clientHeight);
            this.repatch({ flipperHeight });
        }
    }
    componentWillMount() {
        this.state.serverResponse = !!this.props.message && { message: this.props.message, success: false } as IResponseForLogin;
    }
    render() {
        const { serverResponse } = this.state;
        return <section className="login-box content col-lg-4 col-md-6 col-10" style={{ minWidth: '400px' }}>
            <div ref="root" className={Utils.classNames("flip-container", this.state.serverResponse && "applied")}>
                <div className="flipper" style={{ minHeight: this.state.flipperHeight || null }}>
                    <div ref="front" className="front">
                        <header className=" login-header">
                            {Utils.showIcon('fa-sign-in')}
                            <div className="title is-3">
                                {i18n('productName')}
                            </div>
                        </header>
                        <div className="field user-name">
                            <div className="control">
                                <input ref="userNameInput" className="input is-primary" type="text" placeholder={i18nAttr('user-name')} />
                            </div>
                        </div>
                        <div className="field password  ">
                            <div className="control">
                                <input ref="passwordInput" className="input is-primary" type="password" placeholder={i18nAttr('password')} />
                            </div>
                        </div>
                        <footer>
                            <button onClick={this.handleSignIn.bind(this)} className="button is-primary">{i18n('sign-in')}</button>
                        </footer>

                    </div>
                    <div ref="back" className="back">
                        {serverResponse && serverResponse.success && <section className="success-mode"
                            style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}
                        >
                            <h2 className="center title is-1" style={{ fontSize: '100px', marginTop: '30px' }}>✔</h2>
                            <div className="center  title is-3" style={{ fontSize: '20px' }}>
                                {i18n('login-redirect')}
                            </div>
                        </section>}
                        {serverResponse && serverResponse.success === false && <section className="fail-mode">
                            <h2 className="title is-2  center" style={{ fontSize: '40px', marginTop: '30px' }}>
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
        </section>
    }
}

reinvent.templates['login'] = loginView;
reinvent.templates['login_resultFilter'] = func => Object.assign(func, { masterPage });