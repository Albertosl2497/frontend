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

  // ⚙️ ESTADOS GLOBALES DE CONFIGURACIÓN (Persistidos en localStorage)
  const [opportunities, setOpportunities] = useState(() => {
    const saved = localStorage.getItem("lottery_opportunities");
    return saved ? Number(saved) : 4;
  });
  const [prize, setPrize] = useState(() => {
    return localStorage.getItem("lottery_prize") || "$15,000 en Efectivo";
  });
  const [lotteryDate, setLotteryDate] = useState(() => {
    return localStorage.getItem("lottery_date") || "Dom 09 Agosto 2026";
  });
  const [ticketPrice, setTicketPrice] = useState(() => {
    const saved = localStorage.getItem("lottery_price");
    return saved ? Number(saved) : 100;
  });

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Manejadores de cambios
  const handleOpportunitiesChange = (e) => {
    const newValue = Number(e.target.value);
    setOpportunities(newValue);
    localStorage.setItem("lottery_opportunities", newValue);
    toast.info(`Boletera cambiada a ${newValue} oportunidad(es)`);
  };

  const handlePrizeChange = (e) => {
    setPrize(e.target.value);
    localStorage.setItem("lottery_prize", e.target.value);
  };

  const handleDateChange = (e) => {
    setLotteryDate(e.target.value);
    localStorage.setItem("lottery_date", e.target.value);
  };

  const handlePriceChange = (e) => {
    const newValue = Number(e.target.value);
    setTicketPrice(newValue);
    localStorage.setItem("lottery_price", newValue);
  };

  useEffect(() => {
    fetch("https://rifasefectivocampotreinta.onrender.com/api/tickets/tickets")
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setTickets(data.tickets);
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
          {selectedTickets === 1 ? "Panel de Operaciones" : "Usuarios"}
        </p>
        <hr />

        {/* ⚙️ PANEL DE CONFIGURACIÓN GENERAL */}
        <div
          style={{
            margin: "15px 0",
            padding: "20px",
            backgroundColor: "#1e293b",
            borderRadius: "10px",
            border: "1px solid #334155",
            maxWidth: "800px",
          }}
        >
          <h3 style={{ color: "#f8fafc", marginTop: 0, marginBottom: "15px", fontSize: "16px" }}>
            ⚙️ Configuración del Sorteo Activo
          </h3>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
            
            {/* OPORTUNIDADES */}
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 200px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>TIPO DE BOLETERA:</label>
              <select
                value={opportunities}
                onChange={handleOpportunitiesChange}
                style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#0f172a", color: "white", border: "1px solid #475569" }}
              >
                <option value={4}>4 Oportunidades</option>
                <option value={1}>1 Oportunidad</option>
              </select>
            </div>

            {/* PREMIO */}
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 200px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>PREMIO (Ej: $15,000 en Efectivo):</label>
              <input
                type="text"
                value={prize}
                onChange={handlePrizeChange}
                style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#0f172a", color: "white", border: "1px solid #475569" }}
              />
            </div>

            {/* FECHA */}
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 200px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>FECHA DEL SORTEO:</label>
              <input
                type="text"
                value={lotteryDate}
                onChange={handleDateChange}
                style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#0f172a", color: "white", border: "1px solid #475569" }}
              />
            </div>

            {/* PRECIO */}
            <div style={{ display: "flex", flexDirection: "column", flex: "1 1 100px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>PRECIO ($):</label>
              <input
                type="number"
                value={ticketPrice}
                onChange={handlePriceChange}
                style={{ padding: "8px", borderRadius: "6px", backgroundColor: "#0f172a", color: "white", border: "1px solid #475569" }}
              />
            </div>

          </div>
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
            placeholder="Cantidad de boletos para nuevo sorteo..."
          />
        </div>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button
            className="card"
            style={{ display: "flex", flexDirection: "column" }}
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
