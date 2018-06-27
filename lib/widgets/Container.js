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
    align: {children: 'begin'}
  })

  children = []

  pop()
  {
    return this._removeChildren(this.children.pop())
  }

  push(child)
  {
    return this.children.push(this._addChildren(child))
  }

  renderContent({align, height, width, ...args})
  {
    const {children, horizontal, reverse} = this

    let result = children.map(function(child)
    {
      return child.render({_parentHeight: height, _parentWidth: width, ...args})
    })

    // Reverse widgets
    if(reverse) result = result.reverse()

    // Horizontal order
    if(horizontal)
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
    return this._removeChildren(this.children.shift())
  }

  unshift(child)
  {
    return this.children.unshift(this._addChildren(child))
  }

  _addChildren = child =>
  {
    delete this._content

    return child.on('renderReady', this._onRenderReady)
  }

  _onRenderReady = stack =>
  {
    stack.push(this)

    delete this._content

    this.emit('renderReady', stack)
  }

  _removeChildren = child =>
  {
    delete this._content

    return child.removeListener('renderReady', this._onRenderReady)
  }
}


module.exports = Container
