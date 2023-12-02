/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-12-02 22:02:56
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 标签扩展
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 


【icon】
<icon:id,type ?[,...（这里和image标签一样的用法）]>
插入对象图标标签
type取值:actor（角色）、item（物品）、equip（装备）、state（状态）、skill（技能）

【call】
<call:id,不填 || true>
调用事件，当第二个参数为true时，事件调用将共享本地变量

【code】
<code:...>
执行JS代码

*/

export default class Talk_xr {
  onStart() {
    let ori_matchTag = Printer.prototype.matchTag
    Printer.prototype.matchTag = function () {
      ori_matchTag.call(this)
      const startIndex = this.index
      const endIndex = this.content.indexOf('>', startIndex + 1) + 1
      const string = this.content.slice(startIndex, endIndex)
      let match
      // 使用指定图像
      if (match = string.match(/^<icon:([0-9a-f]{16}),([a-zA-Z]+)(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?(?:,(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000),(\d|[1-9]\d|[1-9]\d\d|[1-9]\d\d\d|10000))?>$/i)) {
        const guid = match[1]
        let parse_type = (type) => {
          let data_now;
          switch (type) {
            case 'actor': {
              try {
                data_now = Data.actors[guid] ? new Actor(Data.actors[guid]) : new Actor(Scene.binding?.actors.presets[guid]?.data)
              } catch (e) {
                data_now = null
              }
              break
            }
            case 'skill': {
              try {
                data_now = new Skill(Data.skills[guid])
              } catch (e) {
                data_now = null
              }
              break
            }
            case 'state': {
              try {
                data_now = new State(Data.states[guid])
              } catch (e) {
                data_now = null
              }
              break
            }
            case 'equip': {
              try {
                data_now = new Equipment(Data.equipments[guid])
              } catch (e) {
                data_now = null
              }
              break
            }
            case 'item': {
              try {
                data_now = new Item(Data.items[guid])
              } catch (e) {
                data_now = null
              }
              break
            }
          }
          return data_now
        }
        let type_data = parse_type(match[2])
        let clip = null
        let width = 0
        let height = 0
        if (!type_data) { return false }
        if (!match[3]) {
          // 存在1个参数
          width = parseInt(type_data.data.clip[2] ?? this.sizes[0])
          height = parseInt(type_data.data.clip[3] ?? this.sizes[0])
        } else if (!match[5]) {
          // 存在3个参数
          width = parseInt(match[3])
          height = parseInt(match[4])
        } else {
          // 存在5-7个参数
          clip = [
            parseInt(match[3]),
            parseInt(match[4]),
            parseInt(match[5]),
            parseInt(match[6]),
          ]
          width = parseInt(match[7] ?? this.sizes[0])
          height = parseInt(match[8] ?? this.sizes[0])
        }
        this.drawBuffer()
        if (type_data instanceof Actor) {
          this.loadImage(type_data.data.portrait, clip || type_data.data.clip, width, height)
        } else { this.loadImage(type_data.data.icon, clip || type_data.data.clip, width, height) }
        this.index += match[0].length
        return true
      }
      if (match = string.match(/^<call:([0-9a-f]{16})(?:,(false|true))?>$/i)) {
        const guid = match[1]
        let data = EventManager.guidMap[guid]
        if (data) {
          const event = new EventHandler(data)
          if (match[2].trim() === "true") { event.inheritEventContext(Event) }
          EventHandler.call(event)
        }
        this.index += match[0].length
      }
      if (match = string.match(/^<code:(.*)>$/i)) {
        const code = match[1]
        try{new Function(code).bind(Event)()}catch(e){}
        this.index += match[0].length
      }
      return false
    }
  }
}