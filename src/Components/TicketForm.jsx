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

  // --- 🎲 FUNCIÓN DE SELECCIÓN AL AZAR (LUCKY PICKER) ---
  const handleSelectRandom = (count) => {
    if (!Array.isArray(tickets) || tickets.length === 0) {
      toast.warning("No hay boletos disponibles en este momento");
      return;
    }
    // Filtramos los boletos que están disponibles en la lista pero que el usuario aún no ha seleccionado
    const availableNotSelected = tickets.filter(t => !selectedTickets.includes(t));
    
    if (availableNotSelected.length === 0) {
      toast.warning("Todos los boletos disponibles ya están seleccionados");
      return;
    }

    // Mezclamos el arreglo aleatoriamente y tomamos la cantidad solicitada
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (selectedTickets.length === 0) errors.ticket = "Please Select Tickets";
    if (!phoneNumber) errors.phoneNumber = "Por favor ingrese su número de teléfono";
    else if (isNaN(phoneNumber)) errors.phoneNumber = "El número de teléfono debe ser un número";
    if (!fullName) errors.fullName = "Por favor ingrese su nombre completo";
    if (!state) errors.state = "Por favor ingrese su estado";
    if (!city) errors.city = "Por favor ingrese su ciudad";
    if (!email) {
      errors.email = "Por favor ingrese su correo electrónico";
    } else if (!/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(email)) {
      errors.email = "Por favor ingrese un correo electrónico válido";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
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

          toast.success(
            <>
              <div style={{ padding: "20px", backgroundColor: "#f2f2f2", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
                  "REGISTRO EXITOSO"
                </h3>
                <hr style={{ border: "1px solid #ccc", marginBottom: "20px" }} />
                <p style={{ color: "#555", marginBottom: "3px", fontSize: "14px", fontWeight: "bold" }}>
                  HOLA, HAS RESERVADO {selectedTicketCount} BOLETO(S).
                  <br />
                  𝘾𝙊𝙉 𝙇𝙊𝙎 𝙉𝙐𝙈𝙀𝙍𝙊𝙎:[{selectedTicketNumbers}].
                  <br />
                  OPORTUNIDADES ADICIONALES:
                  <br />
                  [ {selectedTicketNumbersWithPairs.join(", ")} ].
                  <br />
                  𝗣𝗔𝗥𝗔 𝗘𝗟 𝗦𝗢𝗥𝗧𝗘𝗢 𝗗𝗘:
                  <br />
                  $15,000 PESOS EN EFECTIVO.
                  <br />
                  𝗗𝗘𝗟 𝗗𝗜𝗔: *SABADO 20 DE JUNIO DE 2026* .
                  <br />
                  **NOMBRE:**
                  <br />
                  {fullName}.
                  <br />
                  𝗣𝗥𝗘𝗖𝗜𝗢 𝗧𝗢𝗧𝗔𝗟: ${totalPrice} PESOS.
                </p>
                <p style={{ color: "#555", marginBottom: "3px", fontSize: "10px", fontWeight: "bold" }}>
                  Gracias por participar.🍀😊 Haz clic abajo para copiar la información o enviarla directamente por WhatsApp.
                </p>
              </div>
              <div className="button-container" style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                <button onClick={() => copyToClipboard(textToCopy)} className="dialog-button-whatsapp" style={{ backgroundColor: "#007bff", flex: 1 }}>
                  Copiar Información
                </button>
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="dialog-button-whatsapp" 
                  style={{ backgroundColor: "#25D366", color: "white", textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", padding: "6px 12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", flex: 1 }}
                >
                  Enviar a WhatsApp
                </a>
              </div>
            </>,
            {
              position: toast.POSITION.TOP_CENTER,
              autoClose: false,
              hideProgressBar: true,
            }
          );
        }

        // Limpiar formulario
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
    }
  };

  useEffect(() => {
    if (selectedTickets.length > 0) {
      const { ticket, ...rest } = errors;
      setErrors(rest);
    }
  }, [selectedTickets]);

  return (
    <>
      {/* --- INYECCIÓN DE ESTILOS CSS INTELIGENTES PARA LAS NUEVAS MEJORAS VISUALES --- */}
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
        .cart-btn-scroll {
          background: #be123c;
          color: white;
          border: none;
          padding: 7px 14px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cart-btn-scroll:hover {
          background: #e11d48;
        }
      `}</style>

      <ToastContainer position="top-center" autoClose={5000} />
      {Object.keys(errors).length !== 0 && (
        <div className="error-box">
          <span className="error">{Object.values(errors)[0]}</span>
        </div>
      )}

      {/* ELEMENTO CENTRALIZADO DEL FORMULARIO */}
      <div id="form-top-anchor"></div>
      <form onSubmit={handleSubmit}>
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

          <button className="select-ticket" type="submit">
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

      {/* --- SECCIÓN DISPONIBILIDAD, BUSCADOR Y LUCKY PICKER --- */}
      <div style={{ marginTop: "25px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
        
        {/* 🔥 1. CONTADOR EN TIEMPO REAL */}
        {Array.isArray(tickets) && (
          <div className="live-counter-badge">
            🔥 ¡Solo quedan {tickets.length} boletos disponibles!
          </div>
        )}

        <div className="row search-bar" style={{ marginTop: "5px" }}>
          <input
            type="text"
            placeholder="Buscar tu boleto libre..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{ fontSize: "14px", fontWeight: "normal", color: "gray", width: "100%" }}
          />
        </div>

        {/* 🎲 2. BOTONES DEL LUCKY PICKER */}
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
              /* 🎟️ 3. DISEÑO DE BOLETO TIPO TALONARIO CON CLASE DINÁMICA ANIMADA */
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

      {/* 🛒 4. BARRA FLOTANTE DE RESUMEN (ESTILO CARRITO DE COMPRAS) */}
      {selectedTicketCount > 0 && (
        <div className="floating-cart-bar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "15px", fontWeight: "bold", color: "#ffffff" }}>
              🎟️ {selectedTicketCount} Boleto(s) Seleccionado(s)
            </span>
            <span style={{ fontSize: "13px", color: "#10b981", fontWeight: "bold" }}>
              Total: ${totalPrice} PESOS
            </span>
          </div>
          <button 
            type="button" 
            className="cart-btn-scroll"
            onClick={() => {
              document.getElementById("form-top-anchor")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            ✍️ Subir a Apartar
          </button>
        </div>
      )}
    </>
  );
}

export default TicketForm;
