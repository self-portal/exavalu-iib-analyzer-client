import React, { useState, useEffect } from "react";
// import "./Style.css";
import { Link } from "react-router-dom";
import Sidenav from "../../Components/Utilities/Sidenav";
import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import axios from "axios";
import ProgressAnimation from "../../Components/Animation/Animation";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

import "./MigrateProjectName.css";

let MigrateProjectName = () => {
  document.title = "Open Project";
  const [value, setValue] = React.useState(null);
  const [post, setPost] = React.useState(null);
  const [scanView, setScanView] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = useState([]);
  let user_name = "admin";
  const xRequestId = uuidv4();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  const [encryptedQueryName] = useState(
    localStorage.getItem("queryName") || ""
  );
  global.queryName = CryptoJS.AES.decrypt(encryptedQueryName, secKey).toString(
    CryptoJS.enc.Utf8
  );
  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_FILE +
    "?user_name=" +
    user_name;

  console.log("baseurl", baseURL);
  let load = null;

  // Fetch data using useEffect
  useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": xRequestId } })
      .then((response) => {
        setPost(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [load]);

  function chunkArray(Data) {
    if (Data !== null) {
      let items = [];
      Data.map((item) => {
        items.push(item.jobName);
      });
      return items.reverse();
    }
  }

  const options = chunkArray(post);

  if (value !== null) {
    localStorage.setItem("project_name", value);
  }
  let onSubmit = () => {
    setScanView(true);
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
      <NavbarPrivate />
      <Sidenav />
      <div className="openjob-container-fluid ">
        <div id="addsubjob-border-box" className="mt-5 ">
          <div>
            <div id="scan-select-job-header" className="text-center mb-2">
              <h2
                className="font-weight-bold"
                // style={{ fontFamily: "Unna", fontSize: "1.9rem" }}
              >
                PLEASE SELECT A JOB
              </h2>
            </div>
            <div id="scan-select-job" className="mb-1">
              <Autocomplete
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                }}
                options={options}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Job Name"
                    variant="outlined"
                    fullWidth
                  />
                )}
                disablePortal
              />
            </div>
            <div className="d-flex justify-content-center mb-1">
              {value !== null && value !== "" && (
                <div className="selected-job-card p-3 shadow-sm rounded">
                  <h5 className="font-italic text-muted mb-0">
                    Selected Job Name :{" "}
                    <span className="selected-job-name text-primary ml-6">
                      {value}
                    </span>
                  </h5>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-center" id="scan-job-submit">
              <Link to="/migrateprojectview">
                <button
                  disabled={!value}
                  variant="contained"
                  component="label"
                  // color="primary"
                  className="select-button"
                  onClick={onSubmit}
                >
                  SUBMIT
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default MigrateProjectName;
