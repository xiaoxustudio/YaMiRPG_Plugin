/*
@plugin 任务系统
@version 1.6.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

任务系统
可进行添加主线或者是分支任务，删除任务，保存任务数据等操作

检查[完成]物品列表类型标识：（未知类型将不会被添加，除非开启强制添加）
item（物品）, actor（角色）, equip（装备），skill（技能）,state（状态），trigger（触发器），elem（元素）
var（全局变量）, event（事件）, master（主线） , branch（支线）

使用方法：
item（物品）,actor（角色）, equip（装备），skill（技能）,state（状态）：
类型，id，数量

master（主线）：类型，id
branch（支线）：类型，id
event（事件）：类型，id，执行次数
var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）
elem（元素）：类型，id，别名（将会被显示在任务中）
trigger（触发器）：类型，id，别名（将会被显示在任务中）

PS（注意事项）：
事件类型会在遍历的时候自动执行，内置变量：@index ：循环索引
不能处理的类型：trigger（触发器），elem（元素），master（主线），branch（支线）

任务是否可以完成指令不能处理某些类型，需要自定义回调事件，不可处理的类型将会被传入回调事件
开启强制添加后，输入的第一个参数会称为自定义类型，第二个为id
但从id开始，后面组块需要使用key:value格式定义属性
定义的key:value会被作为属性添加进对应item里面，重复定义的只保留首次（可用变量）


《任务是否可以完成》指令回调事件：
内置变量：
1.@index -> 索引
2.@result -> 物品转换数据
2.@result_rw -> 物品原始数据
3.@return -> 回调返回值：只能为布尔值（true或false）
根据内置变量@return的返回值判断当前类型是否可以完成

《添加额外任务结构》指令：
可对任务数据结构添加额外的属性，key:value会被作为任务额外的属性添加进任务结构，重复定义的只保留首次（可用变量）
只定义key，则值自动设置为undefined
value如果格式为(value)，则value的值将会被解析为js值


《获取任务键》指令如果获取多个键，则会返回列表（可用遍历指令进行遍历）

任务遍历用于遍历任务:
1.@index -> 索引
2.@result -> 任务数据

任务物品列表遍历会遍历任务的检查物品列表（item属性）：
1.@index -> 索引
2.@result -> 物品转换数据（通常是个对象）
3.@result_rw -> 物品原始数据

任务完成物品列表遍历会遍历任务的完成属性列表（complete_item属性）：
1.@index -> 索引
2.@result -> 物品转换数据（通常是个对象）
3.@result_rw -> 物品原始数据

任务是否可以完成会检查item里面的物品是否存在库存里面

切换到下一个任务：会切换到链接相对于的任务

大部分可输入框使用标识：
<local:var_name>
<global:var_name>
<local:'actor'->'triggerActor'>
<local:'cactor'->'casterActor'>
<local:'skill'->'triggerSkill'>
<local:'state'->'triggerState'>
<local:'equip'->'triggerEquipment'>
<local:'item'->'triggerItem'>
<local:'object'->'triggerObject'>
<local:'light'->'triggerLight'>
<local:'region'->'triggerRegion'>
<local:'elem'->'triggerElement'>
<local:'elem'->'triggerElement'>

@option op {"base","advanced","other"}
@alias 操作 {基础操作,高级操作,其他操作}

@option other_op {"read","save","remove","is_branch","change","show"}
@alias 子操作 {读取任务数据,保存任务数据,删除任务数据,数据源是否为分支,切换数据源,插件信息显示}
@cond op {"other"}
@desc 
读取任务数据：读取保存的任务数据
保存任务数据：将任务数据保存到存档
删除任务数据：删除指定存档的任务数据
数据源是否为分支：判断当前数据源是否为分支
切换数据源：切换当前数据源为分支或者是主线
插件信息显示：显示插件信息

@option other_change_type {"master","branch"}
@alias 数据源类型 {主线存储源,分支存储源}
@cond other_op {"change"}
@desc 切换当前数据源为分支或者是主线

@string other_save_var
@alias 保存到本地变量
@cond other_op {"is_branch"}
@desc 将操作的结果保存到变量

@string rw_data_num
@alias 存档索引
@default 0
@cond other_op {"read","save","remove"}
@desc 用于操作任务数据的索引

@boolean rw_data_format
@alias 是否格式化存储
@default false
@cond other_op {"save"}
@desc 不进行格式化数据会适当减少存储容量

@option advanced_op {"get_taskkey","set_taskkey","get_itemkey","set_itemkey","add_con","dis_con","add_e"}
@alias 子操作 {获取任务键,设置任务键,获取物品键,设置物品键,链接任务,断开链接,添加额外任务结构}
@cond op {"advanced"}
@desc
获取任务键：获取任务属性
设置任务键：设置任务属性
获取物品键：获取指定任务匹配的物品键值
设置物品键：设置指定任务匹配的物品键值
链接任务：将指定任务和目标任务链接
断开链接：断开指定任务的链接关系
添加额外任务结构：对任务数据结构添加额外的属性

@string con_tag
@alias 任务标识
@cond advanced_op {"add_con","dis_con"}
@desc 用来标识一个任务的标识


@string con_to_tag
@alias 链接到(任务标识)
@cond advanced_op {"add_con"}
@desc 被链接的任务标识

@string ad_get
@alias 任务对象变量
@cond advanced_op {"get_taskkey","set_taskkey"}
@desc 传入一个任务对象

@string ad_get_itemkey
@alias 对象变量
@cond advanced_op {"get_itemkey","set_itemkey"}
@desc 传入一个任务对象或者是自定义类型项对象

@option ad_option {"tag","title","type","desc","state","item","complete_item","custom"}
@alias 目标 {标识,标题,类型,描述,状态,检测物品列表,完成物品列表,自定义}
@cond advanced_op {"get_taskkey","set_taskkey"}
@desc 对任务的目标属性进行操作

@string ad_exp
@alias 任务键表达式
@cond ad_option {"custom"}
@desc 任务键表达式（多个用英文逗号分割）

@string ad_exp_val
@alias 任务值表达式
@cond advanced_op {"set_taskkey"}
@desc 任务值表达式（多个用英文逗号分割）

@option itemkey_type {"item","complete_item"}
@alias 匹配类型 {检查任务物品列表,完成任务物品列表}
@cond advanced_op {"get_itemkey","set_itemkey"}
@desc 匹配检查任务物品列表或者完成任务物品列表

@string itemkey_attr
@alias 匹配属性
@cond advanced_op {"get_itemkey","set_itemkey"}
@desc 通过匹配属性确定项位置（类型,id）

@string itemkey_key
@alias 物品键表达式
@cond advanced_op {"get_itemkey","set_itemkey"}
@desc 物品键表达式（多个用英文逗号分割）

@string itemkey_val
@alias 物品值表达式
@cond advanced_op {"set_itemkey"}
@desc 物品值表达式（多个用英文逗号分割）

@boolean not_string
@alias 不是字符串
@desc 设置之后将会将值解析为js值
@cond advanced_op {"set_itemkey","set_taskkey"}


@string[] rw_struct
@alias 额外任务数据结构
@desc 这里用于添加额外的任务数据结构
@cond advanced_op {"add_e"}


@string ad_save_var
@alias 保存到本地变量
@cond advanced_op {"get_taskkey","get_itemkey"}
@desc 将操作的结果保存到变量

@option base_op {"load","add","remove","get","set_default","get_default","change_next","check","check_list","check_list_com","is_complete"}
@alias 子操作 {加载任务文件,添加任务,删除任务,获取任务,设置当前任务,获取当前任务,切换到下一个任务,任务遍历,任务物品列表遍历,任务完成物品列表遍历,任务是否可以完成}
@cond op {"base"}
@desc
加载任务文件：从任务文件加载任务
添加任务：添加一个任务
删除任务：删除一个任务
获取任务：获取指定任务标识的任务
设置当前任务：设置当前正在进行中的任务
获取当前任务：获取当前正在进行中的任务
切换到下一个任务：切换到当前任务链接对应的任务
任务遍历：遍历任务数据
任务物品列表遍历：遍历任务数据的检查物品列表
任务完成物品列表遍历：遍历任务数据的完成物品列表
任务是否可以完成：检测任务是否满足完成的条件

@string loadPath
@alias 任务文件路径
@cond base_op {"load"}
@desc 任务数据文件路径的路径，可用变量、符号（$：表示当前项目）、资源GUID

@string tag_rw
@alias 任务标识
@cond base_op {"add","get","is_complete","check_list","set_default","check_list_com"}
@desc 用来标识一个任务的标识

@string title_rw
@alias 任务标题
@cond base_op {"add"}
@desc 任务的标题

@number type_rw
@alias 任务类型
@default 0
@cond base_op {"add"}
@desc 任务的类型，目前无作用，可自行扩展

@string desc_rw
@alias 任务描述
@cond base_op {"add"}
@desc 任务的描述信息

@string[] item_list_str
@alias 检查物品列表
@cond base_op {"add"}
@desc 任务的表达式物品列表（用于检测任务）
使用方法：
item（物品）,actor（角色）, equip（装备），skill（技能）,state（状态）：
类型，id，数量

master（主线）：类型，id
branch（支线）：类型，id
event（事件）：类型，id，执行次数
var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）
elem（元素）：类型，id，别名（将会被显示在任务中）
trigger（触发器）：类型，id，别名（将会被显示在任务中）

@string[] item_list_com
@alias 完成物品列表
@cond base_op {"add"}
@desc 任务的表达式物品列表（用于完成任务后）
使用方法：
item（物品）,actor（角色）, equip（装备），skill（技能）,state（状态）：
类型，id，数量

master（主线）：类型，id
branch（支线）：类型，id
event（事件）：类型，id，执行次数
var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）
elem（元素）：类型，id，别名（将会被显示在任务中）
trigger（触发器）：类型，id，别名（将会被显示在任务中）

PS：事件类型会在遍历的时候自动执行，内置变量：@index ：循环索引

@boolean is_force_add
@alias 强制添加
@default false
@cond base_op {"add"}
@desc 检查[完成]物品列表不允许使用其他类型，开启后可跳过检测强制添加

@string remove_rw
@alias 移除任务标识
@cond base_op {"remove"}
@desc 移除填写的对应的任务

@file event_check
@filter event
@alias 遍历事件
@cond base_op {"check","check_list","check_list_com"}
@desc 内置变量：
1.@index -> 索引
2.@result -> 任务数据（[完成]物品列表：物品转换数据（通常是个对象））
3.@result_rw -> 物品原始数据（[完成]物品列表）

@boolean inherit_check
@alias 继承变量
@default false
@cond base_op {"check","check_list","check_list_com"}
@desc 继承当前的本地变量

@boolean is_reverse
@alias 倒叙遍历
@default false
@desc 从后往前遍历任务
@cond base_op {"check"}

@boolean is_index
@default false
@alias 是索引
@cond base_op {"get"}
@desc 通过索引获取任务，索引为数值

@file event_complete_callback
@filter event
@alias 回调事件
@cond base_op {"is_complete"}
@desc 
不可处理的类型将会被传入回调事件
内置变量：
1.@index -> 索引
2.@result -> 物品转换数据
2.@result_rw -> 物品原始数据
3.@return -> 回调返回值：只能为布尔值（true或false）
根据内置变量@return的返回值判断当前类型是否可以完成

@string[] set_rw_struct
@alias 设置额外任务属性
@desc 这里用于设置额外的任务数据属性
@cond base_op {"add"}

@string save_var
@alias 保存到本地变量
@cond base_op {"get","is_complete","get_default"}
@desc 将操作的结果保存到变量
*/

