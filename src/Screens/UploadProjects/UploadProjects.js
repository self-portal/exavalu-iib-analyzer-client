import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableRow,
  Button,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import ProgressAnimation from "../../Components/Animation/Animation";
import "./UploadFile.css";
import "../../Components/Global/GlobalVariable";
import { Col, Container, Row } from "react-bootstrap";
import CryptoJS from "crypto-js";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// import "./UploadProjects.css";

let UploadProjects = () => {
  const [post, setPost] = React.useState(null);
  const [editButtonClicked, setEditButtonClicked] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isChangesMade, setIsChangesMade] = useState(false);
  const [subJobNameFetch, setSubJobNameFetch] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [addedFiles, setAddedFiles] = useState([]);
  const [collectSubjobFiles, setCollectSubjobFiles] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [sourceFiles] = useState([]);
  const [hide, setHide] = useState(false);
  const collectedSubJobsRef = useRef([]);
  const [value, setValue] = useState();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  let timerInterval;
  let user_name = "admin";
  const [encryptedQueryName] = useState(
    localStorage.getItem("queryName") || ""
  );
  global.queryName = CryptoJS.AES.decrypt(encryptedQueryName, secKey).toString(
    CryptoJS.enc.Utf8
  );

  let location = useLocation();
  const navigate = useNavigate();
  const projectNameFromLocation = location.state
    ? location.state.jobName
    : "DefaultProjectName";
  const [projectname] = useState(projectNameFromLocation);

  const navigateToUpload = (orgEvent) => {
    const updatedFileNames = [...chunkedItems];
    let subJobHasNoFiles = false;
    let invalidFile = false;
    updatedFileNames.forEach((job) => {
      if (job.subJobs) {
        job.subJobs.forEach((subJob) => {
          if (subJob.sourceFiles.length === 0) {
            subJobHasNoFiles = true;
            // setHide(true);
            return;
          }
          subJob.sourceFiles.map((subJobFile) => {
            if (subJobFile.isValid === false) {
              invalidFile = true;
              // setHide(true);
              return;
            }
          });
        });
      }
    });
    if (subJobHasNoFiles) {
      Swal.fire(
        "Error",
        "One or more subjobs have no files. Please add files or delete these subjobs to proceed.",
        "error"
      );
    } else if (invalidFile) {
      Swal.fire(
        "Error",
        "One or more file is Corrupted. Please remove them to proceed",
        "error"
      );
    } else {
      if (projectname) {
        if (location.state) {
          if (location.state.pageName === "open job") {
            navigate("/addsubjob", {
              state: { jobName: projectname, pageName: "open job" },
            });
          } else {
            navigate("/addnewsubjob", {
              state: { jobName: projectname, pageName: "new job" },
            });
          }
        } else {
          navigate("/addsubjob", {
            state: { jobName: projectname, pageName: "open job" },
          });
        }
      }
    }
  };
  const retrieveURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_JOB_DETAILS +
    "?user_name=" +
    user_name +
    "&job_name=" +
    projectname;

  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    user_name;

  const deleteURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_DELETE_FILE +
    "?user_name=" +
    user_name;

  const uploadURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_UPLOAD_FILE +
    "?user_name=" +
    user_name +
    "&job_name=" +
    projectname;

  const file_size = process.env.REACT_APP_FILE_SIZE;

  // useEffect(() => setProjectName(location.state.jobName), [location]);
  useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setPost(response.data);
      });
  }, [baseURL]);

  useEffect(() => {
    if (subJobNameFetch !== null) {
      collectedSubJobsRef.current.push(subJobNameFetch);
    }
  }, [subJobNameFetch]);

  function chunkArray(data) {
    if (data !== null) {
      let items = [];
      data.filter((item) => {
        if (item.jobName === projectname) {
          if (item.subJobs) {
            item.subJobs.forEach((subJob) => {
              if (!subJob.sourceFiles) {
                subJob.sourceFiles = [];
              }
            });
          }
          items.push(item);
        }
      });
      return items;
    }
  }
  const chunkedItems = chunkArray(post);

  useEffect(() => {
    hasFilesInSubjobs();
  }, [chunkedItems]);

  const hasFilesInSubjobs = () => {
    if (!chunkedItems) return false;
    const updatedFileNames = [...chunkedItems];
    updatedFileNames.forEach((job) => {
      if (job.subJobs) {
        if (job.subJobs.length !== 0) {
          job.subJobs.forEach((subJob) => {
            if (subJob.sourceFiles.length === 0) {
              setHide(true);
              return;
            }
            subJob.sourceFiles.forEach((file) => {
              if (file.isValid === false) {
                setHide(true);
                return;
              }
            });
          });
        } else {
          setHide(true);
          return;
        }
      }
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      collectedSubJobsRef.current = [];
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  let getLoading = (value) => {
    Swal.fire({
      // html: "<b></b> milliseconds.",
      title:
        value === "add"
          ? "Uploading in progress..."
          : "Deleting in progress...",

      timer: endTime && startTime ? endTime - startTime : 1693,
      timerProgressBar: true,
      padding: "30em",
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector("b");
        if (b) {
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
          }, 23);
        }
      },
      willClose: () => {
        clearInterval(timerInterval);
        // setIsVisible((isVisible) => !isVisible); //making it toggle after pop up ends
        setDisabled(true);
      },
    });
  };

  //Add files
  const handleFileUpload = (event, jobIndex, itemIndex) => {
    const selectedFiles = event.target.files;

    const updatedFileNames = [...chunkedItems];
    const jobDetails = updatedFileNames[jobIndex];
    setSubJobNameFetch(jobDetails.subJobs[itemIndex].subJobName);

    if (!jobDetails.subJobs[itemIndex].sourceFiles) {
      jobDetails.subJobs[itemIndex].sourceFiles = [];
    }

    const existingSourceFiles = [...jobDetails.subJobs[itemIndex].sourceFiles];
    const updatedAddedFiles = []; // Copy the existing addedFiles array
    const duplicateFileNames = [];
    // Add selected files to the updatedAddedFiles array
    for (const file of selectedFiles) {
      updatedAddedFiles.push(file);
    }

    // Collect all existing file names across all subjobs
    const existingFileNames = updatedFileNames.flatMap((job) =>
      job.subJobs.flatMap((subJob) =>
        subJob.sourceFiles.map((sourceFile) => sourceFile.sourceFileName)
      )
    );

    // Check if any selected file name already exists in the subjob

    for (const file of selectedFiles) {
      const fileNameWithoutExtension = file.name.split(".")[0]; //Split the filename.zip and then exclude .zip
      if (
        existingFileNames.includes(fileNameWithoutExtension) ||
        jobDetails.subJobs[itemIndex].sourceFiles.some(
          (sourceFile) => sourceFile.sourceFileName === fileNameWithoutExtension
        ) //some -> checks if any element in that array meet the condition then return true
      ) {
        duplicateFileNames.push(fileNameWithoutExtension);
      }
    }
    if (duplicateFileNames.length > 0) {
      // Swal.fire(
      //   "Error",
      //   `Files with the following names already exist in the subjob: ${duplicateFileNames.join(
      //     ", "
      //   )}`,
      //   "error"
      // );
      Swal.fire({
        title: "Error",
        text: `Files with the following names already exist in the subjob: ${duplicateFileNames.join(
          ", "
        )}`,
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      });
      return;
    }

    // Check if the subjob has reached the maximum allowed number of files
    if (
      jobDetails.subJobs[itemIndex].sourceFiles.length + selectedFiles.length >
      file_size
    ) {
      Swal.fire(
        "Error",
        "Subjob would exceed the maximum allowed number of files.",
        "error"
      );
      return;
    }
    // Add selected files to the subjob
    for (const file of selectedFiles) {
      const fileNameWithoutExtension = file.name.split(".")[0];
      existingSourceFiles.push({
        // sourceFileId: "1234",
        sourceFileId: uuidv4(), // Generate a unique ID for the file
        sourceFileName: fileNameWithoutExtension, // Use the filename without extension
      });
    }
    var createRequest = collectSubjobFiles.concat({
      subjobName: jobDetails.subJobs[itemIndex].subJobName,
      file: selectedFiles,
    });

    setCollectSubjobFiles(createRequest);
    const updatedFileItem = addedFiles.concat(updatedAddedFiles);
    setAddedFiles(updatedFileItem); // Update the addedFiles state
    // setAddedFiles(updatedAddedFiles);
    jobDetails.subJobs[itemIndex].sourceFiles = existingSourceFiles;
    setPost(updatedFileNames);
    setIsChangesMade(true);

    // Clear the input value after processing
    // event.target.value = null;
  };

  const handleDelete = (subJobIndex, jobItemsIndex, fileId) => {
    const updatedItems = [...chunkedItems];
    const subJob = updatedItems[jobItemsIndex];

    if (fileId) {
      // If fileId is provided, it means we're deleting a file, not the whole subjob
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const del = "delete";
          getLoading(del);
          // Create the request body
          let requestBody = {
            jobId: subJob.jobId,
            subJobs: [
              {
                subJobId: subJob.subJobs[subJobIndex].subJobId,
                isDeleted: false, // Do not delete the subjob, only the file
                sourceFilesId: [fileId],
              },
            ],
          };
          // Send delete request to the endpoint
          setStartTime(new Date().getTime());
          axios
            .delete(deleteURL, {
              headers: { "Content-Type": "application/json" },
              data: requestBody,
            })
            .then((response) => {
              setEndTime(new Date().getTime());
              setHide(false);
              const fileToDelete = subJob.subJobs[
                subJobIndex
              ].sourceFiles.filter((item) => item.sourceFileId === fileId);
              let data = [...collectSubjobFiles];
              if (response.data.message == "File Deleted Successfully") {
                setCollectSubjobFiles(
                  deleteFileByFilename(data, fileToDelete[0].sourceFileName)
                );
              }

              // Update local state if the delete request was successful
              const updatedSourceFiles = subJob.subJobs[
                subJobIndex
              ].sourceFiles.filter((item) => item.sourceFileId !== fileId);
              subJob.subJobs[subJobIndex].sourceFiles = updatedSourceFiles;

              setPost(updatedItems);

              Swal.fire({
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 1000,
                customClass: {
                  popup: "custom-swal",
                  container: "custom-swal-overlay",
                },
              });
            })
            .catch((error) => {
              Swal.fire("Error", error.response.data.message, "error");
            });
          setIsVisible(false);
          setEditButtonClicked(false);
        }
      });
    } else {
      // If fileId is not provided, it means we're deleting the whole subjob
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete the subjob!",
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const del = "delete";
          getLoading(del);
          // Create the request body to delete the entire subjob
          let requestBody = {
            jobId: subJob.jobId,
            subJobs: [
              {
                subJobId: subJob.subJobs[subJobIndex].subJobId,
                isDeleted: true, // Delete the whole subjob
                sourceFilesId: [], // No need to specify file IDs
              },
            ],
          };
          // Send delete request to the endpoint
          setStartTime(new Date().getTime());
          axios
            .delete(deleteURL, {
              headers: { "Content-Type": "application/json" },
              data: requestBody,
            })
            .then((response) => {
              setHide(false);
              setEndTime(new Date().getTime());
              // Remove the deleted subjob from the chunkedItems array
              subJob.subJobs.splice(subJobIndex, 1);

              setPost(updatedItems);
              setIsChangesMade(false);

              Swal.fire({
                icon: "success",
                title: response.data.message,
                showConfirmButton: false,
                timer: 1000,
                customClass: {
                  popup: "custom-swal",
                  container: "custom-swal-overlay",
                },
              });
            })
            .catch((error) => {
              // Swal.fire("Error", error.response.data.message, "error");
              Swal.fire({
                title: "Error",
                text: error.response.data.message,
                icon: "error",
                confirmButtonText: "OK",
                customClass: {
                  popup: "custom-swal",
                  container: "custom-swal-overlay",
                },
              });
            });
          setIsVisible(false);
          setEditButtonClicked(false);
        }
      });
    }
  };

  function deleteFileByFilename(data, filenameToDelete) {
    try {
      return data.map((item) => {
        let updatedFile = {};
        const fileListArr = Array.from(item.file);
        for (const key in item.file) {
          if (item.file[key].name === filenameToDelete + ".zip") {
            // updatedFile[key] = item.file[key];
            fileListArr.splice(key, 1);
            updatedFile = fileListArr;
          } else {
            updatedFile = fileListArr;
          }
        }
        return { ...item, file: updatedFile };
      });
    } catch (error) {
      console.log("error", error);
    }
  }
  let progress = (event) => {
    setIsVisible((isVisible) => !isVisible);
    setEditButtonClicked(true);
    if (!isChangesMade) {
      setSubmitButtonDisabled(true);
    }
  };

  let progressSubmit = (event) => {
    if (event) {
      Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, submit it!",
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const del = "add";
          getLoading(del);

          if (subJobNameFetch != null && collectSubjobFiles.length > 0) {
            collectSubjobFiles.map((subjob) => {
              const url = uploadURL + "&sub_job_name=" + subjob.subjobName;
              let formData = new FormData();
              for (const file of subjob.file) {
                formData.append("projectFiles", file);
              }
              {
                axios
                  .post(url, formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                      "x-request-id": uuidv4(),
                    },
                  })
                  .then((response) => {
                    setCollectSubjobFiles([]);

                    // setValidFiles(response.data[0].message);
                    collectedSubJobsRef.current = [];
                    axios
                      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
                      .then((response) => {
                        setEndTime(new Date().getTime());
                        setHide(false);
                        setPost(response.data);
                        setCollectSubjobFiles([]);
                      });
                    Swal.fire({
                      // position: 'top-end',
                      icon: "success",
                      title: response.data[0].message,
                      showConfirmButton: false,
                      // timer: 1500,
                      customClass: {
                        popup: "custom-swal",
                        container: "custom-swal-overlay",
                      },
                    });
                  })
                  .catch((error) => {
                    axios
                      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
                      .then((response) => {
                        setHide(false);
                        setPost(response.data);
                        setCollectSubjobFiles([]);
                      });

                    !!error.response.data.length
                      ? Swal.fire(
                          "Error",
                          error.response.data[0].message,
                          "error"
                        )
                      : Swal.fire("Error", error.response.data.error, "error");
                  });
              }
            });

            setStartTime(new Date().getTime());
          }

          setEditButtonClicked(false);
          setSubmitButtonDisabled(true);
          setIsChangesMade(false);
          setIsVisible((isVisible) => !isVisible);
        }
      });
    }
  };

  let backOnCondition = (orgEvent) => {
    const updatedFileNames = [...chunkedItems];
    let subJobHasNoFiles = false;
    let invalidFile = false;
    let jobHasNoSubjob = false;

    updatedFileNames.forEach((job) => {
      if (job.subJobs.length !== 0) {
        job.subJobs.forEach((subJob) => {
          if (subJob.sourceFiles.length === 0) {
            subJobHasNoFiles = true;
            // setHide(true);
            return;
          }
          subJob.sourceFiles.map((subJobFile) => {
            if (subJobFile.isValid === false) {
              invalidFile = true;
              // setHide(true);
              return;
            }
          });
        });
      } else {
        jobHasNoSubjob = true;
        return;
      }
    });
    if (subJobHasNoFiles) {
      Swal.fire(
        "Error",
        "One or more subjobs have no files. Please add files or delete these subjobs to proceed.",
        "error"
      );
    } else if (invalidFile) {
      Swal.fire(
        "Error",
        "One or more file is Corrupted. Please remove them to proceed",
        "error"
      );
    } else if (jobHasNoSubjob) {
      Swal.fire(
        "Error",
        "No Subjob is present in this job. Please add one subjob to proceed.",
        "error"
      );
    } else {
      if (location.state) {
        if (location.state.pageName === "open job") {
          navigate("/selectprojectname", {
            state: { Menu: orgEvent.currentTarget.id },
          });
        } else {
          navigate("/newjob", { state: { Menu: orgEvent.currentTarget.id } });
        }
      } else {
        navigate("/selectprojectname", { state: { jobName: value } });
      }
    }
  };

  return post !== null ? (
    <>
      <NavbarPrivate uploadProjectChoice={hide} />
      <Sidenav uploadProjectChoice={hide} />
      <div className="openjob-container-fluid">
        <div
          id="scanjob-name-header"
          style={{
            fontFamily: "Domine",
            marginTop: "25px",
            marginBottom: "-25px",
          }}
        >
          <h4>JOB NAME : {projectname}</h4>
        </div>
        <div id="openjob-boxposition">
          <Box>
            {!!chunkedItems.length &&
              chunkedItems.map((item, jobItemsIndex) =>
                item.subJobs && item.subJobs.length > 0 ? (
                  item.subJobs.map((subJobItem, itemIndex) => (
                    <Card
                      key={subJobItem.subJobId}
                      variant="outlined"
                      id="openproject-box-table"
                      style={{
                        // margin: "5px 20px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        background: "#fafafa",
                        transition: "0.3s ease",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0px 8px 16px rgba(0, 0, 0, 0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0px 4px 8px rgba(0, 0, 0, 0.1)";
                      }}
                    >
                      <CardContent>
                        <Typography
                          sx={{ fontSize: 20 }}
                          gutterBottom
                          id="openJob-heading-subjob-upload"
                        >
                          <Container>
                            <Row style={{ padding: "15px 0" }}>
                              {/* <Col>Subjob Name: {subJobItem.subJobName}</Col> */}
                              <Col>
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#333",
                                  }}
                                >
                                  Subjob Name: {subJobItem.subJobName}
                                </h3>
                              </Col>
                              {/* <Col>Validation Status</Col> */}
                              <Col>
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    color: "#333",
                                  }}
                                >
                                  Validation Status
                                </h3>
                              </Col>
                              <div id="openproject-addbutton">
                                {isVisible ? (
                                  <>
                                    <input
                                      type="file"
                                      accept=".zip"
                                      style={{ display: "none" }}
                                      id={`contained-button-file-${itemIndex}-${jobItemsIndex}`} // Unique IDs for each input
                                      multiple
                                      onChange={(e) =>
                                        handleFileUpload(
                                          e,
                                          jobItemsIndex,
                                          itemIndex
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`contained-button-file-${itemIndex}-${jobItemsIndex}`}
                                    >
                                      {/* <Button component="span">Add</Button> */}
                                      <Button
                                        variant="contained"
                                        component="span"
                                        style={{
                                          marginLeft: "-9px",
                                          marginBottom: "5px",
                                          fontWeight: 500,
                                          padding: "2px 3px",
                                          borderRadius: "8px",
                                          boxShadow:
                                            "0 4px 12px rgba(30, 136, 229, 0.3)",
                                          textTransform: "none",
                                          fontSize: "16px",
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </label>
                                  </>
                                ) : (
                                  <></>
                                )}
                                {subJobItem.sourceFiles &&
                                subJobItem.sourceFiles.length < 1 ? (
                                  <>
                                    <CloseIcon
                                      cursor="pointer"
                                      onClick={() =>
                                        handleDelete(itemIndex, jobItemsIndex)
                                      }
                                    />
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </Row>
                          </Container>
                        </Typography>
                        {subJobItem.sourceFiles &&
                          subJobItem.sourceFiles.map((items, index) => (
                            /* Display uploaded file name */
                            <Typography
                              sx={{ fontSize: 14 }}
                              gutterBottom
                              key={index}
                            >
                              <Container>
                                <Row>
                                  {/* <Col>{items.sourceFileName}</Col> */}
                                  <Col>
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        color: "#555",
                                        padding: "5px",
                                      }}
                                    >
                                      {items.sourceFileName}
                                    </span>
                                  </Col>

                                  <Col>
                                    {items.isValid === true ? (
                                      <TableRow id="openvaild-file">
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            backgroundColor: "#e8f5e9",
                                            color: "#388e3c",
                                            padding: "5px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            marginLeft: "-16px",
                                          }}
                                        >
                                          <CheckCircleOutlineIcon
                                            style={{
                                              marginRight: "5px",
                                              fontSize: "15px",
                                            }}
                                          />
                                          VALID
                                        </span>
                                      </TableRow>
                                    ) : items.isValid === false ? (
                                      <TableRow id="openinvaild-file">
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            backgroundColor: "#ffebee",
                                            color: "#d32f2f",
                                            padding: "5px 10px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            marginLeft: "-24px",
                                          }}
                                        >
                                          CORRUPTED
                                        </span>
                                      </TableRow>
                                    ) : null}
                                  </Col>
                                  <div id="openproject-closebutton">
                                    {isVisible ? (
                                      <CloseIcon
                                        cursor="pointer"
                                        onClick={() =>
                                          handleDelete(
                                            itemIndex,
                                            jobItemsIndex,
                                            items.sourceFileId,
                                            index
                                          )
                                        }
                                      />
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </Row>
                              </Container>
                            </Typography>
                          ))}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p>Please add at least one sub job to proceed.</p>
                )
              )}
            <div class="d-flex justify-content-center">
              <Stack spacing={2} direction="row" style={{ padding: "10px" }}>
                {chunkedItems.some(
                  (job) => job.subJobs && job.subJobs.length > 0
                ) && (
                  <Button
                    for="myfile"
                    component="label"
                    variant="contained"
                    onClick={progress}
                    disabled={editButtonClicked || !sourceFiles}
                  >
                    Edit Sub Job
                  </Button>
                )}

                {chunkedItems.some(
                  (job) => job.subJobs && job.subJobs.length > 0
                ) && (
                  <Button
                    variant="contained"
                    onClick={progressSubmit}
                    component="label"
                    disabled={
                      (submitButtonDisabled || !sourceFiles) && !isChangesMade
                    }
                  >
                    Submit
                  </Button>
                )}

                <Button
                  variant="contained"
                  component="label"
                  id="OpenJob"
                  onClick={(orgEvent) => navigateToUpload(orgEvent)}
                >
                  Add Subjob
                </Button>

                <Button
                  variant="contained"
                  component="label"
                  id="OpenJob"
                  onClick={(orgEvent) => backOnCondition(orgEvent)}
                >
                  Back
                </Button>
              </Stack>
            </div>
          </Box>
        </div>
      </div>
    </>
  ) : (
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
  );
};
export default UploadProjects;
