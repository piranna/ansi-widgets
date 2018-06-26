const equal         = require('fast-deep-equal')
const terminalImage = require('terminal-image')

const Label               = require('./Label')
const {paste, widestLine} = require('./util')
const Widget              = require('./Widget')


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


class Image extends Widget
{
  constructor(args)
  {
    super(args)

    // https://stackoverflow.com/a/40714458/586382
    return new Proxy(this, handler)
  }

  renderContent({align, height, width})
  {
    const {text, url, _content} = this

    if(_content)
    {
      if(this._prevHeight === height
      && this._prevWidth  === width
      && equal(this._prevAlign, align))
        return _content

      delete this._content
    }

    if(!url)
    {
      if(!text) return []

      return new Label({align, height, text, width}).render()
    }

    this._prevAlign  = align
    this._prevHeight = height
    this._prevWidth  = width

    return terminalImage(url, {asArray: true, height, width})
    .then(function(result)
    {
      if(!text) return result

      const label = new Label({
        align,
        height: result.length,
        text,
        width: widestLine(result)
      })

      return paste(result, label.render(), {trim: true})
    })
  }
}


module.exports = Image
