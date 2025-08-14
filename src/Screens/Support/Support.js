import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import Sidenav from "../../Components/Utilities/Sidenav";
import { Grid } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export default function Support() {
  document.title = "Support";
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(true);
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <>
      <NavbarPrivate />
      <Sidenav />
      <Grid container display="flex" flexDirection="column" alignItems="center">
        <Card sx={{ width: "600px", alignItems: "center" }}>
          <CardContent>
            <Typography sx={{ fontSize: 30 }} gutterBottom>
              Support
            </Typography>

            <TextField
              label="Name"
              variant="standard"
              sx={{ width: "50ch", paddingBottom: "20px" }}
              type="text"
            />
            <TextField
              label="Email"
              variant="standard"
              sx={{ width: "50ch", paddingBottom: "20px" }}
              type="email"
            />
            <TextField
              label="Message"
              multiline
              rows={4}
              variant="standard"
              sx={{ width: "50ch", paddingBottom: "20px" }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Stack spacing={2} sx={{ alignItems: "center", paddingTop: "20px" }}>
        <Button variant="contained" onClick={handleClick}>
          Submit
        </Button>
        <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Success!
          </Alert>
        </Snackbar>
      </Stack>
    </>
  );
}
