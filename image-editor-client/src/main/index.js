import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

// Create application data directory for storing images
const userDataPath = app.getPath('userData')
const imagesPath = path.join(userDataPath, 'images')

// Ensure the images directory exists
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath, { recursive: true })
}

// Store image metadata in memory (in production, you might want to use a JSON file)
let imageMetadata = []

// Load existing images metadata if available
const metadataPath = path.join(userDataPath, 'imageMetadata.json')
try {
  if (fs.existsSync(metadataPath)) {
    const data = fs.readFileSync(metadataPath, 'utf8')
    imageMetadata = JSON.parse(data)
  }
} catch (error) {
  console.error('Error loading image metadata:', error)
}

// Save image metadata to file
function saveMetadata() {
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(imageMetadata, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving image metadata:', error)
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false, // Allow loading local resources
      allowRunningInsecureContent: true // Allow loading of insecure content
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers for Gallery operations
  
  // Get all images
  ipcMain.handle('get-images', async () => {
    try {
      // If we don't have metadata or it's empty, scan the directory
      if (!imageMetadata || imageMetadata.length === 0) {
        const files = fs.readdirSync(imagesPath)
        
        // Filter for image files
        const imageFiles = files.filter(file => {
          const ext = path.extname(file).toLowerCase()
          return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)
        })
        
        // Create metadata for each image
        imageMetadata = imageFiles.map(file => {
          const filePath = path.join(imagesPath, file)
          const stats = fs.statSync(filePath)
          
          return {
            id: uuidv4(),
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime.toISOString() // Convert to string for serialization
          }
        })
        
        // Save the metadata
        saveMetadata()
      }
      
      return imageMetadata
    } catch (error) {
      console.error('Error getting images:', error)
      return []
    }
  })
  
  // Open file dialog to select an image
  ipcMain.handle('open-file-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
        ]
      })
      
      if (result.canceled) {
        return { canceled: true }
      }
      
      return { filePath: result.filePaths[0] }
    } catch (error) {
      console.error('Error opening file dialog:', error)
      return { error: error.message }
    }
  })
  
  // Upload an image
  ipcMain.handle('upload-image', async (event, filePath) => {
    try {
      // Generate a unique filename to avoid conflicts
      const originalFilename = path.basename(filePath)
      const extension = path.extname(originalFilename)
      const uniqueFilename = `${Date.now()}_${originalFilename}`
      const destinationPath = path.join(imagesPath, uniqueFilename)
      
      // Copy the file to our images directory
      fs.copyFileSync(filePath, destinationPath)
      
      // Get file stats
      const stats = fs.statSync(destinationPath)
      
      // Create metadata for the new image
      const newImage = {
        id: uuidv4(),
        name: originalFilename,
        path: destinationPath,
        size: stats.size,
        modified: stats.mtime.toISOString() 
      }
      
      // Add to metadata array
      imageMetadata.push(newImage)
      
      // Save updated metadata
      saveMetadata()
      
      return newImage
    } catch (error) {
      console.error('Error uploading image:', error)
      return { error: error.message }
    }
  })
  
  // Delete an image
  ipcMain.handle('delete-image', async (event, imageId) => {
    try {
      // Find the image metadata
      const imageIndex = imageMetadata.findIndex(img => img.id === imageId)
      
      if (imageIndex === -1) {
        return { error: 'Image not found' }
      }
      
      const image = imageMetadata[imageIndex]
      
      // Delete the file
      fs.unlinkSync(image.path)
      
      // Remove from metadata
      imageMetadata.splice(imageIndex, 1)
      
      // Save updated metadata
      saveMetadata()
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting image:', error)
      return { error: error.message }
    }
  })
 // Updated saveEditedImage handler for main.js

// Save edited image as a new file
ipcMain.handle('save-edited-image', async (event, params) => {
  try {
    // Find the original image metadata
    const originalImage = imageMetadata.find(img => img.id === params.id);
    if (!originalImage) return { error: 'Image not found' };
    
    // Extract base64 data from the data URL
    const base64Data = params.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create new filename for the edited image
    const originalName = path.basename(originalImage.name, path.extname(originalImage.name));
    const fileExtension = path.extname(originalImage.name) || '.jpg';
    const newFilename = `${originalName}_edited_${Date.now()}${fileExtension}`;
    const newImagePath = path.join(imagesPath, newFilename);
    
    // Save the edited image
    fs.writeFileSync(newImagePath, buffer);
    
    // Create and save metadata for the new image
    const newImage = {
      id: uuidv4(),
      name: newFilename,
      path: newImagePath,
      size: buffer.length,
      modified: new Date().toISOString(),
      originalId: originalImage.id 
    };
    
    imageMetadata.push(newImage);
    saveMetadata();
    
    return { success: true, image: newImage };
  } catch (error) {
    console.error('Error saving edited image:', error);
    return { error: error.message };
  }
});
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})