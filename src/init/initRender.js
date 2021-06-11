import { isDef, isObj } from "../util"
import { Vnode, createTextVnode, emptyVnode } from '../vnode/Vnode'

const createElement = (a, b, c, d) => {// tag,data,children,flat 
  if (typeof a !== 'string') throw new Error('the first param must be a string')

  if (isObj(b) && (isDef(c) && !Array.isArray(c))) {
    throw new Error('children must be an array')
  } else if (Array.isArray(b)) {
    if (!d) {
      d = c
      c = b
      b = undefined
    } else {
      throw new Error('data must be an object, children must be an array')
    }
  }

  d && (c = c.flat())
  return new Vnode(a, b, c, undefined, undefined)
}

const protect = function (name, ref) {
  const get = () => this[ref]
  const set = () => console.warn(`${name} is readonly`)
  Object.defineProperty(this, name, { get, set })
}

export function initRender (vm) {
  vm._vnode = null
  vm._c = (a, b, c, d) => createElement(a, b, c, d)
  vm.$createElement = createElement
}

export class baseVue {
  constructor() {
    console.log(this)
    protect.call(this, '$data', '_data')
    protect.call(this, '$props', '_props')
    // protect.call(this, '$createElement', '_props')
  }

  _txt (text) {
    return createTextVnode(text)
  }

  _dtxt (variable) {
    return variable == null
      ? ''
      : Array.isArray(variable) || isObj(variable)
        ? JSON.stringify(variable)
        : variable.toString()
  }

  _for (data, fn) {
    let vnodes = []

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        vnodes.push(fn(item, index))
      })
    } else if (isObj(data)) {
      Object.keys.forEach((key, index) => {
        vnodes.push(fn(data[key], key, index))
      })
    } else if (typeof data === 'number') {
      for (let i = 0; i < data; i++) {
        vnodes.push(fn(i))
      }
    }

    return vnodes
  }

  _empty () {
    return emptyVnode
  }
}