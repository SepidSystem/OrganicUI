/// <reference path="../../dts/globals.d.ts" />
import { icon, i18n } from "./shared-vars";
import format = require('string-template');
import { diff } from 'rus-diff';
import md5 = require('md5');
import textContent = require('react-addons-text-content');
let devPortIdCounter = 0;
interface IEnumToArrayOptions { customCaptions?: Object }
export const Utils = {
	classNames(...args: string[]): string {
		return args.filter(x => x).join(' ');
	},
	coalesce(...args: any[]): any {
		return args.filter(x => x)[0];
	},
	navigate(url) {

		history.pushState(null, null, url);
		OrganicUI['mountViewToRoot']();
		scrollToTop(300);
		return Promise.resolve(true);
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
		if (icon && (icon.svg))
			return <div style={{ 'width': icon.width }} className={className} dangerouslySetInnerHTML={{ __html: icon.svg }} ></div>
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
	renderDevButton(ident: string | { prefix, targetText }, target: IDeveloperFeatures) {
		if (typeof ident == 'string') ident = { prefix: ident, targetText: ident };
		const { prefix, targetText } = ident;
		const topItems = [{
			key: 'reset',
			name: `Reset DevTools `,
			onClick: () => (target.devElement = null, target.forceUpdate())
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
		return <ActionButton onMouseEnter={() => (root && root.classList.add('dev-target'))}
			onMouseLeave={() => root && root.classList.remove('dev-target')}
			iconProps={{ iconName: 'Code' }}
			text={targetText}
			menuProps={{
				shouldFocusOnMount: true,
				items:
					topItems.concat(
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
							})))
			}} />;


	},
	accquireDevPortId() {
		return ++devPortIdCounter;
	},
	renderButtons(methods: TMethods, opts?: { componentClass?: React.ComponentType, callback?: Function }) {
		if (methods instanceof Array)
			methods = methods.reduce((accumulator, method) => (accumulator[method.name] = method, accumulator), {} as TMethods);
		opts = opts || {};
		const callback = opts.callback || function () { };
		return Object.keys(methods).map(
			key => React.createElement(opts.componentClass || Button,
				{ onClick: () => callback(methods[key](), key) } as any,
				i18n(changeCase.paramCase(key)))
		);
	},
	simulateClick(elem) {
		// Create our event (with options)

		var evt = new MouseEvent('click', {
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
	merge<T>(...args: Partial<T>[]): T {
		return args.reduce((accumulator, obj) => Object.assign(accumulator, obj), {}) as T;
	},
	toArray(arg): any[] {
		return arg instanceof Array ? arg : [arg];
	},
	reduceEntriesToObject(arg: any[][]): Object {
		return arg.reduce((a, entry) => (a[entry[0]] = entry[1], a), {})
	},
	limitValue(value: number, { min = undefined, max = undefined }): number {
		if (max !== undefined) value = Math.min(value, max);
		if (min !== undefined) value = Math.min(value, min);
		return value;
	},
	isUndefined(value) {
		return value === undefined || value === null || value === '';
	},
	sumValues(numbers: number[]) {
		return numbers.reduce((a, b) => a + b, 0);
	},
	clone<T>(x: T): T {
		if (x === undefined) return undefined;
		return JSON.parse(JSON.stringify(x))
	},
	uniqueArray<T>(array: T[]): T[] {
		return Object.keys(array.reduce((a, b) => (a[b + ''] = 1, a), {})).map(key => (key as any) as T);
	},
	validateData<T>(data: T, callbacks: OrganicUi.PartialFunction<T>): OrganicUi.IDataFormAccessorMsg[] {
		return Object.keys(callbacks)
			.map(accessor => {
				const cb = callbacks[accessor] as Function;
				const message = cb(data[accessor]);
				return { message, accessor };
			}).filter(({ message }) => !!message);
	},
	assignDefaultValues<T>(data: T, defaultValues: Partial<T>) {
		if (!data || !defaultValues) return;
		if (data['__defaultState']) return;
		Object.assign(data, { __defaultState: true });
		Object.keys(defaultValues)
			.forEach(key => data[key] = data[key] === undefined ? defaultValues[key] : data[key]);
	},
	isClass(type) {
		const desc = Object.getOwnPropertyDescriptor(type, 'prototype')
		return desc && desc.writable === false;
	},
	excl(object, ...keys) {
		keys = keys.map(key => key + "");
		return Utils.reduceEntriesToObject(Object.keys(object).map(key => ([key, object[key]])).filter(([key]) => !keys.includes(key)));
	}
	,
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
	safeNumber(s) {
		const result = +s;
		if (Number.isNaN(result)) return s;
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
	entries(obj) {
		return Object.keys(obj).map(key => [key, obj[key]]) ;
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
	}
}
import * as changeCaseObject from 'change-case-object';
import { IDeveloperFeatures, TMethods } from "@organic-ui";
import { ActionButton } from "office-ui-fabric-react/lib/Button";
import { Button } from "../controls/inspired-components";
import * as camelCaseText0 from 'camelcase';
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
		const array = Object.keys(obj).map(key => ({ camelKey: camelCaseText(key) || key, key })).map(({ key, camelKey }) =>
			({ [camelCaseText(key)]: camelCase(obj[key]) }));
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