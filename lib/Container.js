const deepMergeNotNull                                     = require('./deepMergeNotNull')
const {alignVertically, createLine, longestLength, padEnd} = require('./util')
const Widget                                               = require('./Widget')


function concatWidgetsHorizontally(acum, widget)
{
  return acum.map(concatWidgetsHorizontally_map, widget)
}

function concatWidgetsHorizontally_map(row, index)
{
  return row + this[index]
}

function ensureRows(widget)
{
  const {length} = widget
  widget.length = this

  return widget.fill('', length).map(padEnd, longestLength(widget))
}

function reduceWidest(acum, widget)
{
  return Math.max(acum, longestLength(widget))
}


class Container extends Widget
{
  static defaults = deepMergeNotNull({}, Widget.defaults, {
    align: {children: 'begin'},
    direction: 'top-bottom'
  })

  children = []

  pop()
  {
    return this.children.pop()
  }

  push(child)
  {
    this.children.push(child)
  }

  renderContent({align, children, direction, height, width, ...args})
  {
    let result = children.map(function(child)
    {
      return child.render({_parentHeight: height, _parentWidth: width, ...args})
    })

    // Reverse widgets
    if(direction === 'bottom-top' || direction === 'right-left')
      result = result.reverse()

    // Horizontal order
    if(direction === 'left-right' || direction === 'right-left')
    {
      const length = longestLength(result)

      // Align widgets vertically, ensure all has the same number of rows and
      // concat them horizontally
      result = result
        .map(alignVertically, {align: align.children, height: length})
        .map(ensureRows, length)
        .reduce(concatWidgetsHorizontally)
    }

    // Vertical order, only align widgets
    else
    {
      // Set container width to the widest rendered widget
      width = result.reduce(reduceWidest, 0)

      switch(align.children)
      {
        case 'center': result = result.map(wid => centerAlign(wid, width)); break
        case 'end'   : result = result.map(wid => rightAlign(wid, width))
      }
    }

    // Return flattened widgets
    return [].concat(...result)
  }

  shift()
  {
    return this.children.shift()
  }

  unshift(child)
  {
    this.children.unshift(child)
  }
}


module.exports = Container
