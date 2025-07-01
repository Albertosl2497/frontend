import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "./ticket.css";

// Copiar nombre del usuario
const copyUserName = (userName) => {
  const [name] = userName.split(" (");
  const uppercaseName = name.trim().toUpperCase();
  navigator.clipboard.writeText(uppercaseName);
  toast.success("Nombre de usuario copiado exitosamente");
};

// Exportar lista completa como .doc
const exportAllTicketsAsDoc = (tickets) => {
  const ticketMap = new Map();
  tickets.forEach((ticket) => {
    const number = String(ticket.ticketNumber).padStart(3, "0");
    const name =
      ticket.user && ticket.user.trim() !== ""
        ? ticket.user.split(" (")[0].toUpperCase()
        : "";
    ticketMap.set(number, name);
  });

  let tableHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>Boletos</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 13px;
          }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Lista de Boletos</h2>
        <table>
          <thead>
            <tr><th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th></tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i <= 249; i++) {
    const row = [];
    const baseNumbers = [];
    for (let offset = 0; offset <= 750; offset += 250) {
      const num = i + offset;
      const numberStr = String(num).padStart(3, "0");
      baseNumbers.push(numberStr);
      row.push(`<td>${numberStr}</td>`);
    }
    const name = ticketMap.get(baseNumbers[0]) || "";
    tableHtml += `<tr>${row.join("")}<td>${name}</td></tr>`;
  }

  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], {
    type: "application/msword;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_completos.doc";
  link.click();
  toast.success("Archivo .doc descargado correctamente");
};

// Exportar solo los boletos no vendidos y sin nombre como .html
const exportOnlyAvailableTicketsAsHtml = (tickets) => {
  const ticketMap = new Map();

  tickets.forEach((ticket) => {
    const number = String(ticket.ticketNumber).padStart(3, "0");
    const isUnsold = ticket.sold === false;
    const hasNoName = !ticket.user || ticket.user.trim() === "";
    if (isUnsold && hasNoName) {
      ticketMap.set(number, "");
    }
  });

  let tableHtml = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Boletos No Vendidos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-size: 13px;
          }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Boletos No Vendidos Sin Nombre</h2>
        <table>
          <thead>
            <tr><th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th></tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i <= 249; i++) {
    const row = [];
    const baseNumbers = [];
    for (let offset = 0; offset <= 750; offset += 250) {
      const num = i + offset;
      const numberStr = String(num).padStart(3, "0");
      baseNumbers.push(numberStr);
      row.push(`<td>${numberStr}</td>`);
    }
    if (ticketMap.has(baseNumbers[0])) {
      tableHtml += `<tr>${row.join("")}<td></td></tr>`;
    }
  }

  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], {
    type: "text/html;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_no_vendidos.html";
  link.click();
  toast.success("Archivo .html descargado correctamente");
};

function TicketTable({ tickets, lotteryNo, setStats, stats }) {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => {
    setRowData(tickets || []);
  }, [tickets]);

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  const onCellDoubleClicked = (params) => {
    const ticketToUpdate = params.data;
    const field = params.colDef.field;

    if (field !== "sold" && field !== "availability") return;

    const updateUrl = `https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${!ticketToUpdate[field]}`;

    fetch(updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Sold Tickets can not be made available") {
          toast.error(data.message);
          return;
        }

        const updatedTicket = { ...ticketToUpdate };

        if (field === "sold") {
          updatedTicket.sold = !ticketToUpdate.sold;
          updatedTicket.availability = !updatedTicket.sold;
          setStats({
            ...stats,
            soldCount: stats.soldCount + (updatedTicket.sold ? 1 : -1),
          });
        } else if (field === "availability") {
          updatedTicket.availability = !ticketToUpdate.availability;
          updatedTicket.sold = !updatedTicket.availability;
          setStats({
            ...stats,
            bookedCount: stats.bookedCount + (updatedTicket.availability ? -1 : 1),
          });
        }

        const updatedData = rowData.map((row) =>
          row.ticketNumber === updatedTicket.ticketNumber ? updatedTicket : row
        );
        setRowData(updatedData);

        toast.success("Estado actualizado correctamente");
      })
      .catch(() => toast.error("Error al actualizar"));
  };

  const columnDefs = [
    {
      headerName: "Boleto",
      field: "ticketNumber",
      sortable: true,
      width: 80,
    },
    {
      headerName: "Propietario",
      field: "user",
      flex: 1,
      cellRenderer: (params) => params.value || "(VACÍO)",
    },
    {
      headerName: "Estado",
      field: "sold",
      width: 130,
      cellRenderer: (params) => (params.value ? "Pagado" : "No Pagado"),
    },
    {
      headerName: "Disponibilidad",
      field: "availability",
      width: 150,
      cellRenderer: (params) => (params.value ? "Disponible" : "No Disponible"),
    },
    {
      headerName: "Copiar Usuario",
      field: "user",
      width: 120,
      cellRendererFramework: (params) => (
        <button
          onClick={() => copyUserName(params.value)}
          style={{
            backgroundColor: "blue",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Copiar
        </button>
      ),
    },
  ];

  return (
    <div style={{ width: "100%", marginTop: 20, height: "100%" }}>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          id="quickFilter"
          placeholder="Buscar..."
          onChange={onQuickFilterChanged}
          style={{ backgroundColor: "black", color: "white", border: "none" }}
        />

        <button
          onClick={() => exportAllTicketsAsDoc(rowData)}
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            backgroundColor: "#004aad",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Descargar Tabla (Todos)
        </button>

        <button
          onClick={() => exportOnlyAvailableTicketsAsHtml(rowData)}
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            backgroundColor: "#ff9900",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Descargar HTML (No vendidos)
        </button>
      </div>

      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked}
          pagination={true}
          paginationPageSize={1000}
          rowSelection={"single"}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default TicketTable;
