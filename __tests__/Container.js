const {Container, Image, Label} = require('..')


test('empty', function()
{
  const container = new Container()

  expect(container.render()).toEqual([])
})

test('one empty item', function()
{
  const container = new Container()

  container.push(new Label())

  expect(container.render()).toEqual([])
})

test('one empty label', function()
{
  const container = new Container()

  container.push(new Label({text: ''}))

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

  test('right-left', function()
  {
    const container = new Container({direction: 'right-left'})

    const image = new Image({url: `${__dirname}/fixtures/two.png`})

    container.push(new Label({text: 'one'}))
    container.push(image)

    expect(container.render()).toEqual(['one'])

    container.on('renderReady', function(stack)
    {
      expect(this).toBe(container)
      expect(stack).toEqual([image, container])

      const start  = performance.now()
      const result = container.render()
      const finish = performance.now()

      expect(result).toEqual(require(`${__dirname}/fixtures/1.json`))
      expect(finish - start).toBeLessThanOrEqual(1)

      done()
    })
  })

  test('different height', function()
  {
    const container = new Container({direction: 'left-right'})

    const image = new Image({url: `${__dirname}/fixtures/two.png`})

    container.push(new Label({text: 'one'}))
    container.push(image)

    expect(container.render()).toEqual(['one'])

    container.on('renderReady', function(stack)
    {
      expect(this).toBe(container)
      expect(stack).toEqual([image, container])

      const start  = performance.now()
      const result = container.render()
      const finish = performance.now()

      expect(result).toEqual(require(`${__dirname}/fixtures/2.json`))
      expect(finish - start).toBeLessThanOrEqual(1)

      done()
    })
  })
})
