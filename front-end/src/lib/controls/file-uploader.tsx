import { BaseComponent } from "../core/base-component";
import { SelfBind } from "../core/decorators";
import { AdvButton } from "../controls/adv-button";
import { i18n } from "../core/shared-vars";
import { Utils } from "../core/utils";
import { AppUtils } from "../core/app-utils";
import { TextField } from "./inspired-components";
import { TextFieldProps } from "@material-ui/core/TextField";

interface IState {
    value: string;
    isOpening: boolean;
    height: number;
    browseButtonText: string;
}
export class FileUploader extends BaseComponent<Partial< TextFieldProps>, IState>{
    refs: {
        file: HTMLInputElement;
    }

    @SelfBind()
    async fileChange(files: FileList) {
        if (files.length == 0) return;
        const [file] = Array.from(files);
        const value = await Utils.fileToBase64(file); 
        this.props.onChange instanceof Function && this.props.onChange(value as any);
    }

    componentDidMount() {

        const { file } = this.refs;
        if (!file) console.log('  file element not fonud');
        file.onchange = () => this.fileChange(file.files);


    }
    renderContent() {
        return <>
            <TextField {...this.props as any} type="file" inputRef="file" />
        </>


    }


}