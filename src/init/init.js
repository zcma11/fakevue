const protect = function (target, name, ref) {
  const get = function () { return this[ref] }
  const set = () => console.warn(`${name} is readonly.`)
  Object.defineProperty(target, name, { get, set })
}

export function stateMixin (FakeVue) {
  protect(FakeVue.prototype, '$data', '_data')
  protect(FakeVue.prototype, '$props', '_props')
}