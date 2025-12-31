import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";

function UsersTable() {
  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
const [confirmationSentEmails, setConfirmationSentEmails] = useState([]);
  const copyPhoneNumber = (phoneNumber) => {
  // Eliminar los espacios del número de teléfono
  const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, '');
  
  // Copiar al portapapeles
  navigator.clipboard.writeText(cleanedPhoneNumber);
  };



  const columnsDef = [
  {
    headerName: "User",
    children: [
      {
        field: "user.fullName",
        headerName: "Full Name",
        sortable: true,
        resizable: true,
      },
    ],
  },
  {
    headerName: "Booked Tickets",
    field: "bookedTickets",
    sortable: true,
    valueGetter: (params) => {
      return params.data.bookedTickets
        .map((ticket) => ticket.ticketNumbers.join(", "))
        .join("\n");
    },
    resizable: true,
  },
  {
    headerName: "Sold Tickets",
    field: "soldTickets",
    sortable: true,
    valueGetter: (params) => {
      return params.data.soldTickets.map((ticket) =>
        ticket.ticketNumbers.join(", ")
      );
    },
    resizable: true,
  },
    {
  headerName: "Copy Phone Number",
  cellRendererFramework: (params) => {
    const phoneNumber = params.data.user.phoneNumber;
    return (
      <button
        onClick={() => copyPhoneNumber(phoneNumber)}
        style={{
          backgroundColor: "green",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Copy Phone
      </button>
    );
  },
},

  {
    headerName: "Mensaje de Cobro",
    cellRendererFramework: (params) => {
      return (
        <button onClick={() => sendWhatsAppMessage(params.data)}
          style={{ backgroundColor: "blue", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
          >
          WhatsApp
        </button>
      );
    },
  },
    {
    headerName: "EFECTIVO",
    cellRendererFramework: (params) => {
      return (
        <button onClick={() => sendWhatsAppMessage2(params.data)}
          style={{ backgroundColor: "red", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
          >
          WhatsApp
        </button>
      );
    },
  },
    {
    headerName: "Confirmacion",
  cellRendererFramework: (params) => {
    const isConfirmationSent = confirmationSentEmails.includes(params.data.user.email);
    const buttonStyle = isConfirmationSent ? { backgroundColor: "gray", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "not-allowed" } : { backgroundColor: "green", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" };

    return (
      <button onClick={() => sendWhatsAppMessageConfirmation(params.data)} style={buttonStyle}>
        WhatsApp
      </button>
      );
    },
  },
    {
  headerName: "Copiar Mensaje",
  cellRendererFramework: (params) => {
    const isConfirmationSent = confirmationSentEmails.includes(params.data.user.email);
    const buttonStyle = isConfirmationSent
      ? {
          backgroundColor: "gray",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "not-allowed",
        }
      : {
          backgroundColor: "orange",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        };

    return (
      <button
        onClick={() => copyConfirmationMessage(params.data)}
        style={buttonStyle}
      >
        Copiar
      </button>
    );
  },
},

  // Las columnas restantes pueden ir aquí según el orden deseado
  // Por ejemplo:
  {
    field: "user.email",
    headerName: "Email",
    sortable: true,
    resizable: true,
  },
  {
    field: "user.phoneNumber",
    headerName: "Phone Number",
    sortable: true,
    resizable: true,
  },
  {
    field: "user.state",
    headerName: "State",
    sortable: true,
    resizable: true,
  },
  {
    field: "user.city",
    headerName: "City",
    sortable: true,
    resizable: true,
  },
];

   const sendWhatsAppMessageConfirmation = (userData) => {
  const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
  const fullName = userData.user.fullName;
  const bookedTickets = userData.bookedTickets.flatMap((ticket) => ticket.ticketNumbers); // Obtener números de boleto planos
  const additionalNumbers = bookedTickets.flatMap(ticket => [parseInt(ticket) + 250, parseInt(ticket) + 500, parseInt(ticket) + 750]); // Obtener números adicionales
  const allTickets = [...bookedTickets]; // Agrupar todos los números de boletos, incluidos los adicionales
  const ticketCount = allTickets.length; // Contar la cantidad total de boletos
  const ticketPrice = 100; // Precio por boleto (¡ajusta según tus necesidades!)
  const totalPrice = ticketCount * ticketPrice; // Calcular el precio total
  const ciudad = userData.user.city;
  const estado = userData.user.state;



  const message = `BUEN DIA PARA RECORDAR QUE EL DIA DE HOY SE LLEVARA ACABO LA RIFA DE LOS $15MIL PESOS💰 *ESTAREMOS RECIBIENDO LOS PAGOS  HASTA LAS 4:30PM*, si necesita que esperemos un poco mas nos confirma porfavor.

TENEMOS APARTADOS ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(
    ", "
  )} ].
OPORTUNIDADES ADICIONALES:
[ ${bookedTickets.join(", ")} ][ ${additionalNumbers} ].

𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇: $${totalPrice} PESOS.

METODOS DE PAGO:
728969000066553833
Banco: Spin by oxxo
NOMBRE: Martin Alberto Sanchez.

Deposito en Oxxo:
2242-1707-6033-2708
  
  `
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
  setConfirmationSentEmails(prevState => [...prevState, userData.user.email]);
};

  



  const sendWhatsAppMessage = (userData) => {
 const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
  const fullName = userData.user.fullName;
  const bookedTickets = userData.bookedTickets.flatMap((ticket) => ticket.ticketNumbers); // Obtener números de boleto planos
  const additionalNumbers = bookedTickets.flatMap(ticket => [parseInt(ticket) + 250, parseInt(ticket) + 500, parseInt(ticket) + 750]); // Obtener números adicionales
  const ticketCount = bookedTickets.length; // Contar la cantidad total de boletos
  const ticketPrice = 100; // Precio por boleto (¡ajusta según tus necesidades!)
  const totalPrice = ticketCount * ticketPrice; // Calcular el precio total
  const ciudad = userData.user.city;
  const estado = userData.user.state;

    
  const message = `Hola buenas tardes, nuestras otras lineas de whatsapp no estan funcionando. si envio algun mensaje o pago. porfavor podria enviarlo a aquí 👇`
 const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
 
};
  const copyConfirmationMessage = (userData) => {
  const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
  const fullName = userData.user.fullName;
  const bookedTickets = userData.bookedTickets.flatMap(
    (ticket) => ticket.ticketNumbers
  );
  const additionalNumbers = bookedTickets.flatMap((ticket) => [
    parseInt(ticket) + 250,
    parseInt(ticket) + 500,
    parseInt(ticket) + 750,
  ]);
  const allTickets = [...bookedTickets];
  const ticketCount = allTickets.length;
  const ticketPrice = 100;
  const totalPrice = ticketCount * ticketPrice;
  const estado = userData.user.state;

  const message = `BUEN DIA PARA RECORDAR QJE EL DIA MARTES SE LLEVARA ACABO LA RIFA DE LOS $20MIL PESOS💰 *ESTAREMOS RECIBIENDO LOS PAGOS  HASTA EL DIA DE MAÑANA A LAS 11PM*.

TENEMOS APARTADOS ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(
    ", "
  )} ].
𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇: $${totalPrice} PESOS.`;

  navigator.clipboard
    .writeText(message)
    .then(() => alert("Mensaje copiado al portapapeles ✅"))
    .catch((err) => console.error("Error al copiar el mensaje:", err));
};

 

  const sendWhatsAppMessage2 = (userData) => {
 const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
  const fullName = userData.user.fullName;
  const bookedTickets = userData.bookedTickets.flatMap((ticket) => ticket.ticketNumbers); // Obtener números de boleto planos
  const additionalNumbers = bookedTickets.flatMap(ticket => [parseInt(ticket) + 250, parseInt(ticket) + 500, parseInt(ticket) + 750]); // Obtener números adicionales
  const ticketCount = bookedTickets.length; // Contar la cantidad total de boletos
  const ticketPrice = 100; // Precio por boleto (¡ajusta según tus necesidades!)
  const totalPrice = ticketCount * ticketPrice; // Calcular el precio total
  const ciudad = userData.user.city;
  const estado = userData.user.state;

    
  const message = `Hola buenas tardes solo para ver si aun le interesan sus boletos para la rifa de los $20mil pesos.☺️✨️
`
 const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
 
};








  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  useEffect(() => {
    const getUsers = async () => {
      fetch("https://rifasefectivocampotreinta.onrender.com/api/users/latest-lottery")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setRowData(data); // do something with the response data
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    };

    getUsers();
  }, []);
  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <input
        type="text"
        id="quickFilter"
        placeholder="Search..."
        onChange={onQuickFilterChanged}
        style={{ backgroundColor: "black", color: "white", border: "none" }}
      />
      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnsDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={100}
          rowSelection={"single"}
          editType={"fullRow"}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default UsersTable;
