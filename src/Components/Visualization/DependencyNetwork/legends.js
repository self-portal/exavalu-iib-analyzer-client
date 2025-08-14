import React from "react";

const LegendItem = ({ color, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      marginBottom: "25px",
      borderRadius: "5px",
      padding: "5px",
      backgroundColor: "#f5f5f5",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    }}
  >
    <div
      style={{
        width: "30px",
        height: "20px",
        borderRadius: "5px",
        backgroundColor: color,
        marginRight: "5px",
      }}
    ></div>
    <span>{label}</span>
  </div>
);

const Legends = () => (
  <div id="aplication-css">
    <LegendItem color="lightgreen" label="Application" />
    <LegendItem color="lightblue" label="Library" />
  </div>
);

export default Legends;
