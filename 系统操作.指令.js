/*
 * @Author: xuranXYS
 * @LastEditTime: 2024-06-03 23:02:48
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 系统操作
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

@option op {"get_version","get_in_version","get_core_name","get_temp","get_home","get_os_name","get_arch","get_platform","get_cpus","get_freemem","get_priority","get_networkInterfaces","get_allmem","get_uptime","get_userinfo","get_d","call_open_file"}
@alias 操作 {获取系统版本,获取系统内部版本,获取系统内核名称,获取系统临时文件路径,获取系统用户路径,获取系统主机名,获取编译nodejs架构,获取编译nodejs平台,获取cpu核心信息,获取系统空闲内存字节,获取指定pid进程优先级,获取本机网络适配器,获取系统内存总量,获取系统正常运行时间,获取当前用户信息,获取系统全部盘符,调用系统打开文件}

@number priority_pid
@alias 进程pid(-1为自身)
@default -1
@cond op {"get_priority"}

@string file_path
@alias 文件路径
@cond op {"call_open_file"}
@desc 
路径操作符：
$ ： 指向当前Assets文件夹
% ： 指向当前工程项目文件夹
PS：可用GUID判断文件是否存在

@variable-getter store_var
@alias 保存到变量
@cond op {"get_version","get_in_version","get_core_name","get_temp","get_home","get_os_name","get_arch","get_platform","get_cpus","get_freemem","get_priority","get_networkInterfaces","get_allmem","get_uptime","get_userinfo","get_d"}

*/
const os = require("os");

class xr {
	static is_obj(obj) {
		return typeof obj == "object";
	}
	static is_func(obj) {
		return typeof obj == "function";
	}
	static is_server() {
		return server != null ? true : false;
	}
	static is_json(str) {
		try {
			JSON.parse(str);
			return true;
		} catch (e) {
			return false;
		}
	}
	static convertToJSON(object) {
		let cache = [];

		let json = JSON.stringify(object, function (key, value) {
			if (typeof value === "object" && value !== null) {
				if (cache.includes(value)) {
					return "";
				}
				cache.push(value);
			}
			return value;
		});

		cache = null; // 清空 cache

		return json;
	}
	static get_global(str) {
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
	static CompileData(obj, id = null, num = null, type = null, data = {}) {
		return JSON.stringify({
			id: id ? id : 0,
			pack_num: num ? num : 0,
			type: type ? type : "chunk",
			value: obj,
			data:
				data.length != 0
					? data
					: { BufferSize: Math.ceil(obj.length * 1024 * 2) },
		});
	}
	static to64(str) {
		return new Buffer.from(str).toString("base64");
	}
	static from64(str) {
		return new Buffer.from(str, "base64").toString();
	}
	static compile(r) {
		let commands = [...Event.commands];
		commands.unshift(Command.compile(r, () => {})[0]);
		let eh = new EventHandler(Command.compile(r, () => {}));
		EventHandler.call(eh);
	}
	static compileVar(msg) {
		// 将字符串里面的变量编译为文本
		let regex = /<(\S+):(\S+)>+/g;
		let matches = [];
		let match;
		// 内置变量
		let mapTo = {
			xactor: "triggerActor",
			xcactor: "casterActor",
			xskill: "triggerSkill",
			xstate: "triggerState",
			xequip: "triggerEquipment",
			xitem: "triggerItem",
			xobject: "triggerObject",
			xlight: "triggerLight",
			xregion: "triggerRegion",
			xelem: "triggerElement",
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
			return trans_char(File.route("Assets")) + "/" + text;
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

export default class os_xr {
	call() {
		switch (this.op) {
			case "get_in_version":
				this.store_var?.set(os.version());
				break;
			case "get_version":
				this.store_var?.set(os.release());
				break;
			case "get_core_name":
				this.store_var?.set(os.type());
				break;
			case "get_temp":
				this.store_var?.set(os.tmpdir());
				break;
			case "get_home":
				this.store_var?.set(os.homedir());
				break;
			case "get_os_name":
				this.store_var?.set(os.hostname());
				break;
			case "get_platform":
				this.store_var?.set(os.platform());
				break;
			case "get_cpus":
				this.store_var?.set(os.cpus());
				break;
			case "get_freemem":
				this.store_var?.set(os.freemem());
				break;
			case "get_priority":
				if (xr.compileVar(this.priority_pid) == "-1") {
					this.store_var?.set(os.getPriority());
				} else {
					this.store_var?.set(os.getPriority(xr.compileVar(this.priority_pid)));
				}
				break;
			case "get_networkInterfaces":
				this.store_var?.set(os.networkInterfaces());
				break;
			case "get_allmem":
				this.store_var?.set(os.totalmem());
				break;
			case "get_uptime":
				this.store_var?.set(os.uptime());
				break;
			case "get_userinfo":
				this.store_var?.set(os.userInfo());
				break;
			case "call_open_file":
				try {
					const { shell } = require("electron");
					shell.openPath(xr.compiltePath(this.file_path));
				} catch {}
				break;
			case "get_d":
				const { execSync } = require("child_process");
				const res = execSync("wmic logicaldisk where drivetype=3 get deviceid");
				this.store_var?.set(
					res
						.toString()
						.trim()
						.split("\n")
						.filter((val, i) => i > 0)
						.map((val) => val.replace(/(\r|\s)+/i, ""))
				);
				break;
		}
	}
}
