import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "./ticket.css";

// Genera tabla Word con formato 000/250/500/750 + columna de nombre
const exportVerticalPatternAsDoc = (tickets) => {
  const ticketMap = new Map();

  // Mapeamos nombres por número
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
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Lista de Boletos</h2>
        <table>
          <thead>
            <tr>
              <th>000</th>
              <th>250</th>
              <th>500</th>
              <th>750</th>
              <th>NOMBRE</th>
            </tr>
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

    // Usamos el nombre del ticket base (ej. 000)
    const name = ticketMap.get(baseNumbers[0]) || "";

    tableHtml += `<tr>${row.join("")}<td>${name}</td></tr>`;
  }

  tableHtml += `
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([tableHtml], {
    type: "application/msword;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_formato_tabla.doc";
  link.click();

  toast.success("Archivo .doc descargado correctamente");
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
          onClick={() => exportVerticalPatternAsDoc(rowData)}
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
          Descargar Tabla en Word (.doc)
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
