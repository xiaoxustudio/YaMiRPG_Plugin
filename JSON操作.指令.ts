/*
 * @Author: xuranXYS
 * @LastEditTime: 2025-04-09 22:30:06
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 * 

 */

/*
@plugin Json操作
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

可以创建JSON对象
对JSON对象进行操作

空对象：创建一个空的对象
变量对象：将变量中的JSON对象复制过来
填充对象：使用输入的键值作为对象
字符串JSON：将JSON字符串转换为JSON对象

键列表和值列表可一次添加多个（逗号分割）
键列表会移除空格
键列表和值列表可使用<local|global:var_name>


@option op {"create_json","get_key_val","add_key_val","rm_key","is_key","map_json","change_str_json"}
@alias 操作 {创建JSON,获取键,设置键值,移除键,键是否存在,遍历键值,转换为JSON字符串}

@option create_sub {"null_obj","var_obj","fill_obj","str_json"}
@alias 类型 {空对象,变量对象,填充对象,字符串JSON}
@cond op {"create_json"} 
@desc 
空对象：创建一个空的对象
变量对象：将变量中的JSON对象复制过来
填充对象：使用输入的键值作为对象
字符串JSON：将JSON字符串转换为JSON对象

@string key_list_f
@alias 键列表
@cond create_sub {"fill_obj"}
@desc key列表（多个用逗号分割）

@string val_list_f
@alias 值列表
@cond create_sub {"fill_obj"}
@desc value列表（多个用逗号分割）

@string extend_var
@alias 继承变量
@cond create_sub {"var_obj"}
@desc 继承变量里面的JSON对象

@string json_content
@alias json字符串
@cond create_sub {"str_json"}
@desc 将JSON字符串转换为JSON对象


@string set_var
@alias 目标变量
@default "json_obj"
@desc 设置要操作的目标对象
@cond op {"add_key_val","is_key","map_json","change_str_json","get_key_val"}

@string key_list
@alias 键列表
@cond op {"add_key_val","rm_key","is_key","get_key_val"}
@desc key列表（多个用逗号分割）

@string val_list
@alias 值列表
@cond op {"add_key_val"}
@desc value列表（多个用逗号分割）


@string save_var
@alias 存储变量
@default "json_obj"
@desc 操作结果存储到本地变量
@cond op {"create_json","is_key","change_str_json","get_key_val"}

@file event_map
@filter event
@alias 遍历事件
@desc 固定变量：
$key：遍历出的键
$val：遍历出的值
@cond op {"map_json"} 
*/

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
			const target = matches[i];
			//其他类型
			if (target["type"] == "local") {
				for (let k in xr.mapTo) {
					if (k == target["content"]) {
						target["content"] = xr.mapTo[k as keyof typeof xr.mapTo];
					}
				}
				if (typeof CurrentEvent.attributes[target["content"]] == "object") {
					return CurrentEvent.attributes[target["content"]];
				}
				// 其他变量
				msg = msg.replace(
					"<" + target["type"] + ":" + target["content"] + ">",
					CurrentEvent.attributes[target["content"]] as string
				);
			}
			if (target["type"] == "global") {
				if (typeof xr.get_global(target["content"]) == "object") {
					const data = xr.get_global(target["content"]) as any;
					const ms_l: Record<string, any> = {};
					for (let obj_name in data) {
						if (typeof data[obj_name] != "object") {
							ms_l[obj_name] = data[obj_name];
						} else {
							ms_l[obj_name] = xr.convertToJSON(data[obj_name]);
						}
					}
					msg = String(msg).replace(
						"<" + target["type"] + ":" + target["content"] + ">",
						xr.convertToJSON(ms_l)
					);
				} else {
					msg = String(msg).replace(
						"<" + target["type"] + ":" + target["content"] + ">",
						xr.get_global(target["content"]) as string
					);
				}
			}
		}
		return msg;
	}
}

