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
      if (!Object.hasOwnProperty.call(to, key)) to[key] = from[key]
    })
  }

  return to
}

export const query = el => {
  if (isDef(el)) {
    return document.querySelector(el) ?? document.createElement('div')
  } else {
    return el
  }
}

export const makeMap = str => {
  const map = Object.create(null)
  str.split(',').forEach(item => (map[item] = true))
  return key => map[key]
}

export function createCache (fn) {
  const obj = Object.create(null)
  return (...args) => {
    const key = args[0]
    return obj[key] ?? (obj[key] = fn(...args))
  }
}

export const inBrowser = typeof window !== undefined

let _isServer
export function isServerRendering () {
  if (_isServer === undefined) {
    _isServer =
      !inBrowser &&
      typeof global !== undefined &&
      global['process'] &&
      global['process'].env
  }

  return _isServer
}

export const noop = () => { }

/**
 * watch分析对象属性调用
 */
export function parsePath (exp) {
  const keys = exp.split(`.`)
  return function getter (val) {
    keys.forEach(k => (val = val[k]))
    return val
  }
}

const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot,documentFragment')

const isSVGTag = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view')

export function isReservedTag (tag) {
  return isHTMLTag(tag) || isSVGTag(tag)
}

/**
 * 变成驼峰命名
 */
const camelizeRE = /-(\w)/g
const camelize = createCache(str => {
  return str.replace(camelizeRE, (_, p1) => (p1 ? p1.toUpperCase() : ''))
})

/**
 * 变成首字母大写
 */
const capitalize = createCache(str => {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * 变成-连字符
 */
const hyphenateRe = /\B([A-Z])/g
const hyphenate = createCache(str => {
  return str.replace(hyphenateRe, (_, p1) => `-${p1}`).toLowerCase()
})

export const matchVariousName = [camelize, capitalize, hyphenate]