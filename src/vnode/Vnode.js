export class Vnode {
  constructor(tag, data, children, elm, text, vm, componentOptions) {
    this.tag = tag
    this.data = data
    this.children = children
    this.key = data?.key
    this.text = text
    this.elm = elm
    this.vm = vm
    this.componentOptions = componentOptions
    this.componentInstance = undefined
  }
}

export const createTextVnode = text =>
  new Vnode(undefined, undefined, undefined, undefined, text)

export const emptyVnode = new Vnode(undefined, {}, [])