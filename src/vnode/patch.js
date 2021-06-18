import { Vnode } from "./Vnode"
import createElm from './createElm'
import patchVnode from './patchVnode'
import { sameVnode } from './source'
import { isDef } from "../util"

export default function patch (oldVnode, vnode) {
  // 没获取到 el // 创作组件的时候
  if (!isDef(oldVnode)) {
    return createElm(vnode)
  }

  const isRealDom = oldVnode.nodeType
  if (isRealDom) {
    oldVnode = new Vnode(oldVnode.tagName.toLowerCase(), {}, [], oldVnode)
  }

  if (!isRealDom && sameVnode(oldVnode, vnode)) {
    patchVnode(oldVnode, vnode)
  } else {
    const elm = createElm(vnode)
    replaceElm(oldVnode.elm, elm)
  }

  return vnode.elm
}

function replaceElm (oldElm, elm) {
  const parent = oldElm.parentNode
  if (parent) {
    const nextSibling = oldElm.nextSibling
    parent.insertBefore(elm, nextSibling)
    parent.removeChild(oldElm)
  }
}