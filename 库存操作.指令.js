/*
 * @Author: xuranXYS
 * @LastEditTime: 2023-11-14 18:15:53
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 库存扩展
@version 1.0
@author 徐然
@link
@desc

@actor-getter acget
@alias 角色库存

@option op {"item_call","copy_inv"}
@alias 操作 {库存项调用,复制库存项添加到库存}
@desc 
库存项调用：为库存的每个物品调用这个事件
复制库存项添加到库存：将库存的指定项复制一份并添加进库存

@option copy_op {"copy_ind","copy_id","copy_obj"}
@alias 子操作 {通过索引,通过ID,通过实例}
@cond op {"copy_inv"}

@option copy_type {"equip","item"}
@alias ID类型 {装备,物品}
@cond copy_op {"copy_id"}

@variable-number copy_var_num
@alias 操作索引
@cond copy_op {"copy_ind"}

@variable-getter copy_var_obj
@alias 操作变量
@cond copy_op {"copy_id","copy_obj"}
@desc ID或对象实例

@variable-number copy_num
@alias 数量
@cond op {"copy_inv"}
@desc 如果为负数则为复制对象的数量（物品有效）

@file event_id
@filter event
@alias 事件回调
@cond op {"item_call"}
@desc
内置变量：
1.@index：索引
2.@result：库存实例

@boolean is_inhert
@alias 共享变量
@cond op {"item_call"}
@desc

*/

export default class inventory_ex {
  call() {
    const inv = this.acget?.inventory
    if (!inv) { return true }
    switch (this.op) {
      case "item_call": {
        const commands = EventManager.guidMap[this.event_id]
        if (commands) {
          for (let i in inv.list) {
            const event = new EventHandler(commands)
            if (this.is_inhert) {
              event.inheritEventContext(Event)
            }
            event.attributes["@result"] = inv.list[i]
            event.attributes["@index"] = parseInt(i)
            EventHandler.call(event)
          }
        }
        break
      }
      case "copy_inv": {
        switch (this.copy_op) {
          case "copy_ind": {
            let num = typeof this.copy_num == "number" ? this.copy_num : this.copy_num?.get()
            if (typeof this.copy_var_num === "number") {
              let s_item = inv.list[this.copy_var_num]
              if (s_item instanceof Item) {
                let item = new Item(Data.items[s_item.id])
                item.attributes = s_item.attributes
                item.quantity = num > 0 ? num : s_item.quantity
                inv.insert(item)
              }
              if (s_item instanceof Equipment) {
                let item = new Equipment(Data.equipments[s_item.id])
                item.attributes = s_item.attributes
                inv.insert(item)
              }
            } else {
              let s_item = this.copy_var_num?.get()
              if (typeof s_item !== "object") { return false }
              if (s_item instanceof Item) {
                let item = new Item(Data.items[s_item.id])
                item.attributes = s_item.attributes
                item.quantity = num > 0 ? num : s_item.quantity
                inv.insert(item)
              }
              if (s_item instanceof Equipment) {
                let item = new Equipment(Data.equipments[s_item.id])
                item.attributes = s_item.attributes
                inv.insert(item)
              }
            }
            break
          }
          case "copy_obj":
          case "copy_id": {
            let s_item = this.copy_var_obj?.get()
            let num = typeof this.copy_num == "number" ? this.copy_num : this.copy_num?.get()
            if (typeof s_item === "string") {
              if (this.copy_type == "item") {
                let item = new Item(Data.items[s_item])
                item.quantity = num > 0 ? num : 1
                inv.insert(item)
              }
              if (this.copy_type == "equip") {
                for (let snum = 1; snum <= num; snum++) {
                  let item = new Equipment(Data.equipments[s_item])
                  inv.insert(item)
                }
              }
            } else if (typeof s_item === "object") {
              if (s_item instanceof Item) {
                let item = new Item(Data.items[s_item.id])
                item.quantity = num > 0 ? num : s_item.quantity
                inv.insert(item)
              }
              if (s_item instanceof Equipment) {
                for (let snum = 1; snum <= num; snum++) {
                  let item = new Equipment(Data.equipments[s_item.id])
                  inv.insert(item)
                }
              }
            }
            break
          }
        }
        break
      }
    }
  }
}
