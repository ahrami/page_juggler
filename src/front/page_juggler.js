const electron = require('electron');
const _ = require('lodash');
const { ipcRenderer } = electron;

const output = document.querySelector('div#output')

const logln = (message) => {
  //output.innerHTML += `<div>${message}</div>`
  const div = document.createElement('div');
  div.append(message);
  output.appendChild(div);
}

const value_to_db = (value) => {
  let db = ''
  switch (value) {
    case '1':
      db = 'json'
      break
    case '2':
      db = 'jkey'
      break
    default:
      break
  }
  return db
}


document.querySelector('button#main').addEventListener('click', (e) => {
  e.preventDefault()
  ipcRenderer.send('open:window', { window: 'main' })
})

document.querySelector('button#clear').addEventListener('click', (e) => {
  e.preventDefault()
  document.querySelector('div#output').innerHTML = ""
})

document.querySelector('button#drop').addEventListener('click', (e) => {
  e.preventDefault()
  ipcRenderer.send('drop_database', {})
})

document.querySelector('form#generate_page').addEventListener('submit', (e) => {
  e.preventDefault();
  const size = document.querySelector('input#generate_page_size').value;
  ipcRenderer.send('generate_page', { size });
});

document.querySelector('form#save_page').addEventListener('submit', (e) => {
  e.preventDefault();
  const filename = document.querySelector('input#save_page_filename').value;
  const db = value_to_db(document.querySelector('select#save_page_database').value);
  ipcRenderer.send('save_page', { filename, db });
});

document.querySelector('form#load_page').addEventListener('submit', (e) => {
  e.preventDefault();
  const filename = document.querySelector('input#load_page_filename').value;
  const db = value_to_db(document.querySelector('select#load_page_database').value);
  ipcRenderer.send('load_page', { filename, db });
});

document.querySelector('form#verify_page').addEventListener('submit', (e) => {
  e.preventDefault();
  ipcRenderer.send('verify_page', {});
});

document.querySelector('form#hash_page').addEventListener('submit', (e) => {
  e.preventDefault();
  ipcRenderer.send('hash_page', {});
});

document.querySelector('form#print_page').addEventListener('submit', (e) => {
  e.preventDefault();
  ipcRenderer.send('print_page', {});
});

document.querySelector('form#get_page_sizes').addEventListener('submit', (e) => {
  e.preventDefault();
  ipcRenderer.send('get_page_sizes', {});
});

document.querySelector('form#get_sizes').addEventListener('submit', (e) => {
  e.preventDefault();
  const size = document.querySelector('input#get_sizes_size').value;
  ipcRenderer.send('get_sizes', { size });
});

document.querySelector('form#test').addEventListener('submit', (e) => {
  e.preventDefault();
  const size = document.querySelector('input#test_size').value;
  const passes_gen = document.querySelector('input#test_gen_passes').value;
  const passes_file = document.querySelector('input#test_file_passes').value;
  const save_to_file = document.querySelector('select#test_save_to_file').value == '1';
  ipcRenderer.send('test', { size, passes_gen, passes_file, save_to_file });
});

document.querySelector('form#test_generate').addEventListener('submit', (e) => {
  e.preventDefault();
  const size_low = parseInt(document.querySelector('input#test_generate_size_low').value);
  const size_high = parseInt(document.querySelector('input#test_generate_size_high').value);
  const size_step = parseInt(document.querySelector('input#test_generate_size_step').value);
  let sizes = [];
  for (let size = size_low; size <= size_high; size += size_step) {
    sizes.push(size);
  }
  const passes = document.querySelector('input#test_generate_passes').value;
  const save_to_file = document.querySelector('select#test_generate_save_to_file').value == '1';
  ipcRenderer.send('test_generate', { sizes, passes, save_to_file });
});


ipcRenderer.on('generate_page:elapsed', (e, data) => {
  logln('Page of size ' + data.page.size + ' generated in ' + data.elapsed + ' seconds')
});

ipcRenderer.on('save_page:elapsed', (e, data) => {
  let time = '';
  let elapsed = data.elapsed.elapsed_parts
  if (data.db == 'json') {
    time = `Stringify: ${elapsed[0]} seconds, Write to file: ${elapsed[1]} seconds, `;
  } else if (data.db == 'jkey') {
    time = `Clone page: ${elapsed[0]} seconds, Transform: ${elapsed[1]} seconds, Stringify: ${elapsed[2]} seconds, Write to file: ${elapsed[3]} seconds, `;
  }
  time += `Sum of parts: ${_.sum(elapsed)} seconds`;
  logln(`Page of size ${data.page.size} saved in ${data.elapsed.elapsed_full} seconds as ${data.filename}, using ${data.db} database`)
  logln(time)
});

ipcRenderer.on('load_page:elapsed', (e, data) => {
  let time = '';
  let elapsed = data.elapsed.elapsed_parts
  if (data.db == 'json') {
    time = `Read from file: ${elapsed[0]} seconds, Parse: ${elapsed[1]} seconds, `;
  } else if (data.db == 'jkey') {
    time = `Read from file: ${elapsed[0]} seconds, Parse: ${elapsed[1]} seconds, Restore: ${elapsed[2]} seconds, `;
  } else {
    time = time.concat('what?')
  }
  time += `Sum of parts: ${_.sum(elapsed)} seconds`;
  logln(`Page of size ${data.page.size} loaded in ${data.elapsed.elapsed_full} seconds as ${data.filename}, using ${data.db} database`)
  logln(time)
});

ipcRenderer.on('verify_page:ids', (e, data) => {
  logln('Numder of objects in page : ' + data.ids.length)
});

ipcRenderer.on('hash_page:hash', (e, data) => {
  logln('Page hash : ' + data.hash)
});

ipcRenderer.on('print_page:page', (e, data) => {
  logln('Page : ');
  for (str of data.page.split('\n')) {
    logln(str);
  }
});

ipcRenderer.on('test:results', (e, data) => {
  logln(`Results for size ${data.size} : `);
  for (str of JSON.stringify(data.elapsed, null, 2).split('\n')) {
    logln(str);
  }
});

ipcRenderer.on('test_generate:results', (e, data) => { 
  for (size of data.numbers.sizes) {
    logln(`Average size for size ${size} : ${_.sum(data.numbers[size]) / data.numbers[size].length}`);
  }
});

ipcRenderer.on('get_page_sizes:sizes', (e, data) => {
  logln('Page sizes : ' + data.sizes)
});

ipcRenderer.on('get_sizes:sizes', (e, data) => {
  logln('Sizes : ' + data.sizes)
});

ipcRenderer.on('drop_database:message', (e, data) => {
  logln('Successfully dropped database')
});