import { vaildateProp } from "../init/initState"

export let isUpdatingComponents = false

export default function updateComponents ({ propsData }, vm) {
  isUpdatingComponents = true

  for (const key in propsData) {
    // props只检测在生成实例的时候执行过
    // 保证每次更改输入都检查
    const value = vaildateProp(vm.$options.props, key, propsData[key])
    // 触发依赖改变
    vm._props[key] = value
    // 更新vm的propsData
    vm.$options.propsData = propsData
  }

  isUpdatingComponents = false
}