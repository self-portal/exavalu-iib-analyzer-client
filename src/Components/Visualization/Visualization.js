import { React, useState, useEffect } from "react";
import { Chart } from "react-google-charts";
import Sidenav from "../../Components/Utilities/Sidenav";
import NavbarPrivate from "../../Components/Utilities/NavbarPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@mui/material";
import "../Global/GlobalVariable";

// Declare color set for connectors chart.
const colorList = [
  "#008744",
  "#0057e7",
  "#d62d20",
  "#ffa700",
  "#ff6700",
  "#0f403f",
  "#8f1010",
  "#ff9900",
  "#146eb4",
  "#FF1744",
];
const visualChartsURL =
  process.env.REACT_APP_BASE_PATH + process.env.REACT_APP_VISUAL_CHART;
//const visualChartsURL = 'http://localhost:9090/api/htkpgx2472sz/generate-report';

/*** job complexity pie chart ***/
const job_Complexity_Options = {
  series: {
    1: { curveType: "function" },
  },
  pieHole: 1,
  is3D: false,
};

// Function to remove "Connector" from the end of each string
const removeConnectorFromSuffix = (str) => {
  if (str.endsWith("Connector")) {
    return str.slice(0, -"Connector".length);
  }
  return str;
};

// Function to capitalize the first letter of each word and add a space
const formatConnectorString = (str) => {
  return str
    .split(/(?=[A-Z])/) // Split the string by capital letters
    .map((word) => word.charAt(0) + word.slice(1)) // Capitalize each word
    .join(" "); // Join the words with a space
};

