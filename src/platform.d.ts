import * as PlatfromMod from './platform';
declare global {
    export const Platform: typeof PlatfromMod;
    export interface IViewsForCRUD<TDTO> extends ICRUDActionsForSingleView<TDTO> {
        renderSingleView(formData: TDTO): React.ReactElement<any>;
        renderListView(): React.ReactElement<any>;
        //getDataListHeight? (): number;
        getUrlForSingleView?(id?): string;
        getUrlForListView?(): string;

    }
    export interface ICRUDAction {
        actionName: string;
        onExecute: Function;
    }
    interface IActionsForCRUD<TDto> {
        handleCreate: (dto: TDto) => Promise<any>;
        handleUpdate: (id: any, dto: TDto) => Promise<any>;
        handleDelete: (id: any) => Promise<any>;
        handleRead: (id: any) => Promise<TDto>;
        handleLoadData: (params) => PromisedResultSet<TDto>;
        getDefaultValues?: () => TDto;
        getUrlForSingleView?(id:string):string;
    }
}
