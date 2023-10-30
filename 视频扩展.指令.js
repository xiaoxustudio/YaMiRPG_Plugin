/*
@plugin 视频扩展
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

扩展视频指令

@element-id video_id
@alias 视频元素

@option op {"play","pause","continue"}
@alias 操作 {播放,暂停, 继续}

*/

export default class Plugin {
  async call() {
    await void 0
    let ui_obj = UI.get(this.video_id)
    if (ui_obj instanceof VideoElement) {
      switch (this.op) {
        case "play":
          ui_obj.player.play().catch(error => { })
          document.on('visibilitychange', ui_obj._onSwitch)
          break
        case "pause":
          ui_obj.player.pause()
          document.off('visibilitychange', ui_obj._onSwitch)
          break
        case "continue":
          ui_obj.continue()
          break
      }
    }
  }
}