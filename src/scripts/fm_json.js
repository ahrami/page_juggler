const fs = require('fs');
const path = require('node:path');
const { timer } = require(path.join(__dirname, './timer.js'));

const save_sync = (data, filedir) => {

  let elapsed = [null, null];

  try {

    let json

    ({ ret: json, elapsed: elapsed[0] } = timer(() => {
      return JSON.stringify(data);
    }));

    ({ elapsed: elapsed[1] } = timer(() => {
      fs.writeFileSync(filedir, json, 'utf8');
      return null;
    }));

  } catch (err) {
    console.log(err);
    return {};
  }

  return { elapsed };
}

const load_sync = (filedir) => {

  let data = null;
  let elapsed = [null, null];

  try {

    let json;

    ({ ret: json, elapsed: elapsed[0] } = timer(() => {
      return fs.readFileSync(filedir, 'utf8');
    }));

    ({ ret: data, elapsed: elapsed[1] } = timer(() => {
      return JSON.parse(json);
    }));

  } catch (err) {
    console.log(err);
    return {};
  }

  return { elapsed, data };
}

module.exports = {
  save_sync,
  load_sync
}