import "../../../../../Components/Global/GlobalVariable";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  AddRequest,
  RemoveRequest,
  UpdateRequest,
  getAllRequestFail,
  getAllRequestSuccess,
  getbycodeSuccess,
  makeRequest,
} from "./Action";
import { toast } from "react-toastify";
const xRequestId = uuidv4();

const url =
  process.env.REACT_APP_BASE_PATH +
  process.env.REACT_APP_ROLE_MANAGEMENT +
  "?user_name=" +
  global.queryName;


export const GetAllUsers = () => {
  return (dispatch) => {
    dispatch(makeRequest());
    setTimeout(() => {
      axios
        .get(url, {
          headers: {
            "X-Request-ID": xRequestId,
          },
        })
        .then((res) => {
          const _list = res.data;
          dispatch(getAllRequestSuccess(_list));
        })
        .catch((error) => {
          dispatch(getAllRequestFail(error.message));
        });
    }, 1000);
  };
};

export const CreateUser = (data) => {
  return (dispatch) => {
    axios
      .post(
        url,
        {
          headers: {
            "X-Request-ID": xRequestId,
          },
        },
        data
      )
      .then((res) => {
        dispatch(AddRequest(data));
        toast.success("User created successfully");
      })
      .catch((error) => {
        toast.error("Failed to create user due to" + error.message);
      });
  };
};

// New Implementation
export const GetUserByCode = (code) => {
  return (dispatch) => {
    axios
      .get(url, {
        headers: {
          "X-Request-ID": xRequestId,
        },
      })
      .then((res) => {
        const _obj = Object.values(res.data)[code];
        dispatch(getbycodeSuccess(_obj));
      })
      .catch((error) => {
        toast.error("Failed to fetch the data");
      });
  };
};

// New Implementation
export const UpdateUser = (data) => {
  return (dispatch) => {
    axios
      .put(url, [data])
      .then((res) => {
        dispatch(UpdateRequest(data));
        toast.success("User updated successfully");
      })
      .catch((error) => {
        toast.error("Failed to update user due to" + error.message);
      });
  };
};

export const RemoveUser = (code) => {
  return (dispatch) => {
    axios
      .delete(url + "/" + code, {
        headers: {
          "X-Request-ID": xRequestId,
        },
      })
      .then((res) => {
        dispatch(RemoveRequest(code));
        toast.success("User removed successfully");
      })
      .catch((error) => {
        toast.error("Failed to remove user due to" + error.message);
      });
  };
};
