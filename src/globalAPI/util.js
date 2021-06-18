import { isReservedTag } from '../util'

export function vaildateComponentName (name) {
  if (!/^[a-zA-Z][\-a-zA-Z0-9]*$/.test(name) || isReservedTag(name)) {
    throw new Error('组件名字不合规定')
  }
}
