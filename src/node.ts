import { Action } from './action'
import { parseRule } from './rules'
import type { Grammar } from './grammar'
import type { ParsedRuleSections, ParsedTag } from './rules'

interface TraceryNodeOpts {
  parent?: TraceryNode
  grammar: Grammar
  raw: string
}

export abstract class TraceryNode {
  static latestId: number = 0

  readonly id: number
  readonly isLeaf: boolean = true

  actions: Action[] = []
  depth: number = 0

  raw: string
  children: TraceryNode[] = []

  grammar: Grammar
  parent?: TraceryNode

  constructor({ parent, grammar, raw }: TraceryNodeOpts) {
    this.id = TraceryNode.latestId
    TraceryNode.latestId += 1
    this.raw = raw
    this.grammar = grammar

    if (parent) {
      this.depth = parent.depth + 1
    }
  }

  createChildrenFromSections(sections: ParsedRuleSections): void {
    this.children = sections.filter((section) => {
      if (typeof section === 'string')
        return section.length > 0
      return true
    }).map((section) => {
      if (typeof section === 'string')
        return new TextNode(section, this)
      return new TagNode(section, this)
    }) as TraceryNode[]
  }

  expandChildren(): string[] {
    return this.children.flatMap(child => child.expand())
  }

  abstract expand(): string[]
}

export class RootNode extends TraceryNode {
  isLeaf: boolean = false
  parsedRule: ParsedRuleSections

  constructor(grammar: Grammar, rawRule: string) {
    super({ raw: rawRule, grammar })
    this.parsedRule = parseRule(rawRule)
  }

  expand(): string[] {
    this.createChildrenFromSections(this.parsedRule)
    return this.expandChildren()
  }
}

export class TextNode extends TraceryNode {
  constructor(raw: string, parent: TraceryNode) {
    super({ raw, parent, grammar: parent.grammar })
  }

  expand(): string[] {
    return [this.raw]
  }
}

export class TagNode extends TraceryNode {
  parsedTag: ParsedTag
  parent: TraceryNode
  grammar: Grammar

  constructor(parsedTag: ParsedTag, parent: TraceryNode) {
    super({ raw: parsedTag.raw, parent, grammar: parent.grammar })
    this.parent = parent

    this.grammar = parent.grammar
    this.parsedTag = parsedTag
  }

  expand(): string[] {
    const ruleSet = this.grammar.getRuleSet(this.parsedTag.symbol)
    const selected = ruleSet?.get()
    this.createChildrenFromSections(selected?.sections ?? [])
    // Do preexpansion actions
    const preActions = this.parsedTag.preActionNames.map(name => new Action(this, name))
    preActions.forEach(action => action.activate())

    const childText = this.expandChildren().join('')
    preActions.forEach(action => action.deactivate())

    const finalText = this.parsedTag.modifiers.reduce((text, modName) => this.grammar.applyMod(modName, text), childText)

    return [finalText]
  }
}