interface AddTaskProps {
	title: string;
	desc: string;
	item: any[];
	c_item: any[];
	state?: boolean;
	tag: number;
	type: string;
}

class xr {
	// 内置变量
	static mapTo = {
		actor: "triggerActor",
		cactor: "casterActor",
		skill: "triggerSkill",
		state: "triggerState",
		equip: "triggerEquipment",
		item: "triggerItem",
		object: "triggerObject",
		light: "triggerLight",
		region: "triggerRegion",
		elem: "triggerElement",
	};
	static showInfo() {
		console.log(
			`   ____         __   __                      \n` +
				`  |  _ \\        \\ \\ / /                      \n` +
				`  | |_) |_   _   \\ V /_   _ _ __ __ _ _ __   \n` +
				`  |  _ <| | | |   > <| | | | '__/ _\` | '_ \\  \n` +
				`  | |_) | |_| |  / . \\ |_| | | | (_| | | | | \n` +
				`  |____/ \\__, | /_/ \\_\\__,_|_|  \\__,_|_| |_| \n` +
				`          __/ |                              \n` +
				`         |___/                               \n` +
				"\n\n  任务系统  \n\n" +
				"🏠b站：https://space.bilibili.com/291565199\n\n" +
				"📞github：https://github.com/xiaoxustudio\n\n" +
				"🌒官网：www.xiaoxustudio.top\n\n"
		);
	}
	static is_obj(obj: object) {
		return typeof obj == "object";
	}
	static is_func(obj: object) {
		return typeof obj == "function";
	}
	static is_json(str: string) {
		try {
			return JSON.parse(str);
		} catch (e) {
			return false;
		}
	}
	static convertToJSON(object: object) {
		const cache = new Set();

		let json = JSON.stringify(object, function (key, value) {
			if (typeof value === "object" && value !== null) {
				if (cache.has(value)) {
					return "[*self]";
				}
				cache.add(value);
			}
			return value;
		});

		cache.clear(); // 清空 cache

		return json;
	}
	static get_global(str: string) {
		for (let i in Variable.groups) {
			for (let k in Variable.groups[i]) {
				if (str == Variable.groups[i][k].name) {
					return Variable.groups[i][k].value;
				}
			}
		}
		return null;
	}
	static uuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				var r = (Math.random() * 16) | 0,
					v = c == "x" ? r : (r & 0x3) | 0x8;
				return v.toString(16);
			}
		);
	}
	static compile(r: CommandDataList) {
		let commands = [...CurrentEvent.commands];
		commands.unshift(Command.compile(r, () => true)[0]);
		const eh = new EventHandler(Command.compile(r, () => true));
		EventHandler.call(eh);
	}
	static compileVar(msg: string) {
		// 将字符串里面的变量编译为文本
		let regex = /<(.*?):(.*?)>+/g;
		let matches = [];
		let match;

		while ((match = regex.exec(msg)) !== null) {
			matches.push({ type: match[1], content: match[2] });
		}
		for (let i in matches) {
			for (let na in xr.mapTo) {
				if (matches[i]["type"] == na) {
					// @ts-ignore
					return CurrentEvent.attributes[matches[i]["type"]]?.attributes[
						matches[i]["content"]
					];
				}
			}
			//其他类型
			if (matches[i]["type"] == "local") {
				for (let k in xr.mapTo) {
					if (k == matches[i]["content"]) {
						matches[i]["content"] = xr.mapTo[k as keyof typeof xr.mapTo];
					}
				}
				if (typeof CurrentEvent.attributes[matches[i]["content"]] == "object") {
					return CurrentEvent.attributes[matches[i]["content"]];
				}
				// 其他变量
				if (typeof CurrentEvent.attributes[matches[i]["content"]] == "object") {
					const data = CurrentEvent.attributes[matches[i]["content"]] as any;
					const ms_l: Record<string, any> = {};
					for (const obj_name in data) {
						if (typeof data[obj_name] != "object") {
							ms_l[obj_name] = data[obj_name];
						} else {
							ms_l[obj_name] = xr.convertToJSON(data[obj_name]);
						}
					}
					msg = String(msg).replace(
						"<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
						xr.convertToJSON(ms_l)
					);
				} else {
					msg = String(msg).replace(
						"<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
						CurrentEvent.attributes[matches[i]["content"]] as string
					);
				}
			}
			if (matches[i]["type"] == "global") {
				if (typeof xr.get_global(matches[i]["content"]) == "object") {
					const data = xr.get_global(matches[i]["content"]) as any;
					const ms_l: Record<string, any> = {};
					for (let obj_name in data) {
						if (typeof data[obj_name] != "object") {
							ms_l[obj_name] = data[obj_name];
						} else {
							ms_l[obj_name] = xr.convertToJSON(data[obj_name]);
						}
					}
					msg = String(msg).replace(
						"<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
						xr.convertToJSON(ms_l)
					);
				} else {
					msg = String(msg).replace(
						"<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
						xr.get_global(matches[i]["content"]) as string
					);
				}
			}
		}
		return msg;
	}
}

