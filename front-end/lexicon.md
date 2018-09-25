
# Lexicon
## **Level**
after many years in SPA development, software companies arrive to mature approach  for Modern Web Applications , they split web applications to split two part. in first-part contains complex codes that handle hard works. in next part handle easier works.

### **base(or framework)**
- handle harder works

### **domain (or application)**
- handle easier works
- focus on enjoyable-code,productivity,clean-code,code-conversion  
- specify application entities(DTO) by `interface`
- avoid using any(directly) , specify type in local-variables,parameter
- define modules by `reinvent` 
- consist code for domain modules by template
- follow Functional Programming(70%) & OOP(30%) for developing paradigm
- use english only in source-codes for editor compatibility  
- regard localization , split texts in `resource-file`



## **Mainline**

### **MVT**

MVC is common methodology to application development,The Model-View-Template (MVT) is slightly different from MVC.Template is helper for view component , In `view` you should return VDOM in Fragmented Element .

```tsx
  import {reinvent} from '@reinvent' // chainful   
    reinvent('frontend:blank'). /* Specify Template */
    renderer(
      ()=>(<>Hello World</>)  /* Return View */
    ).
    done({moduleId:'HelloWorldModel'});    /* Done Model (Module) */
```

```tsx
  import {templatedView} from '@reinvent' // OOP * Use Decorator for leverage templating
   class HelloWorldModel extends  React.Component<never,never>{  // Model
    @templetedView('blank')   // Template 
    render(){ // View 
       return <>Hello World</>; // <>=React.Fragment
    }   
  }

```

```tsx
import {templatedView} from '@reinvent' // Stateless Funtional Programming * Use HOC for leverage templating
function HelloWorldModel(){ // View 
    return <>Hello World</>; // <>=React.Fragment
}   
routeTable('/view/hello',templatedView(HelloWorldModel)('blank',{}))   
```

### **reinvent**

reinvent is code-style for developing domain,it try to simpler system elements in domain level, each reinvent module contains elements of system that leverage templates .
- it is not DSL(Domain Specific Language)
- it is chainful library for domain modules definition with FP paradigm. also @decorator for OOP paradigm  
- eaiser to develop ( use Functional-Programming for default approach) 
- carefully overriding (avoid mistyping method identifers ) 
- debugging feature 
- data binding feature with intellisense fields and compile-time error for illegal-binding

**quick-sample**
```tsx
import { DepartmentsController as actions } from "./sepid-rest-api";
import { Field,  IOptionsForCRUD } from '@organic-ui';
import {  DataList, DataPanel, i18n } from '@organic-ui';
const options: IOptionsForCRUD = {
    routeForSingleView: '/view/admin/department/:id',
    routeForListView: '/view/admin/departments',
    pluralName: 'departments', singularName: "department", iconCode: 'fa-sitemap'
};
 reinvent('frontend:crud', { actions, options }).
    singleView(({ binding }) =>
        (<>
            <DataPanel header={i18n("primary-fields")} primary className="medium-fields">
                <Field accessor={binding.id} readonly />
                <Field accessor={binding.name} required />
                <Field accessor={binding.description} />
            </DataPanel>
        </>))
    .listView(({ binding }) =>
        (<>
            <DataList>
                <Field accessor={binding.id} />
                <Field accessor={binding.name} />
            </DataList>
        </>))
    .done({ moduleId: 'departments' });
```

### **Developer Tools**

## Build-Process
we has blazing-fast build-process , it is really amazing for frontend-developers.  
### **webpack**
Webpack is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser, yet it is also capable of transforming, bundling, or packaging just about any resource or asset.
### **webpack.config.js(in domain-level)**

### **bundles**
- vendors.js(prebuilt)
- base.js(prebuilt)
- domain.js
- domain_FA-IR.js
vendors.js & base.js are prebuilt. domain-level developer can get its from framework-level developer.
### **Module Aliasing**
### **i18n**
i18n => internalization(20ch) 


## **Components**
Organic-ui almost is component-set for application(domain) development, it has features for easier binding,helping for single-view,helping for list-view.validation,etc
### **<Field  .../>*,*<DataForm .../>**
### **<DataLookup .../>** 
### **<FilterPanel .../>**

## Insprised Components
### **Material Design Components**
### **FabricUI Components**
### UiKit

## **Templates(Predefined Templates)**
### **single-view**
### **list-view**
### **login-page**
### **dashboard-page**


##  Framework Folders Structure
### **/src/dts**
- declare module '@organic-ui' in organic-ui.d.ts
- declare module '@reinvent' in reinvent.d.ts
- declare React,Organic-UI globally by UMD in globals.d.ts
### **/src/lib/core**

### **/src/lib/box**
- single-view template in 'single-view-box.tsx'
- list-view template in 'single-view-box.tsx'
- 
### **/src/lib/data-lookup**

### **/src/lib/dev-tools**
### **/src/lib/controls**
### **/src/styling**
