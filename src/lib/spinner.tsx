export function Spinner(p: { title?: any }) {
    return <div className="loading-element  spinner is-vcentered">
        <span className=" is-text   button is-loading" style={{ padding: "0", width: "100%" }}></span>
        <div className="column">{p.title}</div>
    </div>
}