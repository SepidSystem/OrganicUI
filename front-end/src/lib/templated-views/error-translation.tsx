import { i18n } from "../core/shared-vars";
import { Utils,changeCase } from "../core/utils";

interface IErrorTranslateService<T> {
    check(item: T): boolean;
    translate(item: T): string;
}
export interface IErrorItem {
    message: string;
    argument: string;

}
export const errorTranslationServices: IErrorTranslateService<IErrorItem>[] = [
    {
        check({ message, argument }) {
            //requires property "productName"
            return  !!argument && ['requires', 'property', argument].every(phr => message.includes(phr));
        },
        translate({argument}){
            return Utils.i18nFormat('field-required-fmt', changeCase.paramCase(  argument));
        }
    }
];
