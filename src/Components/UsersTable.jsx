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
      headerName: "Confirmación",
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
      headerName: "Método de Pago",
      children: [
        {
          headerName: "Efectivo",
          cellRendererFramework: (params) => {
            const isCash = params.data.paymentMethod === "efectivo";
            return (
              <input
                type="checkbox"
                checked={isCash}
                onChange={() => updatePaymentMethod(params.data, "efectivo")}
              />
            );
          },
        },
        {
          headerName: "Transferencia",
          cellRendererFramework: (params) => {
            const isTransfer = params.data.paymentMethod === "transferencia";
            return (
              <input
                type="checkbox"
                checked={isTransfer}
                onChange={() => updatePaymentMethod(params.data, "transferencia")}
              />
            );
          },
        },
      ],
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

  const updatePaymentMethod = (userData, method) => {
    const updatedRowData = rowData.map((user) => {
      if (user.user.email === userData.user.email) {
        return { ...user, paymentMethod: method }; // Actualiza el método de pago
      }
      return user;
    });
    setRowData(updatedRowData);
    localStorage.setItem("userPaymentMethods", JSON.stringify(updatedRowData)); // Guarda el estado
  };

  const sendWhatsAppMessageConfirmation = (userData) => {
    const phoneNumber = userData.user.phoneNumber.replace(/\s/g, "");
    const fullName = userData.user.fullName;
    const bookedTickets = userData.bookedTickets.flatMap((ticket) => ticket.ticketNumbers); // Obtener números de boleto planos
    const additionalNumbers = bookedTickets.flatMap(ticket => [parseInt(ticket) + 250, parseInt(ticket) + 500, parseInt(ticket) + 750]); // Obtener números adicionales
    const allTickets = [...bookedTickets]; // Agrupar todos los números de boletos, incluidos los adicionales
    const ticketCount = allTickets.length; // Contar la cantidad total de boletos
    const ticketPrice = 50; // Precio por boleto (¡ajusta según tus necesidades!)
    const totalPrice = ticketCount * ticketPrice; // Calcular el precio total
    const ciudad = userData.user.city;
    const estado = userData.user.state;
  
  
  
    const message = `𝗛𝗢𝗟𝗔 𝗛𝗔𝗦 𝗥𝗘𝗦𝗘𝗥𝗩𝗔𝗗𝗢 ${ticketCount} 𝗕𝗢𝗟𝗘𝗧𝗢𝗦 CON 𝗟𝗢𝗦 𝗡𝗨𝗠𝗘𝗥𝗢(𝗦): [ ${allTickets.join(", ")} ].
    
    𝙋𝘼𝙍𝘼 𝙀𝙇 𝙎𝙊𝙍𝙏𝙀𝙊 𝘿𝙀: $3000 PESOS 💸💰
    𝘿𝙀𝙇 𝘿𝙄𝘼: 24 DE SEPTIEMBRE 2024.
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
   
       
     const message = `HOLA BUEN DIA SOLO PARA RECORDAR QUE EL DIA DE HOY SE LLEVARA ACABO LA RIFA DE LOS $7000 PESOS💸
     𝗘𝗦𝗧𝗔𝗥𝗘𝗠𝗢𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗘𝗡𝗗𝗢 𝗟𝗢𝗦 𝗣𝗔𝗚𝗢𝗦 𝗛𝗔𝗦𝗧𝗔 𝗟𝗔𝗦 7𝗣𝗠. Si gusta que esperemos un poco mas nos confirma porfa. Gracias😊🌼
     
     TENEMOS APARTADO ${ticketCount} BOLETO(S) A NOMBRE DE: ${fullName}.
     CON UN PRECIO DE: $${totalPrice} PESOS.
     
     TUS NUMEROS A PARTICIPAR SON:
     [ ${bookedTickets.join(", ")} ].`
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
   
       
     const message = `HOLA BUENAS TARDES SOLO PARA INFORMAR QUE LA HORA LIMITE DE PAGO SERA A LAS 5:30PM. Si gusta que esperemos un poco mas nos avisa porfa. GRACIAS😊🌼`
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
      const response = await fetch("https://rifasefectivocampotreinta.onrender.com/api/users/latest-lottery");
      const data = await response.json();

      const storedData = JSON.parse(localStorage.getItem("userPaymentMethods")) || [];
      const combinedData = data.map(user => {
        const storedUser = storedData.find(stored => stored.user.email === user.user.email);
        return { ...user, paymentMethod: storedUser ? storedUser.paymentMethod : null };
      });

      setRowData(combinedData);
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
