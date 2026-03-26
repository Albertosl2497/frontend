import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineCopy } from "react-icons/ai";
import "./ticket.css";

// Función para copiar el nombre del usuario al portapapeles
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

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

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

  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true, filter: true },
    { headerName: "Propietario", field: "user", flex: 1, sortable: true, filter: true },
    { 
      headerName: "Estado", 
      field: "sold", 
      width: 120,
      cellRenderer: (p) => p.value ? "✅ Pagado" : "⏳ Pendiente",
      cellClassRules: { "cell-value-red": (p) => p.value, "cell-value-green": (p) => !p.value }
    },
    {
      headerName: "Acción",
      width: 110,
      cellRendererFramework: (params) => (
        <button 
          onClick={() => copyUserName(params.data.user)}
          style={{ backgroundColor: "#004aad", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
        >
          <AiOutlineCopy /> Copiar
        </button>
      )
    }
  ];

  // --- LÓGICA DE GENERACIÓN DE TABLAS (MAESTRA) ---
  const handleGenerateTable = (soloDisponibles = false) => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const renderRows = (list) => {
      return list.map(t => {
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
    };

    let contentHtml = "";

    if (soloDisponibles) {
      const disponibles = rowData.filter(t => !t.user || t.user.trim() === "");
      if (disponibles.length <= 100) {
        contentHtml = `
          <div class="page">
            <h2 class="table-title">BOLETOS DISPONIBLES - ¡APARTA EL TUYO!</h2>
            <div style="max-width: 600px; margin: auto;">
              <table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead>
              <tbody>${renderRows(disponibles)}</tbody></table>
            </div>
          </div>`;
      } else {
        const half = Math.ceil(disponibles.length / 2);
        contentHtml = `
          <div class="page">
            <h2 class="table-title">BOLETOS DISPONIBLES - ¡APARTA EL TUYO!</h2>
            <div class="split">
              <div class="col"><table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${renderRows(disponibles.slice(0, half))}</tbody></table></div>
              <div class="col"><table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${renderRows(disponibles.slice(half))}</tbody></table></div>
            </div>
          </div>`;
      }
    } else {
      const renderSection = (s, e) => {
        const list = rowData.filter(t => t.ticketNumber >= s && t.ticketNumber <= e);
        const half = Math.ceil(list.length / 2);
        return `
          <div class="page">
            <h2 class="table-title">GANA $15,000 PESOS ESTE 29 DE MARZO 2026 - PARTICIPA POR $100 CON 4 OPORTUNIDADES</h2>
            <div class="split">
              <div class="col"><table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${renderRows(list.slice(0, half))}</tbody></table></div>
              <div class="col"><table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${renderRows(list.slice(half))}</tbody></table></div>
            </div>
          </div>`;
      }
      contentHtml = renderSection(0, 99) + renderSection(100, 199) + 
                    `<div class="page">
                      <h2 class="table-title">GANA $15,000 PESOS ESTE 29 DE MARZO 2026</h2>
                      <div style="max-width: 500px; margin: auto;">
                        <table><thead><tr><th>NUM.</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRES:</th></tr></thead><tbody>${renderRows(rowData.filter(t => t.ticketNumber >= 200 && t.ticketNumber <= 249))}</tbody></table>
                      </div>
                    </div>`;
    }

    const finalHtml = `
      <html>
        <head>
          <title>Campo 30 - Fotos</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #fff; padding: 10px; }
            .page { border: 3px solid #be123c; padding: 15px; margin-bottom: 30px; border-radius: 10px; page-break-after: always; max-width: 1000px; margin: auto; }
            .header { text-align: center; color: #be123c; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-weight: bold; font-size: 14px; }
            .split { display: flex; gap: 15px; }
            .col { flex: 1; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 3px; text-align: center; }
            th { background: #f2f2f2; font-size: 10px; }
            .base-num { font-weight: bold; }
            .name-td { text-align: left; padding-left: 5px; min-width: 120px; font-weight: bold; font-size: 10px; }
            .sold-row td { background-color: #fff9c4 !important; }
            h2.table-title { background: #be123c; color: white; text-align: center; font-size: 14px; margin: 0 0 10px 0; padding: 5px; }
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
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input 
          type="text" id="quickFilter" placeholder="🔍 Buscar participante o número..." 
          onChange={onQuickFilterChanged} 
          style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
        />
        <button onClick={() => handleGenerateTable(false)} style={{ padding: "10px 15px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar Tablas para Fotos
        </button>
        <button onClick={() => handleGenerateTable(true)} style={{ padding: "10px 15px", backgroundColor: "#009933", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ✅ Solo Disponibles (Fotos)
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%", height: "600px" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked}
          pagination={true}
          paginationPageSize={100}
          animateRows={true}
        />
      </div>
    </div>
  );
}

export default TicketTable;
