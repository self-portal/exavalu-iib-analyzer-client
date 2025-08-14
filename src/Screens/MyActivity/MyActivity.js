import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import BasicAccordion from "../../Components/Utilities/Accordion";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import WorkIcon from "@mui/icons-material/Work";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import "./MyActivity.css";
import axios from "axios";
import { toast } from "react-toastify";
import ProgressAnimation from "../../Components/Animation/Animation";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import "../../Components/Global/GlobalVariable";
import { Col, Container, Row } from "react-bootstrap";

let MyActivity = () => {
  document.title = "My Activity";
  const [data, setData] = React.useState(null);
  /* eslint-disable */
  const [username, setUsername] = React.useState("");
  const navigate = useNavigate();
  const xRequestId = uuidv4();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  const [encryptedQueryName] = useState(
    localStorage.getItem("queryName") || ""
  );
  global.queryName = CryptoJS.AES.decrypt(encryptedQueryName, secKey).toString(
    CryptoJS.enc.Utf8
  );
  const my_activity_url =
    process.env.REACT_APP_BASE_PATH +
    process.env.REACT_APP_MY_ACTIVITY +
    "?user_name=" +
    global.queryName;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    axios
      .get(my_activity_url, {
        headers: {
          "X-Request-ID": xRequestId,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        if (err.code === "ERR_NETWORK") {
          toast.error("Check Backend !!", {
            toastId: "error 22",
          });
        } else {
          toast.error("Failed due to: ", err.message, {
            toastId: "error 4",
          });
        }
      });
  }, []);

  // to ensure we don't pass null thats defined in hook. Below comment jst for animation
  // if (!data) return null;

  return data === null ? (
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
      <div className="container-fluid my-activity-body-color">
        {/* <NavbarPrivate toggleSidebar={toggleSidebar} /> */}
        <NavbarPrivate />
        <Box height={100} />
        <Box sx={{ display: "flex" }}>
          {sidebarOpen && <Sidenav />}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              px: 2,
            }}
          >
            <Grid container spacing={2} sx={{ maxWidth: "1500px" }}>
              <Container>
                <Row>
                  <Col xs={12} md={6} lg={3}>
                    <Card className="my-activity-card">
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 5 }}
                        >
                          <WorkIcon
                            sx={{
                              fontSize: 30,
                              mr: 2,
                              color: "black",
                            }}
                          />
                          <Typography
                            variant="h7"
                            sx={{
                              margin: "0 10px",
                              fontWeight: "bold",
                              textAlign: "center",
                              display: "block",
                            }}
                          >
                            Number of Job
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          mt={3}
                          sx={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {data.totalJobsCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Card className="my-activity-card">
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 5 }}
                        >
                          <AccountTreeIcon
                            sx={{ fontSize: 30, mr: 2, color: "black" }}
                          />
                          <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                            Number of Sub Job
                          </Typography>
                        </Box>
                        <Typography
                          variant="h4"
                          mt={3}
                          sx={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {data.totalSubJobsCount}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Card className="my-activity-card">
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 4 }}
                        >
                          <AccessTimeIcon
                            sx={{ fontSize: 30, mr: 2, color: "black" }}
                          />
                          <Typography
                            variant="h7"
                            sx={{ fontWeight: "bold", margin: "0 10px" }}
                          >
                            Last Active On
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          mt={3}
                          sx={{
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {data.loginHistory.lastLoginTimestamp}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Card className="my-activity-card">
                      <CardContent>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 4 }}
                        >
                          <WorkHistoryIcon
                            sx={{
                              fontSize: 30,
                              mr: 2,
                              color: "black",
                              // textShadow: "black",
                            }}
                          />{" "}
                          {/* Add your icon here */}
                          <Typography
                            variant="h7"
                            sx={{
                              fontWeight: "bold",
                              color: "black",
                              margin: "0 10px",
                            }}
                          >
                            Recent Jobs
                          </Typography>
                        </Box>
                        <div className="my-activity-recent-jobs-container">
                          {data.jobDetails
                            .slice()
                            .reverse()
                            .map((item, index) => (
                              <BasicAccordion key={index} jobName={item} />
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </Grid>
          </Box>
        </Box>
      </div>
    </>
  );
};

export default MyActivity;
