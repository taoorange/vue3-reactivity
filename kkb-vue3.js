/**
 * 以下代碼是min版本的reactivity的实现
 */
const effectStack = []
let targetMap = new WeakMap() // 存储所有的reactive，所有key对应的依赖

// 收集依赖
// reactive可能有多个，一个又有n个属性key，所以这里我们需要全局的targetMap来存储
function track (target, key) {
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depMap = targetMap.get(target)
    if (!depMap) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }
    let dep = depMap.get(key)
    if (!dep) {
      dep = new Set()
      depMap.set(key, dep)
    }
    // 添加依赖
    dep.add(effect)
    effect.deps.push(dep)
  }
}

// 触发更新
function trigger (target, key, info) {
  let depMap = targetMap.get(target)
  if (!depMap) {
    return
  }
  const effects = new Set()
  const computedRunners = new Set()
  if (key) {
    let deps = depMap.get(key)
    deps.forEach(effect => {
      if (effect.computed) {
        computedRunners.add(effect)
      } else {
        effects.add(effect)
      }
    })
  }
  computedRunners.forEach(computed => computed()) // ******????????
  effects.forEach(effect => effect())
}

// 副作用
// computed是一个特殊的effect
function effect (fn, options = {}) {
  let e = createRecativeEffect(fn, options)
  if (!options.lazy) {
    e()
  }
  return e
}

const baseHandler = {
  get (target, key) {
    const res = target[key] // reflect更合理
    track(target, key)
    return res
  },
  set (target, key, val) {
    const info = { oldValue: target[key], newValue: val }
    target[key] = val
    trigger(target, key, info)
  }
  // 其实还有很多，has，onkeys等方法，咱这是简易版本
}

// 将target变为响应式
function reactive (target) {
  const observered = new Proxy(target, baseHandler)
  return observered
}

function createRecativeEffect (fn, options) {
  const effect = function effect (...args) {
    return run(effect, fn, args)
  }
  effect.deps = []
  effect.computed = options.computed
  effect.lazy = options.lazy
  return effect
}

function run (effect, fn, args) {
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect)
      return fn(...args)
    } finally {
      effectStack.pop()
    }
  }

}

function computed (fn) {
  const runner = effect(fn, { computed: true, lazy: true })
  return {
    effect: runner,
    get value () {
      return runner()
    }
  }
}