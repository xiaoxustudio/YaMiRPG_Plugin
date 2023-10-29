/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-10-29 11:57:46
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 任务系统
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

任务系统
可进行添加任务，删除任务，保存任务数据等操作

任务标识如果为0，则不会添加任务（除非开启是索引选项）

任务物品列表类型标识：（未知类型将不会被添加）
item（物品）, actor（角色）, equip（装备），skill（技能）,state（状态）
var（全局变量）, event（事件）

使用方法：
item（物品）,actor（角色）, equip（装备），var（全局变量），skill（技能）,state（状态）：
类型，id，数量

var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）
event（事件）：类型，id，执行次数

PS：事件类型会在遍历的时候自动执行，内置变量：@index ：循环索引


添加额外任务结构指令可对任务数据结构添加额外的属性

获取任务键指令如果获取多个键，则会返回列表（可用遍历指令进行遍历）

任务遍历用于遍历任务:
1.@index -> 索引
2.@result -> 物品转换数据

任务物品列表遍历会遍历任务的item属性：
1.@index -> 索引
2.@result -> 物品转换数据（通常是个对象）
3.@result_rw -> 物品原始数据

任务完成物品列表遍历会遍历任务的item属性：
1.@index -> 索引
2.@result -> 物品转换数据（通常是个对象）
3.@result_rw -> 物品原始数据

任务是否可以完成会检查item里面的物品是否存在库存里面

切换到下一个任务：会切换到链接相对于的任务

@option op {"base","advanced","other"}
@alias 操作 {基础操作,高级操作,其他操作}

@option other_op {"read","save","remove","show"}
@alias 子操作 {读取任务数据,保存任务数据,删除任务数据,插件信息显示}
@cond op {"other"}

@string rw_data_num
@alias 存档索引
@default 0
@cond other_op {"read","save","remove"}
@desc 用于操作任务数据的索引

@option advanced_op {"get","set","add_con","dis_con","add_e"}
@alias 子操作 {获取任务键,设置任务键,链接任务,断开链接,添加额外任务结构}
@cond op {"advanced"}

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
@cond advanced_op {"get","set"}
@desc 传入一个任务对象

@string ad_exp
@alias 任务键表达式
@cond advanced_op {"get","set"}
@desc 任务键表达式（多个用英文逗号分割）

@string ad_exp_val
@alias 任务值表达式
@cond advanced_op {"set"}
@desc 任务值表达式（多个用英文逗号分割）

@boolean not_string
@alias 不是字符串
@desc 设置之后将会将值解析为js值
@cond advanced_op {"set"}

@string[] rw_struct
@alias 额外任务数据结构
@desc 这里用于添加额外的任务数据结构
@cond advanced_op {"add_e"}


@string ad_save_var
@alias 保存到本地变量
@cond advanced_op {"get"}
@desc 将操作的结果保存到变量

@option base_op {"add","remove","get","set_default","get_default","change_next","check","check_list","check_list_com","is_complete"}
@alias 子操作 {添加任务,删除任务,获取任务,设置当前任务,获取当前任务,切换到下一个任务,任务遍历,任务物品列表遍历,任务完成物品列表遍历,任务是否可以完成}
@cond op {"base"}

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
@alias 开启物品列表
@cond base_op {"add"}
@desc 任务的表达式物品列表（用于检测任务）
使用方法：
item（物品）,actor（角色）, equip（装备）：类型，id，数量
var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）

@string[] item_list_com
@alias 完成物品列表
@cond base_op {"add"}
@desc 任务的表达式物品列表（用于完成任务后）
使用方法：
item（物品）,actor（角色）, equip（装备）：类型，id，数量
var（全局变量）：类型，id，条件 ，值 ，别名（将会被显示在任务中）


@string remove_rw
@alias 移除任务标识
@cond base_op {"remove"}
@desc 移除填写的对应的任务

@file event_check
@filter event
@alias 遍历事件
@cond base_op {"check","check_list","check_list_com"}
@desc 内置变量：
1.@result -> 对象
2.@index -> 索引

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

