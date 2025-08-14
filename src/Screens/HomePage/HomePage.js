//import "../../index.css"; //parent CSS
import "./HomePage.css"; //child CSS
import React from "react";
import NavbarPublic from "../../Components/Utilities/NavbarPublic";
import { Link } from "react-router-dom";
import { Box, Button } from "@mui/material";
import "../../Components/Global/GlobalVariable";

let HomePage = () => {
  // clear all data first then take up new datas
  React.useEffect(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("queryName");
    localStorage.removeItem("UserRole");
    localStorage.removeItem("project_name");
  });

  document.title = "HomePage";
  global.queryName = "";

  return (
    <>
      <NavbarPublic />
      <div className="container-fluid">
        <div>
          <div id="homepage-heading">
            <h1 class="text-center">Exavalu IIB Analyzer</h1>
          </div>
          <div id="homepage-subheading">
            <h4 class="text-center">Explore the Power of Complexity Analysis!</h4>
          </div>
          <div className="d-flex justify-content-center" id="login-button-position">
            <Box>
              <Link to="/LogIn">
                <Button variant="contained">Log In →</Button>
              </Link>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
