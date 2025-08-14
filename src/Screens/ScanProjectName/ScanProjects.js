import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableRow,
  Button,
  Stack,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import Swal from "sweetalert2";
import "./Style.css";
import { Col, Container, Row } from "react-bootstrap";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
// import Checkbox from "@mui/material/Checkbox";
import { Checkbox, FormControlLabel } from "@mui/material";
import ProgressAnimation from "../../Components/Animation/Animation";
import "../../Components/Global/GlobalVariable";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { useLocation } from "react-router-dom";

let ScanProjects = (props) => {
  // const { row } = props;
  console.log(props);
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  // const [open, setOpen] = React.useState(false);
  // const sourceFileId = JSON.stringify(row.applicationMasterId);

  // console.log("SOURCEFILE ID :::::::", sourceFileId);

  //File name store in session storage
  var project_name = localStorage.getItem("project_name");

  // // Function to log all items in localStorage
  // const logLocalStorageItems = () => {
  //   console.log("All items in localStorage:");
  //   for (let i = 0; i < localStorage.length; i++) {
  //     const key = localStorage.key(i);
  //     const value = localStorage.getItem(key);
  //     console.log(`${key}: ${value}`);
  //   }
  // };

  // // Call the function to log items (can be done on component mount or button click)
  // useEffect(() => {
  //   logLocalStorageItems();
  // }, []);

  const [post, setPost] = React.useState([]);
  const xRequestId = uuidv4();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  const [encryptedQueryName] = useState(
    localStorage.getItem("queryName") || ""
  );
  global.queryName = CryptoJS.AES.decrypt(encryptedQueryName, secKey).toString(
    CryptoJS.enc.Utf8
  );
  //----------------------------------------------------------
  // let user_name = "admin";
  // if (localStorage.getItem("queryName") !== null) {
  //   user_name = localStorage.getItem("queryName");
  // }
  //------------------------------------------------------------
  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    global.queryName;
  const [editButtonClicked, setEditButtonClicked] = useState(true);
  const [scanAllDisabled, setscanAllnDisabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [sourceFiles] = useState([]);
  const [fileNames] = useState([]);
  const [subJobLevel, setSubJobLevel] = useState("");
  const [value, setValue] = useState([]);
  //const [data, setData] = useState("");
  const [checked, setChecked] = React.useState(false);
  const [jobData, setJobData] = React.useState([]);
  const [subJobData, setSubJobData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list, setList] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [chunkedItems, setChunkedItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sourceFileID, setSourceFileID] = useState("");
  const dependencyNetworkURL =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_SOURCE_FILE_FLOW;

  // console.log(dependencyNetworkURL);

  // const handleSelectAll = (e) => {
  //   setEditButtonClicked(true);
  //   {
  //     chunkedItems.map((item) =>
  //       item.subJobs.map((subitem) =>
  //         !selectAll
  //           ? subitem.sourceFiles.map((sourceFilesitem) =>
  //               !sourceFilesitem.isScanned ? setEditButtonClicked(false) : ""
  //             )
  //           : ""
  //       )
  //     );
  //   }
  //   {
  //     chunkedItems.map((item) =>
  //       item.subJobs.map((subitem) =>
  //         !selectAll
  //           ? subitem.sourceFiles.map((sourceFilesitem) =>
  //               sourceFilesitem.isScanned ? setEditButtonClicked(true) : ""
  //             )
  //           : ""
  //       )
  //     );
  //   }
  //   setSelectAll(!selectAll);
  //   setChunkedItems((prevData) =>
  //     prevData.map((job) => ({
  //       ...job,
  //       subJobs: job.subJobs.map((subJob) => ({
  //         ...subJob,
  //         checked: !selectAll,
  //       })),
  //     }))
  //   );
  // };

  const handleSelectAll = (e) => {
    let shouldEnableEditButton = false;
    let allScanned = true;

    // Check if the first file is not scanned
    if (chunkedItems.length > 0 && chunkedItems[0].subJobs.length > 0) {
      const firstFile = chunkedItems[0].subJobs[0].sourceFiles[0];
      if (firstFile && !firstFile.isScanned) {
        shouldEnableEditButton = true;
      }
    }

    chunkedItems.forEach((item) =>
      item.subJobs.forEach((subitem) => {
        subitem.sourceFiles.forEach((sourceFilesitem) => {
          if (!sourceFilesitem.isScanned) {
            shouldEnableEditButton = false;
            allScanned = false;
          }
          // else if (sourceFilesitem.isScanned) {
          //   shouldEnableEditButton = true;
          // }
        });
      })
    );

    if (!shouldEnableEditButton) {
      console.log("All files are scanned, edit button will remain disabled.");
      // shouldEnableEditButton = true;
    }

    if (allScanned) {
      shouldEnableEditButton = true;
    }

    if (selectAll) {
      shouldEnableEditButton = true;
    }

    setEditButtonClicked(shouldEnableEditButton);

    setSelectAll(!selectAll);

    setChunkedItems((prevData) => {
      return prevData.map((job) => ({
        ...job,
        subJobs: job.subJobs.map((subJob) => ({
          ...subJob,
          checked: !selectAll,
        })),
      }));
    });
  };

  React.useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": xRequestId } })
      .then((response) => {
        setPost(response.data);
        setLoading(false);
      });
  }, []);

  // console.log("POST DATA::::::::::", post);

  React.useEffect(() => {
    if (post.length > 0) {
      setChunkedItems(chunkArray(post));
    }
    //setLoading(false);
  }, [post]);

  function chunkArray(Data) {
    if (Data !== null) {
      let items = [];
      Data.map((item) => {
        item.subJobs.map((subJobItem) => (subJobItem.checked = false));
        if (item.jobName === project_name) {
          items.push(item);
        }
      });
      return items;
    }
    {
      !!chunkedItems.length &&
        chunkedItems.map((item, jobItemsIndex) =>
          item.subJobs.map((subJobItem) =>
            subJobItem.sourceFiles.map((sourceFileIitems) =>
              sourceFileIitems.isScanned ? setscanAllnDisabled(true) : ""
            )
          )
        );
    }
  }
  const scanurl =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_SCAN_FILE +
    "?user_name=" +
    global.queryName;

  let scanSubJob = () => {
    const addObject = [];
    let data = [];
    if (selectAll) {
      data = [
        {
          jobId: chunkedItems[0].jobId,
          jobName: chunkedItems[0].jobName,
          jobDescription: chunkedItems[0].jobDescription,
          subJobs: chunkedItems[0].subJobs
            .map((item, index) => ({
              subJobId: item.subJobId,
              subJobName: item.subJobName,
              subJobDescription: item.subJobDescription,
              isValid: item.isValid,
              sourceFiles: item.sourceFiles
                .map((sourceFileIitems) =>
                  !sourceFileIitems.isScanned && sourceFileIitems.isValid
                    ? sourceFileIitems
                    : null
                )
                .filter((e) => !!e),
            }))
            .filter((d) => !!d),
        },
      ];
      console.log("IF DATA:::", data);

      setLoading(true);
    } else {
      updatevalue();
      data = [
        {
          jobId: chunkedItems[0].jobId,
          jobName: chunkedItems[0].jobName,
          jobDescription: chunkedItems[0].jobDescription,
          subJobs: chunkedItems[0].subJobs
            .map((item, index) =>
              item.checked
                ? {
                    subJobId: item.subJobId,
                    subJobName: item.subJobName,
                    subJobDescription: item.subJobDescription,
                    isValid: item.isValid,
                    sourceFiles: item.sourceFiles
                      .map((sourceFilesitem) =>
                        !sourceFilesitem.isScanned ? sourceFilesitem : null
                      )
                      .filter((e) => !!e),
                  }
                : null
            )
            .filter((e) => !!e),
        },
      ];
      console.log("ELSE DATA:::", data);
      setLoading(true);
    }
    //console.log("Request data", data);
    axios
      .post(scanurl, data, { headers: { "x-request-id": xRequestId } })
      .then((response) => {
        setIsVisible(true);
        setValue(response.data);
        setLoading(false);
        //console.log(response.data);
        setSubJobData([]);
        setSubJobLevel("");
        retrieveCall();
        setSelectAll(false);
      })
      .catch((error) => {
        console.log(error);
        retrieveCall();
        setLoading(false);
      });
    setEditButtonClicked(true);
    //console.log(post);
    // console.log("Select all data", data);
  };

  let retrieveCall = () => {
    axios
      .get(baseURL, { headers: { "x-request-id": xRequestId } })
      .then((response) => {
        setPost(response.data);
        setLoading(false);
      });
    //console.log(post)
  };

  let handleChange = (e, index, itemIndex) => {
    setChunkedItems((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index] };
      newData[index].subJobs = [...newData[index].subJobs];
      newData[index].subJobs[itemIndex] = {
        ...newData[index].subJobs[itemIndex],
        checked: !newData[index].subJobs[itemIndex].checked,
        scaned:
          newData[index].subJobs[itemIndex].sourceFiles
            .map((item) => item.isScanned)
            .filter((e) => e === false).length > 0
            ? false
            : true,
      };
      const allChecked = newData[index].subJobs.every(
        (subJob) => subJob.checked
      );
      // const select = newData[index].subJobs[index].sourceFiles.every(
      //   (subJob) => subJob.isScanned
      // );
      setEditButtonClicked(true);
      //console.log("New data", select);
      {
        newData.map((item) =>
          item.subJobs.map((subitem) =>
            subitem.checked && !subitem.scaned
              ? setEditButtonClicked(false)
              : ""
          )
        );
      }
      {
        newData.map((item) =>
          item.subJobs.map((subitem) =>
            subitem.checked && subitem.scaned ? setEditButtonClicked(true) : ""
          )
        );
      }
      setSelectAll(allChecked);
      return newData;
    });
  };

  let updatevalue = () => {
    setChunkedItems(chunkArray(post));
    setLoading(false);
    setEditButtonClicked(false);
  };

  // HANDLE CONVERT shifted to MigrateProject.js- 28/08/24
  // const handleConvert = (sourceFileName, subJobName, jobName) => {
  //   setLoading(true);
  //   setMessage("Converting, please wait...");

  //   console.log(`jobName: ${jobName}`);
  //   console.log(`subJobName: ${subJobName}`);
  //   console.log(`sourceFileName: ${sourceFileName}`);

  //   let matchingJobId = null;
  //   let matchingSubJobId = null;
  //   let matchingSourceFileId = null;
  //   let wrappedEdges = null;

  //   // Traverse the post data and print the object with the matching jobName
  //   if (Array.isArray(post)) {
  //     const matchingJob = post.find((job) => job.jobName === jobName);
  //     if (matchingJob) {
  //       console.log("Matching Job Object:", matchingJob);
  //       matchingJobId = matchingJob.jobId;
  //       console.log("Matching Job ID:", matchingJobId);

  //       const matchingSubJob = matchingJob.subJobs.find(
  //         (subJob) => subJob.subJobName === subJobName
  //       );
  //       if (matchingSubJob) {
  //         console.log("Matching SubJob Object:", matchingSubJob);
  //         matchingSubJobId = matchingSubJob.subJobId;
  //         console.log("Matching SubJob ID:", matchingSubJobId);

  //         const matchingSourceFile = matchingSubJob.sourceFiles.find(
  //           (sourceFile) => sourceFile.sourceFileName === sourceFileName
  //         );
  //         if (matchingSourceFile) {
  //           console.log("Matching SourceFile Object:", matchingSourceFile);
  //           matchingSourceFileId = matchingSourceFile.sourceFileId;
  //           console.log("Matching SourceFile ID:", matchingSourceFileId);
  //         } else {
  //           console.log(
  //             `No sourceFile found with sourceFileName: ${sourceFileName}`
  //           );
  //         }
  //       } else {
  //         console.log(`No subJob found with subJobName: ${subJobName}`);
  //       }
  //     } else {
  //       console.log(`No job found with jobName: ${jobName}`);
  //     }
  //   } else {
  //     console.error("Post data is not an array.");
  //   }

  //   const concatenatedId = `${matchingJobId}_${matchingSubJobId}_${matchingSourceFileId}`;
  //   console.log("Concatenated Master ID:", concatenatedId);

  //   if (concatenatedId) {
  //     const headers = {
  //       "Content-Type": "application/json",
  //       "x-request-id": xRequestId,
  //     };
  //     const queryParams = { source_file_id: concatenatedId };
  //     const fullUrl = `${dependencyNetworkURL}?${Object.keys(queryParams)
  //       .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
  //       .join("&")}`;

  //     axios
  //       .get(fullUrl, { headers })
  //       .then((response) => {
  //         const apiResponseData = response.data;
  //         console.log("API Response Data:", apiResponseData);

  //         const edgesArray = apiResponseData.edges;
  //         console.log("Edges from Response Data:", edgesArray);

  //         wrappedEdges = {
  //           edges: edgesArray,
  //         };

  //         console.log("Wrapped Edges Object:", wrappedEdges);

  //         if (!wrappedEdges || !wrappedEdges.edges) {
  //           throw new Error("Wrapped edges are not defined or empty.");
  //         }

  //         const secondHeaders = {
  //           "Content-Type": "application/json",
  //           masterId: concatenatedId,
  //         };

  //         return axios.post(
  //           "http://localhost:8080/getConnection",
  //           wrappedEdges,
  //           {
  //             headers: secondHeaders,
  //             responseType: "blob",
  //           }
  //         );
  //       })
  //       .then((secondResponse) => {
  //         console.log("Second API Response Data:", secondResponse.data);

  //         const fileName = secondResponse.headers.get("fileName");
  //         console.log("fileName: ", fileName);
  //         const filename = fileName ? fileName : "downloaded.zip";
  //         // const filename = "downloaded.zip";

  //         const blob = new Blob([secondResponse.data], {
  //           type: "application/octet-stream",
  //         });

  //         const url = window.URL.createObjectURL(blob);

  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", filename);
  //         document.body.appendChild(link);
  //         link.click();

  //         link.parentNode.removeChild(link);
  //         window.URL.revokeObjectURL(url);

  //         // Show success message
  //         Swal.fire({
  //           title: "Success!",
  //           text: "File has been successfully converted and downloaded.",
  //           icon: "success",
  //           confirmButtonText: "OK",
  //           customClass: {
  //             popup: "custom-swal",
  //             container: "custom-swal-overlay",
  //           },
  //         });
  //       })
  //       .catch((error) => {
  //         // alert("Error in second API call: " + error);
  //         Swal.fire({
  //           title: "Error!",
  //           text: "An error occurred during the conversion process.",
  //           icon: "error",
  //           confirmButtonText: "OK",
  //           customClass: {
  //             popup: "custom-swal",
  //             container: "custom-swal-overlay",
  //           },
  //         });
  //         console.error("API call failed:", error);
  //       })
  //       .finally(() => {
  //         setLoading(false);
  //         setMessage("");
  //       });
  //   }
  // };

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
      <ProgressAnimation message={message} />
    </div>
  ) : (
    <>
      <NavbarPrivate />
      <Sidenav />
      <div
        id="scanjob-name-header"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px 0",
          marginRight: "48rem",
          // marginBottom: "125px",
          // minHeight: "210vh",
        }}
      >
        <div
          style={{ marginBottom: "25px", marginTop: "-20px", height: "100%" }}
        >
          <Box
            id="box-size"
            style={{
              borderRadius: "8px",
              background: "#fff",
              padding: "20px",
              boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
              transform: "scale(0.95)",
              paddingBottom: "55px",
              maxWidth: "1000px",
              width: "100%",
              marginBottom: "40px",
            }}
          >
            <h4
              style={{
                textAlign: "center",
                marginBottom: "30px",
                fontWeight: "bold",
                color: "#333",
                fontSize: "24px",
                fontFamily: "Domine",
              }}
            >
              JOB NAME: {project_name}
            </h4>

            <Container
              style={{
                marginBottom: "30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Checkbox
                onChange={handleSelectAll}
                inputProps={{ "aria-label": "Select All" }}
                checked={selectAll}
                style={{
                  position: "relative",
                  left: "76.2%",
                  color: "#1e88e5",
                  transform: "scale(1.5)",
                }}
              />

              <Button
                variant="contained"
                onClick={scanSubJob}
                component="label"
                disabled={editButtonClicked}
                style={{
                  marginRight: "25px",
                  fontWeight: 500,
                  padding: "10px 30px",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(30, 136, 229, 0.3)",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Scan
              </Button>
            </Container>

            <Container>
              {chunkedItems.length > 0 &&
                chunkedItems.map((item, jobItemsIndex) =>
                  item.subJobs.map((subJobItem, itemIndex) => (
                    <Card
                      key={`${jobItemsIndex}-${itemIndex}`}
                      style={{
                        margin: "5px 20px",
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
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: "15px",
                            borderBottom: "1px solid #e0e0e0",
                            marginBottom: "15px",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#333",
                              textAlign: "left",
                            }}
                          >
                            Subjob Name: {subJobItem.subJobName}
                          </h3>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <h3
                              style={{
                                marginRight: "315px",
                                marginTop: "5px",
                                fontSize: "20px",
                                color: "#333",
                                alignItems: "center",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              Scan Status
                            </h3>
                            <Checkbox
                              onChange={() =>
                                handleChange(
                                  subJobItem.subJobName,
                                  jobItemsIndex,
                                  itemIndex
                                )
                              }
                              inputProps={{ "aria-label": "Select Subjob" }}
                              checked={subJobItem.checked}
                              style={{
                                color: "#1e88e5",
                                position: "absolute",
                                left: "74.5%",
                                transform: "scale(1.3)",
                              }}
                            />
                          </div>
                        </div>

                        {subJobItem.sourceFiles.map((sourceFileItem, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 0",
                              borderBottom:
                                index !== subJobItem.sourceFiles.length - 1
                                  ? "1px solid #f0f0f0"
                                  : "none",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "16px",
                                color: "#555",
                                fontWeight: "bold",
                              }}
                            >
                              {sourceFileItem.sourceFileName}
                            </span>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              {sourceFileItem.isScanned ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    backgroundColor: "#e8f5e9",
                                    color: "#388e3c",
                                    padding: "5px 10px",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    marginRight: "310px", // Adjusted margin
                                  }}
                                >
                                  <CheckCircleOutlineIcon
                                    style={{ marginRight: "5px" }}
                                  />
                                  SCANNED
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    backgroundColor: "#ffebee",
                                    color: "#d32f2f",
                                    padding: "5px 10px",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    marginRight: "310px", // Adjusted margin
                                  }}
                                >
                                  NOT SCANNED
                                </span>
                              )}
                              {/* <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleConvert(
                                    sourceFileItem.sourceFileName,
                                    subJobItem.subJobName,
                                    item.jobName
                                  )
                                }
                                style={{
                                  padding: "5px 15px",
                                  borderRadius: "8px",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  textTransform: "none",
                                  marginLeft: "10px",
                                  marginRight: "25px",
                                  // cursor: sourceFileItem.isScanned
                                  //   ? "pointer"
                                  //   : "not-allowed",
                                  // opacity: sourceFileItem.isScanned ? 1 : 0.5,
                                }}
                                disabled={!sourceFileItem.isScanned}
                              >
                                CONVERT
                              </Button> */}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))
                )}
            </Container>
          </Box>
        </div>
      </div>
    </>
  );
};

export default ScanProjects;
