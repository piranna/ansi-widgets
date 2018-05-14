const terminalImage = require('terminal-image')

const Widget = require('./Widget')


class Image extends Widget
{
  renderContent({height, url, width})
  {
    if(!url) return []

    return terminalImage(url, {asArray: true, height, width})
  }
}


module.exports = Image
