/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-07 20:06:39
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 物品合成
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

@option op {"add_merge","find_merge","get_mergekey","convert_item"}
@alias 操作 {添加物品合成,查询指定id的合成表,获取合成属性,物品源数据转换}

@variable-getter item_ori
@alias 子项源数据
@desc 合成表物品列表数据
@cond op {"convert_item"}


@string merge_name
@alias 合成表名称
@cond op {"add_merge"}

@string[] item_list
@alias 物品列表
@cond op {"add_merge"}

@option add_list_op {"all_equal","type_equal","id_equal","num_equal","no_process"}
@alias 合成操作 {全等,类型相等,ID相等,数量全等,不处理}
@cond op {"add_merge"}
@desc 影响是否可以合成指令

@option add_out_op {"item","equip"}
@alias 合成类型 {物品,装备}
@cond op {"add_merge"}


@boolean is_mix
@alias 可混合合成
@default false
@cond op {"add_merge"}
@desc 开启后可使用不同类型合成

@string string_id
@alias 物品字符串ID
@cond op {"find_merge"}
@desc 传入物品字符串ID（数组或字符串）

@variable-getter merge_varobj
@alias 合成表对象
@desc 目标合成表对象
@cond op {"get_mergekey"}

@option mergekey_type {"merge_name","list_op","item_list","is_mix","out_op"}
@alias 获取 {合成表名称,合成操作,物品列表,是否混合,合成类型}
@cond op {"get_mergekey"}

@variable-getter save_var
@alias 保存到变量
@desc 操作保存到变量
@cond op {"find_merge","get_mergekey","convert_item"}

