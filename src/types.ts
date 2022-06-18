// 一个 块 的状态 接口
export interface BlockState {
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
