import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workflows: [],
  activeNodes: [],
  responses: {},
  error: null
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addWorkflowNode: (state, { payload }) => {
      state.activeNodes.push(payload);
    },
    cacheResponse: (state, { payload }) => {
      state.responses[payload.nodeId] = payload.data;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    }
  }
});

export const { addWorkflowNode, cacheResponse, setError } = aiSlice.actions;
export default aiSlice.reducer;