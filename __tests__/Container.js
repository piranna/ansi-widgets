const {Container, Label} = require('..')


test('empty', async function()
{
  const container = new Container()

  expect(await container.render()).toEqual([])
})

test('one empty item', async function()
{
  const container = new Container()

  container.push(new Label())

  expect(await container.render()).toEqual([])
})

test('one empty label', async function()
{
  const container = new Container()

  container.push(new Label({text: ''}))

  expect(await container.render()).toEqual([''])
})

test('one item', async function()
{
  const container = new Container()

  container.push(new Label({text: 'label'}))

  expect(await container.render()).toEqual(['label'])
})

describe('two items', function()
{
  test('top-bottom', async function()
  {
    const container = new Container()

    container.push(new Label({text: 'one'}))
    container.push(new Label({text: 'two'}))

    expect(await container.render()).toEqual(['one', 'two'])
  })

  test('left-right', async function()
  {
    const container = new Container({direction: 'left-right'})

    container.push(new Label({text: 'one'}))
    container.push(new Label({text: 'two'}))

    expect(await container.render()).toEqual(['onetwo'])
  })
})
