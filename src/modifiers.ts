// TODO: use Intl here instead.

function isConsonant(c: string): boolean {
  c = c.toLowerCase()
  switch (c) {
    case 'a':
      return false
    case 'e':
      return false
    case 'i':
      return false
    case 'o':
      return false
    case 'u':
      return false
  }
  return true
};

function capitalizeAll(s: string): string {
  return s.replace(/(?:^|\s)\S/g, (a) => {
    return a.toUpperCase()
  })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function quote(s: string): string {
  return `"${s}"`
}

function comma(s: string): string {
  const last = s.charAt(s.length - 1)
  if (last === ',')
    return s
  if (last === '.')
    return s
  if (last === '?')
    return s
  if (last === '!')
    return s
  return `${s},`
}

function a(s: string): string {
  if (!isConsonant(s.charAt(0)))
    return `an ${s}`
  return `a ${s}`
}

function s(str: string): string {
  const last = str.at(-1)

  switch (last) {
    case 'y':
      // rays, convoys
      if (!isConsonant(str.charAt(str.length - 2))) {
        return `${str}s`
      }
      // harpies, cries
      else {
        return `${str.slice(0, str.length - 1)}ies`
      }
    case 'f':
      // wolves
      return `${str.slice(0, str.length - 1)}ves`
      // oxen, boxen, foxen
    case 'x':
      return `${str.slice(0, str.length - 1)}en`
    case 'z':
      return `${str.slice(0, str.length - 1)}es`
    case 'h':
      return `${str.slice(0, str.length - 1)}es`

    default:
      return `${str}s`
  };
}

function er(str: string): string {
  const char = str.at(-1)
  switch (char) {
    case 'e':
      return `${str}r`

    default:
      return `${str}er`
  }
}

function ed(str: string): string {
  const index = str.indexOf(' ')
  let rest = ''
  let s = str
  if (index > 0) {
    rest = s.substring(index, s.length)
    s = s.substring(0, index)
  }

  const last = s.charAt(s.length - 1)

  switch (last) {
    case 'y':
      // raied, convoied
      if (isConsonant(s.charAt(s.length - 2))) {
        return `${s.slice(0, s.length - 1)}ied${rest}`
      }
      // harpied, cried
      else {
        return `${s}ed${rest}`
      }
    case 'e':
      return `${s}d${rest}`

    default:
      return `${s}ed${rest}`
  };
}

export const baseModifiers = {
  quote,
  capitalize,
  capitalizeAll,
  comma,
  a,
  s,
  ed,
  er,
}
