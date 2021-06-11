import observe from '../reactivity/Observer'
import { option, reactive } from '../reactivity/reactive'
import Watcher from '../reactivity/Watcher'
import { isDef, isObj, isServerRendering, mergeObj } from '../util'

export default function initState (vm) {
  const options = vm.$options
  options.props && initProps(vm)
  options.methods && initMethods(vm)
  options.data && initData(vm)
  options.computed && initComputed(vm)
  options.watch && initWatch(vm)
}

function initData (vm) {
  let { data } = vm.$options
  data = vm._data = typeof data !== 'function' ? data ?? {} : data.call(vm)

  if (!isObj(data)) throw new Error('data should be an object')
  // 实现this读data
  reactive(data, false, vm)
  // 绑定响应式
  observe(data, true)
}

function initMethods (vm) {
  const { methods, props, data } = vm.$options

  checkDoubleName(
    methods,
    [props, data],
    ['methods 与 props 属性命名有重复', 'methods 与 data 属性命名有重复']
  )

  for (const name in methods) {
    const method = methods[name]
    vm[name] = typeof method === 'function' ? method.bind(vm) : () => {}
  }
}

function initProps (vm) {
  const { props, data } = vm.$options

  checkDoubleName(props, [data], ['props 与 data 属性命名有重复'])

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
        throw new Error(`key, ${msg[k]}`)
      }
    }
  }
}

function initComputed (vm) {
  const { computed, data, props, methods } = vm.$options

  checkDoubleName(
    computed,
    [data, props, methods],
    ['computed 和 data 命名重复', 'computed 和 props 命名重复', 'computed 和 methods 命名重复']
  )

  const cache = vm._computedCache = Object.create(null)

  Object.keys(computed).forEach(key => {
    const value = computed[key]
    let get = typeof value === 'function' ? value : value.get
    let set = value[set] ?? (() => { throw new Error('it has no setter') })
    // 缓存
    cache[key] = new Watcher(vm, get)

    //getter是否缓存
    get = isServerRendering()
      ? get.bind(vm, vm)
      : creatComputedGetter(key) //闭包key

    Object.defineProperty(vm, key, mergeObj(option, { get, set })
    )
  })
}

function creatComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedCache[key]
    if (isDef(watcher)) {
      return watcher.value
    }
  }
}

function initWatch (vm) {
  const { watch } = vm.$options

  Object.keys(watch).forEach(key => {
    let fn, opt
    const handler = watch[key]
    if (typeof handler === 'string') {
      fn = vm[handler]
    } else if (isObj(handler)) {
      fn = handler.handler
      opt = handler
    } else if (typeof handler === 'function') {
      fn = handler
    }

    vm.$watch(key, fn, opt)
  })
}