# BaseComponent
All Components of this framework de 
## repatch(delta)
this method for update state . Properties of `state` will be overwritten by properties in the delta if they have the same key.  Later `delta` properties will similarly overwrite earlier ones. after chaging state `forceUpdate` called.
Calling `forceUpdate()` will cause `render()` to be called on the component.

## how to inherit from `BaseComponent`
```tsx
export class TimeEdit extends BaseComponent<IProps, IState>{
    renderContent(){
        /// return vdom
        return <input  />
    }
}
```
### renderContent

The `renderContent()` method is the only required method in a class component.
When called, it should examine this.props and this.state and return one of the following types:

- React elements. Typically created via JSX. For example, <div /> and <MyComponent /> are React elements that instruct React to render a DOM node, or another user-defined component, respectively.
- Arrays and fragments. Let you return multiple elements from render. See the documentation on fragments for more details.
- Portals. Let you render children into a different DOM subtree. See the documentation on portals for more details.
String and numbers. These are rendered as text nodes in the DOM.
- Booleans or null. Render nothing. (Mostly exists to support return test && <Child /> pattern, where test is boolean.)
The render() function should be pure, meaning that it does not modify component state, it returns the same result each time it’s invoked, and it does not directly interact with the browser.

If you need to interact with the browser, perform your work in componentDidMount() or the other lifecycle methods instead. Keeping renderContent() pure makes components easier to think about.

#### BaseComponent vs React.Component

BaseComponent extends React.