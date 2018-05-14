const stringWidth = require('string-width')


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

function widestLine(array)
{
  return Math.max(array.map(stringWidth))
}

function padEnd(line)
{
  return line.padEnd(this)
}


exports.alignVertically = alignVertically
exports.widestLine      = widestLine
exports.padEnd          = padEnd
