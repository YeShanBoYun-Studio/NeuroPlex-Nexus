import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ReactFlow, { 
  Controls,
  Background,
  addEdge,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { addWorkflowNode } from '../store/slices/aiSlice';

const nodeTypes = {
  aiNode: ({ data }) => (
    <div className="p-4 bg-white rounded-lg shadow-md border border-blue-200">
      <h3 className="font-semibold text-blue-600">{data.label}</h3>
      <div className="mt-2 text-sm text-gray-600">
        {data.type === 'input' && '⇩ 输入节点'}
        {data.type === 'llm' && '🤖 AI处理器'}
        {data.type === 'output' && '⇧ 输出节点'}
      </div>
    </div>
  )
};

export default function FlowCanvas() {
  const dispatch = useDispatch();

  const onConnect = useCallback(
    (params) => dispatch(addWorkflowNode({
      ...params,
      type: 'connection'
    })),
    [dispatch]
  );

  const onNodeDragStop = useCallback(
    (event, node) => dispatch(addWorkflowNode({
      ...node,
      type: 'positionUpdate'
    })),
    [dispatch]
  );

  return (
    <ReactFlowProvider>
      <div className="h-[800px] w-full">
        <ReactFlow
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}