const sliceAnsi   = require('slice-ansi')
const stringWidth = require('string-width')


const trimRegexp = /^(\s*)(.*?)\s*$/


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
  return Math.max(array.filter(x => x).map(stringWidth))
}

function padEnd(line)
{
  return line.padEnd(this)
}

function paste(target, source, {trim, x=0, y=0})
{
  if(x < 0)
  {
    source = source.map(slice, Math.abs(x))
    x = 0
  }

  if(y < 0)
  {
    source = source.slice(Math.abs(y))
    y = 0
  }

  for(let [index, row] of source.entries())
  {
    const targetRow = target[index+y]
    if(!targetRow) break

    let before = x

    if(trim)
    {
      const match = row.match(trimRegexp)

      before += match[1].length
      row = match[2]
    }

    const targetRowWidth = stringWidth(targetRow)
    const targetEndSlice = before + stringWidth(row)
    const endSlice = Math.min(targetRowWidth, targetEndSlice)

    target[index+y] = (before ? sliceAnsi(targetRow, 0, before) : '')
                    + (endSlice ? sliceAnsi(row, 0, endSlice) : '')
                    + (targetEndSlice < targetRowWidth
                       ? sliceAnsi(targetRow, targetEndSlice) : '')
  }

  return target
}

function slice(row)
{
  return sliceAnsi(row, this)
}


exports.alignVertically = alignVertically
exports.widestLine      = widestLine
exports.padEnd          = padEnd
exports.paste           = paste
