import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Screens/HomePage/HomePage.js";
import FourOFour from "./Screens/404page/404page.js";
import NewProject from "./Screens/NewProject/NewProject.js";
import NewProjectlist from "./Screens/NewProjectlist/NewProjectlist.js";
import NewProjectScan from "./Screens/NewProjectScan/NewProjectScan.js";
import Visualization from "./Components/Visualization/Visualization.js";
import SelectProjectName from "./Screens/SelectProjectName/SelectProjectName.js";
import UploadProjects from "./Screens/UploadProjects/UploadProjects.js";
import ForgotPassword from "./Screens/ForgotPassword/ForgotPassword.js";
import Register from "./Screens/Register/Register.js";
import MyActivity from "./Screens/MyActivity/MyActivity.js";
import Footer from "./Components/Utilities/Footer.js";
import Support from "./Screens/Support/Support.js";
import ScanProjectName from "./Screens/ScanProjectName/ScanProjectName.js";
import JobView from "./Screens/NewProject/JobView.js";
import CollapsibleTable from "./Components/Visualization/DropDownTable.js";
import DependencyNetwork from "./Components/Visualization/DependencyNetwork/DependencyNetwork.js";
import FlowChart from "./Components/Visualization/FlowChart/FlowChart.js";
import { ToastContainer } from "react-toastify";
import VisualProjectName from "./Components/Visualization/VisualProjectName/VisualProjectName.js";
import VisualProjects from "./Components/Visualization/VisualProjectName/VisualProjects.js";
import "react-toastify/dist/ReactToastify.css";
import SelectProjectNameAdmin from "./Screens/SelectProjectName/SelectProjectNameAdmin.js";
import ScanProjects from "./Screens/ScanProjectName/ScanProjects.js";
import MigrateProject from "./Screens/MigrateProject/MigrateProject.js";
import MigrateProjectName from "./Screens/MigrateProject/MigrateProjectName.js";
import WsdltoRamlAddApiDetails from "./Screens/WsdlToRaml/components/AddApiDetails.js";
import GenericRamlApiPreview from "./Screens/GenericRamlPreview/components/GenericRamlApiPreview.js";
import AddNewSubjobs from "./Screens/UploadProjects/AddNewSubJob.js";
import ProgressAnimation from "./Components/Animation/Animation.js";

const LogIn = lazy(() => import("./Screens/LogIn/LogIn.js"));

const AdminUserManagement = lazy(() =>
  import("./Screens/Admin/AdminUserManagement/AdminUserManagement.js")
);

const AdminParameterManagement = lazy(() =>
  import("./Screens/Admin/AdminParameterManagement/AdminParameterManagement.js")
);

const AdminParameterManagementJobSpecific = lazy(() =>
  import(
    "./Screens/Admin/AdminParameterManagement/AdminParameterManagementJobSpecific.js"
  )
);

function App() {
  return (
    <>
      <main>
        <Suspense
          fallback={
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
          }
        >
          <Routes>
            <Route exact path="/visualization" element={<Visualization />} />
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/home" element={<HomePage />} />
            <Route exact path="/newjob" element={<NewProject />} />
            <Route exact path="/newjoblist" element={<NewProjectlist />} />
            <Route exact path="/newjobscan" element={<NewProjectScan />} />
            <Route
              exact
              path="/adminrolemangement"
              element={<AdminUserManagement />}
            />
            <Route
              exact
              path="/adminparametermangement"
              element={<AdminParameterManagement />}
            />
            <Route
              exact
              path="/parametermangementspecific"
              element={<AdminParameterManagementJobSpecific />}
            />
            <Route exact path="/*" element={<FourOFour />} />
            <Route exact path="/login" element={<LogIn />} />
            <Route
              exact
              path="/selectprojectname"
              element={<SelectProjectName />}
            />
            <Route
              exact
              path="/selectprojectnameadmin"
              element={<SelectProjectNameAdmin />}
            />
            <Route exact path="/uploadprojects" element={<UploadProjects />} />
            <Route exact path="/scanproject" element={<ScanProjectName />} />
            <Route exact path="/ForgotPassword" element={<ForgotPassword />} />
            <Route exact path="/Register" element={<Register />} />
            <Route exact path="/my-activity" element={<MyActivity />} />
            <Route exact path="/support" element={<Support />} />
            <Route exact path="/scanjob" element={<ScanProjectName />} />
            <Route exact path="/jobview" element={<JobView />} />
            <Route exact path="/scanprojectview" element={<ScanProjects />} />
            <Route
              exact
              path="/migrateproject"
              element={<MigrateProjectName />}
            />
            <Route
              exact
              path="/migrateprojectview"
              element={<MigrateProject />}
            />

            <Route
              exact
              path="/wsdl-to-raml-preview"
              element={<WsdltoRamlAddApiDetails />}
            />

            <Route
              exact
              path="/raml-preview"
              element={<GenericRamlApiPreview />}
            />

            <Route exact path="/addnewsubjob" element={<AddNewSubjobs />} />
            <Route exact path="/addsubjob" element={<AddNewSubjobs />} />
            <Route exact path="/newjobprojects" element={<UploadProjects />} />

            <Route exact path="/datatable" element={<CollapsibleTable />} />
            <Route
              exact
              path="/dependencynetwork"
              element={<DependencyNetwork />}
            />
            <Route exact path="/visualprojects" element={<VisualProjects />} />
            <Route
              exact
              path="/visualprojectname"
              element={<VisualProjectName />}
            />
            <Route exact path="/flowchart" element={<FlowChart />} />
          </Routes>
        </Suspense>
        <ToastContainer limit={2} autoClose={2000} position="bottom-left" />
      </main>
      <Footer />
    </>
  );
}

export default App;
