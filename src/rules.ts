import type { Grammar } from './grammar'

export interface ParsedTag {
  preActionNames: string[]
  postActionNames: string[]
  symbol: string
  modifiers: string[]
  raw: string
}
export type ParsedRuleSections = (ParsedTag | string)[]

export function parseTag(tag: string): ParsedTag {
  const preActionNames: string[] = []
  const postActionNames: string[] = []
  const modifiers: string[] = []

  let symbol: string | undefined
  let inPre = true
  let startOfSlice = 0
  let depth = 0

  const processNonAction = (endOfSlice: number): void => {
    // Advance the tracker
    if (startOfSlice === endOfSlice) {
      startOfSlice = endOfSlice
      return
    }

    if (!inPre) {
      throw new Error(`multiple possible expansion symbols in tag: ${tag}`)
    }
    inPre = false
    const section = tag.substring(startOfSlice, endOfSlice)
    const mods = section.split('.')
    symbol = mods[0]
    modifiers.push(...mods.slice(1))
  }

  for (let i = 0; i < tag.length; i++) {
    const char = tag.charAt(i)
    let section: string
    switch (char) {
      case '[':
        if (depth === 0)
          processNonAction(i)
        depth += 1
        break
      case ']':
        depth -= 1
        if (depth !== 0)
          break

        section = tag.substring(startOfSlice + 1, i)
        startOfSlice = i + 1

        if (inPre) {
          preActionNames.push(section)
        }
        else {
          postActionNames.push(section)
        }
        break
      default:
        // Do nothing
        break
    }
  }
  // Finish the rest
  processNonAction(tag.length)

  if (depth !== 0) {
    throw new Error(`Mismatched number of [ and ] in tag: "${tag}"`)
  }

  if (symbol === undefined) {
    throw new Error(`Couldn't get a symbol from "${tag}"`)
  }

  return {
    preActionNames,
    postActionNames,
    symbol,
    modifiers,
    raw: tag,
  }
}

export function parseRule(rule: string): ParsedRuleSections {
  if (rule.length === 0) {
    return []
  }

  const sections: ParsedRuleSections = []
  let inTag = false
  let startOfSlice = 0
  let depth = 0

  function createSection(endOfSlice: number): void {
    if (endOfSlice - startOfSlice > 0) {
      const section = rule.substring(startOfSlice, endOfSlice)
      if (inTag)
        sections.push(parseTag(section))
      else sections.push(section)
    }
    inTag = !inTag
    startOfSlice = endOfSlice + 1
  }

  for (let i = 0; i < rule.length; i++) {
    const char = rule.charAt(i)
    switch (char) {
      case '[':
        depth += 1
        break
      case ']':
        depth -= 1
        break
      case '#':
        if (depth === 0) {
          createSection(i)
        }
        break
      default:
        // Do nothing
        break
    }
  }

  if (depth !== 0) {
    throw new Error(`Mismatched number of [ and ] in rule: "${rule}"`)
  }

  if (inTag) {
    throw new Error(`Mismached number of #s in rule: "${rule}"`)
  }

  createSection(rule.length)

  return sections
}

export class Rule {
  raw: string
  sections: (ParsedTag | string)[]

  constructor(rule: string) {
    this.raw = rule
    this.sections = parseRule(rule)
  }

  toString(): string {
    return this.raw
  }

  toJSON(): string {
    return this.raw
  }
}

export type RuleIterator = (rule: Rule, index: number) => unknown

export class RuleSet {
  rules: Rule[] = []

  protected ruleUses: number[]
  protected startUses: number[]
  protected totalUses: number = 0
  grammar: Grammar

  constructor(grammar: Grammar, rules: string | string[]) {
    this.grammar = grammar
    if (Array.isArray(rules)) {
      this.rules = rules.map(r => new Rule(r))
    }
    if (typeof rules === 'string') {
      this.rules.push(new Rule(rules))
    }

    this.ruleUses = Array.from({ length: this.rules.length }).map(() => 0)
    this.startUses = Array.from({ length: this.rules.length }).map(() => 0)
  }

  mapRules(fxn: RuleIterator): unknown[] {
    return this.rules.map(fxn)
  }

  applyRules(fxn: RuleIterator): void {
    this.rules.forEach(fxn)
  }

  protected getRandomIndex(): number {
    return this.grammar.math.randomInt(0, this.ruleUses.length)
  }

  protected getIndex(): number {
    // Weighted distribution
    // Imagine a bar of length 1, how to divide the length
    // s.t. a random dist will result in the dist we want?
    let index = this.getRandomIndex()
    const median = this.totalUses / this.ruleUses.length
    let count = 0
    while (this.ruleUses[index] > median && count < 20) {
      index = this.getRandomIndex()
      count += 1
    }
    // reroll ore likely if index is too much higher
    return index
  }

  get(): Rule {
    return this.rules[this.getRandomIndex()]
  }

  decayUses(percent: number): void {
    this.ruleUses = this.ruleUses.map(uses => uses * (1 - percent))
    this.totalUses = this.ruleUses.reduce((val, uses) => val + uses, 0)
  }

  toJSON(): string[] {
    return this.rules.map(r => r.toJSON())
  }
}
