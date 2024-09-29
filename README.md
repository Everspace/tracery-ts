# tracery-ts

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Tracery is a super-simple tool and language to generate text, by GalaxyKate. It's been used by middle school students, humanities professors, indie game developers, professional bot makers, and lots of regular people, too. Give it a try today! - Tracery.io

This is a modern update rewritten in typescript and hopefully a little more ingestible for people using the npm ecosystem.

Try it in a discord bot.

## Usage

- `npm i tracery-ts`
- `pnpm i tracery-ts`

### Simple Code Example
```js
import { Grammar } from 'tracery-ts'

const example = {
  bakedGood: ['pie', 'cupcake', 'muffin', 'dumpling', 'croissant'],
  sweet: ['sweetie', 'sugar', 'frosted', 'honey'],
  beloved: ['darling', 'wonderful', 'stupendous'],
  hello: ['greetings', 'salutations', 'sup'],
  punct: ['?', '!', '?!', '.', '...'],
  origin: '#hello# my #beloved# #sweet# #bakedGood##punct#',
}

const myGrammar = new Grammar({
  grammar: example
})

myGrammar.trace('#origin#')
// returns maybe...
// salutations my wonderful sweetie muffin?
// greetings my darling frosted croissant?!
// ahoy-hoy my stupendous sweetie dumpling.
```

# Docs

### Grammar

A grammar is a collection of symbols bundled together. It looks like this

```ts
exampleGrammar = {
  everspace: 'everpsace',
  animal: ['snake', 'crab', 'elephant', 'everspace on a weekend']
}
```

You can see some more complex examples of grammars in the `./examples/` folder

### Symbols

Symbols are the individual building blocks of a grammar, and when in text they look like this `#animal#`.

A particular can be any one of the bits of text assigned to it, such as `crab` and replaced. For example:
- `Ouch that #animal# bit me`

could turn into
- `Ouch that everspace on a weekend bit me`

Any text can contain any number of other symbols, which are picked at random until the whole thing no longer has any more symbols. This allows you to nest differnt symbols to make very complex generative works.

- `That #anima# bit that #animal#!`
- `That elephant bit that snake!`

### Modifiers

Modifiers are transformations that attach to a symbol to change them, they take the form of a `.` and then the thing you want to do to them, and look like this:

- `#everspace.capitalize#`

#### Base Modifiers
The base modifiers that are always available are as follows

- `.quote`
  - `#everspace.quote# => "everspace"`
- `.capitalize`
  - `#everspace.capitalize# => Everspace`
- `.capitalizeAll`
  - `#everspace.capitalizeAll# => EVERSPACE`
- `.comma`
  - `#everspace.comma# => everspace,`
- `.a`
  - `#everspace.a# => a everspace`
  - `#orb.a# => an orb`
- `.s` (tries to do proper plurals, it may get confused)
  - `#everspace.s# => everspaces`
  - `#wolf.s# => wolves`
  - `#fox# => foxen`
  - `#fry# => fries`
- `ed`
  - It certainly does something, I don't remember what.
- `er`
  - `#wonder.er# => wonderer`

#### Custom Modifiers
You can add more modifiers when you make a `new Grammar` by making a function that takes in a string and returns a new string.

```js
import { Grammar } from 'tracery-ts'

function double(theString) {
  return theString + theString
}

const myGrammar = new Grammar({
  grammar,
  modifiers: {
    double
  }
})

grammer.trace('#everspace.double#') // everspaceeverspace
```

### Tags

Tags can be used to set symbols for other symbols. Take for example the following grammar:

```yaml
# grammar.yaml
weird: [zoops, hooga, weee wooo]
normal: [hi, hello, greetings]
helloWorld: '#greeting.capitalize# World!'
```

You could use a tag to set the greeting and it looks like this
- `#[greeting:#normal#]helloWorld#`

And would make something like:
- `Hi World!`
- `Hello World!`

But you could also go...
- `#[greeting:#weird#]helloWorld#`

And get:
- `Zoops World!`
- `Weee wooo World!`

## `class Grammar`
### `new Grammar(opts: GrammarOptions)`
The grammar takes an object (`GrammarOptions`) with the following:

- `grammar` The grammar is an object that has a bunch of `#symbols#`, to one or more pieces of text. This is easily stored as a JSON or YAML to edit quickly
- `modifiers: Record<string, ModifierFunction>` An object to make new modifiers available.
- `seed: string` This sets the random generator so that the same things get chosen again, otherwise it is random every time you create a new Grammar!

### `trace(raw: string)`
Turns a given string with symbols in it into a new string following the grammar

### `*generateMany(raw: number, request: string, tryLimit?: number): Generator<string>`

This works like `trace()` execpt it makes a lot of unique results.

```ts
for (const result of myGrammar.generateMany(10, '#origin#')) {
  console.log(result) // Happens 10 times if it can
}

// Make an array with 100 unique results
const results = Array.from(myGrammar.generateMany(100, '#origin#'))
```

However if the grammar is not complex enough to generate enough unique results, it throws a `GrammarExhaustedError` so watch out!

This is not often a concern, and it has only happened to me once or twice when trying to make 1000s of things and was easy to solve with just adding more options!

### `addGrammar()`, `popGrammar()`, `pushGrammar()`, `removeGrammar()`

These add the concept of layers to a grammar. You can add or remove additional symbols to a grammar dynamically in your program.

Internally this is a stack, and it's the "most recent symbol added" that triumphs over the others.

You cannot remove the initial grammar used when the `Grammar` was created, so `popGrammar()` away without fear if you like.

## Projects Using tracery-ts

- Add your project here!

## Links

- [Tracery.io](http://tracery.io/) The original made by [GalaxyKate](http://www.galaxykate.com/)

## License

[Apache-2.0](./LICENSE) License © 2024-PRESENT [Everspace](https://github.com/everspace)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/tracery-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/tracery-ts
[npm-downloads-src]: https://img.shields.io/npm/dm/tracery-ts?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/tracery-ts
[bundle-src]: https://img.shields.io/bundlephobia/minzip/tracery-ts?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=tracery-ts
[license-src]: https://img.shields.io/github/license/everspace/tracery-ts.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/everspace/tracery-ts/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/tracery-ts
