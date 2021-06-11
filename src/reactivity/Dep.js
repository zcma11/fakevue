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