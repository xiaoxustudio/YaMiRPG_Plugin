/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-10-29 21:00:24
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 路径节点系统
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 
可使用深度和广度算法搜索路径

添加节点 , 移除节点 , 链接节点 , 获取属性 , 设置属性 , 存在节点 , 广度搜索 , 深度搜索

可使用<*:*>

@option op {"add","remove","connect","get_a","set_a","has","bfs","dfs"}
@alias 操作 {添加节点,移除节点,链接节点,获取属性,设置属性,存在节点,广度搜索,深度搜索}


@string tag
@alias 节点标识
@desc 用于标识一个节点
@cond op {"add","remove","has","connect","set_a","get_a"}

@string end_tag
@alias 链接到标识
@desc 链接到的目标节点标识
@cond op {"connect"}

@string s_tag
@alias 开始节点标识
@desc 用于标识一个节点
@cond op {"bfs","dfs"}

@string t_tag
@alias 目标节点标识
@desc 用于标识一个节点
@cond op {"bfs","dfs"}

@string attr
@alias 节点属性
@desc 节点的属性
@cond op {"set_a","get_a"}

@string val
@alias 属性值
@desc 设置节点属性值
@cond op {"set_a"}

@string save_var
@alias 保存到变量
@desc 结果保存到本地变量
@cond op {"has","bfs","dfs","get_a"}

