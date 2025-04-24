import React from "react";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-md-4 col-md-6 center">
            <h1 className="white bold">METODOS DE PAGO:</h1>
            <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
              
              
              <div className="col">
                <h2 className="white bold">TRANSFERENCIAS:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 72-8969-0001-0756-7678</p>
                <p className="col bold" style={{ fontSize: '20px' }}>BANCO: Spin By Oxxo</p>
                <p className="col bold" style={{ fontSize: '20px' }}>NOMBRE: ALVARO RUIZ MURRIETA</p>
              </div>
              <div className="col">
                <h2 className=" col white bold">DEPOSITOS EN OXXO:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 2242-1707-6033-2708</p>
                
              
             
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
