const terminalImage = require('terminal-image')

const {paste, widestLine} = require('../util')
const Widget              = require('../Widget')

const Label = require('./Label')


class Image extends Widget
{
  renderContent({align, height, width})
  {
    const {text, url} = this

    if(!url)
    {
      if(!text) return []

      return new Label({align, height, text, width}).render()
    }

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
