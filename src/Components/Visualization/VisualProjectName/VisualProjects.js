import React, { useState, useEffect } from "react";
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
import Sidenav from "../../Utilities/Sidenav";
import NavbarPrivate from "../../Utilities/NavbarPrivate";
import { Col, Container, Row } from "react-bootstrap";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Checkbox from "@mui/material/Checkbox";
import ProgressAnimation from "../../Animation/Animation";
import "react-toastify/dist/ReactToastify.css";
import "../../Global/GlobalVariable";
import { v4 as uuidv4 } from "uuid";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import "./VisualProjects.css";

let VisualProjects = () => {
  //File name store in session storage
  var project_name = localStorage.getItem("project_name");
  const [post, setPost] = React.useState([]);
  let user_name = "admin";
  if (global.queryName !== null) {
    user_name = global.queryName;
  }
  const [selectAll, setSelectAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [chunkedItems, setChunkedItems] = useState([]);
  const [value, setValue] = useState([]);
  const [loading, setLoading] = React.useState(true);
  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    user_name;

  // === button for popup close ===
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setPost(response.data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (post.length > 0) {
      setChunkedItems(chunkArray(post));
    }
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
  }

  // === Checbox all selection ===
  const rowData = chunkedItems.length ? chunkedItems[0].subJobs : [];

  const handleSelectAllClick = (event) => {
    setSelectAll(!selectAll);
    setChunkedItems((prevData) =>
      prevData.map((job) => ({
        ...job,
        subJobs: job.subJobs.map((subJob) => ({
          ...subJob,
          checked: !selectAll,
        })),
      }))
    );
    if (event.target.checked) {
      setSelected(rowData.map((row) => row.subJobName));
    } else {
      setSelected([]);
    }
  };
  const selectedSubjobs = [];

  const handleRowClick = (name, index, itemIndex) => {
    setChunkedItems((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index] };
      newData[index].subJobs = [...newData[index].subJobs];
      newData[index].subJobs[itemIndex] = {
        ...newData[index].subJobs[itemIndex],
        checked: !newData[index].subJobs[itemIndex].checked,
      };

      const selectedIndex = selected.indexOf(name);
      let newSelected = [];
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, name);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      } else newSelected = [];

      setSelected(newSelected);

      // Update selectAll state
      const allChecked = newData[index].subJobs.every(
        (subJob) => subJob.checked
      );
      setSelectAll(allChecked);

      return newData;
    });
  };

  // Check if any checkbox is selected
  const isButtonEnabled = selected.length > 0;

  const isSelected = (id) => selected.indexOf(id) !== -1;

  console.log("SELECTED", selected);

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
      <NavbarPrivate />
      <Sidenav />
      <div
        id="visual-project"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px 0",
          marginRight: "62rem",
          // marginLeft: "17.2rem",
        }}
      >
        <div
          style={{ marginBottom: "125px", marginTop: "-20px", height: "100%" }}
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
                onChange={handleSelectAllClick}
                inputProps={{ "aria-label": "Select All" }}
                checked={selectAll}
                style={{
                  position: "relative",
                  left: "76.2%",
                  color: "#1e88e5",
                  transform: "scale(1.5)",
                }}
              />

              <Stack spacing={1} direction="row">
                {isButtonEnabled ? (
                  <Link
                    to="/datatable"
                    state={[{ getRetrieve: post, checkedData: selected }]}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      component="button"
                      variant="contained"
                      style={{
                        backgroundColor: "#2196f3",
                        color: "#fff",
                        fontWeight: "bold",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "16px",
                        marginRight: "25px",
                      }}
                    >
                      Interpret
                    </Button>
                  </Link>
                ) : (
                  <Button
                    component="button"
                    variant="contained"
                    style={{
                      backgroundColor: "#b0bec5",
                      color: "#fff",
                      fontWeight: "bold",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "16px",
                      marginRight: "25px",
                      cursor: "not-allowed",
                    }}
                    disabled
                  >
                    Interpret
                  </Button>
                )}
              </Stack>
            </Container>

            <Container>
              {chunkedItems.length > 0 &&
                chunkedItems.map((item, subJobIndex) =>
                  item.subJobs.map((subJobItem, itemIndex) => (
                    <Card
                      key={`${subJobIndex}-${itemIndex}`}
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
                              checked={subJobItem.checked}
                              isSelected={isSelected}
                              onChange={() =>
                                handleRowClick(
                                  subJobItem.subJobName,
                                  subJobIndex,
                                  itemIndex
                                )
                              }
                              inputProps={{ "aria-label": "controlled" }}
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
                                    marginRight: "310px",
                                  }}
                                >
                                  NOT SCANNED
                                  {/* <Tooltip
                                    title={
                                      <h6
                                        style={{
                                          fontSize: "14px",
                                        }}
                                      >
                                        "First scan this file to interpret the
                                        data"
                                      </h6>
                                    }
                                  >
                                    <IconButton
                                      className="icon-button"
                                      style={{
                                        marginTop: "-3px",
                                        color: "#f44336",
                                        position: "absolute",
                                        // left: "8.5%",
                                        marginRight: "970px", // Reduce space between text and icon
                                        padding: "0",
                                      }}
                                    >
                                      <InfoIcon />
                                    </IconButton>
                                  </Tooltip> */}
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
export default VisualProjects;
