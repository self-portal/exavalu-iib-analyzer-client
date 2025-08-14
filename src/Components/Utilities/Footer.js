import React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import { Typography } from "@mui/material";

// export default function Footer() {
//   return (
//     <BottomNavigation
//       sx={{
//         position: "fixed",
//         bottom: 0,
//         left: 0,
//         right: 0,
//         zIndex: 999,
//         height: "30px",
//       }}
//     >
//       <Typography sx={{ fontSize: 20, margin: "auto" }}>
//         &copy; {new Date().getFullYear()} EXAVALU, all rights reserved.
//       </Typography>
//     </BottomNavigation>
//   );
// }

const Footer = () => {
  const footerStyle = {
    background: "linear-gradient(to top, #1e1e2f, #252539)",
    color: "rgb(255, 255, 255)",
    textAlign: "center",
    position: "fixed",
    bottom: 0,
    height: "36px",
    width: "100%",
    zIndex: 400000,
    padding: "5px",
    // marginTop: "20px",
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; 2024 EXAVALU. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