export default class JSON_xr {
	op: string;
	create_sub: string;
	save_var: string;
	extend_var: string;
	key_list_f: string;
	val_list_f: string;
	json_content: string;
	key_list: string;
	set_var: string;
	event_map: string | undefined;
	val_list: string;
	constructor() {
		this.op = "";
		this.create_sub = "";
		this.save_var = "";
		this.extend_var = "";
		this.key_list_f = "";
		this.val_list_f = "";
		this.json_content = "";
		this.key_list = "";
		this.set_var = "";
		this.event_map = "";
		this.val_list = "";
	}
	call() {
		switch (this.op) {
			case "create_json":
				switch (this.create_sub) {
					case "null_obj":
						CurrentEvent.attributes[String(this.save_var)] = {};
						break;
					case "var_obj":
						var var_str =
							CurrentEvent.attributes[xr.compileVar(this.extend_var)];
						CurrentEvent.attributes[String(this.save_var)] =
							typeof var_str == "object"
								? Object.assign({}, var_str)
								: undefined;
						break;
					case "fill_obj":
						var key = xr.compileVar(String(this.key_list_f)).split(",");
						key.map((val: string, index: number) => {
							key[index] = val.trim();
						});
						var val = xr.compileVar(String(this.val_list_f)).split(",");
						val.map((vals: string, index: number) => {
							val[index] = vals.trim();
						});
						if (key.length > 1) {
							for (let i = 0; i < key.length; i++) {
								const target = CurrentEvent.attributes[this.save_var] as object;
								if (target && xr.is_obj(target)) {
									const k = key[i] as string;
									(
										CurrentEvent.attributes[this.save_var] as Record<
											string,
											any
										>
									)[k] = xr.compileVar(val[String(i)]);
								}
							}
						} else {
							const target = CurrentEvent.attributes[
								String(this.save_var)
							] as object;
							if (xr.is_obj(target)) {
								const k = key[0] as string;
								(
									CurrentEvent.attributes[String(this.save_var)] as Record<
										string,
										any
									>
								)[k] = xr.compileVar(this.val_list);
							}
						}
						key = undefined;
						val = undefined;
						break;
					case "str_json":
						try {
							let json_str = xr.compileVar(this.json_content);
							var json_p = JSON.parse(json_str);
							CurrentEvent.attributes[String(this.save_var)] = Object.assign(
								{},
								json_p
							);
							json_p = undefined;
						} catch {
							CurrentEvent.attributes[String(this.save_var)] = undefined;
						}
						break;
				}
				break;
			case "get_key_val":
				var key = xr.compileVar(String(this.key_list)).split(",");
				key.map((val: string, index: number) => {
					key[index] = val.trim();
				});
				if (key.length > 1) {
					let arr = [];
					for (let i = 0; i < key.length; i++) {
						const target = CurrentEvent.attributes[
							String(this.set_var)
						] as Record<string, any>;
						if (target && xr.is_obj(target)) {
							arr.push(target[xr.compileVar(val[String(i)])]);
						}
					}
					CurrentEvent.attributes[String(this.save_var)] = arr;
				} else {
					const target = CurrentEvent.attributes[
						String(this.set_var)
					] as Record<string, any>;
					if (xr.is_obj(target)) {
						CurrentEvent.attributes[String(this.save_var)] = target[key[0]];
					}
				}
				key = undefined;
				break;
			case "add_key_val":
				var key = xr.compileVar(String(this.key_list)).split(",");
				key.map((val: string, index: number) => {
					key[index] = val.trim();
				});
				var val = xr.compileVar(String(this.val_list)).split(",");
				val.map((vals: string, index: number) => {
					val[index] = vals.trim();
				});
				if (key.length > 1) {
					for (let i = 0; i < key.length; i++) {
						const target = CurrentEvent.attributes[
							String(this.set_var)
						] as Record<string, any>;
						if (xr.is_obj(target)) {
							target[key[i]] = xr.compileVar(val[String(i)]);
						}
					}
				} else {
					const target = CurrentEvent.attributes[
						String(this.set_var)
					] as Record<string, any>;
					if (xr.is_obj(target)) {
						target[key[0]] = xr.compileVar(this.val_list);
					}
				}
				key = undefined;
				val = undefined;
				break;
			case "rm_key":
				if (typeof CurrentEvent.attributes[String(this.set_var)] == "object") {
					var key = xr.compileVar(String(this.key_list)).split(",");
					key.map((val: string, index: number) => {
						key[index] = val.trim();
					});
					if (key.length > 1) {
						for (let i = 0; i < key.length; i++) {
							const k = key[i] as string;
							if (CurrentEvent.attributes[String(this.set_var)])
								delete (CurrentEvent.attributes[this.set_var] as any)[k];
						}
					} else {
						const k = key[0] as string;
						delete (CurrentEvent.attributes[this.set_var] as any)[k];
					}
				}
				break;
			case "is_key":
				if (typeof CurrentEvent.attributes[String(this.set_var)] == "object") {
					var key = xr.compileVar(String(this.key_list)).split(",");
					key.map((val: string, index: number) => {
						key[index] = val.trim();
					});
					var db_arr = Array(key.length).fill(true);
					if (key.length > 1) {
						for (let i = 0; i < key.length; i++) {
							const target = CurrentEvent.attributes[
								String(this.set_var)
							] as Record<string, any>;
							if (target[key[i]]) {
								db_arr = db_arr.slice(0, 1);
								continue;
							}
						}
						if (db_arr.length == 0) {
							CurrentEvent.attributes[String(this.save_var)] = true;
						} else {
							CurrentEvent.attributes[String(this.save_var)] = false;
						}
					} else {
						const target = CurrentEvent.attributes[
							String(this.set_var)
						] as Record<string, any>;
						CurrentEvent.attributes[String(this.save_var)] =
							typeof target[key[0]] !== "undefined" ? true : false;
					}
				}
				break;
			case "map_json":
				var arr = CurrentEvent.attributes[xr.compileVar(this.set_var)] as any;
				var emap = this.event_map;
				if (typeof arr == "object" && emap) {
					for (let i in arr) {
						const commands = EventManager.guidMap[emap];
						if (commands) {
							const e_event = new EventHandler(commands);
							e_event.inheritEventContext(CurrentEvent);
							e_event.attributes["$key"] = i;
							e_event.attributes["$val"] = arr[i];
							EventHandler.call(e_event);
						}
					}
				}
				arr = undefined;
				emap = undefined;
				break;
			case "change_str_json":
				var v1 = CurrentEvent.attributes[xr.compileVar(this.set_var)];
				if (typeof v1 == "object") {
					CurrentEvent.attributes[this.save_var] = JSON.stringify(v1);
				}
				break;
		}
	}
}
