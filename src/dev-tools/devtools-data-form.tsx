const { devTools,JsonInspector}=OrganicUI;
devTools.set('data-form|data inspection',(target,devPort)=>{
    devPort.devElement = <JsonInspector data={target.props.data} >
        </JsonInspector>
});