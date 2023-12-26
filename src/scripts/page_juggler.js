const path = require('node:path');
const crypto = require('crypto');

const { PageGenerator } = require(path.join(__dirname, './page_generator.js'));
const db_json = require(path.join(__dirname, './db_json.js'));
const db_jkey = require(path.join(__dirname, './db_jkey.js'));
const { timer } = require(path.join(__dirname, './timer.js'));

const dbs = ['json', 'jkey'];

const verify_page = (page_object, ids) => {
  ids.push(parseInt(page_object.id))
  if (typeof (page_object.children) !== 'undefined') {
    for (child of page_object.children) {
      verify_page(child, ids)
    }
  }
}

const count_page = (page_object) => {
  let count = 1;
  if (typeof (page_object.children) !== 'undefined') {
    for (child of page_object.children) {
      count += count_page(child)
    }
  }
  return count;
}

const save_to_db = (db, data) => {
  let elapsed_full;
  let elapsed_parts;
  switch (db) {
    case 'json':
      ({ ret: { elapsed: elapsed_parts }, elapsed: elapsed_full } = timer(() => {
        return db_json.save_page_sync(data.page, data.filename);
      }));
      break;
    case 'jkey':
      ({ ret: { elapsed: elapsed_parts }, elapsed: elapsed_full } = timer(() => {
        return db_jkey.save_page_sync(data.page, data.filename)
      }));
      break;
    default:
      break
  }
  return { elapsed: { elapsed_full, elapsed_parts } }
}

const load_from_db = (db, data) => {
  let elapsed_full;
  let elapsed_parts;
  let page
  switch (db) {
    case 'json':
      ({ ret: { elapsed: elapsed_parts, page }, elapsed: elapsed_full } = timer(() => {
        return db_json.load_page_sync(data.filename);
      }));
      break;
    case 'jkey':
      ({ ret: { elapsed: elapsed_parts, page }, elapsed: elapsed_full } = timer(() => {
        return db_jkey.load_page_sync(data.filename);
      }));
      break;
    default:
      break
  }
  return { page, elapsed: { elapsed_full, elapsed_parts } }
}

class PageJuggler {

  constructor () {
    this.page = {}
  }

  generate_page = (size) => {
    let t = process.hrtime()
    this.page = PageGenerator.generate_page(size)
    let elapsed = process.hrtime(t)
    elapsed = elapsed[0] + elapsed[1] / 1e9
    return { page : this.page, elapsed }
  }
  save_page = (db, filename) => {
    let data = { page: this.page, filename }
    let { elapsed } = save_to_db(db, data)
    return { elapsed }
  }
  load_page = (db, filename) => {
    let data = { filename }
    let { page, elapsed } = load_from_db(db, data)
    this.page = page
    return { page, elapsed }
  }
  verify_page = () => {
    let ids = []
    verify_page(this.page, ids)
    ids.sort((a, b) => a - b)
    return ids
  }
  count_page = () => {
    return count_page(this.page);
  }
  hash_page = () => {
    return crypto.createHash('sha1').update(JSON.stringify(this.page)).digest('hex');
  }
  stringify_page = () => {
    return JSON.stringify(this.page, null, 2)
  }
  get_sizes = () => {
    return PageGenerator.calculate_sizes(this.page.size)
  }
}

module.exports = {
  PageJuggler,
  verify_page,
  dbs
}