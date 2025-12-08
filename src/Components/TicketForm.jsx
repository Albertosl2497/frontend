import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import ReactFlagsSelect from "react-flags-select";
import { BsSearch } from "react-icons/bs";
import "./ticket.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function sendWhatsAppMessage(phoneNumber, message) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function TicketForm({ tickets, loading, lotteryNo, setTickets }) {
  const [randomNumber, setRandomNumber] = useState(() =>
    Math.floor(Math.random() * 1000000000)
  );

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);

  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState(" ");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const randomEmail = `rifasefectivocampotreinta${randomNumber}@gmail.com`;
    setEmail(randomEmail);
  }, [randomNumber]);

  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState("MX");
  const [errors, setErrors] = useState({});

  const ticketPrice = 100;
  const totalTickets = selectedTickets.length;
  const totalPrice = totalTickets * ticketPrice;
  const selectedTicketNumbers = selectedTickets.join(", ");

  const selectedTicketNumbersWithPairs = selectedTickets.flatMap((t) => {
    const base = parseInt(t);
    return [base + 250, base + 500, base + 750].map((n) =>
      n.toString().padStart(3, "0")
    );
  });

  // ---------------------------------------------------------
  // SUBMIT FORM
  // ---------------------------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!selectedTickets.length) errors.ticket = "Seleccione al menos un boleto";
    if (!phoneNumber) errors.phoneNumber = "Ingrese su número de teléfono";
    if (!fullName) errors.fullName = "Ingrese su nombre completo";
    if (!state) errors.state = "Ingrese su estado";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const mobNumber =
      phoneNumberCountryCode === "MX" ? `+52${phoneNumber}` : `+1${phoneNumber}`;

    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const formattedTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    try {
      setBtnLoading(true);

      // 1. Check availability
      const checkResp = await fetch(
        `https://rifasefectivocampotreinta.onrender.com/api/tickets/check-availability/${lotteryNo}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketNumbers: selectedTickets }),
        }
      );

      const checkData = await checkResp.json();

      if (!checkResp.ok) {
        const unavailable = checkData.unavailable || [];
        toast.error(`Boletos no disponibles: ${unavailable.join(", ")}`);

        setSelectedTickets(
          selectedTickets.filter((t) => !unavailable.includes(t))
        );
        setBtnLoading(false);
        return;
      }

      // 2. Reserve / Sell tickets
      const sellResp = await fetch(
        `https://rifasefectivocampotreinta.onrender.com/api/tickets/sell-tickets/${lotteryNo}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketNumbers: selectedTickets,
            userInformation: {
              fullName,
              email,
              state,
              city,
              phoneNumber: mobNumber,
            },
          }),
        }
      );

      const sellData = await sellResp.json();

      if (!sellResp.ok) {
        const unavailable = sellData.unavailable || [];
        toast.error(`Se acaban de agotar: ${unavailable.join(", ")}`);

        setSelectedTickets(
          selectedTickets.filter((t) => !unavailable.includes(t))
        );

        if (sellData.availableTickets) {
          setTickets(sellData.availableTickets);
        }

        setBtnLoading(false);
        return;
      }

      // SUCCESS TOAST
      toast.success(
        <>
          <h3 style={{ textAlign: "center", fontWeight: "bold" }}>
            REGISTRO EXITOSO
          </h3>
          <p>
            Has reservado {totalTickets} boleto(s): [{selectedTicketNumbers}]  
            Oportunidades adicionales: [{selectedTicketNumbersWithPairs.join(", ")}]  
            TOTAL A PAGAR: ${totalPrice} pesos.
          </p>

          <button
            className="dialog-button-whatsapp"
            onClick={() =>
              sendWhatsAppMessage(
                `52${phoneNumber}`,
                `HOLA, HAS RESERVADO ${totalTickets} BOLETO(S).  
NÚMEROS: [${selectedTicketNumbers}]  
OPORTUNIDADES: [${selectedTicketNumbersWithPairs.join(", ")}]  
TOTAL A PAGAR: $${totalPrice}  
A NOMBRE DE: ${fullName}  
TEL: ${mobNumber}  
FECHA: ${formattedDate} ${formattedTime}  

PAGOS AQUÍ 👉: https://60s.my.canva.site/cuentas`
              )
            }
          >
            Enviar a WhatsApp
          </button>
        </>,
        { autoClose: false }
      );

      // Reset Form
      setPhoneNumber("");
      setFullName("");
      setState("");
      setCity(" ");
      setSelectedTickets([]);
      setRandomNumber(Math.floor(Math.random() * 1000000000));
      setErrors({});
    } finally {
      setBtnLoading(false);
    }
  };

  // ---------------------------------------------------------
  // TICKET FILTER + PAGINATION
  // ---------------------------------------------------------
  let itemsPerPage = 5000;

  useEffect(() => {
    const filtered = tickets.filter((t) => t.includes(searchQuery));
    const end = itemOffset + itemsPerPage;
    setCurrentItems(filtered.slice(itemOffset, end));
    setPageCount(Math.ceil(filtered.length / itemsPerPage));
  }, [tickets, itemOffset, searchQuery]);

  const handlePageClick = ({ selected }) => {
    setItemOffset(selected * itemsPerPage);
  };

  return (
    <>
      <ToastContainer />

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div className="col flex-start">
          <label className="bold-label">Número de teléfono</label>
          <div className="form-row">
            <ReactFlagsSelect
              selected={phoneNumberCountryCode}
              onSelect={(code) => setPhoneNumberCountryCode(code)}
              countries={["MX", "US"]}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Número"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <label className="bold-label">Nombre completo</label>
          <input
            type="text"
            name="fullName"
            placeholder="Nombre y apellidos"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="bold-label">Estado</label>
          <input
            type="text"
            name="state"
            placeholder="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />

          {/* Email oculto */}
          <input type="hidden" name="email" value={email} readOnly />

          {/* Ciudad oculta */}
          <input type="hidden" name="city" value={city} readOnly />

          <button type="submit" disabled={btnLoading} className="submit-button">
            {btnLoading ? "Procesando..." : "Reservar boletos"}
          </button>
        </div>
      </form>

      {/* Search */}
      <div className="search-box">
        <BsSearch />
        <input
          type="text"
          placeholder="Buscar boleto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Ticket list */}
      <div className="tickets-grid">
        {currentItems.map((ticket) => (
          <div
            key={ticket}
            className={`ticket-item ${
              selectedTickets.includes(ticket) ? "selected" : ""
            }`}
            onClick={() => {
              if (selectedTickets.includes(ticket)) {
                setSelectedTickets(selectedTickets.filter((t) => t !== ticket));
              } else {
                setSelectedTickets([...selectedTickets, ticket]);
              }
            }}
          >
            {ticket}
          </div>
        ))}
      </div>

      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        previousLabel="<"
        onPageChange={handlePageClick}
        pageCount={pageCount}
        containerClassName="pagination"
        activeClassName="active"
      />
    </>
  );
}

export default TicketForm;
