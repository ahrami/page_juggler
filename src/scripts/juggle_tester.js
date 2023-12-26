const path = require('node:path')

const { PageJuggler, dbs } = require(path.join(__dirname, './page_juggler.js'));
const fm_json = require(path.join(__dirname, './fm_json.js'));

const test = ({ size, passes_gen = 1, passes_file = 1, save_to_file = false }) => {
  let elapsed = {
    elapsed_gen: [],
    elapsed_save: [],
    elapsed_load: []
  }
  juggler = new PageJuggler()
  for (let i = 0; i < passes_gen; i++) {
    ({ elapsed: elapsed.elapsed_gen[i] } = juggler.generate_page(size));
    elapsed.elapsed_save[i] = [];
    elapsed.elapsed_load[i] = [];
    for (let j = 0; j < passes_file; j++) {
      elapsed.elapsed_save[i][j] = [];
      elapsed.elapsed_load[i][j] = [];
      for (let k = 0; k < dbs.length; k++) {
        let filename = `page_${i}_pass_${j}.test`;
        // [gen_pass][file_pass][db_idx]
        ({ elapsed: elapsed.elapsed_save[i][j][k] } = juggler.save_page(dbs[k], filename));
        ({ elapsed: elapsed.elapsed_load[i][j][k] } = juggler.load_page(dbs[k], filename));
      }
    }
  }
  if (save_to_file) {
    fm_json.save_sync(elapsed, path.join(__dirname, '../db/test_results/test_results.json'));
  }
  return { elapsed };
}

const test_generate = ({ sizes, passes, save_to_file = false }) => {
  numbers = { sizes, passes };
  juggler = new PageJuggler();
  for (size of sizes) {
    numbers[size] = []
    for (let i = 0; i < passes; i++) {
      juggler.generate_page(size);
      numbers[size].push(juggler.count_page());
    }
  }
  if (save_to_file) {
    fm_json.save_sync(numbers, path.join(__dirname, '../db/test_results/generate_results.json'));
  }
  return { numbers }
}

module.exports = {
  test,
  test_generate
}