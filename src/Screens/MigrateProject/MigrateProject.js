import React, { useState } from "react";
import { Box, Card, CardContent, Button } from "@mui/material";
import axios from "axios";

import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import Swal from "sweetalert2";
// import "../ScanProjectName/Style.css";
import { Container } from "react-bootstrap";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import ProgressAnimation from "../../Components/Animation/Animation";
import "../../Components/Global/GlobalVariable";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

import { useNavigate } from "react-router-dom";

let MigrateProject = (props) => {
  // const { row } = props;
  console.log(props);
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  const [scanAllDisabled, setscanAllnDisabled] = useState(false);

  // const [open, setOpen] = React.useState(false);
  // const sourceFileId = JSON.stringify(row.applicationMasterId);

  // console.log("SOURCEFILE ID :::::::", sourceFileId);

  //File name store in session storage
  var project_name = localStorage.getItem("project_name");

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

  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState("");

  const [chunkedItems, setChunkedItems] = useState([]);

  // CREATING THE BACKEND URL

  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    global.queryName;

  const dependencyNetworkURL =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_SOURCE_FILE_FLOW;

  // http://localhost:9092/getApplicationDetails
  const getApplicationDetailsUrl =
    process.env.REACT_APP_IIB_MIGRATOR_BASE_PATH +
    process.env.REACT_APP_APPLICATION_DETAILS;

  // http://localhost:9092/migrate
  const migrateUrl =
    process.env.REACT_APP_IIB_MIGRATOR_BASE_PATH +
    process.env.REACT_APP_MIGRATE_APPLICATION;

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

  const downloadmessages = [
    "Cloning...✅",
    "Modifying the template...✅",
    "IIB node analysis...✅",
    "IIB to mule flow conversion...✅",
    "Creating ZIP...✅",
  ];

  const genericmessages = [
    "Processing the IIB project...✅",
    "Generating RAML in the migrated project...✅",
  ];

  // const wsdlmessages = [
  //   "Processing the IIB project...✅",
  //   "The project is a SOAP project...✅",
  //   "Generating RAML from the WSDL & XSD file in the SOAP project...✅",
  // ];

  // const oasmessages = [
  //   "Cloning...✅",
  //   "Modifying the template...✅",
  //   "IIB node analysis...✅",
  //   "IIB to mule flow conversion...✅",
  //   "Creating ZIP...✅",
  // ];

  // HANDLE CONVERT - 28/08/24
  const handleConvert = (sourceFileName, subJobName, jobName) => {
    setLoading(true);
    // setMessage(messages);
    setMessage(genericmessages);

    console.log(`jobName: ${jobName}`);
    console.log(`subJobName: ${subJobName}`);
    console.log(`sourceFileName: ${sourceFileName}`);

    let matchingJobId = null;
    let matchingSubJobId = null;
    let matchingSourceFileId = null;
    let wrappedEdges = null;

    // Traverse the post data and print the object with the matching jobName
    if (Array.isArray(post)) {
      const matchingJob = post.find((job) => job.jobName === jobName);
      if (matchingJob) {
        console.log("Matching Job Object:", matchingJob);
        matchingJobId = matchingJob.jobId;
        console.log("Matching Job ID:", matchingJobId);

        const matchingSubJob = matchingJob.subJobs.find(
          (subJob) => subJob.subJobName === subJobName
        );
        if (matchingSubJob) {
          console.log("Matching SubJob Object:", matchingSubJob);
          matchingSubJobId = matchingSubJob.subJobId;
          console.log("Matching SubJob ID:", matchingSubJobId);

          const matchingSourceFile = matchingSubJob.sourceFiles.find(
            (sourceFile) => sourceFile.sourceFileName === sourceFileName
          );
          if (matchingSourceFile) {
            console.log("Matching SourceFile Object:", matchingSourceFile);
            matchingSourceFileId = matchingSourceFile.sourceFileId;
            console.log("Matching SourceFile ID:", matchingSourceFileId);
          } else {
            console.log(
              `No sourceFile found with sourceFileName: ${sourceFileName}`
            );
          }
        } else {
          console.log(`No subJob found with subJobName: ${subJobName}`);
        }
      } else {
        console.log(`No job found with jobName: ${jobName}`);
      }
    } else {
      console.error("Post data is not an array.");
    }

    // CONCATENATED MASTER ID
    const concatenatedId = `${matchingJobId}_${matchingSubJobId}_${matchingSourceFileId}`;
    console.log("Concatenated Master ID:", concatenatedId);

    if (concatenatedId) {
      const headers = {
        "Content-Type": "application/json",
        "x-request-id": xRequestId,
      };
      const queryParams = { source_file_id: concatenatedId };
      const fullUrl = `${dependencyNetworkURL}?${Object.keys(queryParams)
        .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join("&")}`;

      // CALLING BACKEND OF ANALYZER
      axios
        .get(fullUrl, { headers })
        .then((response) => {
          const apiResponseData = response.data;
          console.log("API Response Data:", apiResponseData);

          const edgesArray = apiResponseData.edges;
          console.log("Edges from Response Data:", edgesArray);

          wrappedEdges = {
            edges: edgesArray,
          };

          console.log("Wrapped Edges Object:", wrappedEdges);

          if (!wrappedEdges || !wrappedEdges.edges) {
            throw new Error("Wrapped edges are not defined or empty.");
          }

          const previewHeaders = {
            "Content-Type": "application/json",
            masterId: concatenatedId,
            "x-request-id": xRequestId,
          };

          console.log(previewHeaders);

          // CALLING BACKEND OF CONVERTER FOR /getApplicationDetails
          return axios.post(
            getApplicationDetailsUrl,
            {},
            { headers: previewHeaders }
          );
        })
        .then((previewResponse) => {
          console.log("Second API Response Data:", previewResponse.data);

          const jsonString = JSON.stringify(previewResponse.data);
          const ramlPreviewText = previewResponse.data;

          const tempOutputFolderpath = previewResponse.headers.get(
            "tempOutputFolderpath"
          );

          const projectTypeHeader = previewResponse.headers.get("projectType");
          console.log(projectTypeHeader);

          // const projectTypeHeader = "REST API, HTTP, SOAP";
          const endpointToOperationMapping = previewResponse.headers.get(
            "endpointToOperationMapping"
          );

          // Split projectType into an array of strings
          const projectTypesArray = projectTypeHeader
            ? projectTypeHeader.split(",").map((type) => type.trim())
            : [];

          console.log("Project Types Array:", projectTypesArray);

          if (projectTypesArray.length === 1) {
            // If there is only one project type, check for SOAP, REST, or HTTP
            const singleProjectType = projectTypesArray[0];
            console.log(singleProjectType);

            if (singleProjectType.includes("SOAP")) {
              console.log("TRANSFERRED TO WSDL TO RAML.........");
              navigate("/wsdl-to-raml-preview", {
                state: {
                  jsonString,
                  tempOutputFolderpath,
                  wrappedEdges,
                  concatenatedId,
                  projectType: projectTypesArray,
                  selectedProjectType: "SOAP",
                  endpointToOperationMapping,
                },
              });
            } else if (singleProjectType.includes("REST")) {
              console.log("TRANSFERRED TO OAS TO RAML PREVIEW.........");
              navigate("/raml-preview", {
                state: {
                  ramlPreviewText,
                  tempOutputFolderpath,
                  wrappedEdges,
                  concatenatedId,
                  projectType: projectTypesArray,
                  selectedProjectType: "REST API",
                  endpointToOperationMapping,
                },
              });
            } else if (singleProjectType.includes("HTTP")) {
              console.log("TRANSFERRED TO RAML PREVIEW.........");
              navigate("/raml-preview", {
                state: {
                  ramlPreviewText,
                  tempOutputFolderpath,
                  wrappedEdges,
                  concatenatedId,
                  projectType: projectTypesArray,
                  selectedProjectType: "HTTP",
                  endpointToOperationMapping,
                },
              });
            } else {
              // Handle the case where the single project type is neither SOAP, REST, nor HTTP
              console.log(
                "SINGLE PROJECT TYPE BUT IS NEITHER SOAP, REST OR HTTP SO DIRECT DOWNLOAD WITHOUT PREVIEW !"
              );
              handleDownloadOperation(
                projectTypesArray,
                wrappedEdges,
                concatenatedId,
                downloadmessages
              );
            }
          } else {
            // Handle the case where there are multiple project types
            console.log("MULTIPLE PROJECT TYPE....", projectTypesArray);

            handleMultipleProjectTypes(
              projectTypesArray,
              jsonString,
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              endpointToOperationMapping
            );
          }
        })
        .catch((error, previewResponse) => {
          // Error handling for getApplicationDetails API call
          setLoading(false);
          let errorMessage = "An unexpected error occurred.";

          if (error.response && error.response.data) {
            if (
              typeof error.response.data === "string" &&
              error.response.data.includes("//localhost")
            ) {
              errorMessage = "An unexpected error occurred";
            } else {
              errorMessage =
                error.response.request.responseText.replace(/"/g, "") ||
                error.response.data;
            }
          }
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
              popup: "custom-swal",
              container: "custom-swal-overlay",
            },
          });
          console.error("API call to getApplicationDetails failed:", error);
        })
        .finally(() => {
          // setLoading(false);
          // setMessage("");
          console.log("ALL PROCESS COMPLETE !!");
        });
    }
  };

  // Function to handle the case where there are multiple project types
  const handleMultipleProjectTypes = (
    projectTypesArray,
    jsonString,
    ramlPreviewText,
    tempOutputFolderpath,
    wrappedEdges,
    concatenatedId,
    endpointToOperationMapping
  ) => {
    console.log(projectTypesArray);

    // Check if the array contains a single instance of SOAP, REST, or HTTP
    if (
      projectTypesArray.includes("SOAP") &&
      !projectTypesArray.includes("REST API") &&
      !projectTypesArray.includes("HTTP")
    ) {
      console.log(
        "MULTIPLE PROJECT TYPES INCLUDING SOAP ONLY, TRANSFERRING TO WSDL TO RAML PREVIEW........."
      );
      navigate("/wsdl-to-raml-preview", {
        state: {
          jsonString,
          tempOutputFolderpath,
          wrappedEdges,
          concatenatedId,
          projectType: projectTypesArray,
          selectedProjectType: "SOAP",
          endpointToOperationMapping,
        },
      });
    } else if (
      projectTypesArray.includes("REST API") &&
      !projectTypesArray.includes("SOAP") &&
      !projectTypesArray.includes("HTTP")
    ) {
      console.log(
        "MULTIPLE PROJECT TYPES INCLUDING REST ONLY, TRANSFERRING TO OAS TO RAML PREVIEW........."
      );
      navigate("/raml-preview", {
        state: {
          ramlPreviewText,
          tempOutputFolderpath,
          wrappedEdges,
          concatenatedId,
          projectType: projectTypesArray,
          selectedProjectType: "REST API",
          endpointToOperationMapping,
        },
      });
    } else if (
      projectTypesArray.includes("HTTP") &&
      !projectTypesArray.includes("SOAP") &&
      !projectTypesArray.includes("REST API")
    ) {
      console.log(
        "MULTIPLE PROJECT TYPES INCLUDING HTTP ONLY, TRANSFERRING TO RAML PREVIEW........."
      );
      navigate("/raml-preview", {
        state: {
          ramlPreviewText,
          tempOutputFolderpath,
          wrappedEdges,
          concatenatedId,
          projectType: projectTypesArray,
          selectedProjectType: "HTTP",
          endpointToOperationMapping,
        },
      });
    } else if (
      projectTypesArray.includes("SOAP") &&
      projectTypesArray.includes("REST API") &&
      !projectTypesArray.includes("HTTP")
    ) {
      console.log("MULTIPLE PROJECT TYPES INCLUDING SOAP AND REST");
      Swal.fire({
        title: "Choose a Project Type",
        text: "You have SOAP and REST options. Please select one to proceed.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "SOAP",
        cancelButtonText: "REST API",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("User chose SOAP");
          navigate("/wsdl-to-raml-preview", {
            state: {
              jsonString,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "SOAP",
              endpointToOperationMapping,
            },
          });
        } else {
          console.log("User chose REST API");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "REST API",
              endpointToOperationMapping,
            },
          });
        }
      });
    } else if (
      projectTypesArray.includes("SOAP") &&
      projectTypesArray.includes("HTTP") &&
      !projectTypesArray.includes("REST API")
    ) {
      console.log("MULTIPLE PROJECT TYPES INCLUDING SOAP AND HTTP");
      Swal.fire({
        title: "Choose a Project Type",
        text: "You have SOAP and HTTP options. Please select one to proceed.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "SOAP",
        cancelButtonText: "HTTP",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("User chose SOAP");
          navigate("/wsdl-to-raml-preview", {
            state: {
              jsonString,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "SOAP",
              endpointToOperationMapping,
            },
          });
        } else {
          console.log("User chose HTTP");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "HTTP",
              endpointToOperationMapping,
            },
          });
        }
      });
    } else if (
      projectTypesArray.includes("REST API") &&
      projectTypesArray.includes("HTTP") &&
      !projectTypesArray.includes("SOAP")
    ) {
      console.log("MULTIPLE PROJECT TYPES INCLUDING REST AND HTTP");
      Swal.fire({
        title: "Choose a Project Type",
        text: "You have REST and HTTP options. Please select one to proceed.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "REST API",
        cancelButtonText: "HTTP",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("User chose REST API");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "REST API",
              endpointToOperationMapping,
            },
          });
        } else {
          console.log("User chose HTTP");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "HTTP",
              endpointToOperationMapping,
            },
          });
        }
      });
    } else if (
      projectTypesArray.includes("SOAP") &&
      projectTypesArray.includes("REST API") &&
      projectTypesArray.includes("HTTP")
    ) {
      console.log("MULTIPLE PROJECT TYPES INCLUDING SOAP, REST, AND HTTP");
      Swal.fire({
        title: "Choose a Project Type",
        text: "You have SOAP, REST, and HTTP options. Please select one to proceed.",
        icon: "question",
        input: "radio",
        inputOptions: {
          SOAP: "SOAP",
          REST: "REST API",
          HTTP: "HTTP",
        },
        inputValidator: (value) => {
          if (!value) {
            return "You need to choose something!";
          }
        },
        confirmButtonText: "Proceed",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.value === "SOAP") {
          console.log("User chose SOAP");
          navigate("/wsdl-to-raml-preview", {
            state: {
              jsonString,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "SOAP",
              endpointToOperationMapping,
            },
          });
        } else if (result.value === "REST") {
          console.log("User chose REST API");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "REST API",
              endpointToOperationMapping,
            },
          });
        } else if (result.value === "HTTP") {
          console.log("User chose HTTP");
          navigate("/raml-preview", {
            state: {
              ramlPreviewText,
              tempOutputFolderpath,
              wrappedEdges,
              concatenatedId,
              projectType: projectTypesArray,
              selectedProjectType: "HTTP",
              endpointToOperationMapping,
            },
          });
        }
      });
    } else {
      // Handle the case where the multiple project types include other combinations
      console.log(
        "MULTIPLE PROJECT TYPES BUT NO EXCLUSIVE SOAP, REST, OR HTTP FOUND, PROCEEDING WITH DIRECT DOWNLOAD!"
      );
      handleDownloadOperation(
        projectTypesArray,
        wrappedEdges,
        concatenatedId,
        downloadmessages
      );
    }
  };

  // Function to handle the download operation if projectType is not SOAP, REST, or HTTP
  const handleDownloadOperation = (
    projectTypesArray,
    wrappedEdges,
    concatenatedId,
    downloadmessages
  ) => {
    console.log("NOT TRANSFERRED, Download Operation started...");
    console.log(projectTypesArray);

    // Start the loader before initiating the download operation
    setLoading(true);
    setMessage(downloadmessages);

    const downloadHeaders = {
      "Content-Type": "application/json",
      masterId: concatenatedId,
      projectType: projectTypesArray,
      selectedProjectType: projectTypesArray,
      tempOutputFolderpath: "",
      "x-request-id": xRequestId,
      endpointToOperationMapping: "",
    };
    console.log(downloadHeaders);

    axios
      .post(migrateUrl, wrappedEdges, {
        headers: downloadHeaders,
        responseType: "blob",
      })
      .then((downloadResponse) => {
        if (downloadResponse) {
          handleFileDownload(downloadResponse);
        }
      })
      .catch((error) => {
        console.error("API call to migrate failed:", error);
        Swal.fire({
          title: "Error!",
          text: "An error occurred during the migrate API call.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        });
      })
      .finally(() => {
        // Stop the loader once the download process is complete (either success or error)
        setLoading(false);
        setMessage("");
      });
  };

  // Function to handle file download
  const handleFileDownload = (downloadResponse) => {
    const fileName =
      downloadResponse.headers.get("fileName") || "downloaded.zip";
    const blob = new Blob([downloadResponse.data], {
      type: "application/octet-stream",
    });

    Swal.fire({
      title: "Success!",
      html: "IIB project has been successfully migrated!<br>Do you want to download the <b>Migrated Mule Application?</b>",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Download",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire({
          title: "Downloaded!",
          html: "The <b>Migrated Mule Application</b> has been successfully downloaded.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        });
      } else {
        Swal.fire({
          title: "Cancelled",
          text: "The file download was cancelled.",
          icon: "info",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        });
      }
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
      <ProgressAnimation messages={message} interval={1300} />
      {/* <ProgressAnimation
        messages={[
          "Cloning...✅",
          "Modifying the template...✅",
          "IIB node analysis...✅",
          "IIB to mule flow conversion...✅",
          "Creating ZIP...✅",
        ]}
        interval={2000}
      /> */}
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
              {/* <Checkbox
                onChange={handleSelectAll}
                inputProps={{ "aria-label": "Select All" }}
                checked={selectAll}
                style={{
                  position: "relative",
                  left: "71%",
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
              </Button> */}
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
                            {/* <Checkbox
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
                                left: "69.5%",
                                transform: "scale(1.3)",
                              }}
                            /> */}
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
                                    marginRight: "180px",
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
                                    marginRight: "180px",
                                  }}
                                >
                                  NOT SCANNED
                                </span>
                              )}
                              <Button
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
                                MIGRATE
                              </Button>
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

export default MigrateProject;
