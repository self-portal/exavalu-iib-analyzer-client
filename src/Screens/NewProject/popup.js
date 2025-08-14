import React from "react";
import './NewProject.css'
import { Link } from "react-router-dom";

function Popup(props) {
    return (props.trigger) ? (
        <div className="popup" style={{zIndex:"9999"}}>
            <div className="popup-inner">
            <Link component="button" to="/my-activity">
                <button className="close-btn" onClick={() => props.setTrigger(false)}>Close</button>
                
            </Link>
            {props.children}
            </div>
        </div>
    ) : "";
}

export default Popup;
