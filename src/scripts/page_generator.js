const _ = require('lodash')
const { ipsum } = require('./ipsum.js')

class PageGenerator {

  static calculate_sizes = (size) => {
    let sizes = []
    for (let i = 0; i <= 4; i++) {
      sizes.push(this.scale_size(size, i, 4))
    }
    return sizes
  }

  static construct_page(id, title, size, children) {
    let page_object = {
      id: id,
      type: 'page',
      title: title,
      size: size,
      children: children
    }
    return page_object
  }

  static construct_text(id, text) {
    let text_object = {
      id: id,
      type: 'text',
      text: text
    }
    return text_object
  }

  static construct_heading(id, text) {
    let heading_object = {
      id: id,
      type: 'heading',
      text: text
    }
    return heading_object
  }

  static construct_toggle(id, text, children) {
    let toggle_object = {
      id: id,
      type: 'toggle',
      text: text,
      children: children
    }
    return toggle_object
  }

  static construct_column(id, children) {
    let column_object = {
      id: id,
      type: 'column',
      children: children
    }
    return column_object
  }

  static construct_column_list(id, children) {
    let column_list_object = {
      id: id,
      type: 'column_list',
      children: children
    }
    return column_list_object
  }

  static types = ['page', 'column', 'column_list', 'text', 'heading', 'toggle']
  static funcs = {
    'page': this.construct_page,
    'column': this.construct_column,
    'column_list': this.construct_column_list,
    'text': this.construct_text,
    'heading': this.construct_heading,
    'toggle': this.construct_toggle
  }

  static scale_size(size, depth, max_depth) {
    return _.ceil(size / 2 ** depth)
  }

  static generate_children(type, depth, max_depth, size, random) {
    if (depth > max_depth) {
      return []
    }
    let s = this.scale_size(size, depth, max_depth)
    let n = random ? _.random(s - s / 8, s + s / 8, false) : s
    if (type == 2) {
      n = _.random(2, 4, false)
    }
    let children = []

    for (let i = 0; i < n; i++) {

      children.push(null)

      let child_type = _.random(2, 5, false);
      if (type == 2) {
        child_type = 1
      }

      let text = null
      let child_children = null

      if ([3, 4, 5].includes(child_type)) {
        text = ipsum()
      }
      if ([1, 2, 5].includes(child_type)) {
        child_children = this.generate_children(child_type, depth + 1, max_depth, size)
      }

      if ([1, 2].includes(child_type)) {
        children[i] = this.funcs[this.types[child_type]](this.cur_id, child_children)
      }
      else if (child_type == 5) {
        children[i] = this.funcs[this.types[child_type]](this.cur_id, text, child_children)
      } else {
        children[i] = this.funcs[this.types[child_type]](this.cur_id, text)
      }
      this.cur_id += 1

    }
    return children
  }

  static generate_page(size, random = false) {
    this.cur_id = 1
    let page = null
    let page_len = random ? _.random(size - size / 8, size + size / 8, false) : size
    let max_depth = 4
    let page_children = this.generate_children(0, 0, max_depth, size, random)
    page = this.construct_page(this.cur_id, "Page Title", page_len, page_children)
    this.cur_id += 1
    return page
  }
}

module.exports = {
  PageGenerator
}