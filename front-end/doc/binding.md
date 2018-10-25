# Binding 
یکی از موضوعات اصلی برنامه نویسی کلاینت اتصال داده به المان های بصری می باشد این موضوع می تواند در هر فریم فرک ورک متفاوت می باشد 

در زیر مثال های از فریم ورک های مختلف آماده است

- Angular:ngModel
```html
 <input [(ngModel)]="message" #ctrl="ngModel" required>
```
- React: Manual Binding(data-flow by code),redux-form
```tsx
<input defaultValue={state.message} onChange={e=>this.setState({ ...this.state,message:e.target.value}}>
```
- VueJS
```html
<input v-model="message" placeholder="edit me">
```

همان طور می بینید اتصال داده به المان های ورودی به صورت دوطرفه در فریم ورک ریعکت نیاز به کدنویسی  بیشتر دارد و درواقع این فریم ورک هیچ امکان ویژه برای این موضوع ب شما نمی دهد البته ما از فریم ورک ریعکت استفاده کرده ایم ولی موضوع اتصال به المان های ورودی را حل کرده ایم ، این موضوع به حدی خوب ساپورت داده شده ک علاوه بر سهولت امکانات بهتر نسبت سایر فریم ورک ها دارا می باشد . از جمله برنامه در مسیر تعریف  اینترفیس قرار می دهد تا پیاده سازی دامین  قانونمند تر و منظم تر باشد

نمونه کد برای اتصال به المان ورودی 
```tsx
interface DepartmentDTO{
    name:string;
}
const bindingSource=openBindingSource<DepartmentDTO>();
function View(){
    return <Field accessor={bindingSource.name}>
<input type="text">
    </Field>
}
```
ما از مزیت های زیر برای جلوگیری از اتصال غلط و خطادهی مناسب  کرده ایم
- Generic Type 
- Advanced Types in Typescript
- ES6 Proxy

اتصال داده به المان ها باید 
- Type Declaration  برای Intellisense , خطایابی
- ES6 Proxy Feature برای Runtime metadata => استخراج نام فیلد ها و 