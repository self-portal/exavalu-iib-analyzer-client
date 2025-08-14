import "./NewProject_list.css";
import "../../index.css";
import React, { useState } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
} from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";

const columns = [
  {
    id: "fileName",
    name: "File Name",
  },
];

let NewProjectlist = (props) => {
  document.title = "New Project";
  var job_name = sessionStorage.getItem("Job Name");

  const [,] = useState(); //tracking state of functional component
  const [isVisible, setIsVisible] = useState(false); //state used for unhiding and hiding as boolean
  const [page, setPage] = useState(0);
  const [rowPerPage, setRowPerPage] = useState(5);
  const [row, setData] = React.useState([]);

  let handleFile = (event) => {
    const temporaryStore = []; //temporary store inside function
    for (let index = 0; index < event.target.files.length; index++) {
      temporaryStore.push(event.target.files[index]); //adding every data via loop
    }
    setData(temporaryStore); // finally storing the data inside setData and updating fileName
    setIsVisible((isVisible) => !isVisible);
  };

  let handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  let handleRowsPerPage = (event) => {
    setRowPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <NavbarPrivate />
      <Sidenav />

      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "60px" }}>{job_name}</h1>
        <Paper sx={{ width: "40%", margin: "auto" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      sx={{
                        fontSize: "30px",
                        backgroundColor: "#565656",
                        color: "white",
                      }}
                      key={column.name}
                    >
                      {column.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {row &&
                  row
                    .slice(page * rowPerPage, page * rowPerPage + rowPerPage)
                    .map((item, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Checkbox />
                            {item.name}
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </TableContainer>
          {isVisible && (
            <TablePagination
              count={row.length}
              component="div"
              page={page}
              rowsPerPageOptions={[5, 10, 15, 20]}
              rowsPerPage={rowPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleRowsPerPage}
            />
          )}
        </Paper>

        <input
          id="file-upload"
          className="upload-area"
          type="file"
          accept=".zip"
          onChange={handleFile}
          multiple
        />
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: "center", paddingTop: "20px" }}
        >
          <label htmlFor="file-upload">
            <Button
              variant="contained"
              component="span"
              sx={{
                minWidth: "100px",
                minHeight: "50px",
              }}
            >
              Select source files
            </Button>
          </label>

          <Link to={isVisible && "/newjobscan"}>
            <Button
              variant="contained"
              sx={{
                minWidth: "100px",
                minHeight: "50px",
              }}
            >
              Submit
            </Button>
          </Link>
        </Stack>
      </div>
    </>
  );
};

export default NewProjectlist;
