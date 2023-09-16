/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-09-12 10:54:11
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 事件扩展
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

事件内置参数：@deltatime 

角色模式,触发器模式,状态模式是在组件下面添加脚本
其余是按照指令的方法使用

@option operater {"actor_mode","trigger_mode","state_mode","scene_mode"}
@alias 操作 {角色模式,触发器模式,状态模式,场景模式}

@file frame_event_actor
@filter event
@alias 角色帧事件
@cond operater {"actor_mode"}

@file frame_event_trigger
@filter event
@alias 触发器帧事件
@cond operater {"trigger_mode"}

@file frame_event_state
@filter event
@alias 状态帧事件
@cond operater {"state_mode"}

@file frame_event_scene
@filter event
@alias 场景帧事件
@cond operater {"scene_mode"}
*/

export default class Ex_Event_xr {
  constructor(obj) {
    if (obj instanceof GlobalActor) {
      obj.updaters.set("frame_event", {
        update: deltatime => {
          const commands = EventManager.guidMap[this.frame_event_actor]
          if (commands) {
            const event = new EventHandler(commands)
            event.attributes["@deltaTime"] = deltatime
            EventHandler.call(event)
          }
        }
      })
    }

    if (obj instanceof Trigger) {
      obj.updaters.set("frame_event", {
        update: deltatime => {
          const commands = EventManager.guidMap[this.frame_event_trigger]
          if (commands) {
            const event = new EventHandler(commands)
            event.attributes["@deltaTime"] = deltatime
            EventHandler.call(event)
          }
        }
      })
    }

    if (obj instanceof State) {
      obj.updaters.set("frame_event", {
        update: deltatime => {
          const commands = EventManager.guidMap[this.frame_event_state]
          if (commands) {
            const event = new EventHandler(commands)
            event.attributes["@deltaTime"] = deltatime
            EventHandler.call(event)
          }
        }
      })
    }
  }
  call() {
    switch (this.operater) {
      case "scene_mode":
        Scene.on("initialize", (scene) => {
          scene.updaters.set("frame_event", {
            update: deltatime => {
              const commands = EventManager.guidMap[this.frame_event_scene]
              if (commands) {
                const event = new EventHandler(commands)
                event.attributes["@deltaTime"] = deltatime
                EventHandler.call(event)
              }
            }
          })
        })
        break
    }
  }
}
