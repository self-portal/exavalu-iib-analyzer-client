import React from "react";
import NavbarPrivate from "../../../Components/Utilities/NavbarPrivate";
import Sidenav from "../../../Components/Utilities/Sidenav";
import ParameterManagementJobSpecific from "../Functions/ComplexityManagement/ParameterManagementJobSpecific";
import { ConfirmProvider } from "material-ui-confirm";

export default function AdminParameterManagementJobSpecific() {
  document.title = "Specific Parameter";
  return (
    <>
      <NavbarPrivate />
      <Sidenav />

      <ConfirmProvider>
        <ParameterManagementJobSpecific />
      </ConfirmProvider>
    </>
  );
}
