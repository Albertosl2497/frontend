import { useEffect, useState } from "react";
import ReactFlagsSelect from "react-flags-select";
import { AiOutlineDelete } from "react-icons/ai";
import { PropagateLoader, ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ticket.css";

function TicketForm({ tickets, loading, lotteryNo, setTickets }) {
  // --- Mantenido estrictamente por funcionalidad del usuario (Punto 4) ---
  const [randomNumber, setRandomNumber] = useState(() => Math.floor(Math.random() * 1000000000));
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const randomEmail = `rifasefectivocampotreinta${randomNumber}@gmail.com`;
    setEmail(randomEmail);
    setCity(" ");
  }, [randomNumber]);
  // -----------------------------------------------------------------------

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");

  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState("MX");
  const [errors, setErrors] = useState({});

  const selectedTicketCount = selectedTickets.length;
  const ticketPrice = 100;
  const totalPrice = selectedTicketCount * ticketPrice;
  const selectedTicketNumbers = selectedTickets.join(", ");

  const selectedTicketNumbersWithPairs = selectedTickets.flatMap((ticket) => {
    const original = parseInt(ticket);
    const pairs = [original + 250, original + 500, original + 750];
    return pairs.map((num) => num.toString().padStart(3, "0"));
  });

  // Filtrado de boletos libres directo y ultra veloz
  const currentItems = Array.isArray(tickets) 
    ? tickets.filter((ticket) => ticket.includes(searchQuery))
    : [];

  // --- 🎲 LUCKY PICKER ---
  const handleSelectRandom = (count) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      toast.warning("No hay boletos disponibles en este momento");
      return;
    }
    const availableNotSelected = tickets.filter(t => !selectedTickets.includes(t));
    
    if (availableNotSelected.length === 0) {
      toast.warning("Todos los boletos disponibles ya están seleccionados");
      return;
    }

    const shuffled = [...availableNotSelected].sort(() => 0.5 - Math.random());
    const toSelect = shuffled.slice(0, Math.min(count, availableNotSelected.length));

    setSelectedTickets([...selectedTickets, ...toSelect]);
    toast.success(`🎲 Se agregaron ${toSelect.length} boleto(s) de la suerte`);
  };

  // Función para copiar al portapapeles
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.info("Texto copiado al portapapeles", { autoClose: 2000 });
    } catch (err) {
      toast.error("Error al copiar al portapapeles");
      console.error("Error al copiar: ", err);
    }
  };

  // --- LÓGICA DE ENVÍO CENTRALIZADA ---
  const procesarApartado = async () => {
    const validationErrors = {};
    if (selectedTickets.length === 0) validationErrors.ticket = "Please Select Tickets";
    if (!phoneNumber) validationErrors.phoneNumber = "Por favor ingrese su número de teléfono";
    else if (isNaN(phoneNumber)) validationErrors.phoneNumber = "El número de teléfono debe ser un número";
    if (!fullName) validationErrors.fullName = "Por favor ingrese su nombre completo";
    if (!state) validationErrors.state = "Por favor ingrese su estado";
    if (!city) validationErrors.city = "Por favor ingrese su ciudad";
    if (!email) {
      validationErrors.email = "Por favor ingrese su correo electrónico";
    } else if (!/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(email)) {
      validationErrors.email = "Por favor ingrese un correo electrónico válido";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      document.getElementById("form-top-anchor")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    let mobNumber = phoneNumberCountryCode === "MX" ? `+52 ${phoneNumber}` : `+1 ${phoneNumber}`;
    try {
      setBtnLoading(true);
      const response = await fetch(
        `https://rifasefectivocampotreinta.onrender.com/api/tickets/sell-tickets/${lotteryNo}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketNumbers: selectedTickets,
            userInformation: {
              fullName: fullName,
              email: email,
              state: state,
              city: city,
              phoneNumber: mobNumber,
            },
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      } else {
        const newTickets = tickets.filter((ticket) => !selectedTickets.includes(ticket));
        setTickets(newTickets);

        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

        const textToCopy = `HOLA, HAS RESERVADO ${selectedTicketCount} BOLETO(S).
𝘾𝙊𝙉 𝙇𝙊𝙎 𝙉𝙐𝙈𝙀𝙍𝙊𝙎:[${selectedTicketNumbers}].
OPORTUNIDADES ADICIONALES:
[ ${selectedTicketNumbersWithPairs.join(", ")} ].
𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $15,000 EN EFECTIVO. DEL *DIA SABADO 20 DE JUNIO DE 2026* .

𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙀𝙇 𝙋𝙍𝙀𝘾𝙄𝙊 𝘼 𝙋𝘼𝙂𝘼𝙍 𝙀𝙎: $${totalPrice} PESOS.      
𝗙𝗘𝗖𝗛𝗔 𝗗𝗘 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 𝗗𝗘𝗟 𝗕𝗢𝗟𝗘𝗧𝗢: ${formattedDate} ${formattedTime} Horas.`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=526442563616&text=${encodeURIComponent(textToCopy)}`;

        // --- 📄 FORMATO DE VENTANA EMERGENTE REDISEÑADO PARA EVITAR SATURACIÓN EN CELULARES ---
        toast.success(
          <>
            <div style={{ padding: "16px 12px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", fontFamily: "Arial, sans-serif", border: "1px solid #e2e8f0", maxWidth: "100%", boxSizing: "border-box" }}>
              
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <span style={{ display: "inline-block", background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  ✓ Proceso Terminado
                </span>
                <h3 style={{ color: "#0f172a", marginTop: "6px", marginBottom: "0", fontSize: "19px", fontWeight: "900", letterSpacing: "-0.5px" }}>
                  REGISTRO EXITOSO
                </h3>
              </div>

              <div style={{ borderTop: "2px dashed #e2e8f0", borderBottom: "2px dashed #e2e8f0", padding: "10px 0", margin: "10px 0" }}>
                
                {/* Ajustado a bloque vertical para que el nombre largo no se empuje con la etiqueta */}
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px", fontSize: "14px", width: "100%" }}>
                  <span style={{ color: "#64748b", fontSize: "12px", marginBottom: "2px" }}>Participante:</span>
                  <span style={{ color: "#0f172a", fontWeight: "bold", fontSize: "15px", wordBreak: "break-word" }}>{fullName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#64748b" }}>Cantidad:</span>
                  <span style={{ color: "#0f172a", fontWeight: "bold" }}>{selectedTicketCount} Boleto(s)</span>
                </div>

                <div style={{ marginBottom: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#64748b", display: "block", fontSize: "12px", marginBottom: "4px" }}>Boletos Base:</span>
                  <span style={{ color: "#b91c1c", fontWeight: "900", fontSize: "16px", background: "#fef2f2", padding: "4px 8px", borderRadius: "6px", display: "inline-block", wordBreak: "break-all" }}>
                    [ {selectedTicketNumbers} ]
                  </span>
                </div>

                {/* Contenedor adaptativo para que la lista de números adicionales no desborde la pantalla */}
                <div style={{ marginBottom: "10px", fontSize: "13px", background: "#f8fafc", padding: "8px", borderRadius: "6px", border: "1px solid #f1f5f9", boxSizing: "border-box" }}>
                  <span style={{ color: "#475569", fontWeight: "bold", display: "block", fontSize: "12px", marginBottom: "2px" }}>Oportunidades Extra:</span>
                  <span style={{ color: "#334155", fontFamily: "monospace", fontSize: "12px", display: "block", wordBreak: "break-word", overflowWrap: "break-word" }}>
                    {selectedTicketNumbersWithPairs.join(", ")}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", marginTop: "10px", paddingTop: "6px", borderTop: "1px solid #f1f5f9", fontSize: "13px" }}>
                  <span style={{ color: "#475569", fontSize: "11px", marginBottom: "1px" }}>Sorteo:</span>
                  <span style={{ color: "#0f172a", fontWeight: "bold" }}>$15,000 en Efectivo (Sáb 20 Jun 2026)</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", background: "#f0fdf4", padding: "8px 10px", borderRadius: "8px" }}>
                  <span style={{ color: "#166534", fontWeight: "bold", fontSize: "14px" }}>Total a Pagar:</span>
                  <span style={{ color: "#15803d", fontWeight: "900", fontSize: "17px" }}>${totalPrice} MXN</span>
                </div>

              </div>

              <p style={{ color: "#64748b", margin: "0 0 12px 0", fontSize: "11px", textAlign: "center", lineHeight: "1.4" }}>
                ¡Gracias por participar! 😊 Presiona el botón verde para enviar los datos por WhatsApp y asegurar tu lugar.
              </p>

              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => copyToClipboard(textToCopy)} 
                  style={{ flex: 1, backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseOver={(e) => e.target.style.background = "#e2e8f0"}
                  onMouseOut={(e) => e.target.style.background = "#f1f5f9"}
                >
                  📋 Copiar Texto
                </button>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ flex: 1, backgroundColor: "#25D366", color: "white", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", padding: "10px 4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 10px rgba(37, 211, 102, 0.2)" }}
                >
                  🟢 WhatsApp
                </a>
              </div>
            </div>
          </>,
          {
            position: toast.POSITION.TOP_CENTER,
            autoClose: false,
            hideProgressBar: true,
          }
        );
      }

      // Limpiar formulario tras éxito
      setPhoneNumber("");
      setFullName("");
      setState("");
      setRandomNumber(Math.floor(Math.random() * 1000000000));
      setSelectedTickets([]);
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();
    procesarApartado();
  };

  useEffect(() => {
    if (selectedTickets.length > 0) {
      const { ticket, ...rest } = errors;
      setErrors(rest);
    }
  }, [selectedTickets]);

  return (
    <>
      <style>{`
        .live-counter-badge {
          background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(190, 18, 60, 0.25);
          animation: badgePulse 2s infinite ease-in-out;
          margin-bottom: 10px;
        }
        @keyframes badgePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); box-shadow: 0 6px 16px rgba(190, 18, 60, 0.4); }
          100% { transform: scale(1); }
        }
        .lucky-picker-container {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        .lucky-btn {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid #334155;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lucky-btn:hover {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(34, 197, 94, 0.2);
        }
        .ticket-stub {
          background: #ffffff !important;
          border: 2px dashed #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 6px !important;
          font-size: 16px !important;
          font-weight: 900 !important;
          color: #0f172a !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04) !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          cursor: pointer;
        }
        .ticket-stub:hover {
          transform: translateY(-3px) scale(1.06);
          border-color: #be123c !important;
          box-shadow: 0 6px 12px rgba(190, 18, 60, 0.15) !important;
          background: #fff5f5 !important;
        }
        .ticket-stub.selected {
          background: linear-gradient(135deg, #be123c 0%, #881337 100%) !important;
          color: #ffffff !important;
          border-style: solid !important;
          border-color: #be123c !important;
          box-shadow: 0 6px 14px rgba(190, 18, 60, 0.35) !important;
        }
        .floating-cart-bar {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 550px;
          background: rgba(15, 23, 42, 0.96);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 12px 24px;
          border-radius: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 99999;
          animation: cartSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes cartSlideUp {
          from { bottom: -80px; opacity: 0; }
          to { bottom: 20px; opacity: 1; }
        }
        .cart-btn-apartar {
          background: #15803d;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          box-shadow: 0 4px 10px rgba(21, 128, 61, 0.3);
        }
        .cart-btn-apartar:hover {
          background: #16a34a;
        }
        .cart-btn-apartar:active {
          transform: scale(0.97);
        }
      `}</style>

      <ToastContainer position="top-center" autoClose={5000} />
      {Object.keys(errors).length !== 0 && (
        <div className="error-box">
          <span className="error">{Object.values(errors)[0]}</span>
        </div>
      )}

      <div id="form-top-anchor"></div>
      
      <form onSubmit={handleSubmitForm}>
        <div className="col flex-start">
          <label className="bold-label">Numero de telefono</label>
          <div className="form-row">
            <ReactFlagsSelect
              selected={phoneNumberCountryCode}
              onSelect={(code) => setPhoneNumberCountryCode(code)}
              countries={["MX", "US"]}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Numero de telefono"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\s/g, ""))}
              style={{ fontSize: "14px", fontWeight: "normal", color: "gray" }}
            />
          </div>

          <label className="bold-label">Nombre y apellidos</label>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Ingrese su nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ fontSize: "14px", fontWeight: "normal", color: "gray" }}
            />
          </div>

          <label className="bold-label">Estado</label>
          <div className="form-row">
            <input
              type="text"
              name="state"
              placeholder="Estado"
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={{ fontSize: "14px", fontWeight: "normal", color: "gray" }}
            />
          </div>

          <button className="select-ticket" type="submit" disabled={btnLoading}>
            {btnLoading ? <ClipLoader color="white" size={20} /> : "Apartar boletos"}
          </button>
        </div>
      </form>

      {selectedTickets.length > 0 && (
        <label className="bold-label" style={{ marginTop: "15px", display: "block" }}>
          Da click en los numeros seleccionados para eliminarlo:
        </label>
      )}

      <div className="search-bar selected-container">
        {selectedTickets.map((ticket, index) => (
          <div
            key={index}
            className="selected-ticket"
            onClick={() => {
              const updatedTickets = [...selectedTickets];
              updatedTickets.splice(index, 1);
              setSelectedTickets(updatedTickets);
            }}
          >
            {ticket} <AiOutlineDelete style={{ fontWeight: 900 }} />
            {[250, 500, 750].map((add) => (
              <span key={add} style={{ fontSize: "10px", marginLeft: "4px" }}>
                ({parseInt(ticket) + add})
              </span>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "25px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
        
        {/* 🔥 1. CONTADOR DE DISPONIBILIDAD EN TIEMPO REAL */}
        {Array.isArray(tickets) && (
          <div className="live-counter-badge">
            🔥 ¡Solo quedan {tickets.length} boletos disponibles!
          </div>
        )}

        <div className="row search-bar" style={{ marginTop: "5px" }}>
          <input
            type="text"
            placeholder="Buscar tu boleto"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{ fontSize: "14px", fontWeight: "normal", color: "gray", width: "100%" }}
          />
        </div>

        {/* 🎲 2. LUCKY PICKER (BOTONES DE SELECCIÓN AL AZAR) */}
        <div className="bold-label" style={{ fontSize: "13px", marginTop: "10px" }}>¿Indeciso? Elige boletos al azar de la suerte:</div>
        <div className="lucky-picker-container">
          <button type="button" className="lucky-btn" onClick={() => handleSelectRandom(1)}>🎲 +1 Al Azar</button>
          <button type="button" className="lucky-btn" onClick={() => handleSelectRandom(3)}>🎲 +3 Al Azar</button>
          <button type="button" className="lucky-btn" onClick={() => handleSelectRandom(5)}>🎲 +5 Al Azar</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "50px" }}>
          <PropagateLoader color="orangered" />
        </div>
      ) : (
        <div className="ticket-list-container">
          <div className="display-tickets">
            {currentItems.map((ticket) => (
              /* 🎟️ 3. DISEÑO DE BOLETO PERFORADO CON ANIMACIÓN */
              <div
                key={ticket}
                className={`ticket ticket-stub ${selectedTickets.includes(ticket) ? "selected" : ""}`}
                onClick={() => {
                  if (!selectedTickets.includes(ticket)) {
                    setSelectedTickets([...selectedTickets, ticket]);
                  }
                }}
              >
                {ticket}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🛒 4. BARRA FLOTANTE CON EL BOTÓN DE APARTAR DIRECTO */}
      {selectedTicketCount > 0 && (
        <div className="floating-cart-bar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#ffffff" }}>
              🎟️ {selectedTicketCount} Seleccionado(s)
            </span>
            <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: "bold" }}>
              Total: ${totalPrice} PESOS
            </span>
          </div>
          <button 
            type="button" 
            className="cart-btn-apartar"
            disabled={btnLoading}
            onClick={procesarApartado}
          >
            {btnLoading ? <ClipLoader color="white" size={16} /> : "⚡ Apartar"}
          </button>
        </div>
      )}
    </>
  );
}

export default TicketForm;
