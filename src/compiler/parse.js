import { isDef, makeMap } from '../util'
import { createASTElement, createASTText } from './source'

const startTagReg = /^\<[\s\n]*([a-zA-Z1-6]+)[\s\n]*(.*?)[\s\n]*>/s
const endTagReg = /^\<\/(.*?)>/
const commontReg = /^\<\!--(.*?)--\>/s
const attrsReg = /[\s\n]*([@#:\-a-zA-Z]+)(?:=['"](.*?)['"])?/g
const directives = makeMap('if,for,else,elseif,model,text,html')
const vueDirectiveReg = /^v-|^@|^:/
const bindReg = /(?:^v-bind:|^:)(.*)/
const onReg = /(?:^v-on:|^@)(.*)/
const unaryTag = makeMap('area,base,br,embed,frame,hr,img,input,link,meta')

function parseHTML (html, { startTag, closeTag, parseText }) {
  html = html.trim()
  let stack = []
  let pos = 0
  let current
  while (html) {
    if (html[0] === '<') {
      // 是注释
      if ((current = commontReg.exec(html))) {
        const comment = current[0]
        through(comment.length)
        continue
      }
      // 是标签
      if ((current = startTagReg.exec(html))) {
        const info = parseStartTag(current)
        // 处理属性指令，生成element对象
        startTag(info)
        through(current[0].length)

        // 自闭合标签
        if (unaryTag(info.tag)) {
          info.end = pos
          stack.length--
          closeTag(info)
        }
        continue
      }
      // 是标签结束
      if ((current = endTagReg.exec(html))) {
        through(current[0].length)
        const info = parseEndTag()
        // 拼成 tree
        closeTag(info)
        continue
      }
    }

    // < 开头的文本
    // 文本 sd<fefg<
    let start = pos
    let text = ''
    let end, rest

    do {
      end = html.indexOf('<', 1) // < 出现的位置
      if (end < 0) break
      rest = html.slice(end) // < 之后的
    } while (
      !startTagReg.test(rest) &&
      !endTagReg.test(rest) &&
      !commontReg.test(rest)
    )

    text += html.slice(0, end) // < 之前的
    through(text.length)
    parseText({ text, start, end: pos })
  }

  function through (n) {
    pos += n
    html = html.slice(n)
  }

  function parseStartTag () {
    const attrs = parseAttribute(current[2])
    const info = {
      tag: current[1].toLowerCase(),
      attrs,
      start: pos,
      end: undefined
    }

    stack.push(info)
    return info
  }

  function parseEndTag () {
    const tag = current[1]
    const info = stack.pop()

    if (info.tag !== tag) {
      throw new Error(`${info.tag} 或 ${tag} 标签不闭合`)
    }

    info.end = pos
    return info
  }

  function parseAttribute (attrs) {
    const result = []
    let attr
    while ((attr = attrsReg.exec(attrs))) {
      result.push({ key: attr[1], value: attr[2] ?? '' })
    }

    return result
  }
}

export default function parse (html, currentParent) {
  if (!html) return createASTElement('div', currentParent)

  let stack = []
  let root

  parseHTML(html, { startTag, closeTag, parseText })

  function startTag ({ tag, attrs, start, end }) {
    // v-model v-bind: v-on: @ :
    const element = createASTElement(tag, currentParent, attrs, start, end)
    processAttribute(element)
    currentParent = element
    stack.push(element)
    !root && (root = element)
  }

  function closeTag ({ end }) {
    currentParent.end = end
    stack.length--
    const lasest = stack[stack.length - 1]
    if (lasest) {
      processIfConditions(lasest.children, currentParent) ||
        lasest.children.push(currentParent)

      currentParent = lasest
    }
  }

  // 传进去children 在里面从最后一个开始找
  function processIfConditions (sibling, element) {
    let i = sibling.length
    let hasElse = isDef(currentParent['v-else']) || isDef(currentParent['v-else-if'])

    if (hasElse) {
      let prev
      while (i--) {
        prev = sibling[i]
        if (prev['v-if']) {
          prev.elseConditions.push(element)
          i++
          break
        } else {
          console.error(
            '注意是否缺少v-if, 同时v-if,v-else,v-if-else必须连着，' +
            '中间的其他元素 ${prev.tag ?? prev.text} 会被忽略'
          )
        }
      }
    }

    sibling.length = i
    return hasElse
  }

  function parseText (info) {
    if (!info.text.trim()) return
    const textElement = createASTText(info, currentParent)
    currentParent.children.push(textElement)
  }

  function processAttribute (element) {
    const { attrs } = element

    // element.dynamicAttrs.key = ''
    attrs.forEach(({ key, value }, index) => {
      let attr

      if ((attr = bindReg.exec(key))) {
        processBind(attr, value)
      } else if ((attr = onReg.exec(key))) {
        processOn(attr, value)
      } else if (attr = directives(key.slice(2))) {
        if (key === 'v-model' && element.tag !== 'input') return
        processDirecetive(key, value)
      }

      attr && (attrs[index] = null)
    })

    element.attrs = attrs.filter(attr => !!attr)

    function processBind ([, name], dynamicValue) {
      // type = 'bind'
      element.dynamicAttrs[name] = dynamicValue
    }

    function processOn ([, eventType], methodName) {
      // type = 'on'
      element.events[eventType] = methodName
    }

    function processDirecetive (type, value) {
      element[type] = value

      // 有if 放入块中，块
      if (type === 'v-if') {
        element.elseConditions = []
      }
    }
  }

  return root
}
