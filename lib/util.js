const longest = require('longest')


function alignVertically(result)
{
  const {align, height} = this

  let before = 0

  switch(align)
  {
    case 'end':
    case 'bottom': before = length - height
    case 'center': before = Math.floor(before / 2)
  }

  if(before) result = new Array(before).fill('').concat(result)

  return result
}

function createLine(...args)
{
  return ''.padEnd(...args)
}

function longestLength(array)
{
  const item = longest(array)
  if(!item) return 0

  return item.length
}

function padEnd(line)
{
  return line.padEnd(this)
}


exports.alignVertically = alignVertically
exports.createLine      = createLine
exports.longestLength   = longestLength
exports.padEnd          = padEnd
