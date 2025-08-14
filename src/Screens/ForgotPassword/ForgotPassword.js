import React, { useState, useEffect } from "react";
import "./Style.css";
import { BsFillEnvelopeFill } from "react-icons/bs";
import { ImKey } from "react-icons/im";
import TextField from "@mui/material/TextField";
import NavbarPublic from "../../Components/Utilities/NavbarPublic";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

let ForgotPassword = () => {
  document.title = "Forgot Password";
  // clear all data first then take up new datas
  React.useEffect(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("queryName");
    localStorage.removeItem("UserRole");
    localStorage.removeItem("project_name");
  });

  const [userName, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [ip, setIp] = React.useState(null);
  /* eslint-disable */
  const [location, setLocation] = React.useState(null);
  const [fakeLocation, setFakeLocation] = React.useState(null);
  const [loading, setLoading] = React.useState(null);
  const xRequestId = uuidv4();
  const secKey = "Ll40$9X7tp"; //password
  const navigate = useNavigate();
  const url = "http://localhost:9090/api/htkpgx2472sz/user-onboard";

  const ProceedRequest = (e) => {
    e.preventDefault();
    if (validation()) {
      let regobj = {
        userName,
        email,
        password,
      };

      axios
        .post(`${url}`, regobj, {
          headers: {
            "X-Request-ID": xRequestId,
            "X-Tracking-ID": fakeIp,
            "X-Consumer": navigator.userAgent,
            "X-Region": fakeLocation,
          },
        })
        .then((res) => {
          toast.success(res.data.message, {
            toastId: "success 2",
          });
          if (res.data.firstName) {
            localStorage.setItem(
              "username",
              CryptoJS.AES.encrypt(res.data.firstName, secKey).toString()
            ),
              localStorage.setItem("UserRole", res.data.UserRole);
          }
          navigate("/my-activity");
        })
        .catch((error) => {
          if (error.code === "ERR_NETWORK") {
            toast.error("Check Backend !!", {
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

  return (
    <>
      <NavbarPublic />
      <div className="container-fluid">
        <div id="login-container">
          <form id="forgotpassword-container" onSubmit={ProceedRequest}>
            <h1 className="heading-forgotyourpass">
              Forgot Your Password?
            </h1>
            <h2 className="sub-heading">
              Please connect to admin for resetting the password.
            </h2>

            <span class="dot"></span>
            <div className="key-mail">
              <ImKey size={70} />
            </div>
          </form>
          <p></p>
          <p></p>
          <p></p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
