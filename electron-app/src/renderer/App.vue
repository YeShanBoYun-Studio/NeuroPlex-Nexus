<template>
  <div class="main-container">
    <el-container>
      <el-header height="60px">
        <h2>AI流程设计器</h2>
      </el-header>
      
      <el-main>
        <el-row :gutter="20">
          <el-col :span="16">
            <FlowCanvas />
          </el-col>
          <el-col :span="8">
            <ResponseDiff />
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import FlowCanvas from './components/FlowCanvas.vue'
import ResponseDiff from './components/ResponseDiff.vue'
</script>

<style>
.main-container {
  height: 100vh;
}

.el-header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>