*/
class xr {
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
    )
  }
  static is_obj(obj) {
    return typeof obj == "object"
  }
  static is_func(obj) {
    return typeof obj == "function"
  }
  static is_server() {
    return server != null ? true : false
  }
  static is_json(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return false;
    }
  }
  static convertToJSON(object) {
    let cache = [];

    let json = JSON.stringify(object, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return '';
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  static CompileData(obj, id = null, num = null, type = null, data = {}) {
    return JSON.stringify({ id: id ? id : 0, pack_num: num ? num : 0, type: type ? type : "chunk", value: obj, data: data.length != 0 ? data : { BufferSize: Math.ceil((obj.length * 1024) * 2) } })
  }
  static to64(str) {
    return new Buffer.from(str).toString('base64');;
  }
  static from64(str) {
    return new Buffer.from(str, 'base64').toString();
  }
  static compile(r) {
    let commands = [...Event.commands];
    commands.unshift(Command.compile(r, () => { })[0]);
    let eh = new EventHandler(Command.compile(r, () => { }));
    EventHandler.call(eh);
  }
  static compileVar(msg) {
    // 将字符串里面的变量编译为文本
    let regex = /<(.*?):(.*?)>+/g;
    let matches = [];
    let match;
    // 内置变量
    let mapTo = {
      'actor': 'triggerActor',
      'cactor': 'casterActor',
      'skill': 'triggerSkill',
      'state': 'triggerState',
      'equip': 'triggerEquipment',
      'item': 'triggerItem',
      'object': 'triggerObject',
      'light': 'triggerLight',
      'region': 'triggerRegion',
      'elem': 'triggerElement',
    }
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      for (let na in mapTo) {
        if (matches[i]["type"] == na) {
          return Event.attributes[matches[i]["type"]]["attributes"][matches[i]["content"]]
        }
      }
      //其他类型
      if (matches[i]["type"] == "local") {
        for (let k in mapTo) {
          if (k == matches[i]["content"]) {
            matches[i]["content"] = mapTo[k]
          }
        }
        if (typeof Event.attributes[matches[i]["content"]] == "object") {
          return Event.attributes[matches[i]["content"]]
        }
        // 其他变量
        if (typeof Event.attributes[matches[i]["content"]] == "object") {
          let data = Event.attributes[matches[i]["content"]];
          let ms_l = {};
          for (let obj_name in data) {
            if (typeof data[obj_name] != "object") {
              ms_l[obj_name] = data[obj_name];
            } else {
              ms_l[obj_name] = xr.convertToJSON(data[obj_name])
            }
          }
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            xr.convertToJSON(ms_l)
          )
        } else {
          msg = String(msg).replace(
            "<" + matches[i]["type"] + ":" + matches[i]["content"] + ">",
            Event.attributes[matches[i]["content"]]
          )
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
              ms_l[obj_name] = xr.convertToJSON(data[obj_name])
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
    return msg
  }
}

/**
 * @description: 设置对象嵌套值
 * @param {*} a 
 * @param {*} b
 * @param {*} obj
 * @return {*}
 */
function setNestedProperty(a, b, obj, not_str = false) {
  const pathArr = a.split(',')
  const propName = pathArr.pop()
  let nestedObj = obj
  for (const path of pathArr) {
    if (!nestedObj.hasOwnProperty(path) || typeof nestedObj[path] !== 'object') {
      nestedObj[path] = {}
    }
    nestedObj = nestedObj[path]
  }
  nestedObj[propName] = not_str ? new Function("return " + b)() : b
  return obj
}
/**
 * @description: 错误处理
 * @return {*}
 */
class Error_xr {
  constructor(msg, event, e) {
    let Map = {
      'triggerActor': "name",
      'casterActor': "name",
      'triggerSkill': "name",
      'triggerState': "name",
      'triggerEquipment': "name",
      'triggerItem': "name",
      'triggerObject': "name",
      'triggerLight': "name",
      'triggerRegion': "name",
      'triggerElement': "parent",
    }
    let str = "元素 Root"
    let _obj
    if (event.hasOwnProperty("triggerElement")) {
      try {
        _obj = event["triggerElement"]
        while (!(_obj["parent"] instanceof RootElement)) {
          str += "/" + _obj["parent"].name
          _obj = _obj["parent"]
        }
      } catch (e) {
        console.log(e.message)
      }
    } else if (event.hasOwnProperty("triggerActor")) {
      let lex = "triggerActor"
      str = "角色 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerSkill")) {
      let lex = "triggerSkill"
      str = "技能 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerState")) {
      let lex = "triggerState"
      str = "状态 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerEquipment")) {
      let lex = "triggerEquipment"
      str = "装备 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerItem")) {
      let lex = "triggerItem"
      str = "物品 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerRegion")) {
      let lex = "triggerRegion"
      str = "区域 " + event[lex].attributes[Map[lex]]
    } else if (event.hasOwnProperty("triggerLight")) {
      let lex = "triggerLight"
      str = "光源 " + event[lex].attributes[Map[lex]]
    }
    console.log(msg, "\n", str, "\n", event)
    throw e
  }
}
class Merge {
  merge_name
  item_list
  is_mix
  list_op
  out_op
  constructor(data) {
    for (let i in data) {
      this[i] = data[i]
    }
  }
  is_complete() {
    if (this.list_op == "no_process") { return false }
  }
}
export default class Merge_System_xr {
  idMap // 物品映射表
  _data // 映射源表
  data
  constructor() {
    this._data = []
    this.idMap = {}
    this.data = this._data
  }
  get data() { return this._data }
  set data(val) { this._data = val }
  call() {
    switch (this.op) {
      case "add_merge": {
        try {
          this.add_merge({
            merge_name: xr.compileVar(this.merge_name),
            list_op: this.add_list_op,
            is_mix: this.is_mix,
            out_op: this.add_out_op,
            item_list: this.item_list,
          })
        } catch (e) {
          new Error_xr("添加任务出错", Event, e)
        }
        break
      }
      case "find_merge": {
        this.save_var?.set(this.find_merge(xr.compileVar(this.string_id) instanceof Array ? xr.compileVar(this.string_id) : xr.compileVar(String(this.string_id).trim())))
        break
      }
      case "get_mergekey": {
        this.save_var?.set(this.merge_varobj?.get()?.[this.mergekey_type])
        break
      }
      case "convert_item": {
        try {
          let data = this.item_ori?.get()
          switch (data.type) {
            case "item":
              data = new Item(Data.items[data.id])
              break
            case "equip":
              console.log(data)
              data = new Equipment(Data.equipments[data.id])
              break
          }
          this.save_var?.set(data)
        } catch (e) {
          new Error_xr("转换子项错误", Event, e)
        }
        break
      }
    }
  }
  /**
   * @description: 对象是否相等
   * @param {*} obj1
   * @param {*} obj2
   * @return {*}
   */
  isEqual(obj1, obj2) {
    // 检查对象类型
    if (typeof obj1 !== typeof obj2) {
      return false
    }

    // 检查基本类型
    if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
      return obj1 === obj2
    }

