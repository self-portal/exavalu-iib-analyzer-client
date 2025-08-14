import "./NewProject.css";
import "../../index.css";
import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableRow,
  Button,
  Stack,
} from "@mui/material";
import React, { useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import FileUpload from "./FileUpload.js";
import Popup from "./popup";
import axios from "axios";
import ProgressAnimation from "../../Components/Animation/Animation";
import Swal from "sweetalert2";
//import React, {  } from 'react';
let JobView = ({ files }) => {
  document.title = "New Project";
  const location = useLocation();
  // eslint-disable-next-line
  const [data, setData] = useState(null);
  const [getdata, setGetData] = useState([]);
  const [newfiles, setFiles] = useState([]);
  const [fileArray, setFilesArray] = useState([files]);
  const [subJobName, setSubJobName] = useState(null);
  const [value, setValue] = React.useState(true);
  const [post, setPost] = React.useState(null);
  const [buttonPopup, setButtonPopup] = useState(false);
  const [print, setPrint] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true); //state used for unhiding and hiding as boolean
  const [loading, setLoading] = React.useState(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  var jobName = sessionStorage.getItem("Job Name");
  //let [flag, setFlag] = useState(false);
  let setFlag = false;
  //var jobName = sessionStorage.getItem("SubJob Name");
  //const [subJobNames, setsubJobNames] = useState([subjob_name]);
  let user_name = "admin";
  if (localStorage.getItem("queryName") !== null) {
    user_name = localStorage.getItem("queryName");
  }
  let timerInterval;
  let ClearFields = () => {
    document.getElementById("textfield1").value = "";
  };
  const FileUploadHandel = () => {
    setLoading(true);
    setSubJobName("");
    let duplicateFiles = [];
    {
      newfiles.map((filesName) => {
        getdata.map((item) =>
          item.jobName === jobName
            ? item.subJobs.map((subitem) =>
                subitem.sourceFiles.map((subfilesName) =>
                  subfilesName.sourceFileName ===
                  filesName.name.substring(0, filesName.name.indexOf("."))
                    ? ((setFlag = true),
                      duplicateFiles.push(subfilesName.sourceFileName))
                    : ""
                )
              )
            : ""
        );
      });
    }
    if (setFlag) {
      setSubJobName("");
      // Swal.fire(
      //   "Error",
      //   `Files with the following names already exist in the subjob: ${duplicateFiles.join(
      //     ", "
      //   )}`,
      //   "error"
      // );
      Swal.fire({
        title: "Error",
        text: `Files with the following names already exist in the subjob: ${duplicateFiles.join(
          ", "
        )}`,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      });
      setFiles(null);
      setFlag = false;
      setLoading(false);
    } else {
      //setSubJobName("");
      //console.log(subJobName);
      submitHandler();
    }
    setFiles(null);
    //setSubJobName("");
    if (subJobName.length > 1) {
      setSubJobName("");
      //console.log(subJobName);
    }
    //subJobClear(event);
  };
  let handleCall = () => {
    alert("invalid");
  };
  //console.log("New files name ", newfiles[0])
  let progress = () => {
    Swal.fire({
      // html: "<b></b> milliseconds.",
      title: "Uploading in progress...",
      timer: endTime && startTime ? endTime - startTime : 14000,
      timerProgressBar: true,
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 23);
      },
      willClose: () => {
        clearInterval(timerInterval);
        setIsVisible((isVisible) => !isVisible); //making it toggle after pop up ends
        setDisabled(true);
        //setSubJobName("");
        postCall();
      },
    });
  };
  let disableDuplicate = (e) => {
    //setIsVisible(true);
    setSubJobName(null);
    // console.log(subJobName);
    //setFiles(null);
    //ClearFields();
    // Swal.fire(
    //   "Error",
    //   `${e} already exist please enter another Sub Job name`,
    //   "error"
    // );
    Swal.fire({
      title: "Error",
      text: `${e} already exist please enter another Sub Job name`,
      icon: "error",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    });
  };
  let subjobgetValue = (event) => {
    setSubJobName(event.target.value);
    {
      getdata.map((item) =>
        item.jobName === jobName
          ? item.subJobs.map((subitem) =>
              subitem.subJobName === event.target.value
                ? disableDuplicate(subitem.subJobName)
                : ""
            )
          : ""
      );
    }
    sessionStorage.setItem("SubJob Name", event.target.value); //on change storing
  };
  //console.log(subJobName);
  const filesObj = location.state;
  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    user_name;
  React.useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": "123" } })
      .then((response) => {
        setGetData(response.data);
        setLoading(false);
        //setLoading(response.data);
        //console.log(response.data);
      });
  }, []);

  const submitHandler = () => {
    if (!setFlag) {
      const url =
        process.env.REACT_APP_BASE_PATH +
        process.env.REACT_APP_UPLOAD_FILE +
        "?user_name=" +
        user_name +
        "&job_name=" +
        jobName +
        "&sub_job_name=" +
        subJobName;
      //console.log(newfiles);
      setStartTime(new Date().getTime());
      let formData = new FormData();
      newfiles.forEach((file) => {
        formData.append("projectFiles", file);
      });
      axios
        .post(url, formData)
        .then((response) => {
          //console.log(response);
          //progress();
          postCall();
        })
        .catch((error) => {
          {
            error.response.data.map((e) => {
              console.log(e.message);
              postCall();
              if (e.statusCode === "400") {
                // Swal.fire("Error", e.message, e.fileName, "error");
                Swal.fire({
                  title: "Error",
                  text: `${e.message} in file: ${e.fileName}`,
                  icon: "error",
                  confirmButtonText: "OK",
                  customClass: {
                    popup: "custom-swal",
                    container: "custom-swal-overlay",
                  },
                });
              }
            });
          }
        });
      //setSubJobName("");
      //progress();
    }

    //setValue(false);
  };

  let postCall = () => {
    //setLoading(null);
    axios
      .get(baseURL, { headers: { "x-request-id": "123" } })
      .then((response) => {
        setGetData(response.data);
        //setLoading(response.data);
        //console.log(response.data);
        //setEndTime(new Date().getTime());
        setLoading(false);
      });
    setLoading(false);
  };
  if (!getdata) return null;
  //-------------------
  let handleClick = () => {
    FileUploadHandel();
    setSubJobName("");
    //clearTextField();
  };
  //  const clearTextField = () => {
  //   subJobName.current.value = '';
  // };

  //console.log(loading);
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
      <NavbarPrivate />
      <Sidenav />
      <form>
        <div className="jobview-border-box">
          <div>
            <h1 style={{ top: "-32px", textAlign: "center" }}>
              Job Name : {jobName}
            </h1>
            <div>
              <Box
                component="form"
                sx={{
                  "& > :not(style)": {
                    m: 1,
                    width: "64ch",
                    top: "17px",
                    left: "167px",
                  },
                }}
              >
                <TextField
                  id="textfield1"
                  label="Create next Sub Job"
                  variant="outlined"
                  onChange={subjobgetValue}
                />
              </Box>
            </div>
            <div className="overlap-wrapper">
              <Box className="view-wrapper">
                {" "}
                {console.log(getdata)}
                {getdata.map((item, jobItemsIndex) =>
                  item.jobName === jobName
                    ? item.subJobs.map((subJobItem, itemIndex) => (
                        <Card variant="outlined" className="card-box-scan">
                          <CardContent>
                            <Typography
                              sx={{ fontSize: 20 }}
                              gutterBottom
                              className="heading-subjob-upload"
                            >
                              {subJobItem.subJobName}
                              {/* Render delete button conditionally */}
                            </Typography>
                            {subJobItem.sourceFiles.map((items, index) => (
                              /* Display uploaded file name */
                              <Typography
                                sx={{ fontSize: 14 }}
                                gutterBottom
                                key={index}
                              >
                                <TableRow>{items.sourceFileName}</TableRow>
                              </Typography>
                            ))}
                          </CardContent>
                        </Card>
                      ))
                    : ""
                )}
              </Box>
              <div className="button-wrapper">
                <Stack spacing={4} direction="row">
                  <div>
                    {subJobName === null || subJobName === "" ? (
                      <Button
                        disabled={true}
                        for="myfile"
                        component="label"
                        variant="contained"
                      >
                        Upload
                      </Button>
                    ) : (
                      <Button
                        disabled={false}
                        for="myfile"
                        component="label"
                        variant="contained"
                      >
                        Upload
                      </Button>
                    )}
                    <FileUpload
                      files={files}
                      setFiles={setFiles}
                      setFilesArray={setFilesArray}
                      fileArray={fileArray}
                    />
                  </div>
                  <div>
                    {subJobName === null ||
                    subJobName === "" ||
                    newfiles === null ||
                    newfiles.length < 1 ||
                    newfiles.length > process.env.REACT_APP_FILE_SIZE ? (
                      <Button
                        disabled={true}
                        onClick={handleClick}
                        variant="contained"
                        component="label"
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        disabled={false}
                        onClick={() => {
                          FileUploadHandel() || ClearFields();
                        }}
                        component="label"
                        variant="contained"
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
                    <p>We will connected to backend soon.</p>
                  </Popup>
                  <Link component="button" to="/my-activity">
                    <Button variant="contained" component="label">
                      Back
                    </Button>
                  </Link>
                  <Button
                    // for="myfile"
                    component="label"
                    variant="contained"
                    // onClick={progress}
                    // disabled={editButtonClicked || !sourceFiles}
                  >
                    Edit Sub Job
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

sessionStorage.clear();
export default JobView;
