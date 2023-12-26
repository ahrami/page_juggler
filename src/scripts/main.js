const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')

const app_logic = require(path.join(__dirname, './app_logic.js'))
const juggler_logic = require(path.join(__dirname, './juggler_logic.js'))

let mainWindow
let addWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Main Window',
    webPreferences: {
      preload: path.join(__dirname, '../scripts/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.loadFile(path.join(__dirname, '../front/page_juggler.html') )

  mainWindow.on('closed', () => {
    app.quit()
  })
}

const createAddWindow = () => {
  addWindow = new BrowserWindow({
    width: 200,
    height: 300,
    title: 'Add',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  addWindow.loadFile(path.join(__dirname, '../front/addWindow.html'))

  addWindow.on('close', () => {
    addWindow = null
    console.log("cleared memory from add window")
  })
}

const setMenu = () => {
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  Menu.setApplicationMenu(mainMenu)
}

const onMacReopen = () => {
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow()
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 
        'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
]

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({})
}

// dev tools

if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform ==
          'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}

const load_html = (filename) => {
  mainWindow.loadFile(path.join(__dirname, '../front/' + filename));
}

const switchWindow = (window_name) => {
  switch (window_name) {
    case 'main':
      load_html('mainWindow.html');
      break;
    case 'juggler':
      load_html('page_juggler.html');
      break;
    case 'tools':
      load_html('pageToolsWindow.html');
      break;
    case 'linear':
      load_html('linearTestWindow.html');
      break;
    default:
      break;
  }
}

const add_item = (e, item) => {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
}

const init = () => {
  createWindow()
  mainWindow.maximize();
  ipcMain.on('item:add', add_item);
  ipcMain.on('open:window', (e, data) => {
    switchWindow(data.window)
  })
  setMenu()
  onMacReopen()
  app_logic.init(mainWindow, addWindow)
  juggler_logic.init(mainWindow)
}

app.whenReady().then(init)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})