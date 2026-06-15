import React from "react";
import Logo from "../Assets/logo.png";

function Navbar({ onOpenPayments }) {
  return (
    <nav className="custom-navbar">
      {/* Estilos premium exclusivos para los componentes del Navbar */}
      <style>{`
        .custom-navbar {
          background: #ffffff;
          padding: 12px 20px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .nav-container-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .nav-brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-brand-section img {
          height: 48px;
          width: auto;
        }
        .nav-title-block h1 {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.25;
        }
        .nav-buttons-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .navbar-btn {
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: bold;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          display: inline-flex;
          align-items: center;
        }
        .navbar-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.08);
        }
        .btn-brand-fb { background-color: #1877F2; }
        .btn-brand-wa { background-color: #25D366; }
        .btn-brand-pay { background-color: #be123c; }
        .btn-brand-pay:hover { background-color: #e11d48; }

        /* Ajustes específicos para celulares */
        @media (max-width: 650px) {
          .nav-container-row {
            justify-content: center;
            text-align: center;
          }
          .nav-brand-section {
            flex-direction: column;
            gap: 6px;
          }
          .nav-buttons-group {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="nav-container-row">
        {/* Lado Izquierdo: Mantenemos tu estructura intacta de Logo + Texto */}
        <div className="nav-brand-section">
          <img src={Logo} alt="Logo" />
          <div className="nav-title-block col">
            <h1 className="bold">RIFAS EFECTIVO</h1>
            <h1 className="bold">CAMPO TREINTA</h1>
          </div>
        </div>

        {/* Lado Derecho: Los nuevos botones integrados */}
        <div className="nav-buttons-group">
          <a 
            href="https://www.facebook.com" /* 👈 Cambia por el link de tu página real */
            target="_blank" 
            rel="noopener noreferrer" 
            className="navbar-btn btn-brand-fb"
          >
            🔵 Facebook
          </a>
          <a 
            href="https://wa.me/526442563616" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="navbar-btn btn-brand-wa"
          >
            🟢 WhatsApp
          </a>
          <button 
            type="button" 
            className="navbar-btn btn-brand-pay"
            onClick={onOpenPayments}
          >
            💳 Métodos de Pago
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
