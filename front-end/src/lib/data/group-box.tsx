import { BaseComponent } from "../core/base-component";
export class GroupBox extends BaseComponent<OrganicUi.IGroupBoxProps, IState>{
    static modes: { [key: string]: any }
    renderContent() {

    }
}
const GroupBoxSingle = {

}
const GroupBoxList = {

}
Object.assign(GroupBox, { modes: { single: GroupBoxSingle, list: GroupBoxList } })
interface IState {

}
