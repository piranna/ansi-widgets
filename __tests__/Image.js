const {Image} = require('..')


test('empty', function()
{
  const image = new Image()

  expect(image.render()).toEqual([])
})

test('local image', function(done)
{
  const image = new Image({url: `${__dirname}/fixtures/dog.jpg`})

  // require('fs').writeFileSync(`${__dirname}/fixtures/dog.json`, JSON.stringify(image.render(), null, 2))
  expect(image.render()).toEqual([])

  image.on('renderReady', function(stack)
  {
    expect(this).toBe(image)
    expect(stack).toEqual([image])

    const start  = performance.now()
    const result = image.render()
    const finish = performance.now()

    expect(result).toEqual(require(`${__dirname}/fixtures/dog.json`))
    expect(finish - start).toBeLessThanOrEqual(22)  // 4

    done()
  })
}, 400)

test('text', function()
{
  const image = new Image({text: 'dos', url: `${__dirname}/fixtures/two.png`})

  expect(image.render()).toEqual([])

  image.on('renderReady', function(stack)
  {
    expect(this).toBe(image)
    expect(stack).toEqual([image])

    const start  = performance.now()
    const result = image.render()
    const finish = performance.now()

    expect(result).toEqual(require(`${__dirname}/fixtures/dos.json`))
    expect(finish - start).toBeLessThanOrEqual(0)

    done()
  })
})
