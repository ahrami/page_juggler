const _ = require('lodash')

const ipsum = () => {
  const dolor = "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  let len = _.random(2, dolor.length - 1)
  let start = _.random(0, dolor.length - len)
  let end = start + len
  return dolor.slice(start, end)
}

module.exports = {
  ipsum
}