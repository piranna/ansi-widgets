const alignText  = require('align-text')
const chalk      = require('chalk')
const parseColor = require('parse-color')
const {convert}  = require('units-css')

const {alignVertically, createLine, longestLength, padEnd} = require('./util')
const deepMergeNotNull                                     = require('./deepMergeNotNull')


function applyBorder(result, border)
{
  if(!border) return result

  let {bottom, left, right, top} = border

  if(typeof bottom === 'number') bottom = {style: ' ', width: bottom}
  if(typeof left   === 'number') left   = {style: ' ', width: left}
  if(typeof right  === 'number') right  = {style: ' ', width: right}
  if(typeof top    === 'number') top    = {style: ' ', width: top}

  if(bottom)
  {
    let {color, style, width} = bottom

    if(width)
    {
      style = createLine(longestLength(result), style)

      if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

      const start = result.length
      result.length += width
      result.fill(style, start)
    }
  }

  if(left)
  {
    let {color, style, width} = left

    if(width)
    {
      style = createLine(width, style)

      if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

      result = result.map(line => style + line)
    }
  }

  if(right)
  {
    let {color, style, width} = right

    if(width)
    {
      style = createLine(width, style)

      if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

      result = result.map(mapMarginRight, style)
    }
  }

  if(top)
  {
    let {color, style, width} = top

    if(width)
    {
      style = createLine(longestLength(result), style)

      if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

      result = new Array(width).fill(style).concat(result)
    }
  }

  return result
}

function mapMarginRight(line)
{
  return line + this
}

function stringSlice(string)
{
  return string.slice(0, this)
}


