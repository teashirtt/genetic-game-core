<template>
  <div class="box">
    <canvas ref="canvas" class="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GameArgs, GameMap } from '@game/GameMap'

const canvas = ref<HTMLCanvasElement>(null!)

const gameargs: GameArgs = { bird_count: 100, mutate_rate: 0.2, pipe_speed: 5, pipe_gap: 400, bird_nn_structure: [4, 6, 6, 1] }

onMounted(() => {
  canvas.value!.width = window.innerWidth
  canvas.value!.height = window.innerHeight
  new GameMap(canvas.value!, gameargs)
})
</script>

<style scoped>
.box {
  display: flex;
  width: 100%;
  height: 100%;
}

.canvas {
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
}
</style>
