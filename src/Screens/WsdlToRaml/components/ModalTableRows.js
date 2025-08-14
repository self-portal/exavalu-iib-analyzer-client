import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import "../stylings/Modal.css";

const ModalTableRows = ({
  cardId,
  rowId,
  method,
  handleUpdateAttributes,
  endpointData,
}) => {
  const [internalrows, setInternalRows] = useState([
    { id: 1, queryHeader: "", attributeName: "", type: "", required: "" },
  ]);

  useState(() => {
    if (endpointData && endpointData.endpoints) {
      // Find the endpoint corresponding to the current cardId
      const endpoint = endpointData.endpoints[cardId - 1];

      if (
        endpoint &&
        endpoint.methodDetails &&
        endpoint.methodDetails.length > 0
      ) {
        // Find the specific method for the current rowId
        const method = endpoint.methodDetails[rowId - 1]; // Assuming rowId matches method index

        if (
          method &&
          method.attributeDetails &&
          method.attributeDetails.length > 0
        ) {
          setInternalRows(
            method.attributeDetails.map((element, index) => ({
              id: index + 1,
              // queryHeader: element.elementType,
              queryHeader: method.method === "GET" ? "queryParams" : "headers",
              attributeName: element.elementName,
              type: element.type,
              required: element.required ? "true" : "false",
              removable: false,
            }))
          );
          return;
        }
      }
    }

    // Set default row if no valid endpoint or attributeDetails found
    setInternalRows([
      {
        id: 1,
        queryHeader: "",
        attributeName: "",
        type: "",
        required: "",
      },
    ]);
  }, [endpointData, cardId, rowId]);

  const handleAddRowInternal = () => {
    const newRow = {
      id: internalrows.length + 1,
      queryHeader: "",
      attributeName: "",
      type: "",
      required: "",
      removable: true,
    };
    setInternalRows((prevRows) => [...prevRows, newRow]);
  };

  const handleRemoveRowInternal = (idToRemove) => {
    if (internalrows.length === 1) {
      // If only one row is left, reset it to default values
      setInternalRows([
        {
          id: 1,
          queryHeader: "",
          attributeName: "",
          type: "",
          required: "",
        },
      ]);
      handleUpdateAttributes(cardId, rowId, [
        {
          id: 1,
          queryHeader: "",
          attributeName: "",
          type: "",
          required: "",
        },
      ]);
    } else {
      // If more than one row is left, remove the row
      const updatedRows = internalrows.filter((row) => row.id !== idToRemove);
      setInternalRows(updatedRows);
      handleUpdateAttributes(cardId, rowId, updatedRows);
    }
  };

  const handleAttributeChange = (e, id, key) => {
    const { value } = e.target;
    // Check the length of the input value for attributeName
    if (key === "attributeName" && value.length > 64) {
      alert("Attribute Name cannot exceed 64 characters");
      return;
    }
    const updatedRows = internalrows.map((row) =>
      row.id === id ? { ...row, [key]: value } : row
    );
    // console.log("Updated Rows:", updatedRows);
    setInternalRows(updatedRows);
    handleUpdateAttributes(cardId, rowId, updatedRows);
  };

  return (
    <tbody className="wsdl_modal-body-attribute">
      {internalrows.map((internalrow) => (
        <tr key={internalrow.id} style={{ border: "green" }}>
          <td width={140}>
            <select
              value={internalrow.queryHeader}
              onChange={(e) =>
                handleAttributeChange(e, internalrow.id, "queryHeader")
              }
              disabled={
                method === "POST" && internalrow.queryHeader === "queryParams"
              }
            >
              <option value="">--Attribute--</option>
              <option value="queryParams" disabled={method === "POST"}>
                Query Params
              </option>
              <option value="headers">Headers</option>
            </select>
          </td>
          <td>
            <input
              type="text"
              name="attribute-name"
              className="wsdl_input-field"
              value={internalrow.attributeName}
              onChange={(e) =>
                handleAttributeChange(e, internalrow.id, "attributeName")
              }
              placeholder="Attribute Name"
            />
          </td>
          <td>
            <select
              value={internalrow.type}
              onChange={(e) => handleAttributeChange(e, internalrow.id, "type")}
            >
              <option value="">--Type--</option>
              <option value="any">any</option>
              <option value="array">array</option>
              <option value="date-only">date-only</option>
              <option value="datetime">datetime</option>
              <option value="datetime-only">datetime-only</option>
              <option value="file">file</option>
              <option value="integer">integer</option>
              <option value="nil">nil</option>
              <option value="number">number</option>
              <option value="object">object</option>
              <option value="string">string</option>
              <option value="time-only">time-only</option>
            </select>
            <select
              value={internalrow.required}
              onChange={(e) =>
                handleAttributeChange(e, internalrow.id, "required")
              }
            >
              <option value="">--Required--</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </td>
          <td className="wsdl_plus-minus-column">
            <div className="wsdl_api-details-add-remove-method-rows">
              <button
                className="wsdl_plus-button"
                onClick={handleAddRowInternal}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button
                className="wsdl_minus-button"
                // className="wsdl_remove-button-method"
                onClick={() => handleRemoveRowInternal(internalrow.id)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </td>
          <td className="wsdl_remove-button-cell">
            {/* <button
              className="wsdl_remove-button-modal"
              onClick={() => handleRemoveRowInternal(internalrow.id)}
            >
              <i className="fas fa-times"></i>
            </button> */}
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default ModalTableRows;
