import observe from "../reactivity/Observer"
import { reactive } from "../reactivity/reactive"

export default function initState (vm) {
  vm.$options.props && initProps(vm)
  vm.$options.methods && initMethods(vm)
  vm.$options.data && initData(vm)
}

function initData (vm) {
  let { data } = vm.$options
  data = vm._data = typeof data !== 'function'
    ? data ?? {}
    : data.call(vm)

  // 实现this读data
  reactive(data, false, vm)
  // 绑定响应式
  observe(data, true)
}

function initMethods (vm) {
  const { methods, props, data } = vm.$options

  checkDoubleName(methods, [props, data], ['methods与props属性命名有重复', 'methods与data属性命名有重复'])

  for (const name in methods) {
    const method = methods[name]
    vm[name] = typeof method === 'function' ? method.bind(vm) : () => {}
  }
}

function initProps (vm) {
  const { props, data } = vm.$options

  checkDoubleName(props, [data], ['props与data属性命名有重复'])

  vm._props = props
  reactive(props, false, vm)
}

function checkDoubleName (data, group, msg) {
  if (group.filter(_ => _).length === 0) return

  const keys = Object.keys(data)
  let i = keys.length

  while (i--) {
    const key = keys[i]
    for (let k = 0; k < group.length; k++) {
      if (group[k] && group[k].hasOwnProperty(key)) {
        throw new Error(msg[k])
      }
    }
  }
}