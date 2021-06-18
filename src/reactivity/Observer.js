import { isObj, mergeObj } from '../util'
import Dep from './Dep'
import { reactive, option } from './reactive'

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()

    // 给实例加上ob属性
    Object.defineProperty(value, '__ob__', mergeObj(option, { value: this, enumerable: false }))

    // 变成响应式
    reactive(value)
  }
}

export default function observe (value) {
  if (!isObj(value)) return

  if (!(value.__ob__ && value.__ob__ instanceof Observer)) {
    // 没有监视过
    new Observer(value)
  }
}