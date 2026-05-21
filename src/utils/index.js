/**
 * 深拷贝函数 - 兼容性好，支持各种数据类型
 * @param {any} obj - 要拷贝的对象
 * @param {WeakMap} hash - 用于处理循环引用
 * @returns {any} - 拷贝后的对象
 */
export function deepClone(obj, hash = new WeakMap()) {
  // 处理 null 和 undefined
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  // 处理 Set
  if (obj instanceof Set) {
    const newSet = new Set()
    obj.forEach(item => {
      newSet.add(deepClone(item, hash))
    })
    return newSet
  }

  // 处理 Map
  if (obj instanceof Map) {
    const newMap = new Map()
    obj.forEach((value, key) => {
      newMap.set(deepClone(key, hash), deepClone(value, hash))
    })
    return newMap
  }

  // 处理 ArrayBuffer
  if (obj instanceof ArrayBuffer) {
    return obj.slice(0)
  }

  // 处理 TypedArray (如 Uint8Array, Int8Array 等)
  if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
    const TypedArray = Object.getPrototypeOf(obj).constructor
    return new TypedArray(deepClone(Array.from(obj), hash))
  }

  // 处理循环引用
  if (hash.has(obj)) {
    return hash.get(obj)
  }

  // 处理数组
  if (Array.isArray(obj)) {
    const arrCopy = []
    hash.set(obj, arrCopy)
    obj.forEach((item, index) => {
      arrCopy[index] = deepClone(item, hash)
    })
    return arrCopy
  }

  // 处理普通对象
  const objCopy = Object.create(Object.getPrototypeOf(obj))
  hash.set(obj, objCopy)

  // 使用 Reflect.ownKeys 获取所有属性（包括 Symbol 属性）
  const keys = Reflect.ownKeys(obj)
  keys.forEach(key => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)
    if (descriptor) {
      if (descriptor.get || descriptor.set) {
        // 如果是访问器属性，直接复制
        Object.defineProperty(objCopy, key, descriptor)
      } else {
        // 如果是数据属性，深拷贝值
        Object.defineProperty(objCopy, key, {
          ...descriptor,
          value: deepClone(obj[key], hash)
        })
      }
    }
  })

  return objCopy
}
