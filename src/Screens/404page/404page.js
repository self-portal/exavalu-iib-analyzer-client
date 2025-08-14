import React from "react";
import "./404page.css";
import NavbarPublic from "../../Components/Utilities/NavbarPublic";

let FourOFour = () => {
  document.title = "404 Not Found";

  return (
    <>
      <NavbarPublic />
      <div className="four-o-four">
        <div id="notfound">
          <div className="notfound">
            <div className="notfound-404">
              <h1>404</h1>
            </div>
            <h2>Oops! Nothing was found</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default FourOFour;
