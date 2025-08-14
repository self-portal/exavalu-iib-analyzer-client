import React, { useEffect, useState, useRef } from "react";
import ProgressAnimation from "../../Components/Animation/Animation";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableRow,
  Button,
  Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import FileUpload from "../NewProject/FileUpload.js";
import "../../Components/Global/GlobalVariable";
import { useLocation } from "react-router-dom";
import axios from "axios";
import UploadProjects from "./UploadProjects";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import "./AddNewSubJob.css";

let AddNewSubjobs = () => {
  const [loading, setLoading] = React.useState(false);
  const [getdata, setGetData] = useState([]);
  const [files, setFiles] = useState([]);
  const [subJobName, setSubJobName] = useState(null);
  const [fileArray, setFilesArray] = useState([files]);
  const [duplicateFile, setDuplicateFile] = useState("");
  const [hide, setHide] = useState(false);
  const [uploadprojectsview, setuploadprojectsview] = useState(false);
  let user_name = "admin";
  const [encryptedQueryName] = React.useState(
    localStorage.getItem("queryName") || ""
  );
  user_name = CryptoJS.AES.decrypt(
    encryptedQueryName,
    process.env.REACT_APP_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);
  useEffect(() => {
    hasFilesInSubjobs();
  }, [getdata]);

  const hasFilesInSubjobs = () => {
    if (!getdata) return false;
    const updatedFileNames = [...getdata];
    updatedFileNames.forEach((job) => {
      if (job.jobName === projectname) {
        if (job.subJobs) {
          if (job.subJobs.length !== 0) {
            job.subJobs.forEach((subJob) => {
              if (subJob.sourceFiles.length === 0) {
                return;
              }
              subJob.sourceFiles.forEach((file) => {
                if (file.isValid === false) {
                  return;
                }
              });
            });
          } else {
            setHide(true);
            return;
          }
        }
      }
    });
  };
  let location = useLocation();
  const navigateToUpload = () => {
    if (projectname) {
      if (location.state) {
        if (location.state.pageName === "open job") {
          navigate("/UploadProjects", {
            state: { jobName: projectname, pageName: "open job" },
          });
        } else {
          navigate("/newjobprojects", {
            state: { jobName: projectname, pageName: "new job" },
          });
        }
      }
    }
  };

  const navigate = useNavigate();
  const projectNameFromLocation = location.state
    ? location.state.jobName
    : "DefaultProjectName";
  const [projectname] = useState(projectNameFromLocation);
  let setFlag = false;
  const filesObj = location.state;
  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    user_name;

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
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setGetData(response.data);
        setLoading(false);
        setuploadprojectsview(false);
      });
  }, []);

  let ClearFields = () => {
    document.getElementById("textfield1").value = "";
  };
  const FileUploadHandel = () => {
    setLoading(true);
    setSubJobName("");
    let duplicateFiles = [];
    {
      files.map((files) => {
        getdata.map((item) => {
          if (item.jobName === projectname) {
            if (!item.subJobs) {
              // If subJobs array doesn't exist, create an empty array
              item.subJobs = [];
            }
            item.subJobs.map((subitem) =>
              subitem.sourceFiles.map((subfilesName) =>
                subfilesName.sourceFileName ===
                files.name.substring(0, files.name.indexOf("."))
                  ? ((setFlag = true),
                    duplicateFiles.push(subfilesName.sourceFileName))
                  : ""
              )
            );
          }
        });
      });
    }
    if (setFlag) {
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
      navigateToUpload();
    } else {
      submitHandler();
      // Swal.fire({
      //     icon: "success",
      //     //title: response.data.message,
      //     showConfirmButton: false,
      //     timer: 1000,
      //   });
    }
    setFiles(null);
    if (subJobName.length > 1) {
      setSubJobName("");
    }
    //setuploadprojectsview(true);
  };
  let disableDuplicate = (e) => {
    setSubJobName(null);
    Swal.fire({
      icon: "error",
      title: "ERROR",
      text: `"${e}" already exist... Please enter another Sub Job Name`,
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    });
  };
  let subjobgetValue = (event) => {
    setSubJobName(event.target.value);
    {
      getdata.map(
        (item) => {
          if (item.jobName === projectname) {
            if (!item.subJobs) {
              // If subJobs array doesn't exist, create an empty array
              item.subJobs = [];
            }
            item.subJobs.map((subitem) =>
              subitem.subJobName === event.target.value
                ? disableDuplicate(subitem.subJobName)
                : ""
            );
          }
        }
        // item.jobName === projectname
        //   ? item.subJobs.map((subitem) =>
        //       subitem.subJobName === event.target.value
        //         ? disableDuplicate(subitem.subJobName)
        //         : ""
        //     )
        //   : ""
      );
    }
    sessionStorage.setItem("SubJob Name", event.target.value); //on change storing
  };
  const submitHandler = () => {
    if (!setFlag) {
      const url =
        process.env.REACT_APP_BASE_PATH +
        process.env.REACT_APP_UPLOAD_FILE +
        "?user_name=" +
        user_name +
        "&job_name=" +
        projectname +
        "&sub_job_name=" +
        subJobName;
      let formData = new FormData();
      files.forEach((file) => {
        formData.append("projectFiles", file);
      });
      axios
        .post(url, formData)
        .then((response) => {
          postCall();
          navigateToUpload();
        })
        .catch((error) => {
          {
            if (error.response) {
              !!error.response.data.length
                ? Swal.fire("Error", error.response.data[0].message, "error")
                : Swal.fire("Error", error.response.data.error, "error");
              navigateToUpload();
            } else {
              toast.error("Check Backend !!", {
                toastId: "error 20",
              });
              navigateToUpload();
            }
            // !!error.response.data.length
            //   ? Swal.fire("Error", error.response.data[0].message, "error")
            //   : Swal.fire("Error", error.response.data.error, "error");
            // navigateToUpload();
          }
        });
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  let postCall = () => {
    //setLoading(null);
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setGetData(response.data);
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
      {uploadprojectsview ? (
        <UploadProjects />
      ) : (
        <>
          <NavbarPrivate uploadProjectChoice={hide} />
          <Sidenav uploadProjectChoice={hide} />
          <div className="openjob-container-fluid">
            <div id="addsubjob-border-box" className="mt-2  bg-light rounded">
              <div id="scanjob-name-header" className="text-center mb-2">
                <h2
                  className="font-weight-bold"
                  style={{ fontFamily: "Domine", fontSize: "1.8rem" }}
                >
                  JOB NAME : {projectname}
                </h2>
              </div>
              <div
                className="create-upload-container"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Box
                  sx={{
                    "& > :not(style)": {
                      m: 1,
                      marginLeft: "15px",
                      width: "98%",
                      // height: "100%",
                      top: "0px",
                      paddingBottom: "0.8%",
                    },
                  }}
                  style={{ flexGrow: 1 }}
                >
                  <TextField
                    id="textfield1"
                    label="Create Sub Job"
                    variant="outlined"
                    onChange={subjobgetValue}
                    fullWidth
                    // sx={{
                    //   height: "59px", // Set the desired height
                    //   "& .MuiOutlinedInput-root": {
                    //     height: "100%", // Ensures the input area fills the entire height
                    //     "& input": {
                    //       padding: "14px", // Adjust padding inside the input field
                    //     },
                    //   },
                    // }}
                  />
                </Box>
                <div style={{ marginLeft: "10px", marginRight: "15px" }}>
                  {subJobName === null || subJobName === "" ? (
                    <Button
                      disabled={true}
                      for="myfile"
                      component="label"
                      variant="contained"
                      className="upload-button mb-1"
                      style={{
                        padding: "14px 20px",
                        fontSize: "1rem",
                        borderRadius: "5px",
                      }}
                    >
                      Upload
                    </Button>
                  ) : (
                    <Button
                      disabled={false}
                      for="myfile"
                      component="label"
                      variant="contained"
                      className="upload-button mb-1"
                      style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        padding: "14px 20px",
                        fontSize: "1rem",
                        borderRadius: "5px",
                        boxShadow: "0px 4px 10px rgba(0, 123, 255, 0.3)",
                      }}
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
              </div>

              {/* Upload Button and File List */}
              <div className="d-flex flex-column align-items-center mb-1">
                {/* <div>
                  {subJobName === null || subJobName === "" ? (
                    <Button
                      disabled={true}
                      for="myfile"
                      component="label"
                      variant="contained"
                      className="upload-button mb-3"
                      style={{
                        padding: "10px 20px",
                        fontSize: "1rem",
                        borderRadius: "5px",
                      }}
                    >
                      Upload
                    </Button>
                  ) : (
                    <Button
                      disabled={false}
                      for="myfile"
                      component="label"
                      variant="contained"
                      className="upload-button mb-3"
                      style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        padding: "10px 20px",
                        fontSize: "1rem",
                        borderRadius: "5px",
                        boxShadow: "0px 4px 10px rgba(0, 123, 255, 0.3)",
                      }}
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
                </div> */}

                {/* Display the selected files */}
                {/* {files && files.length > 0 && (
                  <ul className="list-group w-75">
                    {Array.from(files).map((file, index) => (
                      <li key={index} className="list-group-item">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )} */}
                <div className="selected-file">
                  {files && files.length > 0 ? (
                    Array.from(files).map((file, index) => (
                      <div key={index} className="selected-file-badge">
                        {file.name}
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveFile(index)}
                        >
                          {/* &#10006; */}
                        </button>
                      </div>
                    ))
                  ) : (
                    <span>No file selected</span>
                  )}
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div
                className="d-flex justify-content-center"
                id="addsubjob-button"
              >
                <Stack spacing={2} direction="row">
                  {/* <Button
                    variant="contained"
                    component="label"
                    disabled={!subJobName || !files || files.length < 1}
                    onClick={() => {
                      FileUploadHandel();
                      ClearFields();
                    }}
                  >
                    Submit
                  </Button> */}
                  {subJobName === null ||
                  subJobName === "" ||
                  files === null ||
                  files.length < 1 ||
                  files.length > process.env.REACT_APP_FILE_SIZE ? (
                    <Button
                      disabled={true}
                      // onClick={handleClick}
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

                  <Button
                    variant="contained"
                    component="label"
                    onClick={navigateToUpload}
                  >
                    Cancel
                  </Button>
                </Stack>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddNewSubjobs;
