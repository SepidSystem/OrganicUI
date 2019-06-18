/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from "./shared-vars";
import format = require('string-template');
import { diff } from 'rus-diff';
import md5 = require('md5');
import textContent = require('react-addons-text-content');
import * as CodeImage from './code-tags-check.svg';
import {v4} from 'uuid';
 
let devPortIdCounter = 0;
interface IEnumToArrayOptions { customCaptions?: Object }
import { CoreUtils } from './core-utils';
function fixDataBySchema(data, schema) {
	const { properties } = schema;
	if (data instanceof Array) return data.map(item => fixDataBySchema(item, schema));
	if (properties && typeof data == 'object') {
		const result = JSON.parse(JSON.stringify(data));
		Object.keys(data).map(key => ([key, data[key]])).map(([propName, propValue]) => {
			const type = properties && properties[propName] && properties[propName].type;
			if (type == 'number' && typeof propValue == 'string' && /^[0-9]+$/.test(propValue.toString()))
				result[propName] = +propValue

			if (type == 'object') {
				const subSchema = properties && properties[propName] && properties[propName].properties;
				result[propName] = fixDataBySchema(data, subSchema);
			}
			if (type == 'array') {
				const subSchema = properties && properties[propName] && properties[propName].items;
				result[propName] = fixDataBySchema(propValue, subSchema);
			}

		});
		return result;
	}
	return data;
}
export const Utils = Object.assign({}, {
	fixDataBySchema,
	lastNavigate: +new Date(),
	soFastNavigateCount: 0,
	uuid:v4,
	classNames(...args: string[]): string {
		return args.filter(x => x).join(' ');
	},
	coalesce(...args: any[]): any {
		return args.filter(x => x)[0];
	},
	async navigate(url) {
		try {


			const now = +new Date();
			Utils.soFastNavigateCount = (now - Utils.lastNavigate <= 800) ? Utils.soFastNavigateCount + 1 : 0;
			Utils.lastNavigate = now;
			if (Utils.soFastNavigateCount > 3) {
				if (confirm('Are You Debug ,Yes=>Debugger,No=>Supress Checker ')) debugger
				else Utils.soFastNavigateCount = -1000000000;
			}
			if (url && url.includes('/view/'))
				history.pushState(null, null, url);
			else {
			 	location.href = url;
				return;
			}
			OrganicUI['mountViewToRoot']();
			scrollToTop(300);
			return Promise.resolve(true);
		} catch (reason) {
			console.log('reason>>>', reason);
		}
	},
	debounce(func, wait, immediate?) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			var later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	},
	makeWritable(root: HTMLElement) {
		if (!root) return;

		Array.from(root.querySelectorAll('*'))
			.filter(node => node.nodeType == Node.ELEMENT_NODE)
			.forEach((element: HTMLElement) => {
				// restore orignal attributes 
				['tabindex', 'readonly'].
					forEach(attrName => {
						const orginalOfAttrValue = element.getAttribute(`data-org-${attrName}`);

						if (orginalOfAttrValue)
							element.setAttribute(attrName, orginalOfAttrValue);
						else element.removeAttribute(attrName);
						element.removeAttribute(`data-org-${attrName}`); 1111
					});
				element.classList && element.classList.remove('readonly-mode');
				element.hasAttribute('data-org-readonly-mode') && element.classList.add('readonly-mode');
				element.removeAttribute('data-org-readonly-mode');
			});

	},
	makeReadonly(root: HTMLElement) {
		if (!root) return;

		Array.from(root.querySelectorAll('*'))
			.filter(node => node.nodeType == Node.ELEMENT_NODE)
			.forEach((element: HTMLElement) => {
				// store orignal attributes 
				['tabindex', 'readonly'].
					forEach(attrName => {
						const attrValue = element.getAttribute(attrName);
						attrValue && element.setAttribute(`data-org-${attrName}`, attrValue);
					});
				// assign forced attributes    
				element.setAttribute('tabindex', '-1');
				element.setAttribute('readonly', 'true');
				element.classList.contains('readonly-mode') && element.setAttribute('data-org-readonly-mode', 'true');
				element.classList && element.classList.add('readonly-mode');
			});
	},
	setIconAndText(code: string, iconCode: string, text?: string) {
		icon.set(code, iconCode);
		text && i18n.set(code, text);
	}, showIconText(textId) {

		return (<span className="icon-with-text">
			{icon(textId)}
			<span className="text">{i18n(textId)}</span>
		</span>)
	}, showIconAndText(textId) {
		return (<span className="icon-with-text">
			{icon(textId)}
			<span className="text">{i18n(textId)}</span>

		</span>);
	}, scrollTo(element, to, duration) {
		if (duration < 0) return;
		var difference = to - element.scrollTop;
		var perTick = difference / duration * 2;

		setTimeout(function () {
			element.scrollTop = element.scrollTop + perTick;
			Utils.scrollTo(element, to, duration - 2);
		}, 10);
	},
	i18nFormat(i18nCode, args) {
		if (typeof args == 'string') {
			args = { s: i18n.get(args) };

		}
		const text = i18n.get(i18nCode) as any;
		return format(text, args);
	},
	showIcon(icon, className?: string) {
		if (typeof icon == 'object' && ('svg' in icon))
			return <div style={{ 'width': icon.width, margin: icon.margin }} className={className} dangerouslySetInnerHTML={{ __html: icon.svg }} ></div>
		return !!icon && <i key={icon} className={Utils.classNames(className || "icon", icon.split('-')[0], icon)} />;
	},
	indicateNum(current, diff, max) {
		const result = current + diff;
		if (result < 0) return max + result;
		return result % max;
	},
	defaultGetId: (row) => row.id,
	setNoWarn(v) {
		OrganicUI.Utils['noWarn'] = v;
	},
	warn(...args) {
		!OrganicUI.Utils['noWarn'] && console.warn(...args);
	},
	showErrorMessage(text, title?) {
		text = typeof text == 'string' ? i18n.get(text) : text;
		title = typeof title == 'string' ? i18n.get(title) : title;

		return swal({ title: title || '', text, type: 'error', confirmButtonText: i18n.get('okey'), cancelButtonText: i18n.get('cancel') });
	},
	renderDevButton(ident: string | { prefix, targetText }, target: IDeveloperFeatures) {
		if (typeof ident == 'string') ident = { prefix: ident, targetText: ident };
		const { prefix, targetText } = ident;
		const topItems = [{
			key: 'reset0',
			name: `Reset DevTools`,
			onClick: () => {
				try{
				 target.devElement = null, target.forceUpdate()}catch(exc){}
				}
		},{
			key: 'reset',
			name: `Reset DevTools`,
			onClick: () => {
				try{
				 target.devElement = null, target.forceUpdate()}catch(exc){}
				}
		}, {
			key: 'assign-window',
			name: 'Set As Global Var',
			onClick: () => {
				const key = prompt('global varaible name , you can use this variable in    console', changeCase.camelCase(targetText));
				if (!key) return;
				let pairs = {};
				pairs[key] = target;
				Object.assign(window, pairs);
			}
		}
		].filter(item => !!item);
		const root = target && (target as any).refs && (target as any).refs.root;
		return React.createElement(ActionButton, {
			onMouseEnter: () => (root && root.classList.add('dev-target')),
			onMouseLeave: () => root && root.classList.remove('dev-target'),
			menuItems: topItems.concat(
				Object.keys(OrganicUI.devTools.data)
					.filter(key =>
						key.startsWith(prefix + '|'))
					.map(key => [key, OrganicUI.devTools.data[key]])
					.map(([key, onExecute]) => ({
						key: key.split('|')[1],
						name: key.split('|')[1],
						onClick: () => {
							onExecute(target, target)
						}
					})),

			)

		}, <Svg image={CodeImage} width={32} height={32} />, targetText
		);


	},
	accquireDevPortId() {
		return ++devPortIdCounter;
	},
	renderButtons(methods: TMethods, opts?: { componentClass?: React.ComponentType, callback?: Function, args?: any[] }) {
		if (methods instanceof Array)
			methods = methods.reduce((accumulator, method) => (accumulator[method.name] = method, accumulator), {} as TMethods);
		opts = opts || {};
		const callback = opts.callback || function () { };
		return Object.keys(methods).map(
			key => React.createElement(opts.componentClass || OrganicUI.AdvButton,
				{
					onClick: (() => callback(methods[key](...(opts.args || [])), key)) as any,
					variant: 'outlined', style: { margin: '0 0.3rem' },
					color: 'secondary'
				} as Partial<ButtonProps> as any,
				i18n(changeCase.paramCase(key)))
		);
	},
	simulateClick(elem, e?) {
		// Create our event (with options)
		var evt = new MouseEvent('click', {
			...(e || {}),
			bubbles: true,
			cancelable: true,
			view: window
		});
		// If cancelled, don't dispatch our event
		return !elem.dispatchEvent(evt);
	}, simulateBlur(relatedTarget) {
		// Create our event (with options)
		if (!relatedTarget) return;
		var evt = new FocusEvent('blur', {
			relatedTarget
		});
		// If cancelled, don't dispatch our event
		return !relatedTarget.dispatchEvent(evt);
	},


	skinDeepRender(type, params) {
		const target = Utils.isClass(type) ? new type(params) : type(params);
		if (React.isValidElement(target)) return target;
		const instance = target as OrganicUi.BaseComponent<any, any>;
		instance.componentWillMount && instance.componentWillMount();
		return target.render();


	},
	queryElement(element: React.ReactElement<any>, tester: (element) => boolean) {
		const queue: any[] = [element];
		while (queue.length) {
			const item = queue.shift();
			if (item && tester(item)) return item;
			if (item.props && item.props.children)
				queue.push(...React.Children.toArray(item.props.children));

		}
	},
	varDump(data) {
		return JSON.stringify(data);
	},
	map<T>(array: T[], outputMode: 'array' | 'scaler' | 'object', pickedFields: OrganicUi.PartialForcedType<T, true> | OrganicUi.PartialForcedType<T, 1>) {

	},
	devLog(...args) {
		!OrganicUI.isProdMode() && console.log('DEVELOPER-ONLY-LOG>>>>', ...args);
	},
	isProdMode: () => OrganicUI.isProdMode(),
	diff(...args) {
		return diff.apply(this, args)
	},
	toPromise<T>(value: (T | Promise<T>)): Promise<T> {
		return Promise.all([value]).then(([result]) => result);
	},
	enumToIdNames(enumType: any, opts?: IEnumToArrayOptions): ({ Id, Name }[]) {
		let { customCaptions } = opts || {} as IEnumToArrayOptions;
		customCaptions = customCaptions || {};
		return (Utils.entries(enumType).filter(([_, value]) => value === "").length ? [] : [{ Id: undefined, Name: '' }]).concat(Object.keys(enumType)
			.filter(key => (/[a-z]/.test((key[0] || '').toLowerCase())))
			.map(Name => ({
				Id: enumType[Name],
				Name: customCaptions[Name] || i18n.get(changeCase.paramCase(Name)) || changeCase.paramCase(Name) || Name
			})))
	}, enumToRecords(enumType: any, opts?: IEnumToArrayOptions): ({ id, text }[]) {
		let { customCaptions } = opts || {} as IEnumToArrayOptions;
		customCaptions = customCaptions || {};
		return Object.keys(enumType)
			.filter(key => (/[a-z]/.test((key[0] || '').toLowerCase())))
			.map(Name => ({
				id: enumType[Name],
				text: customCaptions[Name] || i18n.get(changeCase.paramCase(Name)) || changeCase.paramCase(Name) || Name
			}))
	},
	equals(left, right) {
		const result = left == right;
		try {
			if (JSON.stringify(left) == JSON.stringify(right)) return true;
		}
		catch (exc) {

		}
		return result;
	},
	joinElements(items: JSX.Element[], glue) {
		return items.map((item, idx) => ([!!idx && glue, item]));
	},
	safeNumber(s, defaultValue?) {
		const result = +s;
		if (Number.isNaN(result)) return defaultValue === undefined ? s : defaultValue;
		return result;
	},
	addDays(date, days) {
		const result = new Date(date);
		result.setDate(date.getDate() + days);
		return result;
	},
	cascadeQueryElement(target: HTMLElement, { className, attrName, attrValue }): HTMLElement {
		while (target) {
			if (className && target.classList.contains(className)) return target;
			if (attrName && target.getAttribute(attrName) == attrValue) return target;
			target = target.parentElement;
		}
		return null;
	},
	getCascadeAttribute(element: HTMLElement, attributeName: string, errorRaised?: boolean) {
		while (element) {
			if (element.hasAttribute(attributeName))
				return element.getAttribute(attributeName);
			element = element.parentElement;
		}
		if (!!errorRaised) throw `getCascadeAttribute fail for ${attributeName}`;
	},
	persianNumber(s: any) {
		s = s.toString();
		const replaces = [
			[/0/g, '۰'],
			[/1/g, '۱'],
			[/2/g, '۲'],
			[/3/g, '۳'],
			[/4/g, '۴'],
			[/5/g, '۵'],
			[/6/g, '۶'],
			[/7/g, '۷'],
			[/8/g, '۸'],
			[/9/g, '۹'],
		];
		return replaces.reduce((s, [from, to]) => s.replace(from, to as any), s);
	},
	numberFormat(n) {
		if (!n) return n;
		n = n.toString();
		if (n.length % 3)
			n = '0'.repeat(3 - (n.length % 3)) + n;
		let result = '';
		while (n) {
			const part = n.substr(0, 3);
			n = n.substr(3);
			result = result ? (result + ',' + part) : (+part).toString();

		}
		return result;
	},
	hash(data) {
		return data ? md5(JSON.stringify(data)) : 'none';
	},
	fakeLoad() {

		return !!Utils['scaningAllPermission'];
	},
	fileToBase64(file: File): Promise<string> {
		return new Promise(resolve => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.readAsDataURL(file);
		});
	},
	 
	extractText(inputValue, filter?) {
		if (!filter) {
			if (React.isValidElement(inputValue))
				return textContent(inputValue);
			if (inputValue === null || inputValue === undefined)
				return inputValue;
		}
		return filter instanceof Function ? Utils.extractText(filter(inputValue)) : inputValue.toString();
	},
	groupLog(title, logs) {
		console.groupCollapsed(title);
		Object.keys(logs).forEach(key => console.log(`${key}>>>`, logs[key]))
	},
	delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	toggleClassOnHover(...classNames: string[]) {
		if (classNames == null || classNames.length == 0) classNames = ['hover'];
		return {
			onMouseLeave: e => {
				if (!e) return;
				e.preventDefault && e.preventDefault();
				e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.remove(...classNames)
			},
			onMouseEnter: e => {
				if (!e) return;
				e.preventDefault && e.preventDefault();
				e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.add(...classNames)
			}
		} as Partial<React.HTMLAttributes<HTMLElement>>;
	},
	findPosition(element: HTMLElement): [number, number] {
		if (!element) return [0, 0];
		let curLeft = 0;
		let curTop = 0;
		do {
			curLeft += Utils.safeNumber(element.offsetLeft, 0);
			curTop += Utils.safeNumber(element.offsetTop, 0);
		} while (element = element.offsetParent as any);
		return [curLeft, curTop];
	},
	getComputedHeight(element: HTMLElement) {
		if (element == null) return null;
		const { parentElement } = element;
		return parentElement.clientHeight - Utils.sumValues(Array.from(parentElement.childNodes).filter(c => c != element).map((c: HTMLElement) => c.clientHeight || 0))

	}, limitNumber(value, min, max) {
		if (value < min) return min;
		if (value > max) return max;
		return value;
	},
	parseQueryString(qs: string | Object) {
		if (typeof qs == 'object') return qs;
		const queryString = qs.replace('?', '').toString();
		return Object.assign({}, ...queryString.split('&').map(d => {
			const array = d.split('=');
			return { [array[0]]: array.length > 1 ? decodeURIComponent(array[1]) : true }
		}));
	},
	successCallout(content) {
		return <div className="server-side-message">
			<i className="fa fa-check-circle" style={{ fontSize: '60px' }}></i>

			<p style={{ whiteSpace: 'pre-line' }}>{i18n.get(content)}</p></div>
	},
	failCallout(content) {
		return <div className="server-side-message">
			<i className="fa fa-exclamation-triangle center-content" style={{ fontSize: '40px' }}></i>

			<div className="animated fadeInDown " style={{ flex: 1 }}>
				{/*i18n('description-rejected-validation')*/}

				{i18n.get(content)}
			</div>
		</div>
	},
	isID(id) {
		if (id === undefined) return false;
		return id == +id || id == 'new' || id.startsWith('draft')
	} ,
	setDefaultProp<P,KV extends keyof P>(componentType:React.ComponentType<P>,key:KV,value:any){
		componentType.defaultProps=componentType.defaultProps || {};
		componentType.defaultProps[key]=value;
	},
}, CoreUtils);
import * as changeCaseObject from 'change-case-object';
import { IDeveloperFeatures, TMethods } from "@organic-ui";
import ActionButton from "../controls/action-button";
import { Button } from "../controls/inspired-components";
import * as camelCaseText0 from 'camelcase';
import { ButtonProps } from "@material-ui/core/Button";
import swal from "sweetalert2";
import Svg from "../controls/svg";
function camelCaseText(s) {
	try {
		return camelCaseText0(s);
	} catch{
		return s;
	}
}
function camelCase(obj) {
	if (!obj) return obj;
	if (obj instanceof Array) return obj.map(camelCase);
	if (typeof obj == 'string') return (obj);
	if (typeof obj == 'object') {
		const array = Object.keys(obj).map(key => ({ camelKey: camelCaseText(key) || key, data: obj[key] }))
			.map(({ camelKey, data }) =>
				({ [camelKey]: camelCase(data) }));
		return Object.assign({}, ...array);

	}
	return obj;


}
export const changeCase: { camelCase: Function, snakeCase: Function, paramCase: Function } = Object.assign({}, changeCaseObject, { camelCase });

function scrollToTop(scrollDuration) {
	const scrollStep = -window.scrollY / (scrollDuration / 15);
	const scrollInterval = setInterval(function () {
		if (Math.abs(window.scrollY) < Math.abs(screenTop))
			window.scroll(0, 0);

		if (window.scrollY != 0) {
			window.scrollBy(0, scrollStep);
		}
		else clearInterval(scrollInterval);
	}, 15);
}