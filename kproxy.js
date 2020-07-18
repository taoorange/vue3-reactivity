// 实现一个基本的reactivity
let activeEffect
// mini 依赖中心
class Dep {
  constructor() {
    this.subs = new Set()
  }
  depend () {
    // 收集依赖
    if (activeEffect) {
      this.subs.add(activeEffect)
    }
  }
  notify () {
    // 数据变化，出发effect执行
    this.subs.forEach(effect => effect())
  }
}

function effect (fn) {
  activeEffect = fn
  fn()
}

const dep = new Dep()  // vue3中用一个大的map

// ref大概原理
function ref (val) {
  let _value = 0
  let state = {
    get value () {
      //获取数据，收集依赖， track
      dep.depend()
      return _value
    },
    set value (newCount) {
      _value = newCount
      // trigger触发
      dep.notify()
    }
  }
  return state
}

const state = ref(1)

effect(() => {
  console.log(state.value)
})

setInterval(() => {
  state.value++
}, 1000)