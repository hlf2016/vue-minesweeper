<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'

// 引入 扫雷块 组件
import MineBlock from '~/components/MineBlock.vue'

const play = new GamePlay(10, 10)
const state = useStorage('vue-minesweeper', play.getState())

const board = computed(() => state.value.board)

watchEffect(() => {
  play.checkGamestate()
})
</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div v-for="(row, y) in board" :key="y" flex="~" items-center justify-center>
        <mine-block v-for="(block, x) in row" :key="x" :block="block" @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)" />
      </div>
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="play.reset()">
        Reset
      </button>
      <button btn @click="toggleDev()">
        {{ isDev ? 'Dev' : 'Normal' }}
      </button>
    </div>
  </div>
</template>
