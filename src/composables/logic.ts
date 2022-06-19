import type { BlockState } from '~/types'

export class GamePlay {
  // Array.from 接受的第一个参数是一个 具有 length 属性的对象
  // reactive 无法实现整体替换 这里为了实现 重置 扫雷 改用 ref 实现
  state = ref<BlockState[][]>([])
  // 标识是否已经生成炸弹分布
  mineGenerated = false
  // 游戏状态 play 、won 、lost
  gameState = ref<'play' | 'won' | 'lost'>('play')

  // 排列组合当前块周围的所有方向
  directions = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ]

  constructor(public width: number, public height: number) {
    this.reset()
  }

  getState() {
    return this.state
  }

  reset() {
    this.gameState.value = 'play'
    this.mineGenerated = false
    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width }, (_, x): BlockState => ({
        x, y, adjacentMines: 0, revealed: false,
      }),
      ),
    )
  }

  // 生成炸弹
  generateMines(initBlock: BlockState) {
    for (const row of this.state.value) {
      for (const block of row) {
        // 将首次点击的 block 作为 初始化 block
        // 特性： 1.首次点击必然不是炸弹 2.周围的 block 也必然不是炸弹
        if (Math.abs(initBlock.x - block.x) < 1)
          continue

        if (Math.abs(initBlock.y - block.y) < 1)
          continue

        // 每一个块 都是 n/10 的概率变成炸弹
        block.mine = Math.random() < 0.3
      }
    }
    this.updateNumbers()
  }

  // 获取周围所有块
  getSiblings(block: BlockState) {
    // [dx, dy] 在这里是解构
    return this.directions.map(([dx, dy]) => {
      // 计算周围八个方块中 一共有多少个是炸弹
      const x2: number = block.x + dx
      const y2: number = block.y + dy
      if (x2 < 0 || y2 < 0 || x2 >= this.width || y2 >= this.height)
        return undefined

      return this.state.value[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  // 计算非炸弹块的附近的炸弹块数目
  updateNumbers() {
    this.state.value.forEach((row: BlockState[]) => {
      row.forEach((block) => {
        // 如果是炸弹块 则不计算
        if (block.mine)
          return

        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines++
        })
      })
    })
  }

  onClick(block: BlockState) {
    if (this.gameState.value === 'lost')
      return
    // 如果已经插旗子 或者 已经点开 不允许点开
    if (block.flagged || block.revealed)
      return

    // 为了防止用户 刚开始就点出炸弹 设计 在第一次点下之后 才生成 炸弹分布
    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.gameState.value = 'lost'
      this.showAllMines()
      alert('BOOOM!')
    }

    this.expandZero(block)
  }

  // 当点击到炸弹后 所有炸弹全部展示
  showAllMines() {
    this.state.value.flat().forEach((block) => {
      if (block.mine && !block.revealed)
        block.revealed = true
    })
  }

  // 当点开的 块 一个炸弹都没有时 把周围不是炸弹的通通翻转
  expandZero(block: BlockState) {
    if (block.adjacentMines || block.mine)
      return

    this.getSiblings(block).forEach((b) => {
      if (!b.revealed && !b.flagged) {
        b.revealed = true
        this.expandZero(b)
      }
    })
  }

  // 右键标记插旗子
  onRightClick(block: BlockState) {
    if (this.gameState.value === 'lost')
      return
    // 如果已经翻开 不允许插旗子
    if (block.revealed)
      return

    block.flagged = !block.flagged
  }

  // 判断是否胜利
  checkGamestate() {
    // 二维数组扁平化
    const blocks = this.state.value.flat()

    const cheatstate = blocks.every((block: BlockState) => block.flagged)

    if (cheatstate) {
      this.gameState.value = 'lost'
      alert('You cheat!')
    }

    let gamestate = true

    blocks.forEach((block: BlockState) => {
      // 判断 剩下的没翻开的块 如果有一块 不是炸弹 那就说明没有赢
      if (!block.revealed && !block.mine)
        gamestate = false
    })

    if (gamestate) {
      this.gameState.value = 'won'
      alert('You Win!')
    }
  }
}
