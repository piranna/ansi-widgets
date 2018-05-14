const {Label} = require('..')


test('no text', function()
{
  const label = new Label()

  expect(label.render()).toEqual([])
})

test('empty text', function()
{
  const label = new Label({text: ''})

  expect(label.render()).toEqual([''])
})

test('simple text', function()
{
  const label = new Label({text: 'simple text'})

  expect(label.render()).toEqual(['simple text'])
})

test('colored', function()
{
  const label = new Label({
    backgroundColor: 'rgb(255,0,0)',
    foregroundColor: 'rgb(0,255,0)',
    text: 'colored'
  })

  expect(label.render())
  .toEqual(['\u001b[38;2;0;255;0m\u001b[48;2;255;0;0mcolored\u001b[49m\u001b[39m'])
})

test('height', function()
{
  const label = new Label({height: 4, text: 'height'})

  expect(label.render()).toEqual(['height', '      ', '      ', '      '])
})

test('width', function()
{
  const label = new Label({text: 'width', width: 10})

  expect(label.render()).toEqual(['width     '])
})

test('height and width', function()
{
  const label = new Label({height: 4, text: 'asdf', width: 10})

  expect(label.render())
  .toEqual(['asdf      ', '          ', '          ', '          '])
})
