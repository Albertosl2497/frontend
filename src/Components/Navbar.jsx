import React from "react";
import Logo from "../Assets/logo.png";

function Navbar() {
  return (
    <nav>
      <div className="row">
        <img src={Logo} alt="Logo" />
        <div className="col">
          <h1>SORTEOS </h1>
          <h1>SONORENSE</h1>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
