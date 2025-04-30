import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "./ticket.css";

// Función para exportar los boletos a HTML formateado
const exportTicketsToHTML = (tickets) => {
  const sortedTickets = [...tickets].sort((a, b) => a.ticketNumber - b.ticketNumber);

  let tableHtml = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 8px; text-align: center; font-family: Arial; font-size: 14px; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>NÚMEROS</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i < sortedTickets.length; i += 4) {
    tableHtml += "<tr>";
    for (let j = 0; j < 4; j++) {
      const ticket = sortedTickets[i + j];
      if (ticket) {
        const number = String(ticket.ticketNumber).padStart(3, "0");
        const name =
          ticket.user && ticket.user.trim() !== ""
            ? ticket.user.split(" (")[0].toUpperCase()
            : "(VACÍO)";
        tableHtml += `<td><strong>${number}</strong><br/>${name}</td>`;
      } else {
        tableHtml += "<td></td>";
      }
    }
    tableHtml += "</tr>";
  }

  tableHtml += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: "text/html;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos.html";
  link.click();

  toast.success("Tabla HTML descargada correctamente");
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

  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 100 },
    {
      headerName: "Propietario",
      field: "user",
      flex: 1,
      cellRenderer: (params) =>
        params.value?.split(" (")[0]?.toUpperCase() || "(VACÍO)",
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
      cellRenderer: (params) =>
        params.value ? "Disponible" : "No Disponible",
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
          onClick={() => exportTicketsToHTML(rowData)}
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Descargar Tabla HTML
        </button>
      </div>

      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
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
