/*
 * @Author: xuranXYS
 * @LastEditTime: 2025-03-26 23:08:52
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin Xquery
@version 2.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

可快速选择UI，使用链式来调用方法，目前支持选择符号：> ，空格

示例：
$("image[name=中景,width=960] > video > text > image")

类型对应表：
image: ImageElement,
text: TextElement,
textbox: TextBoxElement,
dialogbox: DialogBoxElement,
progressbar: ProgressBarElement,
button: ButtonElement,
animation: AnimationElement,
video: VideoElement,
window: WindowElement,
container: ContainerElement,
root: RootElement,

目前支持的属性(属性基本都支持链式调用，但获取属性除外)：
名称: "name"、内容: "content"、
颜色: "color"、大小: "size"、
垂直居中: "vAlign" 支持字符串：top、middle、bottom
水平居中: "halign" 支持字符串：left、center、right
图片: "image"、行距: "lineSpacing"、
字体: "font"、边框: "border"、
实例ID: "id"、方向: "direction"

Ajax事件：
$.ajax({
  beforeSend: function(xhr){
 // 处理在发送请求之前事件
  },
  error: function(error,xhr){
 // 处理错误事件
  },
  success: function(xhr){
 // 处理成功事件
  },
  complete: function(xhr){
 // 处理完成事件
  }
});

*/

declare global {
	interface Window {
		xQuery: xQuery | ((selector: string) => xQuery);
		$: xQuery | ((selector: string) => xQuery);
	}
}

interface AJAXOptions {
	beforeSend?: (xhr: XMLHttpRequest) => void;
	send?: (xhr: XMLHttpRequest) => void;
	complete?: (xhr: XMLHttpRequest) => void;
	success?: (xhr: XMLHttpRequest) => void;
	error?: (arg0: any, xhr: XMLHttpRequest) => void;
	url: string;
	type?: string;
}

interface QueryPath {
	combinator: string | null;
	selector: string;
	index: number;
	attr: Record<string, string | number | boolean>;
}

interface QueryOptions {
	findAll: boolean;
	selectorTokensCache: QueryPath[];
}

type UIkeys = string | number | symbol;
type UIvalues = string | number | boolean | object | null | undefined;

const UIElementInstance = {
	image: ImageElement,
	text: TextElement,
	textbox: TextBoxElement,
	dialogbox: DialogBoxElement,
	progressbar: ProgressBarElement,
	button: ButtonElement,
	animation: AnimationElement,
	video: VideoElement,
	window: WindowElement,
	container: ContainerElement,
	root: RootElement,
} as const;

type ElementNames = keyof typeof UIElementInstance;

const ReversedUIElementInstance = (() => {
	const result: Record<string, string> = {};
	for (const key in UIElementInstance) {
		const value = UIElementInstance[key as ElementNames] as {
			name: string;
		};
		result[value.name] = key;
	}
	return result;
})();

class xQuery {
	static _instance: any;
	[k: number]: any;
	constructor() {}
	static getInstance(): xQuery {
		if (!xQuery._instance) {
			xQuery._instance = new xQuery();
		}
		return xQuery._instance;
	}

	/* ——————————————————辅助方法———————————————————— */
	static transformElementName(elem: UIElement) {
		return ReversedUIElementInstance[elem.constructor.name];
	}
	static splitSelector(selectorText: string) {
		let selector =
			typeof selectorText === "string"
				? selectorText.replace(/\s\s/g, "").trim()
				: selectorText;
		const parts: QueryPath[] = [];
		const combinators = [" ", ">"];
		let current = "";
		let index = 0;
		let attr: QueryPath["attr"] = {};

		let combinator = null;

		for (;;) {
			if (index > selector.length) break;
			const char = selector.slice(index, index + 1);
			if (
				Object.keys(UIElementInstance).includes(current.trim()) ||
				char === "["
			) {
				if (char === "[") {
					let local_name = "";
					let local_value = "";
					let isValue = false;
					// 截取右边
					while (index < selector.length) {
						const in_char = selector[++index];
						if (in_char === "]") {
							break;
						} else if (in_char === ",") {
							// 新属性
							isValue = false;
							attr[local_name] = local_value.substring(1);
							local_name = "";
							local_value = "";
						} else if (in_char === "=" || isValue) {
							// 属性值开始
							local_value += in_char;
							isValue = true;
						} else {
							// 属性开始
							local_name += in_char;
						}
					}
					attr[local_name] = local_value.substring(1);
				}
				parts.push({
					combinator,
					selector: current.trim(),
					index: parts.length,
					attr,
				});
				attr = {};
				current = "";
				combinator = null;
			} else if (combinators.includes(char) && char !== " ") {
				combinator = char;
			} else {
				current += char;
			}
			index++;
		}
		return parts;
	}

