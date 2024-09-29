import { parseTag } from './rules'
import type { Grammar } from './grammar'
import type { TraceryNode } from './node'

export class Action {
  node: TraceryNode
  grammar: Grammar
  raw: string

  pushedSymbol?: string
  pushedRules?: string[]

  subActions: Action[] = []

  constructor(node: TraceryNode, raw: string) {
    this.grammar = node.grammar
    this.node = node
    this.raw = raw
  }

  activate(): void {
    const node = this.node
    node.actions.push(this)

    const [symbol, text] = this.raw.split(':')
    // replace any hashtags
    const amended = this.grammar.trace(text)
    if (amended.length === 0) {
      throw new Error(`Ammended text for rule from ${this.raw} didn't generate any text!`)
    }

    const { preActionNames } = parseTag(amended)
    this.subActions = preActionNames.map(raw => new Action(node, raw))

    if (symbol === undefined) {
      throw new Error(`Can't understand symbol: "${symbol}"`)
    }

    this.pushedSymbol = symbol
    // This was originally parseTag.symbol but it breaks in the case of titles like
    //  Mr. since we might be looking at just text, so we should only look at the flattened stuff
    this.pushedRules = [amended]
    node.grammar.pushRules(this.pushedSymbol, this.pushedRules)

    this.subActions.forEach(action => action.activate())
  }

  deactivate(): void {
    this.subActions.forEach(action => action.deactivate())
    if (this.pushedSymbol) {
      this.node.grammar.popRules(this.pushedSymbol)
    }
  }
}
