import { create, pickRandomDependencies, randomDependencies, randomIntDependencies } from 'mathjs'
import type { MathJsInstance } from 'mathjs'
import { baseModifiers } from './modifiers'
import { RootNode } from './node'
import { TracerySymbol } from './symbol'
import type { RuleSet } from './rules'

export type SerializedGrammar = Record<string, string | string[]>
export type ModifierFunction = (text: string) => string

export interface GrammarOptions {
  grammar: SerializedGrammar
  modifiers?: Record<string, ModifierFunction>
  seed?: string
}

const initialGrammarSymbol = Symbol('initial')

export interface GrammarExhaustedErrorInfo {
  raw: number
  request: string
  tryLimit: number
}
/**
 * Thrown when a grammar could not generate the wanted number of unique results in a timely fasion.
 */
export class GrammarExhaustedError extends Error implements GrammarExhaustedErrorInfo {
  request: string
  tryLimit: number
  raw: number

  constructor({ raw, request, tryLimit }: GrammarExhaustedErrorInfo) {
    super(`Grammar not complex to generate ${raw} "${request}" in ${tryLimit} tries.`)
    this.request = request
    this.tryLimit = tryLimit
    this.raw = raw
  }
}

export class Grammar {
  private allGrammars: Map<string | symbol, SerializedGrammar> = new Map()
  private allGrammarsStack: string[] = []

  // Symbol library
  private symbols: Map<string, TracerySymbol> = new Map()

  // Modifier library
  private modifiers: Record<string, ModifierFunction>

  readonly math: MathJsInstance

  constructor({ grammar, seed, modifiers }: GrammarOptions) {
    this.allGrammars.set(initialGrammarSymbol, grammar) // The initial grammar
    this.modifiers = Object.assign({}, baseModifiers, modifiers ?? {})
    this.math = create({
      pickRandomDependencies,
      randomDependencies,
      randomIntDependencies,
    }, { randomSeed: seed ?? null })
    this.recomputeSymbols()
  }

  protected recomputeSymbols(): void {
    this.symbols.clear()
    for (const grammar of this.allGrammars.values()) {
      Object.entries(grammar).forEach(([key, value]) => {
        this.symbols.set(key, new TracerySymbol(this, key, value))
      })
    }
  }

  /**
   * Remove a particular grammar by key
   */
  removeGrammar(key: string): void {
    const keyIndex = this.allGrammarsStack.findIndex(s => s === key)
    if (keyIndex === -1) {
      throw new Error(`Attempted to remove absent grammar by key: ${key} which was missing`)
    }
    const [removedKey] = this.allGrammarsStack.splice(keyIndex, 1)
    this.allGrammars.delete(removedKey)
    this.recomputeSymbols()
  }

  /**
   * Add a grammar layer to the grammar stack.
   *
   * The key can be used later to remove the particular grammar later.
   */
  addGrammar(key: string, grammar: SerializedGrammar): void {
    this.allGrammarsStack.push(key)
    this.allGrammars.set(key, grammar)
    this.recomputeSymbols()
  }

  popGrammar(): void {
    const key = this.allGrammarsStack.pop()
    if (key) {
      this.allGrammars.delete(key)
      this.recomputeSymbols()
    }
  }

  /**
   * Add a grammar layer without the need for a key
   */
  pushGrammar(grammar: SerializedGrammar): void {
    const phantomKey = this.allGrammarsStack.length
    this.addGrammar(phantomKey.toString(), grammar)
  }

  /**
   * Get a particular ruleset if possible
   */
  getRuleSet(key: string): RuleSet | undefined {
    const symbol = this.symbols.get(key)
    return symbol?.currentRuleset
  }

  /**
   * Add a series of symbols.
   */
  pushRules(key: string, rules: string | string[]): void {
    let symbol = this.symbols.get(key)
    if (symbol === undefined) {
      symbol = new TracerySymbol(this, key, rules)
      this.symbols.set(key, symbol)
    }
    else {
      symbol.pushRules(rules)
    }
  }

  popRules(key: string): void {
    const symbol = this.symbols.get(key)
    symbol?.popRules()

    if (symbol?.rulesets.length === 0) {
      this.symbols.delete(key)
    }
  }

  applyMod(modName: string, text: string): string {
    const fn = this.modifiers[modName]
    if (fn === undefined)
      throw new Error(`Unknown modifier: "${modName}"`)
    return fn(text)
  }

  /**
   * Replaces all symbols provided in the string following
   * the rules provided in the grammar
   */
  trace(raw: string): string {
    // Start a new tree
    const root = new RootNode(this, raw)
    const result = root.expand()
    return result.join('')
  };

  /**
   * Yields unique results from a repeated request
   *
   * @throws @see GrammarExhaustedError
   */
  *generateMany(raw: number, request: string, tryLimit: number = 1000): Generator<string> {
    const unique = new Set<string>()
    let tryCount = 0
    while (unique.size < raw) {
      tryCount += 1
      const attempt = this.trace(request)
      if (tryCount > tryLimit) {
        throw new GrammarExhaustedError({ raw, request, tryLimit })
      }
      if (unique.has(attempt))
        continue
      unique.add(attempt)
      tryCount = 0
      yield attempt
    }
    return undefined
  }
}
