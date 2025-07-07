import React from "react";
import Navbar from "../Components/Navbar";
import TicketForm from "../Components/TicketForm";
import Footer from "../Components/Footer";
import "./styles.css";

function MainPageContent() {
  return (
    <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
      <p className="bold" style={{ fontSize: '24px' }}>GRAN EDICIÓN # 74</p>
      <p className="bold" style={{ fontSize: '24px' }}>ESTE 18 DE JULIO</p>
      <p className="bold" style={{ fontSize: '24px' }}>LLEVATE $15,000 PESOS</p>
      <p style={{ fontSize: '20px' }}>(SOLO 250 PARTICIPANTES)</p>
      <p style={{ fontSize: '20px' }}>Cada boleto con 4 oportunidades</p>
      <p style={{ fontSize: '20px' }}>Costo por Boleto $100.00 MXN</p>
      <br />
      
      
      <p className="col arrow down-arrow" style={{ fontSize: '20px' }} >
       
        &#8595; BOLETOS EN LA PARTE DE ABAJO &#8595;
        
      </p>
     <br />
    
    </div>
  );
}


function StepsToFollow() {
  return (
    <div>
      <p className="bold" style={{ fontSize: '22px' }}>A CONTINUACIÓN INGRESE SUS DATOS:</p>
      
      
    </div>
  );
}

function HomePage({ tickets, loading, lotteryNo, setTickets }) {
  return (
    <div>
      <Navbar />
      <div className="post-nav-stuff">
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
