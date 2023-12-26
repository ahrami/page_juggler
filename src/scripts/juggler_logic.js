const { ipcMain } = require('electron')
const fs = require('fs');
const path = require('node:path')

const { PageGenerator } = require(path.join(__dirname, './page_generator.js'));
const { PageJuggler } = require(path.join(__dirname, './page_juggler.js'));
const tester = require(path.join(__dirname, './juggle_tester.js'));

let juggler
let mainWindow

const init = (_mainWindow) => {
  mainWindow = _mainWindow
  juggler = new PageJuggler()
  ipcMain.on('generate_page', (e, data) => {
    let { elapsed } = juggler.generate_page(parseInt(data.size))
    mainWindow.webContents.send('generate_page:elapsed', { elapsed, page: juggler.page });
  })
  ipcMain.on('save_page', (e, data) => {
    let { elapsed } = juggler.save_page(data.db, data.filename)
    mainWindow.webContents.send('save_page:elapsed', { elapsed, page: juggler.page, filename: data.filename, db: data.db });
  })
  ipcMain.on('load_page', (e, data) => {
    let { elapsed, page } = juggler.load_page(data.db, data.filename)
    mainWindow.webContents.send('load_page:elapsed', { elapsed, page, filename: data.filename, db: data.db });
  })
  ipcMain.on('verify_page', (e, data) => {
    let ids = juggler.verify_page()
    mainWindow.webContents.send('verify_page:ids', { ids, page: juggler.page });
  })
  ipcMain.on('hash_page', (e, data) => {
    let hash = juggler.hash_page()
    mainWindow.webContents.send('hash_page:hash', { hash, page: juggler.page });
  })
  ipcMain.on('print_page', (e, data) => {
    let page = juggler.stringify_page()
    mainWindow.webContents.send('print_page:page', { page });
  })
  ipcMain.on('get_page_sizes', (e, data) => {
    let sizes = juggler.get_sizes()
    mainWindow.webContents.send('get_page_sizes:sizes', { sizes, page: juggler.page });
  })
  ipcMain.on('get_sizes', (e, data) => {
    let sizes = PageGenerator.calculate_sizes(data.size)
    mainWindow.webContents.send('get_sizes:sizes', { sizes });
  })
  ipcMain.on('test', (e, data) => {
    let { size, passes_gen, passes_file, save_to_file } = data;
    let { elapsed } = tester.test({ size, passes_gen, passes_file, save_to_file });
    mainWindow.webContents.send('test:results', { elapsed, size });
  })
  ipcMain.on('test_generate', (e, data) => {
    let { sizes, passes, save_to_file } = data;
    let { numbers } = tester.test_generate({ sizes, passes, save_to_file });
    mainWindow.webContents.send('test_generate:results', { numbers });
  })
  ipcMain.on('drop_database', (e, data) => {
    folders = [
      path.join(__dirname, '../db/jkey/'),
      path.join(__dirname, '../db/json/')
    ]
    for (let dir of folders) {
      files = fs.readdirSync(dir)
      for (let file of files) {
        fs.unlinkSync(path.join(dir, file))
      }
    }
    
    mainWindow.webContents.send('drop_database:message', {});
  })
}

module.exports = {
  init
}