import { isEmptyObj$1 } from '../util'

const expresion = /\{\{(.*?)\}\}/g
const forReg = /\(?([a-zA-Z]*)(?:,\s)?([a-zA-Z]*)?(?:,\s)?([a-zA-Z]*)?\)?\sin\s([a-zA-Z]*)$/
const argsReg = /\(.*\)$/

export default function compile (el) {
  // _c('button',{key:g,attrs:{"id":"d"},on:{"click":add}},[_v("click")])
  let code = generateElement(el)

  return `with(this){return ${code}}`
}

function generateElement (el) {
  if (!el.tag) return `_c('div')`

  if (el['v-for'] && !el.forProcessed) {
    return handleFor(el)
    // value   key/index in obj/arr
    //  a[i]    i  
  }

  if (el['v-if'] && !el.ifProcessed) {
    return handleIf(el)
  }

  // _c('div',{ attrs:{ id: '#app' },on: {} },children)
  return `_c(
    '${el.tag}'
    ${handleData(el)}
    ${generateChildren(el.children)}
    )`
}

function handleFor (el) {
  el.forProcessed = true
  const [, value, a, b, origin] = forReg.exec(el['v-for'])

  return `_for(${origin}, (${value},${a},${b}) => ${generateElement(el)})`
}

function handleIf (el) {
  el.ifProcessed = true
  const value = el['v-if'] ?? el['v-else-if']

  return createUnaryExp(value, el, el.elseConditions)
}

function handleIfConditions (elseConditions) {
  if (!elseConditions.length) return `_empty()`

  const el = elseConditions.shift()

  if (el.hasOwnproperty('v-else')) {
    return generateElement(el)
  } else if (el.hasOwnproperty('v-else-if')) {
    return createUnaryExp(el['v-else-if'], el, elseConditions)
  }
}

function createUnaryExp (divide, el, elseConditions) {
  return `(${divide})?${generateElement(el)}:${handleIfConditions(elseConditions)}`
}

function generateChildren (children) {
  const el = children[0]
  if (children.length === 1 && el.for) {
    return ',' + generateElement(el)
  }

  let flat = false
  let code = []
  children.forEach(child => {
    if (child['v-for']) flat = true
    if (child.type === 1) code.push(generateElement(child)) // for --> []
    if (child.type === 3) code.push(generateText(child))
  })

  // _c('div')
  // [_c('div'),_c('div'),_c('div')]
  return code.length > 0 ? `,[${code.join(',')}],${flat}` : ''
}

function generateText ({ text }) {
  const len = text.length
  let pos = 0
  let stack = []
  let match, i

  while ((match = expresion.exec(text)) || pos < len) {
    i = match?.index ?? len

    if (pos < i) {
      stack.push(`'${text.slice(pos, i)}'`)
      pos += i
    }

    if (match) {
      stack.push(`_dtxt(${match[1].trim()})`)
      pos += match[0].length
    }
  }

  // sdsd{{sd}}fds
  // {{sd}}as
  // _txt('dddd')+'xxxx'+_txt('ssss')
  // ddddxxxxssss
  return `_txt(${stack.join('+')})`
}

function handleData (el) {
  const { attrs, dynamicAttrs, events } = el

  let data = ''

  if (el['v-show']) {
    data += `show:${!!el['v-show']},`
  }

  data += handledomProps(el)

  if (attrs.length || !isEmptyObj$1(dynamicAttrs)) {
    data += handleAttrs(attrs, dynamicAttrs)
  }

  if (!isEmptyObj$1(events)) {
    data += handleEvents(events)
  }

  return data ? `,{${data.slice(0, -1)}}` : ''
}

function handledomProps (el) {
  let domProps = ''

  if (el['v-model']) {
    const value = el['v-model']

    domProps += `value:${value},`
    // 有同名会进行覆盖
    el.events['input'] = `($event) => {${value}=$event.target.value}` // 闭包 value
  }

  if (el['v-text']) {
    domProps += `textContent: ${el['v-text']},`
  }

  if (el['v-html']) {
    domProps += `innerHTML: ${el['v-html']},`
  }

  return domProps ? `domProps:{${domProps.slice(0, -1)}},` : ''
}

function handleAttrs (attrs, dynamicAttrs) {
  let data, _key
  data = _key = ''

  attrs.forEach(({ key, value }) => {
    if (key === 'class') { // class可以叠加
      data += `"staticClass":"${value}",`
    } else if (!dynamicAttrs.hasOwnProperty(key)) {
      data += `"${key}":"${value}",`
    }
  })

  Object.keys(dynamicAttrs).forEach(key => {
    key !== 'key'
      ? data += `"${key}":${dynamicAttrs[key]},`
      : _key = `key:${dynamicAttrs.key},`
  })

  return `${_key}` + (data ? `attrs:{${data.slice(0, -1)}},` : '')
}

function handleEvents (events) {
  let data = ''
  Object.keys(events).forEach(name => {
    data += `"${name}":${handleEvent(events[name])},`
  })

  return `on:{${data.slice(0, -1)}},`
}

function handleEvent (value) {
  return argsReg.test(value)
    ? `function($event){${value}}`
    : value
}