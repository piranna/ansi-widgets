const EventEmitter = require('events')

const alignText  = require('align-text')
const chalk      = require('chalk')
const equal      = require('fast-deep-equal')
const parseColor = require('parse-color')
const {convert}  = require('units-css')

const {alignVertically, widestLine, padEnd} = require('./util')
const deepMergeNotNull                      = require('./deepMergeNotNull')


const handler =
{
  set(object, key, value, proxy)
  {
    const prevValue = object[key]

    if(prevValue !== value)
    {
      object[key] = value

      if(key[0] !== '_') delete object._content
    }

    return true
  }
}


function applyBorder(result, border)
{
  if(!border) return result

  let {bottom, left, right, top} = border

  if(typeof bottom === 'number') bottom = {style: ' ', width: bottom}
  if(typeof left   === 'number') left   = {style: ' ', width: left}
  if(typeof right  === 'number') right  = {style: ' ', width: right}
  if(typeof top    === 'number') top    = {style: ' ', width: top}

  if(left ) result = marginH(result, left , mapMarginLeft )
  if(right) result = marginH(result, right, mapMarginRight)

  if(bottom) result = marginV(result, bottom, function(result, style, width)
  {
    const start = result.length
    result.length += width
    result.fill(style, start)

    return result
  })

  if(top) result = marginV(result, top, function(result, style, width)
  {
    result = new Array(width).fill(style).concat(result)
  })

  return result
}

function createEmptyLine(...args)
{
  return ''.padEnd(...args)
}

function mapMarginLeft(line)
{
  return this + line
}

function mapMarginRight(line)
{
  return line + this
}

function marginH(result, {color, style, width}, mapper)
{
  if(width)
  {
    style = createEmptyLine(width, style)

    if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

    result = result.map(mapper, style)
  }

  return result
}

function marginV(result, {color, style, width}, mapper)
{
  if(width)
  {
    style = createEmptyLine(widestLine(result), style)

    if(color) style = chalk.rgb(...parseColor(color).rgb)(style)

    result = mapper(result, style, width)
  }

  return result
}

function stringSlice(string)
{
  return string.slice(0, this)
}


class Widget extends EventEmitter
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
    super()

    for(const key in args) this[key] = args[key]

    // https://stackoverflow.com/a/40714458/586382
    return new Proxy(this, handler)
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

    const renderContent = () =>
    {
      if(height != null) height -= paddingV
      if(width  != null) width  -= paddingH

      const {_content} = this
      if(_content)
      {
        if(this._prevHeight === height
        && this._prevWidth  === width
        && equal(this._prevAlign, align))
          return _content

        delete this._content
      }

      this._prevAlign  = align
      this._prevHeight = height
      this._prevWidth  = width

      let result = this.renderContent({align, height, width, ...args})

      if(Array.isArray(result))
      {
        height = result.length + paddingV
        width = widestLine(result) + paddingH
      }
      else if(result instanceof Promise)
      {
        result.then((content) =>
        {
          this._content = content

          this.emit('renderReady', [this])
        })

        result = null
      }
      else
        throw result

      return result
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
    let needRender = true
    let result

    // If any of the sizes was undefined, check constrains of calculated sizes
    if(height == null || width == null)
    {
      needRender = false
      result = renderContent()

      if(!result) result = []

      else
      {
        // Check calculated height and adjust to constrains
        if(height < minHeight)
        {
          height = minHeight

          needRender = true
        }
        else if(height > maxHeight)
        {
          height = maxHeight

          needRender = true
        }

        // Check calculated width and adjust to constrains
        if(width < minWidth)
        {
          width = minWidth

          needRender = true
        }
        else if(width > maxWidth)
        {
          width = maxWidth

          needRender = true
        }
      }
    }

    if(needRender) result = renderContent()

    //
    // Fix height and width if they have been ignored
    //

    // Rendered height smaller than min height, pad top and/or bottom
    if(height < minHeight)
    {
      result = alignVertically.call({align: align.vertical, height}, result)

      // Adjust bottom
      const {length} = result
      const minHeightMinusPaddingV = minHeight - paddingV

      if(length < minHeightMinusPaddingV)
      {
        result.length = minHeightMinusPaddingV
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

    // Emit `resized` event if height or width has changed from the previous
    // render
    if(this.height != null && (height !== this.height || width !== this.width))
      this.emit('resized')

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