@string save_var
@alias 保存到本地变量
@cond base_op {"get","is_complete","get_default"}
@desc 将操作的结果保存到变量
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
    while ((match = regex.exec(msg)) !== null) {
      matches.push({ type: match[1], content: match[2] });
    }
    for (let i in matches) {
      if (matches[i]["type"] == "local") {
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
      // 获取attributes属性
      if (matches[i]["type"] == "target") {
        return Event.attributes[matches[i]["content"]]["attributes"]["target"]
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
function setNestedProperty(a, b, obj) {
  const pathArr = a.split(',');
  const propName = pathArr.pop();
  let nestedObj = obj;
  for (const path of pathArr) {
    if (!nestedObj.hasOwnProperty(path) || typeof nestedObj[path] !== 'object') {
      nestedObj[path] = {};
    }
    nestedObj = nestedObj[path];
  }
  nestedObj[propName] = b;
  return obj;
}

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
      _obj = event["triggerElement"]
      while (!(_obj["parent"] instanceof RootElement)) {
        str += "/" + _obj["parent"].name
        _obj = _obj["parent"]
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


export default class rw_xr {
  _data // 数据
  current_rw
  config
  connect
  is_close
  constructor() {
    this.data = []
    this.connect = {}
    this.current_rw = 0 // 当前任务
    this.config = {}
    this.is_close = false // 默认不关闭作者信息显示
  }
  // 属性定义
  get data() {
    return this._data
  }
  set data(val) {
    this._data = val
  }

  // 定义基础方法
  saveRwData(number) {
    const suffix = number.toString().padStart(2, '0')
    // MacOS打包缺少写入权限，暂时改成web模式
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron': {
        const saveDir = File.route('$/Save')
        const dataPath = File.route(`$/Save/save_xr${suffix}.save`)
        let struct = {
          current: this.current_rw,
          config: this.config,
          data: this.data,
          connect: this.connect
        }
        const dataText = JSON.stringify(struct, null, 2)
        const fsp = require('fs').promises
        return fsp.stat(saveDir).catch(error => {
          // 如果不存在存档文件夹，创建它
          return fsp.mkdir('Save')
        }).then(() => Promise.all([
          // 异步写入元数据和存档数据
          fsp.writeFile(dataPath, dataText).catch(error => { console.warn(error) }),
        ]))
      }
      case 'web': {
        const dataKey = `save_xr${suffix}.save`
        let struct = {
          current: this.current_rw,
          config: this.config,
          data: this.data,
          connect: this.connect
        }
        return Promise.all([
          IDB.setItem(dataKey, struct),
        ])
      }
    }
  }
  async loadRWData(number) {
    const suffix = number.toString().padStart(2, '0')
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron':
        // 推迟到栈尾执行
        await void 0
        try {
          // 同步读取存档数据文件
          const path = File.route(`$/Save/save_xr${suffix}.save`)
          const json = require('fs').readFileSync(path)
          let res = JSON.parse(json)
          this.current_rw = res.current
          this.data = res.data
          this.config = res.config
          this.connect = res.connect
        } catch (error) {
          console.warn(error)
          return
        }
        break
      case 'web': {
        const key = `save${suffix}.save`
        let res = await IDB.getItem(key)
        this.current_rw = res.current
        this.data = res.data
        this.config = res.config
        this.connect = res.connect
        break
      }
    }
  }
  deleteRWData(number) {
    const suffix = number.toString().padStart(2, '0')
    let shell = Stats.shell
    if (!Stats.debug && Stats.isMacOS()) {
      shell = 'web'
    }
    switch (shell) {
      case 'electron': {
        const dataPath = File.route(`$/Save/save_xr${suffix}.save`)
        const fsp = require('fs').promises
        return Promise.all([
          // 异步删除元数据和存档数据
          fsp.unlink(dataPath).catch(error => { console.warn(error) }),
        ])
      }
      case 'web': {
        const dataKey = `save_xr${suffix}.save`
        return Promise.all([
          IDB.removeItem(dataKey),
        ])
      }
    }
  }
  // 定义回调
  call() {
    switch (this.op) {
      case "base":
        switch (this.base_op) {
          case "add":
            try {
              this.add_task({
                title: xr.compileVar(this.title_rw),
                type: this.type_rw,
                desc: xr.compileVar(this.desc_rw),
                tag: xr.compileVar(this.tag_rw),
                item: this.item_list_str,
                c_item: this.item_list_com
              })
            } catch (e) {
              new Error_xr("添加任务错误：", Event, e)
            }
            break
          case "remove":
            this.remove_task(xr.compileVar(this.remove_rw))
            break
          case "get":
            var data = this.get_task(xr.compileVar(this.tag_rw), this.is_index)
            if (data) {
              Event.attributes[this.save_var] = data
            } else {
              Event.attributes[this.save_var] = undefined
            }
            break
          case "set_default":
            this.current_rw = xr.compileVar(this.tag_rw)
            break
          case "get_default":
            Event.attributes[this.save_var] = this.get_current()
            break
          case "change_next":
            let next = this.get_connect(this.current_rw)
            if (next != -1 && next) {
              this.current_rw = next
            }
            break
          case "check":
            try {
              // 查找任务，如果为查找到任务则报错
              if (this.is_reverse) {
                for (let i = this.data.length - 1; i >= 0; i--) {
                  const commands = EventManager.guidMap[this.event_check]
                  if (commands) {
                    const event = new EventHandler(commands)
                    // 继承变量
                    if (this.inherit_check) {
                      event.inheritEventContext(Event)
                    }
                    event.attributes["@index"] = i
                    event.attributes["@result"] = this.data[i]
                    EventHandler.call(event)
                  }
                }
              } else {
                this.data.map((data, ind) => {
                  const commands = EventManager.guidMap[this.event_check]
                  if (commands) {
                    const event = new EventHandler(commands)
                    // 继承变量
                    if (this.inherit_check) {
                      event.inheritEventContext(Event)
                    }
                    event.attributes["@index"] = ind
                    event.attributes["@result"] = data
                    EventHandler.call(event)
                  }
                })
              }
            } catch (e) {
              new Error_xr("任务遍历错误：", Event, e)
            }
            break
          case "check_list":
            try {
              let tag = xr.compileVar(this.tag_rw)
              let task = this.get_task(tag)
              if (task != -1 && task) {
                for (let i in task["item"]) {
                  const commands = EventManager.guidMap[this.event_check]
                  if (commands) {
                    const event = new EventHandler(commands)
                    // 继承变量
                    if (this.inherit_check) {
                      event.inheritEventContext(Event)
                    }
                    event.attributes["@index"] = i
                    let d_data = task["item"][i]
                    let data_now;
                    switch (d_data.type) {
                      case 'actor': {
                        try {
                          data_now = new Actor(Data.actors[d_data.id])
                          data_now.talk = d_data.talk ? d_data.talk : false
                        } catch (e) {
                          new Error_xr("(解析)角色错误：", Event, e)
                        }
                        break
                      }
                      case 'skill': {
                        try {
                          data_now = new Skill(Data.skills[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)技能错误：", Event, e)
                        }
                        break
                      }
                      case 'state': {
                        try {
                          data_now = new State(Data.states[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)状态错误：", Event, e)
                        }
                        break
                      }
                      case 'equip': {
                        try {
                          data_now = new Equipment(Data.equipments[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)装备错误：", Event, e)
                        }
                        break
                      }
                      case 'item': {
                        try {
                          data_now = new Item(Data.items[d_data.id])
                          data_now.quantity += parseFloat(d_data.num) < 0 ? 1 : parseFloat(d_data.num)
                        } catch (e) {
                          new Error_xr("(解析)物品错误：", Event, e)
                        }
                        break
                      }
                      case 'var': {
                        // 变量计算
                        try {
                          let v_data = Variable.get(d_data.id)
                          let eval_str = "return " + v_data + " " + d_data.op + " " + d_data.val + " ? true : false"
                          data_now = { ...d_data, calc: new Function(eval_str)() }
                        } catch (e) {
                          new Error_xr("(解析)变量错误：", Event, e)
                        }
                        break
                      }
                      case 'event': {
                        try {
                          let num = parseFloat(d_data.num)
                          const commands = EventManager.guidMap[d_data.id]
                          if (commands) {
                            for (let i = 0; i < num; i++) {
                              const event = new EventHandler(commands)
                              event.attributes["@index"] = i
                              EventHandler.call(event)
                            }
                          }
                        } catch (e) {
                          new Error_xr("(解析)事件错误：", Event, e)
                        }
                        break
                      }
                    }
                    event.attributes["@result"] = data_now
                    event.attributes["@result1_rw"] = d_data
                    EventHandler.call(event)
                  }
                }
              }
            } catch (e) {
              new Error_xr("任务物品列表错误：", Event, e)
            }
            break
          case "check_list_com":
            try {
              let tag = xr.compileVar(this.tag_rw)
              let task = this.get_task(tag)
              if (task != -1 && task) {
                for (let i in task["complete_item"]) {
                  const commands = EventManager.guidMap[this.event_check]
                  if (commands) {
                    const event = new EventHandler(commands)
                    // 继承变量
                    if (this.inherit_check) {
                      event.inheritEventContext(Event)
                    }
                    event.attributes["@index"] = i
                    let d_data = task["complete_item"][i]
                    let data_now;
                    switch (d_data.type) {
                      case 'actor': {
                        try {
                          data_now = new Actor(Data.actors[d_data.id])
                          data_now.talk = d_data.talk ? d_data.talk : false
                        } catch (e) {
                          new Error_xr("(解析)角色错误：", Event, e)
                        }
                        break
                      }
                      case 'skill': {
                        try {
                          data_now = new Skill(Data.skills[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)技能错误：", Event, e)
                        }
                        break
                      }
                      case 'state': {
                        try {
                          data_now = new State(Data.states[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)状态错误：", Event, e)
                        }
                        break
                      }
                      case 'equip': {
                        try {
                          data_now = new Equipment(Data.equipments[d_data.id])
                        } catch (e) {
                          new Error_xr("(解析)装备错误：", Event, e)
                        }
                        break
                      }
                      case 'item': {
                        try {
                          data_now = new Item(Data.items[d_data.id])
                          data_now.quantity += parseFloat(d_data.num) < 0 ? 1 : parseFloat(d_data.num)
                        } catch (e) {
                          new Error_xr("(解析)物品错误：", Event, e)
                        }
                        break
                      }
                      case 'var': {
                        // 变量计算
                        try {
                          let v_data = Variable.get(d_data.id)
                          let eval_str = "return " + v_data + " " + d_data.op + " " + d_data.val + " ? true : false"
                          data_now = { ...d_data, calc: new Function(eval_str)() }
                        } catch (e) {
                          new Error_xr("(解析)变量错误：", Event, e)
                        }
                        break
                      }
                      case 'event': {
                        try {
                          let num = parseFloat(d_data.num)
                          const commands = EventManager.guidMap[d_data.id]
                          if (commands) {
                            for (let i = 0; i < num; i++) {
                              const event = new EventHandler(commands)
                              event.attributes["@index"] = i
                              EventHandler.call(event)
                            }
                          }
                        } catch (e) {
                          new Error_xr("(解析)事件错误：", Event, e)
                        }
                        break
                      }
                    }
                    event.attributes["@result"] = data_now
                    event.attributes["@result1_rw"] = d_data
                    EventHandler.call(event)
                  }
                }
              }
            } catch (e) {
              new Error_xr("任务完成物品列表错误：", Event, e)
              throw e
            }
            break
          case "is_complete":
            Event.attributes[this.save_var] = this.can_complete(xr.compileVar(this.tag_rw))
            break
        }
        break
      case "advanced":
        switch (this.advanced_op) {
          case "get":
            try {
              var ad_data = xr.compileVar(this.ad_get)
              if (ad_data) {
                let str_split = String(this.ad_exp).trim().split(",")
                if (str_split.length > 1) {
                  let is_obj_self = false
                  // 自己是否是对象，是的话从自身获取
                  if (typeof ad_data == "object") {
                    is_obj_self = true
                  }
                  // 填充数字键
                  let save_arr = {}
                  for (let j = 0; j < str_split.length; j++) {
                    save_arr[String(j)] = is_obj_self ? (ad_data?.[str_split?.[j]]) : (Event.attributes[ad_data]?.[str_split?.[j]])
                  }
                  Event.attributes[this.ad_save_var] = save_arr
                } else {
                  let is_obj_self = false
                  // 自己是否是对象，是的话从自身获取
                  if (typeof ad_data == "object") {
                    is_obj_self = true
                  }
                  Event.attributes[this.ad_save_var] = is_obj_self ? ad_data[this.ad_exp] : (Event.attributes[ad_data][this.ad_exp])
                }
              }
            } catch (e) {
              new Error_xr("获取键值错误：", Event, e)
            }
            break
          case "set":
            try {
              var ad_data = xr.compileVar(this.ad_get)
              if (ad_data) {
                let str_split = String(this.ad_exp).trim().split(",")
                if (str_split.length > 1) {
                  setNestedProperty(String(this.ad_exp), String(this.ad_exp_val), Event.attributes[ad_data])
                } else {
                  let val = xr.compileVar(this.ad_exp_val)
                  Event.attributes[ad_data][this.ad_exp] = this.not_string ? new Function("return " + val)() : val
                }
              }
            } catch (e) {
              new Error_xr("设置键值错误：", Event, e)
            }
            break
          case "add_con":
            this.connect[xr.compileVar(this.con_tag)] = xr.compileVar(this.con_to_tag)
            break
          case "dis_con":
            delete this.connect[xr.compileVar(this.con_tag)]
            break
        }
        break
      case "other":
        switch (this.other_op) {
          case "read":
            this.loadRWData(xr.compileVar(this.rw_data_num))
            break
          case "remove":
            this.deleteRWData(xr.compileVar(this.rw_data_num))
            break
          case "save":
            this.saveRwData(xr.compileVar(this.rw_data_num))
            break
          case "show":
            xr.showInfo()
            break
        }
        break
    }
  }
  // 定义方法
  /**
   * @description: 添加任务
   * @param {*} title
   * @param {*} desc
   * @param {*} tag
   * @return {*}
   */
  add_task({ title, desc, item = [], c_item = [], state = false, tag = -1 }) {
    // 额外属性
    let ex_data = {}
    for (let i = 0; i < this.rw_struct.length; i++) {
      ex_data[this.rw_struct[i]] = undefined
    }
    // 解析任务物品
    let map_to = [
      "item", "actor", "skill", "equip", "state", "var", "event"
    ]
    // 编译物品列表
    let item_jx = []
    let reg_num = /^[0-9]+.?[0-9]*/
    let item_ex
    for (let i in item) {
      let str_splice = String(item[i]).trim().split(",")
      item_ex = {
        item: { num: parseFloat(String(str_splice[2]).trim()) },
        equip: { num: parseFloat(String(str_splice[2]).trim()) },
        event: { num: parseFloat(String(str_splice[2]).trim()) },
        actor: { talk: false },
        var: { op: String(str_splice[2]).trim(), val: String(str_splice[3]).trim(), name: str_splice[4]?.trim() }
      }
      // 不是有效任务物品将不会被添加
      if (map_to.includes(String(str_splice[0]).trim())) {
        // 检测物品和装备任务是否有效
        if (String(str_splice[0]).trim() == "item" || String(str_splice[0]).trim() == "equip") {
          if (!reg_num.test(String(str_splice[2]).trim())) {
            continue
          }
        }
        // 检测变量任务是否有效
        if (String(str_splice[0]).trim() == "var") {
          if (!item_ex[str_splice[0]].op || !item_ex[str_splice[0]].val) {
            continue
          }
          if (!item_ex[str_splice[0]].name) {
            item_ex[str_splice[0]].name = "全局变量" + str_splice[1]
          }
        }
        item_jx.push({ type: String(str_splice[0]).trim(), id: String(str_splice[1]).trim(), ...item_ex[String(str_splice[0]).trim()] })
      }
    }
    // 编译完成物品列表
    let complete_item = []
    let item_ex1
    for (let i in c_item) {
      let str_splice = String(c_item[i]).trim().split(",")
      item_ex1 = {
        item: { num: parseFloat(String(str_splice[2]).trim()) },
        equip: { num: parseFloat(String(str_splice[2]).trim()) },
        event: { num: parseFloat(String(str_splice[2]).trim()) },
        actor: { talk: false },
        var: { op: String(str_splice[2]).trim(), val: String(str_splice[3]).trim(), name: str_splice[4]?.trim() }
      }
      // 不是有效任务物品将不会被添加
      if (map_to.includes(String(str_splice[0]).trim())) {
        // 检测物品和装备任务是否有效
        if (String(str_splice[0]).trim() == "item" || String(str_splice[0]).trim() == "equip") {
          if (!reg_num.test(String(str_splice[2]).trim())) {
            continue
          }
        }
        // 检测变量任务是否有效
        if (String(str_splice[0]).trim() == "var") {
          if (!item_ex1[str_splice[0]].op || !item_ex1[str_splice[0]].val) {
            continue
          }
          if (!item_ex1[str_splice[0]].name) {
            item_ex1[str_splice[0]].name = "全局变量" + str_splice[1]
          }
        }
        complete_item.push({ type: String(str_splice[0]).trim(), id: String(str_splice[1]).trim(), ...item_ex1[String(str_splice[0]).trim()] })
      }
    }
    if (tag !== -1) {
      this.data.push({ title, desc, tag, state, item: item_jx, complete_item, ...ex_data })
    }
  }
  /**
   * @description: 查找任务，通过tag
   * @param {*} tag 标识
   * @return {*}
   */
  find_task(tag) {
    let f_index = -1
    this.data.map((data, ind) => {
      if (data.tag == tag) {
        f_index = ind
        return f_index
      }
    })
    return f_index
  }

  /**
   * @description: 删除任务
   * @param {*} tag 任务标识
   * @return {*}
   */
  remove_task(tag) {
    if (this.find_task(tag) != -1) {
      this.data.map((data, ind) => {
        if (data.tag == tag) {
          delete data[tag]
          return true
        }
      })
      return false
    }
  }
  /**
   * @description: 获取任务
   * @param {*} tag 任务标识
   * @return {*}
   */
  get_task(tag, is_index = false) {
    if (is_index) {
      return this.data[tag] ? this.data[tag] : undefined
    }
    let data = this.find_task(tag)
    if (data != -1) {
      return this.data[data]
    }
    return undefined
  }

  /**
   * @description: 判断指定任务是否可以完成
   * @param {*} tag
   * @return {*}
   */
  can_complete(tag) {
    let task_data = this.get_task(tag)
    if (task_data != -1 && task_data) {
      let items = task_data["item"]
      let duibi = Array(items.length).fill(true)
      let now_duibi = []
      // 缓存
      let _cacheMap = {}
      for (let i in items) {
        let item = items[i]
        let aci = Party.player?.inventory
        let acs = Party.player?.skillManager
        let acst = Party.player?.stateManager
        // 如果是物品
        if (item.type == "item") {
          // 判断id是否存在，存在就在里面取数量
          if (_cacheMap.hasOwnProperty(item.id)) {
            if (item.id == aci.get(item.id).id && _cacheMap[item.id] >= parseFloat(item.num)) {
              _cacheMap[item.id] = _cacheMap[item.id] - parseFloat(item.num)
              now_duibi.push(true)
              continue
            }
          } else {
            if (item.id == aci.get(item.id).id && aci.count(item.id) >= parseFloat(item.num)) {
              _cacheMap[item.id] = aci.count(item.id) - parseFloat(item.num)
              now_duibi.push(true)
              continue
            }
          }
        } else if (item.type == "equip") {
          let eq_obj = aci.get(item.id) instanceof Equipment ? aci.get(item.id) : undefined
          if (item.id == eq_obj?.id) {
            now_duibi.push(true)
            continue
          }
        } else if (item.type == "actor") {
          if (item?.talk) {
            now_duibi.push(true)
            continue
          }
        } else if (item.type == "var") {
          // 变量计算
          let v_data = Variable.get(item.id)
          let eval_str = "return " + v_data + " " + item.op + " " + item.val + " ? true : false"
          if (new Function(eval_str)()) {
            now_duibi.push(true)
            continue
          }
        } else if (item.type == "skill") {
          if (acs.get(item?.id)) {
            now_duibi.push(true)
            continue
          }
        } else if (item.type == "state") {
          if (acst.get(item?.id)) {
            now_duibi.push(true)
            continue
          }
        }
        now_duibi.push(false)
      }
      _cacheMap = undefined
      if (duibi.length === now_duibi.length && duibi.every((v, i) => v === now_duibi[i])) {
        return true
      } else {
        return false
      }
    }
    return false
  }

  /**
   * @description: 获取当前任务
   * @return {*}
   */
  get_current() {
    let rw = this.get_task(this.current_rw)
    return rw
  }
  /**
   * @description: 获取对应链接关系
   * @param {*} tag 标识
   * @return {*}
   */
  get_connect(tag) {
    return this.connect[tag] ? this.connect[tag] : -1
  }
}




