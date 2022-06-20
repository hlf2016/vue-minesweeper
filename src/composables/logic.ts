import type { BlockState } from '~/types'

export interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  gameState: 'playing' | 'lost' | 'won'
  startTime: number
}

export class GamePlay {
  // Array.from 接受的第一个参数是一个 具有 length 属性的对象
  // reactive 无法实现整体替换 这里为了实现 重置 扫雷 改用 ref 实现
  state = ref({} as GameState)

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

  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  getState() {
    return this.state
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  // 生成不同难度的局
  newGame(level: 'easy' | 'normal' | 'hard') {
    switch (level) {
      case 'easy':
        this.reset(10, 10, 10)
        break
      case 'normal':
        this.reset(10, 10, 20)
        break
      case 'hard':
        this.reset(10, 10, 30)
        break
    }
  }

  reset(height: number = this.height, width: number = this.width, mines: number = this.mines) {
    this.height = height
    this.width = width
    this.mines = mines

    this.state.value = {
      // 标识是否已经生成炸弹分布
      mineGenerated: false,
      // 游戏状态 play 、won 、lost
      gameState: 'playing',
      // 游戏开始时间 当前时间  Date.now()  +Date.now() 当前时间的时间戳
      startTime: +Date.now(),
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width }, (_, x): BlockState => ({
          x, y, adjacentMines: 0, revealed: false,
        }),
        ),
      ),

    }
  }

  // 生成随机 int 类型的数字
  randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 生成炸弹
  generateMines(initBlock: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = this.state.value.board[y][x]
      // 将首次点击的 block 作为 初始化 block
      // 特性： 1.首次点击必然不是炸弹 2.周围的 block 也必然不是炸弹
      if (Math.abs(initBlock.x - block.x) <= 1 && Math.abs(initBlock.y - block.y) <= 1)
        return false
      // 防止 一个位置已经是炸弹 再次被生成炸弹 从而重复占位 浪费一个位置
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    // 算法优化 生成几个炸弹 我们说了算 增加随机的确定性
    // 由我们来确定生成几个炸弹 并随机摆放相应的位置上 必须保证 一个炸弹一个坑
    Array.from({ length: this.mines }, () => null).forEach(() => {
      let isPlaceRandom = false
      // 只有每次生成炸弹在不同的位置 才结束循环 防止两个炸弹一个坑
      while (!isPlaceRandom)
        isPlaceRandom = placeRandom()
    })

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

      return this.state.value.board[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  // 计算非炸弹块的附近的炸弹块数目
  updateNumbers() {
    this.state.value.board.forEach((row: BlockState[]) => {
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
    if (this.state.value.gameState !== 'playing')
      return
    // 如果已经插旗子 或者 已经点开 不允许点开
    if (block.flagged || block.revealed)
      return

    // 为了防止用户 刚开始就点出炸弹 设计 在第一次点下之后 才生成 炸弹分布
    if (!this.state.value.mineGenerated) {
      this.generateMines(block)
      this.state.value.mineGenerated = true
    }
    block.revealed = true
    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      alert('BOOOM!')
    }

    this.expandZero(block)
  }

  // 当点击到炸弹后 所有炸弹全部展示
  showAllMines() {
    this.state.value.board.flat().forEach((block) => {
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
    if (this.state.value.gameState !== 'playing')
      return
    // 如果已经翻开 不允许插旗子
    if (block.revealed)
      return

    block.flagged = !block.flagged
  }

  // 判断是否胜利
  checkGamestate() {
    // 二维数组扁平化
    const blocks = this.state.value.board.flat()

    const cheatstate = blocks.every((block: BlockState) => block.flagged)

    if (cheatstate) {
      this.state.value.gameState = 'lost'
      alert('You cheat!')
    }

    let gamestate = true

    blocks.forEach((block: BlockState) => {
      // 判断 剩下的没翻开的块 如果有一块 不是炸弹 那就说明没有赢
      if (!block.revealed && !block.mine)
        gamestate = false
    })

    if (gamestate)
      this.state.value.gameState = 'won'
  }
}