/**
 * @description: 设置对象嵌套值
 * @param {*} a
 * @param {*} b
 * @param {*} obj
 * @return {*}
 */
function setNestedProperty(
	a: string,
	b: string,
	obj: Record<string, any>,
	not_str = false
) {
	const pathArr = a.split(",");
	const propName = pathArr.pop();
	let nestedObj = obj;
	for (const path of pathArr) {
		if (
			!nestedObj.hasOwnProperty(path) ||
			typeof nestedObj[path] !== "object"
		) {
			nestedObj[path] = {};
		}
		nestedObj = nestedObj[path];
	}
	nestedObj[propName!] = not_str ? new Function("return " + b)() : b;
	return obj;
}
/**
 * @description: 错误处理
 * @return {*}
 */
class Error_xr {
	constructor(msg: string, event: EventHandler, e: unknown) {
		let Map = {
			triggerActor: "name",
			casterActor: "name",
			triggerSkill: "name",
			triggerState: "name",
			triggerEquipment: "name",
			triggerItem: "name",
			triggerObject: "name",
			triggerLight: "name",
			triggerRegion: "name",
			triggerElement: "parent",
		};
		let str = "元素 Root";
		let _obj: UIElement | undefined;
		if (event.hasOwnProperty("triggerElement")) {
			try {
				_obj = event["triggerElement"];
				while (_obj && !(_obj.parent instanceof RootElement)) {
					const parent = _obj.parent;
					if (parent) {
						str += "/" + _obj.parent?.name;
						_obj = parent;
					} else {
						break;
					}
				}
			} catch (e: any) {
				console.error(e.message);
			}
		} else if (event.hasOwnProperty("triggerActor")) {
			const lex = "triggerActor";
			if (event[lex]) str = "角色 " + event[lex].attributes[Map[lex]];
		} else if (event.hasOwnProperty("triggerSkill")) {
			const lex = "triggerSkill";
			if (event[lex]) str = "技能 " + event[lex].attributes[Map[lex]];
		} else if (event.hasOwnProperty("triggerState")) {
			const lex = "triggerState";
			if (event[lex]) str = "状态 " + event[lex].attributes[Map[lex]];
		} else if (event.hasOwnProperty("triggerEquipment")) {
			const lex = "triggerEquipment";
			if (event[lex]) str = "装备 " + event[lex].attributes[Map[lex]];
		} else if (event.hasOwnProperty("triggerItem")) {
			const lex = "triggerItem";
			if (event[lex]) str = "物品 " + event[lex].attributes[Map[lex]];
		} else if (event.hasOwnProperty("triggerRegion")) {
			const lex = "triggerRegion";
			if (event[lex]) str = "区域 ";
		} else if (event.hasOwnProperty("triggerLight")) {
			const lex = "triggerLight";
			if (event[lex]) str = "光源 ";
		}
		console.error(msg, "\n", str, "\n", event);
		throw e;
	}
}
/**
 * @description: 任务系统
 * @return {*}
 */
