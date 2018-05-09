const mergewith = require('lodash.mergewith')


function customizer(objValue, srcValue)
{
  if(srcValue === null) return objValue
}


function deepMergeNotNull(target, ...args)
{
  return mergewith(target, ...args, customizer)
}


module.exports = deepMergeNotNull
