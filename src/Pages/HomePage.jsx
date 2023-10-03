import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import TicketForm from "../Components/TicketForm";
import Footer from "../Components/Footer";

function HomePage({ tickets, loading, lotteryNo, setTickets }) {
  return (
    <div>
      {/* Navbar */}
      <Navbar />

      <div className="post-nav-stuff">
        {/* Main */}
        <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
  <p className="bold" style={{ fontSize: '24px' }}>GRAN EDICIÓN # 12</p>
  <p className="bold" style={{ fontSize: '24px' }}>ESTE 31 DE OCTUBRE</p>
  <p className="bold" style={{ fontSize: '24px' }}>LLEVATE $20,000 PESOS</p>
  <p style={{ fontSize: '20px' }}>Costo por Boleto $35.00 MXN</p>
  <p className="bold" style={{ fontSize: '20px' }}>Realiza los siguientes pasos:</p>
  <p className="bold" style={{ fontSize: '18px' }}>1.- Llena el formulario con tus datos:</p>
  <p className="bold" style={{ fontSize: '20px' }}>
    - Teléfono. <br />
    - Nombre y apellidos. <br />
    - Estado. <br />
    - Ciudad. <br />
    - Correo Electrónico (Si no cuentas con uno, deja el que te aparece).
  </p>
  <p className="bold" style={{ fontSize: '18px' }}>2.- Selecciona tus Boletos.</p>
  <p className="bold" style={{ fontSize: '18px' }}>3.- Presiona el Botón Verde (Apartar Boletos).</p>
</div>



        {/* Form */}
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
