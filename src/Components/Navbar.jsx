import React from "react";
import Logo from "../Assets/logo.png";
import { FaFacebookF, FaWhatsapp, FaCreditCard } from "react-icons/fa"; // 👈 Importamos los íconos limpios

function Navbar({ onOpenPayments }) {
  return (
    <nav className="custom-navbar">
      <style>{`
        .custom-navbar {
          background: #ffffff;
          padding: 10px 15px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-container-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .nav-brand-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-brand-section img {
          height: 42px;
          width: auto;
        }
        .nav-title-block {
          display: flex;
          flex-direction: column;
        }
        .nav-title-block h1 {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          letter-spacing: -0.3px;
        }
        .nav-buttons-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        /* 🔵🟢🔴 ESTILOS PARA LOS BOTONES CIRCULARES (ÍCONOS) */
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .icon-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .btn-fb { background-color: #1877F2; }
        .btn-wa { background-color: #25D366; }
        .btn-pay { background-color: #be123c; }

        /* 📱 AJUSTES ULTRA COMPACTOS PARA CELULARES */
        @media (max-width: 480px) {
          .custom-navbar {
            padding: 8px 10px;
          }
          .nav-brand-section img {
            height: 34px; /* Logo más pequeño para que no estorbe */
          }
          .nav-title-block h1 {
            font-size: 13px; /* Texto ajustado */
          }
          .icon-btn {
            width: 34px;
            height: 34px;
            font-size: 15px; /* Botones reducidos perfectamente */
          }
          .nav-buttons-group {
            gap: 6px;
          }
        }
      `}</style>

      <div className="nav-container-row">
        {/* Lado Izquierdo: Logo + Título Compacto */}
        <div className="nav-brand-section">
          <img src={Logo} alt="Logo" />
          <div className="nav-title-block">
            <h1 className="bold">RIFAS EFECTIVO</h1>
            <h1 className="bold">CAMPO TREINTA</h1>
          </div>
        </div>

        {/* Lado Derecho: Botones Circulares con Íconos */}
        <div className="nav-buttons-group">
          <a 
            href="https://www.facebook.com" /* 👈 Pon tu link real de FB */
            target="_blank" 
            rel="noopener noreferrer" 
            className="icon-btn btn-fb"
            title="Ir a nuestro Facebook"
          >
            <FaFacebookF />
          </a>
          
          <a 
            href="https://wa.me/526442563616" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="icon-btn btn-wa"
            title="Enviar mensaje por WhatsApp"
          >
            <FaWhatsapp />
          </a>
          
          <button 
            type="button" 
            className="icon-btn btn-pay"
            onClick={onOpenPayments}
            title="Ver Métodos de Pago"
          >
            <FaCreditCard />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
