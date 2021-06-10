import { isDef } from '../util'
import { updateData } from './source'
import updateChildren from './updateChildren'

export default function patchVnode (oldVnode, newVnode) {
  const elm = (newVnode.elm = oldVnode.elm) // 复用

  //文本节点
  if (isDef(newVnode.text)) {
    newVnode.text !== oldVnode.text && (elm.textContent = newVnode.text)
    return
  } else if (isDef(oldVnode.text)) {
    elm.textContent = ''
    return
  }

  // 旧的没有孩子，新的有  生成新的孩子
  // 旧的没有孩子，新的没有，不管
  // 旧的有孩子，新的没有，移除
  // 旧的有孩子，新的有，对比
  // 排除都没有孩子的
  const oldCh = oldVnode.children
  const newCh = newVnode.children
  if (isDef(oldCh) && isDef(newCh)) {
    updateChildren(elm, oldCh, newCh)
  }

  // 更新dom
  if (isDef(newVnode.data)) {
    for (let i = 0; i < updateData.length; i++) {
      updateData[i](oldVnode, newVnode)
    }
  }
}
