let DepId = 0
export default class Dep {
  constructor() {
    this.subs = []
    this.id = DepId++
  }

  addSub () {
    this.subs.push(Dep.target)
  }

  removeSub (sub) {
    let i = this.subs.indexOf(sub)
    if (i > -1) this.subs.splice(i, 1)
  }

  depend () {
    if (Dep.target) {//watcher
      Dep.target.addDep(this)
    }
  }

  notify () {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}

// get --> render() new watch() --> get()render执行时获取了需要的数据 --> Dep()代表整个data --> dep里面添加了watcher，watcher里面有update --> watcher代表了什么
// dep代表data，watcher代表引用 --> dep.depend 收集watcher，就是render --> watcher.add 收集dep