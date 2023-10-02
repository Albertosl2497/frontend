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
          <p className="bold">GRAN EDICIÓN # {lotteryNo}</p>
          <p>Selecciona todos lo boletos que desees</p>
          {/* <p className="bold">$ 0.00 MXN</p> */}
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
