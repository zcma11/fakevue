import parse from './parse'
import compile from './complie'
import createRenderFunction from './render'

function createCompileToFunction () {
  const cache = Object.create(null)

  return function compiler (template) {
    // 目前只能处理浏览器
    typeof template !== 'string' && (template = '')

    // 组件template生成render 进行缓存 更新的时候可以直接用
    if (cache[template]) {
      return cache[template]
    }

    const ast = parse(template)
    console.log(ast)
    // 生成render
    // render的执行会收集依赖
    // render生成vnode 然后对比 然后渲染成真正的dom
    // 这样依赖改变下次执行时就是自动生成vnode然后到真实dom，自动调用render
    const code = compile(ast)

    // static...

    return (cache[template] = createRenderFunction(code))
  }
}

export default createCompileToFunction()
