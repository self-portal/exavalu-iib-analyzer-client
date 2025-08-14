import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import dagreD3 from "dagre-d3";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Sidenav from "../../Utilities/Sidenav";
import NavbarPrivate from "../../Utilities/NavbarPrivate";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./FlowChart.css";
import Rotate90DegreesCcwIcon from "@mui/icons-material/Rotate90DegreesCcw";

function FlowChart() {
  const [graphData, setGraphData] = useState(null);
  const [clickedNodeId, setClickedNodeId] = useState(null);
  const [clickedNodeLabel, setClickedNodeLabel] = useState(null);
  const [clickedNodeProject, setClickedNodeProject] = useState(null);
  const [clickedNodeFlow, setClickedNodeFlow] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [rankdir, setRankdir] = useState("LR");
  const [sourceFileID, setSourceFileID] = useState("");
  const [applicationName, setApplicationName] = useState("");
  const xRequestId = uuidv4();
  let navigate = useNavigate();
  const dependencyNetworkURL =
    process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_SOURCE_FILE_FLOW;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const backClose = () => {
    window.close();
  };
  useEffect(() => {
    // const flowTestData = JSON.parse(searchParams.get("data"))
    // const flowTestData =JSON.parse(localStorage.getItem("flowChartData"))
    setApplicationName(JSON.parse(searchParams.get("applicationName")));
    setSourceFileID(JSON.parse(searchParams.get("sourceFileId")));
  }, []);

  // console.log("SOURCE FILE ID", sourceFileID);

  useEffect(() => {
    if (
      sourceFileID !== undefined &&
      sourceFileID !== "" &&
      sourceFileID !== null
    ) {
      document.addEventListener("click", () => setShowInfo(false));

      initializeGraph();
      const headers = {
        "Content-Type": "application/json",
        "x-request-id": xRequestId,
      };
      const queryParams = { source_file_id: sourceFileID };
      const fullUrl = `${dependencyNetworkURL}?${Object.keys(queryParams)
        .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join("&")}`;

      axios
        .get(fullUrl, { headers })
        .then((response) => {
          console.log("API Response:", response.data);
          setGraphData(response.data);
          initializeGraph(response.data);
        })
        .catch((error) => {
          alert("Error: " + error);
          console.error("API call failed:", error);
        });

      return () =>
        document.removeEventListener("click", () => setShowInfo(false));
    }
  }, [sourceFileID]);

  // FUNCTION TO RENDER GRAPH
  const initializeGraph = (inData) => {
    if (!inData) return;

    console.log("inData: ", inData);

    const idToLabelMap = {};
    const svg = d3.select("#svg-canvas");
    svg.selectAll("*").remove();
    const svgGroup = svg.append("g").attr("class", "graph-container");

    const g = new dagreD3.graphlib.Graph({ compound: true })
      .setGraph({
        rankdir: rankdir,
        nodesep: 50,
        ranksep: 100,
        marginx: 10,
        marginy: 10,
      })
      .setDefaultEdgeLabel(() => ({}));

    // Define node styles
    inData.nodes.forEach((node) => {
      idToLabelMap[node.id] = node.label;
      g.setNode(node.id, {
        label: node.label,
        shape: "rect",
        style: "fill: #4A90E2; stroke: #2C3E50; stroke-width: 2px;",
        labelStyle: "font-size: 34px; font-weight: bolder; fill: #FFFFFF;",
        padding: 20,
      });
    });

    // Define edge styles
    inData.edges.forEach((edge) => {
      g.setEdge(edge[0], edge[1], {
        style: "stroke: #2C3E50; stroke-width: 4px; fill: transparent;",
        arrowheadStyle: "fill: #2C3E50;",
        lineInterpolate: "basis",
      });
    });

    // Style nodes after they are added to the graph
    g.nodes().forEach((node) => {
      const nodeData = g.node(node);
      nodeData.rx = nodeData.ry = 15;
    });

    // Render the graph
    const render = new dagreD3.render();
    render(svgGroup, g);

    // Adjust SVG dimensions and calculate centering translation
    const svgWidth = parseInt(svg.style("width").replace("px", ""));
    const svgHeight = parseInt(svg.style("height").replace("px", ""));
    const graphWidth = g.graph().width - 140;
    const graphHeight = g.graph().height + 140;

    // Calculate the center position
    const xCenterOffset = (svgWidth - graphWidth) / 2;
    const yCenterOffset = (svgHeight - graphHeight) / 2;

    // Zoom functionality
    const zoom = d3
      .zoom()
      .on("zoom", () => svgGroup.attr("transform", d3.event.transform));
    svg.call(zoom);

    // Calculate initial scale to fit the entire graph in view
    const scaleX = svgWidth / graphWidth;
    const scaleY = svgHeight / graphHeight;
    const initialScale = Math.min(scaleX, scaleY);

    // Apply initial zoom and translation to center the graph
    const initialTransform = d3.zoomIdentity
      .translate(
        xCenterOffset * initialScale + 220,
        yCenterOffset * initialScale + 120
      )
      .scale(initialScale);

    svg.call(zoom.transform, initialTransform);

    // Add cursor pointer to nodes and edges
    svg.selectAll("g.node").style("cursor", "pointer");
    svg.selectAll("g.edgePath path").style("cursor", "pointer");

    // Click event for nodes
    d3.selectAll("svg g.node").on("click", function (d) {
      d3.event.stopPropagation();

      const [project, flow] = d.split(":");
      setClickedNodeId(d);
      setClickedNodeLabel(idToLabelMap[d] || "Unknown");
      setClickedNodeProject(project || "Unknown");
      setClickedNodeFlow(flow || "Unknown");
      setShowInfo(true);
    });

    // Hover events for nodes
    // svg
    //   .selectAll("svg g.node")
    //   .on("mouseover", function (d) {
    //     // Highlight edges connected to the hovered node
    //     const connectedEdges = g.outEdges(d);

    //     svg
    //       .selectAll("svg g.edgePath path")
    //       .style("stroke", "#2C3E50")
    //       .style("stroke-width", "2px");

    //     connectedEdges.forEach((edge) => {
    //       const edgeId = `${edge.v}-${edge.w}`;
    //       svg
    //         .select(`svg g.edgePath path[id="${edgeId}"]`)
    //         .style("stroke", "red")
    //         .style("stroke-width", "4px");
    //     });
    //   })
    //   .on("mouseout", function () {
    //     // Reset edge styles when mouse leaves the node
    //     svg
    //       .selectAll("svg g.edgePath path")
    //       .style("stroke", "#2C3E50")
    //       .style("stroke-width", "2px");
    //   });

    // Hover event for edges to highlight them
    d3.selectAll("svg g.edgePath path")
      .on("mouseover", function () {
        d3.event.stopPropagation();
        d3.select(this).style("stroke", "#E74C3C").style("stroke-width", "6px");
      })
      .on("mouseout", function () {
        d3.select(this).style("stroke", "#2C3E50").style("stroke-width", "4px");
      });
  };

  // Function to remove a node
  const removeNode = () => {
    if (!clickedNodeId || !graphData) {
      console.log("AAAAAAAAAA");
      return;
    }

    console.log("REMOVE NODE CLICKED !!");

    // Remove the node and its edges from the graph data
    const updatedNodes = graphData.nodes.filter(
      (node) => node.id !== clickedNodeId
    );
    const updatedEdges = graphData.edges.filter(
      (edge) => edge[0] !== clickedNodeId && edge[1] !== clickedNodeId
    );

    console.log(updatedNodes);
    console.log(updatedEdges);

    // Re-initialize the graph with the updated data
    initializeGraph({ nodes: updatedNodes, edges: updatedEdges });

    // Clear the clicked node info
    setClickedNodeId(null);
    setShowInfo(false);
  };

  // Function to toggle graph orientation
  const toggleOrientation = () => {
    const newRankdir = rankdir === "LR" ? "TB" : "LR";
    setRankdir(newRankdir);
    if (graphData) {
      initializeGraph(graphData); // Re-initialize the graph with the new rankdir
    }
  };

  return (
    <>
      <Sidenav />
      <NavbarPrivate />
      <div className="container-fluid-2" id="flow-chart">
        <div className="header-section">
          <h4 className="flow-chart-title">FLOW CHART</h4>
          <p
            id="rotate-button"
            component="label"
            onClick={toggleOrientation}
            className="rotate-button"
          >
            <Rotate90DegreesCcwIcon
              sx={{ fontSize: "2rem", fontWeight: "bold" }}
            />
          </p>

          <Button
            id="back-button"
            variant="contained"
            component="button"
            onClick={() => backClose()}
            className="close-button"
          >
            Close
          </Button>
        </div>

        <div className="flow-chart-container">
          <h4 className="application-name">
            APPLICATION NAME: {applicationName ? applicationName : ""}
          </h4>

          {showInfo && (
            <div className="info-section">
              <p>Node: {clickedNodeLabel}</p>
              <p>Project: {clickedNodeProject}</p>
              <p>Flow: {clickedNodeFlow}</p>
              {/* <Button
                variant="contained"
                color="secondary"
                onClick={removeNode}
              >
                DELETE NODE
              </Button> */}
            </div>
          )}

          <svg className="svg-design-2" id="svg-canvas" />
        </div>
      </div>
    </>
  );
}

export default FlowChart;
