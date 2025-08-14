import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { UserReducer } from "./Reducer";
import thunk from "redux-thunk";
import logger from "redux-logger";

const rootreducer = combineReducers({ user: UserReducer });
const store = configureStore({
  reducer: rootreducer,
  middleware: [thunk, logger],
});

export default store;
