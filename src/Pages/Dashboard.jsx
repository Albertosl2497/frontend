import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../Components/Sidebar";
import TicketTable from "../Components/TicketsTable";
import UsersTable from "../Components/UsersTable";
import Modal from "../Components/Modal";

function Dashboard({ handleLogout, lotteryNo }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [totalTickets, setTotalTickets] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    fetch("https://rifasefectivocampotreinta.onrender.com/api/tickets/tickets")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);

        // Cambiamos la estructura de los boletos para mantener "disponible" y "no pagado"
        const newTickets = data.tickets.map((ticket) => ({
          status: "disponible",
          paymentStatus: "no pagado",
        }));
        setTickets(newTickets);
      });
  }, []);

  function generateTickets() {
    if (totalTickets > 0 && totalTickets <= 100000) {
      setShowModal(true);
    }
  }

  function createLottery() {
    setLoading(true);
    fetch("https://rifasefectivocampotreinta.onrender.com/api/tickets/create-lottery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalTickets: totalTickets,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        toast.success("Nuevo sorteo creado");
        window.location.reload();
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error("Error starting lottry.");
      });
  }

  function cancelLottery() {
    setShowModal(false);
  }

  // Función para cambiar el estado de un boleto
  function changeTicketStatus(index, newStatus, newPaymentStatus) {
    const updatedTickets = [...tickets];
    updatedTickets[index].status = newStatus;
    updatedTickets[index].paymentStatus = newPaymentStatus;
    setTickets(updatedTickets);
  }

  return (
    <>
      <div className="dashboard-container">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          handleSidebarToggle={handleSidebarToggle}
          handleLogout={handleLogout}
          setSelectedTickets={setSelectedTickets}
        />
      </div>
      <div
        className={`content ${isSidebarOpen ? "open" : ""}`}
        style={{ height: "100%" }}
      >
        <p className="heading">
          {selectedTickets === 1 ? "Tickets Operations" : "Users"}
        </p>
        <hr />
        <div className="row">
          <input
            type="number"
            style={{
              backgroundColor: "transparent",
              color: "white",
              border: "none",
              width: "30%",
              borderBottom: "1px solid white",
              height: 35,
            }}
            max={100000}
            min={1}
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
          />
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => generateTickets()}
          >
            <h1>Generar Nuevo Sorteo</h1>
          </button>

          <button className="card">
            <p>Total de Boletos Pagados</p>
            <h1>{stats?.soldCount}</h1>
          </button>
          <button className="card">
            <p>Total de Boletos Apartados</p>
            <h1>{stats?.bookedCount}</h1>
          </button>
        </div>
        {selectedTickets === 1 && (
          <div className="row" style={{ height: "100%" }}>
            <TicketTable
              tickets={tickets}
              lotteryNo={lotteryNo}
              setStats={setStats}
              stats={stats}
              changeTicketStatus={changeTicketStatus}
            />
          </div>
        )}
        {selectedTickets === 2 && (
          <div className="row">
            <UsersTable />
          </div>
        )}
      </div>

      <Modal
        show={showModal}
        onClose={cancelLottery}
        onConfirm={createLottery}
        title={"Crear Sorteo"}
        message={"¿Estás seguro de que quieres crear un nuevo sorteo?"}
        loading={loading}
      />
    </>
  );
}

export default Dashboard;
