import React, { useState, useEffect } from "react";
import "./LoginStyle.css";
import { BsFillEnvelopeFill } from "react-icons/bs";
import { BiSolidLock } from "react-icons/bi";
import { HiUserCircle } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import NavbarPublic from "../../Components/Utilities/NavbarPublic";
import { Button, InputAdornment, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import ProgressAnimation from "../../Components/Animation/Animation";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../../Components/Global/GlobalVariable";

const LogIn = () => {
  document.title = "LogIn Page";

  // Clear stored data when the component loads
  useEffect(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("UserRole");
    localStorage.removeItem("project_name");

    // Call the getLocalIP function to log the IP address
    // getLocalIP();
  }, []);

  const [userName, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true); // Set initial loading state to true
  const xRequestId = uuidv4();

  const [ip, setIp] = React.useState(null);

  const secKey = process.env.REACT_APP_SECRET_KEY; //password
  global.queryName = "";

  const navigate = useNavigate();
  const url =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_LOGIN_PATH;

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  // const getLocalIP = async () => {
  //   const rtcPeerConnection = new RTCPeerConnection({ iceServers: [] });
  //   rtcPeerConnection.createDataChannel("");

  //   rtcPeerConnection
  //     .createOffer()
  //     .then((offer) => rtcPeerConnection.setLocalDescription(offer));

  //   rtcPeerConnection.onicecandidate = (event) => {
  //     if (event && event.candidate && event.candidate.candidate) {
  //       const candidate = event.candidate.candidate;
  //       const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
  //       if (ipMatch) {
  //         setIp(ipMatch[1]); // Set the IP address from the match

  //         rtcPeerConnection.close();
  //       }
  //     }
  //   };
  // };

  // console.log(ip);

  localStorage.setItem(
    "queryName",
    CryptoJS.AES.encrypt(userName, secKey).toString()
  );

  // UseEffect to handle loading state once data fetching is removed
  useEffect(() => {
    setLoading(false); // Set loading to false immediately since there's no data fetching
  }, []);

  const validation = () => {
    let result = true;

    if (userName === "" || userName === null) {
      toast.error("User Name is empty", {
        toastId: "error 6",
      });
      result = false;
    }
    if (password === "" || password === null) {
      toast.error("Password is empty", {
        toastId: "error 7",
      });
      result = false;
    }
    return result;
  };

  const ProceedLogin = (e) => {
    e.preventDefault();
    if (validation()) {
      let regobj = {
        userName,
        password,
      };

      axios
        .post(`${url}`, regobj, {
          headers: {
            "X-Request-ID": xRequestId,
            "X-Tracking-ID": "127.0.0.1",
            "X-Consumer": navigator.userAgent,
            "X-Region": "Kolkata",
          },
        })
        .then((res) => {
          if (res.data.firstName) {
            localStorage.setItem(
              "username",
              CryptoJS.AES.encrypt(res.data.firstName, secKey).toString()
            );
          }
          if (res.data.UserRole) {
            localStorage.setItem(
              "UserRole",
              CryptoJS.AES.encrypt(
                res.data.UserRole.toString(),
                secKey
              ).toString()
            );
          }

          toast.success(res.data.message, {
            toastId: "success 2",
          });

          navigate("/my-activity");
        })
        .catch((error) => {
          if (error.code === "ERR_NETWORK") {
            toast.error("Check Backend Status !!", {
              toastId: "error 20",
            });
          } else {
            toast.error(error.response.data.message, {
              toastId: "error 2",
            });
          }
        });
    }
  };

  return loading ? ( // Check the loading state directly
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        marginTop: "50vh",
      }}
    >
      <ProgressAnimation />
    </div>
  ) : (
    <>
      <NavbarPublic />
      <div className="container-fluid">
        <div id="login-container">
          <form onSubmit={ProceedLogin} id="login-container-form">
            <div className="login-Circle-lock">
              <HiUserCircle size={100} />
            </div>
            <div id="login-container-forgotAccount">
              <p>
                Don't have an account?
                <Link to="/Register">Register here.</Link>
                <p className="d-flex justify-content-center">
                  <Link to="/ForgotPassword"> Forgot password? </Link>
                </p>
              </p>
            </div>
            <TextField
              value={userName}
              onChange={(e) => setUser(e.target.value)}
              className="login-container-email"
              type="text"
              label="User Name"
              variant="outlined"
              autoComplete="off"
            />
            <TextField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className="login-container-password"
              label="Password"
              variant="outlined"
              autoComplete="off"
              InputProps={{
                autoComplete: "new-password",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              id="logincontainer-button"
              type="submit"
            >
              LOGIN
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LogIn;