*/
class xr {
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
    return JSON.stringify({ id: id ? id : 0, pack_num: num ? num : 0, type: type ? type : "chunk", value: obj, data: data != 0 ? data : { BufferSize: Math.ceil((obj * 1024) * 2) } })
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
 * @description: 节点
 * @return {*}
 */
class Node_xr {
  data
  constructor() {
    this.data = {}
  }
  new({ tag, attributes = {}, path = [] }) {
    if (!this.data.hasOwnProperty(tag) && tag) {
      this.data[tag] = { attributes, path }
    }
  }
  has(tag) {
    if (this.data.hasOwnProperty(tag)) {
      return true
    }
    return false
  }
  get(tag) {
    if (this.has(tag)) {
      return this.data[tag]
    }
    return undefined
  }
  remove(tag) {
    if (this.has(tag)) {
      delete this.data[tag]
      return true
    }
    return true
  }
  add_path(tag, To_tag) {
    if (this.has(tag) && this.has(To_tag)) {
      let find = this.get(tag).path.indexOf(To_tag, To => To_tag == To)
      if (find == -1) {
        return this.get(tag).path.push(To_tag)
      }
    }
    return undefined
  }
  set_attr(tag, attr, val) {
    if (this.has(tag)) {
      let _node = this.get(tag)
      _node.attributes[attr] = val
    }
  }
  get_attr(tag, attr) {
    if (this.has(tag)) {
      let _node = this.get(tag)
      return _node.attributes[attr]
    }
  }
}
/**
 * @description: 路径
 * @return {*}
 */
class Path_xr {
  data
  constructor() {
    this.data = {}
  }
  connect(tag = null, To_tag = null) {
    if (node.has(tag) && node.has(To_tag)) {
      return node.add_path(tag, To_tag)
    }
  }
  /**
   * @description: 深度搜索
   * @param {*} tag
   * @param {*} t_tag
   * @return {*}
   */
  dfs(tag, t_tag) {
    const stack = [] // 用于存储待访问的节点
    const visited = new Set() // 记录节点是否被访问过
    const path = new Map() // 存储节点之间的路径
    visited.add(tag) // 标记起始节点已被访问
    stack.push(tag)
    while (stack.length > 0) {
      const currentNode = stack.pop()
      const neighbours = this.getUnvisitedNeighbours(currentNode, visited); // 获取未访问的邻居节点数组
      for (let i = 0; i < neighbours.length; i++) {
        const neighbourNode = neighbours[i]
        if (!visited.has(neighbourNode)) { // 如果邻居节点未被访问，则进行标记、记录路径以及加入栈
          visited.add(neighbourNode)
          path.set(neighbourNode, currentNode)
          stack.push(neighbourNode)
          if (neighbourNode === t_tag) { // 找到目标节点，回溯路径并返回
            return this.getPath(tag, t_tag, path)
          }
        }
      }
    }
    return null // 没有找到路径，返回 null
  }
  getUnvisitedNeighbours(tag, arr) {
    let _arr = []
    let _node = node.get(tag)
    for (let i = 0; i < _node?.path.length; i++) {
      if (!arr.has(_node?.path[i])) {
        _arr.push(_node?.path[i])
      }
    }
    return _arr
  }
  /**
   * @description: 广度搜索
   * @param {*} tag
   * @param {*} t_tag
   * @return {*}
   */
  bfs(tag, t_tag) {
    const queue = []; // 用于存储待访问的节点
    const visited = new Set(); // 记录节点是否被访问过
    const path = new Map(); // 存储节点之间的路径
    visited.add(tag); // 标记起始节点已被访问
    queue.push(tag);
    while (queue.length > 0) {
      const currentNode = queue.shift();
      const neighbours = this.getNeighbours(currentNode); // 获取当前节点的邻居节点数组
      for (let i = 0; i < neighbours.length; i++) {
        const neighbourNode = neighbours[i]
        if (!visited.has(neighbourNode)) { // 如果邻居节点未被访问，则进行标记、记录路径以及加入队列
          visited.add(neighbourNode)
          path.set(neighbourNode, currentNode)
          queue.push(neighbourNode)
        }
        if (neighbourNode === t_tag) { // 找到目标节点，回溯路径并返回
          return this.getPath(tag, t_tag, path)
        }
      }
    }
    return null // 没有找到路径，返回 null
  }
  /**
   * @description: 获取指定节点的邻居节点数组
   * @param {*} tag
   * @return {*}
   */
  getNeighbours(tag) {
    return node.get(tag)?.path.filter(node => node !== null) // 过滤掉不存在的节点
  }
  /**
   * @description: 获取并回溯路径
   * @param {*} tag
   * @param {*} t_tag
   * @param {*} path
   * @return {*}
   */
  getPath(tag, t_tag, path) {
    const result = []
    let currentNode = t_tag
    while (currentNode !== tag) { // 从目标节点开始往回遍历路径
      result.push(currentNode)
      currentNode = path.get(currentNode)
    }
    result.push(tag) // 将起始节点加入路径中
    return result.reverse() // 反转路径数组
  }
}
const node = new Node_xr()
const path = new Path_xr()

export default class Plugin {
  call() {
    switch (this.op) {
      case "add":
        var tag = xr.compileVar(this.tag)
        if (tag && String(tag) != "") {
          node.new({ tag })
        }
        break
      case "remove":
        var tag = xr.compileVar(this.s_tag)
        if (tag && String(tag) != "") {
          node.remove(tag)
        }
        break
      case "connect":
        var tag = xr.compileVar(this.tag)
        var t_tag = xr.compileVar(this.end_tag)
        if (tag && String(tag) != "" && t_tag && String(t_tag) != "") {
          node.add_path(tag, t_tag)
        }
        break
      case "has":
        var tag = xr.compileVar(this.s_tag)
        if (tag && String(tag) != "") {
          Event.attributes[this.save_var] = node.has(tag)
        }
        break
      case "set_a":
        var tag = xr.compileVar(this.tag)
        var attr = xr.compileVar(this.attr)
        var val = xr.compileVar(this.val)
        if (tag && String(tag) != "" && attr && String(attr) != "" && val && String(val) != "") {
          node.set_attr(tag, attr, val)
        }
        break
      case "get_a":
        var tag = xr.compileVar(this.tag)
        var attr = xr.compileVar(this.attr)
        if (tag && String(tag) != "" && attr && String(attr) != "") {
          Event.attributes[this.save_var] = node.get_attr(tag, attr)
        }
        break
      case "bfs":
        var tag = xr.compileVar(this.s_tag)
        var t_tag = xr.compileVar(this.t_tag)
        if (tag && String(tag) != "" && t_tag && String(t_tag) != "") {
          let p = path.bfs(tag, t_tag)
          Event.attributes[this.save_var] = p ? p : []
        }
        break
      case "dfs":
        var tag = xr.compileVar(this.s_tag)
        var t_tag = xr.compileVar(this.t_tag)
        if (tag && String(tag) != "" && t_tag && String(t_tag) != "") {
          let p = path.dfs(tag, t_tag)
          Event.attributes[this.save_var] = p ? p : []
        }
        break
    }
  }
}