import { isDef } from '../util'
import { emptyVnode } from './Vnode'
import { updateData } from './source'

export default function createElm (vnode) {
  const { tag, data, children, text } = vnode
  if (isDef(text)) return (vnode.elm = document.createTextNode(text))
  if (!tag) return (vnode.elm = document.createComment(''))
  // 是组件
  if (tag.includes('vue-component')) {
    return createComponent(vnode)
  }

  let dom =
    tag === 'documentFragment'
      ? document.createDocumentFragment()
      : document.createElement(tag)

  vnode.elm = dom

  isDef(children) && createChildren(dom, children)

  if (isDef(data)) {
    for (let i = 0; i < updateData.length; i++) {
      updateData[i](emptyVnode, vnode)
    }
  }

  return dom
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

function createComponent (vnode) {
  let instance = vnode.componentInstance
  if (!instance) {
    instance = vnode.componentInstance = createComponentInstance(vnode)
  }

  instance.$mount()
  vnode.elm = instance.$el
}

function createComponentInstance (vnode) {
  const { Ctor } = vnode.componentOptions
  const options = {
    _isComponent: true,
    _selfVnode: vnode
  }

  return new Ctor(options)
}
