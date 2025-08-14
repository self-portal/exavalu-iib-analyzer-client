import { OpenPopup } from "./Action";
import {
  MAKE_REQ,
  REQ_ADD_SUCC,
  REQ_DELETE_SUCC,
  REQ_GETALL_FAIL,
  REQ_GETALL_SUCC,
  REQ_GETBYCODE_SUCC,
  REQ_UPDATE_SUCC,
} from "./ActionType";

export const initialstate = {
  isloading: false, //for loading spinner
  userlist: [], //for holding user info
  userobj: {}, //for edit to handle individual scenario
  errormessage: "",
};

export const UserReducer = (state = initialstate, action) => {
  switch (action.type) {
    case MAKE_REQ:
      return {
        ...state,
        isloading: true,
      };
    case REQ_GETALL_SUCC:
      return {
        ...state,
        isloading: false,
        userlist: action.payload,
      };
    case REQ_GETALL_FAIL:
      return {
        ...state,
        isloading: false,
        userlist: [],
        errormessage: action.payload,
      };
    case REQ_ADD_SUCC:
      const _inputdata = { ...action.payload };
      const _maxid = Math.max(...state.userlist.map((o) => o.id));
      _inputdata.id = _maxid + 1;
      return {
        ...state,
        userlist: [...state.userlist, _inputdata],
      };
    case OpenPopup:
      return {
        ...state,
        userobj: {},
      };
    case REQ_GETBYCODE_SUCC:
      return {
        ...state,
        userobj: action.payload,
      };

    case REQ_UPDATE_SUCC:
      const _data = { ...action.payload };
      const _finaldata = state.userlist.map((item) => {
        return item.id === _data.id ? _data : item;
      });
      return {
        ...state,
        userlist: _finaldata,
      };

    case REQ_DELETE_SUCC:
      const _filterdata = state.userlist.filter((data) => {
        return data.id !== action.payload;
      });
      return {
        ...state,
        userlist: _filterdata,
      };
    default:
      return state;
  }
};
