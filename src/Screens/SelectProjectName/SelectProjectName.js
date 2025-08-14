import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./Style.css";
import Sidenav from "../../Components/Utilities/Sidenav";
import { Button } from "@mui/material";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import ProgressAnimation from "../../Components/Animation/Animation";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import { v4 as uuidv4 } from "uuid";
import "../../Components/Global/GlobalVariable";
import CryptoJS from "crypto-js";

let SelectProjectName = () => {
  document.title = "Open Project";
  //For the choice function
  const [value, setValue] = useState(null);
  const [post, setPost] = useState(null);
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

  const navigate = useNavigate();
  let location = useLocation();

  const baseURL =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_RETRIEVE_JOB +
    "?user_name=" +
    user_name;

  // dynamic redirect
  const navigateToUpload = () => {
    if (value) {
      if (location.state) {
        {
          navigate("/UploadProjects", {
            state: { jobName: value, pageName: "open job" },
          });
        }
      }
    }
  };

  useEffect(() => {
    axios
      .get(baseURL, { headers: { "x-request-id": uuidv4() } })
      .then((response) => {
        setPost(response.data);
      });
  }, [baseURL]);

  function chunkArray(data) {
    if (data !== null) {
      let items = [];
      !!data.length && data.map((item) => items.push(item.jobName));
      return items.reverse();
    }
  }
  useEffect(() => {
    setData(chunkArray(post));
  }, [post]);

  // if (!post) return null;
  const options = chunkArray(post);
  return post !== null ? (
    <>
      <NavbarPrivate />
      <Sidenav />
      <div className="openjob-container-fluid">
        <div id="addsubjob-border-box" className="mt-5">
          <div>
            <div id="scan-select-job-header" className="text-center mb-2">
              <h2
                className="font-weight-bold"
                // style={{ fontFamily: "Domine", fontSize: "1.8rem" }}
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
                //sx={{ width: 300 }}
                renderInput={(params) => (
                  <TextField {...params} label="Job Name" />
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
              <button
                disabled={!value}
                variant="contained"
                onClick={navigateToUpload}
                className="select-button"
                component="label"
              >
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
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
  );
};

export default SelectProjectName;
