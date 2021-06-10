import { isDef } from '../util'
import { emptyVnode } from './Vnode'
import { updateData } from './source'

export default function createElm (vnode) {
  const { tag, data, children, text } = vnode
  if (!tag) return vnode.elm = document.createTextNode(text)

  let dom = document.createElement(tag)
  vnode.elm = dom

  isDef(children) && createChildren(dom, children)

  if (isDef(data)) {
    for (let i = 0; i < updateData.length; i++) {
      updateData[i](emptyVnode, vnode)
    }
  }
}

function createChildren (parent, children) {
  children.forEach(child => {
    // vnode
    if (child) {
      createElm(child)
      parent.appendChild(child.elm)
    }
  })
}
