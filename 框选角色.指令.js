/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-07 23:59:00
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 框选实体
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

如果坐标是屏幕坐标的话需要转换成场景坐标（本身就是则不用转换）

@position-getter start_pos
@alias 框选起点

@boolean start_pos_bool
@alias 起点转换场景坐标
@default true

@position-getter end_pos
@alias 框选终点

@boolean end_pos_bool
@alias 终点转换场景坐标
@default true

@string save_var
@default '@actors'
@alias 保存变量

*/

export default class DetectionActor_xr {
  call() {
    if (this.start_pos != this.end_pos) {
      /** 计算场景坐标 */
      const scene = Scene.binding
      if (scene === null) return
      if (this.start_pos_bool) {
        const x = Math.round(Camera.scrollLeft) + this.start_pos.x / Camera.zoom
        const y = Math.round(Camera.scrollTop) + this.start_pos.y / Camera.zoom
        var sceneX = x / scene.tileWidth
        var sceneY = y / scene.tileHeight
      } else {
        var sceneX = this.start_pos.x
        var sceneY = this.start_pos.y
      }

      if (this.end_pos_bool) {
        const x1 = Math.round(Camera.scrollLeft) + this.end_pos.x / Camera.zoom
        const y1 = Math.round(Camera.scrollTop) + this.end_pos.y / Camera.zoom
        var sceneX1 = x1 / scene.tileWidth
        var sceneY1 = y1 / scene.tileHeight
      } else {
        var sceneX1 = this.end_pos.x
        var sceneY1 = this.end_pos.y
      }
      let getWidth = Command.compileNumber(Math.abs(sceneX1 - sceneX), 0, 0, 512)()
      let getHeight = Command.compileNumber(Math.abs(sceneY1 - sceneY), 0, 0, 512)()
      const cells = Scene.actors.cells.get(sceneX, sceneY, sceneX1, sceneY1)
      const length = cells.count
      let actors = []
      for (let i = 0; i < length; i++) {
        for (const actor of cells[i]) {
          actors.push(actor)
        }
      }
      if (this.save_var) Event.attributes[this.save_var] = actors
    }
  }
  onStart() {
  }
}