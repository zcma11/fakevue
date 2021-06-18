import registerComponent from "./component"
import initExtend from "./extend"

export default function initGlobalAPI (FakeVue) {
  FakeVue.options = {
    components: Object.create(null),
    _base: FakeVue
  }
  
  FakeVue.extend = initExtend()
  FakeVue.component = registerComponent
}