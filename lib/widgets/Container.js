const longest = require('longest')

const deepMergeNotNull                      = require('../deepMergeNotNull')
const {alignVertically, widestLine, padEnd} = require('../util')
const Widget                                = require('../Widget')


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

  return widget.fill('', length).map(padEnd, widestLine(widget))
}

function reduceWidest(acum, widget)
{
  return Math.max(acum, widestLine(widget))
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
    this.removeListener('renderReady', this._onRenderReady)

    return this.children.pop()
  }

  push(child)
  {
    child.on('renderReady', this._onRenderReady)

    return this.children.push(child)
  }

  renderContent({align, height, width, ...args})
  {
    const {children, direction} = this

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
      const widget = longest(result)
      const height = widget && widget.length

      if(height)
      {
        // Align widgets vertically and ensure all has the same number of rows
        result = result
          .map(alignVertically, {align: align.children, height})
          .map(ensureRows, height)
      }

      // Concat widgets horizontally
      result = result.reduce(concatWidgetsHorizontally)
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
    this.removeListener('renderReady', this._onRenderReady)

    return this.children.shift()
  }

  unshift(child)
  {
    child.on('renderReady', this._onRenderReady)

    return this.children.unshift(child)
  }

  _onRenderReady = stack =>
  {
    stack.push(this)

    this.emit('renderReady', stack)
  }
}


module.exports = Container
