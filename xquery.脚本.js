/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-17 12:43:24
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin Xquery
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

可快速选择UI

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

目前支持的属性：
名称: "name"、内容: "content"、
颜色: "color"、大小: "size"、
垂直居中: "verticalAlign" 支持字符串：top、middle、bottom
水平居中: "horizontalAlign" 支持字符串：left、center、right
图片: "image"、行距: "lineSpacing"、
字体: "font"、边框: "border"、
ID: "ID"、方向: "direction"、
显示: "display"、悬停图片: "hoverImage"

目前支持的方法
hide（隐藏）、show（显示）、toggle（显隐切换）、
map（遍历）、on（监听事件）、off（取消监听）

*/
const xQuery = function (content) {
  return new xQuery.fn.init(content)
}
xQuery.fn = {
  init: function (selector) {
    if (typeof selector !== "string") {
      return this;
    }
    // 解析选择器
    const s_token = xQuery.fn.parseTextUnits(selector);
    const nowui = UI.root;
    let child_nodes = [];
    let index = 0;
    let _cacheFind = new Set();
    const findChild = (node) => {
      let arr = [];
      for (let i of Array.from(node.children)) {
        const path_str = xQuery.fn.path(i, true);
        const path_str1 = xQuery.fn.path(s_token, true);
        if (
          !_cacheFind.has(node.presetId) &&
          String(path_str).includes(path_str1) &&
          s_token[s_token.length - 1] &&
          i instanceof s_token[s_token.length - 1].type
        ) {
          const attr = s_token[s_token.length - 1].attrs;
          if (Object.keys(attr).length > 0 && Object.entries(attr).every(([key, value]) => i[xQuery.fn.mapAttr()[key]] === value)) {
            arr.push(i);
            _cacheFind.add(node.presetId);
          } else if (Object.keys(attr).length == 0) {
            arr.push(i);
            _cacheFind.add(node.presetId);
          } else {
            _cacheFind.add(node.presetId);
          }
          index++;
        }
        if (i.children.length > 0) {
          arr.push(...findChild(i));
        }
      }
      return arr;
    };
    while (index < s_token.length && !_cacheFind.has(nowui.presetId)) {
      if (nowui.children.length > 0 && typeof s_token[index].type !== "undefined") {
        let nodeChild = findChild(nowui);
        child_nodes.push(...nodeChild);
      }
      _cacheFind.add(nowui.presetId);
    }
    xQuery.fn.merge(this, child_nodes);
    return this;
  },
  parseTextUnits(text) {
    let words = [...text.split("")]
    this.elemMap = xQuery.fn.mapElem()
    let arr_obj = []
    //定义基础的枚举
    let tokens = []
    let nowobj = {}
    let attr = false
    let attr_arr = {}
    for (; ;) {
      let word = words.shift()
      // 判断是否是字母
      if (/@$/.test(word) && attr) {
        // 截取属性
        let val = ""
        let key = ""
        let is_key = true
        word = words.shift() // 去掉@
        while (!/^[\s]$/.test(word)) {
          if (word == "]") { attr = false; break }
          if (word == "=") {
            word = words.shift()
            is_key = false
            continue
          }
          else if (is_key) {
            key += word
            word = words.shift()
          } else if (!is_key) {
            val += word
            word = words.shift()
          }
        }
        attr_arr[key] = val
        nowobj.attrs = { ...nowobj.attrs, ...attr_arr }
        attr_arr = {}
      } else if (/[a-zA-Z0-9]$/.test(word) && !attr) {
        tokens.push(word)
      } else if (/[\s]$/.test(word)) {
        // 单词分割
        if (tokens.length > 0) {
          nowobj = {
            val: tokens.join(""),
            attrs: {},
            type: this.elemMap[tokens.join("")],
          }
          arr_obj.push(nowobj)
          tokens = []
        }
        continue
      } else if (/^[\[]$/.test(word)) {
        if (tokens.length > 0) {
          nowobj = {
            val: tokens.join(""),
            attrs: {},
            type: this.elemMap[tokens.join("")],
          }
          arr_obj.push(nowobj)
          tokens = []
        }
        attr = true
      }
      // 判断是否分词结束
      if (words.length == 0) {
        if (tokens.length > 0) {
          nowobj = {
            val: tokens.join(""),
            attrs: {},
            type: this.elemMap[tokens.join("")],
          }
          arr_obj.push(nowobj)
          tokens = []
        }
        break
      }
    }
    return arr_obj
  },
  parseTextChild(text) {
    let words = text.split("n")
    if (words.length <= 0 || !(/[n]/.test(text)) || !(/([0-9]+)?n([0-9]+)?/.test(text))) { return [] }
    this.elemMap = xQuery.fn.mapElem()
    let left = 0
    if (/[0-9]+/.test(words[0])) {
      left = new Function("return " + words[0])()
    }
    let right = 0
    if (/[0-9]+/.test(words[1])) {
      right = new Function("return " + words[1])()
    }
    let num = xQuery.fn.getObjNum(this)
    let index;
    let arr = []
    for (index = 0; index < num.length; index++) {
      if (left == 0 && right == 0) {
        arr.push(this[index])
      } else if (index % left === 0) {
        if (right !== 0) {
          let sub_index = parseInt(index + right)
          if (this?.[sub_index]) {
            arr.push(this?.[sub_index])
          }
        } else {
          arr.push(this?.[index])
        }
      }
    }
    return arr
  },
  mapElem(a = false) {
    if (a) {
      return {
        ImageElement: "image",
        TextElement: "text",
        TextBoxElement: "textbox",
        DialogBoxElement: "dialogbox",
        ProgressBarElement: "progressbar",
        ButtonElement: "button",
        AnimationElement: "animation",
        VideoElement: "video",
        WindowElement: "window",
        ContainerElement: "container",
        RootElement: "root",
      }
    }
    return {
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
    }
  },
  mapAttr(a = false) {
    if (a) {
      return {
        name: "名称",
        content: "内容",
        color: "颜色",
        size: "大小",
        verticalAlign: "垂直居中",
        horizontalAlign: "水平居中",
        image: "图片",
        lineSpacing: "行距",
        font: "字体",
        border: "边框",
        ID: "ID",
        direction: "方向",
        display: "显示",
        hoverImage: "悬停图片",
        align: "对齐",
      }
    }
    return {
      名称: "name",
      内容: "content",
      颜色: "color",
      大小: "size",
      垂直居中: "verticalAlign",
      水平居中: "horizontalAlign",
      图片: "image",
      行距: "lineSpacing",
      字体: "font",
      边框: "border",
      ID: "ID",
      方向: "direction",
      显示: "display",
      悬停图片: "hoverImage",
      对齐: "align",
    }
  },
  merge: function (array1, array2) {
    if (array1 instanceof Array) {
      return array1.concat(array2)
    } else {
      const length = array1.length || 0
      let i = length;
      for (let j = 0; j < array2.length; j++) {
        array1[i + j] = array2[j]
      }
      array1.length = length + array2.length
      return array1
    }
  },
  path: function (node, is_str = false) {
    let elemMap = xQuery.fn.mapElem(true)
    let elemToMap = xQuery.fn.mapElem()
    let arr = []
    // 判断类型
    if (node instanceof Array) {
      for (let i in node) {
        let name = node[i].val
        arr.push(name)
      }
      return is_str ? arr.join(" ") : arr
    } else {
      let name = node.constructor.name
      if (name in elemMap) {
        arr.push(elemMap[name])
        if (node.parent) {
          let parent = xQuery.fn.path(node.parent)
          arr = [...parent, ...arr]
        }
      }
      return is_str ? arr.join(" ") : arr
    }
  },
  getObjNum(t = this) {
    return Object.keys(t).filter(index => !isNaN(index))
  },
  _UIPrototype(prototype, content, content_call_back = () => { }, scall_back = () => { }) {
    const to_call = (con) => {
      let res = content_call_back(con)
      if (res) { return res } else { return con }
    }
    content = to_call(content)
    let num = xQuery.fn.getObjNum(this)
    let elemMap = xQuery.fn.mapElem(true)
    if (content) {
      for (let i in num) {
        let na = this[i].constructor.name
        if (na in elemMap) {
          this[i][prototype] = content
        }
      }
    } else {
      let str = ""
      for (let i in num) {
        let na = this[i].constructor.name
        if (na in elemMap) {
          if (typeof this[i][prototype] === "string") {
            str += this[i][prototype]
          } else if (typeof this[i][prototype] == "number") {
            if (!(str instanceof Array)) { if (str.length > 0) { str = [str] } else { str = [] } }
            str.push(this[i][prototype])
          } else {
            str += this[i][prototype]
          }
        }
      }
      return str
    }
  },
  _UIFunction(prototype, check_call = () => { return true }, is_childcall = false, ...args) {
    let num = xQuery.fn.getObjNum(this)
    let elemMap = xQuery.fn.mapElem(true)
    const to_call = (node, prototype) => {
      return arguments[1](node, prototype) ? true : false
    }
    const call_childfunc = (node) => {
      for (let ik in node.children) {
        if (typeof node.children[ik][prototype] === "function") {
          if (arguments.length >= 3) {
            if (!to_call(node.children[ik], prototype)) {
              continue
            }
          }
          node.children[ik][prototype](...args)
        }
      }
    }
    if (!prototype) { return false }
    for (let i of num) {
      if (this[i].constructor.name in elemMap && typeof this[i][prototype] === "function") {
        // 判断是否子元素也要调用这个方法
        if (arguments.length >= 2) {
          if (arguments[1]) {
            call_childfunc(this[i])
          }
        }
        if (arguments.length >= 3) {
          if (!to_call(this[i], prototype)) {
            continue
          }
        }
        // 最后父级元素执行这个方法
        if (num.length > 0) { this[i][prototype](...args) } else { return this[i][prototype](...args) }
      }
    }
  },
  text(content) {
    return this._UIPrototype("content", content)
  },
  name(content) {
    return this._UIPrototype("name", content)
  },
  isHexColor(color) {
    // 判断是否以'#'开头
    if (!color.startsWith('#')) return false;

    // 使用正则表达式验证六位十六进制数字
    const pattern = /^#([a-fA-F0-9]{6})$/;
    const pattern1 = /^#([a-fA-F0-9]{3})$/;
    const pattern2 = /^#([a-fA-F0-9]{4})$/;
    const pattern3 = /^#([a-fA-F0-9]{8})$/;
    return pattern.test(color) ? true : pattern1.test(color) ? true : pattern2.test(color) ? true : pattern3.test(color) ? true : false;
  },
  HexToRgba(hex) {
    if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
      const r = (hex[1] + hex[1]).toString(16)
      const g = (hex[2] + hex[2]).toString(16)
      const b = (hex[3] + hex[3]).toString(16)
      return r + g + b + "FF"
    }
    if (/^#([0-9a-fA-F]{4})$/.test(hex)) {
      const r = (hex[1] + hex[1]).toString(16)
      const g = (hex[2] + hex[2]).toString(16)
      const b = (hex[3] + hex[3]).toString(16)
      const a = (hex[4] + hex[4]).toString(16)
      return r + g + b + a
    }
    if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
      const r = (hex[1] + hex[2]).toString(16)
      const g = (hex[3] + hex[4]).toString(16)
      const b = (hex[5] + hex[6]).toString(16)
      return r + g + b
    }
    if (/^#([0-9a-fA-F]{8})$/.test(hex)) {
      const r = (hex[1] + hex[2]).toString(16)
      const g = (hex[3] + hex[4]).toString(16)
      const b = (hex[5] + hex[6]).toString(16)
      const a = (hex[7] + hex[8]).toString(16)
      return r + g + b + a
    }
    throw new Error("不能解析颜色");
  },
  color(content) {
    return this._UIPrototype("color", content, (con) => {
      if (con) {
        return xQuery.fn.isHexColor(content) ? xQuery.fn.HexToRgba(content) : new Error("不能解析颜色");
      }
    })
  },
  size(content) {
    return this._UIPrototype("size", content)
  },
  lineSpacing(content) {
    return this._UIPrototype("lineSpacing", content)
  },
  font(content) {
    return this._UIPrototype("font", content)
  },
  typeface(content) {
    return this._UIPrototype("typeface", content)
  },
  effect(content) {
    return this._UIPrototype("effect", content)
  },
  overflow(content) {
    return this._UIPrototype("overflow", content)
  },
  valign(content) {
    return this._UIPrototype("verticalAlign", content)
  },
  halign(content) {
    return this._UIPrototype("horizontalAlign", content)
  },
  direction(content) {
    return this._UIPrototype("direction", content)
  },
  width() {
    return this._UIPrototype("width").join(" ")
  },
  height() {
    return this._UIPrototype("height").join(" ")
  },
  align() {
    return this._UIPrototype("align")
  },
  nth(number) {
    let arr = []
    if (typeof number === "number") {
      let a = new xQuery.fn.init()
      arr.push(this[number - 1])
      return xQuery.fn.merge(a, arr)
    } else if (typeof number === "string") {
      let a = new xQuery.fn.init()
      arr.push(...this.parseTextChild(number))
      return xQuery.fn.merge(a, arr)
    }
  },
  getEventMap(a = false) {
    if (a) {
      return {
      }
    }
    return {
      click: "onClick",
      start: "onStart",
    }
  },
  on(type, callback = () => { }) {
    let num = this.getObjNum(this)
    let map = Script.eventTypeMap
    let str = ""
    if (!(type in map)) { return false }
    for (let i in num) {
      str = map[type] + "(){ let func = " + callback.toString() + ";func.bind(this)()}"
      let c_name = `xQuery_${type}`
      const obj = new Function(`return new class ${c_name} {${str}}`).bind(this)()
      // 先移除同名事件
      for (let event in this[i].script) {
        const name = this[i].script[event].constructor.name
        if (name === c_name) {
          delete this[i].script[event]
          if (typeof obj.update === 'function') {
            this[i].script.parent.updaters?.remove(obj)
          }
          for (let sc in this[i].script.instances) {
            const iobj = this[i].script.instances[sc]
            const iname = iobj.constructor.name
            if (iname === c_name) {
              if (typeof iobj.update === 'function') {
                this[i].script.parent.updaters?.remove(obj)
              }
              iobj.onScriptRemove?.(this[i].script.parent)
              this[i].script.instances.remove(iobj)
            }
          }
        }
      }
      // 添加事件
      this[i].script.add(obj)
    }
  },
  off(type) {
    let num = this.getObjNum(this)
    let map = Script.eventTypeMap
    let str = ""
    if (!(type in map)) { return false }
    for (let i in num) {
      let c_name = `xQuery_${type}`
      for (let event in this[i].script) {
        const name = this[i].script[event].constructor.name
        if (name === c_name) {
          delete this[i].script[event]
          for (let sc in this[i].script.instances) {
            const iobj = this[i].script.instances[sc]
            const iname = iobj.constructor.name
            if (iname === c_name) {
              if (typeof iobj.update === 'function') {
                this[i].script.parent.updaters?.remove(obj)
              }
              iobj.onScriptRemove?.(this[i].script.parent)
              this[i].script.instances.remove(iobj)
            }
          }
        }
      }
    }
  },
  hide() {
    return this._UIFunction("hide", true)
  },
  show() {
    return this._UIFunction("show", true)
  },
  toggle() {
    this._UIFunction("show", (node, prototype) => {
      if (node.visible) {
        node.hide()
      }
      else if (!node.visible) {
        node.show()
      }
      return false
    }, true)
  },
  map(func) {
    let num = xQuery.fn.getObjNum(this)
    if (typeof func === "function") {
      for (let i in num) {
        func(this[i], parseInt(i))
      }
    }
  },
  remove() {
    return this._UIFunction("remove", true)
  },
  clear() {
    return this._UIFunction("clear", true)
  },
  connect() {
    return this._UIFunction("connect")
  },
  disconnect() {
    return this._UIFunction("disconnect")
  },
  isVisible() {
    return this._UIFunction("isVisible")
  },
  destroy() {
    return this._UIFunction("destroy")
  },
  set(transformProps) {
    return this._UIFunction("set", () => { return true }, false, transformProps)
  },
}
export default function () {
  xQuery.fn.init.prototype = xQuery.fn;
  global.$ = global.xQuery = xQuery;
}