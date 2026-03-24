import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ticket.css";

const copyUserName = (userName) => {
  if (!userName) return;
  const [name] = userName.split(" (");
  const uppercaseName = name.trim().toUpperCase();
  navigator.clipboard.writeText(uppercaseName);
  toast.success("Nombre de usuario copiado exitosamente");
};

const exportVerticalPatternAsDoc = (tickets) => {
  const safeTickets = JSON.parse(JSON.stringify(tickets));
  const ticketMap = new Map();
  safeTickets.forEach((ticket) => {
    const number = ticket.ticketNumber.toString().padStart(3, "0");
    const name = ticket.user && ticket.user.trim() !== "" ? ticket.user.split(" (")[0].toUpperCase() : "";
    ticketMap.set(number, name);
  });

  let tableHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset="UTF-8"><style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black; padding: 6px; text-align: center; font-family: Arial; font-size: 13px; }
          th { background-color: #f2f2f2; }
      </style></head>
      <body><h2 style="text-align:center">Lista de Boletos</h2><table>
          <thead><tr><th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th></tr></thead>
          <tbody>`;

  for (let i = 0; i <= 249; i++) {
    const row = [];
    for (let offset = 0; offset <= 750; offset += 250) {
      row.push(`<td>${(i + offset).toString().padStart(3, "0")}</td>`);
    }
    const name = ticketMap.get(i.toString().padStart(3, "0")) || "";
    tableHtml += `<tr>${row.join("")}<td>${name}</td></tr>`;
  }
  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], { type: "application/msword;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_formato_tabla.doc";
  link.click();
};

const exportOnlyAvailableTicketsAsDoc = (tickets) => {
  const safeTickets = JSON.parse(JSON.stringify(tickets));
  const ticketMap = new Map();
  safeTickets.forEach((ticket) => {
    if (ticket.sold === false && (!ticket.user || ticket.user.trim() === "")) {
      ticketMap.set(ticket.ticketNumber.toString().padStart(3, "0"), "");
    }
  });

  let tableHtml = `<html><head><meta charset="UTF-8"><style>
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid black; padding: 4px; text-align: center; font-family: Arial; font-size: 11px; }
  </style></head><body><h2 style="text-align:center">Disponibles</h2><table><tbody>`;

  for (let i = 0; i <= 249; i++) {
    const numStr = i.toString().padStart(3, "0");
    if (ticketMap.has(numStr)) {
      let row = "";
      for (let offset = 0; offset <= 750; offset += 250) {
        row += `<td>${(i + offset).toString().padStart(3, "0")}</td>`;
      }
      tableHtml += `<tr>${row}<td></td></tr>`;
    }
  }
  tableHtml += `</tbody></table></body></html>`;
  const blob = new Blob([tableHtml], { type: "application/msword;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "disponibles.doc";
  link.click();
};

function TicketTable({ tickets, lotteryNo, setStats, stats }) {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => { setRowData(tickets || []); }, [tickets]);

  const onGridReady = (params) => { setGridApi(params.api); };

  const onQuickFilterChanged = () => {
    if (gridApi) gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  const onCellDoubleClicked = (params) => {
    const ticketToUpdate = params.data;
    const field = params.colDef.field;
    if (field !== "sold" && field !== "availability") return;

    fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${!ticketToUpdate[field]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Sold Tickets can not be made available") {
          toast.error(data.message);
          return;
        }
        const updatedData = [...rowData];
        const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticketToUpdate.ticketNumber);
        const updatedTicket = { ...ticketToUpdate };
        updatedTicket[field] = !updatedTicket[field];

        if (field === "sold") {
          updatedTicket.availability = !updatedTicket.sold;
          setStats({ ...stats, soldCount: stats.soldCount + (updatedTicket.sold ? 1 : -1) });
        } else {
          if (updatedTicket.availability) updatedTicket.sold = false;
          setStats({ ...stats, bookedCount: stats.bookedCount + (updatedTicket.availability ? -1 : 1) });
        }
        updatedData[rowIndex] = updatedTicket;
        setRowData(updatedData);
        toast.success("Estado actualizado");
      });
  };

  const columnDefs = [
    { headerName: "Boletos #", field: "ticketNumber", width: 80 },
    { headerName: "Propietario", field: "user", flex: 1 },
    { 
        headerName: "Estado", 
        field: "sold", 
        width: 130,
        cellRenderer: (p) => p.value ? "Pagado" : "No Pagado",
        cellClassRules: { "cell-value-red": (p) => p.value, "cell-value-green": (p) => !p.value }
    },
    { 
        headerName: "Copiar", 
        field: "user", 
        width: 100,
        cellRendererFramework: (p) => (
            <button onClick={() => copyUserName(p.value)} style={{ background: "blue", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Copiar</button>
        ) 
    },
  ];

  // --- LÓGICA DE LA TABLA HTML DIVIDIDA ---
  const handleViewHtmlTable = () => {
    const safeTickets = JSON.parse(JSON.stringify(rowData));
    const ticketMap = new Map();
    safeTickets.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    // Función auxiliar para generar una tabla de un rango
    const generateTableRange = (start, end) => {
      let html = `<table>
        <thead><tr><th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th></tr></thead>
        <tbody>`;
      for (let i = start; i <= end; i++) {
        const baseNum = i.toString().padStart(3, "0");
        html += `<tr>
          <td>${baseNum}</td>
          <td>${(i + 250)}</td>
          <td>${(i + 500)}</td>
          <td>${(i + 750)}</td>
          <td style="text-align:left; padding-left:5px;">${ticketMap.get(baseNum) || ""}</td>
        </tr>`;
      }
      return html + `</tbody></table>`;
    };

    const finalHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 10px; }
            .container { display: flex; gap: 15px; justify-content: center; }
            .column { flex: 1; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #333; padding: 3px; text-align: center; }
            th { background-color: #eee; font-size: 10px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>LISTADO DE BOLETOS - RIFAS CAMPO 30</h2>
          <div class="container">
            <div class="column">${generateTableRange(0, 124)}</div>
            <div class="column">${generateTableRange(125, 249)}</div>
          </div>
        </body>
      </html>`;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(finalHtml);
      newWindow.document.close();
    }
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <input type="text" id="quickFilter" placeholder="Buscar..." onChange={onQuickFilterChanged} style={{ background: "black", color: "white", border: "1px solid #444", padding: "8px" }} />
        
        <button onClick={() => exportVerticalPatternAsDoc(rowData)} style={{ marginLeft: 10, padding: "10px", backgroundColor: "#004aad", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>Descargar Todo (.doc)</button>
        
        <button onClick={() => exportOnlyAvailableTicketsAsDoc(rowData)} style={{ marginLeft: 10, padding: "10px", backgroundColor: "#009933", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>Solo Libres (.doc)</button>
        
        <button onClick={handleViewHtmlTable} style={{ marginLeft: 10, padding: "10px", backgroundColor: "#e68a00", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>Ver Tabla Pantalla Dividida</button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked}
          pagination={true}
          paginationPageSize={100}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default TicketTable;
