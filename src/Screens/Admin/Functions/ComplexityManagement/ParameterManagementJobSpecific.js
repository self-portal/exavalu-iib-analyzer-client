import {
  Box,
  Button,
  Container,
  FormControl,
  Paper,
  Stack,
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
  GridToolbarContainer,
} from "@mui/x-data-grid";
import axios from "axios";
import CryptoJS from "crypto-js";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import ProgressAnimation from "../../../../Components/Animation/Animation";
import { useConfirm } from "material-ui-confirm";

let ParameterManagementJobSpecific = () => {
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
  const [rows, setRows] = React.useState([]);
  const [nodeNames, setNodeNames] = React.useState("");
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  const confirm = useConfirm();
  let location = useLocation();
  let jobName;
  if (location.state) {
    jobName = location.state.jobName;
  }

  let loadData = () => {
    axios
      .get(`${url}`, {
        headers: {
          "X-Request-ID": xRequestId,
        },
      })
      .then((resp) => {
        resp.data.forEach((item) => {
          if (item.jobName === jobName) {
            setRestApiData(item);
          } else {
            if (item.jobName === "default") {
              item.jobName = jobName;
              setRestApiData(item);
            }
          }
        });
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

  // TODO:
  const handleCancelClick = (cellValues) => () => {
    const id = cellValues.row.id;

    // Set the row mode to view and ignore modifications
    setRowModesModel({
      ...rowModesModel,
      [id]: {
        mode: GridRowModes.View,
        ignoreModifications: true,
      },
    });

    // Check if the row is new and remove it only if it is a newly created node
    if (nodeNames === "refEstmitationEffort") {
      const editedRow = restApiData[nodeNames].find((row) => row.id === id);
      if (editedRow && editedRow.isNew) {
        setRestApiData((prevData) => ({
          ...prevData,
          [nodeNames]: prevData[nodeNames].filter((row) => row.id !== id),
        }));
      }
    } else {
      const editedRow = restApiData[nodeNames].weightInfo.find(
        (row) => row.id === id
      );
      if (editedRow && editedRow.isNew) {
        setRestApiData((prevData) => ({
          ...prevData,
          [nodeNames]: {
            ...prevData[nodeNames],
            weightInfo: prevData[nodeNames].weightInfo.filter(
              (row) => row.id !== id
            ),
          },
        }));
      }
    }

    // Disable edit mode
    setIsEditActive(false);
  };

  // TODO:
  const handleDeleteClick = (cellValues, nodeValue) => () => {
    const id = cellValues.row.id;

    confirm({
      title: "Do you want to delete locally?",
      buttonOrder: ["confirm", "cancel"],
      confirmationText: "Confirm",
      customClass: {
        popup: "custom-swal",
        // container: "custom-swal-overlay",
      },
    })
      .then(() =>
        nodeValue === "refEstmitationEffort"
          ? setRestApiData(
              (prevState) => {
                const newState = prevState;
                newState[nodeValue] = restApiData[nodeValue].filter(
                  (row) => row.id !== id
                );
                return newState;
              },
              setSubmitButtonDisabled(false),
              setRows(rows.filter((row) => row.id !== id))
            )
          : setRestApiData(
              (prevState) => {
                const newState = prevState;
                newState[nodeValue].weightInfo = restApiData[
                  nodeValue
                ].weightInfo.filter((row) => row.id !== id);
                return newState;
              },
              setSubmitButtonDisabled(false),
              setRows(rows.filter((row) => row.id !== id))
            )
      )
      .catch(() => console.log("Delete cancelled"));
  };

  // TODO:
  const handleEditClick = (cellValues, nodeValue) => () => {
    setIsEditActive(true);
    setNodeNames(nodeValue);
    if (isEditActive === true) {
      handleCancelClick(cellValues, nodeValue);
    } else {
      const id = cellValues.row.id;
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.Edit },
      });
    }
  };

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

  // TODO:
  const handleSaveClick = (cellValues) => () => {
    const id = cellValues.row.id;

    // Directly save the changes without confirmation
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });

    // Mark the row as not new to prevent deletion on cancel click
    setRestApiData((prevData) => {
      const updatedData = { ...prevData };
      if (nodeNames === "refEstmitationEffort") {
        updatedData[nodeNames] = updatedData[nodeNames].map((row) =>
          row.id === id ? { ...row, isNew: false } : row
        );
      } else {
        updatedData[nodeNames].weightInfo = updatedData[
          nodeNames
        ].weightInfo.map((row) =>
          row.id === id ? { ...row, isNew: false } : row
        );
      }
      return updatedData;
    });

    // Re-enable the submit button since we have unsaved changes
    setSubmitButtonDisabled(false);
    setIsEditActive(false);
  };

  // TODO: Add records
  function EditToolbar(props) {
    const { setRowModesModel, nodeNames, nodeValue } = props;
    setNodeNames(nodeNames);
    const handleClick = () => {
      const id = nodeValue + 1;

      if (nodeNames === "refMethod") {
        setRestApiData((prevState) => {
          const newState = prevState;
          newState[nodeNames].weightInfo = [
            ...restApiData[nodeNames].weightInfo,
            {
              id,
              type: "GET",
              weight: 0,
              isNew: true, // Set the isNew flag to true for new rows
            },
          ];
          return newState;
        });
      } else if (nodeNames === "refEstmitationEffort") {
        setRestApiData((prevState) => {
          const newState = prevState;
          newState[nodeNames] = [
            ...restApiData[nodeNames],
            {
              id,
              scoreMin: 0,
              scoreMax: 0,
              complexityLevel: "Simple",
              estimatedHours: 0,
              isNew: true, // Set the isNew flag to true for new rows
            },
          ];
          return newState;
        });
      } else {
        setRestApiData((prevState) => {
          const newState = prevState;
          newState[nodeNames].weightInfo = [
            ...restApiData[nodeNames].weightInfo,
            {
              id,
              min: 0,
              max: 0,
              weight: 0,
              isNew: true, // Set the isNew flag to true for new rows
            },
          ];
          return newState;
        });
      }

      setRowModesModel((oldModel) => ({
        ...oldModel,
        [id]: {
          mode: GridRowModes.Edit,
        },
      }));
    };

    return (
      <GridToolbarContainer>
        <Button
          color="primary"
          component="label"
          startIcon={<AddIcon />}
          onClick={handleClick}
        >
          Add Parameters
        </Button>
      </GridToolbarContainer>
    );
  }

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

  // FIXME: FIXED
  const postOperation = async () => {
    const result = await Swal.fire({
      title: "Do you want to submit the changes?",
      showDenyButton: true,
      confirmButtonText: "Submit",
      denyButtonText: `Don't Submit`,
      customClass: {
        popup: "custom-swal",
        container: "custom-swal-overlay",
      },
    });

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

      try {
        await axios.post(`${url}`, restApiData, nodeLimits(restApiData), {
          headers: {
            "X-Request-ID": xRequestId,
          },
        });

        // Once the submission is successful, update the isNew property to false for all new rows
        setRestApiData((prevData) => {
          const updatedData = { ...prevData };
          if (nodeNames === "refEstmitationEffort") {
            updatedData[nodeNames] = updatedData[nodeNames].map((row) =>
              row.isNew ? { ...row, isNew: false } : row
            );
          } else {
            updatedData[nodeNames].weightInfo = updatedData[
              nodeNames
            ].weightInfo.map((row) =>
              row.isNew ? { ...row, isNew: false } : row
            );
          }
          return updatedData;
        });

        // Hide the loading spinner and show the success message
        Swal.fire({
          title: "Saved!",
          text: "Your changes have been submitted successfully.",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        });

        // Disable the submit button since all changes have been saved
        setSubmitButtonDisabled(true);
      } catch (err) {
        // Hide the loading spinner and show the error message

        Swal.fire({
          title: "Failed",
          text: err.response?.data?.message || "An error occurred",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "custom-swal",
            container: "custom-swal-overlay",
          },
        });
      }
    } else if (result.isDenied) {
      // Swal.fire("Changes are not submitted", "", "info");
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
  };

  let getStepsLabel = (step) => {
    switch (step) {
      // Case 0 - Listener (368 - 497)
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
            align: "right",
            headerAlign: "right",
            flex: 0.4,
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refListener")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refListener",
                    nodeValue: restApiData.refListener.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 1 - Method (499 - 624)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refMethod")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refMethod",
                    nodeValue: restApiData.refMethod.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 2 - Node (627 - 760)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refNode")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refNode",
                    nodeValue: restApiData.refNode.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 3 - Connector (763 - 896)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refConnector")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refConnector",
                    nodeValue: restApiData.refConnector.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 4 - Node Protocol (899 - 1032)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refNodeProto")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refNodeProto",
                    nodeValue: restApiData.refNodeProto.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 5 - Transform Node (1035 - 1174)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refTransformNode",
                    nodeValue: restApiData.refTransformNode.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 6 - Transform LoC (1177 - 1313)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(
                          cellValues,
                          "refTransformLoc"
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refTransformLoc",
                    nodeValue: restApiData.refTransformLoc.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 7 - Transform Loop (1316 - 1455)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refTransformLoop",
                    nodeValue: restApiData.refTransformLoop.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 8 - Route Path (1458 - 1591)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refRoutePath")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refRoutePath",
                    nodeValue: restApiData.refRoutePath.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 9 - Ref Schema (1594 - 1727)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(cellValues, "refSchema")}
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refSchema",
                    nodeValue: restApiData.refSchema.weightInfo.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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

      // Case 10 - Estimation Effort (1730 - 1877)
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
                          color: "green",
                          cursor: "pointer",
                          paddingRight: "10px",
                        }}
                        onClick={handleSaveClick(cellValues)}
                      />
                    </span>
                    <span title="Cancel">
                      <CancelIcon
                        label="Cancel"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleCancelClick(cellValues)}
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
                    <span title="Delete">
                      <DeleteIcon
                        label="Delete"
                        sx={{
                          color: "red",
                          cursor: "pointer",
                        }}
                        onClick={handleDeleteClick(
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
                id="job-name"
                style={{ fontWeight: "bold" }}
              >
                Job: {restApiData.jobName}
              </Typography>
              <Typography
                variant="h5"
                className="parameterManagement-cases"
                style={{ color: "#1976d2" }}
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
                slots={{
                  toolbar: EditToolbar,
                }}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 15]}
                slotProps={{
                  toolbar: {
                    setRows,
                    setRowModesModel,
                    nodeNames: "refEstmitationEffort",
                    nodeValue: restApiData.refEstmitationEffort.length,
                  },
                }}
                rowHeight={50}
                disableColumnMenu
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
              JOB SPECIFIC PARAMETER MANAGEMENT
            </Typography>
          </div>
          <>
            <Container>
              <Stepper nonLinear alternativeLabel activeStep={activeStep}>
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

export default ParameterManagementJobSpecific;
