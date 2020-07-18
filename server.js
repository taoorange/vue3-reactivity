// import { ref, computed, effect } from '@vue/reactivity'

const { ref, computed, effect } = require('@vue/reactivity')

const count = ref(1)

setInterval(() => {
  count.value++
}, 1000)

let double = computed(() => count.value * 2)

effect(() => {
  console.log('count:' + count.value + ',double:' + double.value)
})