import { isDef, isObj, isReservedTag, matchVariousName } from "../util"
import { Vnode, createTextVnode, emptyVnode } from '../vnode/Vnode'

/**
 * @param a tag
 * @param b data
 * @param c childrn
 * @param d flat
 * @returns vnode
 */
const createElement = (vm, a, b, c, d) => {
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

  let Ctor
  if (isReservedTag(a)) {
    return new Vnode(a, b, c, undefined, undefined, vm)
  } else if (isDef(Ctor = getComponentCtor(vm.$options, a))) {
    return createComponentVnode(vm, Ctor, b, c)
  }
}

function getComponentCtor (options, name) {
  const { components } = options
  // aaa-bb  aaaBb
  for (let i = 0, l = matchVariousName.length; i < l; i++) {
    let Ctor
    const variousName = matchVariousName[i](name)
    if (Ctor = components[variousName]) {
      return Ctor
    }
  }

  throw new Error(`没有找到组件 ${name} , ${options}`)
}

function createComponentVnode (vm, Ctor, data, children) {
  if (!isDef(Ctor)) return

  if (isObj(Ctor)) {
    Ctor = vm._base.extend(Ctor)
  }

  const tagName = `vue-component-${Ctor.id}`
  const propsData = extractPropsData(data?.attrs, Ctor.options.props)
  // 里面包含了 emit的外部 vm 的方法
  // 保存到 componentOptions里面
  // 后续可以查找children 有没有绑定同名的方法，
  // 然后把方法赋值绑定给children
  const listener = data?.on

  if (data?.show || data?.domProps) {
    console.warn('组件没有根节点，所以组件上的 v-show, v-html, v-text 将会失效。')
  }

  return new Vnode(
    tagName,
    data,
    undefined,
    undefined,
    undefined,
    vm,
    { Ctor, propsData, listener, children }
  )
}

/**
 * @param attrs 组件标签上传递的属性
 * @param propsData 组件内部的接收的props
 */
function extractPropsData (attrs, propsData) {
  if (!attrs) return
  const res = {}

  // 只保留传递的数据
  for (const key in attrs) {
    if (key in propsData) {
      res[key] = attrs[key]
    }
  }

  return res
}

export function initRender (vm) {
  vm._vnode = null
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d)
  vm.$createElement = createElement
}

export class baseVue {
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

  _slotTemp (scopedSlots) {
    const res = {}

    scopedSlots.forEach(({ key, fn }) => {
      res[key] = fn
    })

    return res
  }

  _slot (name, fallback, props) {
    const scopedSlots = this.$scopedSlots

    if (!scopedSlots[name]) {
      return fallback
    }

    if (Array.isArray(scopedSlots)) {
      // vnode里面的children
      return scopedSlots
    }
    return scopedSlots[name](props)
  }
}