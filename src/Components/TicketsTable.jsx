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
        toast.success("Estado actualizado con éxito");
      })
      .catch(() => toast.error("Error al conectar con el servidor"));
  };

  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true, filter: true },
    { headerName: "Propietario", field: "user", flex: 1, sortable: true, filter: true },
    { 
      headerName: "Estado", field: "sold", width: 120,
      cellRenderer: (p) => p.value ? "✅ Pagado" : "⏳ Pendiente",
      cellClassRules: { "cell-value-red": (p) => p.value, "cell-value-green": (p) => !p.value }
    },
    {
      headerName: "Acción", width: 110,
      cellRendererFramework: (params) => (
        <button onClick={() => copyUserName(params.data.user)} style={{ backgroundColor: "#004aad", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
          <AiOutlineCopy /> Copiar
        </button>
      )
    }
  ];

  // --- LÓGICA DE TABLAS PARA FOTOS (ESTILO IMAGEN PDF) ---
  const handleViewPublicTable = (soloDisponibles = false) => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const renderTable = (list) => {
      let html = `<table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>`;
      list.forEach(t => {
        const b = t.ticketNumber.toString().padStart(3, "0");
        const name = ticketMap.get(b) || "";
        const rowClass = name ? 'sold-row' : '';
        html += `<tr class="${rowClass}">
          <td class="base-num">${b}</td>
          <td>${t.ticketNumber + 250}</td><td>${t.ticketNumber + 500}</td><td>${t.ticketNumber + 750}</td>
          <td class="name-td">${name}</td>
        </tr>`;
      });
      return html + `</tbody></table>`;
    };

    let content = "";
    if (soloDisponibles) {
      const libres = rowData.filter(t => !t.user || t.user.trim() === "");
      if (libres.length <= 100) {
        content = `<div class="page"><h2 class="table-title">BOLETOS DISPONIBLES</h2><div style="max-width:600px; margin:auto;">${renderTable(libres)}</div></div>`;
      } else {
        const half = Math.ceil(libres.length / 2);
        content = `<div class="page"><h2 class="table-title">BOLETOS DISPONIBLES</h2><div class="split"><div class="col">${renderTable(libres.slice(0, half))}</div><div class="col">${renderTable(libres.slice(half))}</div></div></div>`;
      }
    } else {
      // Formato original 3 páginas
      const renderRange = (s, e) => {
        const list = rowData.filter(t => t.ticketNumber >= s && t.ticketNumber <= e);
        const half = Math.ceil(list.length / 2);
        return `<div class="page"><h2 class="table-title">GANA $15,000 PESOS ESTE 29 DE MARZO 2026</h2><div class="split"><div class="col">${renderTable(list.slice(0, half))}</div><div class="col">${renderTable(list.slice(half))}</div></div></div>`;
      };
      content = renderRange(0, 99) + renderRange(100, 199) + 
                `<div class="page"><h2 class="table-title">FOLIOS 200 AL 249</h2><div style="max-width:500px; margin:auto;">${renderTable(rowData.filter(t => t.ticketNumber >= 200 && t.ticketNumber <= 249))}</div></div>`;
    }

    const finalHtml = `<html><head><style>
      body { font-family: 'Arial Narrow', Arial; padding: 10px; }
      .page { border: 3px solid #be123c; padding: 15px; margin-bottom: 30px; border-radius: 10px; page-break-after: always; max-width: 1000px; margin: auto; }
      .header { text-align: center; color: #be123c; margin-bottom: 10px; }
      .split { display: flex; gap: 15px; } .col { flex: 1; }
      table { border-collapse: collapse; width: 100%; font-size: 11px; }
      th, td { border: 1px solid #000; padding: 3px; text-align: center; }
      th { background: #f2f2f2; }
      .sold-row td { background-color: #fff9c4 !important; }
      .base-num { font-weight: bold; }
      .name-td { text-align: left; padding-left: 5px; font-weight: bold; min-width: 120px; }
      h2.table-title { background: #be123c; color: white; text-align: center; font-size: 14px; margin: 0 0 10px 0; padding: 5px; }
    </style></head><body>
      <div class="header"><h1>RIFAS EFECTIVO CAMPO TREINTA</h1><p>WHATSAPP: 6441382876</p></div>
      ${content}
    </body></html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input type="text" id="quickFilter" placeholder="🔍 Buscar..." onChange={onQuickFilterChanged} 
               style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }} />
        
        <button onClick={() => handleViewPublicTable(false)} style={{ padding: "10px 15px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar Tablas para Fotos
        </button>
        
        <button onClick={() => handleViewPublicTable(true)} style={{ padding: "10px 15px", backgroundColor: "#009933", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ✅ Solo Disponibles (Fotos)
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%", height: "600px" }}>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} onGridReady={onGridReady} onCellDoubleClicked={onCellDoubleClicked} pagination={true} paginationPageSize={100} />
      </div>
    </div>
  );
}

export default TicketTable;
