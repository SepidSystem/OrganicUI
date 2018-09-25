# Templated View
We have 3 way for module development 

## HOC
```tsx
function statelessView(params){
    return <>
        <Field accessor={binding.name}/>
    </>
}
routeTable('/view/products',templatedView(statelessView)('list-view',{actions,options}));
routeTable('/view/product/:id',templatedView(statelessView)('single-view',{actions,options}));
```
## Method Decorator

```tsx
class View extends BaseComponent<never,never>{ 
    return <>
        <Field accessor={binding.name}/>
    </>
}
routeTable('/view/products',templatedView(statelessView)('list-view',{actions,options}));
routeTable('/view/product/:id',templatedView(statelessView)('single-view',{actions,options}));
```
## Chainful
```tsx
 reinvent('frontend:crud', { options, actions })
    .singleView
    (({ binding }) => <>
        <DataPanel header={i18n("primary-fields")} primary className="medium-fields" >
            <Field accessor={binding.active}  >
                <Switch />
            </Field> <hr />
            <Field accessor={binding.code} required>
                <TextField type="text" />
            </Field>
            <Field accessor={binding.name} required >
                <TextField type="text" />
            </Field>
            <Field accessor={binding.serial} required>
                <TextField type="text" />
            </Field>
            <Field accessor={binding.model} required>
                <ComboBox items={Utils.enumToIdNames(DeviceModels)} />
            </Field>

        </DataPanel>
         
    </>)
    .listView(({ binding }) => (
    <>         
        <Field accessor={binding.name} />
        <Field accessor={binding.code} />
        <Field accessor={binding.serial} />ش
        <Field accessor={binding.model} required>
            <ComboBox items={Utils.enumToIdNames(DeviceModels)} />
        </Field> 
    </>)
    )
    .done({ moduleId: 'devices' }); 

```