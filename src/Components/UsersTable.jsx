import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function UsersTable() {
  const [rowData, setRowData] = useState([]);
  const [originalData, setOriginalData] = useState([]); // Guarda la lista completa
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false); // Controla el filtro

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [confirmationSentEmails, setConfirmationSentEmails] = useState([]);

  const copyPhoneNumber = (phoneNumber) => {
    // Eliminar los espacios del número de teléfono
    const cleanedPhoneNumber = phoneNumber.replace(/\s+/g, "");

    // Copiar al portapapeles
    navigator.clipboard.writeText(cleanedPhoneNumber);
    toast.success("Teléfono copiado");
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
          <button
            onClick={() => sendWhatsAppMessage(params.data)}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
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
          <button
            onClick={() => sendWhatsAppMessage2(params.data)}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            WhatsApp
          </button>
        );
      },
    },
    {
      headerName: "Confirmacion",
      cellRendererFramework: (params) => {
        const isConfirmationSent = confirmationSentEmails.includes(
          params.data.user.email
        );
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
              backgroundColor: "green",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            };

        return (
          <button
            onClick={() => sendWhatsAppMessageConfirmation(params.data)}
            style={buttonStyle}
          >
            WhatsApp
          </button>
        );
      },
    },
    {
      headerName: "Copiar Mensaje",
      cellRendererFramework: (params) => {
        const isConfirmationSent = confirmationSentEmails.includes(
          params.data.user.email
        );
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
    
    // Leer precio si existe, o usar 100
    const ticketPrice = Number(localStorage.getItem("lottery_price")) || 100;
    const totalPrice = ticketCount * ticketPrice;
    
    const message = `BUEN DIA PARA RECORDAR QUE EL DIA DE HOY SE LLEVARA ACABO LA RIFA DE LOS $15MIL PESOS💰 *ESTAREMOS RECIBIENDO LOS PAGOS  HASTA LAS 4:30PM*, si necesita que esperemos un poco mas nos confirma porfavor.

TENEMOS APARTADOS ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(", ")} ].

𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇: $${totalPrice} PESOS.

METODOS DE PAGO:
728969000083297389
Banco: Spin Oxxo
Nombre: Maria Ruiz Borquez.

Deposito en Oxxo:
2242-1707-6033-2708
  `;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
    setConfirmationSentEmails((prevState) => [
      ...prevState,
      userData.user.email,
    ]);
  };

  const sendWhatsAppMessage = (userData) => {
    const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
    const message = `Hola buenas tardes, nuestras otras lineas de whatsapp no estan funcionando. si envio algun mensaje o pago. porfavor podria enviarlo a aquí 👇`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const copyConfirmationMessage = (userData) => {
    const fullName = userData.user.fullName;
    const bookedTickets = userData.bookedTickets.flatMap(
      (ticket) => ticket.ticketNumbers
    );
    const allTickets = [...bookedTickets];
    const ticketCount = allTickets.length;
    const ticketPrice = Number(localStorage.getItem("lottery_price")) || 100;
    const totalPrice = ticketCount * ticketPrice;

    const message = `BUEN DIA PARA RECORDAR QJE EL DIA MARTES SE LLEVARA ACABO LA RIFA DE LOS $20MIL PESOS💰 *ESTAREMOS RECIBIENDO LOS PAGOS  HASTA EL DIA DE MAÑANA A LAS 11PM*.

TENEMOS APARTADOS ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(", ")} ].
𝘼 𝙉𝙊𝙈𝘽𝙍𝙀 𝘿𝙀: ${fullName}.
𝙋𝙍𝙀𝘾𝙄𝙊 𝙏𝙊𝙏𝘼𝙇: $${totalPrice} PESOS.`;

    navigator.clipboard
      .writeText(message)
      .then(() => alert("Mensaje copiado al portapapeles ✅"))
      .catch((err) => console.error("Error al copiar el mensaje:", err));
  };

  const sendWhatsAppMessage2 = (userData) => {
    const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
    const message = `Buenas tardes solo para ver si un le interesan sus boletos para la rifa de los *$15mil pesos del dia de hoy* ☺️✨️\n`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  // ⚙️ Alternar el filtro de "No Pagados"
  const handleToggleUnpaid = () => {
    if (showUnpaidOnly) {
      setRowData(originalData);
      setShowUnpaidOnly(false);
    } else {
      const unpaidUsers = originalData.filter(
        (user) => user.bookedTickets && user.bookedTickets.length > 0
      );
      setRowData(unpaidUsers);
      setShowUnpaidOnly(true);
    }
  };

  // 📄 DESCARGAR TABLA DE PENDIENTES EN WORD
  const handleDownloadWord = () => {
    // 1. Filtrar los usuarios que tienen boletos pendientes
    const unpaidUsers = originalData.filter(
      (user) => user.bookedTickets && user.bookedTickets.length > 0
    );

    if (unpaidUsers.length === 0) {
      toast.info("No hay boletos pendientes para exportar.");
      return;
    }

    // 2. Construir la tabla en HTML
    let tableHtml = `
      <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #d1d5db;">
            <th style="padding: 10px; text-align: left;">Nombre del Participante</th>
            <th style="padding: 10px; text-align: center;">Teléfono</th>
            <th style="padding: 10px; text-align: center;">Cantidad</th>
            <th style="padding: 10px; text-align: left;">Boletos Pendientes</th>
          </tr>
        </thead>
        <tbody>
    `;

    unpaidUsers.forEach((user) => {
      const name = user.user?.fullName || "Desconocido";
      const phone = user.user?.phoneNumber || "Sin teléfono";
      const tickets = user.bookedTickets.flatMap((t) => t.ticketNumbers);
      
      tableHtml += `
        <tr>
          <td style="padding: 8px;">${name}</td>
          <td style="padding: 8px; text-align: center;">${phone}</td>
          <td style="padding: 8px; text-align: center;"><b>${tickets.length}</b></td>
          <td style="padding: 8px; font-weight: bold; color: #b91c1c;">${tickets.join(", ")}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;

    // 3. Crear el empaquetado para Word (MIME Type de MS Word)
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Pendientes de Pago</title></head><body>`;
    const footer = "</body></html>";
    const dateStr = new Date().toLocaleDateString('es-MX');
    const sourceHTML = header + `<h2 style='text-align:center; font-family: Arial, sans-serif;'>Reporte de Boletos Pendientes de Pago (${dateStr})</h2>` + tableHtml + footer;

    // 4. Crear y descargar el archivo blob
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Boletos_Pendientes_${dateStr.replace(/\//g, "-")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("✅ Archivo Word descargado exitosamente");
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
          setOriginalData(data); 
          setRowData(data);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    };

    getUsers();
  }, []);

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      {/* ⚙️ CONTENEDOR DE CONTROLES */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          id="quickFilter"
          placeholder="Buscar participante..."
          onChange={onQuickFilterChanged}
          style={{
            backgroundColor: "#1e1e1e",
            color: "white",
            border: "1px solid #444",
            padding: "10px",
            borderRadius: "5px",
            minWidth: "200px"
          }}
        />
        
        {/* BOTÓN PARA FILTRAR NO PAGADOS */}
        <button
          onClick={handleToggleUnpaid}
          style={{
            backgroundColor: showUnpaidOnly ? "#dc2626" : "#f59e0b",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.2s"
          }}
        >
          {showUnpaidOnly ? "❌ Ver Todos los Usuarios" : "⏳ Filtrar: Solo Pendientes"}
        </button>

        {/* 📄 NUEVO BOTÓN PARA DESCARGAR WORD */}
        <button
          onClick={handleDownloadWord}
          style={{
            backgroundColor: "#0284c7",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.2s"
          }}
        >
          📄 Descargar Word (Pendientes)
        </button>
      </div>

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
