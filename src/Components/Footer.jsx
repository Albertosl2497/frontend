import React from "react";

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-md-4 col-md-6 center">
            <h2 className="white bold">METODOS DE PAGO:</h2>
            <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <h2 className="white bold">1.- TRANSFERENCIAS:</h2>
                <p className="bold" style={{ fontSize: '20px' }}>CUENTA: 64-6760-1464-0398-4695</p>
                <p className="bold" style={{ fontSize: '20px' }}>BANCO: STP</p>
                <p className="bold" style={{ fontSize: '20px' }}>NOMBRE: MARIA RUIZ BORQUEZ</p>
              </div>
              <div>
                <h2 className="white bold">2.- TRANSFERENCIAS:</h2>
                <p className="bold" style={{ fontSize: '20px' }}>CUENTA: 64-6760-1464-0337-9116</p>
                <p className="bold" style={{ fontSize: '20px' }}>BANCO: STP</p>
                <p className="bold" style={{ fontSize: '20px' }}>NOMBRE: MARTIN SANCHEZ LEYVA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
