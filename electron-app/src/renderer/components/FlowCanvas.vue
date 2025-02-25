<template>
  <div class="flow-canvas">
    <div class="nodes">
      <div 
        v-for="node in nodes"
        :key="node.id"
        class="node"
        :style="{ left: node.x + 'px', top: node.y + 'px' }"
        draggable
        @dragstart="dragStart(node)"
        @dragend="dragEnd"
      >
        {{ node.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFlowStore } from '../stores/flowStore'

const store = useFlowStore()
const nodes = ref(store.nodes)

const dragStart = (node) => {
  store.setActiveNode(node.id)
}

const dragEnd = () => {
  store.updateNodePosition()
}
</script>

<style scoped>
.flow-canvas {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  position: relative;
}

.node {
  position: absolute;
  padding: 12px;
  background: #409EFF;
  color: white;
  border-radius: 4px;
  cursor: move;
  user-select: none;
}
</style>