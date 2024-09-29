import { RuleSet } from './rules'
import type { Grammar } from './grammar'
import type { RuleIterator } from './rules'

export class TracerySymbol {
  grammar: Grammar
  key: string
  currentRuleset?: RuleSet
  rulesets: RuleSet[] = []
  baseRules: RuleSet

  constructor(grammar: Grammar, key: string, rules: string | string[]) {
    this.grammar = grammar
    this.key = key
    // I'm going to assume loadfrom is unnessisary with a proper constructor
    const ruleset = new RuleSet(grammar, rules)
    this.baseRules = ruleset
    this.rulesets.push(ruleset)
    this.currentRuleset = ruleset
  }

  // loadFrom(rules: string|string[]) {
  //   const ruleset = new RuleSet(rules)
  //   this.baseRules = ruleset
  //   this.rulesets.push(ruleset)
  //   this.currentRuleset = ruleset
  // }

  mapRules(fxn: RuleIterator): unknown[] {
    if (!this.currentRuleset)
      return []
    return this.currentRuleset.mapRules(fxn)
  }

  applyRules(fxn: RuleIterator): void {
    this.currentRuleset?.applyRules(fxn)
  }

  pushRules(rules: string | string[]): void {
    const ruleset = new RuleSet(this.grammar, rules)
    this.rulesets.push(ruleset)
    this.currentRuleset = ruleset
  }

  popRules(): void {
    this.rulesets.pop()
    this.currentRuleset = this.rulesets.at(-1)
  }

  setRules(rules: string | string[]): void {
    const ruleset = new RuleSet(this.grammar, rules)
    this.rulesets = [ruleset]
    this.currentRuleset = ruleset
  }
}
