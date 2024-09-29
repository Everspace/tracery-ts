import { describe, expect } from 'vitest'
import { Grammar } from '../src'
import { GrammarExhaustedError } from '../src/grammar'
import { grammarTest } from './grammar'

describe('grammar', () => {
  grammarTest('can trace a text', ({ g }) => {
    expect(g.trace('#bob#')).toEqual('bob')
  })

  grammarTest('can use tags', ({ g }) => {
    expect(g.trace('#helloWorld#')).toEqual('Hello, World!')
  })

  grammarTest('can use symbols in tags', ({ g }) => {
    expect(g.trace('#[person:#bob#][said:#helloWorld#]personSaid#')).toEqual('Bob said: "Hello, World!"')
  })

  grammarTest.todo('can nest tags in tags', ({ g }) => {
    expect(g.trace('#[person:#bob#][said:#[hello:Hello][thing:World]helloThing#]personSaid#')).toEqual('Bob said: "Hello, World!"')
  })

  grammarTest('when given a seed produces the same result', ({ exampleGrammar, seed }) => {
    const a = new Grammar({ grammar: exampleGrammar, seed })
    const b = new Grammar({ grammar: exampleGrammar, seed })

    for (let index = 0; index < 1000; index++) {
      expect(a.trace('#manyNumbers#')).toEqual(b.trace('#manyNumbers#'))
    }
  })

  grammarTest('can use builtin modifiers', ({ g }) => {
    expect(g.trace('#bob.s#')).toEqual('bobs')
    expect(g.trace('#bob.s.er#')).toEqual('bobser')
    expect(g.trace('#bob.er.s#')).toEqual('bobers')
  })

  grammarTest('generateMany throws when you use a simple grammer for generateMany', ({ g }) => {
    const doLots = (i: Generator<any>) => {
      for (const _ of i) {
        continue
      }
    }
    expect(() => doLots(g.generateMany(100, '#bob#'))).toThrowError(GrammarExhaustedError)
    expect(() => doLots(g.generateMany(100, '#world#', 2))).toThrowError(GrammarExhaustedError)
  })
})
