import { isDef } from '../util'
import Dep from './Dep'

let wId = 0
const queue = []
const has = {}
Dep.target = null
export default class Watcher {
  constructor(vm, fn) {
    this.id = wId++
    this.deps = []
    this.depsId = new Set()
    this.vm = vm
    this.expression = fn.toString()
    this.newDeps = []
    this.newDepsId = new Set()
    this.getter = fn
    this.value = this.get()
  }

  get () {
    Dep.target = this

    try {
      console.log('执行render(),new watcher')
      this.getter.call(this.vm)
    } catch (e) {
      console.error(e, `\n${this.expression}`)
    }

    Dep.target = null
    this.clearDep()
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
    this.value = this.get()
  }

  update () {
    const id = this.id
    console.log(has,has[id],isDef(has[id]))
    if (!isDef(has[id])) {
      has[id] = true
      queue.push(this)
      Promise.resolve().then(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue () {
  for (let i = 0; i < queue.length; i++) {
    const watcher = queue[i]
    has[watcher.id] = null
    watcher.run()
  }
}