<template>
  <div class="response-diff">
    <el-card v-for="(response, index) in responses" :key="index">
      <template #header>
        <div class="card-header">
          <span>模型 {{ index + 1 }}</span>
          <el-tag :type="response.statusType">{{ response.status }}</el-tag>
        </div>
      </template>
      <div class="content">
        <pre>{{ response.content }}</pre>
        <div class="metrics">
          <el-statistic title="延迟" :value="response.latency" suffix="ms"/>
          <el-statistic title="Tokens" :value="response.tokens"/>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const responses = ref([
  {
    content: "这是第一个模型的响应示例...",
    latency: 356,
    tokens: 128,
    status: '成功',
    statusType: 'success'
  },
  {
    content: "第二个模型的响应内容...",
    latency: 420,
    tokens: 215,
    status: '警告',
    statusType: 'warning'
  }
])
</script>

<style scoped>
.response-diff {
  display: grid;
  gap: 20px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics {
  margin-top: 15px;
  display: flex;
  gap: 30px;
}

pre {
  white-space: pre-wrap;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}
</style>