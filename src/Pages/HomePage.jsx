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
        <div className="col">
          <p className="bold" style={{ fontSize: '24px' }}>GRAN EDICIÓN # 12</p>
          <p className="bold" style={{ fontSize: '24px' }}>ESTE MARTES 31 DE OCTUBRE</p>
          <p className="bold" style={{ fontSize: '24px' }}>LLEVATE $20,000 PESOS EN EFECTIVO</p>
          <p style={{ fontSize: '18px' }}>Costo por Boleto $35.00 MXN</p>
          <p style={{ fontSize: '18px' }}>Selecciona todos los boletos que desees</p>

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
