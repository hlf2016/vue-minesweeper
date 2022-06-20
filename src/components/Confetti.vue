<script setup lang="ts">
import confetti from 'canvas-confetti'

const props = defineProps<{
  passed: boolean
}>()

function congrats() {
  const defaults = {
    colors: [
      '#5D8C7B',
      '#F2D091',
      '#F2A679',
      '#D9695F',
      '#8C4646',
    ],
    shapes: ['square'],
    ticks: 500,
  } as confetti.Options
  confetti({
    ...defaults,
    particleCount: 80,
    spread: 100,
    origin: { y: 0 },
  })
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 60,
      spread: 80,
      origin: { x: 0 },
    })
  }, 250)
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 120,
      spread: 80,
      origin: { x: 1 },
    })
  }, 400)
}

// watch 用来监听ref对象的变化 而此处的 props.passed 不是一个 ref 对象
// 所以需要转换成 getter 函数 这样通过监听每次函数返回值的变化 从而监听 props.passed 的变化
watch(
  () => props.passed,
  (v) => {
    if (v)
      setTimeout(congrats, 300)
  },
  // flush: 'post' 是指可以在侦听器回调中访问被 Vue 更新之后的DOM
  { flush: 'post' },
)
</script>

<template>
  <div />
</template>
