import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "../stylings/AddApiDetails.css";
import { useNavigate, useLocation } from "react-router-dom";

import NavbarPrivate from "../../../Components/Utilities/NavbarPrivate";

import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

import ModalTableRows from "./ModalTableRows";
// import Loader from "./Loader";
import ProgressAnimation from "../../../Components/Animation/Animation";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";
import ImportToAnypoint from "../../../Components/ImportToAnypoint";

// import ImportToAnypoint from "./ImportToAnypoint";

const AddApiDetails = () => {
  const location = useLocation();
  const { state } = location;

  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedMethods, setSelectedMethods] = useState({});

  const [selectedContentTypeState, setSelectedContentTypeState] = useState({});

  const [endpointCards, setEndpointCards] = useState([
    { id: 1, methodRows: [{ id: 1 }] },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalHeading, setModalHeading] = useState(null);
  // const [xsdFileDetails, setXsdFileDetails] = useState({});
  const [internalRowDetails, setInternalRowDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [highlightButton, setHighlightButton] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isConversionSuccessful, setIsConversionSuccessful] = useState(false);
  const navigate = useNavigate();

  const [message, setMessage] = React.useState("");

  const xRequestId = uuidv4();

  const [showImportOverlay, setShowImportOverlay] = useState(false);
  const [importRamlDetails, setImportRamlDetails] = useState(null);

  const [tempFolderPathHeader, setTempFolderPathHeader] = useState("");
  const [fileNameImportHeader, setFileNameImportHeader] = useState("");
  const [blobContent, setBlobContent] = useState("");

  // CREATING THE BACKEND URL

  // http://localhost:9092/migrate
  const migrateUrl =
    process.env.REACT_APP_IIB_MIGRATOR_BASE_PATH +
    process.env.REACT_APP_MIGRATE_APPLICATION;

  // http://localhost:9093/api/wsdltoraml/download
  const generateRamlUrl =
    process.env.REACT_APP_WSDL_TO_RAML_BASE_PATH +
    process.env.REACT_APP_GENERATE_RAML;

  //   Access jsonString from state
  const { jsonString = "" } = state || {};

  //   const jsonString =
  // '{"title":"api.raml","securitySchemes":{"client-id-enforcement":"!include SecuritySchemes/clientIdSecurityScheme.raml"},"traits":{"errorTrait":"!include Traits/errorTrait.raml"},"endpoints":[{"endpointName":"/Add","description":"Adds two integers. This is a test WebService","methodDetails":[{"method":"POST","contentType":"application/json","attributeDetails":[],"inputElement":"Add","payloadBody":{"Add":{"intA":0.0,"intB":0.0}},"outputElement":"AddResponse","faultElement":""},{"method":"GET","contentType":"application/json","attributeDetails":[],"inputElement":"","outputElement":"AddResponse","payloadBody":{"AddResponse":{"AddResult":0.0}},"faultElement":""}]},{"endpointName":"/Divide","description":"","methodDetails":[{"method":"POST","contentType":"application/json","attributeDetails":[],"inputElement":"Divide","payloadBody":{"Divide":{"intA":0.0,"intB":0.0}},"outputElement":"DivideResponse","faultElement":""},{"method":"GET","contentType":"application/json","attributeDetails":[],"inputElement":"","outputElement":"DivideResponse","payloadBody":{"DivideResponse":{"DivideResult":0.0}},"faultElement":""}]},{"endpointName":"/Multiply","description":"","methodDetails":[{"method":"POST","contentType":"application/json","attributeDetails":[],"inputElement":"Multiply","payloadBody":{"Multiply":{"intA":0.0,"intB":0.0}},"outputElement":"MultiplyResponse","faultElement":""},{"method":"GET","contentType":"application/json","attributeDetails":[],"inputElement":"","outputElement":"MultiplyResponse","payloadBody":{"MultiplyResponse":{"MultiplyResult":0.0}},"faultElement":""}]},{"endpointName":"/Subtract","description":"","methodDetails":[{"method":"POST","contentType":"application/json","attributeDetails":[],"inputElement":"Subtract","payloadBody":{"Subtract":{"intA":0.0,"intB":0.0}},"outputElement":"SubtractResponse","faultElement":""},{"method":"GET","contentType":"application/json","attributeDetails":[],"inputElement":"","outputElement":"SubtractResponse","payloadBody":{"SubtractResponse":{"SubtractResult":0.0}},"faultElement":""}]}]}';

  const initialEndpointData = JSON.parse(jsonString);

  useEffect(() => {
    console.log("State in AddApiDetails page:", state);
    Swal.fire({
      title: "PREVIEW",
      width: 500,
      html: `<h6> Preview the converted RAML from the WSDL files in the SOAP IIB Application and make any necessary changes according to RAML norms...</h6>`,
      icon: "info",
      confirmButtonText: "OK",
      customClass: {
        popup: "custom-swal2",
        container: "custom-swal-overlay",
      },
    });
    if (
      initialEndpointData.endpoints &&
      initialEndpointData.endpoints.length > 0
    ) {
      const initialCards = initialEndpointData.endpoints.map(
        (endpoint, endpointIndex) => {
          console.log(`Processing endpoint: ${endpoint.endpointName}`);

          // Map over methodDetails to create method rows
          const methodRows = endpoint.methodDetails.map(
            (methodDetail, methodIndex) => {
              // console.log(`Processing method: ${methodDetail.method}`);
              // console.log(`Payload body:`, methodDetail.payloadBody);

              return {
                id: methodIndex + 1,
                method: methodDetail.method,
                inputElement: methodDetail.inputElement,
                outputElement: methodDetail.outputElement,
                faultElement: methodDetail.faultElement,
                payloadBody: methodDetail.payloadBody,
                contentType: methodDetail.contentType || "application/json",
              };
            }
          );

          return {
            id: endpointIndex + 1,
            endpointName: endpoint.endpointName,
            description: endpoint.description,
            methodRows: methodRows,
          };
        }
      );

      // console.log("Initial endpoint cards:", initialCards);
      setEndpointCards(initialCards);
    }
  }, [state]);

  useEffect(() => {
    const initialInternalRows = {};

    initialEndpointData.endpoints.forEach((endpoint, cardIndex) => {
      endpoint.methodDetails.forEach((methodDetail, rowIndex) => {
        const internalRowId = `${cardIndex + 1}-${rowIndex + 1}`;
        initialInternalRows[internalRowId] = methodDetail.attributeDetails.map(
          (attr) => ({
            attributeHeader:
              methodDetail.method === "GET" ? "queryParams" : "headers",
            attributeName: attr.elementName,
            attributeType: attr.type,
            attributeRequired: attr.required ? "true" : "false",
          })
        );
      });
    });

    setInternalRowDetails(initialInternalRows);
  }, []);

  useEffect(() => {
    console.log("Updated endpoint cards:", endpointCards);
  }, [endpointCards]);

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

  // Function to show tooltip text info message
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Function to validate Endpoint name change
  const handleEndpointNameChange = (cardId, value) => {
    if (value.length > 64) {
      setModalHeading(
        <div className="wsdl_warning-heading">
          <h2>WARNING</h2>
        </div>
      );
      setModalMessage("Endpoint names must be 64 characters or fewer.");
      setShowModal(true);
      return;
    }
    const pattern = /^[a-zA-Z0-9_\-/{}]*$/;
    if (!pattern.test(value)) {
      //   setModalHeading(
      //     <div className="wsdl_warning-heading">
      //       <h2>WARNING</h2>
      //     </div>
      //   );
      //   setModalMessage(
      //     "Endpoint names can only contain alphanumeric characters, '-', '_', '/', '{', and '}'."
      //   );
      //   setShowModal(true);
      Swal.fire({
        title: "Warning",
        text: "Endpoint names can only contain alphanumeric characters, '-', '_', '/', '{', and '}'.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      return;
    }
    // Update the endpoint name
    setEndpointCards((prevCards) =>
      prevCards.map((prevCard) =>
        prevCard.id === cardId ? { ...prevCard, endpointName: value } : prevCard
      )
    );
  };

  // Function to handle the Content-type change
  const handleContentTypeChange = (cardId, rowId, value) => {
    // Update endpointCards state
    const updatedCards = endpointCards.map((card) => {
      if (card.id === cardId) {
        const updatedRows = card.methodRows.map((row) => {
          if (row.id === rowId) {
            return { ...row, contentType: value };
          }
          return row;
        });
        return { ...card, methodRows: updatedRows };
      }
      return card;
    });

    setEndpointCards(updatedCards);

    // Update selectedContentTypeState
    setSelectedContentTypeState((prevState) => ({
      ...prevState,
      [`content-type-select-${cardId}-${rowId}`]: value,
    }));
  };

  // Function to handle closing modal
  const handleCloseModal = () => {
    // setIsModalOpen(false);
    setModalMessage("");
    setModalHeading(null);
    setShowModal(false);
    if (isConversionSuccessful) {
      navigate("/wsdl-to-raml");
    }
  };

  // Function to Reload the page on clicking the Reload button
  const handleReload = () => {
    window.location.reload();
  };

  // Function to handle updating attributes from the modal table
  const handleUpdateAttributes = (cardId, rowId, attributes) => {
    const internalRowId = `${cardId}-${rowId}`;
    const updatedInternalRowDetails = { ...internalRowDetails };
    const updatedAttributes = attributes.map((attribute) => ({
      attributeHeader: attribute.queryHeader,
      attributeName: attribute.attributeName,
      attributeType: attribute.type,
      attributeRequired: attribute.required,
    }));

    if (
      attributes.length === 1 &&
      attributes[0].queryHeader === "" &&
      attributes[0].attributeName === "" &&
      attributes[0].queryHeader === "" &&
      attributes[0].type === "" &&
      attributes[0].required === ""
    ) {
      updatedAttributes.length = 0;
    }

    updatedInternalRowDetails[internalRowId] = updatedAttributes;
    setInternalRowDetails(updatedInternalRowDetails);
  };

  // Function to check duplicate endpoint name
  const hasDuplicateEndpointNames = () => {
    const endpointNames = endpointCards.map((card) => card.endpointName);
    return new Set(endpointNames).size !== endpointNames.length;
  };

  // Function to check if there are any cards with empty endpoint names
  const hasEmptyEndpointNames = () => {
    return endpointCards.some(
      (card) => !card.endpointName || card.endpointName.trim() === ""
    );
  };

  // Function to remove an endpoint card
  const handleRemoveCard = (cardId) => {
    if (endpointCards.length === 1) {
      //   setModalHeading(
      //     <div className="warning-heading">
      //       <h2>WARNING</h2>
      //     </div>
      //   );
      //   setModalMessage("You have to keep atleast one endpoint.");
      //   setShowModal(true);
      Swal.fire({
        title: "Warning",
        text: "You have to keep atleast one endpoint.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      return;
    }
    const updatedCards = endpointCards.filter((card) => card.id !== cardId);
    setEndpointCards(updatedCards);
  };

  // Function to remove a row
  const handleRemoveRow = (cardId, rowId) => {
    const updatedCards = endpointCards.map((card) => {
      if (card.id === cardId) {
        if (card.methodRows.length === 1) {
          //   setModalHeading(
          //     <div className="warning-heading">
          //       <h2>WARNING</h2>
          //     </div>
          //   );
          //   setModalMessage("You have to keep atleast one method.");
          //   setShowModal(true);
          Swal.fire({
            title: "Warning",
            text: "You have to keep atleast one method.",
            icon: "warning",
            confirmButtonText: "OK",
            customClass: {
              popup: "custom-swal2",
              container: "custom-swal-overlay",
            },
          });
          return card;
        }
        const updatedRows = card.methodRows.filter((row) => row.id !== rowId);
        return { ...card, methodRows: updatedRows };
      }
      return card;
    });
    setEndpointCards(updatedCards);
  };

  // Function to handle method selection change
  const handleMethodChange = (cardId, rowId, value) => {
    const methodKey = `${cardId}-${rowId}`;
    let alertNeeded = false;

    // Check if the selected method exists in any of the previous rows within the same card
    endpointCards.forEach((card) => {
      if (card.id === cardId) {
        for (let i = 0; i < card.methodRows.length; i++) {
          const prevRowId = card.methodRows[i].id;
          const prevMethodKey = `${cardId}-${prevRowId}`;

          // If method from previous row matches the selected method
          if (selectedMethod[prevMethodKey] === value) {
            alertNeeded = true;
            break;
          }
        }
      }
    });

    if (alertNeeded) {
      //   setModalHeading(
      //     <div className="warning-heading">
      //       <h2>WARNING</h2>
      //     </div>
      //   );
      //   setModalMessage(
      //     "Method already selected in a previous row. Please choose another method."
      //   );
      //   setShowModal(true);
      Swal.fire({
        title: "Warning",
        text: "Method already selected in a previous row. Please choose another method.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-swal2",
          container: "custom-swal-overlay",
        },
      });
      return;
    } else {
      // Update the method in the state
      const updatedCards = endpointCards.map((card) => {
        if (card.id === cardId) {
          const updatedRows = card.methodRows.map((row) => {
            if (row.id === rowId) {
              return { ...row, method: value };
            }
            return row;
          });
          return { ...card, methodRows: updatedRows };
        }
        return card;
      });

      // Update the selected methods state
      const updatedMethods = { ...selectedMethods[cardId], [methodKey]: value };
      setSelectedMethods({ ...selectedMethods, [cardId]: updatedMethods });
      setSelectedMethod({ ...selectedMethod, [methodKey]: value });

      setEndpointCards(updatedCards);
    }
  };

  // Function to validate endpoint names
  const validateEndpointNames = () => {
    const invalidEndpointNames = [];
    const errorMessages = [];

    endpointCards.forEach((card) => {
      const { endpointName } = card;

      // Check if endpoint name starts with '/'
      if (!endpointName.startsWith("/")) {
        invalidEndpointNames.push(endpointName);
        errorMessages.push("Endpoint names must start with '/'.");
        return;
      }

      // Check if endpoint name contains only valid characters: alphanumeric, '-', '_', '/', '{', and '}'
      const pattern = /^[a-zA-Z0-9_\-/{}]*$/;
      if (!pattern.test(endpointName)) {
        invalidEndpointNames.push(endpointName);
        errorMessages.push(
          "Endpoint names can only contain alphanumeric characters, '-', '_', '/', '{', and '}'."
        );
        return;
      }

      // Check if endpoint name is less than 65 characters
      if (endpointName.length >= 65) {
        invalidEndpointNames.push(endpointName);
        errorMessages.push("Endpoint names must be less than 65 characters.");
        return;
      }
    });

    // If there are invalid endpoint names, show an error modal
    if (invalidEndpointNames.length > 0) {
      setModalHeading(
        <div className="wsdl_error-heading">
          <h2>ERROR</h2>
        </div>
      );
      setModalMessage(
        <div>
          {errorMessages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      );
      setShowModal(true);
      return false;
    }

    // All endpoint names are valid
    return true;
  };

  // Access paths from state
  const {
    baseUrl = "",
    outputFileName2 = "Output",
    tempOutputFolderpath = "",
    wrappedEdges = "",
    concatenatedId = "",
    projectType = "",
    selectedProjectType = "",
    endpointToOperationMapping = "",
    // uploadedFiles = [],
  } = state || {};

  const messages = [
    "Cloning...✅",
    "Modifying the template...✅",
    "Injecting RAML in the migrated Mule project...✅",
    "IIB to mule flow conversion...✅",
    "Creating ZIP...✅",
  ];

  // Function to handle the Convert and Download the converted api spec functionality
  const handleConvertButtonClick = async () => {
    setLoading(true);
    setMessage(messages);

    try {
      if (hasDuplicateEndpointNames()) {
        // setModalHeading(
        //   <div className="wsdl_error-heading">
        //     <h2>ERROR</h2>
        //   </div>
        // );
        // setModalMessage("Endpoint names must be unique for each card.");
        // setShowModal(true);
        Swal.fire({
          title: "Error",
          text: "Endpoint names must be unique for each card.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal2",
            container: "custom-swal-overlay",
          },
        });
        setLoading(false);
      } else if (hasEmptyEndpointNames()) {
        // setModalHeading(
        //   <div className="wsdl_error-heading">
        //     <h2>ERROR</h2>
        //   </div>
        // );
        // setModalMessage("Endpoint names cannot be empty.");
        // setShowModal(true);
        Swal.fire({
          title: "Error",
          text: "Endpoint names cannot be empty.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal2",
            container: "custom-swal-overlay",
          },
        });
        setLoading(false);
      } else if (!validateEndpointNames()) {
        setLoading(false);
        return;
      } else {
        // Extracting endpoint names and creating xsdFileDetails object
        const updatedXsdFileDetails = {};

        let modalValidationPassed = true;

        // Iterate through all modal table rows and perform validation
        Object.values(internalRowDetails).forEach((attributes) => {
          if (attributes) {
            attributes.forEach((attribute) => {
              const {
                attributeHeader,
                attributeName,
                attributeType,
                attributeRequired,
              } = attribute;

              if (
                !attributeHeader ||
                !attributeName ||
                !attributeType ||
                !attributeRequired
              ) {
                modalValidationPassed = false;
              }
            });
          }
        });
        // If validation failed, display modal message
        if (!modalValidationPassed) {
          //   setModalHeading(
          //     <div className="wsdl_error-heading">
          //       <h2>ERROR</h2>
          //     </div>
          //   );
          //   setModalMessage(
          //     "Please provide all attribute details for query parameters or headers."
          //   );
          //   setShowModal(true);
          Swal.fire({
            title: "Error",
            text: "Please provide all attribute details for query parameters or headers.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
              popup: "custom-swal2",
              container: "custom-swal-overlay",
            },
          });
          return;
        }

        endpointCards.forEach((card) => {
          const endpointNameInput = document.querySelector(
            `#endpoint-name-${card.id}`
          );
          console.log("endpointNameInput: ", endpointNameInput);

          if (endpointNameInput) {
            const endpointName = endpointNameInput.value;

            // Find the static endpoint data from initialEndpointData
            const initialEndpoint = initialEndpointData.endpoints.find(
              (endpoint) => endpoint.endpointName
            );

            if (initialEndpoint) {
              console.log("INSIDE ENDPOINT DATA");
              // const description = initialEndpoint.description || "";
              const description = card.description || "";

              const rowsData = card.methodRows.map((row, rowIndex) => {
                const selectedMethodKey = `${card.id}-${rowIndex + 1}`;
                const selectedMethodValue =
                  row.method || selectedMethod[selectedMethodKey] || "";

                const selectedContentTypeKey = `content-type-select-${
                  card.id
                }-${rowIndex + 1}`;
                const selectedContentType =
                  selectedContentTypeState[selectedContentTypeKey] ||
                  row.contentType ||
                  "";

                const inputElement = row.inputElement || "";
                const outputElement = row.outputElement || "";
                const faultElement = row.faultElement || "";

                const internalRowId = `${card.id}-${row.id}`;
                const internalRows = internalRowDetails[internalRowId] || [];
                console.log("internalRows:", internalRows);

                const inputAttributes = internalRows.map((internalrow) => ({
                  attributeHeader: internalrow.attributeHeader || "headers",

                  attributeName: internalrow.attributeName,
                  attributeType: internalrow.attributeType,
                  attributeRequired: internalrow.attributeRequired,
                }));
                console.log("inputAttributes:", inputAttributes);

                return {
                  method: selectedMethodValue,
                  contentType: selectedContentType,
                  inputElement: inputElement,
                  outputElement: outputElement,
                  faultElement: faultElement,
                  inputAttribute: inputAttributes,
                };
              });

              // Merge the current endpoint data into updatedXsdFileDetails
              updatedXsdFileDetails[endpointName] = {
                description: description,
                details: rowsData,
              };

              console.log(
                "UPDATED XSD FILE DETAILS::::",
                updatedXsdFileDetails
              );
            }
          }
        });

        // setUpdatedXsdFileDetails(updatedXsdFileDetails);

        // Include xsdFileDetails key in the final object
        const finalObject = {
          mainFileDetails: {
            title: initialEndpointData.title,
            baseUri: baseUrl,
            // outputFileName: outputFileName,
            securitySchemes: initialEndpointData.securitySchemes,
            traits: initialEndpointData.traits,
            // types: initialEndpointData.types,
          },
          xsdFileDetails: updatedXsdFileDetails,
        };

        console.log(JSON.stringify(finalObject));

        const response = await fetch(generateRamlUrl, {
          method: "POST",
          headers: {
            tempOutputFolderpath: tempOutputFolderpath,
            outputFileName: outputFileName2,
            "x-request-id": xRequestId,
          },
          // body: formData,
          body: JSON.stringify(finalObject),
        });

        if (response.ok) {
          setIsConversionSuccessful(true);
          console.log("FILE UPLOADED SUCCESSFULLY");

          const responseConnection = await fetch(migrateUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              masterId: concatenatedId,
              projectType: projectType,
              selectedProjectType: selectedProjectType,
              tempOutputFolderpath: tempOutputFolderpath,
              endpointToOperationMapping: endpointToOperationMapping,
              "x-request-id": xRequestId,
            },
            body: JSON.stringify(wrappedEdges),
          });

          if (responseConnection.ok) {
            const fileNameHeader = responseConnection.headers.get("fileName");
            console.log("fileNameHeader ", fileNameHeader);

            const tempFolderPath =
              responseConnection.headers.get("tempFolderPath");
            console.log("tempFolderPath", tempFolderPath);

            console.log("Response Headers:", responseConnection.headers);

            const fileName = responseConnection.headers.get("fileName");
            console.log("fileName: ", fileName);
            const filename = fileName ? fileName : "downloaded.zip";

            const blob = await responseConnection.blob();

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

          if (!responseConnection.ok) {
            const errorMessage = responseConnection.text();

            Swal.fire({
              title: "Error!",
              text: errorMessage,
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                popup: "custom-swal2",
                container: "custom-swal-overlay",
              },
            });
            // console.error("API call to getConnection failed:", error);
          }
        }

        if (!response.ok) {
          const errorMessage = await response.text();

          //   setModalHeading(
          //     <div className="wsdl_error-heading">
          //       <h2>ERROR</h2>
          //     </div>
          //   );
          //   setModalMessage(errorMessage);
          //   // setModalMessage(errorMessage);
          //   setShowModal(true);
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
          // throw new Error("Failed to convert files");
        }
      }
    } catch (error) {
      console.error("Error converting files:", error);

      //   setModalHeading(
      //     <div className="wsdl_error-heading">
      //       <h2>ERROR</h2>
      //     </div>
      //   );
      //   setModalMessage("Failed to convert files. Please try again later.");
      //   setShowModal(true);
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
      // Set loading to false after request is complete
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

    if (hasDuplicateEndpointNames()) {
      setModalHeading(
        <div className="wsdl_error-heading">
          <h2>ERROR</h2>
        </div>
      );
      setModalMessage("Endpoint names must be unique for each card.");
      setShowModal(true);
      setLoading(false);
    } else if (hasEmptyEndpointNames()) {
      setModalHeading(
        <div className="wsdl_error-heading">
          <h2>ERROR</h2>
        </div>
      );
      setModalMessage("Endpoint names cannot be empty.");
      setShowModal(true);
      setLoading(false);
    } else if (!validateEndpointNames()) {
      setLoading(false);
      return;
    } else {
      // Extracting endpoint names and creating xsdFileDetails object
      const updatedXsdFileDetails = {};

      let modalValidationPassed = true;

      // Iterate through all modal table rows and perform validation
      Object.values(internalRowDetails).forEach((attributes) => {
        if (attributes) {
          attributes.forEach((attribute) => {
            const {
              attributeHeader,
              attributeName,
              attributeType,
              attributeRequired,
            } = attribute;

            if (
              !attributeHeader ||
              !attributeName ||
              !attributeType ||
              !attributeRequired
            ) {
              modalValidationPassed = false;
            }
          });
        }
      });
      // If validation failed, display modal message
      if (!modalValidationPassed) {
        setModalHeading(
          <div className="wsdl_error-heading">
            <h2>ERROR</h2>
          </div>
        );
        setModalMessage(
          "Please provide all attribute details for query parameters or headers."
        );
        setShowModal(true);
        return;
      }

      endpointCards.forEach((card) => {
        const endpointNameInput = document.querySelector(
          `#endpoint-name-${card.id}`
        );
        console.log("endpointNameInput: ", endpointNameInput);

        if (endpointNameInput) {
          const endpointName = endpointNameInput.value;

          // Find the static endpoint data from initialEndpointData
          const initialEndpoint = initialEndpointData.endpoints.find(
            (endpoint) => endpoint.endpointName
          );

          if (initialEndpoint) {
            console.log("INSIDE ENDPOINT DATAAAAAAAAAAAA");
            // const description = initialEndpoint.description || "";
            const description = card.description || "";

            const rowsData = card.methodRows.map((row, rowIndex) => {
              const selectedMethodKey = `${card.id}-${rowIndex + 1}`;
              const selectedMethodValue =
                row.method || selectedMethod[selectedMethodKey] || "";

              const selectedContentTypeKey = `content-type-select-${card.id}-${
                rowIndex + 1
              }`;
              const selectedContentType =
                selectedContentTypeState[selectedContentTypeKey] ||
                row.contentType ||
                "";

              // Use the corresponding methodDetail from initialEndpointData
              // const methodDetail =
              //   initialEndpoint.methodDetails[rowIndex] || {};
              // const inputElement = methodDetail.inputElement || "";
              // const outputElement = methodDetail.outputElement || "";
              // const faultElement = methodDetail.faultElement || "";

              const inputElement = row.inputElement || "";
              const outputElement = row.outputElement || "";
              const faultElement = row.faultElement || "";

              // Extract attributes from internal rows in the UI state
              // const internalRowId = `${card.id}-${rowIndex + 1}`;
              const internalRowId = `${card.id}-${row.id}`;
              const internalRows = internalRowDetails[internalRowId] || [];
              console.log("internalRows:", internalRows);

              const inputAttributes = internalRows.map((internalrow) => ({
                attributeHeader: internalrow.attributeHeader || "headers",
                // attributeHeader: internalrow.attributeHeader,
                attributeName: internalrow.attributeName,
                attributeType: internalrow.attributeType,
                attributeRequired: internalrow.attributeRequired,
              }));
              console.log("inputAttributes:", inputAttributes);

              return {
                method: selectedMethodValue,
                contentType: selectedContentType,
                inputElement: inputElement,
                outputElement: outputElement,
                faultElement: faultElement,
                inputAttribute: inputAttributes,
              };
            });

            // Merge the current endpoint data into updatedXsdFileDetails
            updatedXsdFileDetails[endpointName] = {
              description: description,
              details: rowsData,
            };

            console.log("UPDATED XSD FILE DETAILS::::", updatedXsdFileDetails);
          }
        }
      });

      // setUpdatedXsdFileDetails(updatedXsdFileDetails);

      // Include xsdFileDetails key in the final object
      const finalObject = {
        mainFileDetails: {
          title: initialEndpointData.title,
          baseUri: baseUrl,
          // outputFileName: outputFileName,
          securitySchemes: initialEndpointData.securitySchemes,
          traits: initialEndpointData.traits,
          // types: initialEndpointData.types,
        },
        xsdFileDetails: updatedXsdFileDetails,
      };

      console.log(JSON.stringify(finalObject));

      setImportRamlDetails(JSON.stringify(finalObject));
      setShowImportOverlay(true);
      setTempFolderPathHeader(tempFolderPath);
      setFileNameImportHeader(fileNameHeader);
      setBlobContent(blob);
      return;
    }
  };

  // Function to handle closing Import Overlay
  const handleCloseImportOverlay = () => {
    setShowImportOverlay(false);
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
      <div className="wsdl_addapidetails-container">
        {/* Disclaimer button container  */}
        <div className="wsdl_disclaimer-button-container">
          <div style={{ marginTop: "25px" }}>
            <button
              className={`wsdl_disclaimer-button ${
                highlightButton ? "wsdl_highlight" : ""
              }`}
              onClick={() => setShowDisclaimer(!showDisclaimer)}
            >
              Disclaimer
            </button>
            <button className="wsdl_reload-button" onClick={handleReload}>
              <FontAwesomeIcon icon={faRedo} />
              <span className="wsdl_reload-tooltip">RESET</span>
            </button>
          </div>
          {showDisclaimer && (
            <div className="wsdl_disclaimer-box">
              {/* TODO: Check the discalimer points */}
              <ul>
                <li>Follow RAML norms strictly.</li>
                <li>You can change the endpoint name and the URI parameter.</li>
                <li>
                  The methods have been autogenerated. You may modify them to
                  better suit your requirements.
                </li>
                <li>
                  POST method can be modified to PUT and PATCH. GET method can
                  only be modified to DELETE.
                </li>
                <li>
                  Feel free to make valid changes which will cater your specific
                  requirements.
                </li>
                <li>Review the edits before submission.</li>
              </ul>
            </div>
          )}
        </div>

        {endpointCards.map((card) => {
          // console.log(`Rendering card: ${card.endpointName}`);
          return (
            <div className="wsdl_endpoint-card" key={card.id}>
              <div className="wsdl_card-header">
                <p
                  // className="wsdl_card-button"
                  component="label"
                  className="wsdl_add-new-endpoint-button"
                  onClick={() => handleRemoveCard(card.id)}
                >
                  Remove endpoint
                </p>
                {/* Info Message */}
                <div className="wsdl_info-message-endpoint">
                  {showInfo && (
                    <span className="wsdl_info-text-endpoint">
                      <div>
                        <b>1. Give valid endpoint starting with /</b>
                      </div>
                      <div>
                        <div>
                          <b>2. For URI Parameter, give it inside {"{ }"}</b>
                        </div>
                        <div>
                          <b>For example: /api/{"{uriParams}"}</b>
                        </div>
                      </div>
                    </span>
                  )}
                </div>
              </div>

              {/* Endpoint Table*/}
              <div className="wsdl_endpoint-table-row">
                <table className="wsdl_endpoint-table">
                  <thead>
                    <tr>
                      <th colSpan="1">
                        ENDPOINT NAME{" "}
                        <span
                          className="wsdl_tooltipendpoint"
                          onMouseEnter={toggleInfo}
                          onMouseLeave={toggleInfo}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="wsdl_info-icon"
                          />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="2">
                        <input
                          type="text"
                          placeholder="Enter Endpoint Name"
                          id={`endpoint-name-${card.id}`}
                          value={card.endpointName || ""}
                          onChange={(e) =>
                            handleEndpointNameChange(card.id, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Method Table */}
              <div className="wsdl_method-table-row">
                <table className="wsdl_method-table" cellSpacing={15}>
                  <thead>
                    <tr>
                      <th>METHOD</th>
                      <th>EDIT QUERY/HEADER</th>
                      <th>PAYLOAD BODY</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.methodRows.map((row) => {
                      return (
                        <tr key={row.id}>
                          <td width={2}>
                            <select
                              id={`method-select-${card.id}-${row.id}`}
                              style={{ width: "100px" }}
                              value={row.method}
                              onChange={(e) =>
                                handleMethodChange(
                                  card.id,
                                  row.id,
                                  e.target.value
                                )
                              }
                            >
                              {row.method === "GET" ||
                              row.method === "DELETE" ? (
                                <>
                                  <option value="GET">GET</option>
                                  <option value="DELETE">DELETE</option>
                                </>
                              ) : row.method === "POST" ||
                                row.method === "PUT" ||
                                row.method === "PATCH" ? (
                                <>
                                  <option value="POST">POST</option>
                                  <option value="PUT">PUT</option>
                                  <option value="PATCH">PATCH</option>
                                </>
                              ) : (
                                <option value={row.method}>{row.method}</option>
                              )}
                            </select>
                          </td>

                          <td>
                            <table className="wsdl_modal-table" cellSpacing={5}>
                              <ModalTableRows
                                cardId={card.id}
                                rowId={row.id}
                                method={row.method}
                                handleUpdateAttributes={handleUpdateAttributes}
                                endpointData={initialEndpointData}
                              />
                            </table>
                          </td>

                          <td width={450}>
                            <select
                              id={`content-type-select-${card.id}-${row.id}`}
                              style={{ width: "450px" }}
                              value={row.contentType || ""}
                              onChange={(e) =>
                                handleContentTypeChange(
                                  card.id,
                                  row.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="application/json">
                                application/json
                              </option>
                              <option value="application/xml">
                                application/xml
                              </option>
                            </select>

                            <SyntaxHighlighter
                              language="json"
                              style={atomOneLight}
                              customStyle={{
                                maxWidth: "435px",
                                overflowX: "auto",
                                maxHeight: "300px",
                                overflowY: "auto",
                                fontWeight: "bolder",
                                // overflowX: "none",
                                whiteSpace: "pre-wrap",
                              }}
                              className="wsdl_scrollable-syntax-highlighter"
                            >
                              {row.payloadBody &&
                              Object.keys(row.payloadBody).length > 0
                                ? JSON.stringify(row.payloadBody, null, 2)
                                : "No payload body available"}
                            </SyntaxHighlighter>
                          </td>
                          <td className="wsdl_add-button-method-cell">
                            <div className="wsdl_add-remove-method-rows">
                              <button
                                className="wsdl_minus-button"
                                // className="wsdl_remove-button-method"
                                onClick={() => handleRemoveRow(card.id, row.id)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        <div className="wsdl_convert-button-container">
          <button
            className="wsdl_convert-button-final"
            onClick={handleConvertButtonClick}
          >
            NEXT
          </button>
          {/* <button
            className="wsdl_upload-button-final"
            onClick={handleImportButtonClick}
          >
            Import to Anypoint platform
          </button> */}
        </div>
      </div>

      {/* {showModal && (
        <div className="wsdl_modal-overlay" onClick={handleCloseModal}>
          <div className="wsdl_modal" onClick={(e) => e.stopPropagation()}>
            <span className="wsdl_close" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="wsdl_modal-body">
              
              {modalHeading && (
                <div className="wsdl_custom-heading">{modalHeading}</div>
              )}
              <p className="wsdl_modal-message">{modalMessage}</p>
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
                // yamlText={importYamlText}
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

export default AddApiDetails;
