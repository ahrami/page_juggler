const path = require('node:path');

const fm_json = require(path.join(__dirname, './fm_json.js'));

const file_dir = (filename) => {
  return path.join(__dirname, '../db/json/' + filename);
}

const save_page_sync = (page, filename) => {
  return fm_json.save_sync(page, file_dir(filename));
}

const load_page_sync = (filename) => {
  let { elapsed, data: page } = fm_json.load_sync(file_dir(filename));
  return { elapsed, page };
}


module.exports = {
  save_page_sync,
  load_page_sync
}