import { test } from 'vitest'
import { Grammar } from '../src'
import type { SerializedGrammar } from '../src/grammar'

declare module 'vitest' {
  export interface TestContext {
    foo?: string
  }
}

const manyNumbers = Array.from({ length: 1000 }).map((_, i) => i.toString())
const seed = 'tests woohoo!'
const exampleGrammar: SerializedGrammar = {
  bob: 'bob',
  hello: ['hello', 'salutations'],
  world: ['world', 'planet', 'speck'],
  helloThing: '#hello#, #thing#!',
  helloWorld: '#[hello:Hello][thing:World]helloThing#',
  personSaid: '#person.capitalize# said: #said.quote#',
  manyNumbers,
}

interface GrammarTestContext {
  seed: string
  exampleGrammar: SerializedGrammar
  g: Grammar
}

export const grammarTest = test.extend<GrammarTestContext>({
  seed,
  exampleGrammar,
  // Vitest wants you to use an empty object rather than a _ for unused
  // eslint-disable-next-line no-empty-pattern
  g: async ({}, use) => {
    const g = new Grammar({
      grammar: exampleGrammar,
      seed,
    })
    await use(g)
  },
})