	static genAttrForPath(elem: UIElement): Record<string, any> {
		return {
			...elem.transform,
			name: elem.name,
			id: elem.presetId,
			visiable: elem.visible,
		};
	}

	/**
	 * @description: 根据子项生成路径
	 * @param {UIElement} elem
	 * @return {*}
	 */
	static reslovePath(elem: UIElement, index = 0) {
		const selector = xQuery.transformElementName(elem);
		let paths = [
			{
				selector,
				attr: xQuery.genAttrForPath(elem),
				index,
				combinator: ">",
			} as QueryPath,
		];
		if (elem.parent && xQuery.transformElementName(elem.parent) !== "root") {
			paths = paths.concat(xQuery.reslovePath(elem.parent, index + 1));
		}
		return paths.reverse();
	}

	/**
	 * @description: 比较两个路径是否相等
	 * @param {QueryPath} p1
	 * @param {QueryPath} p2
	 * @return {*}
	 */
	static comparePath(obj1: QueryPath[], obj2: QueryPath[]) {
		let index = 0;
		let index2 = 0;

		let state = false;
		for (;;) {
			const t = obj1[index];
			const t1 = obj2[index2];
			if (index2 === obj2.length - 1) {
				break;
			}
			if (index == obj1.length - 1) {
				state = true;
				break;
			}
			if (t.selector === t1.selector) {
				index++;
			}
			index2++;
		}
		return state;
	}

