<script setup lang="ts">
const WIDTH = 10;
const HEIGHT = 10;

// Array.from 接受的第一个参数是一个 具有 length 属性的对象
const state = reactive(Array.from({ length: HEIGHT }, (_, y) => Array.from({ length: WIDTH }, (_, x) => y * 10 + x + 1
)
));

const onClick = (x: number, y: number) => {
  console.log(`Clicked at ${x}, ${y}`);
}
</script>

<template>
  <div>
    Minesweeper
    <div>
      <div :key="y" v-for="(row, y) in state">
        <button hover:bg-gray w-10 h-10 border :key="x" v-for="(item, x) in row" @click="onClick(x, y)">
          {{ item }}
        </button>
      </div>
    </div>
  </div>
</template>
