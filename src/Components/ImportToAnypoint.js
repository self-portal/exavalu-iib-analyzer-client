import React, { useState } from "react";
import "./ImportToAnypoint.css";
import ProgressAnimation from "./Animation/Animation";
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

function ImportToAnypoint({
  tempOutputFolderpath,
  // importRamlDetails,
  fileNameHeader,
  blobContent,
  calledFrom,
}) {
  console.log(tempOutputFolderpath);
  console.log(fileNameHeader);

  // CREATING THE BACKEND URL

  // http://localhost:9092/uploadToDesignCenter
  const importtoanypointUrl =
    process.env.REACT_APP_IIB_MIGRATOR_BASE_PATH +
    process.env.REACT_APP_UPLOAD_DESIGN_CENTER;

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalHeading, setModalHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [formDetails, setFormDetails] = useState({
    clientId: "",
    clientSecret: "",
    organizationId: "",
    ownerId: "",
    projectName: "",
  });
  const [isConversionSuccessful, setIsConversionSuccessful] = useState(false);
  const navigate = useNavigate();

  const handleOkButtonClick = () => {
    setShowForm(true);
  };

  const handleCloseModal = () => {
    // setIsModalOpen(false);
    setModalMessage("");
    setModalHeading(null);
    setShowModal(false);
    if (isConversionSuccessful) {
      navigate("/");
    }
  };

  const handleWsdlToRamlSubmit = async (event) => {
    event.preventDefault();
    console.log("Wsdl to Raml submit logic");
    console.log("Client ID:", formDetails.clientId);
    console.log("Client Secret:", formDetails.clientSecret);
    console.log("Organization ID:", formDetails.organizationId);
    console.log("Owner ID:", formDetails.ownerId);
    console.log("Project Name:", formDetails.projectName);
    console.log("tempOutputFolderpath:", tempOutputFolderpath);
    // console.log("Updated Raml Details:", importRamlDetails);
    console.log("File name header:", fileNameHeader);

    setLoading(true);
    try {
      const response = await fetch(importtoanypointUrl, {
        method: "POST",
        headers: {
          client_id: formDetails.clientId,
          client_secret: formDetails.clientSecret,
          organization_id: formDetails.organizationId,
          owner_id: formDetails.ownerId,
          project_name:
            formDetails.projectName || fileNameHeader.replace(/\.zip$/, ""),
          tempFolderPath: tempOutputFolderpath,
          filename: fileNameHeader,
        },
      });

      console.log("RESPONSE:::", response.text);

      if (response.ok) {
        setIsConversionSuccessful(true);
        console.log("FILE IMPORTED SUCCESSFULLY");
        if (response.ok) {
          setIsConversionSuccessful(true);
          console.log("FILE IMPORTED SUCCESSFULLY");
          const responseText = await response.text();

          // setModalHeading(
          //   <div className="wsdl_success-heading">
          //     <h2>SUCCESS</h2>
          //   </div>
          // );
          // setModalMessage(
          //   `<b>${responseText}</b> <br>
          //   <button style="
          //     display: block;
          //     margin: 10px auto;
          //     margin-bottom: 0px;
          //     padding: 10px 20px;
          //     background-color: #00a1e1;
          //     color: white;
          //     border: none;
          //     border-radius: 5px;
          //     cursor: pointer;
          //   " onclick="window.open('https://anypoint.mulesoft.com/designcenter/#/projects', '_blank')">Open Design Center</button>`
          // );
          // setShowModal(true);
          Swal.fire({
            title: "Success",
            text: responseText,
            icon: "success",
            width: 450,
            confirmButtonText: "OK",
            footer:
              '<a href="https://anypoint.mulesoft.com/designcenter/#/projects" target="_blank" style="color: #4266be; text-decoration: none;">Open Design Center</a>',
            customClass: {
              popup: "custom-swal2",
              container: "custom-swal-overlay",
            },
          }).then(() => {
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
                const url = window.URL.createObjectURL(blobContent);

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", fileNameHeader);
                document.body.appendChild(link);
                link.click();

                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);

                // Show a success message after the download
                Swal.fire({
                  title: "Downloaded!",
                  html: "The <b> Migrated Mule application </b> has been successfully downloaded.",
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
          });
        }
      }

      if (!response.ok) {
        const errorMessage = await response.text();

        let parsedMessage = "Failed to convert files. Please try again later.";
        try {
          parsedMessage = JSON.parse(errorMessage).body.message;
        } catch (e) {
          console.error("Failed to parse error message:", e);
        }

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
          width: 450,
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
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    if (calledFrom === "generic") {
      handleWsdlToRamlSubmit(event);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Check if the input value contains any space or special characters
    const invalidChars = /[^a-zA-Z0-9-]/;
    if (name === "projectName" && invalidChars.test(value)) {
      setModalHeading(
        <div className="wsdl_error-heading">
          <h2>ERROR</h2>
        </div>
      );
      setModalMessage(
        "Project name should not contain any spaces or special characters !"
      );
      setShowModal(true);
      return;
    }

    setFormDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    setIsCheckboxChecked(event.target.checked);
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
      {!showForm ? (
        <>
          <div className="wsdl_warning-box">
            <ul>
              <li>
                User should have a connected app from where the Client ID and
                Client Secret will be obtained.
              </li>
              <li>
                The basic scope for the connected app should be Design center.
              </li>
              <li>User should have the Organisation ID</li>
              <li>User should have the User ID or Owner ID</li>
              {/* <li>Contact support for any issues.</li> */}
            </ul>
          </div>

          <div className="wsdl_checkbox-container">
            <input
              type="checkbox"
              id="parameters-ready"
              onChange={handleCheckboxChange}
            />
            <p htmlFor="parameters-ready">
              Do you have all these parameters ready?
            </p>
          </div>

          <button
            className="wsdl_ok-button-final"
            onClick={handleOkButtonClick}
            disabled={!isCheckboxChecked}
          >
            OK
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="wsdl_form-container">
          <p htmlFor="client-id">Client ID:</p>
          <input
            type="text"
            id="client-id"
            name="clientId"
            value={formDetails.clientId}
            onChange={handleInputChange}
            required
          />

          <p htmlFor="client-secret">Client Secret:</p>
          <input
            type="text"
            id="client-secret"
            name="clientSecret"
            value={formDetails.clientSecret}
            onChange={handleInputChange}
            required
          />

          <p htmlFor="organization-id">Organization ID:</p>
          <input
            type="text"
            id="organization-id"
            name="organizationId"
            value={formDetails.organizationId}
            onChange={handleInputChange}
            required
          />

          <p htmlFor="owner-id">Owner ID:</p>
          <input
            type="text"
            id="owner-id"
            name="ownerId"
            value={formDetails.ownerId}
            onChange={handleInputChange}
            required
          />

          <p htmlFor="project-name">Project Name:</p>
          <input
            type="text"
            id="project-name"
            name="projectName"
            value={
              formDetails.projectName || fileNameHeader.replace(/\.zip$/, "")
            }
            onChange={handleInputChange}
            required
          />

          <button type="submit" className="wsdl_import-button">
            IMPORT
          </button>
        </form>
      )}

      {showModal && (
        <div className="wsdl_modal-overlay" onClick={handleCloseModal}>
          <div className="wsdl_modal" onClick={(e) => e.stopPropagation()}>
            <span className="wsdl_close" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="wsdl_modal-body">
              {/* Render modalHeading if it exists */}
              {modalHeading && (
                <div className="wsdl_custom-heading">{modalHeading}</div>
              )}
              <p
                className="wsdl_modal-message import-modal-message"
                dangerouslySetInnerHTML={{ __html: modalMessage }}
              ></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImportToAnypoint;
