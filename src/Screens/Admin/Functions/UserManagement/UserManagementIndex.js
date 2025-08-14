import {
  Paper,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableContainer,
  Button,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  TablePagination,
  Alert,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CreateUser,
  GetAllUsers,
  GetUserByCode,
  RemoveUser,
  UpdateUser,
} from "./Redux/ActionCreater";
import { connect, useDispatch, useSelector } from "react-redux";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { OpenPopup } from "./Redux/Action";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ProgressAnimation from "../../../../Components/Animation/Animation";
import "./style.css"
const mapStatetoProps = (state) => {
  return {
    userstate: state.user,
  };
};

const mapDispatchtoProps = (dispatch) => {
  return {
    loaduser: () => dispatch(GetAllUsers()),
  };
};

const columns = [
  // { id: "id", name: "Id" },
  { id: "firstName", name: "First Name" },
  // { id: "middleName", name: "Middle Name" },
  { id: "lastName", name: "Last Name" },
  // { id: "company", name: "Company" },
  // { id: "region", name: "Region" },
  { id: "emailId", name: "Email" },
  // { id: "mobileNo", name: "Mobile" },
  { id: "userName", name: "User Name" },
  // { id: "jobTitle", name: "Job Title" },
  { id: "activeStatus", name: "Active Status" },
  { id: "roleId", name: "Role" },
  { id: "action", name: "Action" },
];

