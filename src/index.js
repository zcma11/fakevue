import { query, isEmptyObj$1, isDef, parsePath } from './util'
import { initState } from './init/initState'
import initEvents from './init/initEvents'
import { initRender, baseVue } from './init/initRender'
import Watcher from './reactivity/Watcher'
import patch from './vnode/patch'
import initGlobalAPI from './globalAPI'
import { initComponentOptions, mergeOptions } from './init/initOptions'
import compiler from './compiler'
import { stateMixin } from './init/init'

let id = 0
class FakeVue extends baseVue {
  constructor(options = {}) {
    super()
    this.id = id++
    this._self = this
    this.$root = this
    this.$parent = options._parent
    this.$children = []
    this.$ref = {}
    this.init(options)
  }

  init (options) {
    if (isEmptyObj$1(options)) return

    // beforecreate

    if (options._isComponent) { // 是组件的话，组件原型上有 FakeVue.options的内容，不需要合并
      // 继承组件的options
      this.$options = initComponentOptions(this.constructor, options)
    } else { // 合并 FakeVue.options 上的内容
      this.$options = mergeOptions(this.constructor.options, options)
    }

    initState(this)
    initEvents(this)
    initRender(this)

    // created

    if (options.el) {
      this.$mount(options.el)
    }
  }

  /* 基本功能的方法 */

  $mount (el) {
    el = query(el) // queryselector || div || undefined
    this.$el = el
    // 没有render，自己解析模板
    if (!this.$options.render) {
      let template = this.$options.template

      if (!isDef(template)) {
        try {
          template = el.outerHTML
        } catch {
          console.error('如果el没有提供，请提供template属性')
        }
      }

      // Vue.prototype._render
      // this.render 是options里面的用户传入的模板渲染方法。二选一。
      this.$options.render = compiler(template)
    }

    // beforeMount

    const autoRun = () => {
      this._update(this._render())
    }

    this._watcher = new Watcher(this, autoRun)
  }

  _render () {
    const { $options: { _selfVnode, render } } = this
    if (_selfVnode) {
      // 如果有配置 v-slot的模板，会存在data里面
      // 没有就直接去找vnode的children
      this.$scopedSlots = _selfVnode.data?.scopedSlots ?? _selfVnode.componentOptions.children
    }
    return render.call(this, this.$createElement)
  }

  _update (vnode) {
    console.log('vm._render():vnode: ', vnode)
    // 空模板 没有解析到就没有孩子，只是空div
    if (vnode?.children.length === 1) {
      // 提取一层，只有一个根的时候，$el会保存到dom
      vnode = vnode.children[0]
    }
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
      watcher.unwatch()
    }
  }
}

initGlobalAPI(FakeVue)

// 主要的已经提取出来在上面的类里
/* 额外提供的$属性方法 */
stateMixin(FakeVue)

export default FakeVue