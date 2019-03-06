export const CoreUtils = {
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
		if (!data || !defaultValues) return false;
		if (data['__defaultState']) return false;
		Object.assign(data, { __defaultState: true });
		Object.keys(defaultValues)
			.forEach(key => data[key] = data[key] === undefined ? defaultValues[key] : data[key]);
			return true;
	},
	isClass(type) {
		const desc = Object.getOwnPropertyDescriptor(type, 'prototype')
		return desc && desc.writable === false;
	},
	excl(object, ...keys) {
		keys = keys.map(key => key + "");
		return CoreUtils.reduceEntriesToObject(Object.keys(object).map(key => ([key, object[key]])).filter(([key]) => !keys.includes(key)));
	},
	test(pattern: RegExp | Function | string, s: string) {
		if (pattern instanceof RegExp) return pattern.test(s);
		if (pattern instanceof Function) return pattern(s);
		if (typeof pattern == 'string') return s.includes(pattern);
	},
	fromEntries<T>(entries: Array<[string, T]>): { [key: string]: T } {
		return Object.assign({}, ...entries.map(([key, value]) => ({ [key]: value })))
	},
	entries<T>(obj:{ [key: string]: T }):Array<[string, T]>{
		const {entries:entries0}=Object as any;
		return entries0(obj);
	}
}