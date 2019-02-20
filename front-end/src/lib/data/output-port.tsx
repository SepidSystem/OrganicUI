

import { BaseComponent } from "../core/base-component";
import { AdvButton } from "../controls/adv-button";
import { Field } from "./field";
import { DataForm } from "./data-form";

export class Port extends BaseComponent<OrganicUi.PortProps, any> {
    logs = []
    mergedData = {}
    static data = {}
    showOutput(obj) {
        this.logs.push(obj);
        Object.assign(this.mergedData, obj);
    }
    showHeader() {
        return <>

            <AdvButton iconName="fa-plus" />
        </>
    }
    showFormMode() {
        return <DataForm data={Port.data[this.props.id]}>

        </DataForm>
    }
    showLogs() {
        return <section className="logs">
            {this.logs.slice(this.logs.length - 6, this.logs.length)
                .reverse().map(obj => React.createElement(ReactJsonSyntaxHighlighter, { obj }))}
        </section>
    }
    render() {
        const { children } = this.props;
        const isFormMode = !!children && React.Children.toArray(children).filter(c => c && c.type == Field).length > 0;
        return <article className="output-port" data-id={this.props.id}>
            <header dir="ltr">
                {this.showHeader()}
            </header>
            {isFormMode ? this.showFormMode() : this.showLogs()}
        </article>

    }
}
const ReactJsonSyntaxHighlighter = ({ obj, ...divProps }) => {
    if (Object.keys(obj).length === 0) {
        return null
    }

    let json = JSON.stringify(obj)
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const __html = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
        (match) => {
            let classAttr = 'number'
            if (/^"/.test(match)) {
                classAttr = (/:$/.test(match)) ? 'key' : 'string';
            } else if (/true|false/.test(match)) {
                classAttr = 'boolean'
            } else if (/null/.test(match)) {
                classAttr = 'null'
            }
            return `<span class='${classAttr}'>${match}</span>`
        })

    return (
        <div className="ReactJsonSyntaxHighlighter" {...divProps}>
            <pre dangerouslySetInnerHTML={{ __html }} />
        </div>
    )
}