	static queryElement(
		selectorTokens: QueryPath[],
		parent: UIElement = UI.root,
		options: QueryOptions = {
			findAll: false,
			selectorTokensCache: [],
		}
	) {
		const query: UIElement[] = [];
		if (!selectorTokens.length) return query;
		const nChildren =
			options.findAll || !selectorTokens[0].combinator
				? parent.children
				: parent.children.filter(
						v =>
							UIElementInstance[
								selectorTokens[0].selector as keyof typeof UIElementInstance
							] &&
							v instanceof
								UIElementInstance[
									selectorTokens[0].selector as keyof typeof UIElementInstance
								]
				  );
		const t = selectorTokens[0];
		for (const e of nChildren) {
			const isMatch =
				t.selector === xQuery.transformElementName(e) &&
				Object.keys(t.attr).every(
					v => t.attr[v] == xQuery.genAttrForPath(e)[v]
				);
			switch (t.combinator) {
				case ">":
					if (isMatch && selectorTokens.length === 1) {
						query.push(e);
					} else {
						const find = xQuery.queryElement(
							selectorTokens.slice(1),
							e,
							options
						);
						query.push(...find);
					}
					break;
				case null:
					if (
						isMatch ||
						xQuery.comparePath(
							options.selectorTokensCache,
							xQuery.reslovePath(e)
						)
					) {
						if (isMatch && selectorTokens.length === 1) query.push(e);
						// 找子节点
						if (options.findAll || e.children.length > 0) {
							const find = xQuery.queryElement(
								selectorTokens.slice(1),
								e,
								options
							);
							query.push(...find);
						}
					} else if (e.children.length > 0) {
						const find = xQuery.queryElement(selectorTokens, e, options);
						query.push(...find);
					}
					break;
			}
		}
		return query;
	}
	/* ——————————————————方法———————————————————— */
	static isHexColor(color: string) {
		// 判断是否以'#'开头
		if (!color.startsWith("#")) return false;

		// 使用正则表达式验证六位十六进制数字
		const pattern = /^#([a-fA-F0-9]{6})$/;
		const pattern1 = /^#([a-fA-F0-9]{3})$/;
		const pattern2 = /^#([a-fA-F0-9]{4})$/;
		const pattern3 = /^#([a-fA-F0-9]{8})$/;
		return pattern.test(color)
			? true
			: pattern1.test(color)
			? true
			: pattern2.test(color)
			? true
			: pattern3.test(color)
			? true
			: false;
	}
	static HexToRgba(hex: any) {
		if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
			const r = (hex[1] + hex[1]).toString(16);
			const g = (hex[2] + hex[2]).toString(16);
			const b = (hex[3] + hex[3]).toString(16);
			return r + g + b + "FF";
		}
		if (/^#([0-9a-fA-F]{4})$/.test(hex)) {
			const r = (hex[1] + hex[1]).toString(16);
			const g = (hex[2] + hex[2]).toString(16);
			const b = (hex[3] + hex[3]).toString(16);
			const a = (hex[4] + hex[4]).toString(16);
			return r + g + b + a;
		}
		if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
			const r = (hex[1] + hex[2]).toString(16);
			const g = (hex[3] + hex[4]).toString(16);
			const b = (hex[5] + hex[6]).toString(16);
			return r + g + b;
		}
		if (/^#([0-9a-fA-F]{8})$/.test(hex)) {
			const r = (hex[1] + hex[2]).toString(16);
			const g = (hex[3] + hex[4]).toString(16);
			const b = (hex[5] + hex[6]).toString(16);
			const a = (hex[7] + hex[8]).toString(16);
			return r + g + b + a;
		}
		throw new Error(`不能解析颜色：${hex}`);
	}
	static query(selector: string | UIElement | UIElement[]) {
		const newInstance = new xQuery();
		switch (typeof selector) {
			case "string":
				{
					const path = xQuery.splitSelector(selector.trim());
					const findElems = xQuery.queryElement(path, UI.root, {
						findAll: path.length === 1 ? true : false,
						selectorTokensCache: [...path],
					});
					findElems.forEach((v, index) => (newInstance[index] = v));
				}
				break;
			case "object":
				if (selector instanceof UIElement) {
					newInstance[newInstance.getElems().length] = selector;
				} else if (
					selector instanceof Array &&
					selector.every(v => v instanceof UIElement)
				) {
					selector.forEach((v, index) => (newInstance[index] = v));
				}
				break;
		}
		return newInstance;
	}
	static ajax(obj: string | AJAXOptions) {
		const xhr = new XMLHttpRequest();
		try {
			xhr.onreadystatechange = () => {
				switch (xhr.readyState) {
					case 1:
						{
							// 发送send之前
							typeof obj === "object" && obj.beforeSend?.(xhr);
						}
						break;
					case 2: {
						// 已经调用 send()，但尚未接收到响应
						typeof obj === "object" && obj.send?.(xhr);
						break;
					}
					case 3: {
						// 已经接收到全部响应数据，而且已经可以在浏览器中使用了
						typeof obj === "object" && obj.complete?.(xhr);
						break;
					}
				}
				// 判断HTTP的状态码，判断xhr对象的status属性值是否在200到300之间（200-299 用于表示请求成功）
				if (xhr.status >= 200 && xhr.status < 300 && xhr.readyState === 4) {
					typeof obj === "object" && obj.success?.(xhr);
				}
			};
			let newObj = typeof obj === "object" ? obj : { url: obj };
			let url = newObj.url || "";
			xhr.open(
				newObj.type || "GET",
				/([A-Za-z])+:\/\/(.+)+/.test(url) ? url : "http://" + url,
				true
			);
			xhr.send(null);
		} catch (e) {
			typeof obj === "object" && obj.error?.(e, xhr);
		}
		return Promise.resolve(xhr);
	}

	/* ——————————————————实例方法———————————————————— */

	getElems(): UIElement[] {
		const parts: UIElement[] = [];
		const keys = Object.keys(this).filter(v => typeof +v === "number");
		for (let index of keys) {
			const elem = this[+index];
			if (elem && elem instanceof UIElement) parts.push(elem);
		}
		return parts;
	}

	_changeAttr(
		attr: Record<UIkeys, UIvalues>,
		beforeValue?: (val: UIvalues, node: UIElement, prop: string) => UIvalues,
		isChild = false
	) {
		for (const elem of this.getElems()) {
			for (let i in attr) {
				if (i && i in elem) {
					const newVal = attr[i] as UIvalues;
					// @ts-expect-error
					elem[i] = beforeValue ? beforeValue(newVal, elem, i) : newVal;
				} else {
					const newVal = attr[i] as UIvalues;
					beforeValue && beforeValue(newVal, elem, i);
				}
			}
			if (isChild && elem.children.length)
				xQuery.query(elem.children)._changeAttr(attr, beforeValue, isChild);
		}
	}

	_getAttr(e: string) {
		const parts: any[] = [];
		for (const elem of this.getElems()) {
			// @ts-expect-error
			if (e && e in elem) parts.push(elem[e]);
		}
		return parts.length === 1 ? parts[0] : parts;
	}
	/**
	 * @description: 操作元素属性
	 * @return {*}
	 */
	_operatePrototype(
		name: string, // name 和 value 都为空则只是执行方法
		val?: UIvalues,
		beforeValue?: (val: UIvalues, node: UIElement, prop: string) => UIvalues, // 设置值前执行
		isChild = false // 子节点是否执行
	) {
		if (typeof val === "undefined" || val === null) return this._getAttr(name);
		else this._changeAttr({ [name]: val }, beforeValue, isChild);
	}
	name(val: string) {
		return this._operatePrototype("name", val);
	}
	content(val: string) {
		return this._operatePrototype("content", val);
	}
	color(val: string) {
		return this._operatePrototype("color", val, () =>
			xQuery.isHexColor(val)
				? xQuery.HexToRgba(val)
				: new Error(`不能解析颜色：${val}`)
		);
	}
	size(val: number) {
		return this._operatePrototype("size", val);
	}
	lineSpacing(val: number) {
		return this._operatePrototype("lineSpacing", val);
	}
	font(val: string) {
		return this._operatePrototype("font", val);
	}
	typeface(val: string) {
		return this._operatePrototype("typeface", val);
	}
	effect(val: string) {
		return this._operatePrototype("effect", val);
	}
	overflow(val: string) {
		return this._operatePrototype("overflow", val);
	}
	valign(val: string) {
		return this._operatePrototype("verticalAlign", val);
	}
	halign(val: string) {
		return this._operatePrototype("horizontalAlign", val);
	}
	direction(val: string) {
		return this._operatePrototype("direction", val);
	}
	width(val: string) {
		return this._operatePrototype("width", val);
	}
	height(val: string) {
		return this._operatePrototype("height", val);
	}
	show() {
		return this._operatePrototype("show", true);
	}
	hide() {
		return this._operatePrototype("hide", true);
	}
	toggle() {
		this._operatePrototype(
			"",
			"",
			(_: UIvalues, node: UIElement) => {
				if (node.visible) {
					node.hide();
				} else {
					node.show();
				}
				return false;
			},
			true
		);
	}
	nth(index = 0): xQuery {
		return xQuery.query(this?.[index]);
	}
	remove() {
		return this._operatePrototype("remove");
	}
	clear() {
		return this._operatePrototype("clear");
	}
	connect() {
		return this._operatePrototype("connect");
	}
	disconnect() {
		return this._operatePrototype("disconnect");
	}
	isVisible() {
		return this._operatePrototype("isVisible");
	}
	destroy() {
		return this._operatePrototype("", "", (_: UIvalues, node: UIElement) => {
			node.destroy();
			return true;
		});
	}
	image(val: Texture) {
		return this._operatePrototype("image", val);
	}
	border(val: number) {
		return this._operatePrototype("border", val);
	}
	id(val: string) {
		return this._operatePrototype("entityId", val);
	}
}

export default class xQueryScript implements Script<Plugin> {
	onStart() {
		Object.setPrototypeOf(xQuery.query, xQuery);
		window.$ = window.xQuery = xQuery.query;
	}
}