function Visualization() {
  let navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [getConnectorsChartData, setConnectorsChartData] = useState({});
  const [getTotalConnector, setTotalConnector] = useState(0);

  const searchParams = new URLSearchParams(location.search);
  const test = JSON.parse(localStorage.getItem("visualChartTestData"));
  console.log(test, "test");
  const backClose = () => {
    window.close();
  };
  // useEffect(() => {
  //   const flowTestData = JSON.parse(searchParams.get("data"))
  //   setUserName(flowTestData.userName)
  //   setRes(flowTestData.responseBody)
  //   setSelectSubjobs(flowTestData.selectedSubJobs)
  // }, [])

  useEffect(() => {
    initializeVisualCharts();
    // Set Headers & Query Params
    const headers = {
      "Content-Type": "application/json",
      "x-request-id": uuidv4(),
    };
    const queryParams = {
      user_name: global.queryName,
      job_id: test[0].jobId,
    };

    const makeVisualChartsURL = `${visualChartsURL}?${Object.keys(queryParams)
      .map((key) => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join("&")}`;

    axios
      .get(makeVisualChartsURL, { headers })
      .then((response) => {
        // Handle the successful response here
        initializeVisualCharts(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        // Handle any errors here
        console.error("Business call failed:", error);
        setIsLoading(false);
      });
  }, []);

  const initializeVisualCharts = (resData) => {
    // Add One or More Charts/Graphs logic here.
    if (!resData) return;
    let colorListIndex = 0;
    let totalConnector = 0;

    const createConnectorsChartDataSet = Object.keys(resData.connectorInfo).map(
      (keyOfConnectorInfo, indexOfConnectorInfo) => {
        let selectColor = "green";
        colorListIndex = indexOfConnectorInfo;
        if (colorListIndex < colorList.length) {
          selectColor = colorList[colorListIndex];
          colorListIndex++;
        } else {
          colorListIndex = 0;
          selectColor = colorList[colorListIndex];
        }
        totalConnector =
          totalConnector + resData.connectorInfo[keyOfConnectorInfo];
        setTotalConnector(totalConnector);

        return [
          removeConnectorFromSuffix(
            formatConnectorString(keyOfConnectorInfo)
          ).toUpperCase(),
          resData.connectorInfo[keyOfConnectorInfo],
          selectColor,
        ];
      }
    );

    // Add a header row to the array
    createConnectorsChartDataSet.unshift([
      "Connector Nodes",
      "Count",
      { role: "style" },
    ]);
    setConnectorsChartData(createConnectorsChartDataSet);
  };

  // Set Complexity table & pie chart data which is coming from previous visulazation scores page.
  // Complexity TABLE
  const api_Complexity_Table_Map = test[0].subJobs;
  // console.log("useLocation().state[0]", useLocation().state[0]);
  const applicationComplexityArray = [];
  api_Complexity_Table_Map.map((eachSubJob) => {
    eachSubJob.sourceFilesComplexityDetails.map((complexityDetails) => {
      applicationComplexityArray.push([
        complexityDetails.applicationName,
        complexityDetails.appComplexityDetails.complexityLevel,
      ]);
    });
  });

  // Complexity PIE chart
  const complexityCountMap = {};
  applicationComplexityArray.map(([applicationName, complexityLevel]) => {
    // Count the occurrences of each complexity level
    if (complexityCountMap[complexityLevel]) {
      complexityCountMap[complexityLevel]++;
    } else {
      complexityCountMap[complexityLevel] = 1;
    }
  });
  const complexityCountArray = Object.entries(complexityCountMap);
  const api_Complexity = [["Complexity", "Count"], ...complexityCountArray];

  /*** job connectors ***/
  const job_Connector_Options = {
    title: "Total Connectors in job : " + getTotalConnector,
    fontSize: 24,
    bold: false,
    fontName: "Times New Roman",
    bars: "fixed",
    bar: { groupWidth: "15%" },
    // Set the legend to 'none' to disable it
    legend: "none",
    vAxis: {
      title: "Number of connectors",
      textStyle: {
        fontName: "Times New Roman",
        fontSize: 16,
        color: "black",
        bold: true,
        italic: false,
      },
      titleTextStyle: {
        color: "black",
        fontName: "Times New Roman",
        fontSize: 20,
        bold: false,
        italic: false,
      },
      // This format ensures whole number labels
      format: "0",
      gridlines: {
        // Set the count to 0 to disable vertical gridlines
        //count: 0,
      },
    },
    hAxis: {
      title: "Types of connectors",
      textStyle: {
        fontName: "Times New Roman",
        fontSize: 16,
        color: "black",
        bold: true,
        italic: false,
      },
      titleTextStyle: {
        color: "black",
        fontName: "Times New Roman",
        fontSize: 20,
        bold: false,
        italic: false,
      },
    },
  };

  return (
    <>
      <NavbarPrivate />
      <Sidenav />
      <div class="position-relative">
        <div class="position-absolute top-0 end-0">
          {/* <button id='close' onClick={() => navigate(-1)}>close</button> */}
          <Button
            style={{
              position: "relative",
              top: "-5px",
              right: "15px",
            }}
            // id="back-button-3"
            variant="contained"
            component="button"
            onClick={() => backClose()}
          >
            Close
          </Button>
        </div>
      </div>

      <div class="container-fluid" id="visual-charts">
        <h3
          style={{
            textAlign: "left",
            color: "#008b8b",
            position: "absolute",
            top: "92px",
            fontWeight: "bold",
          }}
        >
          VISUAL CHART
        </h3>
        <div id="job-name-header">
          <h4
            style={{
              textAlign: "center",
              color: "#0e00ffa6",
              position: "relative",
              top: "80px",
              fontFamily: "Domine",
            }}
          >
            JOB NAME : {test[0].jobName}
          </h4>
        </div>

        <div id="complexity-pie-graph-section" style={{ marginTop: "65px" }}>
          <h4 id="complexity-pie-graph-header">
            Distribution of complexity in percentage
          </h4>
          <Chart
            className="complexity-pie-graph"
            chartType="PieChart"
            data={api_Complexity}
            options={job_Complexity_Options}
            height={"400px"}
            maxHeight={"500px"}
          />
        </div>

        <div id="connectors-graph-section">
          <h4 id="connectors-header">Distribution of connectors</h4>
          {isLoading ? (
            <div id="visualization-loader-div">
              <div class="visualization-loader" />
            </div>
          ) : (
            <Chart
              className="connectors-graph"
              chartType="ColumnChart"
              height="400px"
              data={getConnectorsChartData}
              options={job_Connector_Options}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Visualization;
