export interface IStateListener { target: string, onChange: Function };
export function StateListener(p: IStateListener) {

    return (<span style={{ display: "none" }} data-target={p.target} >

    </span>);
}
