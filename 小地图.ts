/*
@plugin 小地图
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc 

在场景加载完成后显示简易小地图，显示角色和障碍物等对象分布。
公共方法：
window.Minimap.hide() // 隐藏小地图
window.Minimap.show() // 显示小地图

@number width
@alias 小地图宽度
@default 200

@number height
@alias 小地图高度
@default 200

@color playerColor
@alias 玩家点颜色
@default 00ff00ff

@color actorColor
@alias 角色点颜色
@default 0000ffff

@color enemyColor
@alias 敌人点颜色

@color triggerColor
@alias 触发器颜色
@default ffff00ff

@color obstacleColor
@alias 障碍点颜色
@default 00000000

@string[] layerColor
@alias 层级颜色
@desc 当为空时，将自行计算颜色，否则使用自定义颜色
@default ['','','']

@color borderColor
@alias 边框颜色
@default ffffffff

@number borderWidth
@alias 边框宽度
@default 2

@number minScale
@alias 最小缩放比例
@default 1

@number maxScale
@alias 最大缩放比例
@default 2

@option position {"right-top", "right-bottom","left-top","left-bottom","custom-position"}
@alias 小地图初始位置 {右上,右下,左上,左下,自定义位置}
@default right-top


@variable-number positionOffsetX
@alias 小地图X偏移
@default 0
@cond position {"right-top", "right-bottom","left-top","left-bottom"}


@variable-number positionOffsetY
@alias 小地图y偏移
@default 0
@cond position {"right-top", "right-bottom","left-top","left-bottom"}


@variable-number positionY
@alias 小地图自定义位置Y
@cond position {"custom-position"}
@default 0

@variable-number positionX
@alias 小地图自定义位置X
@cond position {"custom-position"}
@default 0

@variable-number positionY
@alias 小地图自定义位置Y
@cond position {"custom-position"}
@default 0
*/

export default class Minimap implements Script<Plugin> {
  width!: number
  height!: number
  playerColor!: string
  enemyColor!: string
  actorColor!: string
  obstacleColor!: string
  borderColor!: string
  borderWidth!: number
  minScale!: number
  maxScale!: number
  scale: number = 1
  position!: string

  // 脚本属性
  enabled: boolean = false
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  positionX!: number
  positionY!: number
  positionOffsetX!: number
  positionOffsetY!: number
  colorMode!: string
  layerColor!: string
  triggerColor!: string

  constructor() {
    (window as any).Minimap = this
  }

  onStart(): void {
    Scene.on('load', scene => {
      this.enabled = true
      this.createCanvas()
      scene.renderers.push(this)
    })
  }

