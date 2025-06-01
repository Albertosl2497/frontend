import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "./ticket.css";

const exportVerticalPatternAsDoc = (tickets) => {
  const ticketMap = new Map();

  tickets.forEach((ticket) => {
    const number = String(ticket.ticketNumber).padStart(3, "0");
    const name =
      ticket.user && ticket.user.trim() !== ""
        ? ticket.user.split(" (")[0].toUpperCase()
        : "";
    ticketMap.set(number, name);
  });

  const generateTable = (start, end) => {
    let rows = "";
    for (let i = start; i <= end; i++) {
      const row = [];
      const baseNumbers = [];

      for (let offset = 0; offset <= 750; offset += 250) {
        const num = i + offset;
        const numberStr = String(num).padStart(3, "0");
        baseNumbers.push(numberStr);
        row.push(`<td>${numberStr}</td>`);
      }

      const name = ticketMap.get(baseNumbers[0]) || "";
      rows += `<tr>${row.join("")}<td>${name}</td></tr>`;
    }
    return `
      <table class="boletos">
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
          ${rows}
        </tbody>
      </table>
      <br/>
    `;
  };

  let allTables = "";
  for (let group = 0; group < 250; group += 50) {
    allTables += generateTable(group, group + 49);
    if (group + 50 < 250) {
      allTables += `<div class="page-break"></div>`;
    }
  }

  const docContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>Boletos Formato Legal</title>
        <style>
          @page {
            size: 14in 8.5in;
            margin: 20px;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 13px;
            color: #222;
            margin: 0;
            padding: 0;
          }
          h2 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 10px;
          }
          table.boletos {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th {
            background-color: #004aad;
            color: white;
            padding: 6px;
            border: 1px solid #ccc;
            font-weight: bold;
            text-align: center;
          }
          td {
            border: 1px solid #ccc;
            padding: 5px;
            text-align: center;
            height: 25px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <h2>LISTA DE BOLETOS</h2>
        ${allTables}
      </body>
    </html>
  `;

  const blob = new Blob([docContent], {
    type: "application/msword;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_formato_legal.doc";
  link.click();

  toast.success("Documento Word descargado correctamente");
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
          style={{
            backgroundColor: "black",
            color: "white",
            border: "none",
            padding: "5px",
          }}
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
          Descargar en Word (.doc)
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
