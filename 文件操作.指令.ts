/*
 * @Author: xuranXYS
 * @LastEditTime: 2025-04-09 11:19:20
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 文件操作
@version 1.4
@author 徐然
@link https://space.bilibili.com/291565199
@desc

基于fs的文件操作

路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹
PS：可用GUID判断文件是否存在
PS：我们统一用的是/作为路径分割符

@option op {'read_file','write_file','exist_file','is_directory','show_file','get_info','rename','delete'}
@alias 操作 {读取文件,写入文件,文件是否存在,是否是目录,列出目录,获取文件/夹信息,重命名文件/夹,删除文件/夹}

@string file_path
@alias 文件路径
@cond op {'read_file','write_file','exist_file','show_file','is_directory','rename','delete','get_info'}
@desc 
路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹
PS：可用GUID判断文件是否存在

@string file_name
@alias 重命名为
@cond op {'rename'}
@desc

@boolean is_save_guid 
@alias 保存guid
@default true
@cond op {'rename'}
@desc
如果有GUID则保留

@variable-getter show_save_var
@alias 保存变量
@cond op {'show_file'}

@boolean show_add_prefix 
@alias 路径加上父目录
@default false
@cond op {'show_file'}

@option op_path_type {'txt','json','xml','html'}
@alias 文件保存类型 {text,json,xml,html}
@default text
@cond op {'read_file'}
@desc
text：使用纯文本解析
json：使用JSON解析
xml：使用XML解析
html：使用HTML解析

@variable-getter save_var
@alias 内容保存变量
@cond op {'read_file'}

@string file_content
@alias 写入内容
@cond op {'write_file'}

@boolean is_create
@alias 自动创建目录
@default false
@cond op {'write_file'}

@boolean is_append
@alias 追加到文件
@default false
@cond op {'write_file'}


@variable-getter save_res_var
@alias 写入结果变量
@cond op {'write_file'}

@variable-getter save_exist_var
@alias 结果变量
@cond op {'exist_file','is_directory','rename','delete','get_info'}

@option op_encoding {'gbk','utf-8','utf8','ascii','base64','base64url','binary','hex','latin1','ucs-2','ucs2','utf16le'}
@alias 文件编码 {gbk,utf-8,utf8,ascii,base64,base64url,binary,hex,latin1,ucs-2,ucs2,utf16le}
@default gbk
@cond op {'read_file','write_file'}

*/

const fs = require("fs");

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

