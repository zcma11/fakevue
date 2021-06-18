import { isObj, mergeObj } from "../util"

export function initComponentOptions (Ctor, options) {
  // opt原型上有data props methods等组件配置
  const opt = Object.create(Ctor.options)
  const parentVnode = opt._selfVnode = options._selfVnode //Vnode
  const { propsData, children, listener, tag, render } = parentVnode.componentOptions
  opt.propsData = propsData
  opt._children = children
  opt._listener = listener
  opt._componentTag = tag

  if (render) {
    opt.render = render
  }
  return opt
}

export function mergeOptions (parent, child) {// 静态属性, 传入的options
  const opt = {}

  normalizeProps(child) // 统一props的形式，生成实例init的时候再检查

  for (const key in parent) {
    if (key === 'components') {
      opt[key] = Object.create(parent[key]) // 原型是全局注册组件
      mergeObj(child[key], opt[key])
    } else {
      opt[key] = parent[key]
    }
  }

  for (const key in child) {
    if (!Object.hasOwnProperty.call(parent, key)) {
      opt[key] = child[key]
    }
  }

  return opt
}

function normalizeProps (options) {
  const props = options.props
  if (!props) return

  const _props = {}
  if (Array.isArray(props)) { // props: ['xxx']
    for (let i = props.length - 1; i >= 0; i--) {
      const key = props[i]
      if (typeof key === 'string') {
        _props[key] = { type: null }
      } else {
        throw new Error('props使用数组一定要放字符串')
      }
    }
  } else if (isObj(props)) { // props: { xxx: { type: String } }
    for (const key in props) {
      const val = props[key]
      _props[key] = isObj(val) ? val : { type: val }
      // 用 instanceof 验证
    }
  } else {
    throw new Error('组件 props 配置不正确，需要对象或者数组')
  }

  options.props = _props
}