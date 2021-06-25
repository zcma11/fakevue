import observe from '../reactivity/Observer'
import { option, proxy, reactive } from '../reactivity/reactive'
import Watcher from '../reactivity/Watcher'
import { isDef, isObj, isServerRendering, mergeObj, noop } from '../util'
import { isUpdatingComponents } from '../vnode/updateComponents'
import Dep from '../reactivity/Dep'

export function initState (vm) {
  const { props, methods, data, computed, watch } = vm.$options
  props && initProps(vm)
  methods && initMethods(vm)
  data && initData(vm)
  computed && initComputed(vm)
  watch && initWatch(vm)
}

function initData (vm) {
  let { data } = vm.$options
  data = vm._data = typeof data !== 'function' ? data ?? {} : data.call(vm)

  if (!isObj(data)) throw new Error('data should be an object')
  // 实现this读data
  for (const key in data) {
    proxy(vm, '_data', key)
  }
  // 绑定响应式
  observe(data, true)
}

function initMethods (vm) {
  const { methods, props, data } = vm.$options

  if (!isObj(methods)) { throw new Error('methods should be an object') }

  checkDoubleName(
    methods,
    [props, data],
    ['methods 与 props 属性命名有重复', 'methods 与 data 属性命名有重复']
  )

  for (const name in methods) {
    const method = methods[name]
    vm[name] = typeof method === 'function' ? method.bind(vm) : noop
  }
}

function initProps (vm) {
  const { propsData, props, data } = vm.$options
  const _props = vm._props = {}

  if (!isObj(props)) { throw new Error('props should be an object') }

  checkDoubleName(props, [data], ['props 与 data 属性命名有重复'])

  for (const key in props) { // { a: { type:String, default:'' } }
    // 检查props的type
    const value = vaildateProp(props, key, propsData[key])
    // 检查类型没有问题就把值保存到_props,一会代理
    _props[key] = value
    // 变成响应式
    reactive(_props, true, () => { if (!isUpdatingComponents) throw new Error(`props不允许修改`) })

    if (!(key in vm)) { // 组件在原型绑过就不绑
      proxy(vm, '_props', key)
    }
  }
}

export function vaildateProp (props, key, value) {
  const { default: d, type, vaildator, required } = props[key] // {type: null}
  // 只对外部传入的值进行控制
  if (d) return d

  if (required && !isDef(value)) {
    throw new Error(`${key} is required, but not found`)
  }

  if (type === undefined) {
    throw new Error('${key} --props type is required')
  }

  if (type) {
    const t = typeof value // 无法区分数组和对象，其他都可以区分
    const expectedType = getType(type).toLowerCase()

    // type:String, value: Object(String.prototype)
    // 这种情况判断是为 true
    if (
      (Array.isArray(value) && expectedType !== 'array') ||
      (expectedType !== t && !(value instanceof type))
    ) {
      throw new Error(
        `变量 ${key} 的类型是 ${t} 与预期类型 ${expectedType} 不匹配`
      )
    }
  }

  if (vaildator && !vaildator(value)) {
    throw new Error(`custom validator check failed for prop, ${key}: ${value}`)
  }

  return value
}

function getType (fn) {
  const match = fn.toString().match(/^function\s(\w+)/)
  return match ? match[1] : ''
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

  if (!isObj(computed)) { throw new Error('computed should be an object') }

  checkDoubleName(
    computed,
    [data, props, methods],
    ['computed 和 data 命名重复', 'computed 和 props 命名重复', 'computed 和 methods 命名重复']
  )

  // 缓存watcher，里面存了计算好的value，getter直接在这里找watcher
  const cache = vm._computedCache = Object.create(null)

  Object.keys(computed).forEach(key => {
    const value = computed[key]
    let get = typeof value === 'function' ? value : value.get
    // 缓存
    cache[key] = new Watcher(vm, get)

    if (!(key in vm)) { // 绑过就不绑
      // 不是组件是没有绑的，
      defineComputed(vm, key, value)
    }
  })
}

// 组件的computed和普通的computed的不同在于computed代理在实例还是原型
export function defineComputed (target, key, value) {
  let get = typeof value === 'function' ? value : value.get
  const set = value.set ?? (() => { console.error('it has no setter') })

  //getter是否缓存
  get = isServerRendering()
    ? createGetterInvoker(get) // 返回包裹的 call，因为target有时候不是vm 不方便直接 bind
    : creatComputedGetter(key) //闭包key

  Object.defineProperty(target, key, mergeObj(option, { get, set }))
}

function createGetterInvoker (fn) {
  return function getter () {
    fn.call(this, this) //this指向调用的 vm
  }
}

function creatComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedCache[key]
    if (isDef(watcher)) {
      if (Dep.target) {
        watcher.depend();
      }
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