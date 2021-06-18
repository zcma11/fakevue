import { isDef } from '../util'
import createElm from './createElm'
import patchVnode from './patchVnode'
import { sameVnode, destroy } from './source'
import { emptyVnode } from './Vnode'

export default function updateChildren (parentElm, oldCh, newCh) {
  let oldStartIdx = 0,
    newStartIdx = 0,
    oldEndIdx = oldCh.length - 1,
    newEndIdx = newCh.length - 1,
    oldStartVnode = oldCh[0],
    newStartVnode = newCh[0],
    oldEndVnode = oldCh[oldEndIdx],
    newEndVnode = newCh[newEndIdx]

  // oldCh为空 0, -1 newCh有值 0, n
  // newCh为空 0, -1 oldCh有值 0，n
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (!isDef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]
    } else if (!isDef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // 新前旧前
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // 新后旧后
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // 新后旧前
      patchVnode(oldStartVnode, newEndVnode)
      // 更新位置
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // 新前旧后
      patchVnode(oldEndVnode, newStartVnode)
      // 更新位置
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newEndIdx]
    } else {
      // 用新的第一个去匹配旧的
      const idx = findSameVnode(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

      if (idx) {
        patchVnode(oldCh[idx], newStartVnode)
        oldCh[idx] = null
      } else {
        createElm(newStartVnode)
      }
      // 更新位置
      parentElm.insertBefore(newStartVnode.elm, oldStartVnode.elm)
      newStartVnode = newCh[++newStartIdx]
    }
  }

  if (oldStartIdx > oldEndIdx) {
    // 旧节点先匹配完
    // 新增
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      const elm = newCh[i]
      createElm(elm)
      newCh[newEndIdx + 1]
        ? parentElm.insertBefore(elm, newCh[newEndIdx + 1].elm)
        : parentElm.appendChild(elm)
    }
  } else if (newStartIdx > newEndIdx) {
    // 新节点先匹配完
    // 删除 解绑事件，移除dom
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      // 可能为null
      oldCh[i] && removeElm(parentElm, oldCh[i])
    }
  }
}

function findSameVnode (vnode, oldCh, start, end) {
  for (let i = start; i < end; i++) {
    if (oldCh[i] && sameVnode(oldCh[i], vnode)) {
      return i
    }
  }
}

function removeElm (parent, oldVnode) {
  const elm = oldVnode.elm

  if (elm.nodeType === 1) { // 文本直接去除
    for (let i = 0; i < destroy.length; i++) {
      destroy[i](oldVnode, emptyVnode)
    }
  }

  parent.removeChild(elm)
}