  createCanvas(): void {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.width
      this.canvas.height = this.height
      this.ctx = this.canvas.getContext('2d')!
      this.canvas.style.position = 'absolute'
      this.canvas.style.zIndex = '1000'
      this.canvas.style.pointerEvents = 'auto'
      this.canvas.style.top = ''
      this.canvas.style.bottom = ''
      this.canvas.style.left = ''
      this.canvas.style.right = ''
      switch ((this.position || 'right-top').toLowerCase()) {
        case 'right-top':
          this.canvas.style.right = `${16 + this.positionOffsetX}px`
          this.canvas.style.top = `${16 + this.positionOffsetY}px`
          break
        case 'right-bottom':
          this.canvas.style.right = `${16 + this.positionOffsetX}px`
          this.canvas.style.bottom = `${16 + this.positionOffsetY}px`
          break
        case 'left-top':
          this.canvas.style.left = `${16 + this.positionOffsetX}px`
          this.canvas.style.top = `${16 + this.positionOffsetY}px`
          break
        case 'left-bottom':
          this.canvas.style.left = `${16 + this.positionOffsetX}px`
          this.canvas.style.bottom = `${16 + this.positionOffsetY}px`
          break
        case 'custom-position':
          this.canvas.style.left = `${this.positionX}px`
          this.canvas.style.top = `${this.positionY}px`
          break
        default:
          this.canvas.style.right = `${16 + this.positionOffsetX}px`
          this.canvas.style.top = `${16 + this.positionOffsetY}px`
      }
      document.body.appendChild(this.canvas)
      this.canvas.addEventListener('wheel', (e) => {
        e.preventDefault()
        const oldScale = this.scale
        if (e.deltaY < 0) {
          this.scale = Math.min(this.maxScale, this.scale * 1.1)
        } else {
          this.scale = Math.max(this.minScale, this.scale / 1.1)
        }
        this.render()
      }, { passive: false })
    }
  }

  render(): void {
    if (!this.enabled || !Scene.binding) return
    const scene = Scene.binding
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, this.width, this.height)
    ctx.clip()
    ctx.translate(this.width / 2, this.height / 2)
    ctx.scale(this.scale, this.scale)
    ctx.translate(-this.width / 2, -this.height / 2)
    if (scene.parallax && scene.parallax.tilemaps) {
      let index = 0
      for (const tilemap of scene.parallax.tilemaps) {
        if (!(tilemap as any).tiles) continue
        if (tilemap.layer !== 'background' || !tilemap.visible) continue
        const tiles = (tilemap as any).tiles
        const width = (tilemap as any).width
        const height = (tilemap as any).height
        const tileData = (tilemap as any).tileData
        for (let ty = 0; ty < height; ty++) {
          for (let tx = 0; tx < width; tx++) {
            const tileIdx = tx + ty * width
            const tileId = tiles[tileIdx]
            if (!tileId) continue
            const data = tileData[tileId & 0xffffff00]
            if (!data) continue
            let color = '#cccccc'
            if (data.tileset && data.tileset.id) {
              if (this.layerColor[index]) {
                color = Color.parseCSSColor(this.layerColor[index])
              } else {
                const hash = Array.from(String(data.tileset.id)).reduce((a, c) => a + (typeof c === 'string' ? c.charCodeAt(0) : 0), 0)
                color = `hsl(${hash % 360},60%,70%)`
              }
            }
            ctx.fillStyle = color
            const px = Math.floor((tilemap.x + tx) * this.width / scene.width)
            const py = Math.floor((tilemap.y + ty) * this.height / scene.height)
            ctx.fillRect(px, py, Math.ceil(this.width / scene.width), Math.ceil(this.height / scene.height))
          }
        }
        index++
      }
    }
    ctx.fillStyle = Color.parseCSSColor(this.obstacleColor)
    for (let y = 0; y < scene.height; y++) {
      for (let x = 0; x < scene.width; x++) {
        if (scene.obstacle.get(x, y)) {
          const px = Math.floor(x * this.width / scene.width)
          const py = Math.floor(y * this.height / scene.height)
          ctx.fillRect(px, py, 2, 2)
        }
      }
    }
    ctx.fillStyle = Color.parseCSSColor(this.playerColor)
    const player = Party.player
    if (player) {
      const px = Math.floor(player.x * this.width / scene.width)
      const py = Math.floor(player.y * this.height / scene.height)
      ctx.fillRect(px - 1, py - 1, 3, 3)
    }
    for (const actor of scene.actor.list) {
      if (actor === player) continue
      if (Team.isEnemy(actor.teamId, player?.teamId ?? "")) {
        ctx.fillStyle = Color.parseCSSColor(this.enemyColor)
      } else {
        ctx.fillStyle = Color.parseCSSColor(this.actorColor)
      }
      const px = Math.floor(actor.x * this.width / scene.width)
      const py = Math.floor(actor.y * this.height / scene.height)
      ctx.fillRect(px - 1, py - 1, 3, 3)
    }
    ctx.fillStyle = Color.parseCSSColor(this.triggerColor)
    for (const trigger of scene.trigger.list) {
      const px = Math.floor(trigger.x * this.width / scene.width)
      const py = Math.floor(trigger.y * this.height / scene.height)
      ctx.fillRect(px - 1, py - 1, 3, 3)
    }
    if (this.borderWidth > 0) {
      ctx.save()
      ctx.strokeStyle = Color.parseCSSColor(this.borderColor)
      ctx.lineWidth = this.borderWidth
      ctx.strokeRect(
        this.borderWidth / 2,
        this.borderWidth / 2,
        this.width - this.borderWidth,
        this.height - this.borderWidth
      )
      ctx.restore()
    }
    ctx.restore()
  }

  onDestroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
    this.enabled = false
  }

  /**
   * 隐藏小地图
   */
  hide(): void {
    if (this.canvas) {
      this.canvas.style.display = 'none'
    }
    this.enabled = false
  }

  /**
   * 显示小地图
   */
  show(): void {
    if (!this.canvas) {
      this.createCanvas()
    }
    if (this.canvas) {
      this.canvas.style.display = 'block'
    }
    this.enabled = true
    this.render()
  }
}
