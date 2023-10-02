import React from "react";
import Logo from "../Assets/logo.png";

function Navbar() {
  return (
    <nav>
      <div className="row">
        <img src={Logo} alt="Logo" />
        <div className="col">
          <h1>RIFAS EFECTIVO </h1>
          <h1>CAMPO TREINTA</h1>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
