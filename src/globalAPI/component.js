import { isObj } from "../util"
import { vaildateComponentName } from "./util"

export default function registerComponent (name, component) {
  if (!component) {
    return this.options.components[name]
  }

  vaildateComponentName(name)

  if (isObj(component)) {
    component.name = component.name ?? name
    component = this.extend(component)
  }

  this.options.components[name] = component
  return component
}