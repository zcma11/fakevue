export class Vnode {
  constructor(tag, data, children, elm, text) {
    this.tag = tag
    this.data = data
    this.children = children
    this.key = data?.key
    this.text = text
    this.elm = elm
  }
}

export const createTextVnode = text =>
  new Vnode(undefined, undefined, undefined, undefined, text)

export const emptyVnode = new Vnode(undefined, {}, [])