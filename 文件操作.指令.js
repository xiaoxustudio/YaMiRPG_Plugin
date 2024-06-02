/*
 * @Author: xuranXYS
 * @LastEditTime: 2024-06-02 13:55:23
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 文件操作
@version 1.1
@author 徐然
@link https://space.bilibili.com/291565199
@desc

基于fs的文件操作

路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹
PS：可用GUID判断文件是否存在
PS：我们统一用的是/作为路径分割符

@option op {'read_file','write_file','exist_file','is_directory','show_file'}
@alias 操作 {读取文件,写入文件,文件是否存在,是否是目录,列出目录}

@string file_path
@alias 文件路径
@cond op {'read_file','write_file','exist_file','show_file','is_directory'}
@desc 
路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹
PS：可用GUID判断文件是否存在

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
@cond op {'exist_file','is_directory'}

@option op_encoding {'gbk','utf-8','utf8','ascii','base64','base64url','binary','hex','latin1','ucs-2','ucs2','utf16le'}
@alias 文件编码 {gbk,utf-8,utf8,ascii,base64,base64url,binary,hex,latin1,ucs-2,ucs2,utf16le}
@default gbk
@cond op {'read_file','write_file'}

*/

const fs = require("fs");
class File_xr {
	static MkdirsSync(dirname) {
		return fs.mkdirSync(dirname, { recursive: true });
	}
	static read(path, en) {
		try {
			const str = fs.readFileSync(path);
			return str.toString(en);
		} catch {
			return null;
		}
	}
	static write(path, text, create = false, append = false, en = "utf-8") {
		let is_e = fs.existsSync(path);
		let start = String(path).lastIndexOf("/");
		if (create) {
			if (!is_e) File_xr.MkdirsSync(String(path).slice(0, start));
		}
		try {
			if (!append) {
				fs.writeFileSync(path, text, { encoding: en });
			} else {
				fs.appendFileSync(path, text, { encoding: en });
			}
			return true;
		} catch {
			return false;
		}
	}
	static is_json(a) {
		try {
			JSON.parse(a);
			return true;
		} catch {
			return false;
		}
	}
	static get_glocal(str) {
		for (let i in Variable.groups) {
			for (let k in Variable.groups[i]) {
				if (str == Variable.groups[i][k].name) {
					return Variable.groups[i][k].value;
				}
			}
		}
		return null;
	}
	static compileVar(msg) {
		// 将字符串里面的变量编译为文本
		let regex = /<(.*?):(.*?)>+/g;
		let matches = [];
		let match;
		// 内置变量
		let mapTo = {
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
		while ((match = regex.exec(msg)) !== null) {
			matches.push({ type: match[1], content: match[2] });
		}
		for (let i in matches) {
			for (let na in mapTo) {
				if (matches[i]["type"] == na) {
					return Event.attributes[matches[i]["type"]]["attributes"][
						matches[i]["content"]
					];
				}
			}
			//其他类型
			if (matches[i]["type"] == "local") {
				for (let k in mapTo) {
					if (k == matches[i]["content"]) {
						matches[i]["content"] = mapTo[k];
					}
				}
				if (typeof Event.attributes[matches[i]["content"]] == "object") {
					return Event.attributes[matches[i]["content"]];
				}
				// 其他变量
				if (typeof Event.attributes[matches[i]["content"]] == "object") {
					let data = Event.attributes[matches[i]["content"]];
					let ms_l = {};
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
						Event.attributes[matches[i]["content"]]
					);
				}
			}
			if (matches[i]["type"] == "global") {
				if (typeof xr.get_global(matches[i]["content"]) == "object") {
					let data = xr.get_global(matches[i]["content"]);
					let ms_l = {};
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
						xr.get_global(matches[i]["content"])
					);
				}
			}
		}
		return msg;
	}
	static compiltePath(text) {
		text = File_xr.compileVar(text);
		const trans_char = (__text = __dirname) => {
			let _path_local = __text.replace(/\\/, "/");
			while (/\\/.test(_path_local)) {
				_path_local = _path_local.replace(/\\/, "/");
			}
			return _path_local;
		};
		if (text.startsWith("$")) {
			text = text.slice(1, text.length);
			return File.route("Assets") + "/" + text;
		} else if (text.startsWith("%")) {
			text = text.slice(1, text.length);
			return trans_char(File.route("")) + "/" + text;
		}
		if (/[a-f0-9]{16}/i.test(text) && File.getPathByGUID(text).length > 0) {
			return trans_char(__dirname) + "/" + File.getPathByGUID(text);
		} else {
			return text;
		}
	}
}

export default class File_xr_once {
	call() {
		switch (this.op) {
			case "read_file":
				var data = File_xr.read(
					File_xr.compiltePath(this.file_path),
					this.op_encoding
				);
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
			case "write_file":
				var data = File_xr.compileVar(this.file_content);
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
				let _path = File_xr.compiltePath(this.file_path);
				if (_path.lastIndexOf(".") !== -1) {
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
				break;
		}
	}
}