class File_xr {
	static MkdirsSync(dirname: string) {
		return fs.mkdirSync(dirname, { recursive: true });
	}
	static read(path: string, en: BufferEncoding) {
		try {
			const str = fs.readFileSync(path);
			return str.toString(en);
		} catch {
			return null;
		}
	}
	static write(
		path: string,
		text: string,
		create = false,
		append = false,
		en: NodeJS.BufferEncoding = "utf-8"
	) {
		if (create)
			if (!fs.existsSync(path))
				File_xr.MkdirsSync(String(path).slice(0, path.lastIndexOf("/")));
		try {
			if (!append) {
				fs.writeFileSync(path, text, { encoding: en });
			} else {
				fs.appendFileSync(path, text, {
					encoding: en,
				});
			}
			return true;
		} catch {
			return false;
		}
	}
	static is_json(a: string) {
		try {
			JSON.parse(a);
			return true;
		} catch {
			return false;
		}
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
	static compiltePath(text: string) {
		text = xr.compileVar(text);
		const trans_char = (__text = __dirname) => {
			let _path_local = __text.replace(/\\/, "/");
			while (/\\/.test(_path_local)) {
				_path_local = _path_local.replace(/\\/, "/");
			}
			return _path_local;
		};
		if (text.startsWith("$")) {
			text = text.slice(1, text.length);
			return trans_char(Loader.route("Assets")) + "/" + text;
		} else if (text.startsWith("%")) {
			text = text.slice(1, text.length);
			return trans_char(Loader.route("")) + "/" + text;
		}
		if (/[a-f0-9]{16}/i.test(text) && Loader.getPathByGUID(text).length > 0) {
			return trans_char(__dirname) + "/" + Loader.getPathByGUID(text);
		} else {
			return text;
		}
	}
}

export default class File_xr_once {
	op: string;
	file_path: string;
	op_encoding: BufferEncoding;
	op_path_type: string;
	file_content: string;
	file_name: string;
	is_create: boolean;
	is_append: boolean;
	show_add_prefix: boolean;
	is_save_guid: boolean;
	save_var: VariableSetter | null;
	save_res_var: VariableSetter | null;
	save_exist_var: VariableSetter | null;
	show_save_var: VariableSetter | null;
	constructor() {
		this.op = "";
		this.file_path = "";
		this.op_encoding = "utf-8";
		this.op_path_type = "";
		this.file_content = "";
		this.file_name = "";
		this.is_create = false;
		this.is_append = false;
		this.show_add_prefix = false;
		this.is_save_guid = false;
		this.save_var = null;
		this.save_res_var = null;
		this.save_exist_var = null;
		this.show_save_var = null;
	}
	call() {
		switch (this.op) {
			case "read_file": {
				let data =
					File_xr.read(
						File_xr.compiltePath(this.file_path),
						this.op_encoding
					) || "";
				const dom_p = new DOMParser();
				this.save_var?.set(
					this.op_path_type == "txt"
						? data
						: this.op_path_type == "json" && File_xr.is_json(data)
						? JSON.parse(data)
						: this.op_path_type == "xml"
						? dom_p.parseFromString(data, "text/xml")
						: this.op_path_type == "html"
						? dom_p.parseFromString(data, "text/html")
						: data
				);
				break;
			}
			case "write_file": {
				let data = xr.compileVar(this.file_content) as any;
				const serializer = new XMLSerializer();
				if (data instanceof XMLDocument || data instanceof Document) {
					data = serializer.serializeToString(data);
				}
				let res = File_xr.write(
					File_xr.compiltePath(this.file_path),
					data,
					this.is_create ? true : false,
					this.is_append ? true : false,
					this.op_encoding
				);
				this.save_res_var?.set(res);
				break;
			}
			case "exist_file":
				this.save_exist_var?.set(
					fs.existsSync(File_xr.compiltePath(this.file_path))
				);
				break;
			case "is_directory":
				try {
					this.save_exist_var?.set(
						!!fs.readdirSync(File_xr.compiltePath(this.file_path))
					);
				} catch {
					this.save_exist_var?.set(false);
				}
				break;
			case "show_file":
				{
					let _path = File_xr.compiltePath(this.file_path);
					try {
						if (!fs.statSync(_path).isDirectory()) {
							_path = _path.substring(0, _path.lastIndexOf("/"));
						}
						let file_item = fs.readdirSync(_path);
						if (this.show_add_prefix) {
							let new_file_item = [];
							for (let i of file_item) {
								new_file_item.push(_path + "/" + i);
							}
							file_item = new_file_item;
						}
						this.show_save_var?.set(file_item);
					} catch {
						this.show_save_var?.set(false);
					}
				}
				break;
			case "get_info":
				let _path = File_xr.compiltePath(this.file_path);
				try {
					this.save_exist_var?.set(Object.values(fs.statSync(_path)));
				} catch {
					this.save_exist_var?.set(false);
				}
				break;
			case "rename":
				{
					let _path = File_xr.compiltePath(this.file_path);
					try {
						if (!fs.statSync(_path).isDirectory()) {
							// 文件重命名
							let old_name = _path.substring(_path.lastIndexOf("/") + 1);
							let old_suffix = old_name.substring(old_name.lastIndexOf("."));
							let _str = old_name.substring(0, old_name.lastIndexOf("."));
							let _path_old_guid = _str.substring(_str.lastIndexOf(".") + 1);
							let new_path =
								_path.substring(0, _path.lastIndexOf("/")) +
								"/" +
								this.file_name +
								old_suffix;
							if (this.is_save_guid) {
								new_path =
									_path.substring(0, _path.lastIndexOf("/")) +
									"/" +
									this.file_name +
									`.${_path_old_guid}` +
									old_suffix;
							}
							try {
								fs.renameSync(_path, new_path);
								this.save_exist_var?.set(true);
							} catch {
								this.save_exist_var?.set(false);
							}
						} else {
							// 文件夹重命名
							let _path_p = _path.substring(0, _path.lastIndexOf("/"));
							try {
								fs.renameSync(_path, _path_p + "/" + this.file_name);
								this.save_exist_var?.set(true);
							} catch {
								this.save_exist_var?.set(false);
							}
						}
					} catch {
						this.save_exist_var?.set(false);
					}
				}
				break;
			case "delete":
				{
					let _path = File_xr.compiltePath(this.file_path);
					try {
						if (fs.statSync(_path).isDirectory()) {
							fs.rmdirSync(_path, { recursive: true });
						} else {
							fs.unlinkSync(_path);
						}
						this.save_exist_var?.set(true);
					} catch {
						this.save_exist_var?.set(false);
					}
				}
				break;
		}
	}
}
