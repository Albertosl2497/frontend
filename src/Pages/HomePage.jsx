import React from "react";
import Navbar from "../Components/Navbar";
import TicketForm from "../Components/TicketForm";
import Footer from "../Components/Footer";
import "./styles.css";

function MainPageContent() {
  return (
    <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
      <p className="bold" style={{ fontSize: '24px' }}>GRAN EDICIÓN # 27</p>
      <p className="bold" style={{ fontSize: '24px' }}>ESTE 9 DE ENERO</p>
      <p className="bold" style={{ fontSize: '24px' }}>LLEVATE $4000 PESOS</p>
      <p style={{ fontSize: '20px' }}>Costo por Boleto $70.00 MXN</p>
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
      <p className="bold" style={{ fontSize: '22px' }}>REALIZA LOS SIGUIENTES PASOS:</p>
      <p className="bold" style={{ fontSize: '18px' }}>
        PASO 1: Llena el formulario con tus datos:</p>
      <p style={{ fontSize: '16px' }}>
        - Teléfono. <br />
        - Nombre y apellidos. <br />
        - Estado. <br />
        - Ciudad. <br />
      </p>
      <p className="bold" style={{ fontSize: '18px' }}>
        PASO 2: Selecciona tus Boletos.               </p>
      <p className="bold" style={{ fontSize: '18px' }}>
        PASO 3: Presiona el Botón Verde (Apartar Boletos).     </p>
      <p  style={{ fontSize: '16px' }}>
        NOTA: Al presionar en el boton verde (Apartar Boletos), aparecera un mensaje que dice: Tickets Vendidos Exitosamente.</p>
      
      
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
