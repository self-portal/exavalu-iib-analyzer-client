import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import FlipIcon from "@mui/icons-material/Flip";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import NumbersIcon from "@mui/icons-material/Numbers";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const drawerWidth = 245;

export default function Sidenav(props) {
  const { uploadProjectChoice } = props;
  const [roleId, setRoleId] = React.useState(0);
  const [openedItemId, setOpenedItemId] = React.useState(true);
  const [choice, setChoice] = React.useState(false);
  const navigate = useNavigate();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  React.useState(() =>
    setChoice(props.uploadProjectChoice === false ? false : true)
  );

  const encryptedRole =
    localStorage.getItem("UserRole") === "" ||
    localStorage.getItem("UserRole") === null
      ? ""
      : localStorage.getItem("UserRole");

  React.useEffect(() => {
    setRoleId(
      CryptoJS.AES.decrypt(encryptedRole, secKey).toString(CryptoJS.enc.Utf8)
    );
  }, [encryptedRole, navigate]);

  // for collapsible
  const handleClick = (orgEvent) => {
    let clickedItemId = orgEvent.currentTarget.id;
    if (openedItemId === clickedItemId) {
      setOpenedItemId("");
    } else {
      setOpenedItemId(clickedItemId);
    }
  };

  const handleRedirect = () => {
    window.location.href = "http://localhost:3001";
  };

  return (
    <Box sx={{ display: "flex", marginBottom: "25px" }}>
      <CssBaseline />

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          overflow: "auto", // Enable scrollbar when content exceeds height
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(to bottom, #1e1e2f, #252539)",
            color: "#ffffff",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
            // Custom scrollbar styles
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#4f4f70",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#6f6f8c",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#1e1e2f",
            },
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <List
          component="nav"
          sx={{
            padding: 2,
            paddingLeft: 0.5,
            paddingRight: 0.5,
            paddingBottom: 2,
          }}
        >
          {/* Home */}
          <ListItemButton
            disabled={props.uploadProjectChoice}
            sx={{
              marginBottom: 1,
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#34344e",
              },
              ...(window.location.pathname === "/my-activity" && {
                backgroundColor: "#4f4f70",
              }),
            }}
            onClick={() => navigate("/my-activity")}
          >
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>

          {/* Job Management */}
          <ListItemButton
            disabled={props.uploadProjectChoice}
            id="item-jobManagement"
            onClick={handleClick}
            sx={{
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#34344e" },
            }}
          >
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <RuleFolderIcon />
            </ListItemIcon>
            <ListItemText primary="Job Management" />
            {openedItemId === "item-jobManagement" ? (
              <ExpandLess sx={{ color: "#ffffff" }} />
            ) : (
              <ExpandMore sx={{ color: "#ffffff" }} />
            )}
          </ListItemButton>

          <Collapse
            in={
              openedItemId === "item-jobManagement" ||
              window.location.pathname.includes("/newjob") ||
              window.location.pathname.includes("/selectprojectname") ||
              window.location.pathname === "/newjobprojects" ||
              window.location.pathname === "/UploadProjects" ||
              window.location.pathname === "/addnewsubjob" ||
              window.location.pathname === "/addsubjob"
            }
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              <ListItemButton
                disabled={props.uploadProjectChoice}
                sx={{
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/newjob" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/newjobprojects" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/addnewsubjob" && {
                    backgroundColor: "#4f4f70",
                  }),
                }}
                onClick={() => navigate("/newjob")}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <CreateNewFolderIcon />
                </ListItemIcon>
                <ListItemText primary="New Job" />
              </ListItemButton>

              <ListItemButton
                disabled={props.uploadProjectChoice}
                sx={{
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/selectprojectname" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/UploadProjects" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/addsubjob" && {
                    backgroundColor: "#4f4f70",
                  }),
                }}
                id="OpenJob"
                onClick={(orgEvent) => {
                  // sessionStorage.setItem("Menu", "OpenJob");
                  navigate("/selectprojectname", {
                    state: { Menu: orgEvent.currentTarget.id },
                  });
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <FolderOpenIcon />
                </ListItemIcon>
                <ListItemText primary="Open Job" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Scan Source */}
          <ListItemButton
            disabled={props.uploadProjectChoice}
            id="item-scan"
            onClick={handleClick}
            sx={{
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#34344e" },
            }}
          >
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <FlipIcon />
            </ListItemIcon>
            <ListItemText primary="Scan Source" />
            {openedItemId === "item-scan" ? (
              <ExpandLess sx={{ color: "#ffffff" }} />
            ) : (
              <ExpandMore sx={{ color: "#ffffff" }} />
            )}
          </ListItemButton>

          <Collapse
            in={
              openedItemId === "item-scan" ||
              window.location.pathname.includes("/scanjob") ||
              window.location.pathname.includes("/scanprojectview")
            }
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              <ListItemButton
                sx={{
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/scanjob" && {
                    backgroundColor: "#4f4f70",
                  }),
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/scanprojectview" && {
                    backgroundColor: "#0606064f",
                  }),
                }}
                onClick={() => navigate("/scanjob")}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText primary="Open Job" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Interpret Jobs */}
          <ListItemButton
            disabled={props.uploadProjectChoice}
            id="item-interpret"
            onClick={handleClick}
            sx={{
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#34344e" },
            }}
          >
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Interpret Jobs" />
            {openedItemId === "item-interpret" ? (
              <ExpandLess sx={{ color: "#ffffff" }} />
            ) : (
              <ExpandMore sx={{ color: "#ffffff" }} />
            )}
          </ListItemButton>

          <Collapse
            in={
              openedItemId === "item-interpret" ||
              window.location.pathname.includes("/visualprojectname") ||
              window.location.pathname.includes("/visualprojects") ||
              window.location.pathname === "/dependencynetwork" ||
              window.location.pathname === "/visualization" ||
              window.location.pathname === "/flowchart" ||
              window.location.pathname === "/datatable"
            }
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              <ListItemButton
                sx={{
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/visualprojectname" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/visualprojects" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/dependencynetwork" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/visualization" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/flowchart" && {
                    backgroundColor: "#4f4f70",
                  }),
                  ...(window.location.pathname === "/datatable" && {
                    backgroundColor: "#4f4f70",
                  }),
                }}
                onClick={() => navigate("/visualprojectname")}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <WorkHistoryIcon />
                </ListItemIcon>
                <ListItemText primary="Open Job" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Migrate Jobs */}
          <ListItemButton
            disabled={props.uploadProjectChoice}
            id="item-migrate"
            onClick={handleClick}
            sx={{
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#34344e" },
            }}
          >
            <ListItemIcon sx={{ color: "#ffffff" }}>
              <ArrowCircleDownIcon />
            </ListItemIcon>
            <ListItemText primary="Migrate Job" />
            {openedItemId === "item-migrate" ? (
              <ExpandLess sx={{ color: "#ffffff" }} />
            ) : (
              <ExpandMore sx={{ color: "#ffffff" }} />
            )}
          </ListItemButton>

          <Collapse
            in={
              openedItemId === "item-migrate" ||
              window.location.pathname.includes("/migrateproject") ||
              window.location.pathname.includes("/migrateprojectname")
            }
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              <ListItemButton
                sx={{
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/migrateproject" && {
                    backgroundColor: "#4f4f70",
                  }),
                  pl: 4,
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "#34344e",
                  },
                  ...(window.location.pathname === "/migrateprojectview" && {
                    backgroundColor: "#0606064f",
                  }),
                }}
                onClick={() => navigate("/migrateproject")}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText primary="Open Job" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Admin (if roleId === "1") */}
          {roleId === "1" && (
            <>
              <ListItemButton
                disabled={props.uploadProjectChoice}
                id="item-admin"
                onClick={handleClick}
                sx={{
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#34344e" },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {openedItemId === "item-admin" ? (
                  <ExpandLess sx={{ color: "#ffffff" }} />
                ) : (
                  <ExpandMore sx={{ color: "#ffffff" }} />
                )}
              </ListItemButton>

              <Collapse
                in={
                  openedItemId === "item-admin" ||
                  window.location.pathname.includes(
                    "/adminparametermangement"
                  ) ||
                  window.location.pathname === "/selectprojectnameadmin" ||
                  window.location.pathname === "/parametermangementspecific" ||
                  window.location.pathname.includes("/adminrolemangement")
                }
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  <ListItemButton
                    disabled={props.uploadProjectChoice}
                    sx={{
                      pl: 4,
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "#34344e",
                      },
                      ...(window.location.pathname ===
                        "/adminparametermangement" && {
                        backgroundColor: "#4f4f70",
                      }),
                    }}
                    id="ParameterManagement"
                    onClick={(orgEvent) => {
                      // sessionStorage.setItem("Menu", "AdminParameterManagement");
                      navigate("/adminparametermangement", {
                        state: { Menu: orgEvent.currentTarget.id },
                      });
                    }}
                  >
                    <ListItemIcon sx={{ color: "#ffffff" }}>
                      <NumbersIcon />
                    </ListItemIcon>
                    <ListItemText primary="Default Parameter Management" />
                  </ListItemButton>

                  <ListItemButton
                    disabled={props.uploadProjectChoice}
                    sx={{
                      pl: 4,
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "#34344e",
                      },
                      ...(window.location.pathname ===
                        "/selectprojectnameadmin" && {
                        backgroundColor: "#4f4f70",
                      }),
                      ...(window.location.pathname ===
                        "/parametermangementspecific" && {
                        backgroundColor: "#4f4f70",
                      }),
                    }}
                    id="jobParameterManagement"
                    onClick={(orgEvent) => {
                      // sessionStorage.setItem("Menu", "AdminParameterManagement");
                      navigate("/selectprojectnameadmin", {
                        state: { Menu: orgEvent.currentTarget.id },
                      });
                    }}
                  >
                    <ListItemIcon sx={{ color: "#ffffff" }}>
                      <NumbersIcon />
                    </ListItemIcon>
                    <ListItemText primary="Job specific parameter management" />
                  </ListItemButton>

                  <ListItemButton
                    disabled={props.uploadProjectChoice}
                    sx={{
                      pl: 4,
                      pb: 4,
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "#34344e",
                      },
                      ...(window.location.pathname ===
                        "/adminrolemangement" && {
                        backgroundColor: "#4f4f70",
                      }),
                    }}
                    onClick={() => {
                      navigate("/adminrolemangement");
                    }}
                  >
                    <ListItemIcon sx={{ color: "#ffffff" }}>
                      <SupervisedUserCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Role Management" />
                  </ListItemButton>
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
    </Box>
  );
}
