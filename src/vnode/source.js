import { isDef, createCache, isObj } from '../util'

export const updateData = [updateAttribute, updateDomListener, updateDomProps] // class, style, props/innerhtml, ref, show, directive
export const destroy = [updateDomListener]
export const sameVnode = (oldVnode, vnode) => {
  return (
    oldVnode.tag === vnode.tag &&
    oldVnode.key === vnode.key &&
    isDef(oldVnode.data) === isDef(vnode.data) &&
    sameInputType(oldVnode, vnode)
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') return true

  return a.data.attrs.type === b.data.attrs.type
}

function updateAttribute (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }

  let old, cur
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs ?? {}
  const newAttrs = vnode.data.attrs ?? {}

  pieceClass(newAttrs)
  pieceStyle(newAttrs)

  for (const key in newAttrs) {
    old = oldAttrs[key]
    cur = newAttrs[key]
    if (old !== cur) {
      elm.setAttribute(key, cur)
    }
  }

  // 重用之前的dom，vnode.elm = oldVnode.elm,所以要取消不要的属性
  for (const key in oldAttrs) {
    if (!newAttrs.hasOwnProperty(key)) {
      elm.removeAttribute(key)
    }
  }
}

function pieceClass (attrs) {
  if (!attrs.class && !attrs.staticClass) {
    return
  }

  let stc = attrs.staticClass ?? ''
  let dyn = attrs.class ?? {}

  dyn = Object.keys(dyn).filter(name => !!dyn[name])
  attrs.class = `${stc} ${dyn.join(' ')}`.trim()

  delete attrs.staticClass
}

function pieceStyle (attrs) {
  const style = attrs.style

  if (isObj(style)) {
    let str = ''

    Object.keys(style).forEach(name => {
      str += `${name}:${style[name]};`
    })

    attrs.style = str
  }
}

const handlerCache = createCache((_, config) => config)

function updateDomListener (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }

  const oldOn = oldVnode.data.on ?? {}
  const on = vnode.data.on ?? {}

  for (const name in on) {
    let fn = on[name]
    const old = oldOn[name]
    const config = {} // 储存解析结果 暂时 解析capture, once, passive
    handlerCache(name, config)

    if (!isDef(old)) {
      !isDef(fn.fns) && (fn = on[name] = baling(fn))
      addHandler(vnode.elm, name, fn, config)
    } else if (old !== fn) {
      // 改包装里面使用的函数，不用重新绑监听
      old.fns = fn
      on[name] = old
    }
  }

  for (const name in oldOn) {
    if (!isDef(on[name])) {
      const config = handlerCache(name)
      removeHandler(vnode.elm, oldOn[name], old, config)
    }
  }
}

function baling (fn) {
  function wrapper () {
    const f = wrapper.fns
    f.apply(this, arguments)
  }
  wrapper.fns = fn
  return wrapper
}

function addHandler (target, name, handler, config) {
  handler._wrap = function (e) {
    handler.call(this, e)
  }

  target.addEventListener(name, handler._wrap, config)
}

function removeHandler (target, name, handler, config) {
  target.removeEventListener(name, handler._wrap, config)
}

function updateDomProps (_, vnode) {
  const domProps = vnode.data.domProps
  if (!domProps) {
    return
  }

  for (const name in domProps) {
    vnode.elm[name] = domProps[name].toString()
  }
}
