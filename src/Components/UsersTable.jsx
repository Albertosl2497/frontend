  import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";

function UsersTable() {
  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
const [confirmationSentEmails, setConfirmationSentEmails] = useState([]);


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
    headerName: "Mensaje de Cobro2",
    cellRendererFramework: (params) => {
      return (
        <button onClick={() => sendWhatsAppMessage2(params.data)}
          style={{ backgroundColor: "blue", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
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



  const message = `𝗛𝗢𝗟𝗔 𝗛𝗔𝗦 𝗥𝗘𝗦𝗘𝗥𝗩𝗔𝗗𝗢 ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(", ")} ].
  𝗢𝗣𝗢𝗥𝗧𝗨𝗡𝗜𝗗𝗔𝗗𝗘𝗦 𝗔𝗗𝗜𝗖𝗜𝗢𝗡𝗔𝗟𝗘𝗦: [ ${additionalNumbers} ].
  𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $15,000 PESOS 💸💰
  𝘿𝙀𝙇 𝘿𝙄𝘼: 31 OCTUBRE 2024.
  𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
  𝘾𝙊𝙉 𝘿𝙊𝙈𝙄𝘾𝙄𝙇𝙄𝙊 𝙀𝙉: ${estado}.
  𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇: $${totalPrice} PESOS.
  
  METODOS DE PAGO AQUÍ:
  https://sites.google.com/view/rifasefectivocampotreinta/metodos-de-pago`;
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

    
  const message = `HOLA BUENAS TARDES A LAS 5PM ESTAREMOS PASANDO A COBRAR LO DE LA RIFA DE LOS $15,000 PESOS💸
  ESTARA EN SU CASA PARA LLEGAR DE PASADITA?.☺️🌸
  
  TENEMOS APARTADO ${ticketCount} BOLETO(S) A NOMBRE DE: ${fullName}.
  CON UN PRECIO DE: $${totalPrice} PESOS.
  
  TUS NUMEROS A PARTICIPAR SON:
  [ ${bookedTickets.join(", ")} ][ ${additionalNumbers} ].`
 const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
 
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

    
  const message = `HOLA BUENOS DIAS SOLO PARA INFORMAR QUE LA RIFA DEL LOS $15,000 PESOS ES EL DIA DE MAÑANA. 𝗘𝗦𝗧𝗔𝗥𝗘𝗠𝗢𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗘𝗡𝗗𝗢 𝗟𝗢𝗦 𝗣𝗔𝗚𝗢𝗦 𝗛𝗢𝗬 𝗘𝗡 𝗟𝗔 𝗡𝗢𝗖𝗛𝗘 𝗛𝗔𝗧𝗔𝗦 𝗟𝗔𝗦 𝟵𝗣𝗠.
  𝗦𝗜 𝗚𝗨𝗦𝗧𝗔 𝗤𝗨𝗘 𝗘𝗦𝗣𝗘𝗥𝗘𝗠𝗢𝗦 𝗨𝗡 𝗣𝗢𝗖𝗢 𝗠𝗔𝗦 𝗡𝗢𝗦 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔 𝗣𝗢𝗥𝗙𝗔.
  ‼️𝑫𝑬 𝑵𝑶 𝑹𝑬𝑪𝑰𝑩𝑰𝑹 𝑪𝑶𝑵𝑭𝑰𝑹𝑴𝑨𝑪𝑰𝑶𝑵 𝑫𝑬𝑺𝑷𝑼𝑬𝑺 𝑫𝑬 𝑳𝑨𝑺 9𝑷𝑴 𝑬𝑺𝑻𝑨𝑹𝑬𝑴𝑶𝑺 𝑷𝑨𝑺𝑨𝑵𝑫𝑶 𝑳𝑶𝑺 𝑩𝑶𝑳𝑬𝑻𝑶𝑺 𝑨 𝑳𝑨 𝑽𝑬𝑵𝑻𝑨‼️. GRACIAS.😊🌼`
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
