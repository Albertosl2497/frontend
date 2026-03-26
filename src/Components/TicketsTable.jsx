import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineCopy } from "react-icons/ai";
import "./ticket.css";

const copyUserName = (userName) => {
  if (!userName) {
    toast.warning("No hay un nombre para copiar");
    return;
  }
  const [name] = userName.split(" (");
  const uppercaseName = name.trim().toUpperCase();
  navigator.clipboard.writeText(uppercaseName);
  toast.success(`Copiado: ${uppercaseName}`);
};

function TicketTable({ tickets, lotteryNo, setStats, stats }) {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => {
    setRowData(tickets || []);
  }, [tickets]);

  const onGridReady = (params) => { setGridApi(params.api); };

  const onQuickFilterChanged = () => {
    if (gridApi) {
      gridApi.setQuickFilter(document.getElementById("quickFilter").value);
    }
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
        toast.success("Estado actualizado con éxito");
      })
      .catch(() => toast.error("Error al conectar con el servidor"));
  };

  // --- LÓGICA DE GENERACIÓN DE TABLAS PARA FOTOS ---
  const handleGenerateTable = (soloDisponibles = false) => {
    const availableTickets = rowData.filter(t => !t.user || t.user.trim() === "");
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const renderTableHtml = (list) => {
      let rows = list.map(t => {
        const i = t.ticketNumber;
        const b = i.toString().padStart(3, "0");
        const name = ticketMap.get(b) || "";
        const rowClass = name ? 'sold-row' : '';
        return `<tr class="${rowClass}">
          <td class="base-num">${b}</td>
          <td>${i + 250}</td><td>${i + 500}</td><td>${i + 750}</td>
          <td class="name-td">${name}</td>
        </tr>`;
      }).join("");

      return `<table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${rows}</tbody></table>`;
    };

    let contentHtml = "";

    if (soloDisponibles) {
      if (availableTickets.length <= 100) {
        // Una sola tabla centrada
        contentHtml = `<div class="page"><h2 class="table-title">BOLETOS DISPONIBLES</h2><div style="max-width:600px; margin:auto;">${renderTableHtml(availableTickets)}</div></div>`;
      } else {
        // Dos tablas divididas
        const half = Math.ceil(availableTickets.length / 2);
        const firstHalf = availableTickets.slice(0, half);
        const secondHalf = availableTickets.slice(half);
        contentHtml = `
          <div class="page">
            <h2 class="table-title">BOLETOS DISPONIBLES</h2>
            <div class="split">
              <div class="col">${renderTableHtml(firstHalf)}</div>
              <div class="col">${renderTableHtml(secondHalf)}</div>
            </div>
          </div>`;
      }
    } else {
      // Formato original de 3 páginas (Todos)
      const renderRange = (s, e) => {
        let list = rowData.filter(t => t.ticketNumber >= s && t.ticketNumber <= e);
        return renderTableHtml(list);
      };
      contentHtml = `
        <div class="page"><h2 class="table-title">FOLIOS 000 AL 099</h2><div class="split"><div class="col">${renderRange(0, 49)}</div><div class="col">${renderRange(50, 99)}</div></div></div>
        <div class="page"><h2 class="table-title">FOLIOS 100 AL 199</h2><div class="split"><div class="col">${renderRange(100, 149)}</div><div class="col">${renderRange(150, 199)}</div></div></div>
        <div class="page"><h2 class="table-title">FOLIOS 200 AL 249</h2><div style="max-width:500px; margin:auto;">${renderRange(200, 249)}</div></div>`;
    }

    const finalHtml = `
      <html>
        <head>
          <style>
            body { font-family: 'Arial Narrow', Arial; padding: 10px; }
            .page { border: 3px solid #be123c; padding: 15px; margin-bottom: 25px; border-radius: 10px; max-width: 1000px; margin: auto; page-break-after: always; }
            .header { text-align: center; color: #be123c; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 24px; }
            .split { display: flex; gap: 15px; }
            .col { flex: 1; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 3px; text-align: center; }
            th { background: #f2f2f2; }
            .base-num { font-weight: bold; }
            .name-td { text-align: left; padding-left: 5px; font-weight: bold; min-width: 100px; }
            .sold-row td { background-color: #fff9c4 !important; }
            h2.table-title { background: #be123c; color: white; text-align: center; font-size: 16px; margin: 0 0 10px 0; padding: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RIFAS EFECTIVO CAMPO TREINTA</h1>
            <p>WHATSAPP: 6441382876</p>
          </div>
          ${contentHtml}
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input 
          type="text" id="quickFilter" placeholder="🔍 Buscar..." 
          onChange={onQuickFilterChanged} 
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
        />
        <button onClick={() => handleGenerateTable(false)} style={{ padding: "10px 20px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar Tabla para Fotos
        </button>
        <button onClick={() => handleGenerateTable(true)} style={{ padding: "10px 20px", backgroundColor: "#009933", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ✅ Solo Disponibles (Fotos)
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%", height: "600px" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={[
            { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true },
            { headerName: "Propietario", field: "user", flex: 1, sortable: true },
            { headerName: "Estado", field: "sold", width: 120, cellRenderer: (p) => p.value ? "✅ Pagado" : "⏳ Pendiente" },
            { headerName: "Acción", width: 110, cellRendererFramework: (p) => (
              <button onClick={() => copyUserName(p.data.user)} style={{ backgroundColor: "#004aad", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                Copiar
              </button>
            )}
          ]}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked}
          pagination={true}
          paginationPageSize={100}
        />
      </div>
    </div>
  );
}

export default TicketTable;
