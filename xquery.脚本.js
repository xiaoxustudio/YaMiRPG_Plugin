/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-15 20:59:14
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin Xquery
@version 1.0
@author 徐然
@link
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
垂直居中: "verticalAlign"、水平居中: "horizontalAlign"、
图片: "image"、行距: "lineSpacing"、
字体: "font"、边框: "border"、
ID: "ID"、方向: "direction"、
显示: "display"、悬停图片: "hoverImage"

*/
const xQuery = function (content) {
  return new xQuery.fn.init(content)
}
xQuery.fn = {
  init: function (seletor) {
    let elemMap = xQuery.fn.map()
    if (typeof seletor === "string") {
      let sp = []
      // 解析对应索引属性
      let s_token = xQuery.fn.parseTextUnits(seletor)
      let nowui = UI.root
      let child_nodes = []
      // 查找
      let index = 0
      let _cacheFind = []
      for (; ;) {
        if (_cacheFind.indexOf(nowui.presetId) == -1) {
          if (nowui.children.length > 0 && typeof s_token[index].type !== "undefined") {
            // 有效节点且类型相等
            const findChild = (node) => {
              let arr = []
              for (let i in node.children) {
                let path_str = xQuery.fn.path(node.children[i], true)
                let path_str1 = xQuery.fn.path(s_token, true)
                if (String(path_str).includes(path_str1) && s_token[s_token.length - 1] && node.children[i] instanceof s_token[s_token.length - 1].type) {
                  let attr = s_token[s_token.length - 1].attrs
                  if (Object.keys(attr).length > 0) {
                    let maptoAttr = xQuery.fn.mapAttr()
                    let eval_str = ""
                    for (let key in attr) {
                      eval_str += "this['" + maptoAttr[key] + "']=='" + attr[key] + "'&&"
                    }
                    let str_str = "return " + eval_str.slice(0, eval_str.lastIndexOf("&&")) + " ? true : false"
                    let res = new Function(str_str).bind(node.children[i])()
                    if (res) {
                      arr.push(node.children[i])
                      _cacheFind.push(node.presetId)
                    }
                  } else {
                    arr.push(node.children[i])
                    _cacheFind.push(node.presetId)
                  }
                  index++
                }
                // 查找子节点
                if (node.children[i].children.length > 0) {
                  let find = findChild(node.children[i])
                  if (find.length > 0) {
                    arr = [...arr, ...find]
                  }
                }
              }
              return arr
            }
            let nodeChild = findChild(nowui)
            if (nodeChild.length > 0) {
              child_nodes = [...child_nodes, ...nodeChild]
            }
          }
          _cacheFind.push(nowui.presetId)
        } else if (index >= sp.length) {
          break
        }
      }
      xQuery.fn.merge(this, child_nodes)
    }
    return this
  },
  parseTextUnits(text) {
    let words = [...text.split("")]
    this.elemMap = xQuery.fn.map()
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
  map(a = false) {
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
    let elemMap = xQuery.fn.map(true)
    let elemToMap = xQuery.fn.map()
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
  getObjNum(t) {
    return Object.keys(t).filter(index => !isNaN(index))
  },
  text(content) {
    let num = xQuery.fn.getObjNum(this)
    let elemMap = xQuery.fn.map(true)
    if (content) {
      for (let i in num) {
        let na = this[i].constructor.name
        if (na in elemMap) {
          this[i].content = content
        }
      }
    }
  }
}
export default function () {
  xQuery.fn.init.prototype = xQuery.fn;
  global.$ = global.xQuery = xQuery;
}