<!--
 * @Author: xuranXYS
 * @LastEditTime: 2024-01-20 22:44:18
 * @GitHub: www.github.com/xiaoxustudio
 * @WebSite: www.xiaoxustudio.top
 * @Description: By xuranXYS
-->
# YaMi游戏引擎插件
自己编写的插件，需要的自取。

## 其他
如果可以的话，希望在游戏后面加个徐然先生的名字，加个插件名字也是ok的
当然这不是必须的，就当作是对本人的宣传了  

源码分析：https://api.xiaoxustudio.top/
编辑器基础教程（非官方）：https://www.bilibili.com/read/cv20724208/?spm_id_from=333.976.0.0

## Yami API

```js

// 获取事件来源窗口
const getWindowFromEvent = function (event) {
  return BrowserWindow.fromWebContents(event.sender)
}

// 最小化窗口
ipcMain.on('minimize-window', event => {
  const window = getWindowFromEvent(event)
  if (window.isMinimized()) {
    window.restore()
  } else {
    window.minimize()
  }
})

// 最大化窗口
ipcMain.on('maximize-window', event => {
  const window = getWindowFromEvent(event)
  if (!window.isFullScreen()) {
    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  }
})

// 关闭窗口
ipcMain.on('close-window', event => {
  const window = getWindowFromEvent(event)
  window.close()
})

// 强制关闭窗口
ipcMain.on('close-window-force', event => {
  const window = getWindowFromEvent(event)
  window.stopCloseEvent = true
  window.close()
})

// 开关全屏模式
ipcMain.on('toggle-full-screen', event => {
  const window = getWindowFromEvent(event)
  window.setFullScreen(!window.isFullScreen())
})

// 打开资源管理器路径
ipcMain.on('open-path', (event, path) => {
  shell.openPath(Path.normalize(path))
})

// 在资源管理器中显示
ipcMain.on('show-item-in-folder', (event, path) => {
  shell.showItemInFolder(Path.normalize(path))
})

// 创建播放器窗口
ipcMain.on('create-player-window', (event, path) => {
  const window = getWindowFromEvent(event)
  createPlayerWindow(window, path)
})

// 更新最大小化图标
ipcMain.handle('update-max-min-icon', event => {
  const window = getWindowFromEvent(event)
  return window.isMaximized()  ? 'maximize'
       : window.isFullScreen() ? 'enter-full-screen'
       :                         'unmaximize'
})

// 显示打开对话框
ipcMain.handle('show-open-dialog', (event, options) => {
  const window = getWindowFromEvent(event)
  return dialog.showOpenDialog(window, options)
})

// 显示保存对话框
ipcMain.handle('show-save-dialog', (event, options) => {
  const window = getWindowFromEvent(event)
  return dialog.showSaveDialog(window, options)
})

// 把文件扔进回收站
ipcMain.handle('trash-item', (event, path) => {
  return shell.trashItem(Path.normalize(path))
})

// 获取用户文档路径
ipcMain.handle('get-documents-path', event => {
  return app.getPath('documents')
})

// 设置设备像素比率
ipcMain.on('set-device-pixel-ratio', (event, ratio) => {
  const window = getWindowFromEvent(event)
  const bounds = window.getContentBounds()
  const config = window.config
  const width = Math.round(config.width / ratio)
  const height = Math.round(config.height / ratio)
  const x = bounds.x + (bounds.width - width >> 1)
  const y = bounds.y + (bounds.height - height >> 1)
  // electron存在bug：非100%缩放时，窗口位置不能完美地被设置
  window.setContentBounds({x, y, width, height})
})

// 打开开发者工具
ipcMain.on('open-devTools', event => {
  event.sender.openDevTools()
})

// 设置显示模式
ipcMain.on('set-display-mode', (event, display) => {
  const window = getWindowFromEvent(event)
  switch (display) {
    case 'windowed':
      if (window.isFullScreen()) {
        window.setFullScreen(false)
      }
      if (window.isMaximized()) {
        window.unmaximize()
      }
      break
    case 'maximized':
      if (window.isFullScreen()) {
        window.setFullScreen(false)
      }
      if (!window.isMaximized()) {
        window.maximize()
      }
      break
    case 'fullscreen':
      if (!window.isFullScreen()) {
        window.setFullScreen(true)
      }
      break
  }
})
```

## 有问题反馈
在使用中有任何问题，欢迎反馈给我，可以用以下联系方式跟我交流

* 邮件(xugame@qq.com)
* B站: [@徐然XYS](https://space.bilibili.com/291565199)

* 捐助开发者
! [支付宝](https://github.com/xiaoxu1111/xuranxys_Game/blob/main/zfb.jpg)
