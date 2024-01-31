/*
 * @Author: xuranXYS
 * @LastEditTime: 2024-01-31 20:27:46
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
 */
/*
@plugin 摄像机限制
@version 1.0
@author 徐然
@link https://space.bilibili.com/291565199
@desc

@option limit_type {"auto_scene","no_limit"}
@alias 限制类型 {根据当前场景大小,不限制}

*/
let _cache_update;
export default class Camera_limit_xr {
  call() {
    switch (this.limit_type) {
      case "no_limit":
        if (_cache_update) {
          Camera.update = _cache_update
          _cache_update = undefined
        }
        break
    }
  }
  onStart() {
    Scene.on("load", (s) => {
      _cache_update = Camera.update
      Camera.update = (deltaTime) => {
        // 更新模块
        Camera.updaters.update(deltaTime)
        // 计算摄像机位置
        const scene = Scene.binding
        const padding = Camera.padding
        const zoom = Camera.zoom
        const tileWidth = scene.tileWidth
        const tileHeight = scene.tileHeight
        const innerWidth = tileWidth * scene.width
        const innerHeight = tileHeight * scene.height
        const cameraWidth = GL.width / zoom
        const cameraHeight = GL.height / zoom
        const center = Scene.convert(Camera)
        const centerX = center.x + Camera.shakeX
        const centerY = center.y + Camera.shakeY

        // 指定范围的左边界、上边界、右边界、下边界
        const limitLeft = 0
        const limitTop = 0
        const limitRight = innerWidth - cameraWidth
        const limitBottom = innerHeight - cameraHeight
        // 计算滚动的边界值
        const scrollLeft = Math.max(Math.min(centerX - cameraWidth / 2, limitRight), limitLeft)
        const scrollTop = Math.max(Math.min(centerY - cameraHeight / 2, limitBottom), limitTop)
        const scrollRight = scrollLeft + cameraWidth
        const scrollBottom = scrollTop + cameraHeight
        // 更新摄像机的属性
        Camera.width = cameraWidth
        Camera.height = cameraHeight
        Camera.scrollLeft = scrollLeft
        Camera.scrollTop = scrollTop
        Camera.scrollRight = scrollRight
        Camera.scrollBottom = scrollBottom
        Camera.scrollCenterX = (scrollLeft + scrollRight) / 2
        Camera.scrollCenterY = (scrollTop + scrollBottom) / 2
        Camera.scrollLeftT = scrollLeft / tileWidth
        Camera.scrollTopT = scrollTop / tileHeight
        Camera.scrollRightT = scrollRight / tileWidth
        Camera.scrollBottomT = scrollBottom / tileHeight

        // 计算可见区域的范围
        const tile = Camera.tileArea
        const animation = Camera.animationArea
        const light = Camera.lightArea
        Camera.tileLeft = scrollLeft - tile.expansionLeft
        Camera.tileTop = scrollTop - tile.expansionTop
        Camera.tileRight = scrollRight + tile.expansionRight
        Camera.tileBottom = scrollBottom + tile.expansionBottom
        Camera.animationLeft = scrollLeft - animation.expansionLeft
        Camera.animationTop = scrollTop - animation.expansionTop
        Camera.animationRight = scrollRight + animation.expansionRight
        Camera.animationBottom = scrollBottom + animation.expansionBottom
        Camera.animationLeftT = Camera.animationLeft / tileWidth
        Camera.animationTopT = Camera.animationTop / tileHeight
        Camera.animationRightT = Camera.animationRight / tileWidth
        Camera.animationBottomT = Camera.animationBottom / tileHeight

        // 计算当前缩放率的光影纹理参数
        const texture = GL.reflectedLightMap
        if (texture.scale !== zoom) {
          texture.scale = zoom
          const { ceil, min } = Math
          const pl = texture.paddingLeft
          const pt = texture.paddingTop
          const pr = texture.paddingRight
          const pb = texture.paddingBottom
          const el = ceil(min(light.expansionLeft * zoom, pl))
          const et = ceil(min(light.expansionTop * zoom, pt))
          const er = ceil(min(light.expansionRight * zoom, pr))
          const eb = ceil(min(light.expansionBottom * zoom, pb))
          texture.expansionLeft = el / zoom
          texture.expansionTop = et / zoom
          texture.expansionRight = er / zoom
          texture.expansionBottom = eb / zoom
          texture.maxExpansionLeft = pl / zoom
          texture.maxExpansionTop = pt / zoom
          texture.maxExpansionRight = pr / zoom
          texture.maxExpansionBottom = pb / zoom
          texture.clipX = pl - el
          texture.clipY = pt - et
          texture.clipWidth = GL.width + el + er
          texture.clipHeight = GL.height + et + eb
        }

        // 设置光源渲染范围，还原
        Camera.lightLeft = scrollLeft - texture.expansionLeft
        Camera.lightTop = scrollTop - texture.expansionTop
        Camera.lightRight = scrollRight + texture.expansionRight
        Camera.lightBottom = scrollBottom + texture.expansionBottom
      }
    })
  }
}