import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

// Setup paths
const userDataPath = app.getPath('userData')
const imagesPath = path.join(userDataPath, 'images')

// Ensure images directory exists
!fs.existsSync(imagesPath) && fs.mkdirSync(imagesPath, { recursive: true })

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Always use development URL if available
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// Helper to scan images directory and return image info
const scanImagesDirectory = () => {
  try {
    const files = fs.readdirSync(imagesPath)
    
    return files
      .filter(file => ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        .includes(path.extname(file).toLowerCase()))
      .map(file => {
        const filePath = path.join(imagesPath, file)
        const stats = fs.statSync(filePath)
        
        return {
          id: path.basename(file, path.extname(file)), 
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        }
      })
  } catch (error) {
    console.error('Error scanning images:', error)
    return []
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  ipcMain.handle('get-images', async () => {
    return scanImagesDirectory()
  })
  
  ipcMain.handle('open-file-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }]
      })
      return result.canceled ? { canceled: true } : { filePath: result.filePaths[0] }
    } catch (error) {
      return { error: error.message }
    }
  })
  
  ipcMain.handle('upload-image', async (event, filePath) => {
    try {
      const originalFilename = path.basename(filePath)
      const uniqueFilename = `${Date.now()}_${originalFilename}`
      const destinationPath = path.join(imagesPath, uniqueFilename)
      
      fs.copyFileSync(filePath, destinationPath)
      const stats = fs.statSync(destinationPath)
      
      return {
        id: path.basename(uniqueFilename, path.extname(uniqueFilename)),
        name: originalFilename,
        path: destinationPath,
        size: stats.size,
        modified: stats.mtime.toISOString() 
      }
    } catch (error) {
      return { error: error.message }
    }
  })
  
  ipcMain.handle('delete-image', async (event, imageId) => {
    try {
      const images = scanImagesDirectory()
      const imageToDelete = images.find(img => img.id === imageId)
      
      if (!imageToDelete) return { error: 'Image not found' }
      
      fs.unlinkSync(imageToDelete.path)
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  })

  ipcMain.handle('save-edited-image', async (event, params) => {
    try {
      const images = scanImagesDirectory()
      const originalImage = images.find(img => img.id === params.id)
      if (!originalImage) return { error: 'Image not found' }
      
      let baseName = path.basename(originalImage.name, path.extname(originalImage.name))
      baseName = baseName.includes("_edited_") ? 
        baseName.substring(0, baseName.indexOf("_edited_")) : baseName
      
      const ext = path.extname(originalImage.name)
      const timestamp = Date.now()
      const newFilename = `${baseName}_edited_${timestamp}${ext}`
      const newImagePath = path.join(imagesPath, newFilename)
      
      const base64Data = params.data.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      fs.writeFileSync(newImagePath, buffer)
      
      return { 
        success: true, 
        image: {
          id: path.basename(newFilename, path.extname(newFilename)),
          name: newFilename,
          path: newImagePath,
          size: buffer.length,
          modified: new Date().toISOString()
        } 
      }
    } catch (error) {
      return { error: error.message }
    }
  })

  createWindow()
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow())
})

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit())