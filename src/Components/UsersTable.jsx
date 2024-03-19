import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";

function UsersTable() {
  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

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
        <button onClick={() => sendWhatsAppMessage(params.data)}>
          WhatsApp
        </button>
      );
    },
  },
    {
    headerName: "Confirmacion",
    cellRendererFramework: (params) => {
      return (
        <button onClick={() => sendWhatsAppMessageConfirmation(params.data)}>
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
  const ticketCount = bookedTickets.length; // Contar la cantidad de boletos reservados
  const ticketPrice = 10; // Precio por ticket (¡ajusta según tus necesidades!)
  const totalPrice = ticketCount * ticketPrice; // Calcular el precio total
  const ciudad = userData.user.city;
  const estado = userData.user.state;

  const message = `𝙃𝙊𝙇𝘼 𝘾𝙊𝙉𝙁𝙄𝙍𝙈𝘼𝙈𝙊𝙎 𝙎𝙐 𝙍𝙀𝙎𝙀𝙍𝙑𝘼𝘾𝙄𝙊́𝙉 𝘿𝙀 ${ticketCount} 𝙉𝙐́𝙈𝙀𝙍𝙊𝙎: [ ${bookedTickets.join(", ")} ].
  
  𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $40,000 PESOS 💸💰
  𝘿𝙀𝙇 𝘿𝙄𝘼: 10 DE MAYO 2024.
  𝘼𝘿𝙀𝙈𝘼𝙎 𝙐𝙉 𝙋𝙍𝙀𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $10,000 💸💰
  𝙀𝙇 𝘿𝙄𝘼: 30 DE ABRIL
  
  𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀:
  ${fullName}.
  𝘾𝙊𝙉 𝘿𝙊𝙈𝙄𝘾𝙄𝙇𝙄𝙊 𝙀𝙉:
  ${ciudad}, ${estado}.
  𝘾𝙊𝙉 𝙐𝙉 𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇 𝘿𝙀:
  $${totalPrice} 𝙋𝙀𝙎𝙊𝙎.

  𝗙𝗘𝗖𝗛𝗔 𝗟𝗜𝗠𝗜𝗧𝗘 𝗗𝗘 𝗣𝗔𝗚𝗢: DOMINGO 5 DE MAYO

  𝗡𝗢𝗧𝗔: Para poder participar en el presorteo de los $10,000 pesos, 𝙩𝙚𝙣𝙙𝙧𝙖𝙨 𝙦𝙪𝙚 𝙩𝙚𝙣𝙚𝙧 𝙩𝙪𝙨 𝙣𝙪𝙢𝙚𝙧𝙤𝙨 𝙡𝙞𝙦𝙪𝙞𝙙𝙖𝙙𝙤𝙨 antes del dia 30 de Abril. De lo contrario no estaras participando.🍀😊
  
  
  METODOS DE PAGO AQUÍ:
  https://sites.google.com/view/rifasefectivocampotreinta/metodos-de-pago`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};



  const sendWhatsAppMessage = (userData) => {
  const phoneNumber = userData.user.phoneNumber.replace(/\s/g, ""); // Elimina los espacios en blanco del número de teléfono
  const fullName = userData.user.fullName;
  const message = `Hola buen día. Solo para recordarle que el dia de hoy se llevara acabo la rifa de los $3000 Pesos. 𝗘𝘀𝘁𝗮𝗿𝗲𝗺𝗼𝘀 𝗿𝗲𝗰𝗶𝗯𝗶𝗲𝗻𝗱𝗼 𝗹𝗼𝘀 𝗽𝗮𝗴𝗼𝘀 𝗵𝗮𝘀𝘁𝗮 𝗹𝗮𝘀 𝟱𝗣𝗠. GRACIAS😊🌼`;
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
