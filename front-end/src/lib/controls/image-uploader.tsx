import { BaseComponent } from "../core/base-component";
import { SelfBind } from "../core/decorators";
import { AdvButton } from "../core/ui-elements";
import { i18n } from "../core/shared-vars";
import { Utils } from "../core/utils";
import { AppUtils } from "../core/app-utils";

interface IState {
    value: string;
    isOpening: boolean;
    height: number;
    browseButtonText:string;
}
export class ImageUploader extends BaseComponent<OrganicUi.ImageUploaderProps, IState>{
    refs: {
        file: HTMLInputElement;
    }
    static checkImageType(image: File): boolean {
        return (!!image.type.match('image.*'));
    }
    async fileChange(files: FileList) {
        if (files.length == 0) return;
        const [file] = Array.from(files);
        if (!ImageUploader.checkImageType(file)) return;
        const value = await Utils.fileToBase64(file);
        await this.repatch({ value, isOpening: false });
        this.props.onChange instanceof Function && this.props.onChange(value);
    }
    @SelfBind()
    async handleButtonClick() {
        await this.repatch({ isOpening: true });
        const { file } = this.refs;
        if (!file) throw '  file element not fonud';
        file.onchange = () => this.fileChange(file.files);
        file.click();

    }
    renderContent() {
        this.defaultState(this.props);
        const { value, isOpening, height,browseButtonText } = this.state;
         return <div className="image-uploader" style={{ minHeight: height + 'px', display: 'flex', flexDirection: 'column' }}>
            {!!isOpening && <form style={{ maxHeight: '3px', visibility: 'hidden', maxWidth: '3px' }}>
                <input type="file" ref="file"></input>
            </form>}
            <img src={value || this.props.value} onClick={this.handleImageClick} style={{ flex: 1 }} />
            <AdvButton onClick={this.handleButtonClick} fullWidth >{i18n(browseButtonText)}</AdvButton>
        </div>
    }
    @SelfBind()
    handleImageClick() {
        const { value } = this.state;
        if (value)
            AppUtils.showDialog(<img src={this.state.value} onClick={AppUtils.closeDialog} style={{ width: 'auto', height: 'auto', maxWidth: 800, maxHeight: document.body.clientHeight * 0.8 }} />)
        else this.handleButtonClick();
    }
    static defaultProps = {
        height: 140
    }
}