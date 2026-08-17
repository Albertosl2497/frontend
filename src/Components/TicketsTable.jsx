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

  // ⚙️ Leer configuración global (Premio, Fecha, Precio)
  const lotteryPrize = localStorage.getItem("lottery_prize") || "$15,000 en Efectivo";
  const lotteryDate = localStorage.getItem("lottery_date") || "Dom 09 Agosto 2026";
  const ticketPrice = Number(localStorage.getItem("lottery_price")) || 100;

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

  // --- 🔒 LÓGICA PARA COBRAR (PAGADO) ---
  const handleCobrar = (ticket) => {
    if (window.confirm(`¿Estás seguro de marcar el boleto ${ticket.ticketNumber} de ${ticket.user} como PAGADO?`)) {
      fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticket.ticketNumber}/true`, {
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
          updatedData[rowIndex] = { ...ticket, sold: true, availability: false };

          setRowData(updatedData);
          setStats({ ...stats, soldCount: stats.soldCount + 1 });
          toast.success("✅ Boleto marcado como PAGADO");
        })
        .catch(() => toast.error("Error al conectar con el servidor"));
    }
  };

  // --- 🗑️ LÓGICA PARA LIBERAR (ELIMINAR APARTADO) ---
  const handleLiberar = (ticket) => {
    if (window.confirm(`⚠️ ¿Estás seguro de LIBERAR el boleto ${ticket.ticketNumber}? Se perderá el apartado y quedará completamente disponible.`)) {
      const endpoint = ticket.sold ? "sold-ticket" : "claim-ticket";

      fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/${endpoint}/${lotteryNo}/${ticket.ticketNumber}/false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "No se pudo liberar el boleto");
          }

          const updatedData = [...rowData];
          const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticket.ticketNumber);

          updatedData[rowIndex] = { 
            ...ticket, 
            sold: false, 
            availability: true, 
            user: null 
          };

          setRowData(updatedData);

          if (ticket.sold) {
            setStats({ ...stats, soldCount: stats.soldCount - 1 });
          }

          toast.success("🗑️ Boleto LIBERADO con éxito (Ahora está Disponible)");
        })
        .catch((err) => {
          toast.error(`❌ Error: ${err.message}`);
        });
    }
  };

  // --- 📝 LÓGICA SEGURA DE EDICIÓN DE NOMBRE ---
  const handleEditName = (ticket) => {
    const oldName = ticket.user ? ticket.user.trim() : "";

    const newName = window.prompt(`Escribe el NUEVO NOMBRE para el boleto ${ticket.ticketNumber}:`, oldName);

    if (newName === null || newName.trim() === "" || newName.trim() === oldName) {
      return; 
    }

    const finalName = newName.trim();

    fetch(`https://rifasefectivocampotreinta.onrender.com/api/tickets/update-user/${lotteryNo}/${ticket.ticketNumber}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: finalName })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();

        const updatedData = [...rowData];
        const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticket.ticketNumber);

        updatedData[rowIndex] = { ...ticket, user: finalName };
        setRowData(updatedData);

        toast.success("📝 Nombre modificado con éxito");
      })
      .catch(() => {
        toast.error("❌ Error de servidor al guardar el nombre.");
      });
  };

  // --- CONFIGURACIÓN DE COLUMNAS ---
  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true, filter: true },
    { 
      headerName: "Propietario", 
      field: "user", 
      flex: 1, 
      sortable: true, 
      filter: true,
      editable: false 
    },
    { 
      headerName: "Estado", 
      field: "sold", 
      width: 130,
      cellRenderer: (p) => {
        if (p.data.sold) return "✅ Pagado";
        if (p.data.availability === false) return "⏳ Pendiente";
        return "🟢 Disponible";
      },
      cellClassRules: { 
        "cell-value-red": (p) => p.data.sold, 
        "cell-value-green": (p) => p.data.availability === false && !p.data.sold 
      }
    },
    {
      headerName: "Acciones",
      width: 250, 
      cellRendererFramework: (params) => {
        if (params.data.availability === true) {
          return <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "bold", marginTop: "8px" }}>Boleto Libre</div>;
        }

        const isSold = params.data.sold;
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "100%" }}>
            <button 
              onClick={() => handleEditName(params.data)}
              style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
            >
              ✏️ Editar
            </button>
            {!isSold && (
              <button 
                onClick={() => handleCobrar(params.data)}
                style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
              >
                ✅ Cobrar
              </button>
            )}
            <button 
              onClick={() => handleLiberar(params.data)}
              style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}
            >
              🗑️ Liberar
            </button>
          </div>
        );
      }
    }
  ];

  // --- FUNCIÓN GENERADORA DE BLOQUES DE 1 SOLA OPORTUNIDAD (000 al 999) ---
  const createTableBlock = (start, end, ticketMap) => {
    return `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif;">
      <colgroup>
        <col style="width: 55px;">
        <col style="width: auto;">
      </colgroup>
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 8px 4px; font-size: 13px; font-weight: bold; text-align: center;">NÚM</th>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 8px 8px; font-size: 13px; font-weight: bold; text-align: left;">NOMBRE</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: end - start + 1 }, (_, index) => {
          const i = start + index;
          const b = i.toString().padStart(3, "0"); // Genera 000, 001, ..., 999
          const name = ticketMap.get(b) || "";
          
          const rowBg = name ? 'background-color: #f1f5f9;' : 'background-color: #ffffff;';
          const numColor = name ? 'color: #94a3b8; font-weight: bold;' : 'color: #000000; font-weight: 900;';
          const nameStyle = 'font-size: 14px; font-weight: bold; text-align: left; padding-left: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155;';

          return `<tr style="${rowBg}">
            <td style="border: 1px solid #cbd5e1; padding: 4px 2px; text-align: center; font-size: 16px; ${numColor}">${b}</td>
            <td style="border: 1px solid #cbd5e1; padding: 4px 2px; ${nameStyle}">${name}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  };

  const getHeaderHtml = () => `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 12px; padding: 15px; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 1px solid #334155; text-align: center; font-family: Arial, sans-serif;">
      <h2 style="color: #f8fafc; font-size: 22px; font-weight: 900; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">🎉 Gran Sorteo Efectivo 🎉</h2>
      <div style="display: flex; justify-content: space-around; background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px;">
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: center;">
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎁 Premio Principal</span>
          <span style="font-size: 16px; font-weight: 900; color: #fbbf24;">${lotteryPrize}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: center;">
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">📅 Fecha del Sorteo</span>
          <span style="font-size: 16px; font-weight: bold; color: #e2e8f0;">${lotteryDate}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; text-align: center;">
          <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎟️ Precio por Boleto</span>
          <span style="font-size: 16px; font-weight: 900; color: #22c55e;">$${ticketPrice} Pesos</span>
        </div>
      </div>
    </div>
  `;

  // --- 📸 VISTA PÚBLICA EN NUEVA PESTAÑA ---
  const handleViewPublicTable = () => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const finalHtml = `
      <html>
        <head>
          <title>Tablas de Control (000-999)</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #f1f5f9; padding: 20px; }
            .page { background: white; border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 30px; border-radius: 8px; max-width: 1200px; margin-left: auto; margin-right: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);}
            .grid-4-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          </style>
        </head>
        <body>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155;">BLOQUE 1: 000 al 499</h3>
            <div class="grid-4-cols">
              <div>${createTableBlock(0, 124, ticketMap)}</div>
              <div>${createTableBlock(125, 249, ticketMap)}</div>
              <div>${createTableBlock(250, 374, ticketMap)}</div>
              <div>${createTableBlock(375, 499, ticketMap)}</div>
            </div>
          </div>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155;">BLOQUE 2: 500 al 999</h3>
            <div class="grid-4-cols">
              <div>${createTableBlock(500, 624, ticketMap)}</div>
              <div>${createTableBlock(625, 749, ticketMap)}</div>
              <div>${createTableBlock(750, 874, ticketMap)}</div>
              <div>${createTableBlock(875, 999, ticketMap)}</div>
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
    const toastId = toast.loading("⏳ Generando imágenes de 1000 boletos...");

    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const createPageWrapper = (id, title, c1, c2, c3, c4) => `
      <div id="${id}" style="background: #ffffff; padding: 20px; width: 1200px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 20px;">
        ${getHeaderHtml()}
        <h3 style="text-align:center; color:#334155; font-size: 20px; margin-bottom: 15px;">${title}</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div>${c1}</div>
          <div>${c2}</div>
          <div>${c3}</div>
          <div>${c4}</div>
        </div>
      </div>
    `;

    const content1 = createPageWrapper("export-img-1", "NÚMEROS DEL 000 AL 499", 
      createTableBlock(0, 124, ticketMap), 
      createTableBlock(125, 249, ticketMap), 
      createTableBlock(250, 374, ticketMap), 
      createTableBlock(375, 499, ticketMap)
    );

    const content2 = createPageWrapper("export-img-2", "NÚMEROS DEL 500 AL 999", 
      createTableBlock(500, 624, ticketMap), 
      createTableBlock(625, 749, ticketMap), 
      createTableBlock(750, 874, ticketMap), 
      createTableBlock(875, 999, ticketMap)
    );

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = content1 + content2;
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Dar tiempo al DOM para renderizar

      // Descargar las 2 imágenes grandes
      for (let i = 1; i <= 2; i++) {
        const element = document.getElementById(`export-img-${i}`);
        const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });

        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Boletos_Sorteo_Parte_${i}.png`;
        link.click();
      }

      toast.update(toastId, { render: "✅ ¡Imágenes de 1000 boletos descargadas!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Error al procesar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
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
          📸 Generar HTML (000-999)
        </button>

        <button onClick={handleDownloadImages} style={{ padding: "10px 15px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ⬇️ Descargar Imágenes (2 Partes)
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
