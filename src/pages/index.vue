<script setup lang="ts">

// 一个 块 的状态 接口
interface BlockState {
  x: number;
  y: number;
  // 是否被翻过
  revealed?: boolean;
  // 是否是炸弹
  mine?: boolean;
  // 是否被标记为小旗帜
  flagged?: boolean;
  // 相邻的炸弹数目
  adjacentMines: number;
}

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
const generateMines = () => {
  for (const row of state) {
    for (const block of row) {
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


// 计算非炸弹块的附近的炸弹块数目
const updateNumbers = () => {
  state.forEach((row, y) => {
    row.forEach((block, x) => {
      // 如果是炸弹块 则不计算
      if (block.mine) {
        return;
      }
      // [dx, dy] 在这里是解构
      directions.forEach(([dx, dy]) => {
        // 计算周围八个方块中 一共有多少个是炸弹
        const x2 = x + dx;
        const y2 = y + dy;
        if (x2 < 0 || y2 < 0 || x2 >= WIDTH || y2 >= HEIGHT) {
          return;
        }
        if (state[y2][x2].mine) {
          block.adjacentMines++;
        }
      });
    })
  });
}

// 标记是否当前开发模式
let dev = false;

// 标识是否已经生成炸弹分布
let mineGenerated = false;

const onClick = (block: BlockState) => {
  // 为了防止用户 刚开始就点出炸弹 设计 在第一次点下之后 才生成 炸弹分布
  if (!mineGenerated) {
    generateMines();
    mineGenerated = true;
  }
  block.revealed = true;
  if (block.mine) {
    alert("BOOOM!");
  }
}

const getBlockClass = (block: BlockState) => {
  if (!block.revealed) {
    return 'bg-gray-500/10';
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
]

</script>

<template>
  <div>
    Minesweeper
    <div p5>
      <div :key="y" v-for="(row, y) in state" flex="~" items-center justify-center>
        <button hover="bg-gray/20" w-10 h-10 m="0.5" :key="x" v-for="(block, x) in row" border="1 gray-400/10"
          @click="onClick(block)" :class=getBlockClass(block) flex="~" items-center justify-center>
          <template v-if="block.revealed || dev">
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
