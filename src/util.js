export const isDef = val => val !== undefined && val !== null

export const isObj = obj => {
  return (
    typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]'
  )
}

export const isEmptyObj$1 = obj => !Object.keys(obj).length

export const mergeObj = (from, to) => {
  if (isObj(from) && isDef(from)) {
    Object.keys(from).forEach(key => {
      if (!to.hasOwnProperty(key)) to[key] = from[key]
    })
  }

  return to
}

export const query = el => document.querySelector(el) ?? createDiv()

export const createDiv = () => document.createElement('div')

export const clearObj = () => Object.create(null)

export const makeMap = str => {
  const map = clearObj()

  str.split(',').forEach(item => (map[item] = true))
  return key => map[key]
}

export function createCache (fn) {
  const obj = clearObj()
  return (key, ...args) => {
    return obj[key] ?? (obj[key] = fn(...args))
  }
}

export function insert (a) {
  
}