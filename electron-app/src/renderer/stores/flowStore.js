import { defineStore } from 'pinia'

export const useFlowStore = defineStore('flow', {
  state: () => ({
    nodes: [
      { id: 1, label: '输入节点', x: 100, y: 50 },
      { id: 2, label: '处理节点', x: 300, y: 150 },
      { id: 3, label: '输出节点', x: 500, y: 250 }
    ],
    activeNodeId: null,
    dragging: false
  }),
  actions: {
    setActiveNode(id) {
      this.activeNodeId = id
      this.dragging = true
    },
    updateNodePosition() {
      this.dragging = false
    },
    addNode(node) {
      this.nodes.push({
        id: Date.now(),
        ...node
      })
    },
    removeNode(id) {
      this.nodes = this.nodes.filter(n => n.id !== id)
    }
  },
  getters: {
    activeNode: (state) => state.nodes.find(n => n.id === state.activeNodeId),
    filteredNodes: (state) => (type) => state.nodes.filter(n => n.type === type)
  }
})