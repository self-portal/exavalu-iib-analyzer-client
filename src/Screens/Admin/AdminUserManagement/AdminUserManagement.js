import React from "react";
import { Provider } from "react-redux";
import store from "../Functions/UserManagement/Redux/Store";
import UserManagementIndex from "../Functions/UserManagement/UserManagementIndex";
import NavbarPrivate from "../../../Components/Utilities/NavbarPrivate";
import Sidenav from "../../../Components/Utilities/Sidenav";

export default function AdminUserManagement() {
  document.title = "User Management";
  return (
    <>
      <NavbarPrivate />
      <Sidenav />
      <Provider store={store}>
        <UserManagementIndex />
      </Provider>
    </>
  );
}
