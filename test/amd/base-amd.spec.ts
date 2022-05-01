import { mockEnvironment } from './helpers'

describe('simple test with external module', () => {
  const { starters, define, errors } = mockEnvironment({
    ['@beland/test']: async () => ({
      async xxx(...args: number[]) {
        return args.reduce((a, c) => a + c, 0)
      },
      async yyy() {}
    })
  })

  it('defines a module that loads other module that loads @beland/test', (done) => {
    define('test', ['a-module-that-takes-its-time-to-load'], (
      asyncModule: any
    ) => {
      try {
        expect(asyncModule.exportedTestBLD).toHaveProperty('xxx')
        expect(asyncModule.exportedTestBLD).toHaveProperty('yyy')
      } catch (e) {
        done(e)
        return
      }

      asyncModule.exportedTestBLD
        .xxx(1, 2, 3, 4)
        .then((r: any) => {
          expect(r).toEqual(10)
        })
        .catch(done)

      done()
    })

    setTimeout(() => {
      // define the "a-module-that-takes-its-time-to-load"
      define('a-module-that-takes-its-time-to-load', [
        'exports',
        '@beland/test'
        exports: any,
        testBLD: any
      ) => {
        if (!testBLD) {
          done('testBLD is null')
        } else {
          exports.exportedTestBLD = testBLD
        }
      })
    }, 100)
  })

  it('starters must not throw', () => {
    expect(starters.length).toBeGreaterThan(0)
    expect(errors.length).toBe(0)
    starters.forEach(($) => $())
  })
})
