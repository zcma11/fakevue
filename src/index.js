import { query, isEmptyObj$1 } from './util'
import parse from './compiler/parse'
import initState from './init/initState'
import initEvents from './init/initEvents'
import { initRender, baseVue } from './init/initRender'
import compile from './compiler/complie'
import Watcher from './reactivity/Watcher'
import createRenderFunction from './compiler/render'
import patch from './vnode/patch'

let id = 0
export default class FakeVue extends baseVue {
  constructor(options = {}) {
    super()
    this.id = id++
    this._vue = FakeVue
    this.$options = options
    this.$root = this
    this.init(options)
  }

  init (options) {
    if (isEmptyObj$1(options)) return

    // beforecreate

    initState(this)
    initEvents(this)
    initRender(this)

    // created

    if (options.el) {
      this.$mount(options.el)
    }
  }

  $mount (el) {
    el = query(el)
    this.$el = el
    const ast = parse(el.outerHTML, el.parentElement, el.nextSibling)
    console.log(ast)
    // 生成render
    // 执行render收集依赖
    // render生成vnode 然后对比 然后渲染成真正的dom
    // 这样依赖改变下次执行时就是自动生成vnode然后到真实dom，自动调用render
    if (!this.$options.render) {
      const code = compile(ast, this.$options)
      const render = createRenderFunction(code)
      // Vue.prototype._render
      // this.render 是options里面的用户传入的模板渲染方法。二选一。
      this.$options.render = render
    }

    // beforeMount

    const autoRun = () => {
      this._update(this._render())
    }

    this._watcher = new Watcher(this, autoRun)
  }

  _render () {
    const render = this.$options.render
    return render.call(this, this.$createElement)
  }

  _update (vnode) {
    console.log('vm._render():vnode: ',vnode)
    // 更新保存的vnode
    const oldVnode = this._vnode
    this._vnode = vnode

    if (!oldVnode) {
      this.$el = patch(this.$el, vnode)
    } else {
      this.$el = patch(oldVnode, vnode)
    }
  }

  $watch (key, cb, options = {}) {
    let getter
    if (typeof key === 'string') { //'a','a.b.c'
      getter = parsePath(key)
    } else if (typeof key === 'function') {
      getter = key
    }

    // watcher 保存了getter方法， 内部value = getter() 相关的data的dep里面保存了watcher
    // dep更新通知 watcher 执行value = getter(),之后会执行 cb
    const watcher = new Watcher(this, getter, cb, options)
    // immediate 立即执行一次 cb
    if (options.immediate) {
      try {
        cb.call(this, watcher.value)
      } catch (err) {
        console.warn(err, `\n${cb}`)
      }
    }

    return function unwatch () {
      watcher.unwatch
    }
  }
}

function parsePath (exp) {
  const keys = exp.split(`.`)
  return function getter (val) {
    keys.forEach(k => val = val[k])
    return val
  }
}