import { configureStore, createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    currentView: "dashboard",
    user: null,
  },
  reducers: {
    setCurrentView(state, action) {
      state.currentView = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState: [],
  reducers: {
    setJobs(_state, action) {
      return action.payload;
    },
    updateJob(state, action) {
      const index = state.findIndex((job) => job.id === action.payload.id);
      if (index !== -1) state[index] = action.payload;
    },
    removeJob(state, action) {
      return state.filter((job) => job.id !== action.payload);
    },
  },
});

export const { setCurrentView, setUser } = appSlice.actions;
export const { setJobs, updateJob, removeJob } = jobsSlice.actions;

const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    jobs: jobsSlice.reducer,
  },
});

export default store;
