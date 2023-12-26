const timer = (callable) => {
  let t = process.hrtime()
  let ret = callable()
  let elapsed = process.hrtime(t)
  elapsed = elapsed[0] + elapsed[1] / 1e9
  return { ret, elapsed }
}

module.exports = {
  timer
}