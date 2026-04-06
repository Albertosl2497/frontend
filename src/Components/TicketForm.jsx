import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import ReactFlagsSelect from "react-flags-select";
import { BsSearch } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import "./ticket.css";
import { PropagateLoader, ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";

function TicketForm({ tickets, loading, lotteryNo, setTickets }) {
  const [randomNumber, setRandomNumber] = useState(() => Math.floor(Math.random() * 1000000000));
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const randomEmail = `rifasefectivocampotreinta${randomNumber}@gmail.com`;
    setEmail(randomEmail);
    setCity(" ");
  }, [randomNumber]);

  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState("MX");
  const [errors, setErrors] = useState({});

  const selectedTicketCount = selectedTickets.length;
  const totalTickets = selectedTicketCount;
  const ticketPrice = 100;
  const totalPrice = selectedTicketCount * ticketPrice;
  const selectedTicketNumbers = selectedTickets.join(", ");

  const selectedTicketNumbersWithPairs = selectedTickets.flatMap((ticket) => {
    const original = parseInt(ticket);
    const pairs = [original + 250, original + 500, original + 750];
    return pairs.map((num) => num.toString().padStart(3, "0"));
  });

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
          const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

          // Texto que se va a copiar
          const textToCopy = `HOLA, HAS RESERVADO ${totalTickets} BOLETO(S).
𝘾𝙊𝙉 𝙇𝙊𝙎 𝙉𝙐𝙈𝙀𝙍𝙊𝙎:[${selectedTicketNumbers}].
OPORTUNIDADES ADICIONALES:
[ ${selectedTicketNumbersWithPairs.join(", ")} ].
𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $15,000 EN EFECTIVO. DEL DIA 19 DE ABRIL DE 2026 DE 2026.

𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙀𝙇 𝙋𝙍𝙀𝘾𝙄𝙊 𝘼 𝙋𝘼𝙂𝘼𝙍 𝙀𝙎: $${totalPrice} PESOS.      
𝗙𝗘𝗖𝗛𝗔 𝗗𝗘 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 𝗗𝗘𝗟 𝗕𝗢𝗟𝗘𝗧𝗢: ${formattedDate} ${formattedTime} Horas.`;

          toast.success(
            <>
              <div style={{ padding: "20px", backgroundColor: "#f2f2f2", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
                <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
                  "REGISTRO EXITOSO"
                </h3>
                <hr style={{ border: "1px solid #ccc", marginBottom: "20px" }} />
                <p style={{ color: "#555", marginBottom: "3px", fontSize: "14px", fontWeight: "bold" }}>
                  HOLA, HAS RESERVADO {totalTickets} BOLETO(S).
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
                  𝗗𝗘𝗟 𝗗𝗜𝗔: 19 DE ABRIL DE 2026.
                  <br />
                  𝗡𝗢𝗠𝗕𝗥𝗘:
                  <br />
                  {fullName}.
                  <br />
                  𝗣𝗥𝗘𝗖𝗜𝗢 𝗧𝗢𝗧𝗔𝗟: ${totalPrice} PESOS.
                </p>
                <p style={{ color: "#555", marginBottom: "3px", fontSize: "10px", fontWeight: "bold" }}>
                  Gracias por participar.🍀😊 Haz clic abajo para copiar la información y enviarla.
                </p>
              </div>
              <div className="button-container" style={{ marginTop: "10px" }}>
                <button onClick={() => copyToClipboard(textToCopy)} className="dialog-button-whatsapp" style={{ backgroundColor: "#007bff" }}>
                  Copiar Información
                </button>
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
        setCity(" ");
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

  const handlePageClick = ({ selected }) => {
    const offset = selected * itemsPerPage;
    setItemOffset(offset);
  };

  let itemsPerPage = 5000;

  useEffect(() => {
    if (Array.isArray(tickets)) {
      const endOffset = itemOffset + itemsPerPage;
      const filteredTickets = tickets.filter((ticket) => ticket.includes(searchQuery));
      setCurrentItems(filteredTickets.slice(itemOffset, endOffset));
      setPageCount(Math.ceil(filteredTickets.length / itemsPerPage));
    }
  }, [tickets, itemOffset, itemsPerPage, searchQuery]);

  useEffect(() => {
    if (selectedTickets.length > 0) {
      const { ticket, ...rest } = errors;
      setErrors(rest);
    }
  }, [selectedTickets]);

  return (
    <>
      <ToastContainer position="top-center" autoClose={5000} />
      {Object.keys(errors).length !== 0 && (
        <div className="error-box">
          <span className="error">{Object.values(errors)[0]}</span>
        </div>
      )}

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
          <label className="bold-label">Da click en los numeros seleccionados para eliminarlo:</label>
        </div>
      </form>

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

      <div className="row search-bar">
        <input
          type="text"
          placeholder="Buscar tu boleto"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ fontSize: "14px", fontWeight: "normal", color: "gray" }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "50px" }}>
          <PropagateLoader color="orangered" />
        </div>
      ) : (
        <>
          <div className="ticket-list-container">
            <div className="display-tickets">
              {currentItems.map((ticket) => (
                <div
                  key={ticket}
                  className={`ticket ${selectedTickets.includes(ticket) ? "selected" : ""}`}
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

          <ReactPaginate
            breakLabel="..."
            onPageChange={handlePageClick}
            pageCount={pageCount}
            containerClassName="pagination"
            activeClassName="active"
            previousLabel={pageCount > 1 ? "< previous" : null}
            nextLabel={pageCount > 1 ? "next >" : null}
          />
        </>
      )}
    </>
  );
}

export default TicketForm;
