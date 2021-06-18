import { mergeOptions } from '../init/initOptions'
import { defineComputed } from '../init/initState'
import { proxy } from '../reactivity/reactive'
import { vaildateComponentName } from './util'

export default function initExtend () {
  let cid = 0

  return function componentCtor (options) { // 组件的配置
    if (options.data && typeof options.data !== 'function') {
      console.error('extend中data最好是由函数返回的对象')
    }

    // 组件vm 代理了props，在property
    // 外部组件vm 在标签写上props属性，并给数据，会解析成ast
    // 组件如果是局部注册的话，在render的时候会找到 options的components，
    // 全局注册，组件在原型上 
    // 处理props，attrs，on。。。 生成vnode
    // 在createElm的时候调用生成组件方法，得到全局注册的组件构造方法
    // 然后new 返回 vm实例 ， vm实例会走一套初始化流程，生成vnode.elm
    // data要保证独立的内存空间，不然所有组件都会跟着变化
    // 代理props，因为他不会被独立修改，都是一样的，已经写死了。只能由外部触发，所以可以一起更改
    // data没有共享到property，props，computed被代理到property
    // methods经过了bind绑定，直接赋值到vm，没有通过Object.defineProperty。
    // component会解析成render，加入到外部组件中，所以在外部组件注入this的时候，会得到对应的数据
    // 是component，然后插入到父节点，return结束 外部组件中children中的生成组件，继续生成其他dom
    const FakeVue = this

    const name = options.name
    if (name) {
      vaildateComponentName(name)
    }
    class Component extends FakeVue {
      constructor(options) {
        super(options)
      }
    }
    Component.id = cid++
    // 构造函数的静态属性
    Component.options = mergeOptions(FakeVue.options, options) // 通过原型进行合并

    if (name) {
      Component.options.components[name] = Component
    }

    options.props && initProps$1(Component.prototype, options.props)
    // 把computed内容绑定到原型上
    options.computed && initComputed$1(Component.prototype, options.computed)

    return Component
  }

  function initComputed$1 (target, computed) {
    for (const key in computed) {
      defineComputed(target, key, computed[key])
    }
  }

  function initProps$1 (target, props) {
    for (const key in props) {
      proxy(target, '_props', key)
    }
  }
}