class Widget
{
  static defaults =
  {
    align: {
      horizontal: 'left',
      vertical: 'top'
    },
    border: {
      bottom: {style: '█', width: 0},
      left: {style: '█', width: 0},
      right: {style: '█', width: 0},
      top: {style: '█', width: 0}
    },
    maxHeight: Infinity,
    maxWidth: Infinity,
    minHeight: 0,
    minWidth: 0,
    outline: {
      bottom: {style: '█'},
      left: {style: '█'},
      right: {style: '█'},
      top: {style: '█'}
    },
    padding: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0
    }
  }

  constructor(args)
  {
    for(const key in args) this[key] = args[key]
  }

  set height(value)
  {
    this._height = value
  }

  set width(value)
  {
    this._width = value
  }

  render({_parentHeight, _parentWidth, ...inherited}={})
  {
    // Unify local attributes, inherited ones and default values
    let {align, backgroundColor, border, foregroundColor, height, margin,
      maxHeight, maxWidth, minHeight, minWidth, outline, padding, width, ...args
    } = deepMergeNotNull({}, this.constructor.defaults, inherited, this)

    const {_height, _width} = this
    if(_height != null) height = _height
    if(_width  != null) width  = _width

    if(border)
    {
      border.bottom && (border.bottom.width = convert('em', border.bottom.width, _parentHeight))
      border.left   && (border.left.width   = convert('ch', border.left.width, _parentWidth))
      border.right  && (border.right.width  = convert('ch', border.right.width, _parentWidth))
      border.top    && (border.top.width    = convert('em', border.top.width, _parentHeight))
    }
    if(margin)
    {
      margin.bottom = convert('em', margin.bottom, _parentHeight)
      margin.left   = convert('ch', margin.left, _parentWidth)
      margin.right  = convert('ch', margin.right, _parentWidth)
      margin.top    = convert('em', margin.top, _parentHeight)
    }
    if(outline)
    {
      outline.bottom && (outline.bottom.width = convert('em', outline.bottom.width, _parentHeight))
      outline.left   && (outline.left.width   = convert('ch', outline.left.width, _parentWidth))
      outline.right  && (outline.right.width  = convert('ch', outline.right.width, _parentWidth))
      outline.top    && (outline.top.width    = convert('em', outline.top.width, _parentHeight))
    }
    if(padding)
    {
      padding.bottom = convert('em', padding.bottom, _parentHeight)
      padding.left   = convert('ch', padding.left, _parentWidth)
      padding.right  = convert('ch', padding.right, _parentWidth)
      padding.top    = convert('em', padding.top, _parentHeight)
    }

    height    = convert('em', height, _parentHeight)
    maxHeight = convert('em', maxHeight, _parentHeight)
    maxWidth  = convert('ch', maxWidth, _parentWidth)
    minHeight = convert('em', minHeight, _parentHeight)
    minWidth  = convert('ch', minWidth, _parentWidth)
    width     = convert('ch', width, _parentWidth)

    const paddingH = border.left.width + border.right.width + padding.left + padding.right
    const paddingV = border.bottom.width + border.top.width + padding.bottom + padding.top

    const renderContent = (height, width) =>
    {
      if(height != null) height -= paddingV
      if(width  != null) width  -= paddingH

      return this.renderContent({align, height, width, ...args})
    }

    // Adjust and apply constrains to `height` and `width` if they are defined
    if(height != null)
    {
      minHeight = Math.max(minHeight, height)
      maxHeight = Math.min(height, maxHeight)

      height = Math.max(minHeight, maxHeight)
    }

    if(width != null)
    {
      minWidth = Math.max(minWidth, width)
      maxWidth = Math.min(width, maxWidth)

      width = Math.max(minWidth, maxWidth)
    }

    // Render
    let result = renderContent(height, width)

    // If any of the sizes was undefined, check constrains of the rendered sizes
    if(height == null || width == null)
    {
      let reRender

      height = result.length + paddingV
      width = longestLength(result) + paddingH

      // Check rendered height and adjust to constrains
      if(height < minHeight)
      {
        height = minHeight

        reRender = true
      }
      else if(height > maxHeight)
      {
        height = maxHeight

        reRender = true
      }

      // Check rendered width and adjust to constrains
      if(width < minWidth)
      {
        width = minWidth

        reRender = true
      }
      else if(width > maxWidth)
      {
        width = maxWidth

        reRender = true
      }

      // Rendered sizes has been adjusted to the constrains, re-render
      if(reRender) result = renderContent(height, width)
    }

    //
    // Fix height and width if they have been ignored
    //

    height = result.length + paddingV
    width = longestLength(result) + paddingH

    // Rendered height smaller than min height, pad top and/or bottom
    if(height < minHeight)
    {
      result = alignVertically.call({align: align.vertical, height}, result)

      // Adjust bottom
      const {length} = result
      if(length < minHeight - paddingV)
      {
        result.length = minHeight - paddingV
        result.fill('', length)
      }

      height = minHeight
    }

    // Rendered height bigger than max height, truncate from bottom
    else if(height > maxHeight)
    {
      result.length = maxHeight - paddingV

      height = maxHeight
    }

    // Rendered width smaller than min width, pad left and/or right
    if(width < minWidth)
    {
      let before = 0

      switch(align.horizontal)
      {
        case 'right': before = minWidth - width
        case 'center': before = Math.floor(before / 2)
      }

      result = alignText(result, before)

      width = minWidth
    }

    // Rendered width bigger than max width, truncate from right
    else if(width > maxWidth)
    {
      result = result.map(stringSlice, maxWidth - paddingH)

      width = maxWidth
    }

    // Define getters for current height and width
    Object.defineProperties(this,
    {
      height: {configurable: true, enumerable: true, get(){return height}},
      width : {configurable: true, enumerable: true, get(){return width}}
    })

    // Ensure all rows length are of the widget content width
    result = result.map(padEnd, width - paddingH)

    // Apply paddings, borders and outlines
    result = applyBorder(result, padding)
    result = applyBorder(result, border)
    result = applyBorder(result, outline)

    // Apply styles
    let style

    if(foregroundColor) style = chalk.rgb(...parseColor(foregroundColor).rgb)
    if(backgroundColor)
      style = (style || chalk).bgRgb(...parseColor(backgroundColor).rgb)

    if(style) result = result.map((row) => style(row))

    // Apply margins
    result = applyBorder(result, margin)

    // Return rendered widget
    return result
  }
}


module.exports = Widget
