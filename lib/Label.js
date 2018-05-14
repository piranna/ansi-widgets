const centerAlign = require('center-align')
const justified   = require('justified')
const rightAlign  = require('right-align')
const wordWrap    = require('word-wrap')

const deepMergeNotNull = require('./deepMergeNotNull')
const Widget           = require('./Widget')


class Label extends Widget
{
  static defaults = deepMergeNotNull({}, Widget.defaults, {
    align: {text: 'left'}
  })

  renderContent({align, text, width})
  {
    if(text == null) return []

    const options =
    {
      cut: true,
      indent: '',
      width: width != null ? width : ''  // justified and wordWrap
    }

    switch(align.text)
    {
      case 'center'   : return centerAlign(text, width)
      case 'justified': return justified(text, options)
      case 'right'    : return rightAlign(text, width)
    }

    return wordWrap(text, options).split('\n')
  }
}


module.exports = Label
