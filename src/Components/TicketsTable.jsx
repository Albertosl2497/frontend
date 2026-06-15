import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineCopy } from "react-icons/ai";
import html2canvas from "html2canvas";
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

// --- EXPORTACIÓN A WORD (TODOS) ---
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
        th, td { border: 1px solid black; padding: 5px; text-align: center; font-family: Arial; font-size: 11px; }
        th { background-color: #f2f2f2; font-weight: bold; }
      </style></head>
      <body><h2 style="text-align:center">LISTA COMPLETA DE BOLETOS</h2>
      <table><thead><tr><th>BASE</th><th>+250</th><th>+500</th><th>+750</th><th>NOMBRE</th></tr></thead><tbody>`;

  for (let i = 0; i <= 249; i++) {
    const baseStr = i.toString().padStart(3, "0");
    const name = ticketMap.get(baseStr) || "";
    tableHtml += `<tr><td>${baseStr}</td><td>${i + 250}</td><td>${i + 500}</td><td>${i + 750}</td><td>${name}</td></tr>`;
  }
  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], { type: "application/msword;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "lista_completa_boletos.doc";
  link.click();
};

// --- EXPORTACIÓN A WORD (SOLO DISPONIBLES) ---
const exportOnlyAvailableTicketsAsDoc = (tickets) => {
  const safeTickets = JSON.parse(JSON.stringify(tickets));
  const ticketMap = new Map();
  safeTickets.forEach((ticket) => {
    if (ticket.sold === false && (!ticket.user || ticket.user.trim() === "")) {
      ticketMap.set(ticket.ticketNumber.toString().padStart(3, "0"), "");
    }
  });

  let tableHtml = `<html><head><meta charset="UTF-8"><style>
    table { border-collapse: collapse; width: 100%; }
    td { border: 1px solid black; padding: 4px; text-align: center; font-family: Arial; font-size: 10px; }
  </style></head><body><h2 style="text-align:center">BOLETOS DISPONIBLES</h2><table><tbody>`;

  for (let i = 0; i <= 249; i++) {
    if (ticketMap.has(i.toString().padStart(3, "0"))) {
      tableHtml += `<tr><td>${i.toString().padStart(3,"0")}</td><td>${i+250}</td><td>${i+500}</td><td>${i+750}</td><td></td></tr>`;
    }
  }
  tableHtml += `</tbody></table></body></html>`;
  const blob = new Blob([tableHtml], { type: "application/msword;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_disponibles.doc";
  link.click();
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

  // --- 📸 1. VISTA PÚBLICA EN NUEVA PESTAÑA (Mantiene formato de tabla limpia) ---
  const handleViewPublicTable = () => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const renderBlock = (start, end) => {
      return `<table>
        <colgroup>
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: auto;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="4">NÚMEROS</th>
            <th>NOMBRES:</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: end - start + 1 }, (_, index) => {
            const i = start + index;
            const b = i.toString().padStart(3, "0");
            const name = ticketMap.get(b) || "";
            const rowClass = name ? 'sold-row' : '';
            return `<tr class="${rowClass}">
              <td class="base-num">${b}</td>
              <td>${i + 250}</td>
              <td>${i + 500}</td>
              <td>${i + 750}</td>
              <td class="name-td" title="${name}">${name}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    };

    const finalHtml = `
      <html>
        <head>
          <title>Tablas para Publicar - Campo 30</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #fff; padding: 10px; }
            .page { border: 3px solid #be123c; padding: 15px; margin-bottom: 30px; border-radius: 10px; page-break-after: always; max-width: 1000px; margin-left: auto; margin-right: auto; }
            .header { text-align: center; color: #be123c; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 2px 0; font-weight: bold; font-size: 14px; }
            .split { display: flex; gap: 15px; }
            .col { flex: 1; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; table-layout: fixed; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 16px; font-weight: bold; }
            th { background: #f1f5f9; color: #1e293b; font-size: 14px; font-weight: bold; padding: 8px; }
            .base-num { font-weight: bold; color: #0f172a; }
            .name-td { text-align: left; padding-left: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; font-size: 16px; }
            .sold-row { background-color: #e0f2fe; color: #0369a1; } 
            h2.table-title { background: #1e3a8a; color: white; text-align: center; font-size: 21px; margin: 0 0 12px 0; padding: 12px; font-weight: bold; border-radius: 6px; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RIFAS EFECTIVO CAMPO TREINTA</h1>
            <p>WHATSAPP: 6441382876</p>
            <p>RIFA DE $15,000 PESOS ESTE 07 DE JUNIO 2026</p>
          </div>
          <div class="page">
            <h2 class="table-title">GANA $15,000 PESOS ESTE 07 DE JUNIO 2026 - PARTICIPA POR $100 CON 4 OPORTUNIDADES</h2>
            <div class="split">
              <div class="col">${renderBlock(0, 49)}</div>
              <div class="col">${renderBlock(50, 99)}</div>
            </div>
          </div>
          <div class="page">
            <h2 class="table-title">GANA $15,000 PESOS ESTE 07 DE JUNIO 2026 - PARTICIPA POR $100 CON 4 OPORTUNIDADES</h2>
            <div class="split">
              <div class="col">${renderBlock(100, 149)}</div>
              <div class="col">${renderBlock(150, 199)}</div>
            </div>
          </div>
          <div class="page">
            <h2 class="table-title">GANA $15,000 PESOS ESTE 07 DE JUNIO 2026 - PARTICIPA POR $100 CON 4 OPORTUNIDADES</h2>
            <div style="max-width: 500px; margin: auto;">
              ${renderBlock(200, 249)}
            </div>
          </div>
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  // --- ⬇️ 2. DESCARGAR IMÁGENES AUTOMÁTICAMENTE (DISEÑO FLYER DE MARKETING PREMIUM) ---
  const handleDownloadImages = async () => {
    const toastId = toast.loading("⏳ Diseñando tus 3 Banners Publicitarios...");
    
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    // Renderizador exclusivo enfocado en la estética de una imagen compartible
    const renderBlockInline = (start, end) => {
      let html = `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <colgroup>
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: 46px;">
          <col style="width: auto;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="4" style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 4px; font-size: 13px; font-weight: 900; letter-spacing: 1px;">NÚMEROS</th>
            <th style="border: 1px solid #cbd5e1; background: #1e293b; color: #ffffff; padding: 10px 8px; font-size: 13px; font-weight: 900; text-align: left; padding-left: 12px; letter-spacing: 1px;">DISPONIBILIDAD / PROPIETARIO</th>
          </tr>
        </thead>
        <tbody>`;
      for (let i = start; i <= end; i++) {
        const b = i.toString().padStart(3, "0");
        const name = ticketMap.get(b) || "";
        
        // Estilos diferenciados de marketing: Blanco limpio para libre, gris sutil apagado para ocupado
        const rowBg = name ? 'background-color: #f1f5f9; color: #64748b;' : 'background-color: #ffffff; color: #000000;';
        const numColor = name ? 'color: #94a3b8;' : 'color: #1e3a8a; font-weight: 900;';
        const nameStyle = name 
          ? 'color: #334155; font-weight: bold; font-size: 15px; background-color: #e2e8f0;' 
          : 'color: #10b981; font-weight: 900; font-size: 14px; letter-spacing: 0.5px;';
        const displayName = name ? name : "✨ DISPONIBLE ¡APARTA YA!";

        html += `<tr style="${rowBg}">
          <td style="border: 1px solid #cbd5e1; padding: 7px 2px; text-align: center; font-size: 16px; ${numColor}">${b}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 2px; text-align: center; font-size: 16px; ${numColor}">${i + 250}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 2px; text-align: center; font-size: 16px; ${numColor}">${i + 500}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 2px; text-align: center; font-size: 16px; ${numColor}">${i + 750}</td>
          <td style="border: 1px solid #cbd5e1; padding: 7px 12px; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${nameStyle}">${displayName}</td>
        </tr>`;
      }
      return html + `</tbody></table>`;
    };

    // Envoltura con aspecto de Flyer Publicitario de Redes Sociales
    const createPageWrapper = (id, content) => `
      <div id="${id}" style="background: #f8fafc; padding: 24px; width: 1050px; border: 4px solid #be123c; border-radius: 16px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 25px;">
        
        <div style="background: linear-gradient(135deg, #be123c 0%, #4c0519 100%); padding: 20px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.4);">RIFAS EFECTIVO CAMPO TREINTA</h1>
          <div style="display: inline-block; background: #ffffff; color: #be123c; padding: 4px 15px; border-radius: 20px; font-weight: 900; font-size: 15px; margin-top: 8px;">
            📲 APARTADOS AL WHATSAPP: 6441382876
          </div>
        </div>

        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: white; text-align: center; margin: 0 0 18px 0; padding: 16px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <span style="font-size: 18px; font-weight: bold; text-transform: uppercase; display: block; color: #93c5fd; letter-spacing: 1px;">¡GRAN OPPORTUNIDAD!</span>
          <h2 style="margin: 3px 0; font-size: 24px; font-weight: 900; color: #f59e0b;">
            GANA $15,000 PESOS <span style="color:#ffffff; font-size:16px; font-weight:normal;">ESTE 07 DE JUNIO 2026</span>
          </h2>
          <p style="margin: 0; font-size: 15px; font-weight: bold; color: #10b981;">
            Participa con solo $100 pesos 💥 ¡Cuentas con 4 oportunidades de ganar por boleto!
          </p>
        </div>

        ${content}

        <div style="margin-top: 20px; background: #e2e8f0; text-align: center; padding: 12px; border-radius: 8px; border: 1px dashed #be123c;">
          <p style="margin: 0; font-size: 16px; font-weight: 900; color: #be123c; letter-spacing: 0.5px;">
            🍀 ¡Manda mensaje rápido y asegura tu número antes de que te lo ganen! 🍀
          </p>
        </div>
      </div>
    `;

    const content1 = `<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline(0, 49)}</div><div style="flex: 1;">${renderBlockInline(50, 99)}</div></div>`;
    const content2 = `<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline(100, 149)}</div><div style="flex: 1;">${renderBlockInline(150, 199)}</div></div>`;
    const content3 = `<div style="max-width: 520px; margin: auto;">${renderBlockInline(200, 249)}</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = createPageWrapper("export-img-1", content1) + createPageWrapper("export-img-2", content2) + createPageWrapper("export-img-3", content3);
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`export-img-${i}`);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#f8fafc" });
        
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Flyer_Rifa_Parte_${i}.png`;
        link.click();
      }
      
      toast.update(toastId, { render: "✅ ¡Los 3 Banners Publicitarios se descargaron con éxito!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Ocurrió un error al diseñar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const handleViewHtmlTable = () => {
    const safeTickets = JSON.parse(JSON.stringify(rowData));
    const ticketMap = new Map();
    safeTickets.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const generateTableRange = (start, end) => {
      let html = `<table><thead><tr><th>B.</th><th>+250</th><th>+500</th><th>+750</th><th>PARTICIPANTE</th></tr></thead><tbody>`;
      for (let i = start; i <= end; i++) {
        const baseNum = i.toString().padStart(3, "0");
        const name = ticketMap.get(baseNum) || "";
        const rowClass = name ? 'occupied' : 'empty';
        html += `<tr class="${rowClass}"><td class="num">${baseNum}</td><td class="num">${i+250}</td><td class="num">${i+500}</td><td class="num">${i+750}</td><td class="name">${name}</td></tr>`;
      }
      return html + `</tbody></table>`;
    };

    const finalHtml = `<html><head><style>body{font-family:Arial;padding:20px;}.split-container{display:flex;gap:20px;}table{border-collapse:collapse;width:100%;font-size:11px;}th,td{border:1px solid #ccc;padding:3px;}.occupied{background:#ebf8ff;}</style></head>
    <body><h2>Control Interno</h2><div class="split-container"><div>${generateTableRange(0, 124)}</div><div>${generateTableRange(125, 249)}</div></div></body></html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input 
          type="text" 
          id="quickFilter" 
          placeholder="🔍 Buscar participante o número..." 
          onChange={onQuickFilterChanged} 
          style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
        />
        
        <button onClick={() => exportVerticalPatternAsDoc(rowData)} style={{ padding: "10px 15px", backgroundColor: "#004aad", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
          Word (Todos)
        </button>
        
        <button onClick={() => exportOnlyAvailableTicketsAsDoc(rowData)} style={{ padding: "10px 15px", backgroundColor: "#009933", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
          Word (Libres)
        </button>
        
        <button onClick={handleViewHtmlTable} style={{ padding: "10px 15px", backgroundColor: "#e68a00", color: "white", border: "none", borderRadius: 5, cursor: "pointer" }}>
          📺 Vista Admin
        </button>

        <button onClick={handleViewPublicTable} style={{ padding: "10px 15px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar Tablas (Ver HTML)
        </button>

        <button onClick={handleDownloadImages} style={{ padding: "10px 15px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ⬇️ Descargar en 3 Imágenes
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
