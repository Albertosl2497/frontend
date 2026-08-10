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
  const [newTicks, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [totalTickets, setTotalTickets] = useState(0);
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⚙️ ESTADO GLOBAL DE OPORTUNIDADES (Persistido en localStorage)
  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem("lottery_opportunities");
    return saved ? Number(saved) : 4;
  });

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Manejador del cambio de oportunidad desde el panel
  const handleOpportunitiesChange = (e) => {
    const newValue = Number(e.target.value);
    setOpportunities(newValue);
    localStorage.setItem("lottery_opportunities", newValue);
    toast.info(`Configuración cambiada a boletera de ${newValue} oportunidad(es)`);
  };

  useEffect(() => {
    fetch("https://rifasefectivocampotreinta.onrender.com/api/tickets/tickets")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setTickets(data.tickets);
        console.log(newTicks);
      })
      .catch((err) => console.error(err));
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
        totalTickets: totalTickets, // Reemplaza con el número total de boletos
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setLoading(false);
        toast.success("Nuevo sorteo creado");
        window.location.reload();
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        toast.error("Error al iniciar la lotería.");
      });
  }

  function cancelLottery() {
    setShowModal(false);
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

        {/* ⚙️ PANEL DE CONFIGURACIÓN DE BOLETERA */}
        <div
          style={{
            margin: "15px 0",
            padding: "15px",
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "450px",
          }}
        >
          <label style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "14px" }}>
            ⚙️ Tipo de Boletera Activa:
          </label>
          <select
            value={opportunities}
            onChange={handleOpportunitiesChange}
            style={{
              padding: "10px",
              borderRadius: "6px",
              backgroundColor: "#0f172a",
              color: "white",
              border: "1px solid #475569",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            <option value={4}>4 Oportunidades (Base + 3 Números Extra)</option>
            <option value={1}>1 Oportunidad (Boleto Sencillo)</option>
          </select>
        </div>

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
              tickets={newTicks}
              lotteryNo={lotteryNo}
              setStats={setStats}
              stats={stats}
              opportunities={opportunities}
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
