import React, { useEffect } from "react";
import "./Style.css";
import { Link, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import NavbarPublic from "../../Components/Utilities/NavbarPublic";
import {
  Button,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Grid,
  InputAdornment,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ProgressAnimation from "../../Components/Animation/Animation";
import { v4 as uuidv4 } from "uuid";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PasswordStrengthBar from "react-password-strength-bar";
import "../../Components/Global/GlobalVariable";

let Register = () => {
  // clear all data first then take up new datas
  React.useEffect(() => {
    localStorage.removeItem("username");
    localStorage.removeItem("UserRole");
    localStorage.removeItem("queryName");
    localStorage.removeItem("project_name");
  });

  document.title = "Registration";

  const url =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_LOGIN_PATH;
  const navigate = useNavigate();

  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [emailId, setEmail] = React.useState("");
  const [mobileNo, setMobile] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [ip, setIp] = React.useState(null);
  const [loading, setLoading] = React.useState(null);
  const xRequestId = uuidv4();
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  const [errorText, setErrorText] = React.useState(false);

  global.queryName = "";

  /* eslint-disable */
  const email_pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  /* eslint-disable */
  const password_pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  /* eslint-disable */
  const alphabets_pattern = /^[A-Za-z]+$/;
  /* eslint-disable */
  const alphaNumeric_pattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
  /* eslint-disable */
  const special_pattern =
    /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;
  /* eslint-disable */
  const numeric_pattern = /^[0-9]+$/;
  /* eslint-disable */
  const alphabetsWithSpace_pattern = /^[a-zA-Z ]*$/;

  // Generates fake Ip if privacy is concern. Hence I provided an alternative
  const fakeIp =
    Math.floor(Math.random() * 255) +
    1 +
    "." +
    Math.floor(Math.random() * 255) +
    "." +
    Math.floor(Math.random() * 255) +
    "." +
    Math.floor(Math.random() * 255);

    const url_IP = process.env.REACT_APP_IP_ADDRESS;
  // Throws real ip
  useEffect(() => {
    fetch(url_IP)
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        setLoading(res.ip);
        setIp(res.ip);
      })
      .catch((err) => console.error("Problem fetching my IP", err.message));
  }, [ip]);

  // if (!ip && loading) return null;

  const validation = () => {
    let result = true;

    if (firstName === "" || firstName === null) {
      setErrorText(true);
      result = false;
    } else if (!alphabets_pattern.test(firstName)) {
      setErrorText(false);
      result = false;
    }

    if (middleName === "" || middleName === null) {
      result = true;
    }

    if (lastName === "" || lastName === null) {
      setErrorText(true);
      result = false;
    } else if (!alphabets_pattern.test(lastName)) {
      setErrorText(false);
      result = false;
    }

    if (company === "" || company === null) {
      setErrorText(true);
      result = false;
    }

    if (region === "" || region === null) {
      setErrorText(true);
      result = false;
    }

    if (emailId === "" || emailId === null) {
      setErrorText(true);
      result = false;
    } else if (!email_pattern.test(emailId)) {
      setErrorText(true);
      result = false;
    }

    if (mobileNo === "" || mobileNo === null) {
      setErrorText(true);
      result = false;
    } else if (mobileNo.length < 10 || mobileNo.length > 10) {
      setErrorText(true);
      result = false;
    } else if (alphaNumeric_pattern.test(mobileNo)) {
      setErrorText(true);
      result = false;
    } else if (alphabets_pattern.test(mobileNo)) {
      setErrorText(true);
      result = false;
    }

    if (userName === "" || userName === null) {
      setErrorText(true);
      result = false;
    } else if (special_pattern.test(userName)) {
      setErrorText(true);
      result = false;
    } else if (numeric_pattern.test(userName)) {
      setErrorText(true);
      result = false;
    }

    if (password === "" || password === null) {
      setErrorText(true);
      result = false;
    } else if (!password_pattern.test(password)) {
      setErrorText(true);
      result = false;
    }

    if (jobTitle === "" || jobTitle === null) {
      setErrorText(true);
      result = false;
    }
    return result;
  };

  const ProceedRegister = (e) => {
    e.preventDefault();
    if (validation()) {
      let regobj = {
        firstName,
        middleName,
        lastName,
        company,
        region,
        emailId,
        mobileNo,
        userName,
        password,
        jobTitle,
      }; //store the input values
      axios
        .post(`${url}`, regobj, {
          headers: {
            "X-Request-ID": xRequestId,
            "X-Tracking-ID": fakeIp,
            "X-Consumer": navigator.userAgent,
            "X-Region": "",
          },
        })
        .then((res) => {
          toast.success(res.data.message, {
            toastId: "success 1",
          });
          navigate("/LogIn");
        })
        .catch((error) => {
          toast.error(error.response.data.message, {
            toastId: "error 1",
          });
        });
    }
  };

  return !ip || loading === null ? (
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
      <NavbarPublic />
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <FormControl
          InputProps={{
            autoComplete: "new-password",
          }}
          onSubmit={ProceedRegister}
          sx={{
            height: "560px",
            width: "765px",
            paddingLeft: "30px",
            paddingRight: "30px",
            paddingBottom: "30px",
            border: "black 3px solid",
            borderRadius: "18px",
            top: "70px",
            marginTop: "50px"
          }}
        >
          <h1
            style={{
              fontSize: "30px",
              textAlign: "center",
              marginTop: "20px",
              marginBottom: "40px",
              fontWeight: "600",
            }}
          >
            Sign Up
          </h1>

          <Grid
            item
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingBottom: "20px",
            }}
          >
            {/* First Name */}
            <TextField
              type="name"
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ width: "35%" }}
            />

            {errorText && firstName.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                First Name cannot be empty
              </label>
            ) : errorText && !alphabets_pattern.test(firstName) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                First Name should be alphabets
              </label>
            ) : (
              ""
            )}
            {/* Middle Name */}
            <TextField
              type="name"
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              InputProps={{
                autoComplete: "new-password",
              }}
              variant="outlined"
              sx={{ marginLeft: "10px", width: "35%" }}
            />
            {!alphabetsWithSpace_pattern.test(middleName) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "31%",
                }}
              >
                Middle Name should be alphabets
              </label>
            ) : (
              ""
            )}
            {/* Last Name */}
            <TextField
              type="name"
              required
              label="Last Name"
              value={lastName}
              variant="outlined"
              onChange={(e) => setLastName(e.target.value)}
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ marginLeft: "10px", width: "35%" }}
            />
            {errorText && lastName.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "63%",
                }}
              >
                Last Name cannot be empty
              </label>
            ) : errorText && !alphabets_pattern.test(lastName) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "63%",
                }}
              >
                Last Name should be alphabets
              </label>
            ) : (
              ""
            )}
          </Grid>

          <Grid
            item
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingBottom: "20px",
            }}
          >
            {/* Company */}
            <TextField
              type="name"
              label="Company"
              variant="outlined"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ width: "49%" }}
            />
            {/* Region */}
            <FormControl
              sx={{
                marginLeft: "15px",
                width: "49%",
              }}
            >
              <InputLabel required id="region-select">
                Region
              </InputLabel>
              <Select
                labelId="region-select"
                label="Region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <MenuItem value={"North America"}>North America</MenuItem>
                <MenuItem value={"South America"}>South America</MenuItem>
                <MenuItem value={"Europe"}>Europe</MenuItem>
                <MenuItem value={"Middle East"}>Middle East</MenuItem>
                <MenuItem value={"Africa"}>Africa</MenuItem>
                <MenuItem value={"Asia Pacific"}>Asia Pacific</MenuItem>
                <MenuItem value={"Australia and New Zealand"}>
                  Australia and New Zealand
                </MenuItem>
              </Select>
            </FormControl>
            {errorText && region.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "47%",
                }}
              >
                Region cannot be empty
              </label>
            ) : (
              ""
            )}
          </Grid>

          <Grid
            item
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingBottom: "20px",
            }}
          >
            {/* Email */}
            <TextField
              type="email"
              label="Email"
              required
              value={emailId}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ width: "49%" }}
            />
            {errorText && emailId.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                emailId cannot be empty
              </label>
            ) : errorText && !email_pattern.test(emailId) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                emailId address is invalid
              </label>
            ) : (
              ""
            )}
            {/* Mobile */}
            <TextField
              type="tel"
              label="Mobile Number"
              required
              value={mobileNo}
              onChange={(e) => setMobile(e.target.value)}
              variant="outlined"
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ marginLeft: "15px", width: "49%" }}
            />
            {errorText && mobileNo.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "47%",
                }}
              >
                Mobile Number cannot be empty
              </label>
            ) : errorText && alphaNumeric_pattern.test(mobileNo) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "47%",
                }}
              >
                Mobile Number should be numeric
              </label>
            ) : errorText && alphabets_pattern.test(mobileNo) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "47%",
                }}
              >
                Mobile Number should be numeric
              </label>
            ) : errorText && (mobileNo.length < 10 || mobileNo.length > 10) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                  marginLeft: "47%",
                }}
              >
                Please enter 10 digit mobile number
              </label>
            ) : (
              ""
            )}
          </Grid>

          <Grid
            item
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingBottom: "30px",
            }}
          >
            {/* User Name */}
            <TextField
              type="name"
              label="User Name"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              variant="outlined"
              InputProps={{
                autoComplete: "new-password",
              }}
              sx={{ width: "49%" }}
            />
            {errorText && userName.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                User Name cannot be empty
              </label>
            ) : errorText && numeric_pattern.test(userName) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                User Name cannot have only digits
              </label>
            ) : (
              ""
            )}
            {/* password */}
            <TextField
              type={showPassword ? "text" : "password"}
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                autoComplete: "new-password",
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ marginLeft: "15px", width: "49%" }}
            />
            {errorText && password.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "65px",
                  marginLeft: "47%",
                }}
              >
                Password cannot be empty
              </label>
            ) : errorText && !password_pattern.test(password) ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "65px",
                  marginLeft: "47%",
                  width: "37%",
                }}
              >
                Minimum eight characters, at least one uppercase letter,
                lowercase letter,number and special character
              </label>
            ) : (
              ""
            )}
          </Grid>
          <PasswordStrengthBar
            password={password}
            style={{
              width: "49%",
              marginTop: "-30px",
              left: "51%",
              marginBottom: "6px",
            }}
          />
          <Grid
            item
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingBottom: "20px",
            }}
          >
            <FormControl
              sx={{
                width: "100%",
              }}
            >
              {/* Job title */}
              <InputLabel required id="designation-select">
                Designation
              </InputLabel>
              <Select
                labelId="designation-select"
                label="Designation"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              >
                <MenuItem value={"Developer"}>Developer</MenuItem>
                <MenuItem value={"Senior Developer"}>Senior Developer</MenuItem>
                <MenuItem value={"Technical Lead"}>Technical Lead</MenuItem>
                <MenuItem value={"Associate Architect"}>
                  Associate Architect
                </MenuItem>
                <MenuItem value={"Technical Architect"}>
                  Technical Architect
                </MenuItem>
                <MenuItem value={"Associate Director"}>
                  Associate Director
                </MenuItem>
                <MenuItem value={"Director"}>Director</MenuItem>
                <MenuItem value={"Head of Global Delivery"}>
                  Head of Global Delivery
                </MenuItem>
              </Select>
            </FormControl>
            {errorText && jobTitle.length <= 0 ? (
              <label
                style={{
                  color: "red",
                  fontSize: "10px",
                  position: "absolute",
                  marginTop: "55px",
                }}
              >
                Designation cannot be empty
              </label>
            ) : (
              ""
            )}
          </Grid>
          <Button
            variant="contained"
            style={{
              marginTop: "8px",
              height: "40px",
              left: "30%",
              borderRadius: "25px",
              width: "40%",
              backgroundColor: "#cf2e2e",
            }}
            type="submit"
            onClick={ProceedRegister}
          >
            Register
          </Button>
        </FormControl>
      </Grid>
      <Grid
        alignItems="center"
        justifyContent="center"
        sx={{ display: "flex", flexDirection: "column", marginTop: "8%" }}
      >
      </Grid>
      <p className="alreadyAccount">
          Already have an account?
          <Link to="/LogIn" style={{ textDecoration: "None" }}>
            {" "}
            Login here.
          </Link>
        </p>
    </>
  );
};

export default Register;
