const terminalImage = require('terminal-image')

const Label   = require('./Label')
const {paste} = require('./util')
const Widget  = require('./Widget')


class Image extends Widget
{
  renderContent({align, height, text, url, width})
  {
    if(!url) return []

    return terminalImage(url, {asArray: true, height, width})
    .then(async function(result)
    {
      if(!text) return result

      const label = new Label({align, height, text, width})

      return paste(result, await label.render(), {trim: true})
    })
  }
}


module.exports = Image
