const {readdirSync} = require('fs')
const {basename, join} = require('path')


const dir = join(__dirname, 'widgets')


readdirSync(dir)
.forEach(function(name)
{
  exports[basename(name, '.js')] = require(join(dir, name))
})
