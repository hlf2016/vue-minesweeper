<script setup lang="ts">
// import { isDev, toggleDev } from '~/composables'

// 引入 扫雷块 组件
import MineBlock from '~/components/MineBlock.vue'

const play = new GamePlay(10, 10, 10)
const state = useStorage('vue-minesweeper', play.getState())

const board = computed(() => state.value.board)

// 剩余炸弹块数量 当被标上小旗子时 也同样认为 排出一个雷
const restMineNum = computed(() => {
  if (!state.value.mineGenerated)
    return play.mines

  return Math.max(play.blocks.reduce((a, b) => a + (b.mine ? 1 : 0) - (b.flagged ? 1 : 0), 0), 0)
})

// 游戏计时
// useNow() 返回当前时间 不断变化 且返回值是一个 ref 对象 此处使用 reactive transform 来进行 简化转换 从而在调用ref时省略 .value
const nowTime = $(useNow())
// 计算时间差 nowTime 是 object +nowTime 是时间戳
const timeDiff = $computed(() => Math.floor((+nowTime - +state.value.startTime) / 1000))

watchEffect(() => {
  play.checkGamestate()
})
</script>

<template>
  <div>
    Minesweeper
    <div flex="~ gap-2" justify-center p5>
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
    <div flex="~ gap-10" justify-center>
      <div font-mono text-xl flex="~ gap-1" items-center>
        <div i-carbon-timer />
        {{ timeDiff }}
      </div>
      <div font-mono text-xl flex="~ gap-1" items-center>
        <div i-mdi-mine />
        {{ restMineNum }}
      </div>
    </div>
    <div p5 w-full overflow-auto>
      <div v-for="(row, y) in board" :key="y" flex="~" items-center justify-center wmax ma>
        <mine-block v-for="(block, x) in row" :key="x" :block="block" @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)" />
      </div>
    </div>
    <!-- <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'Dev' : 'Play' }}
      </button>
    </div> -->
    <Confetti :passed="play.state.value.gameState === 'won'" />
  </div>
</template>
