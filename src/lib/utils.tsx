import { mountViewToRoot } from "../organicUI";

export function showModal(title, body) {

}
export function indicatedValues<T>(values: T[]): Array<T> {
	return null;
}
export function classNames(...args: string[]): string {
	return args.filter(x => x).join(' ');
}
export function coalesce(...args: any[]): any {
	return args.filter(x => x)[0];
}
export function navigate(url) {

	history.pushState(null, null, url);
	mountViewToRoot();
	return Promise.resolve(true);
}
export function debounce(func, wait, immediate?) {
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
};
export function makeWritable(root: HTMLElement) {
	if(!root) return;
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

}
export function makeReadonly(root: HTMLElement) {
	if(!root) return;
	
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
}