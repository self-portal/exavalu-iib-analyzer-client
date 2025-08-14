import React, { useEffect, useState } from "react";
import "../stylings/GenericRamlApiPreview.css";
import { useNavigate, useLocation } from "react-router-dom";
// import Loader from "./Loader";
import yaml from "yaml";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import NavbarPrivate from "../../../Components/Utilities/NavbarPrivate";

import ProgressAnimation from "../../../Components/Animation/Animation";

import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import ImportToAnypoint from "../../../Components/ImportToAnypoint";

// import ImportToAnypoint from "./ImportToAnypoint";

const GenericRamlApiPreview = () => {
  const [showModal, setShowModal] = useState(false);
  const [showImportOverlay, setShowImportOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalHeading, setModalHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [isConversionSuccessful, setIsConversionSuccessful] = useState(false);
  const [message, setMessage] = React.useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const xRequestId = uuidv4();

  // CREATING THE BACKEND URL

  // http://localhost:9092/migrate
  const migrateUrl =
    process.env.REACT_APP_IIB_MIGRATOR_BASE_PATH +
    process.env.REACT_APP_MIGRATE_APPLICATION;

  useEffect(() => {
    console.log("State in ApiPreview page:", state);
    // tempAlert(
    //   "Please check the disclaimer for the conversion logic and feel free to make any changes in the text editor following valid RAML norms....",
    //   4000
    // );
    Swal.fire({
      title: "PREVIEW",
      width: 500,
      html: `<h6> Preview the converted RAML and make any necessary changes in the text editor according to RAML norms...</h6>`,
      icon: "info",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-swal2",
        container: "custom-swal-overlay",
      },
    });
  }, [state]);

  useEffect(() => {
    if (!showDisclaimer) {
      setTimeout(() => {
        setHighlightButton(true);
        setTimeout(() => {
          setHighlightButton(false);
        }, 3000);
      }, 4000);
    }
  }, [showDisclaimer]);

  // Access paths from state
  const {
    ramlPreviewText = "N/A",
    tempOutputFolderpath = "",
    concatenatedId = "",
    projectType = "",
    selectedProjectType = "",
    wrappedEdges = "",
    outputFileName = "",
    endpointToOperationMapping = "",
    // uploadedFiles = [],
  } = state || {};

  // Utility function to highlight comment lines with gray color
  const highlightComments = (text) => {
    const lines = text.split("\n");
    const highlightedLines = lines.map((line) => {
      if (line.trim().startsWith("#")) {
        return `<span style="color: gray;">${line}</span>`;
      }
      return line;
    });
    return highlightedLines.join("\n");
  };

  // Utility function to highlight keys with brown color
  const highlightKeys = (text) => {
    const regex = /(?<!['"])([\w/]+)(?=:)/g;
    return highlightComments(
      text.replace(regex, '<span style="color: brown;">$1</span>')
    );
  };

  const [text, setText] = useState(highlightKeys(ramlPreviewText));
  const [importYamlText, setImportYamlText] = useState(
    highlightKeys(ramlPreviewText)
  ); // New state for yamlText
  const [tempFolderPathHeader, setTempFolderPathHeader] = useState("");
  const [fileNameImportHeader, setFileNameImportHeader] = useState("");
  const [blobContent, setBlobContent] = useState("");

  // Handle change of text in preview
  const handleChange = (event) => {
    console.log("INSIDE HANDLE CHANGE");
    const lines = event.target.innerHTML
      .trim()
      .split("\n")
      .filter((line) => line.trim() !== "");
    const withoutEmptyLines = lines.join("\n");
    const newText = withoutEmptyLines
      .replaceAll("<div><br></div>", "")
      .replaceAll("<div>", "\n")
      .replaceAll("</div>", "")
      .replaceAll("<br>", "");
    setText(newText);
    setImportYamlText(newText); // Update yamlText state
  };

  // alert on the top right of the screen
  function tempAlert(msg, duration) {
    var el = document.createElement("div");
    el.className = "oas_alert-box";
    el.innerHTML = msg;
    setTimeout(function () {
      el.parentNode.removeChild(el);
    }, duration);
    document.body.appendChild(el);
  }

  // Function to check if text is valid YAML
  const isValidYaml = (text) => {
    console.log("text:::::::::::");
    console.log(text);
    try {
      yaml.parse(text);
      return true;
    } catch (error) {
      console.error("YAML parsing error:", error);
      return false;
    }
  };

  const messages = [
    "Cloning...✅",
    "Modifying the template...✅",
    "Injecting RAML in the migrated Mule project...✅",
    "IIB to mule flow conversion...✅",
    "Creating ZIP...✅",
  ];

  const handleConvertButtonClick = async () => {
    setLoading(true);
    setMessage(messages);

    // console.log(text);
    const yamlText = text.replace(
      /<span style="color: (brown|gray);">(.+?)<\/span>/g,
      "$2"
    );
    if (!isValidYaml(yamlText)) {
      console.error("Invalid YAML");
      setLoading(false);
      // setModalHeading(
      //   <div className="error-heading">
      //     <h2>INVALID YAML</h2>
      //   </div>
      // );
      // setModalMessage(
      //   "The provided text is not valid YAML. Please correct the errors and try again."
      // );
      // setShowModal(true);
      Swal.fire({
        title: "Invalid YAML",
        text: "The provided text is not valid YAML. Please correct the errors and try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      return;
    }

    console.log(wrappedEdges);

    const newReqBody = { ...wrappedEdges };

    // Add the swagger_raml key to the new object
    newReqBody.raml = yamlText;

    console.log("New Wrapped Edges Object:", newReqBody);

    console.log(tempOutputFolderpath);

    try {
      const response = await fetch(migrateUrl, {
        method: "POST",
        headers: {
          masterId: concatenatedId,
          tempOutputFolderpath: "",
          projectType: projectType,
          selectedProjectType: selectedProjectType,
          "x-request-id": xRequestId,
          endpointToOperationMapping: endpointToOperationMapping,
        },
        body: JSON.stringify(newReqBody),
      });

      const fileNameHeader = response.headers.get("fileName");
      console.log("fileNameHeader ", fileNameHeader);

      const tempFolderPath = response.headers.get("tempFolderPath");
      console.log("tempFolderPath", tempFolderPath);

      if (response.ok) {
        setIsConversionSuccessful(true);
        console.log("FILE UPLOADED SUCCESSFULLY");

        const fileName = response.headers.get("fileName");
        console.log("fileName: ", fileName);
        const filename = fileName ? fileName : "downloaded.zip";

        const blob = await response.blob();

        Swal.fire({
          title: "Import to Design Center !",
          text: "Do you want to import the converted RAML to Design Center ?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          cancelButtonColor: "#d33",
          customClass: {
            popup: "custom-swal2",
            container: "custom-swal-overlay",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("GO TO IMPORT TO DESIGN CENTER");
            handleImportButtonClick(fileNameHeader, tempFolderPath, blob);
          } else {
            // Show the success message asking if the user wants to download the file
            Swal.fire({
              title: "Success!",
              html: "IIB project has been successfully migrated ! <br>Do you want to download the <b> Migrated Mule Application? </b>",
              icon: "success",
              showCancelButton: true,
              confirmButtonText: "Download",
              cancelButtonText: "Cancel",
              cancelButtonColor: "#d33",
              backdrop: "grey",
              customClass: {
                popup: "custom-swal2",
                container: "custom-swal-overlay",
              },
            }).then((result) => {
              if (result.isConfirmed) {
                // If the user clicks 'Download', proceed with the file download
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();

                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);

                // Show a success message after the download
                Swal.fire({
                  title: "Downloaded!",
                  html: "The <b> Migrated Mule Application </b> has been successfully downloaded.",
                  icon: "success",
                  confirmButtonText: "OK",
                  backdrop: "grey",
                  customClass: {
                    popup: "custom-swal2",
                    container: "custom-swal-overlay",
                  },
                }).then(() => {
                  // Redirect to the previous page when OK is clicked
                  window.history.back();
                });
              } else {
                // If the user clicks 'Cancel', optionally show a cancellation message
                Swal.fire({
                  title: "Cancelled",
                  text: "The file download was cancelled.",
                  icon: "info",
                  confirmButtonText: "OK",
                  backdrop: "grey",
                  customClass: {
                    popup: "custom-swal2",
                    container: "custom-swal-overlay",
                  },
                });
              }
            });
          }
        });
      }

      if (!response.ok) {
        const errorMessage = await response.text();
        // setModalHeading(
        //   <div className="error-heading">
        //     <h2>ERROR</h2>
        //   </div>
        // );
        // setModalMessage(errorMessage);
        // // setModalMessage(errorMessage);
        // setShowModal(true);
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal2",
            container: "custom-swal-overlay",
          },
        });
        return;
      }
    } catch (error) {
      console.error("Error converting files:", error);

      // setModalHeading(
      //   <div className="error-heading">
      //     <h2>ERROR</h2>
      //   </div>
      // );
      // setModalMessage("Failed to convert files. Please try again later.");
      // setShowModal(true);
      Swal.fire({
        title: "Error",
        text: "Failed to convert files. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      setIsConversionSuccessful(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle open Import overlay on clicking the Import button
  const handleImportButtonClick = async (
    fileNameHeader,
    tempFolderPath,
    blob
  ) => {
    console.log("UPLOAD  BUTTON CLICKED !!");
    // navigate("/importtoanypoint");

    console.log(fileNameHeader);
    console.log(tempFolderPath);
    console.log(blob);

    const finalYamlText = importYamlText.replace(
      /<span style="color: (brown|gray);">(.+?)<\/span>/g,
      "$2"
    );
    if (!isValidYaml(finalYamlText)) {
      console.error("Invalid YAML");
      setLoading(false);
      Swal.fire({
        title: "Invalid YAML",
        text: "The provided text is not valid YAML. Please correct the errors and try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      return;
    }
    setImportYamlText(finalYamlText);
    setShowImportOverlay(true);
    setTempFolderPathHeader(tempFolderPath);
    setFileNameImportHeader(fileNameHeader);
    setBlobContent(blob);
    return;
  };

  // Function to handle closing modal
  const handleCloseModal = () => {
    // setIsModalOpen(false);
    setModalMessage("");
    setModalHeading(null);
    setShowModal(false);
    if (isConversionSuccessful) {
      navigate("/xsd-to-raml");
    }
  };

  // Function to handle closing Import Overlay
  const handleCloseImportOverlay = () => {
    setShowImportOverlay(false);
  };

  // Function to Reload the page on clicking the Reload button
  const handleReload = () => {
    window.location.reload();
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
      <ProgressAnimation messages={message} interval={1000} />
    </div>
  ) : (
    <>
      <NavbarPrivate />

      {/* <Loader loading={loading} /> */}
      <div className="oas_api-preview-container">
        <div className="oas_disclaimer-button-container">
          <button className="xsd_reload-button" onClick={handleReload}>
            <FontAwesomeIcon icon={faRedo} /> RESET
          </button>
        </div>
        <div className="oas_card">
          <div className="oas_heading-container">
            <h2 className="oas_heading">api.raml Preview</h2>

            <FontAwesomeIcon
              icon={faInfoCircle}
              className="wsdl_info-icon"
              onClick={() =>
                tempAlert(
                  "Please check the disclaimer for the conversion logic and feel free to make any changes in the text editor following valid RAML norms....",
                  2000
                )
              }
            />
          </div>

          <p className="oas_disclaimer">
            Please edit carefully following all the valid RAML norms.
          </p>

          <pre
            className="oas_text-box"
            contentEditable="true"
            onBlur={handleChange}
            spellCheck="false"
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontSize: "15.5px",
              fontWeight: "bold",
              fontFamily: "Source Code Pro, monospace",
              lineHeight: "1.5",
              padding: "30px 40px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      </div>
      <div className="oas_convert-button-container">
        <p
          className="oas_upload-button-final"
          onClick={handleConvertButtonClick}
        >
          NEXT
        </p>
        {/* <button
          className="oas_upload-button-final"
          onClick={handleImportButtonClick}
        >
          Import to Anypoint platform
        </button> */}
      </div>

      {/* {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="modal-body">
              {modalHeading && (
                <div className="custom-heading">{modalHeading}</div>
              )}
              <p className="modal-message">{modalMessage}</p>
            </div>
          </div>
        </div>
      )} */}

      {showImportOverlay && (
        <div className="oas_importoverlay-overlay">
          <div
            className="oas_importoverlay"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="oas_close" onClick={handleCloseImportOverlay}>
              &times;
            </span>
            <div className="oas_importoverlay-body">
              {/* Render modalHeading if it exists */}

              <div className="oas_custom-heading">
                <img
                  src={process.env.PUBLIC_URL + "/MuleSoft_Logo.webp"}
                  alt="Mulesoft Logo"
                  className="mulesoft_logo"
                />
              </div>

              {/* <p className="modal-message">{modalMessage}</p> */}
              <ImportToAnypoint
                yamlText={importYamlText}
                tempOutputFolderpath={tempFolderPathHeader}
                fileNameHeader={fileNameImportHeader}
                blobContent={blobContent}
                calledFrom={"generic"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenericRamlApiPreview;
