import { isDef, noop } from '../util'
import Dep from './Dep'

let wId = 0
const queue = []
let has = {}
let waiting = false
Dep.target = null
export default class Watcher {
  constructor(vm, getter, cb = noop, options) {
    this.id = wId++
    this.active = true
    this.vm = vm
    this.expression = getter.toString()
    // 管理依赖
    this.deps = []
    this.depsId = new Set()
    this.newDeps = []
    this.newDepsId = new Set()
    this.getter = getter // 获取值的函数 || vm._update(vm._render())
    // $watch 的参数
    this.cb = cb
    this.deep = !!options?.deep
    this.immediate = !!options?.immediate
    this.value = this.get()
  }

  get () {
    Dep.target = this

    const vm = this.vm
    let value
    try {
      console.log('value = watcher.getter()')
      value = this.getter.call(vm, vm)
    } catch (e) {
      console.error(e, `\n${this.expression}`)
    }

    Dep.target = null
    this.clearDep()
    return value
  }

  addDep (dep) {
    const id = dep.id
    if (!this.newDepsId.has(id)) {
      this.newDeps.push(dep)
      this.newDepsId.add(id)
      if (!this.depsId.has(id)) {
        dep.addSub(this)
      }
    }
  }

  clearDep () {
    let i = this.deps.length
    while (i--) {
      let dep = this.deps[i]
      if (!this.newDepsId.has(dep.id)) {
        dep.removeSub(this)
      }
    }

    let temp = this.depsId
    this.depsId = this.newDepsId
    this.newDepsId = temp
    this.newDepsId.clear()
    temp = this.deps
    this.deps = this.newDeps
    this.newDeps = temp
    this.newDeps.length = 0
  }

  run () {
    const value = this.get()
    // 对比有变化就执行回调
    const oldVal = this.value
    // deep 发生了变化无论相不相等都执行回调
    if (oldVal !== value || typeof value === 'object' || this.deep) {
      this.value = value

      const cb = this.cb
      try {// cb在$watch里可能传入非函数
        cb.call(this.vm, oldVal, value)
      } catch (err) {
        console.warn(err, `\nwatcher callback: ${cb}`)
      }
    }
  }

  update () {
    const id = this.id

    if (!isDef(has[id])) {
      has[id] = true
      queue.push(this)
      if (!waiting) {
        waiting = true
        // 开启微任务 宏任务执行完 queue添加完调用
        Promise.resolve().then(flushSchedulerQueue)
      }
    }
  }

  unwatch () {
    if (!active) return // 去除后再次调用

    // 数值变化调用依赖时执行回调，deps是最新的，watcher实例生成完毕
    let i = this.deps.length
    while (i--) {
      this.deps[i].removeSub(this)
    }
  }

  depend () {
    var i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
}

function flushSchedulerQueue () {
  // 按照 new watcher的顺序排列，更新队列顺序可能是打乱的
  queue.sort((a, b) => a.id - b.id)
  for (let i = 0; i < queue.length; i++) {
    const watcher = queue[i]
    watcher.run()
  }

  // 重置
  has = {}
  queue.length = 0
  waiting = false
}