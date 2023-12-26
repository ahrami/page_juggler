const path = require('node:path')

const { timer } = require(path.join(__dirname, './timer.js'));
const fm_json = require(path.join(__dirname, './fm_json.js'));

const file_dir = (filename) => {
  return path.join(__dirname, '../db/jkey/' + filename)
}


const recursive_transform = (object, data) => {
  if (typeof object.children == 'undefined') {
    data[object.id] = object
    return object
  }
  let children = object.children
  object.children = []
  for (let child of children) {
    object.children.push(child.id)
  }
  data[object.id] = object
  for (let child of children) {
    recursive_transform(child, data)
  }
  return data
}

const recursive_restore = (object, data) => {
  if (typeof object.children == 'undefined') {
    return object
  }
  let children = object.children
  object.children = []
  for (let child of children) {
    object.children.push(data[child])
  }
  for (let child of object.children) {
    recursive_restore(child, data)
  }
  return object
}

const save_page_sync = (page, filename) => {

  let elapsed = [null, null, null, null]

  let data;
  let object;

  ({ ret: object, elapsed: elapsed[0] } = timer(() => {
    return structuredClone(page);
  }));

  ({ ret: data , elapsed: elapsed[1] } = timer(() => {
    let data = { page_id: object.id };
    return recursive_transform(object, data);
  }));

  ({ elapsed: [elapsed[2], elapsed[3]] } = fm_json.save_sync(data, file_dir(filename)));

  return { elapsed }
}

const load_page_sync = (filename) => {
  
  let elapsed = [null, null, null];

  let data;

  ({ elapsed: [elapsed[0], elapsed[1]], data } = fm_json.load_sync(file_dir(filename)));

  let page;

  ({ ret: page, elapsed: elapsed[2] } = timer(() => {
    let page = data[data.page_id];
    return recursive_restore(page, data);
  }));

  return { elapsed, page }
}

module.exports = {
  save_page_sync,
  load_page_sync
}