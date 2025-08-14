import React from "react";
import ExavaluLogo from "../../Static/exavalulogo-big-1.png";
import "./style.css";

function NavbarPrivate() {
  return (
    <div className="Nav-bar">
      <div className="overlap-wrapper">
        <div className="overlap">
          <img
            className="exavalulogo-big"
            alt="Exavalu logo big"
            src={ExavaluLogo}
          />
          <p className="p">© 2023 EXAVALU, all rights reserved.</p>
          <p className="support-button-instance">Support</p>
        </div>
      </div>
    </div>
  );
}

export default NavbarPrivate;
