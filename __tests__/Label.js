const {Label} = require('..')


test('no text', async function()
{
  const label = new Label()

  expect(await label.render()).toEqual([])
})

test('empty text', async function()
{
  const label = new Label({text: ''})

  expect(await label.render()).toEqual([''])
})

test('simple text', async function()
{
  const label = new Label({text: 'simple text'})

  expect(await label.render()).toEqual(['simple text'])
})

test('colored', async function()
{
  const label = new Label({
    backgroundColor: 'rgb(255,0,0)',
    foregroundColor: 'rgb(0,255,0)',
    text: 'colored'
  })

  expect(await label.render())
  .toEqual(['\u001b[38;2;0;255;0m\u001b[48;2;255;0;0mcolored\u001b[49m\u001b[39m'])
})

test('height', async function()
{
  const label = new Label({height: 4, text: 'height'})

  expect(await label.render()).toEqual(['height', '      ', '      ', '      '])
})

test('width', async function()
{
  const label = new Label({text: 'width', width: 10})

  expect(await label.render()).toEqual(['width     '])
})

test('height and width', async function()
{
  const label = new Label({height: 4, text: 'asdf', width: 10})

  expect(await label.render())
  .toEqual(['asdf      ', '          ', '          ', '          '])
})
