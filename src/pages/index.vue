<script setup lang="ts">
import { isDev, toggleDev } from '~/composables'

// 引入 扫雷块 组件
import MineBlock from '~/components/MineBlock.vue'

const play = new GamePlay(10, 10, 10)
const state = useStorage('vue-minesweeper', play.getState())

const board = computed(() => state.value.board)

// 统计炸弹块数量 是否跟设置的相同
const mineBlockNum = computed(() => {
  return play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0), 0)
})

watchEffect(() => {
  play.checkGamestate()
})
</script>

<template>
  <div>
    Minesweeper
    <div flex="~ gap-2" justify-center pt-2>
      <button btn @click="play.reset()">
        New Game
      </button>
      <button btn @click="play.newGame('easy')">
        Easy
      </button>
      <button btn @click="play.newGame('normal')">
        Normal
      </button>
      <button btn @click="play.newGame('hard')">
        Hard
      </button>
    </div>
    <div p5 w-full overflow-auto>
      <div v-for="(row, y) in board" :key="y" flex="~" items-center justify-center wmax ma>
        <mine-block v-for="(block, x) in row" :key="x" :block="block" @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)" />
      </div>
    </div>
    <div>
      Count: {{ mineBlockNum }}
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'Dev' : 'Play' }}
      </button>
    </div>
    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
