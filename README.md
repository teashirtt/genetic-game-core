# genetic-game-core

使用遗传算法完成flappy bird游戏

## 介绍

本项目使用`canvas`制作了一个简易版的`flappy bird`游戏

同时实现了简单神经网络，并尝试通过遗传算法来完成这个游戏

## 运行

```bash
npm install
npm run dev
```

## 调参

目前还没写图形化调参界面 （不是因为我太懒了:sleeping:）

但是`GameView.vue`中可以手动调参！

```typescript
const gameArgs: GameArgs = {
  bird_count: 100, // 每批生成小鸟数量
  mutate_rate: 0.2, // 突变概率
  pipe_speed: 4, // 管道速度（根据相对论，其实就是小鸟的速度）
  pipe_gap: 400, // 管道间的距离
  bird_nn_structure: [4, 6, 6, 1] // 控制小鸟运动的神经网络结构
}
```
