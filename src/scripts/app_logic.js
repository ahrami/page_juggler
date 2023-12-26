//TODO
// 1 - serialize and deserialize pages
// 2 - work with pages (generate, save, load)
// 3 - key-value redis
// 4 - document-oriented
// 5 - relational (as key-value)
// 6 - relational (with arrays)
// 7 - relational (true) 
//
// This whole file is essentially garbage

const { ipcMain } = require('electron')
const path = require('node:path')

const { PageGenerator } = require(path.join(__dirname, './page_generator.js'))
const { verify_page } = require(path.join(__dirname, './page_juggler.js'))
const db_json = require(path.join(__dirname, './db_json.js'))

let mainWindow

const generate_page = (e, size) => {
  sizes = []
  for (let i = 0; i <= 4; i++) {
    sizes.push(PageGenerator.scale_size(size, i, 4))
  }
  let t = process.hrtime()
  let page = PageGenerator.generate_page(size)
  let elapsed = process.hrtime(t)
  elapsed = elapsed[0] + elapsed[1] / 1e9
  mainWindow.webContents.send('page:generate', sizes);
  //console.log(JSON.stringify(page, null, 2))
  console.log(`Page generation took ${elapsed} seconds!`)
}

const test_linear = (e, data) => {
  let { start_size, end_size, step_size, passes } = data;
  start_size = parseInt(start_size)
  end_size = parseInt(end_size)
  step_size = parseInt(step_size)
  passes = parseInt(passes)
  console.log(start_size, end_size, step_size, passes)
  if (start_size > 0 && end_size >= start_size && step_size > 0 && passes >= 1) {
    let size = start_size;

    let results = []

    while (size <= end_size) {

      for (let i = 0; i < passes; i++) {
        let t = process.hrtime()
        let page = PageGenerator.generate_page(size)
        let elapsed = process.hrtime(t)
        elapsed = elapsed[0] + elapsed[1] / 1e9
        results.push({
          elapsed: elapsed,
          size: size
        })
      }

      size += step_size;
    }

    mainWindow.webContents.send('test:linear', { data: data, results: results });

  }
}

const generate_and_verify_page = (e, size) => {

  sizes = []
  for (let i = 0; i <= 4; i++) {
    sizes.push(PageGenerator.scale_size(size, i, 4))
  }
  let page = PageGenerator.generate_page(size)
  mainWindow.webContents.send('page:verify', sizes);

  let ids = []

  verify_page(page, ids)

  ids.sort((a, b) => a - b)

  console.log(ids, ids.length)
}

const generate_and_save_page = (size, filename) => {

  sizes = []
  for (let i = 0; i <= 4; i++) {
    sizes.push(PageGenerator.scale_size(size, i, 4))
  }
  console.log(sizes)

  let page = PageGenerator.generate_page(size)

  let ids = []
  verify_page(page, ids)
  ids.sort((a, b) => a - b)
  console.log(ids, ids.length)

  db_json.save_page_sync(page, filename)
}

const load_and_verify_page = (filename) => {

  let page = db_json.load_page_sync(filename)
  let ids = []
  verify_page(page, ids)
  ids.sort((a, b) => a - b)
  console.log(ids, ids.length)

}

const init = (_mainWindow) => {
  mainWindow = _mainWindow;
  ipcMain.on('page:generate', generate_page);
  ipcMain.on('page:verify', generate_and_verify_page);
  ipcMain.on('test:linear', test_linear);
  ipcMain.on('page:save', (e, data) => {
    generate_and_save_page(data.size, data.filename)
  });
  ipcMain.on('page:load', (e, data) => {
    load_and_verify_page(data.filename)
  });
}

module.exports = {
  init
}