import * as React from "react";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MoreIcon from "@mui/icons-material/MoreVert";
import MenuIcon from "@mui/icons-material/Menu";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import exavalulogo from "../../Components/Image/Exavalu_Logo.png";
import exavalulogowhite from "../../Components/Image/Exavalu_Logo_white.png";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
export default function NavbarPrivate(props) {
  const { uploadProjectChoice, toggleSidebar } = props;
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const secKey = process.env.REACT_APP_SECRET_KEY; //password

  const [encryptedUsername] = React.useState(
    localStorage.getItem("username") || ""
  );

  React.useEffect(() => {
    if (
      localStorage.getItem("username") === "" ||
      localStorage.getItem("username") === null
    ) {
      // console.clear();
      navigate("/login");
    } else {
      setUsername(
        CryptoJS.AES.decrypt(encryptedUsername, secKey).toString(
          CryptoJS.enc.Utf8
        )
      );
    }
  }, [encryptedUsername]);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  let handleClickLogOut = (event) => {
    if (event) {
      setAnchorEl(null);
      handleMobileMenuClose();
      Swal.fire({
        title: "DO YOU WANT TO LOG OUT ?",
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: `Cancel`,
        customClass: {
          popup: "custom-swal",
          container: "custom-swal-overlay",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.isDenied) {
          //nothing
        }
      });
    }
  };
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      sx={{ mt: "55px" }}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
      <MenuItem
        onClick={handleClickLogOut}
        disabled={props.uploadProjectChoice}
      >
        Log Out
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      sx={{ mt: "55px" }} //change
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
          disableRipple
          disableFocusRipple
          disableElevation
          style={{
            backgroundColor: "#565656",
          }}
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          // backgroundColor: "#c6c6c6",
          background: "linear-gradient(to top, #1e1e2f, #252539)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          zIndex: 7200,
          marginBottom: "5px",
          padding: "0 16px",
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              display: { xs: "none", sm: "block" },
              flexGrow: 1,
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            {props.uploadProjectChoice === true ? (
              <img
                // className="exavalulogo-big"
                alt="Exavalulogo-big"
                src={exavalulogowhite}
                style={{
                  marginLeft: "5px",
                  width: "200px",
                  height: "auto",
                  marginTop: "10px",
                }}
              />
            ) : (
              <Link to="/my-activity">
                <img
                  className="exavalulogo-big"
                  alt="Exavalulogo-big"
                  src={exavalulogowhite}
                  style={{
                    marginLeft: "5px",
                    width: "200px",
                    height: "auto",
                    marginTop: "10px",
                  }}
                />
              </Link>
            )}
          </Typography>

          {/* Username */}
          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: "white", marginRight: "12px" }}
            >
              {username}
            </Typography>

            {/* Profile Icon */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                color: "#ffffff",
                backgroundColor: "#3a3d41",
                "&:hover": {
                  backgroundColor: "#4e5054",
                },
                padding: "8px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                border: "1px solid white",
              }}
            >
              <AccountCircle sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{
                color: "#ffffff",
                backgroundColor: "#3a3d41",
                "&:hover": {
                  backgroundColor: "#4e5054",
                },
                padding: "8px",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <MoreIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
