import { mergeObj } from '../util'
import Dep from './Dep'
import observe from './Observer'

export const option = {
  configurable: true,
  enumerable: true
}

function createReactiveObject (obj, key, val, deep, customerSetter) {
  const dep = new Dep()
  // 递归绑定孩子
  deep && observe(val)
  const config = mergeObj(option, {
    get () {
      if (Dep.target) dep.depend()
      return val
    },
    set (newVal) {
      if (val === newVal) return
      
      if (customerSetter) {
        customerSetter()
      }

      val = newVal
      // 如果val是对象，然后被重置了，然后又是深度监视，那么需要重新绑定val
      // 如果val只是改了内部某个数据，不用管
      deep && observe(val)
      dep.notify()
    }
  })

  Object.defineProperty(obj, key, config)
}

export function reactive (obj, deep = false, customerSetter) {
  Object.keys(obj).forEach(key => {
    createReactiveObject(obj, key, obj[key], deep, customerSetter)
  })
}

export function proxy (target, data, key) {
  const config = mergeObj(option, {
    get () {
      return this[data][key]
    },
    set (val) {
      this[data][key] = val
    }
  })

  Object.defineProperty(target, key, config)
}