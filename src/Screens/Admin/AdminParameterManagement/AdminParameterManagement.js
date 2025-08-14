import React from "react";
import NavbarPrivate from "../../../Components/Utilities/NavbarPrivate";
import Sidenav from "../../../Components/Utilities/Sidenav";
import ParameterManagementDefault from "../Functions/ComplexityManagement/ParameterManagementDefault";
import { ConfirmProvider } from "material-ui-confirm";

export default function AdminParameterManagement() {
  document.title = "Default Parameter";
  return (
    <>
      <NavbarPrivate />
      <Sidenav />

      <ConfirmProvider>
        <ParameterManagementDefault />
      </ConfirmProvider>
    </>
  );
}
