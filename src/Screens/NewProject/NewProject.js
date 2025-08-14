import "./NewProject.css";
import "../../index.css";
import { useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import JobView from "./JobView";
import axios from "axios";
import Swal from "sweetalert2";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import ProgressAnimation from "../../Components/Animation/Animation";
import "../../Components/Global/GlobalVariable";
import { v4 as uuidv4 } from "uuid";
// import Logger from "../../logger";

let NewProject = () => {
  document.title = "New Job";
  const navigate = useNavigate();
  const [getdata, setGetData] = useState([]);
  const [files, setFiles] = useState([]);
  const [jobName, setJobName] = useState(null);
  const [subJobName, setSubJobName] = useState(null);
  const [buttonPopup, setButtonPopup] = useState(false);
  // eslint-disable-next-line
  const [isVisible, setIsVisible] = useState(1); //state used for unhiding and hiding as boolean
  const [openJobView, setOpenJobView] = useState(false);
  const [disablevalue, setDisableValue] = useState(true);
  const [loading, setLoading] = React.useState(false);
  let user_name = "admin";
  const [encryptedQueryName] = React.useState(
    localStorage.getItem("queryName") || ""
  );

  user_name = CryptoJS.AES.decrypt(
    encryptedQueryName,
    process.env.REACT_APP_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);

  let disableDuplicate = (e, arg) => {
    setJobName(null);
    Swal.fire({
      icon: "error",
      title: "ERROR",
      text: `"${e}" already exist... Please enter another Job Name`,
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
      // "Error",
      // `${e} already exist ! Please enter another Job name`,
      // "error"
    });
  };
  let getValue = (event) => {
    setJobName(event.target.value.trimStart());
    let disableValue = false;
    getdata.forEach((dataItem) => {
      if (dataItem.jobName.toLowerCase() === event.target.value.toLowerCase()) {
        disableDuplicate(dataItem.jobName);
        disableValue = true;
        return;
      }
    });
    setDisableValue(disableValue);

    sessionStorage.setItem("Job Name", event.target.value); //on change storing
    if (validation()) {
      setIsVisible(0);
    }
  };
  const validation = () => {
    let result = true;
    if (jobName === "" || jobName === null) {
      result = false;
    }
    if (subJobName === "" || subJobName === null) {
      result = false;
    }
    return result;
  };
  const url =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_CREATE_JOB +
    "?user_name=" +
    user_name;

  // React.useEffect(() => {
  //   Swal.fire({
  //     title: "DISCLAIMER",
  //     width: 500,
  //     html: `<h6> Please upload a valid IIB application where all the dependent services have been included...</h6>`,
  //     icon: "info",
  //     confirmButtonText: "OK",
  //     customClass: {
  //       popup: "custom-swal",
  //       container: "custom-swal-overlay",
  //     },
  //   });
  // });

  React.useEffect(() => {
    Swal.fire({
      title: "DISCLAIMER",
      width: 500,
      html: `<h6> Please upload a valid IIB application where all the dependent services have been included...</h6>`,
      icon: "info",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    });
    const baseURL =
      process.env.REACT_APP_BASE_PATH +
      process.env.REACT_APP_RETRIEVE_FILE +
      "?user_name=" +
      user_name;
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setGetData(response.data);
      });
  }, []);

  const submitHandler = () => {
    let requestBody = {
      jobName: jobName,
    };
    axios
      .post(url, requestBody)
      .then((response) => {
        setLoading(false);
        Swal.fire({
          icon: "success",
          title: response.data.message,
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        }).then((result) => {
          if (result.isConfirmed) window.location.reload(true);
        });
      })
      .catch((error) => {});
    navigate("/newjobprojects", {
      state: { jobName: jobName },
    });
  };
  return loading ? (
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
      {openJobView ? (
        <JobView files={getdata} />
      ) : (
        <>
          <NavbarPrivate />
          <Sidenav />
          <form>
            <div class="openjob-container-fluid">
              <div id="addsubjob-border-box" className="mt-5">
                <div>
                  <div id="scan-select-job-header" className="text-center mb-2">
                    <h2
                      className="font-weight-bold"
                      // style={{ fontFamily: "Domine", fontSize: "1.8rem" }}
                    >
                      ADD NEW JOB
                    </h2>
                  </div>
                  <Box
                    sx={{
                      "& > :not(style)": {
                        m: 1,
                        width: "90%",
                        top: "17px",
                        left: "3.6%",
                        paddingBottom: "5%",
                      },
                    }}
                  >
                    <TextField
                      required
                      value={jobName}
                      onChange={getValue}
                      type="String"
                      label="Enter Job Name"
                      variant="outlined"
                      autoComplete="off"
                    />
                  </Box>
                  <div
                    class="d-flex justify-content-center"
                    id="scan-job-submit"
                  >
                    <Stack spacing={4} direction="row">
                      <div>
                        {jobName === null || jobName === "" ? (
                          <button
                            disabled={true}
                            onClick={() => submitHandler()}
                            variant="contained"
                            component="label"
                            className="select-button"
                          >
                            SUBMIT
                          </button>
                        ) : (
                          <button
                            disabled={disablevalue}
                            onClick={() => submitHandler()}
                            variant="contained"
                            component="label"
                            className="select-button"
                          >
                            SUBMIT
                          </button>
                        )}
                      </div>
                    </Stack>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </>
      )}
    </>
  );
};

export default NewProject;
