import React from "react";
import Navbar from "../Components/Navbar";
import TicketForm from "../Components/TicketForm";
import Footer from "../Components/Footer";
import "./styles.css";

function MainPageContent() {
  return (
    <div className="hero-banner-container">
      <div className="hero-edition-badge">🏆 GRAN EDICIÓN # 99</div>
      <h1 className="hero-prize">¡LLEVATE $15,000 PESOS!</h1>
      <p className="hero-date">📅 ESTE 26 DE JULIO DE 2026</p>
      
      <div className="hero-price-tag">
        Costo por Boleto <span>$100.00 MXN</span>
      </div>

      <div className="scroll-down-indicator">
        <span>⬇️</span>
        <p>BOLETOS EN LA PARTE DE ABAJO</p>
        <span>⬇️</span>
      </div>
    </div>
  );
}

function StepsToFollow() {
  return (
    <div className="steps-container">
      <h2 className="steps-title">✍️ A CONTINUACIÓN INGRESE SUS DATOS:</h2>
      <hr className="steps-divider" />
    </div>
  );
}

function HomePage({ tickets, loading, lotteryNo, setTickets }) {
  return (
    <div>
      {/* --- ESTILOS INTEGARDOS PARA EL NUEVO DISEÑO PREMIUM --- */}
      <style>{`
        .hero-banner-container {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-top: 5px solid #be123c;
          border-radius: 16px;
          padding: 30px 20px;
          text-align: center;
          color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          margin: 20px auto 30px auto;
          max-width: 950px;
          box-sizing: border-box;
        }
        .hero-edition-badge {
          background: #be123c;
          color: white;
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 15px;
          text-transform: uppercase;
        }
        .hero-prize {
          font-size: clamp(28px, 6vw, 42px);
          font-weight: 900;
          color: #fbbf24; /* Color Dorado */
          margin: 0 0 10px 0;
          text-shadow: 0 4px 10px rgba(0,0,0,0.4);
          line-height: 1.2;
          letter-spacing: -0.5px;
        }
        .hero-date {
          font-size: clamp(16px, 4vw, 20px);
          font-weight: bold;
          color: #cbd5e1;
          margin: 0 0 20px 0;
          letter-spacing: 0.5px;
        }
        .hero-price-tag {
          display: inline-block;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          color: #f8fafc;
        }
        .hero-price-tag span {
          color: #4ade80; /* Color Verde Éxito */
          font-weight: 900;
          font-size: 18px;
          margin-left: 8px;
        }
        .scroll-down-indicator {
          margin-top: 30px;
          background: rgba(226, 29, 72, 0.15);
          border: 1px dashed rgba(226, 29, 72, 0.4);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #fda4af;
          font-weight: 900;
          font-size: 14px;
          animation: bounceDown 2s infinite;
          letter-spacing: 0.5px;
        }
        .scroll-down-indicator p {
          margin: 0;
        }
        @keyframes bounceDown {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
          60% { transform: translateY(-3px); }
        }
        .steps-container {
          text-align: center;
          margin: 10px auto 25px auto;
          max-width: 950px;
          padding: 0 15px;
        }
        .steps-title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .steps-divider {
          border: none;
          height: 3px;
          background: linear-gradient(90deg, transparent, #be123c, transparent);
          width: 50%;
          margin: 12px auto 0 auto;
          opacity: 0.7;
        }
      `}</style>

      <Navbar />
      <div className="post-nav-stuff" style={{ padding: "0 15px" }}>
        <MainPageContent />
        <StepsToFollow />
        <TicketForm
          tickets={tickets}
          loading={loading}
          lotteryNo={lotteryNo}
          setTickets={setTickets}
        />
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
