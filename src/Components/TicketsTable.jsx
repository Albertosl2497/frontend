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
  
  // ⚙️ ESTADO NUEVO: Controlar si vemos la Lista o la Cuadrícula
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

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

  // --- FUNCIÓN GENERADORA DE BLOQUES PARA HTML/IMÁGENES (000 al 999) ---
  const createTableBlock = (start, end, ticketMap) => {
    return `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif;">
      <colgroup>
        <col style="width: 50px;">
        <col style="width: auto;">
      </colgroup>
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 6px 2px; font-size: 13px; font-weight: bold; text-align: center;">NÚM</th>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 6px 6px; font-size: 13px; font-weight: bold; text-align: left;">NOMBRE</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: end - start + 1 }, (_, index) => {
          const i = start + index;
          const b = i.toString().padStart(3, "0"); 
          const name = ticketMap.get(b) || "";
          
          const rowBg = name ? 'background-color: #f1f5f9;' : 'background-color: #ffffff;';
          const numColor = name ? 'color: #94a3b8; font-weight: bold;' : 'color: #000000; font-weight: 900;';
          const nameStyle = 'font-size: 13px; font-weight: bold; text-align: left; padding-left: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155;';

          return `<tr style="${rowBg}">
            <td style="border: 1px solid #cbd5e1; padding: 4px 2px; text-align: center; font-size: 15px; ${numColor}">${b}</td>
            <td style="border: 1px solid #cbd5e1; padding: 4px 2px; ${nameStyle}">${name}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  };

  const getHeaderHtml = () => `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); border: 1px solid #334155; text-align: center; font-family: Arial, sans-serif;">
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
          <title>Tablas de Control (4 Partes)</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #f1f5f9; padding: 20px; }
            .page { background: white; border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 30px; border-radius: 8px; max-width: 1400px; margin-left: auto; margin-right: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);}
            .grid-5-cols { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
          </style>
        </head>
        <body>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155; margin-bottom: 10px;">PARTE 1: NÚMEROS DEL 000 AL 249</h3>
            <div class="grid-5-cols">
              <div>${createTableBlock(0, 49, ticketMap)}</div>
              <div>${createTableBlock(50, 99, ticketMap)}</div>
              <div>${createTableBlock(100, 149, ticketMap)}</div>
              <div>${createTableBlock(150, 199, ticketMap)}</div>
              <div>${createTableBlock(200, 249, ticketMap)}</div>
            </div>
          </div>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155; margin-bottom: 10px;">PARTE 2: NÚMEROS DEL 250 AL 499</h3>
            <div class="grid-5-cols">
              <div>${createTableBlock(250, 299, ticketMap)}</div>
              <div>${createTableBlock(300, 349, ticketMap)}</div>
              <div>${createTableBlock(350, 399, ticketMap)}</div>
              <div>${createTableBlock(400, 449, ticketMap)}</div>
              <div>${createTableBlock(450, 499, ticketMap)}</div>
            </div>
          </div>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155; margin-bottom: 10px;">PARTE 3: NÚMEROS DEL 500 AL 749</h3>
            <div class="grid-5-cols">
              <div>${createTableBlock(500, 549, ticketMap)}</div>
              <div>${createTableBlock(550, 599, ticketMap)}</div>
              <div>${createTableBlock(600, 649, ticketMap)}</div>
              <div>${createTableBlock(650, 699, ticketMap)}</div>
              <div>${createTableBlock(700, 749, ticketMap)}</div>
            </div>
          </div>
          <div class="page">
            ${getHeaderHtml()}
            <h3 style="text-align:center; color:#334155; margin-bottom: 10px;">PARTE 4: NÚMEROS DEL 750 AL 999</h3>
            <div class="grid-5-cols">
              <div>${createTableBlock(750, 799, ticketMap)}</div>
              <div>${createTableBlock(800, 849, ticketMap)}</div>
              <div>${createTableBlock(850, 899, ticketMap)}</div>
              <div>${createTableBlock(900, 949, ticketMap)}</div>
              <div>${createTableBlock(950, 999, ticketMap)}</div>
            </div>
          </div>
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  // --- ⬇️ DESCARGAR IMÁGENES AUTOMÁTICAMENTE (4 IMÁGENES) ---
  const handleDownloadImages = async () => {
    const toastId = toast.loading("⏳ Generando 4 imágenes horizontales...");

    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const createPageWrapper = (id, title, colsArray) => `
      <div id="${id}" style="background: #ffffff; padding: 25px; width: 1500px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 20px;">
        ${getHeaderHtml()}
        <h3 style="text-align:center; color:#334155; font-size: 22px; margin-bottom: 15px;">${title}</h3>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
          ${colsArray.map(c => `<div>${c}</div>`).join('')}
        </div>
      </div>
    `;

    const content1 = createPageWrapper("export-img-1", "PARTE 1: NÚMEROS DEL 000 AL 249", [
      createTableBlock(0, 49, ticketMap), createTableBlock(50, 99, ticketMap),
      createTableBlock(100, 149, ticketMap), createTableBlock(150, 199, ticketMap),
      createTableBlock(200, 249, ticketMap)
    ]);

    const content2 = createPageWrapper("export-img-2", "PARTE 2: NÚMEROS DEL 250 AL 499", [
      createTableBlock(250, 299, ticketMap), createTableBlock(300, 349, ticketMap),
      createTableBlock(350, 399, ticketMap), createTableBlock(400, 449, ticketMap),
      createTableBlock(450, 499, ticketMap)
    ]);

    const content3 = createPageWrapper("export-img-3", "PARTE 3: NÚMEROS DEL 500 AL 749", [
      createTableBlock(500, 549, ticketMap), createTableBlock(550, 599, ticketMap),
      createTableBlock(600, 649, ticketMap), createTableBlock(650, 699, ticketMap),
      createTableBlock(700, 749, ticketMap)
    ]);

    const content4 = createPageWrapper("export-img-4", "PARTE 4: NÚMEROS DEL 750 AL 999", [
      createTableBlock(750, 799, ticketMap), createTableBlock(800, 849, ticketMap),
      createTableBlock(850, 899, ticketMap), createTableBlock(900, 949, ticketMap),
      createTableBlock(950, 999, ticketMap)
    ]);

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = content1 + content2 + content3 + content4;
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 

      for (let i = 1; i <= 4; i++) {
        const element = document.getElementById(`export-img-${i}`);
        const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });

        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Boletos_Sorteo_Parte_${i}.png`;
        link.click();
      }

      toast.update(toastId, { render: "✅ ¡Las 4 imágenes se descargaron con éxito!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Error al procesar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  // --- 🔲 RENDER DE LA CUADRÍCULA VISUAL ---
  const renderGridView = () => {
    // 1. Mapeamos la data de la DB para lectura rápida
    const ticketMap = new Map();
    rowData.forEach(t => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      ticketMap.set(num, t);
    });

    const boxes = [];

    // 2. Creamos 1000 cuadritos (Del 000 al 999)
    for (let i = 0; i < 1000; i++) {
      const num = i.toString().padStart(3, "0");
      const t = ticketMap.get(num);
      
      let bgColor = "#22c55e"; // Verde por defecto (Disponible)
      let textColor = "white";
      let titleHover = `Boleto ${num} - DISPONIBLE`;

      if (t) {
        if (t.sold) {
          bgColor = "#dc2626"; // Rojo (Pagado)
          titleHover = `Boleto ${num} - PAGADO por: ${t.user}`;
        } else if (t.availability === false) {
          bgColor = "#eab308"; // Amarillo (Apartado/Pendiente)
          textColor = "#0f172a";
          titleHover = `Boleto ${num} - APARTADO por: ${t.user}`;
        }
      }

      boxes.push(
        <div 
          key={num} 
          title={titleHover}
          style={{
            backgroundColor: bgColor,
            color: textColor,
            padding: "8px 2px",
            textAlign: "center",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: "bold",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {num}
        </div>
      );
    }

    return (
      <div style={{ marginTop: "10px" }}>
        {/* LEYENDA DE COLORES */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px", justifyContent: "center", backgroundColor: "#1e293b", padding: "10px", borderRadius: "8px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: "bold", fontSize: "14px" }}>
             <span style={{ width: 18, height: 18, background: "#22c55e", borderRadius: 4 }}></span> Disponible
           </div>
           <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: "bold", fontSize: "14px" }}>
             <span style={{ width: 18, height: 18, background: "#eab308", borderRadius: 4 }}></span> Apartado
           </div>
           <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontWeight: "bold", fontSize: "14px" }}>
             <span style={{ width: 18, height: 18, background: "#dc2626", borderRadius: 4 }}></span> Pagado
           </div>
        </div>

        {/* CONTENEDOR DE LA CUADRÍCULA */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(45px, 1fr))", 
          gap: "6px", 
          maxHeight: "550px", 
          overflowY: "auto", 
          padding: "15px", 
          backgroundColor: "#0f172a", 
          borderRadius: "8px", 
          border: "1px solid #334155" 
        }}>
          {boxes}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
        {/* BOTÓN PARA CAMBIAR VISTA */}
        <button 
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")} 
          style={{ padding: "10px 15px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "14px", transition: "0.2s" }}
        >
          {viewMode === "list" ? "🔲 Ver Cuadrícula" : "📋 Ver Lista de Registros"}
        </button>

        {viewMode === "list" && (
          <input 
            type="text" 
            id="quickFilter" 
            placeholder="🔍 Buscar participante o número..." 
            onChange={onQuickFilterChanged} 
            style={{ flex: 1, minWidth: "200px", padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
          />
        )}

        <button onClick={handleViewPublicTable} style={{ padding: "10px 15px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          📸 Generar HTML (4 Partes)
        </button>

        <button onClick={handleDownloadImages} style={{ padding: "10px 15px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold" }}>
          ⬇️ Descargar 4 Imágenes
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL: Muestra la Lista (AgGrid) o la Cuadrícula */}
      {viewMode === "list" ? (
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
      ) : (
        renderGridView()
      )}
    </div>
  );
}

export default TicketTable;
