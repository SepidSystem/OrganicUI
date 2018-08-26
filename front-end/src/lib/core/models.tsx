export class Menu implements OrganicUi.IMenu {
    selectionLink: string;
    constructor(public id: number,
        public title: string,
        public routerLink: string,
        public href: string,
        public icon: string,
        public target: string,
        public hasSubMenu: boolean,
        public parentId: number) {

        this.selectionLink = routerLink && routerLink.endsWith('s') ? routerLink.substring(0, routerLink.length - 1) : routerLink;
    }
}
