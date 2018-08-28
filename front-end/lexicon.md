
# Lexicon
## **Level**
after many years in SPA development, software companies arrive to mature approach  for Modern Web Applications , they split web applications to split two part. in first-part contains complex codes that handle hard works. in next part handle easier works.

### **base(or framework)**
- handle harder works

### **domain (or application)**
- handle easier works
- specify application entities(DTO) by `interface`
- define modules by `reinvent` 
- consist code for domain modules by template
- follow Functional Programming(70%) & OOP(30%) for developing paradigm
- use english only in source-codes for editor compatibility  
- regard localization , split texts in `resource-file`



## **Mainline**

### **MVT**

MVC is common methodology to application development,The Model-View-Template (MVT) is slightly different from MVC.Template is helper for view component , In `view` you should return VDOM in Fragmented Element .

```tsx
  import {templatedView} from '@reinvent'
   class HelloWorldModel extends  React.Component<never,never>{  // Model
    @templetedView('blank')   // Template 
    render(){ // View 
       return <>Hello World</>; // <>=React.Fragment
    }   
  }
```
```tsx
  import {reinvent} from '@reinvent'
  reinvent('frontend:blank'). /* Specify Template */
    renderer(
      ()=>(<>Hello World</>)  /* Return View */
    ).
    done({moduleId:'HelloWorldModel'});    /* Done Model (Module) */
```
### **reinvent**

reinvent is code-style for developing domain,reinvent is not DSL,it try to simpler system elements in domain level, each reinvent module contains elements of system that leverage templates 
- Eaiser to develop ( use Functional for default appox)
- carefully overriding (avoid mistyping method identifers ) 
- Debugging Feature 
- Data Binding Feature with Intellisense Fields  and compile-time error for illegal-binding
- 

### **Developer Tools**
## Build-Process
we has blazing-fast build-process , it is really amazing for frontend-developers.  
### **webpack**

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
### **/src/lib/core**
### **/src/lib/box**
### **/src/lib/data-lookup**
### **/src/lib/dev-tools**
### **/src/lib/controls**

