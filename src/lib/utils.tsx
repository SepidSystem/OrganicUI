import { mountViewToRoot } from "./bootstrapper";
import { icon, i18n } from "./shared-vars";
import format = require('string-template');
let devPortIdCounter = 0;
export const Utils = {

	
	 
	classNames(...args: string[]): string {
		return args.filter(x => x).join(' ');
	},
	coalesce(...args: any[]): any {
		return args.filter(x => x)[0];
	},
	navigate(url) {

		history.pushState(null, null, url);
		mountViewToRoot();
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
	showIcon(icon: string) {
		return !!icon && <i key={icon} className={Utils.classNames("icon", icon.split('-')[0], icon)} />;
	},
	defaultGetId: ({ id }) => id,
	setNoWarn(v) {
		OrganicUI.Utils['noWarn'] = v;
	},
	warn(...args) {
		!OrganicUI.Utils['noWarn'] && console.warn(...args);
	},
	renderDevButton(targetText, target: IDeveloperFeatures) {
		const topItems = [{
			key: 'reset',
			name: `Reset DevTools `,
			onClick: () => (target.devElement = null, target.forceUpdate())
		}, {
			key: 'assign-window',
			name: 'Set As Global Var',
			onClick: () => {
				const key = prompt('global varaible name , you can use this variable in    console', OrganicUI.changeCase.camelCase(targetText));
				if (!key) return;
				let pairs = {};
				pairs[key] = target;
				Object.assign(window, pairs);
			}
		}
		].filter(item => !!item);
		const { root } = (target as any).refs;
		return <FabricUI.ActionButton onMouseEnter={() => (root && root.classList.add('dev-target'))}
			onMouseLeave={() => root && root.classList.remove('dev-target')}
			iconProps={{ iconName: 'Code' }}
			text={targetText}
			menuProps={{
				shouldFocusOnMount: true,
				items:
					topItems.concat(
						Object.keys(devTools.data)
							.filter(key =>
								key.startsWith(targetText + '|'))
							.map(key => [key, devTools.data[key]])
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
			key => React.createElement(opts.componentClass || MaterialUI.Button,
				{ onClick: () => callback(methods[key]()) } as any,
				i18n(changeCase.paramCase(key)))
		);
	}

}
import * as changeCaseObject from 'change-case-object'
import { devTools } from "./developer-features";

export const changeCase: { camelCase: Function, snakeCase: Function, paramCase: Function } = changeCaseObject;