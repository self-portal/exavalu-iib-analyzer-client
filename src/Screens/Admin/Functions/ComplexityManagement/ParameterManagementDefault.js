import {
  Box,
  Button,
  Container,
  FormControl,
  Paper,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React from "react";
import Swal from "sweetalert2";
import {
  DataGrid,
  GridRowEditStopReasons,
  GridRowModes,
} from "@mui/x-data-grid";
import axios from "axios";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import ProgressAnimation from "../../../../Components/Animation/Animation";
import { useConfirm } from "material-ui-confirm";

let ParameterManagementDefault = () => {
  const [submitButtonDisabled, setSubmitButtonDisabled] = React.useState(true);
  const [isEditActive, setIsEditActive] = React.useState(false);
  const xRequestId = uuidv4();
  let user_name = "";

  const [encryptedQueryName] = React.useState(
    localStorage.getItem("queryName") || ""
  );

  user_name = CryptoJS.AES.decrypt(
    encryptedQueryName,
    process.env.REACT_APP_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);

  const url =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_UPDATE_PARAMETER +
    "?user_name=" +
    user_name;

  const [activeStep, setActiveStep] = React.useState(0);
  const [skippedSteps, setSkippedSteps] = React.useState([]);
  const [restApiData, setRestApiData] = React.useState(null);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [nodeNames, setNodeNames] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });
  const confirm = useConfirm();

  let loadData = () => {
    axios
      .get(`${url}`, {
        headers: {
          "X-Request-ID": xRequestId,
        },
      })
      .then((resp) => {
        resp.data.map((item) =>
          item.jobName === "default" ? setRestApiData(item) : []
        );
      })
      .catch((error) => {
        toast.error("Error occured" + error.message);
      });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  let getSteps = () => {
    return [
      "Listener",
      "Method",
      "Node",
      "Connector",
      "Node Protocol",
      "Transform Node",
      "Transform LoC",
      "Transform Loop",
      "Route Path",
      "Schema",
      "Estimation Effort",
    ];
  };

  const steps = getSteps();

  const isStepSkipped = (step) => {
    return skippedSteps.includes(step);
  };

  const handleCancelClick = (cellValues, nodeNames) => () => {
    const id = cellValues.row.id;
    setNodeNames(nodeNames);
    setRowModesModel({
      ...rowModesModel,
      [id]: {
        mode: GridRowModes.View,
        ignoreModifications: true,
      },
    });
    if (nodeNames === "refEstmitationEffort") {
      const editedRow = restApiData[nodeNames].find((row) => row.id === id);
      if (editedRow.isNew) {
        setRestApiData(restApiData[nodeNames].filter((row) => row.id !== id));
      }
      setIsEditActive(false);
    } else {
      const editedRow = restApiData[nodeNames].weightInfo.find(
        (row) => row.id === id
      );
      if (editedRow.isNew) {
        setRestApiData(
          restApiData[nodeNames].weightInfo.filter((row) => row.id !== id)
        );
      }
      setIsEditActive(false);
    }
  };

  const handleEditClick = (cellValues, nodeValue) => () => {
    setIsEditActive(true);
    setNodeNames(nodeValue);
    if (isEditActive === true) {
      handleCancelClick(cellValues, nodeValue);
    } else {
      const id = cellValues.row.id;
      setRowModesModel(
        {
          ...rowModesModel,
          [id]: { mode: GridRowModes.Edit },
        }
        // nodeLimitsTemp(nodeValue, cellValues.row.id)
      );
    }
  };

  // State issue to be solved!!!
  // const nodeLimitsTemp = (nodeName, indexOfRow) => {
  //   if (indexOfRow === 1) {
  //     restApiData[nodeName].minLimit =
  //       restApiData[nodeName].weightInfo.slice(0)[0].min;
  //   } else if (
  //     indexOfRow === restApiData[nodeName].weightInfo.slice(-1)[0].id
  //   ) {
  //     restApiData[nodeName].maxLimit =
  //       restApiData[nodeName].weightInfo.slice(-1)[0].max;
  //   }
  // };

  const nodeLimits = (restApiDataTemp) => {
    if (nodeNames === "refEstmitationEffort") {
      restApiData[nodeNames][0].scoreMin =
        restApiDataTemp[nodeNames].slice(0)[0].scoreMin;
      restApiData[nodeNames][restApiData[nodeNames].length - 1].scoreMax =
        restApiDataTemp[nodeNames].slice(-1)[0].scoreMax;
    } else {
      restApiData[nodeNames].minLimit =
        restApiDataTemp[nodeNames].weightInfo.slice(0)[0].min;
      restApiData[nodeNames].maxLimit =
        restApiDataTemp[nodeNames].weightInfo.slice(-1)[0].max;
    }
  };

  const handleSaveClick = (cellValues, nodeValue) => () => {
    const id = cellValues.row.id;
    setNodeNames(nodeValue);

    // Directly update the row mode and states without a confirmation dialog
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });

    // Enable the submit button and disable edit mode
    setSubmitButtonDisabled(false);
    setIsEditActive(false);
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow };
    nodeNames === "refEstmitationEffort"
      ? setRestApiData((prevState) => {
          const newState = prevState;
          newState[nodeNames] = restApiData[nodeNames].map((row) =>
            row.id === newRow.id ? updatedRow : row
          );
          return newState;
        })
      : setRestApiData((prevState) => {
          const newState = prevState;
          newState[nodeNames].weightInfo = restApiData[
            nodeNames
          ].weightInfo.map((row) => (row.id === newRow.id ? updatedRow : row));
          return newState;
        });
    return updatedRow;
  };

  let postOperation = () => {
    Swal.fire({
      title: "Do you want to submit the changes?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Submit",
      denyButtonText: `Don't Submit`,
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Show the loading spinner before starting the API call
        Swal.fire({
          title: "Submitting your changes...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
          didOpen: () => {
            Swal.showLoading();
          },
        });
        axios
          .post(`${url}`, restApiData, nodeLimits(restApiData), {
            headers: {
              "X-Request-ID": xRequestId,
            },
          })
          .then((resp) => {
            // Swal.fire("Saved!", resp.data.message, "success");
            Swal.fire({
              title: "Saved!",
              text: resp.data.message,
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                popup: "custom-swal",
                container: "custom-swal-overlay",
              },
            });
          }, setSubmitButtonDisabled(true))
          .catch((err) => {
            // Swal.fire("Failed", err.response.data.message, "error");
            Swal.fire({
              title: "Failed",
              text: err.response.data.message || "An error occurred",
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                popup: "custom-swal",
                container: "custom-swal-overlay",
              },
            });
          });
      } else if (result.isDenied) {
        Swal.fire({
          title: "Changes are not submitted",
          text: "",
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

  let getStepsLabel = (step) => {
    switch (step) {
      case 0:
        const columnsListener = [
          {
            field: "type",
            headerName: "Type",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refListener")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refListener")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refListener")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];
        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Listener
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refListener.weightInfo}
                columns={columnsListener}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                disabled={submitButtonDisabled}
                variant="contained"
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 1:
        const columnsMethod = [
          {
            field: "type",
            headerName: "Type",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refMethod")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refMethod")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refMethod")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Method
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refMethod.weightInfo}
                columns={columnsMethod}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                disabled={submitButtonDisabled}
                variant="contained"
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 2:
        const columnsNode = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refNode")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refNode")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refNode")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Node
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refNode.weightInfo}
                columns={columnsNode}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );
      case 3:
        const columnsConnector = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refConnector")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refConnector")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refConnector")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Connector
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refConnector.weightInfo}
                columns={columnsConnector}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 4:
        const columnsNodeProto = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refNodeProto")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refNodeProto")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refNodeProto")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Node Protocol
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refNodeProto.weightInfo}
                columns={columnsNodeProto}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 5:
        const columnsTransformNode = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(
                          cellValues,
                          "refTransformNode"
                        )}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(
                          cellValues,
                          "refTransformNode"
                        )}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(
                          cellValues,
                          "refTransformNode"
                        )}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Transform Node
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refTransformNode.weightInfo}
                columns={columnsTransformNode}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );
      case 6:
        const columnsTransformLoc = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refTransformLoc")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(
                          cellValues,
                          "refTransformLoc"
                        )}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refTransformLoc")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Transform LoC
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refTransformLoc.weightInfo}
                columns={columnsTransformLoc}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 7:
        const columnsTransformLoop = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(
                          cellValues,
                          "refTransformLoop"
                        )}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(
                          cellValues,
                          "refTransformLoop"
                        )}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(
                          cellValues,
                          "refTransformLoop"
                        )}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Transform Loop
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refTransformLoop.weightInfo}
                columns={columnsTransformLoop}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 8:
        const columnsRoutePath = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refRoutePath")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refRoutePath")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refRoutePath")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Route Path
              </Typography>
            </div>
            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refRoutePath.weightInfo}
                columns={columnsRoutePath}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );
      case 9:
        const columnsRefSchema = [
          {
            field: "min",
            headerName: "Minimum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "max",
            headerName: "Maximum",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "weight",
            headerName: "Weights",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues, "refSchema")}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues, "refSchema")}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(cellValues, "refSchema")}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Ref Schema
              </Typography>
            </div>

            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refSchema.weightInfo}
                columns={columnsRefSchema}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );

      case 10:
        const columnsEstimation = [
          {
            field: "scoreMin",
            headerName: "Score Min",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "scoreMax",
            headerName: "Score Max",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "complexityLevel",
            headerName: "Complexity Level",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "estimatedHours",
            headerName: "Estimation Hours",
            flex: 1,
            align: "left",
            headerAlign: "left",
            editable: true,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            flex: 0.4,
            align: "right",
            headerAlign: "right",
            cellClassName: "actions",
            renderCell: (cellValues) => (
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                {rowModesModel[cellValues.row.id]?.mode ===
                GridRowModes.Edit ? (
                  <>
                    <span title="Save">
                      <SaveIcon
                        label="Save"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(
                          cellValues,
                          "refEstmitationEffort"
                        )}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(
                          cellValues,
                          "refEstmitationEffort"
                        )}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span title="Edit">
                      <EditIcon
                        label="Edit"
                        sx={{
                          color: "blue",
                          cursor: "pointer",
                          paddingRight: "10px",
                          fontSize: "1.8rem",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.2)",
                          },
                        }}
                        onClick={handleEditClick(
                          cellValues,
                          "refEstmitationEffort"
                        )}
                      />
                    </span>
                  </>
                )}
              </div>
            ),
          },
        ];

        return (
          <>
            <div id="parameterManagement-nodes-header">
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                Estimation Effort
              </Typography>
            </div>

            <div
              id="parameterManagement-nodes-values"
              style={{
                padding: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              }}
            >
              <DataGrid
                onCellDoubleClick={(params, event) => {
                  if (!event.ctrlKey) {
                    event.defaultMuiPrevented = true;
                  }
                }}
                rows={restApiData.refEstmitationEffort}
                columns={columnsEstimation}
                getRowId={(row) => row.id}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                onRowModesModelChange={handleRowModesModelChange}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                disableSelectionOnClick
                disableColumnMenu
                rowHeight={50}
                style={{ height: "400px" }}
              />
            </div>
            <div
              id="parameterManagement-nodes-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "16px",
              }}
            >
              <Button
                variant="contained"
                disabled={submitButtonDisabled}
                onClick={postOperation}
              >
                Submit
              </Button>
            </div>
          </>
        );
      default:
        return "Unknown Case";
    }
  };

  // function for non linear
  const handleStep = (step) => () => {
    if (isEditActive === false) {
      setActiveStep(step);
    } else {
      toast.info("Please save or cancel in order to move", {
        toastId: "info 100",
      });
    }
  };

  return restApiData === null ? (
    <ProgressAnimation isAdminPage={true} />
  ) : (
    // </div>
    <div className="parameterManagement-container-fluid">
      <Paper id="parameterManagement-paper">
        <Box id="parameterManagement-nodes-box">
          <div id="parameterManagement-header">
            <Typography
              variant="h4"
              lineHeight={"2.2"}
              fontFamily={"Nunito"}
              fontSize={"2rem"}
            >
              DEFAULT PARAMETER MANAGEMENT
            </Typography>
          </div>
          <>
            <Container>
              <Stepper
                nonLinear
                alternativeLabel
                style={{ width: "100%" }}
                activeStep={activeStep}
              >
                {steps.map((step, index) => {
                  const stepProps = {};
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                    <Step key={index} {...stepProps}>
                      <StepButton onClick={handleStep(index)}>
                        <StepLabel style={{ wordBreak: "break-word" }}>
                          {step}
                        </StepLabel>
                      </StepButton>
                    </Step>
                  );
                })}
              </Stepper>
            </Container>
            <FormControl>{getStepsLabel(activeStep)}</FormControl>
          </>
        </Box>
      </Paper>
    </div>
  );
};

export default ParameterManagementDefault;
