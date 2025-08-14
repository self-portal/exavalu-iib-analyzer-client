import "../../index.css";
import "./NewProjectScan.css";
import Datas from "./SampleDatasScan.js";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Stack,
} from "@mui/material";
import { useState } from "react";
import Swal from "sweetalert2";

let NewProjectScan = () => {
  document.title = "New Project";
  var job_name = sessionStorage.getItem("Job Name");
  const [isVisibleAll, setIsVisibleAll] = useState(false); //for visible and invisible all
  const [isVisibleIndividual, setIsVisibleIndividual] = useState(false); //for visible and invisible individual
  const [disabled, setDisabled] = useState(false); //for button enabling and disabling button

  let timerInterval;

  let progressAll = (event) => {
    if (event) {
      Swal.fire({
        // html: "<b></b> milliseconds.",
        title: "Scanning in progress...",
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer().querySelector("b");
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
          }, 23);
        },
        willClose: () => {
          clearInterval(timerInterval);
          setIsVisibleAll((isVisibleAll) => !isVisibleAll); //making it toggle after pop up ends
          setDisabled(true);
        },
      });
    }
  };

  let progressIndividual = (event) => {
    if (event) {
      Swal.fire({
        // html: "<b></b> milliseconds.",
        title: "Scanning in progress...",
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer().querySelector("b");
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
          }, 23);
        },
        willClose: () => {
          clearInterval(timerInterval);
          setIsVisibleIndividual((isVisibleIndividual) => !isVisibleIndividual); //making it toggle after pop up ends
          setDisabled(true);
        },
      });
    }
  };
  function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  const chunkedItems = chunkArray(Datas, 5);

  let errValues = [
    "Error11: reached end of file while parsing",
    "Error20: stack error",
    "Error7: FileNotFound Exception",
    "Error268: uexpected behavior",
  ]; //hardcoded error values to be picked up randomly

  return (
    <>
      <NavbarPrivate />
      <Sidenav />
      <div className="project-scan-container">
        <div className="overlay-select-list-scan">
          <h1 className="project-name-scan">{job_name}</h1>
          <Box sx={{ minWidth: 275, paddingTop: "20px" }}>
            {chunkedItems.map((chunk, index) => (
              <Card variant="outlined" className="table-box">
                <CardContent>
                  <Typography sx={{ fontSize: 20 }} gutterBottom>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          style={{ borderBottom: "none", padding: "2px" }}
                        >
                          <h4>SubJob {index + 1}</h4>
                        </TableCell>
                        <TableCell
                          style={{ borderBottom: "none", paddingLeft: "700px" }}
                        >
                          <h4>Status</h4>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Typography>
                  {chunk.map((item, itemIndex) => (
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                      key={itemIndex}
                    >
                      <TableBody>
                        <TableRow key={item.project_name}>
                          <div>
                            <TableCell
                              style={{ borderBottom: "none", padding: "2px" }}
                            >
                              {item.project_name}
                            </TableCell>
                          </div>
                          <div className="project-scan-icon-position">
                            {isVisibleAll && (
                              <TableRow
                                style={{
                                  position: "absolute",
                                  borderBottom: "none",
                                  marginLeft: "625px",
                                  left: "170px",
                                  top: "-22px",
                                }}
                              >
                                {itemIndex %
                                  Math.floor(
                                    Math.random() * (1 - 5 + 1) + 1
                                  ) ===
                                0 ? (
                                  <i
                                    class="fa fa-exclamation-circle right-icon"
                                    style={{ color: "red" }}
                                    title={
                                      errValues[
                                        Math.floor(
                                          Math.random() * errValues.length
                                        )
                                      ]
                                    }
                                  />
                                ) : (
                                  <i
                                    class="fa fa-check right-icon"
                                    style={{ color: "green" }}
                                    title="Success"
                                  />
                                )}
                              </TableRow>
                            )}
                          </div>
                        </TableRow>
                      </TableBody>
                    </Typography>
                  ))}
                  {/* Button for scan and rescan at card level */}
                  <Stack
                    spacing={2}
                    direction="row"
                    style={{ paddingBottom: "20px", paddingTop: "20px" }}
                  >
                    <Button
                      variant="contained"
                      // onClick={progressIndividual}
                      disabled={disabled}
                    >
                      Scan
                    </Button>
                    <Button variant="contained" disabled={!disabled}>
                      ReScan
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Stack
            spacing={2}
            direction="row"
            style={{ paddingBottom: "20px", paddingTop: "20px" }}
          >
            <Button
              variant="contained"
              onClick={progressAll}
              disabled={disabled}
              className="Scan-all-button-new-job"
            >
              Scan All
            </Button>
          </Stack>
        </div>
      </div>
    </>
  );
};
sessionStorage.removeItem("Job Name");
export default NewProjectScan;
