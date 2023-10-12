/*
@plugin 下拉按钮
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

将脚本导入在需要转变为下拉按钮的按钮下的脚本选项里面

设置菜单并设置子列表实例

@string[] items_var
@alias 项目列表

@element-id items_node
@alias 项目列表元素实例

*/

export default class optionButton_UI_xr {
  is_show
  ui
  constructor(ui) {
    if (ui instanceof ButtonElement) {
      this.ui = ui
    }
    this.is_show = false
  }
 
  onStart() {
    // 自动创建菜单
    for (let i in this.items_var) {
      let str_text = this.items_var[i]
      let node = UI.createElement(this.items_node)
      node.name = str_text + i
      node.content = str_text
      const { x, y } = this.ui
      node.attributes["_index"] = i
      this.ui.appendChild(node)
      node.set({ x: (x - this.ui.transform.x), y: (y - this.ui.transform.y) + node.height * (Number.parseInt(i) + 1) })
      node.hide()
    }
  }
  onClick(ui) {
    if (!(ui instanceof UIElement)) {
      this.ui = ui
    }
    for (let i in this.ui.children) {
      let node = this.ui.children[i]
      if (!node.visible) {
        node.show()
      } else {
        node.hide()
      }
    }
  }
}