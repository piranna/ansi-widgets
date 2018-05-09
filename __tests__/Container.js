const {Container, Label} = require('..')


test('empty', function()
{
  const container = new Container()

  expect(container.render()).toEqual([])
})

test('one empty item', function()
{
  const container = new Container()

  container.push(new Label())

  expect(container.render()).toEqual([''])
})

test('one item', function()
{
  const container = new Container()

  container.push(new Label({text: 'label'}))

  expect(container.render()).toEqual(['label'])
})

describe('two items', function()
{
  test('top-bottom', function()
  {
    const container = new Container()

    container.push(new Label({text: 'one'}))
    container.push(new Label({text: 'two'}))

    expect(container.render()).toEqual(['one', 'two'])
  })

  test('left-right', function()
  {
    const container = new Container({direction: 'left-right'})

    container.push(new Label({text: 'one'}))
    container.push(new Label({text: 'two'}))

    expect(container.render()).toEqual(['onetwo'])
  })
})
