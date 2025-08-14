import * as React from "react";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";

export default function BasicAccordion({ jobName }) {
  const [recentJob, setRecentJob] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    setRecentJob(jobName);
  }, [jobName]);

  if (!recentJob) return null;

  return (
    <div
      sx={{
        width: 320,
        marginBottom: "1px",
        position: "relative",
        paddingLeft: "20px",
      }}
    >
      <Typography sx={{ fontSize: 18, position: "relative" }}>
        <ListItemButton
          // to="/selectprojectname"
          className="listItem"
          style={{
            textDecoration: "none",
            color: "black",
            padding: "1px 2px ",
          }}
          onClick={(orgEvent) => {
            // navigate("/selectprojectname", {
            //   state: { Menu: orgEvent.currentTarget.id },
            // });
            console.log(recentJob.jobName);

            navigate("/UploadProjects", {
              state: { jobName: recentJob.jobName, pageName: "open job" },
            });
          }}
        >
          {recentJob.jobName}
        </ListItemButton>
        <span
          style={{
            content: '""',
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "10px",
            height: "10px",
            backgroundColor: "Black",
            borderRadius: "50%",
          }}
        ></span>
      </Typography>
    </div>
  );
}