    // 检查数组
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) {
        return false
      }
      for (let i = 0; i < obj1.length; i++) {
        if (!this.isEqual(obj1[i], obj2[i])) {
          return false
        }
      }
      return true
    }

    // 检查对象
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }
    for (const key of keys1) {
      if (!this.isEqual(obj1[key], obj2[key])) {
        return false
      }
    }
    return true
  }
  /**
   * @description: 添加合并表
   * @param {*} merge_name
   * @param {*} left_list
   * @param {*} right_list
   * @param {*} is_mix
   * @param {*} list_op
   * @param {*} out_op
   * @return {*}
   */
  add_merge({ merge_name = "", item_list = [], is_mix = false, list_op, out_op }) {
    // 解析任务物品
    let map_to = [
      "item", "skill", "equip"
    ]
    const compile_list = (item) => {
      // 编译物品列表
      let first_type = undefined;
      let item_jx = []
      let reg_num = /^[0-9]+.?[0-9]*/
      let item_ex
      for (let i in item) {
        let str_splice = String(item[i]).trim().split(",")
        item_ex = {
          item: { num: parseFloat(String(str_splice[2]).trim()) },
          equip: { num: parseFloat(String(str_splice[2]).trim()) },
        }
        // 不是有效任务物品将不会被添加
        if (map_to.includes(String(str_splice[0]).trim())) {
          // 检测物品和装备任务是否有效
          if (String(str_splice[0]).trim() == "item" || String(str_splice[0]).trim() == "equip") {
            if (!first_type) {
              first_type = String(str_splice[0]).trim()
            }
            // 判断当前是否开启混合
            if (!is_mix && String(str_splice[0]).trim() != first_type) { return false }
            if (!reg_num.test(String(str_splice[2]).trim())) {
              continue
            }
          }
          item_jx.push({ type: String(str_splice[0]).trim(), id: String(str_splice[1]).trim(), ...item_ex[String(str_splice[0]).trim()] })
        }
      }
      return item_jx
    }
    // 编译输出
    let itemlist_compile = compile_list(item_list)
    if (!itemlist_compile) {
      // 不进行添加
      return false
    }
    let all_task = new Merge({ merge_name, item_list: itemlist_compile, is_mix, list_op, out_op })
    const compile_Map = (list) => {
      // 添加任务
      let is_find = this.data.findIndex(table => this.isEqual(table, all_task))
      if (is_find === -1) { this.data.push(all_task) }
      let index = this.data.findIndex(table => this.isEqual(table, all_task))
      // 添加映射
      for (let key in list) {
        let item_ori = list[key]
        // 新物品
        if (!this.idMap.hasOwnProperty(item_ori.id)) {
          this.idMap[item_ori.id] = [index]
        } else {
          // 旧物品
          if (this.idMap[item_ori.id].findIndex(ind => ind == index) === -1) {
            this.idMap[item_ori.id].push(index)
          }
        }
      }
    }
    compile_Map(itemlist_compile)
  }
  /**
   * @description: 按照物品ID查询合成表
   * @param {*} id
   * @return {*}
   */
  find_merge(id) {
    let res = []
    if (id instanceof Array) {
      // 查找多组，并排除重复
      let arr = [...new Set(id)]
      for (let key in arr) {
        if (this.idMap.hasOwnProperty(arr[key])) {
          for (let i in this.idMap[arr[key]]) {
            let item = this.idMap[arr[key]][i]
            res.push(this.data[item])
          }
        }
      }
      return [...new Set(res)]
    }
    if (this.idMap.hasOwnProperty(id)) {
      for (let i in this.idMap[id]) {
        let item = this.idMap[id][i]
        res.push(this.data[item])
      }
    }
    return res
  }
}
