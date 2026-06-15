import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from "html2canvas";
import "./ticket.css";

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

  // --- 🔒 LÓGICA DE ESTADOS (COBRAR / LIBERAR) ---
  const handleCobrar = (ticket) => {
    if (window.confirm(`¿Estás seguro de marcar el boleto ${ticket.ticketNumber} de ${ticket.user} como PAGADO?`)) {
      updateTicketStatus(ticket, true);
    }
  };

  const handleLiberar = (ticket) => {
    if (window.confirm(`⚠️ ¿Estás seguro de LIBERAR el boleto ${ticket.ticketNumber}? Se perderá el apartado y quedará disponible.`)) {
      updateTicketStatus(ticket, false);
    }
  };

  const updateTicketStatus = (ticket, isSold) => {
    fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticket.ticketNumber}/${isSold}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Sold Tickets can not be made available") {
          toast.error("Acción bloqueada por el servidor.");
          return;
        }
        
        const updatedData = [...rowData];
        const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticket.ticketNumber);
        const updatedTicket = { ...ticket };
        
        updatedTicket.sold = isSold;
        
        if (isSold) {
          setStats({ ...stats, soldCount: stats.soldCount + 1 });
          toast.success("✅ Boleto marcado como PAGADO");
        } else {
          updatedTicket.availability = true;
          setStats({ ...stats, soldCount: stats.soldCount - 1 });
          toast.success("🗑️ Boleto LIBERADO con éxito");
        }

        updatedData[rowIndex] = updatedTicket;
        setRowData(updatedData);
      })
      .catch(() => toast.error("Error al conectar con el servidor"));
  };

  // --- 📝 LÓGICA SEGURA DE EDICIÓN DE NOMBRE (MEDIANTE BOTÓN PROMPT) ---
  const handleEditName = (ticket) => {
    const oldName = ticket.user ? ticket.user.trim() : "";
    
    // Abrimos un cuadro de diálogo para que escriba el nuevo nombre
    const newName = window.prompt(`Escribe el NUEVO NOMBRE para el boleto ${ticket.ticketNumber}:`, oldName);

    // Si cancela (newName es null) o si deja el nombre igual o vacío, no hacemos nada
    if (newName === null || newName.trim() === "" || newName.trim() === oldName) {
      return; 
    }

    const finalName = newName.trim();

    // Enviamos la actualización al backend
    fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/update-user/${lotteryNo}/${ticket.ticketNumber}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: finalName })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        
        // Actualizamos la tabla visualmente si el servidor responde con éxito
        const updatedData = [...rowData];
        const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticket.ticketNumber);
        
        updatedData[rowIndex] = { ...ticket, user: finalName };
        setRowData(updatedData);
        
        toast.success("📝 Nombre modificado con éxito");
      })
      .catch(() => {
        toast.error("❌ Error de servidor. El nombre no se pudo guardar. (Verifica si la ruta /update-user/ existe en tu backend)");
      });
  };

  // --- CONFIGURACIÓN DE COLUMNAS (AHORA CON BOTÓN DE EDITAR) ---
  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true, filter: true },
    { 
      headerName: "Propietario", 
      field: "user", 
      flex: 1, 
      sortable: true, 
      filter: true,
      editable: false // 👈 Apagamos la edición conflictiva de AG Grid
    },
    { 
      headerName: "Estado", 
      field: "sold", 
      width: 120,
      cellRenderer: (p) => p.value ? "✅ Pagado" : "⏳ Pendiente",
      cellClassRules: { "cell-value-red": (p) => p.value, "cell-value-green": (p) => !p.value }
    },
    {
      headerName: "Acciones",
      width: 250, // Hacemos la columna más ancha para que quepan los 3 botones
      cellRendererFramework: (params) => {
        const isSold = params.data.sold;
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "100%" }}>
            
            {/* BOTÓN 1: EDITAR NOMBRE */}
            <button 
              onClick={() => handleEditName(params.data)}
              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", transition: "transform 0.1s" }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
              title="Editar Nombre"
            >
              ✏️ Editar
            </button>

            {/* BOTÓN 2: COBRAR */}
            {!isSold && (
              <button 
                onClick={() => handleCobrar(params.data)}
                style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", transition: "transform 0.1s" }}
                onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
              >
                ✅ Cobrar
              </button>
            )}

            {/* BOTÓN 3: LIBERAR */}
            <button 
              onClick={() => handleLiberar(params.data)}
              style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px", transition: "transform 0.1s" }}
              onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.target.style.transform = "scale(1)"}
            >
              🗑️ Liberar
            </button>
          </div>
        );
      }
    }
  ];

  // --- 📸 VISTA PÚBLICA EN NUEVA PESTAÑA ---
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
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: auto;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="4">NÚMEROS</th>
            <th style="text-align: left; padding-left: 12px;">NOMBRES:</th>
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
              <td class="base-num">${i + 250}</td>
              <td class="base-num">${i + 500}</td>
              <td class="base-num">${i + 750}</td>
              <td class="name-td" title="${name}">${name}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    };

    const finalHtml = `
      <html>
        <head>
          <title>Tablas de Control - Campo 30</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #fff; padding: 20px; }
            .page { border: 1px solid #cbd5e1; padding: 15px; margin-bottom: 30px; border-radius: 8px; page-break-after: always; max-width: 950px; margin-left: auto; margin-right: auto; }
            .split { display: flex; gap: 20px; }
            .col { flex: 1; }
            table { border-collapse: collapse; width: 100%; font-size: 11px; table-layout: fixed; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; }
            th { background: #0f172a; color: #ffffff; font-size: 14px; font-weight: bold; padding: 10px 4px; }
            .base-num { font-size: 19px; font-weight: 900; color: #000000; }
            .sold-row .base-num { color: #94a3b8; font-weight: bold; }
            .name-td { text-align: left; padding-left: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; font-size: 16px; color: #334155; }
            .sold-row { background-color: #f1f5f9; } 
          </style>
        </head>
        <body>
          <div class="page">
            <div class="split">
              <div class="col">${renderBlock(0, 49)}</div>
              <div class="col">${renderBlock(50, 99)}</div>
            </div>
          </div>
          <div class="page">
            <div class="split">
              <div class="col">${renderBlock(100, 149)}</div>
              <div class="col">${renderBlock(150, 199)}</div>
            </div>
          </div>
          <div class="page">
            <div style="max-width: 480px; margin: auto;">
              ${renderBlock(200, 249)}
            </div>
          </div>
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  // --- ⬇️ DESCARGAR IMÁGENES AUTOMÁTICAMENTE ---
  const handleDownloadImages = async () => {
    const toastId = toast.loading("⏳ Generando las imágenes de las tablas...");
    
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const renderBlockInline = (start, end) => {
      let html = `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif;">
        <colgroup>
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: auto;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="4" style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 4px; font-size: 14px; font-weight: bold; text-align: center;">NÚMEROS</th>
            <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 8px; font-size: 14px; font-weight: bold; text-align: left; padding-left: 12px;">NOMBRES:</th>
          </tr>
        </thead>
        <tbody>`;
      for (let i = start; i <= end; i++) {
        const b = i.toString().padStart(3, "0");
        const name = ticketMap.get(b) || "";
        
        const rowBg = name ? 'background-color: #f1f5f9;' : 'background-color: #ffffff;';
        const numColor = name ? 'color: #94a3b8; font-weight: bold;' : 'color: #000000; font-weight: 900;';
        const nameStyle = 'font-size: 16px; font-weight: bold; text-align: left; padding-left: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155;';

        html += `<tr style="${rowBg}">
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${b}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 250}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 500}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 750}</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; ${nameStyle}">${name}</td>
        </tr>`;
      }
      return html + `</tbody></table>`;
    };

    const createPageWrapper = (id, content) => `
      <div id="${id}" style="background: #ffffff; padding: 15px; width: 950px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 20px;">
        ${content}
      </div>
    `;

    // 🏆 HTML DEL ENCABEZADO (Banner con estilos en línea para html2canvas)
    const headerHtml = `
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #334155; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: #f8fafc; font-size: 26px; font-weight: 900; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">🎉 Gran Sorteo Efectivo 🎉</h2>
        <div style="display: flex; justify-content: space-around; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎁 Premio Principal</span>
            <span style="font-size: 18px; font-weight: 900; color: #fbbf24;">$15,000 MXN</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">📅 Fecha del Sorteo</span>
            <span style="font-size: 18px; font-weight: bold; color: #e2e8f0;">Sáb 20 de Jun, 2026</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎟️ Precio por Boleto</span>
            <span style="font-size: 18px; font-weight: 900; color: #22c55e;">$100 Pesos</span>
          </div>
        </div>
      </div>
    `;

    // Añadimos el headerHtml SOLO a content1
    const content1 = `${headerHtml}<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline(0, 49)}</div><div style="flex: 1;">${renderBlockInline(50, 99)}</div></div>`;
    const content2 = `<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline(100, 149)}</div><div style="flex: 1;">${renderBlockInline(150, 199)}</div></div>`;
    const content3 = `<div style="max-width: 480px; margin: auto;">${renderBlockInline(200, 249)}</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = createPageWrapper("export-img-1", content1) + createPageWrapper("export-img-2", content2) + createPageWrapper("export-img-3", content3);
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`export-img-${i}`);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Tabla_Disponibles_Parte_${i}.png`;
        link.click();
      }
      
      toast.update(toastId, { render: "✅ ¡Tablas descargadas con éxito!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Ocurrió un error al procesar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input 
          type="text" 
          id="quickFilter" 
          placeholder="🔍 Buscar participante o número..." 
          onChange={onQuickFilterChanged} 
          style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
        />

        <button onClick={handleViewPublicTable} style={{ padding: "10px 15px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar HTML
        </button>

        <button onClick={handleDownloadImages} style={{ padding: "10px 15px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ⬇️ Descargar Imágenes
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%", height: "600px" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={100}
          animateRows={true}
        />
      </div>
    </div>
  );
}

export default TicketTable;
