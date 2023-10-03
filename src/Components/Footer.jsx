import React from "react";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-md-4 col-md-6 center">
            <h2 className="white bold">METODOS DE PAGO:</h2>
            <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="col">
                <h2 className="white bold">TRANSFERENCIAS 1:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 64-6760-1464-0398-4695</p>
                <p className="col bold" style={{ fontSize: '20px' }}>BANCO: STP</p>
                <p className="col bold" style={{ fontSize: '20px' }}>NOMBRE: MARIA RUIZ BORQUEZ</p>
              </div>
              <div className="col">
                <h2 className="col white bold">TRANSFERENCIAS 2:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 64-6760-1464-0337-9116</p>
                <p className="col bold" style={{ fontSize: '20px' }}>BANCO: STP</p>
                <p className="col bold" style={{ fontSize: '20px' }}>NOMBRE: MARTIN SANCHEZ LEYVA</p>
              </div>
              <div className="col">
                <h2 className="col white bold">DEPOSITOS EN OXXO 2:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 2242-1707-6018-2351</p>
                
              </div>
              <div className="col">
                <h2 className=" col white bold">DEPOSITOS EN OXXO 2:</h2>
                <p className="col bold" style={{ fontSize: '20px' }}>CUENTA: 2242-1707-6024-2905</p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
