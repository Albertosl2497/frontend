import React from "react";
import Navbar from "../Components/Navbar";
import TicketForm from "../Components/TicketForm";
import Footer from "../Components/Footer";
import "./styles.css";

function MainPageContent() {
  return (
    <div className="col" style={{ display: 'flex', flexDirection: 'column' }}>
      <p className="bold" style={{ fontSize: '24px' }}>GRAN EDICIÓN # 13</p>
      <p className="bold" style={{ fontSize: '24px' }}>ESTE 31 DE OCTUBRE</p>
      <p className="bold" style={{ fontSize: '24px' }}>LLEVATE $20,000 PESOS</p>
      <p style={{ fontSize: '20px' }}>Costo por Boleto $35.00 MXN</p>
      <br />
      <div className="extra-paragraph">
      <div className="arrow down-arrow">&#8595;</div>
      <p className="bold white-text" style={{ fontSize: '20px' }} >BOLETOS EN LA PARTE DE ABAJO</p>
      <div className="arrow down-arrow">&#8595;</div>
      </div>
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
        - Correo Electrónico (Si no cuentas con uno, deja el que te aparece).
      </p>
      <p className="bold" style={{ fontSize: '18px' }}>
        PASO 2: Selecciona tus Boletos.               </p>
      <p className="bold" style={{ fontSize: '18px' }}>
        PASO 3: Presiona el Botón Verde (Apartar Boletos).     </p>
      <p  style={{ fontSize: '16px' }}>
        NOTA: Al realizar esta serie de pasos y presionar en (Apartar Boletos) seras redireccionado a Whatsapp,
        Si no fuiste redireccionado a Whatsapp no te preocupes tus boletos ya estan apartados con tus datos.
        Toda tu informacion sera enviada a nuestro correo electronico, nosotros te contactaremos.    </p>
      
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
