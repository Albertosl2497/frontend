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

function sendWhatsAppMessage(phoneNumber, message) {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}




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
  const [email, setEmail] = useState(""); // Declaración del estado para el correo electrónico
  
  useEffect(() => {
    const randomEmail = `rifasefectivocampotreinta${randomNumber}@gmail.com`;
    setEmail(randomEmail);
  }, [randomNumber]);
  
  const [phoneNumberCountryCode, setPhoneNumberCountryCode] = useState("MX");
  const [errors, setErrors] = useState({});

  const selectedTicketCount = selectedTickets.length;
  const ticketPrice = 50; // Precio de cada boleto en pesos
  const totalPrice = selectedTicketCount * ticketPrice; // Precio total en pesos
  const selectedTicketNumbers = selectedTickets.join(", ");

 






  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};

    if (selectedTickets.length === 0) {
      errors.ticket = "Please Select Tickets";
    }

    if (!phoneNumber) {
      errors.phoneNumber = "Por favor ingrese su número de teléfono";
    } else if (isNaN(phoneNumber)) {
      errors.phoneNumber = "El número de teléfono debe ser un número";
    }

    if (!fullName) {
      errors.fullName = "Por favor ingrese su nombre completo";
    }

    if (!state) {
      errors.state = "Por favor ingrese su estado";
    }

    if (!city) {
      errors.city = "Por favor ingrese su ciudad";
    }

    if (!email) {
      errors.email = "Por favor ingrese su correo electrónico";
    } else if (!/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i.test(email)) {
      errors.email = "Por favor ingrese un correo electrónico válido";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      // submit the form data
      console.log({
        phoneNumber,
        fullName,
        state,
        city,
        email,
      });

      let mobNumber =
        phoneNumberCountryCode === "MX"
          ? `+52 ${phoneNumber}`
          : `+1 ${phoneNumber}`;
      try {
        setBtnLoading(true);
        
        const response = await fetch(
          `https://rifasefectivocampotreinta.onrender.com/api/tickets/sell-tickets/${lotteryNo}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
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
          const newTickets = tickets.filter(
            (ticket) => !selectedTickets.includes(ticket)
          );
          setTickets(newTickets);

          toast.success(  <>
              <h2 style={{ color: 'blue' }}>BOLETOS VENDIDOS EXITOSAMENTE</h2>
              <p style={{ color: 'brown' }}>HAS RESERVADO {selectedTicketCount} BOLETO(S).</p>
              <p style={{ color: 'brown' }}>LOS NÚMEROS SON: [ {selectedTicketNumbers} ].</p>
              <p style={{ color: 'brown' }}>PARA EL SORTEO DE: $3000 EN EFECTIVO. DEL DÍA 19 DE MARZO DE 2024.</p>
              <p style={{ color: 'brown' }}>EL PRECIO TOTAL ES: ${totalPrice} PESOS.</p>
              <p style={{ color: 'brown' }}>TUS BOLETOS A NOMBRE DE: {fullName}.</p>
              <p style={{ color: 'brown' }}>CON DOMICILIO EN: {city}, {state}</p>
              <p style={{ color: 'brown' }}>TELÉFONO: {mobNumber}.</p>
              <p style={{ color: 'purple' }}>FECHA Y HORA DE REGISTRO: {formattedDate} A LAS {formattedTime} HORAS.</p>
              <p style={{ color: 'black' }}>EL EQUIPO DE RIFAS EFECTIVO CAMPO TREINTA TE AGRADECE. SALUDOS Y MUCHA SUERTE.</p>
            </>, {
          position: toast.POSITION.TOP_CENTER,
          autoClose: false, // Para que no se cierre automáticamente
          hideProgressBar: true, // Para ocultar la barra de progreso
          
        });
      
          const currentDate = new Date();
          const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
          const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
          


sendWhatsAppMessage(
  `52${phoneNumber}`, // Aquí usamos el número de teléfono del cliente
  `HOLA,
  HAS RESERVADO ${selectedTicketCount} BOLETO(S).
  𝘾𝙊𝙉 𝙇𝙊𝙎 𝙉𝙐𝙈𝙀𝙍𝙊𝙎: [ ${selectedTicketNumbers} ].
  𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $3000 EN EFECTIVO. DEL DIA 19 DE MARZO DE 2024.
  
  𝙀𝙇 𝙋𝙍𝙀𝘾𝙄𝙊 𝘼 𝙋𝘼𝙂𝘼𝙍 𝙀𝙎:
  $${totalPrice} 𝗣𝗘𝗦𝗢𝗦.
  𝙏𝙐𝙎 𝘽𝙊𝙇𝙀𝙏𝙊𝙎 𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀:
  ${fullName}.
  𝘾𝙊𝙉 𝘿𝙊𝙈𝙄𝘾𝙄𝙇𝙄𝙊 𝙀𝙉:
  ${city}, ${state}
  𝙏𝙐 𝙉𝙐𝙈𝙀𝙍𝙊 𝘿𝙀 𝙏𝙀𝙇𝙀𝙁𝙊𝙉𝙊 𝙀𝙎:
  ${mobNumber}.
  
  𝗙𝗘𝗖𝗛𝗔 𝗗𝗘 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗢 𝗗𝗘𝗟 𝗕𝗢𝗟𝗘𝗧𝗢: ${formattedDate} ${formattedTime} Horas.

  EL EQUIPO DE RIFAS EFECTIVO CAMPO TREINTA TE AGRADECE. SALUDOS Y MUCHA SUERTE.
  
  METODOS DE PAGO AQUÍ PUEDES VERLOS:
  https://sites.google.com/view/rifasefectivocampotreinta/metodos-de-pago`
);




        }
        
   
        

        // clear the form data
        setPhoneNumber("");
        setFullName("");
        setState("");
        setCity("");
        setEmail("rifasefectivocampotreinta${randomNumber}@gmail.com"); // Deja el campo de correo electrónico en blanco
        setSelectedTickets([]);

        // clear the errors
        setErrors({});
      } catch (error) {
        setErrors({ submit: error.message });
        setBtnLoading(false);
      }

      setBtnLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update individual state variables instead of formData
    switch (name) {
      case "phoneNumber":
        setPhoneNumber(value);
        break;
      case "fullName":
        setFullName(value);
        break;
      case "state":
        setState(value);
        break;
      case "city":
        setCity(value);
        break;
      case "email":
        setEmail(value);
        break;
      default:
        break;
    }

    // Remove error if user has fixed it
    if (errors.hasOwnProperty(name)) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  let itemsPerPage = 1000;

  useEffect(() => {
    if (Array.isArray(tickets)) {
      const endOffset = itemOffset + itemsPerPage;
      const filteredTickets = tickets.filter((ticket) =>
        ticket.includes(searchQuery)
      );
      const items = filteredTickets.slice(itemOffset, endOffset);
      setCurrentItems(items);
      setPageCount(Math.ceil(filteredTickets.length / itemsPerPage));
    } else {
      tickets.then((data) => {
        const endOffset = itemOffset + itemsPerPage;
        const filteredTickets = data.filter((ticket) =>
          ticket.includes(searchQuery)
        );
        const items = filteredTickets.slice(itemOffset, endOffset);
        setCurrentItems(items);
        setPageCount(Math.ceil(filteredTickets.length / itemsPerPage));
      });
    }
  }, [tickets, itemOffset, itemsPerPage, searchQuery]);

  const handlePageClick = ({ selected }) => {
    const offset = selected * itemsPerPage;
    setItemOffset(offset);
  };

  useEffect(() => {
    if (selectedTickets.length > 0) {
      const newErrors = { ...errors };
      delete newErrors["ticket"];
      setErrors(newErrors);
    }
  }, [selectedTickets]);

  return (
    <>
      {Object.keys(errors).length !== 0 && (
        <div className="error-box">
          {Object.keys(errors).length > 0 && (
            <span className="error">{Object.values(errors)[0]}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="col flex-start">
          {/* Country code and number */}
          <label className="bold-label">Numero de telefono</label>
          <div className="form-row">
            <ReactFlagsSelect
              selected={phoneNumberCountryCode}
              onSelect={(code) => setPhoneNumberCountryCode(code)}
              countries={["MX", "US"]}
            ></ReactFlagsSelect>
            <input
              type="number"
              name="phoneNumber"
              placeholder="Numero de telefono"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                setPhoneNumber(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("phoneNumber")) {
                  const newErrors = { ...errors };
                  delete newErrors["phoneNumber"];
                  setErrors(newErrors);
                }
              }}
                style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
            />
          </div>

          {/* Full field */}
          <label className="bold-label">Nombre y apellidos</label>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Ingrese su nombre completo"
              value={fullName}
              onChange={(e) => {
                const value = e.target.value;
                setFullName(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("fullName")) {
                  const newErrors = { ...errors };
                  delete newErrors["fullName"];
                  setErrors(newErrors);
                }
              }}
                style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
            />
          </div>

          {/* Estado */}
          <label className="bold-label">Estado</label>
          <div className="form-row">
            <input
              type="text"
              name="state"
              placeholder="Estado"
              value={state}
              onChange={(e) => {
                const value = e.target.value;
                setState(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("state")) {
                  const newErrors = { ...errors };
                  delete newErrors["state"];
                  setErrors(newErrors);
                }
              }}
              style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
            />
          </div>

          {/* Ciudad */}
          <label className="bold-label">Ciudad</label>
          <div className="form-row">
            <input
              type="text"
              name="city"
              placeholder="Municipio o Ciudad"
              value={city}
              onChange={(e) => {
                const value = e.target.value;
                setCity(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("city")) {
                  const newErrors = { ...errors };
                  delete newErrors["city"];
                  setErrors(newErrors);
                }
              }}
              style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
            />
          </div>

          {/* Full email field */}
          <div className="form-row">
            <input
              type="hidden"
              name="email"
              placeholder="Emailisto"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                // Remove error if user has fixed it
                if (errors.hasOwnProperty("email")) {
                  const newErrors = { ...errors };
                  delete newErrors["email"];
                  setErrors(newErrors);
                }
              }}
              style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
            />
          </div>

          <button className="select-ticket" type="submit">
            {btnLoading ? <ClipLoader color="white" /> : "Apartar boletos"}
          </button>
          <label className="bold-label">Da click en los numeros seleccionados para eliminarlo:</label>
        </div>
      </form>

      <div className="search-bar selected-container">
        {selectedTickets.length > 0 &&
          selectedTickets.map((ticket, index) => (
            <div
              className="selected-ticket"
              onClick={() => {
                const updatedTickets = [...selectedTickets];
                updatedTickets.splice(index, 1);
                setSelectedTickets(updatedTickets);
              }}
            >
              {ticket} <AiOutlineDelete style={{ fontWeight: 900 }} />
            </div>
          ))}
      </div>

      {/* Search bar with button */}
      <div className="row search-bar">
        <input
          type="text"
          placeholder="Buscar tu boleto"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ fontSize: '14px', fontWeight: 'normal', color: 'gray' }}
        />
      </div>

      {/* Show tickets */}
      {loading ? (
        <div
          style={{
            maxWidth: "1100px",
            margin: "50px auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PropagateLoader color="orangered" />
        </div>
      ) : (
        <>
          <div className="ticket-list-container">
            <div className="display-tickets">
              {currentItems.map((ticket, index) => (
                <div
                  key={ticket}
                  className={`ticket ${
                    selectedTickets.includes(ticket) && "selected"
                  }`}
                  onClick={() =>
                    setSelectedTickets(() => {
                      if (selectedTickets.includes(ticket)) {
                        return selectedTickets;
                      } else return [...selectedTickets, ticket];
                    })
                  }
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
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
            previousLabel={pageCount > 1 ? "< previous" : null}
            nextLabel={pageCount > 1 ? "next >" : null}
            renderOnZeroPageCount={null}
          />
        </>
      )}
    </>
    
  );
}

export default TicketForm;
<ToastContainer position="top-center" autoClose={5000} />;

