### MVT

MVC is so common methodology to application development,The Model-View-Template (MVT) is slightly different from MVC.Template is helper for view component , in View(React-Component) Classes you should return VDOM in Fragmented Element   

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
### reinvent

reinvent is code-style for developing domain,reinvent is not DSL,it try to simpler system elements in domain level, each reinvent module contains elements of system that leverage templates 
- Eaiser to develop ( use Functional for default appox)
- Simple Overriding 
-  


### Developer Tools


### DataForm

### Field


### DataLookup

### UiKit

### i18n
i18n => internalization(20ch) 

## Lib Folder Structure

### core Folder
### box Folder
### data-lookup Folder
### dev-tools Folder
### controls Folder
 