let UserManagementIndex = (props) => {
  document.title = "Admin User Management";
  const [id, setId] = useState(1);
  const [firstName, setFirstName] = React.useState("");
  const [middleName, setMiddleName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [emailId, setEmail] = React.useState("");
  const [mobileNo, setMobile] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  let [activeStatus, setActiveStatus] = React.useState("");
  const [roleId, setRole] = useState("2");
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [isedit, setIsEdit] = React.useState(false);
  const [title, setTitle] = React.useState("Create User");
  const editobj = useSelector((state) => state.user.userobj);

  useEffect(() => {
    if (Object.keys(editobj).length > 0) {
      setId(editobj.id);
      setFirstName(editobj.firstName);
      setMiddleName(editobj.middleName);
      setLastName(editobj.lastName);
      setCompany(editobj.company);
      setRegion(editobj.region);
      setEmail(editobj.emailId);
      setMobile(editobj.mobileNo);
      setUserName(editobj.userName);
      setJobTitle(editobj.jobTitle);
      setActiveStatus(editobj.activeStatus);
      setRole(editobj.roleId);
    } else {
      clearState();
    }
  }, [editobj]);

  const dispatch = useDispatch();

  const clearState = () => {
    setId(0);
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setCompany("");
    setRegion("");
    setEmail("");
    setMobile("");
    setUserName("");
    setJobTitle("");
    setActiveStatus("false");
    setRole("2");
  };

  let functionAdd = () => {
    setIsEdit(false);
    setTitle("Create User");
    openPopup();
  };

  let closePopup = () => {
    setOpen(false);
  };

  let openPopup = () => {
    setOpen(true);
    clearState();
    dispatch(OpenPopup());
  };

  let handleSubmit = (event) => {
    event.preventDefault();
    const activeStatus_temp = activeStatus === "true" ? "1" : "0";
    activeStatus = activeStatus_temp;
    const _obj = {
      // id,
      firstName,
      // middleName,
      lastName,
      // company,
      // region,
      emailId,
      // mobileNo,
      userName,
      // jobTitle,
      activeStatus,
      roleId,
    };
    if (isedit) {
      dispatch(UpdateUser(_obj));
    } else {
      dispatch(CreateUser(_obj));
    }
    closePopup();
    dispatch(GetAllUsers());
  };

  useEffect(() => {
    props.loaduser();
    // eslint-disable-next-line
  }, []);

  let handlePageChange = (event, newpage) => {
    setPage(newpage);
  };

  let handleRowPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  let handleEdit = (code) => {
    setIsEdit(true);
    setTitle("Update User");
    setOpen(true);
    dispatch(GetUserByCode(code));
  };

  let handleRemove = (code) => {
    if (window.confirm("Do you want to remove?")) {
      dispatch(RemoveUser(code));
    }
  };

  return props.userstate.isloading ? (
    <div 
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      marginTop: "20vh",
    }}
    >
      <ProgressAnimation />
    </div>
  ) : props.userstate.errormessage ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        marginTop: "50vh",
      }}
    >
      <Alert
        icon={
          <ErrorOutlineOutlinedIcon style={{ color: "red", fontSize: 50 }} />
        }
        severity="error"
        sx={{ backgroundColor: "transparent" }}
      >
        <p style={{ fontSize: 30 }}>{props.userstate.errormessage}</p>
      </Alert>
    </div>
  ) : (
    <div className="container-fluid">
      <div id="userrole-box">
        <Paper>
          <div id="job-name-header">
            <Typography >
              Admin Role Management
            </Typography>
          </div>
          <div id="userrole-page">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableCell key={index} sx={{ fontWeight: "bold" }}>
                        {column.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {props.userstate.userlist &&
                    props.userstate.userlist
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

                      .map((row, index) => {
                        return (
                          <TableRow key={index}>
                            {/* <TableCell>{row.id}</TableCell> */}
                            <TableCell>{row.firstName}</TableCell>
                            {/* <TableCell>{row.middleName}</TableCell> */}
                            <TableCell>{row.lastName}</TableCell>
                            {/* <TableCell>{row.company}</TableCell> */}
                            {/* <TableCell>{row.region}</TableCell> */}
                            <TableCell>{row.emailId}</TableCell>
                            {/* <TableCell>{row.mobileNo}</TableCell> */}
                            <TableCell>{row.userName}</TableCell>
                            {/* <TableCell>{row.jobTitle}</TableCell> */}
                            <TableCell>
                              {row.activeStatus === "true"
                                ? "Active"
                                : "Inactive"}
                            </TableCell>
                            <TableCell>
                              {row.roleId === "1" ? "Admin" : "Member"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={(event) => {
                                  handleEdit(row.allUsersStr);
                                }}
                                startIcon={<ModeEditIcon />}
                                sx={{ margin: "5px" }}
                              >
                                Edit
                              </Button>
                              {/* <Button
                              variant="contained"
                              color="error"
                              onClick={(event) => {
                                handleRemove(row.id);
                              }}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button> */}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* <TablePagination
              rowsPerPageOptions={[5, 10, 15, 20]}
              rowsPerPage={rowsPerPage}
              page={page}
              count={props.userstate.userlist.length}
              component={"div"}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowPageChange}
            ></TablePagination> */}
          </div>
        </Paper>
      </div>
      <div >
        <Dialog open={open} onClose={closePopup} fullWidth maxWidth="sm">
          <DialogTitle>
            <span>{title}</span>
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2} margin={2} direction="column">
                {/* <TextField
                value={firstName}
                type="text"
                required
                error={firstName.length === 0}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
                variant="outlined"
                label="First Name"
              />

              <TextField
                value={middleName}
                type="text"
                error={middleName.length === 0}
                onChange={(e) => {
                  setMiddleName(e.target.value);
                }}
                variant="outlined"
                label="Middle Name"
              />

              <TextField
                value={lastName}
                type="text"
                required
                error={lastName.length === 0}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
                variant="outlined"
                label="Last Name"
              />

              <TextField
                value={company}
                type="text"
                required
                error={company.length === 0}
                onChange={(e) => {
                  setCompany(e.target.value);
                }}
                variant="outlined"
                label="Company"
              />

              <TextField
                value={region}
                type="text"
                required
                error={region.length === 0}
                onChange={(e) => {
                  setRegion(e.target.value);
                }}
                variant="outlined"
                label="Region"
              />

              <TextField
                value={emailId}
                type="email"
                required
                error={emailId.length === 0}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                variant="outlined"
                label="Email"
              />

              <TextField
                value={mobileNo}
                type="text"
                required
                error={mobileNo.length === 0}
                onChange={(e) => {
                  setMobile(e.target.value);
                }}
                variant="outlined"
                label="Mobile Number"
              /> */}

                {/* <TextField
                value={userName}
                type="text"
                required
                error={userName.length === 0}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
                variant="outlined"
                label="User Name"
                // inputProps={{ readOnly: true }}
              /> */}

                {/* <TextField
                value={jobTitle}
                type="text"
                required
                error={jobTitle.length === 0}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                }}
                variant="outlined"
                label="Job Title"
              /> */}

                {/* <TextField
                value={activeStatus}
                type="text"
                required
                error={activeStatus.length === 0}
                onChange={(e) => {
                  setActiveStatus(e.target.value);
                }}
                variant="outlined"
                label="Active Status"
              /> */}

                <FormControl>
                  <InputLabel required id="status-select">
                    Active Status
                  </InputLabel>
                  <Select
                    labelId="status-select"
                    label="Active Status"
                    value={activeStatus}
                    onChange={(e) => setActiveStatus(e.target.value)}
                  >
                    <MenuItem value={"true"}>Active</MenuItem>
                    <MenuItem value={"false"}>Inactive</MenuItem>
                  </Select>
                </FormControl>

                <RadioGroup
                  value={roleId}
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                >
                  <FormControlLabel
                    value="2"
                    control={<Radio></Radio>}
                    label="Member"
                    sx={{ width: "20px" }}
                  ></FormControlLabel>

                  <FormControlLabel
                    value="1"
                    control={<Radio></Radio>}
                    label="Admin"
                    sx={{ width: "20px" }}
                  ></FormControlLabel>
                </RadioGroup>
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Stack>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default connect(
  mapStatetoProps,
  mapDispatchtoProps
)(UserManagementIndex);
