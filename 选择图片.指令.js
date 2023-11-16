/*
@plugin 选择图片
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

@string title
@alias 窗口标题
@default false

@boolean is_multiple
@alias 是否可以多选
@default false

@file call_back
@filter event
@alias 回调事件
@desc 
1.@result：选择的图片数组
2.@canceled 是否被用户取消
*/

export default class Plugin {
  call() {
    let properties = ['openFile']
    if (this.is_multiple) { properties.push("multiSelections") }
    const { ipcRenderer } = require("electron")
    ipcRenderer.invoke("show-open-dialog", {
      title: this.title || "选择文件",
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif','jpeg'] },
      ],
      properties,
    }).then((e) => {
      if (!e.canceled) {
        let arr = []
        let length = e.filePaths.length
        for (let ik = 0; ik < length; ik++) {
          let img = new Image();
          img.src = new URL(e.filePaths[ik])
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext("2d")
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            let suffix = String(e.filePaths[ik]).slice(e.filePaths[ik].lastIndexOf(".")+1, e.filePaths[ik].length)
            let base64 = canvas.toDataURL('image/' + suffix)
            try {
              arr.push(base64)
            } catch (e) { throw new Error("图片转换出错"); }
            canvas.remove()
            if (ik == length - 1) {
              const cmd = EventManager.guidMap[this.call_back]
              if (cmd) {
                const event = new EventHandler(cmd)
                event.attributes["@result"] = [...arr]
                event.attributes["@canceled"] = e.canceled
                EventHandler.call(event)
              }
            }
          }
        }
      }
      return e
    })
  }
}