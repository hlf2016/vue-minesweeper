<script setup lang="ts">

// 引入扫雷块 接口
import { BlockState } from '~/types'

// 标记是否当前开发模式
let dev = false;

// 标识是否已经生成炸弹分布
let mineGenerated = false;

const WIDTH = 10;
const HEIGHT = 10;

// Array.from 接受的第一个参数是一个 具有 length 属性的对象
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x): BlockState => ({
      x, y, adjacentMines: 0, revealed: false
    })
    )
  ));

// 生成炸弹
const generateMines = (initBlock: BlockState) => {
  for (const row of state) {
    for (const block of row) {
      // 将首次点击的 block 作为 初始化 block
      // 特性： 1.首次点击必然不是炸弹 2.周围的 block 也必然不是炸弹
      if (Math.abs(initBlock.x - block.x) < 1) {
        continue;
      }
      if (Math.abs(initBlock.y - block.y) < 1) {
        continue;
      }

      // 每一个块 都是 n/10 的概率变成炸弹
      block.mine = Math.random() < 0.3;
    }
  }
  updateNumbers();
}

// 排列组合当前块周围的所有方向 
const directions = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1]
];

// 获取周围所有块
const getSiblings = (block: BlockState) => {
  // [dx, dy] 在这里是解构
  return directions.map(([dx, dy]) => {
    // 计算周围八个方块中 一共有多少个是炸弹
    const x2 = block.x + dx;
    const y2 = block.y + dy;
    if (x2 < 0 || y2 < 0 || x2 >= WIDTH || y2 >= HEIGHT) {
      return undefined;
    }
    return state[y2][x2];
  }).filter(Boolean) as BlockState[];
}

// 计算非炸弹块的附近的炸弹块数目
const updateNumbers = () => {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      // 如果是炸弹块 则不计算
      if (block.mine) {
        return;
      }
      getSiblings(block).forEach((b) => {
        if (b.mine) {
          block.adjacentMines++;
        }
      })
    })
  });
}

const onClick = (block: BlockState) => {
  // 如果已经插旗子 或者 已经点开 不允许点开
  if (block.flagged || block.revealed) {
    return;
  }
  // 为了防止用户 刚开始就点出炸弹 设计 在第一次点下之后 才生成 炸弹分布
  if (!mineGenerated) {
    generateMines(block);
    mineGenerated = true;
  }
  block.revealed = true;
  if (block.mine) {
    alert("BOOOM!");
  }
  expandZero(block);
}

const getBlockClass = (block: BlockState) => {
  if (block.flagged) {
    return 'bg-gray-500/10';
  }
  if (!block.revealed) {
    return 'bg-gray-500/10 hover:bg-gray-500/20';
  }
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines];
}

const numberColors = [
  "text-transparent",
  "text-blue-500",
  "text-green-500",
  "text-yellow-500",
  "text-orange-500",
  "text-red-500",
  "text-purple-500",
  "text-pink-500",
  "text-teal-500"
];

// 当点开的 块 一个炸弹都没有时 把周围不是炸弹的通通翻转
const expandZero = (block: BlockState) => {
  if (block.adjacentMines || block.mine) {
    return;
  }
  getSiblings(block).forEach((b) => {
    if (!b.revealed && !b.flagged) {
      b.revealed = true;
      expandZero(b);
    }
  })
}

// 右键标记插旗子
const onRightClick = (block: BlockState) => {
  // 如果已经翻开 不允许插旗子
  if (block.revealed) {
    return;
  }
  block.flagged = !block.flagged;
}

watchEffect(checkGameState);

// 判断是否胜利
function checkGameState() {

  // 二维数组扁平化
  const blocks = state.flat();

  let cheatState = blocks.every((block) => block.flagged);

  if (cheatState) {
    alert('You cheat!');
  }

  let gameState = true;

  blocks.forEach((block) => {
    // 判断 剩下的没翻开的块 如果有一块 不是炸弹 那就说明没有赢
    if (!block.revealed && !block.mine) {
      gameState = false;
    }
  })

  if (gameState) {
    alert("You Win!");
  }
}

</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div :key="y" v-for="(row, y) in state" flex="~" items-center justify-center>
        <button w-10 h-10 m="0.5" :key="x" v-for="(block, x) in row" border="1 gray-400/10" @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)" :class=getBlockClass(block) flex="~" items-center justify-center>
          <template v-if="block.flagged">
            <div i-mdi-flag text-red></div>
          </template>
          <template v-else-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi-mine>
            </div>
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
