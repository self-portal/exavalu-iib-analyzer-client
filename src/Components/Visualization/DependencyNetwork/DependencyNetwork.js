import React, { Component, useEffect, useState } from "react";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";
import Legends from "./legends";
import axios from "axios";
import Sidenav from "../../Utilities/Sidenav";
import NavbarPrivate from "../../Utilities/NavbarPrivate";
import { useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import "./DependencyNetwork.css";

function DependencyNetwork() {
  const dependencyNetworkURL =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_DEPENDENCY_GRAPH;
  const location = useLocation();
  const xRequestId = uuidv4();

  const test1 = JSON.parse(localStorage.getItem("dependencyGraphData"));
  // const requestBody = location.state[0].requestBody
  // const userName = location.state[0].userName;
  // const Res = location.state[0].responseBody;
  // const selectSubjobs = location.state[0].selectedSubJobs;

  let navigate = useNavigate();

  // to get subJobName from params
  const [userName, setUserName] = useState("");
  const [Res, setRes] = useState([]);
  const [selectSubjobs, setSelectSubjobs] = useState("");
  const [requestBody] = React.useState([]);

  const searchParams = new URLSearchParams(location.search);
  const test = JSON.parse(searchParams.get("subJobName"));

  const backClose = () => {
    window.close();
  };

  useEffect(() => {
    const flowTestData = JSON.parse(
      localStorage.getItem("dependencyGraphData")
    );
    setUserName(flowTestData.userName);
    setRes(flowTestData.responseBody);
    setSelectSubjobs(test);
  }, []);

  // == checked Data validation ==
  useEffect(() => {
    if (Res !== undefined && Res.length !== 0 && Res !== null) {
      const checkedValidated = Res.flatMap((item) =>
        item.subJobName == selectSubjobs ? [item] : []
      );
      const validatedData = checkedValidated.map((val, index) =>
        val.sourceFilesComplexityDetails.flatMap((item) =>
          !!item.epComplexityDetails.length > 0 ? [item] : []
        )
      );

      // const [resReq, setResReq] = React.useState([]);

      if (validatedData.length > 0) {
        validatedData[0].map((depn, index) => [
          requestBody.push({
            sourceFileMasterId: depn.applicationMasterId,
            sourceFileName: depn.applicationName,
          }),
        ]);
      }
      //  pushedData.push(setResReq);

      initializeGraph();
      const headers = {
        "Content-Type": "application/json",
        "x-request-id": xRequestId,
      };

      const queryParams = {
        user_name: userName,
      };
      const fullUrl = `${dependencyNetworkURL}?${Object.keys(queryParams)
        .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join("&")}`;

      axios
        .post(fullUrl, requestBody, { headers })
        .then((response) => {
          initializeGraph(response.data);
        })
        .catch((error) => {
          console.error("API call failed:", error);
        });
    }
  }, [Res]);

  const initializeGraph = (inData) => {
    if (!inData) return;

    const totalNumberOfExpectedNodes = requestBody;
    const unresolvedDependencies = inData.unresolvedDependenciesFiles;

    const svg = d3.select("#svg-canvas");

    if (unresolvedDependencies.length === totalNumberOfExpectedNodes.length) {
      svg.selectAll("*").remove();
      svg
        .append("text")
        .attr("x", 20)
        .attr("y", 30)
        .text("All dependencies are unresolved.");
      return; // Exit the function early, skipping the rest of the graph rendering code
    } else if (
      unresolvedDependencies.length > 0 &&
      unresolvedDependencies.length !== totalNumberOfExpectedNodes.length
    ) {
      alert(
        "Some dependencies are unresolved: " + unresolvedDependencies.join(", ")
      );
    }

    // const svg = d3.select('#svg-canvas');
    svg.selectAll("*").remove();
    const svgGroup = svg.append("g").attr("class", "graph-container");

    const g = new dagreD3.graphlib.Graph({ compound: true })
      .setGraph({})
      .setDefaultEdgeLabel(() => ({}));

    const nodes = inData.nodes;
    nodes.forEach((node) => {
      g.setNode(node, { label: node });
      //g.setNode(node, { label: node.toUpperCase() });
    });

    const edges = inData.edges;
    edges.forEach((edge) => {
      g.setEdge(edge[0], edge[1], {
        style: "stroke: #2C3E50; stroke-width: 2px; fill: transparent;",
        arrowheadStyle: "fill: #2C3E50;",
        lineInterpolate: "basis",
      });
    });

    g.nodes().forEach((node) => {
      const nodeData = g.node(node);
      nodeData.rx = nodeData.ry = 15;

      if (inData.projectTypes[node] !== "Library") {
        nodeData.style = "fill: lightgreen";
      } else {
        nodeData.style = "fill: lightblue";
      }
    });

    const render = new dagreD3.render();
    render(svgGroup, g);

    // Add hover effect for edges with cursor pointer
    svgGroup
      .selectAll(".edgePath path")
      .on("mouseover", function () {
        d3.select(this)
          .style("stroke", "#E74C3C")
          .style("stroke-width", "4px")
          .style("cursor", "pointer");
      })
      .on("mouseout", function () {
        d3.select(this)
          .style("stroke", "#2C3E50")
          .style("stroke-width", "2px")
          .style("cursor", "default");
      });

    const graphWidth = g.graph().width;
    const graphHeight = g.graph().height;
    svg.attr("width", graphWidth);
    svg.attr("height", graphHeight);
    svgGroup.attr("transform", "translate(20, 20)");

    const zoom = d3.zoom().on("zoom", () => {
      svgGroup.attr("transform", d3.event.transform);
    });
    svg.call(zoom);
  };

  return (
    <>
      <Sidenav />
      <NavbarPrivate />
      <div class="container-fluid-2" id="dependency-graph">
        <h4
          style={{
            position: "relative",
            top: "35px",
          }}
          id="dependency-graph-header"
        >
          DEPENDENCY NETWORK GRAPH
        </h4>
        <h5
          style={{
            textAlign: "center",
            color: "#0e00ffa6",
            position: "relative",
            top: "50px",
          }}
        >
          SUBJOB NAME : {selectSubjobs}
        </h5>
        <div class="position-relative">
          <div class="position-absolute top-5 end-0">
            {/* <button id='close' onClick={() => navigate(-1)}>close</button> */}
            <Button
              id="back-button-2"
              variant="contained"
              component="button"
              onClick={() => backClose()}
              style={{
                position: "relative",
                top: "-75px",
              }}
            >
              Close
            </Button>
          </div>
        </div>

        <div
          className="App"
          style={{
            boxShadow:
              "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
            borderRadius: "0.6em",
            marginTop: "65px",
            backgroundColor: "white",
          }}
        >
          <svg className="svg-design" id="svg-canvas" />
          <Legends />
        </div>
      </div>
    </>
  );
}

export default DependencyNetwork;