export default class rw_xr {
	/**
	 * @description: 主线数据
	 * @return {*}
	 */
	_data: any[];
	/**
	 * @description: 分支数据
	 * @return {*}
	 */
	_branch_data: any[];
	/**
	 * @description: 是否是分支
	 * @return {*}
	 */
	is_state;
	current_rw;
	current_rw_branch;
	config;
	_connect: Record<string, any>;
	_connect_branch;
	is_close;
	extend_struct: Record<string, any>;
	/* 变量 */
	op: string;
	base_op: string;
	loadPath: string;
	set_rw_struct: string[];
	title_rw: string;
	type_rw: string;
	desc_rw: string;
	tag_rw: string;
	item_list_str: string[];
	item_list_com: string[];
	is_force_add: boolean;
	remove_rw: string;
	save_var: string;
	is_index: boolean;
	is_reverse: boolean;
	event_check: string;
	inherit_check: boolean;
	event_complete_callback: string;
	advanced_op: string;
	ad_get: string;
	ad_exp: string;
	ad_option: string;
	ad_save_var: string;
	ad_exp_val: string;
	not_string: boolean;
	ad_get_itemkey: string;
	itemkey_attr: string;
	itemkey_key: string;
	itemkey_type: string;
	itemkey_val: string;
	con_to_tag: string;
	con_tag: string;
	rw_struct: string[];
	other_op: string;
	rw_data_num: string;
	rw_data_format: boolean;
	other_save_var: string;
	other_change_type: string;
	type: number;
	constructor() {
		this.extend_struct = {}; // 扩展任务结构
		this._data = [];
		this._branch_data = [];
		this.is_state = false;
		this._connect = {};
		this._connect_branch = {};
		this.current_rw = 0; // 当前任务
		this.current_rw_branch = 0;
		this.config = {};
		this.is_close = false; // 默认不关闭作者信息显示
		this.op = "";
		this.base_op = "";
		this.loadPath = "";
		this.set_rw_struct = [];
		this.title_rw = "";
		this.type_rw = "";
		this.desc_rw = "";
		this.tag_rw = "";
		this.item_list_str = [];
		this.item_list_com = [];
		this.is_force_add = false;
		this.remove_rw = "";
		this.save_var = "";
		this.is_index = false;
		this.is_reverse = false;
		this.event_check = "";
		this.inherit_check = false;
		this.event_complete_callback = "";
		this.advanced_op = "";
		this.ad_get = "";
		this.ad_exp = "";
		this.ad_option = "";
		this.ad_save_var = "";
		this.ad_exp_val = "";
		this.not_string = false;
		this.ad_get_itemkey = "";
		this.itemkey_attr = "";
		this.itemkey_key = "";
		this.itemkey_type = "";
		this.itemkey_val = "";
		this.con_to_tag = "";
		this.con_tag = "";
		this.rw_struct = [];
		this.other_op = "";
		this.rw_data_num = "";
		this.rw_data_format = false;
		this.other_save_var = "";
		this.other_change_type = "";
		this.type = 0;
	}
	// 属性定义
	get data() {
		if (!this.is_state) {
			return this._data;
		} else {
			return this._branch_data;
		}
	}
	set data(val) {
		if (!this.is_state) {
			this._data = val;
		} else {
			this._branch_data = val;
		}
	}
	get connect(): Record<string, any> {
		if (!this.is_state) {
			return this._connect;
		} else {
			return this._connect_branch;
		}
	}
	set connect(val) {
		if (!this.is_state) {
			this._connect = val;
		} else {
			this._connect_branch = val;
		}
	}
	// 定义基础方法
	saveRwData(number: { toString: () => string }, is_format = false) {
		const suffix = number.toString().padStart(2, "0");
		// MacOS打包缺少写入权限，暂时改成web模式
		let shell = Stats.shell;
		if (!Stats.debug && Stats.isMacOS()) {
			shell = "web";
		}
		switch (shell) {
			case "electron": {
				const saveDir = Loader.route("./Save");
				const dataPath = Loader.route(`./Save/save_xr${suffix}.save`);
				let struct = {
					current: this.current_rw,
					current_b: this.current_rw_branch,
					config: { is_state: this.is_state, ...this.config },
					_data: this._data,
					_branch_data: this._branch_data,
					_connect: this._connect,
					_connect_branch: this._connect_branch,
					extend_struct: this.extend_struct,
				};
				const dataText = is_format
					? JSON.stringify(struct, null, 2)
					: JSON.stringify(struct);
				const fsp = require("fs").promises;
				return fsp
					.stat(saveDir)
					.catch((error: any) => {
						// 如果不存在存档文件夹，创建它
						return fsp.mkdir("Save");
					})
					.then(() =>
						Promise.all([
							// 异步写入元数据和存档数据
							fsp.writeFile(dataPath, dataText).catch((error: any) => {
								console.warn(error);
							}),
						])
					);
			}
			case "web": {
				const dataKey = `save_xr${suffix}.save`;
				let struct = {
					current: this.current_rw,
					current_b: this.current_rw_branch,
					config: { is_state: this.is_state, ...this.config },
					_data: this._data,
					_branch_data: this._branch_data,
					_connect: this._connect,
					_connect_branch: this._connect_branch,
					extend_struct: this.extend_struct,
				};
				return Promise.all([IDB.setItem(dataKey, struct)]);
			}
		}
	}
	async loadRWData(number: { toString: () => string }) {
		const suffix = number.toString().padStart(2, "0");
		let shell = Stats.shell;
		if (!Stats.debug && Stats.isMacOS()) {
			shell = "web";
		}
		switch (shell) {
			case "electron":
				// 推迟到栈尾执行
				await void 0;
				try {
					// 同步读取存档数据文件
					const path = Loader.route(`./Save/save_xr${suffix}.save`);
					const json = require("fs").readFileSync(path);
					let res = JSON.parse(json);
					this.current_rw = res.current;
					this.current_rw_branch = res.current_b;
					this._data = res._data;
					this._branch_data = res._branch_data;
					this.config = { ...res.config };
					this.is_state = res.config["is_state"];
					this._connect = res._connect;
					this._connect_branch = res._connect_branch;
					this.extend_struct = res.extend_struct;
				} catch (error) {
					console.warn(error);
					return;
				}
				break;
			case "web": {
				const key = `save${suffix}.save`;
				let res = await IDB.getItem(key);
				this.current_rw = res.current;
				this.current_rw_branch = res.current_b;
				this._data = res._data;
				this._branch_data = res._branch_data;
				this.config = { ...res.config };
				this.is_state = res.config["is_state"];
				this._connect = res._connect;
				this._connect_branch = res._connect_branch;
				this.extend_struct = res.extend_struct;
				break;
			}
		}
	}
	deleteRWData(number: { toString: () => string }) {
		const suffix = number.toString().padStart(2, "0");
		let shell = Stats.shell;
		if (!Stats.debug && Stats.isMacOS()) {
			shell = "web";
		}
		switch (shell) {
			case "electron": {
				const dataPath = Loader.route(`./Save/save_xr${suffix}.save`);
				const fsp = require("fs").promises;
				return Promise.all([
					// 异步删除元数据和存档数据
					fsp.unlink(dataPath).catch((error: any) => {
						console.warn(error);
					}),
				]);
			}
			case "web": {
				const dataKey = `save_xr${suffix}.save`;
				return Promise.all([IDB.removeItem(dataKey)]);
			}
		}
	}
	// 定义回调
	call() {
		switch (this.op) {
			case "base":
				switch (this.base_op) {
					case "load": {
						try {
							// 同步读取存档数据文件
							let p = xr.compileVar(this.loadPath);
							const path =
								!/[a-f0-9]{8}/.test(p) && !/[a-f0-9]{16}/.test(p)
									? Loader.route(p)
									: Loader.route(Loader.getPathByGUID(p));
							const json = require("fs").readFileSync(path);
							let res = JSON.parse(json);
							this.current_rw = res.current;
							this.current_rw_branch = res.current_b;
							this._data = res._data;
							this._branch_data = res._branch_data;
							this.config = { ...res.config };
							this.is_state = res.config["is_state"];
							this._connect = res._connect;
							this._connect_branch = res._connect_branch;
							this.extend_struct = res.extend_struct;
						} catch (e) {
							new Error_xr(
								"（加载任务文件）加载任务文件出错：",
								CurrentEvent,
								e
							);
						}
					}
					case "add":
						try {
							let _cache_obj: Record<string, any> = {};
							try {
								for (let i in this.set_rw_struct) {
									let match = this.set_rw_struct[i].match(
										/\s*(.*)\s*:\s*((?=\()\(?)\s*(.*)\s*((?=\))\)?)\s*/
									);
									if (
										match &&
										!_cache_obj.hasOwnProperty(xr.compileVar(match[1].trim()))
									) {
										// 解析成js值
										_cache_obj[xr.compileVar(match[1].trim())] = new Function(
											"return " + xr.compileVar(match[3].trim())
										)();
									} else {
										let sub_match = this.set_rw_struct[i].match(
											/\s*(.*)\s*:\s*(.*)\s*/
										);
										if (
											sub_match &&
											!_cache_obj.hasOwnProperty(
												xr.compileVar(sub_match[1].trim())
											)
										) {
											_cache_obj[xr.compileVar(sub_match[1].trim())] =
												xr.compileVar(sub_match[2].trim());
										} else {
											// 直接添加，但排除空格
											_cache_obj[xr.compileVar(this.set_rw_struct[i].trim())] =
												undefined;
										}
									}
								}
							} catch (e) {
								new Error_xr(
									"（添加任务）解析设置额外任务属性错误：",
									CurrentEvent,
									e
								);
							}
							this.add_task(
								{
									title: xr.compileVar(this.title_rw),
									type: this.type_rw,
									desc: xr.compileVar(this.desc_rw),
									tag: xr.compileVar(this.tag_rw),
									item: this.item_list_str,
									c_item: this.item_list_com,
								},
								_cache_obj,
								this.is_force_add
							);
						} catch (e) {
							new Error_xr("添加任务错误：", CurrentEvent, e);
						}
						break;
					case "remove":
						this.remove_task(xr.compileVar(this.remove_rw));
						break;
					case "get":
						var data = this.get_task(xr.compileVar(this.tag_rw), this.is_index);
						if (data) {
							CurrentEvent.attributes[this.save_var] = data;
						} else {
							CurrentEvent.attributes[this.save_var] = undefined;
						}
						break;
					case "set_default":
						if (this.is_state) {
							this.current_rw_branch = xr.compileVar(this.tag_rw);
						} else {
							this.current_rw = xr.compileVar(this.tag_rw);
						}
						break;
					case "get_default":
						CurrentEvent.attributes[this.save_var] = this.get_current();
						break;
					case "change_next":
						let next = this.get_connect(this.current_rw);
						if (next != -1 && next) {
							if (this.is_state) {
								this.current_rw_branch = next;
							} else {
								this.current_rw = next;
							}
						}
						break;
					case "check":
						try {
							// 查找任务，如果为查找到任务则报错
							if (this.is_reverse) {
								for (let i = this.data.length - 1; i >= 0; i--) {
									const commands = EventManager.guidMap[this.event_check];
									if (commands) {
										const event = new EventHandler(commands);
										// 继承变量
										if (this.inherit_check) {
											event.inheritEventContext(CurrentEvent);
										}
										event.attributes["@index"] = i;
										event.attributes["@result"] = this.data[i];
										EventHandler.call(event);
									}
								}
							} else {
								this.data.map((data, ind) => {
									const commands = EventManager.guidMap[this.event_check];
									if (commands) {
										const event = new EventHandler(commands);
										// 继承变量
										if (this.inherit_check) {
											event.inheritEventContext(CurrentEvent);
										}
										event.attributes["@index"] = ind;
										event.attributes["@result"] = data;
										EventHandler.call(event);
									}
								});
							}
						} catch (e) {
							new Error_xr("任务遍历错误：", CurrentEvent, e);
						}
						break;
					case "check_list":
						try {
							let tag = xr.compileVar(this.tag_rw);
							let task = this.get_task(tag);
							if (task != -1 && task) {
								for (let i in task["item"]) {
									const commands = EventManager.guidMap[this.event_check];
									if (commands) {
										const event = new EventHandler(commands);
										// 继承变量
										if (this.inherit_check) {
											event.inheritEventContext(CurrentEvent);
										}
										event.attributes["@index"] = i;
										let d_data = task["item"][i];
										let data_now = this.parse_type(d_data);
										event.attributes["@result"] = data_now;
										event.attributes["@result_rw"] = d_data;
										EventHandler.call(event);
									}
								}
							}
						} catch (e) {
							new Error_xr("任务物品列表错误：", CurrentEvent, e);
						}
						break;
					case "check_list_com":
						try {
							let tag = xr.compileVar(this.tag_rw);
							let task = this.get_task(tag);
							if (task != -1 && task) {
								for (let i in task["complete_item"]) {
									const commands = EventManager.guidMap[this.event_check];
									if (commands) {
										const event = new EventHandler(commands);
										// 继承变量
										if (this.inherit_check) {
											event.inheritEventContext(CurrentEvent);
										}
										event.attributes["@index"] = i;
										let d_data = task["complete_item"][i];
										let data_now = this.parse_type(d_data);
										event.attributes["@result"] = data_now;
										event.attributes["@result_rw"] = d_data;
										EventHandler.call(event);
									}
								}
							}
						} catch (e) {
							new Error_xr("任务完成物品列表错误：", CurrentEvent, e);
							throw e;
						}
						break;
					case "is_complete":
						CurrentEvent.attributes[this.save_var] = this.can_complete(
							xr.compileVar(this.tag_rw),
							this.event_complete_callback
						);
						break;
				}
				break;
			case "advanced":
				switch (this.advanced_op) {
					case "get_taskkey": {
						try {
							var ad_data = xr.compileVar(this.ad_get) as any;
							if (ad_data) {
								let str_split = String(this.ad_exp).trim().split(",");
								if (this.ad_option != "custom") {
									str_split = String(this.ad_option).split(",");
								}
								if (str_split.length > 1) {
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									// 填充数字键
									let save_arr: Record<string, any> = {};
									for (let j = 0; j < str_split.length; j++) {
										save_arr[`${j}`] = xr.compileVar(ad_data?.[str_split?.[j]]);
									}
									CurrentEvent.attributes[this.ad_save_var] = save_arr;
								} else {
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									CurrentEvent.attributes[this.ad_save_var] = xr.compileVar(
										ad_data?.[str_split[0]]
									);
								}
							}
						} catch (e) {
							new Error_xr("获取键值错误：", CurrentEvent, e);
						}
						break;
					}
					case "set_taskkey": {
						try {
							var ad_data = xr.compileVar(this.ad_get) as any;
							if (ad_data) {
								let str_split = String(this.ad_exp).trim().split(",");
								if (this.ad_option != "custom") {
									str_split = String(this.ad_option).split(",");
								}
								if (str_split.length > 1) {
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									setNestedProperty(
										String(this.ad_exp),
										xr.compileVar(String(this.ad_exp_val)),
										ad_data,
										this.not_string
									);
								} else {
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									let val = xr.compileVar(this.ad_exp_val);
									ad_data[str_split[0].trim()] = this.not_string
										? new Function("return " + val)()
										: val;
								}
							}
						} catch (e) {
							new Error_xr("设置键值错误：", CurrentEvent, e);
						}
						break;
					}
					case "get_itemkey":
						try {
							var ad_data = xr.compileVar(this.ad_get_itemkey);
							var sp = xr.compileVar(this.itemkey_attr);
							if (ad_data && sp) {
								let str_split = xr
									.compileVar(this.itemkey_key)
									.trim()
									.split(",");
								// 匹配属性
								let attr_split = sp.trim().split(",");
								if (str_split.length > 1) {
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									// 填充数字键
									let save_arr: Record<string, any> = {};
									if (ad_data[this.itemkey_type]) {
										ad_data?.[this.itemkey_type]?.forEach(
											(k: { [x: string]: any }) => {
												if (
													k["id"] == attr_split[1].trim() &&
													k["type"] == attr_split[0].trim()
												) {
													// 循环获取属性
													for (let j in str_split) {
														save_arr[`${j}`] = k[str_split[j].trim()];
													}
													return true;
												}
											}
										);
									} else {
										for (let k in ad_data) {
											if (
												ad_data["id"] == attr_split[1].trim() &&
												ad_data["type"] == attr_split[0].trim()
											) {
												// 循环获取属性
												for (let j in str_split) {
													save_arr[`${j}`] = k[str_split[j].trim()];
												}
												return true;
											}
										}
									}
									CurrentEvent.attributes[this.ad_save_var] = save_arr;
								} else {
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									if (ad_data[this.itemkey_type]) {
										ad_data?.[this.itemkey_type]?.forEach(
											(k: {
												[x: string]:
													| string
													| number
													| boolean
													| object
													| undefined;
											}) => {
												if (
													k["id"] == attr_split[1].trim() &&
													k["type"] == attr_split[0].trim()
												) {
													// 获取属性
													CurrentEvent.attributes[this.ad_save_var] =
														k[str_split[0].trim()];
													return true;
												}
											}
										);
									} else {
										if (
											ad_data["id"] == attr_split[1].trim() &&
											ad_data["type"] == attr_split[0].trim()
										) {
											// 获取属性
											CurrentEvent.attributes[this.ad_save_var] =
												ad_data[str_split[0].trim()];
										}
									}
								}
							}
						} catch (e) {
							new Error_xr("获取物品键值错误：", CurrentEvent, e);
						}
						break;
					case "set_itemkey":
						try {
							var ad_data = xr.compileVar(this.ad_get_itemkey);
							var sp = xr.compileVar(this.itemkey_attr);
							if (ad_data && sp) {
								let str_split = xr
									.compileVar(this.itemkey_key)
									.trim()
									.split(",");
								// 自己是否是对象，是的话从自身获取
								if (!(typeof ad_data == "object")) {
									ad_data = CurrentEvent.attributes[ad_data];
								}
								// 匹配属性
								let attr_split = sp.trim().split(",");
								let val = xr.compileVar(this.itemkey_val).split(",");
								if (str_split.length > 1) {
									if (ad_data[this.itemkey_type]) {
										ad_data?.[this.itemkey_type]?.forEach(
											(k: { [x: string]: any }) => {
												if (
													k["id"] == attr_split[1].trim() &&
													k["type"] == attr_split[0].trim()
												) {
													// 循环设置属性
													for (let j in str_split) {
														k[str_split[`${j}`].trim()] = this.not_string
															? new Function("return " + val[j])()
															: val[j];
													}
													return true;
												}
											}
										);
									} else {
										for (let k in ad_data) {
											if (
												ad_data["id"] == attr_split[1].trim() &&
												ad_data["type"] == attr_split[0].trim()
											) {
												// 循环设置属性
												for (let j in str_split) {
													const key = str_split[j] as string;
													// @ts-expect-error
													k[key] = this.not_string
														? new Function("return " + val[j])()
														: val[j];
												}
												return true;
											}
										}
									}
								} else {
									let val = xr.compileVar(this.itemkey_val);
									// 自己是否是对象，是的话从自身获取
									if (!(typeof ad_data == "object")) {
										ad_data = CurrentEvent.attributes[ad_data];
									}
									if (ad_data[this.itemkey_type]) {
										ad_data?.[this.itemkey_type]?.forEach(
											(k: { [x: string]: any }) => {
												if (
													k["id"] == attr_split[1].trim() &&
													k["type"] == attr_split[0].trim()
												) {
													// 设置属性
													k[str_split[0].trim()] = this.not_string
														? new Function("return " + val)()
														: val;
													return true;
												}
											}
										);
									} else {
										if (
											ad_data["id"] == attr_split[1].trim() &&
											ad_data["type"] == attr_split[0].trim()
										) {
											// 设置属性
											ad_data[str_split[0].trim()] = this.not_string
												? new Function("return " + val)()
												: val;
											return true;
										}
									}
								}
							}
						} catch (e) {
							new Error_xr("设置物品键值错误：", CurrentEvent, e);
						}
						break;
					case "add_con": {
						const k = xr.compileVar(this.con_tag) as string;
						this.connect[k] = xr.compileVar(this.con_to_tag);
						break;
					}
					case "dis_con": {
						const k = xr.compileVar(this.con_tag) as string;
						delete this.connect[k];
						break;
					}
					case "add_e":
						try {
							for (let i in this.rw_struct) {
								let match = this.rw_struct[i].match(
									/\s*(.*)\s*:\s*((?=\()\(?)\s*(.*)\s*((?=\))\)?)\s*/
								);
								if (
									match &&
									!this.extend_struct.hasOwnProperty(xr.compileVar(match[1]))
								) {
									// 解析成js值
									this.extend_struct[xr.compileVar(match[1])] = new Function(
										"return " + xr.compileVar(match[3])
									)();
								} else {
									let sub_match = this.rw_struct[i].match(
										/\s*(.*)\s*:\s*(.*)\s*/
									);
									if (
										sub_match &&
										!this.extend_struct.hasOwnProperty(
											xr.compileVar(sub_match[1])
										)
									) {
										this.extend_struct[xr.compileVar(sub_match[1])] =
											xr.compileVar(sub_match[2]);
									} else {
										// 直接添加，但排除空格
										this.extend_struct[
											xr.compileVar(this.rw_struct[i].trim())
										] = undefined;
									}
								}
							}
						} catch (e) {
							new Error_xr("解析扩展任务结构值错误：", CurrentEvent, e);
						}
						break;
				}
				break;
			case "other":
				switch (this.other_op) {
					case "read":
						this.loadRWData(xr.compileVar(this.rw_data_num));
						break;
					case "remove":
						this.deleteRWData(xr.compileVar(this.rw_data_num));
						break;
					case "save":
						this.saveRwData(
							xr.compileVar(this.rw_data_num),
							this.rw_data_format
						);
						break;
					case "show":
						xr.showInfo();
						break;
					case "is_branch":
						CurrentEvent.attributes[this.other_save_var] = this.is_state;
						break;
					case "change":
						//如果当前数据源是切换的数据源则不操作
						if (this.other_change_type == "master") {
							if (this.is_state) {
								this.is_state = false;
							}
						} else if (this.other_change_type == "branch") {
							if (!this.is_state) {
								this.is_state = true;
							}
						}
						break;
				}
				break;
		}
	}
	// 定义方法
	parse_type(d_data: {
		type: any;
		id: string;
		talk: any;
		num: string;
		op: string;
		val: string;
	}) {
		let data_now;
		switch (d_data.type) {
			case "elem": {
				try {
					data_now = UI.get(d_data.id);
				} catch (e) {
					new Error_xr("(解析)元素类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "trigger": {
				try {
					data_now = new Trigger(Data.triggers[d_data.id]!);
				} catch (e) {
					new Error_xr("(解析)触发器类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "actor": {
				try {
					data_now = (
						Data.actors[d_data.id]
							? new Actor(Data.actors[d_data.id]!)
							: new Actor(
									(Scene.binding?.entity.presetIdMap[d_data.id] as any)?.data
							  )
					) as Actor & { [k: string]: any };
					data_now.talk = d_data.talk ? d_data.talk : false;
				} catch (e) {
					new Error_xr("(解析)角色类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "skill": {
				try {
					data_now = new Skill(Data.skills[d_data.id]!);
				} catch (e) {
					new Error_xr("(解析)技能类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "state": {
				try {
					data_now = new State(Data.states[d_data.id]!);
				} catch (e) {
					new Error_xr("(解析)状态类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "equip": {
				try {
					data_now = new Equipment(Data.equipments[d_data.id]!);
				} catch (e) {
					new Error_xr("(解析)装备类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "item": {
				try {
					data_now = new Item(Data.items[d_data.id]!);
					data_now.quantity +=
						parseFloat(d_data.num) < 0 ? 1 : parseFloat(d_data.num);
				} catch (e) {
					new Error_xr("(解析)物品类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "var": {
				// 变量计算
				try {
					let v_data = Variable.get(d_data.id);
					let eval_str =
						"return " +
						v_data +
						" " +
						d_data.op +
						" " +
						d_data.val +
						" ? true : false";
					data_now = { ...d_data, calc: new Function(eval_str)() };
				} catch (e) {
					new Error_xr("(解析)变量类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "event": {
				try {
					let num = parseFloat(d_data.num);
					const commands = EventManager.guidMap[d_data.id];
					if (commands) {
						for (let i = 0; i < num; i++) {
							const event = new EventHandler(commands);
							event.attributes["@index"] = i;
							EventHandler.call(event);
						}
					}
				} catch (e) {
					new Error_xr("(解析)事件类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "master": {
				try {
					this._data.map(data => {
						if (data.tag == d_data.id) {
							return (data_now = data);
						}
					});
					if (!data_now) throw new Error("无法确定主线");
				} catch (e) {
					new Error_xr("(解析)主线类型错误：", CurrentEvent, e);
				}
				break;
			}
			case "branch": {
				try {
					this._branch_data.map(data => {
						if (data.tag == d_data.id) {
							return (data_now = data);
						}
					});
					if (!data_now) throw new Error("无法确定分支");
				} catch (e) {
					new Error_xr("(解析)分支类型错误：", CurrentEvent, e);
				}
				break;
			}
			default: {
				try {
					data_now = d_data;
				} catch (e) {
					new Error_xr("(解析)自定义类型错误：", CurrentEvent, e);
				}
				break;
			}
		}
		return data_now;
	}
	/**
	 * @description: 获取任务物品列表
	 * @param {*} tag
	 * @param {*} type  0（检查任务列表）|| 1（完成任务列表）
	 * @return {*}
	 */
	get_item_list(tag: any, type = 0) {
		let find = this.get_task(tag);
		if (find) {
			return undefined;
		}
		switch (this.type) {
			case 0:
				return find.item;
			case 1:
				return find.complete_item;
		}
	}

	/**
	 * @description: 添加任务
	 * @param {*} title
	 * @param {*} desc
	 * @param {*} item
	 * @param {*} c_item
	 * @param {*} state
	 * @param {*} tag
	 * @param {*} is_force_add 强制添加
	 * @return {*}
	 */
	add_task(
		{
			title,
			desc,
			item = [],
			c_item = [],
			state = false,
			tag = -1,
		}: AddTaskProps,
		task_extend: Record<string, any> = {},
		is_force_add = false
	) {
		// 解析任务物品
		let map_to = [
			"item",
			"actor",
			"skill",
			"equip",
			"state",
			"var",
			"event",
			"trigger",
			"elem",
			"branch",
			"master",
		];
		// 编译物品列表
		let item_jx = [];
		let reg_num = /^[0-9]+.?[0-9]*/;
		let item_ex: Record<string, any>;
		for (let i in item) {
			let str_splice = String(item[i]).trim().split(",");
			item_ex = {
				item: { num: parseFloat(String(str_splice[2]).trim()) },
				equip: { num: parseFloat(String(str_splice[2]).trim()) },
				event: { num: parseFloat(String(str_splice[2]).trim()) },
				trigger: { name: String(str_splice[2]).trim() },
				elem: { name: String(str_splice[2]).trim() },
				actor: { talk: false },
				var: {
					op: String(str_splice[2]).trim(),
					val: String(str_splice[3]).trim(),
					name: str_splice[4]?.trim(),
				},
			};
			// 不是有效任务物品将不会被添加
			if (map_to.includes(String(str_splice[0]).trim())) {
				// 检测物品和装备任务是否有效
				if (
					String(str_splice[0]).trim() == "item" ||
					String(str_splice[0]).trim() == "equip"
				) {
					if (!reg_num.test(String(str_splice[2]).trim())) {
						continue;
					}
				}
				// 检测变量任务是否有效
				const key = str_splice[0].trim();
				if (str_splice[0] && key == "var") {
					const targetObj = item_ex[key];
					if (targetObj) {
						if (!targetObj.op || !targetObj.val) {
							continue;
						}
						if (!targetObj.name) {
							item_ex[key] = "全局变量" + str_splice[1];
						}
					}
				}
				item_jx.push({
					type: String(str_splice[0]).trim(),
					id: String(str_splice[1]).trim(),
					...item_ex[String(str_splice[0]).trim()],
				});
			} else if (is_force_add) {
				// 自定义属性
				//解析额外属性
				let custom_item_ex: Record<string, any> = {};
				for (let ie = 2; ie < str_splice.length; ie++) {
					let reg = /\s*(.*)\s*:\s*(.*)\s*/;
					let keyval = str_splice[ie].trim();
					if (reg.test(keyval)) {
						let _arr = keyval.match(reg);
						if (_arr && !custom_item_ex.hasOwnProperty(_arr[1])) {
							const key = xr.compileVar(_arr[1]) as string;
							custom_item_ex[key] = xr.compileVar(_arr[2]);
						}
					} else {
						continue;
					}
				}
				item_jx.push({
					type: String(str_splice[0]).trim(),
					id: String(str_splice[1]).trim(),
					...item_ex[String(str_splice[0]).trim()],
					...custom_item_ex,
				});
			}
		}
		// 编译完成物品列表
		let complete_item = [];
		let item_ex1: Record<string, any>;
		for (let i in c_item) {
			let str_splice = String(c_item[i]).trim().split(",");
			item_ex1 = {
				item: { num: parseFloat(String(str_splice[2]).trim()) },
				equip: { num: parseFloat(String(str_splice[2]).trim()) },
				event: { num: parseFloat(String(str_splice[2]).trim()) },
				trigger: { name: String(str_splice[2]).trim() },
				elem: { name: String(str_splice[2]).trim() },
				actor: { talk: false },
				var: {
					op: String(str_splice[2]).trim(),
					val: String(str_splice[3]).trim(),
					name: str_splice[4]?.trim(),
				},
			};
			// 不是有效任务物品将不会被添加
			if (map_to.includes(String(str_splice[0]).trim())) {
				// 检测物品和装备任务是否有效
				if (
					String(str_splice[0]).trim() == "item" ||
					String(str_splice[0]).trim() == "equip"
				) {
					if (!reg_num.test(String(str_splice[2]).trim())) {
						continue;
					}
				}
				// 检测变量任务是否有效
				const key = str_splice[0].trim();
				if (str_splice[0] && key == "var") {
					const targetObj = item_ex1[key];
					if (targetObj) {
						if (!targetObj.op || !targetObj.val) {
							continue;
						}
						if (!targetObj.name) {
							item_ex1[key] = "全局变量" + str_splice[1];
						}
					}
				}
				complete_item.push({
					type: String(str_splice[0]).trim(),
					id: String(str_splice[1]).trim(),
					...item_ex1[String(str_splice[0]).trim()],
				});
			} else if (is_force_add) {
				// 自定义属性
				//解析额外属性
				let custom_item_ex: Record<string, any> = {};
				for (let ie = 2; ie < str_splice.length; ie++) {
					let reg = /\s*(.*)\s*:\s*(.*)\s*/;
					let keyval = str_splice[ie].trim();
					if (reg.test(keyval)) {
						let _arr = keyval.match(reg);
						if (_arr && !custom_item_ex.hasOwnProperty(_arr[1])) {
							const key = xr.compileVar(_arr[1]) as string;
							custom_item_ex[key] = xr.compileVar(_arr[2]);
						}
					} else {
						continue;
					}
				}
				complete_item.push({
					type: String(str_splice[0]).trim(),
					id: String(str_splice[1]).trim(),
					...item_ex1[String(str_splice[0]).trim()],
					...custom_item_ex,
				});
			}
		}
		if (tag !== -1) {
			let _e_cache = Object.assign({}, this.extend_struct);
			// 设置额外任务属性结构
			for (let key in task_extend) {
				if (_e_cache.hasOwnProperty(key)) {
					// 判断值是否相同，不同就设置
					if (_e_cache[key] != task_extend[key])
						_e_cache[key] = task_extend[key];
				}
			}
			this.data.push({
				title,
				desc,
				tag,
				state,
				item: item_jx,
				complete_item,
				..._e_cache,
			});
		}
	}
	/**
	 * @description: 查找任务，通过tag
	 * @param {*} tag 标识
	 * @return {*}
	 */
	find_task(tag: any) {
		let f_index = -1;
		this.data.map((data, ind) => {
			if (data.tag == tag) {
				f_index = ind;
				return f_index;
			}
		});
		return f_index;
	}
	/**
	 * @description: 删除任务
	 * @param {*} tag 任务标识
	 * @return {*}
	 */
	remove_task(tag: string | number) {
		if (this.find_task(tag) != -1) {
			this.data.map((data, ind) => {
				if (data.tag == tag) {
					delete data[tag];
					return true;
				}
			});
			return false;
		}
	}
	/**
	 * @description: 获取任务
	 * @param {*} tag 任务标识
	 * @return {*}
	 */
	get_task(tag: number, is_index = false) {
		if (is_index) {
			return this.data[tag] ? this.data[tag] : undefined;
		}
		let data = this.find_task(tag);
		if (data != -1) {
			return this.data[data];
		}
		return undefined;
	}

	/**
	 * @description: 判断指定任务是否可以完成
	 * @param {*} tag
	 * @return {*}
	 */
	can_complete(tag: any, callback = "") {
		let task_data = this.get_task(tag);
		if (task_data != -1 && task_data) {
			let items = task_data["item"];
			let duibi = Array(items.length).fill(true);
			let now_duibi = [];
			// 缓存
			let _cacheMap: Record<string, any> | undefined = {};
			for (let i in items) {
				let item = items[i];
				let aci = Party.player?.inventory;
				let acs = Party.player?.skill;
				let acst = Party.player?.state;
				const itemId = item.id;
				// 如果是物品
				if (item.type == "item") {
					// 判断id是否存在，存在就在里面取数量
					if (_cacheMap.hasOwnProperty(itemId)) {
						if (
							aci &&
							itemId == aci.get(itemId)?.id &&
							_cacheMap[itemId] >= parseFloat(item.num)
						) {
							_cacheMap[itemId] = _cacheMap[itemId] - parseFloat(item.num);
							now_duibi.push(true);
							continue;
						}
					} else {
						if (
							aci &&
							itemId == aci.get(itemId)?.id &&
							aci.count(itemId) >= parseFloat(item.num)
						) {
							_cacheMap[itemId] = aci.count(itemId) - parseFloat(item.num);
							now_duibi.push(true);
							continue;
						}
					}
				} else if (item.type == "equip" && aci) {
					let eq_obj =
						aci.get(itemId) instanceof Equipment ? aci.get(itemId) : undefined;
					if (itemId == eq_obj?.id) {
						now_duibi.push(true);
						continue;
					}
				} else if (item.type == "actor") {
					if (item?.talk) {
						now_duibi.push(true);
						continue;
					}
				} else if (item.type == "var") {
					// 变量计算
					let v_data = Variable.get(item.id);
					let eval_str =
						"return " +
						v_data +
						" " +
						item.op +
						" " +
						item.val +
						" ? true : false";
					if (new Function(eval_str)()) {
						now_duibi.push(true);
						continue;
					}
				} else if (item.type == "skill" && acs) {
					if (acs.get(item?.id)) {
						now_duibi.push(true);
						continue;
					}
				} else if (item.type == "state" && acst) {
					if (acst.get(item?.id)) {
						now_duibi.push(true);
						continue;
					}
				} else {
					// 不能处理的类型
					const commands = EventManager.guidMap[callback];
					if (commands) {
						const event = new EventHandler(commands);
						let data_now = this.parse_type(item);
						event.attributes["@result"] = data_now;
						event.attributes["@result_rw"] = item;
						event.attributes["@index"] = i;
						event.attributes["@return"] = false;
						EventHandler.call(event);
						if (
							typeof event.attributes["@return"] == "boolean" &&
							event.attributes["@return"]
						) {
							now_duibi.push(true);
							continue;
						}
					}
				}
				now_duibi.push(false);
			}
			_cacheMap = undefined;
			if (
				duibi.length === now_duibi.length &&
				duibi.every((v, i) => v === now_duibi[i])
			) {
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	/**
	 * @description: 获取当前任务
	 * @return {*}
	 */
	get_current() {
		let rw;
		if (this.is_state) {
			rw = this.get_task(this.current_rw_branch);
		} else {
			rw = this.get_task(this.current_rw);
		}
		return rw;
	}
	/**
	 * @description: 获取对应链接关系
	 * @param {*} tag 标识
	 * @return {*}
	 */
	get_connect(tag: number) {
		return this.connect[tag] ? this.connect[tag] : -1;
	}
}
