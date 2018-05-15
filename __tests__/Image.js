const {Image} = require('..')


test('empty', async function()
{
  const image = new Image()

  expect(await image.render()).toEqual([])
})

test('local image', async function()
{
  const image = new Image({url: `${__dirname}/fixtures/dog.jpg`})

  // require('fs').writeFileSync(`${__dirname}/fixtures/dog.json`, JSON.stringify(await image.render(), null, 2))
  expect(await image.render()).toEqual(require(`${__dirname}/fixtures/dog.json`))
})

test('text', async function()
{
  const image = new Image({text: 'dos', url: `${__dirname}/fixtures/two.png`})

  expect(await image.render()).toEqual(require(`${__dirname}/fixtures/dos.json`))
})
