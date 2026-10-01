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

  // ⚙️ Configuración global
  const opportunitiesCount = Number(localStorage.getItem("lottery_opportunities")) || 4;
  const lotteryPrize = localStorage.getItem("lottery_prize") || "$15,000 en Efectivo";
  const lotteryDate = localStorage.getItem("lottery_date") || "Domingo 11 Octubre 2026";
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
          updatedData[rowIndex] = { ...ticket, sold: false, availability: true, user: null };
          setRowData(updatedData);
          if (ticket.sold) {
            setStats({ ...stats, soldCount: stats.soldCount - 1 });
          }
          toast.success("🗑️ Boleto LIBERADO con éxito (Ahora está Disponible)");
        })
        .catch((err) => toast.error(`❌ Error: ${err.message}`));
    }
  };

  // --- 📝 LÓGICA SEGURA DE EDICIÓN DE NOMBRE ---
  const handleEditName = (ticket) => {
    const oldName = ticket.user ? ticket.user.trim() : "";
    const newName = window.prompt(`Escribe el NUEVO NOMBRE para el boleto ${ticket.ticketNumber}:`, oldName);
    if (newName === null || newName.trim() === "" || newName.trim() === oldName) return;

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
      .catch(() => toast.error("❌ Error de servidor al guardar el nombre."));
  };

  // --- CONFIGURACIÓN DE COLUMNAS (TABLA ADMIN) ---
  const columnDefs = [
    { headerName: "Boleto", field: "ticketNumber", width: 90, sortable: true, filter: true },
    { headerName: "Propietario", field: "user", flex: 1, sortable: true, filter: true, editable: false },
    {
      headerName: "Estado", field: "sold", width: 130,
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
      headerName: "Acciones", width: 250,
      cellRendererFramework: (params) => {
        if (params.data.availability === true) {
          return <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "bold", marginTop: "8px" }}>Boleto Libre</div>;
        }
        const isSold = params.data.sold;
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "100%" }}>
            <button onClick={() => handleEditName(params.data)} style={{ backgroundColor: "#0284c7", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>✏️ Editar</button>
            {!isSold && (
              <button onClick={() => handleCobrar(params.data)} style={{ backgroundColor: "#16a34a", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>✅ Cobrar</button>
            )}
            <button onClick={() => handleLiberar(params.data)} style={{ backgroundColor: "#dc2626", color: "white", border: "none", padding: "6px 8px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>🗑️ Liberar</button>
          </div>
        );
      }
    }
  ];

  // ==========================================
  // 🔹 MÓDULO 1: SORTEO 1,000 NÚMEROS (000-999)
  // ==========================================

  const createTableBlock1000 = (start, end, ticketMap) => {
    return `<table style="border-collapse: collapse; width: 100%; max-width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif;">
      <colgroup>
        <col style="width: 85px;">
        <col style="width: 240px;">
      </colgroup>
      <thead>
        <tr>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 0; font-size: 18px; font-weight: bold; text-align: center; overflow: hidden;">NÚM</th>
          <th style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 10px; font-size: 18px; font-weight: bold; text-align: left; overflow: hidden;">NOMBRE</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: end - start + 1 }, (_, index) => {
          const i = start + index;
          const b = i.toString().padStart(3, "0");
          const name = ticketMap.get(b) || "";
          const rowBg = name ? 'background-color: #f1f5f9;' : 'background-color: #ffffff;';
          const numColor = name ? 'color: #94a3b8; font-weight: bold;' : 'color: #000000; font-weight: 900;';

          return `<tr style="${rowBg} height: 34px;">
            <td style="border: 1px solid #cbd5e1; padding: 0; text-align: center; font-size: 22px; ${numColor} overflow: hidden; white-space: nowrap;">${b}</td>
            <td style="border: 1px solid #cbd5e1; padding: 0 10px; vertical-align: middle;">
              <div style="width: 220px; font-size: 18px; font-weight: bold; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${name}
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  };

  const getHeaderHtml1000 = () => `
    <div style="position: relative; overflow: hidden; background: linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); color: white; border-radius: 16px; padding: 35px 20px; margin-bottom: 30px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); border-bottom: 6px solid #be123c; text-align: center; font-family: Arial, sans-serif;">
      <div style="position: absolute; top: -50%; left: -10%; width: 120%; height: 200%; background: radial-gradient(circle, rgba(190,18,60,0.15) 0%, transparent 60%); pointer-events: none;"></div>
      <h2 style="position: relative; color: #ffffff; font-size: 52px; font-weight: 900; margin: 0 0 25px 0; text-transform: uppercase; letter-spacing: 3px; text-shadow: 3px 5px 10px rgba(0,0,0,0.5);">
        💰 LLEVATE ${lotteryPrize.toUpperCase()} 💰
      </h2>
      <div style="position: relative; display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.25); padding: 25px 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: inset 0 4px 10px rgba(0,0,0,0.3);">
        <div style="display: flex; flex-direction: column; gap: 8px; text-align: center; flex: 1;">
          <span style="font-size: 18px; color: #94a3b8; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">🎁 Premio Principal</span>
          <span style="font-size: 42px; font-weight: 900; color: #fbbf24; text-shadow: 2px 3px 5px rgba(0,0,0,0.4);">${lotteryPrize}</span>
        </div>
        <div style="width: 2px; height: 80px; background: rgba(255,255,255,0.1);"></div>
        <div style="display: flex; flex-direction: column; gap: 8px; text-align: center; flex: 1;">
          <span style="font-size: 18px; color: #94a3b8; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">📅 Fecha del Sorteo</span>
          <span style="font-size: 38px; font-weight: 900; color: #e2e8f0; text-shadow: 2px 3px 5px rgba(0,0,0,0.4);">${lotteryDate}</span>
        </div>
        <div style="width: 2px; height: 80px; background: rgba(255,255,255,0.1);"></div>
        <div style="display: flex; flex-direction: column; gap: 8px; text-align: center; flex: 1;">
          <span style="font-size: 18px; color: #94a3b8; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">🎟️ Precio por Boleto</span>
          <span style="font-size: 42px; font-weight: 900; color: #4ade80; text-shadow: 2px 3px 5px rgba(0,0,0,0.4);">$${ticketPrice} Pesos</span>
        </div>
      </div>
    </div>
  `;

  const handleViewPublicTable1000 = () => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const finalHtml = `
      <html>
        <head>
          <title>Tablas de Control (5 Partes)</title>
          <style>
            body { font-family: 'Arial Narrow', Arial, sans-serif; background: #f1f5f9; padding: 20px; }
            .page { background: white; border: 1px solid #cbd5e1; padding: 25px; margin-bottom: 30px; border-radius: 12px; max-width: 1500px; margin-left: auto; margin-right: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);}
            .grid-4-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .part-title { text-align:center; color:#334155; margin-bottom: 15px; font-size: 26px; font-family: Arial, sans-serif; font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="page">${getHeaderHtml1000()}<h3 class="part-title">PARTE 1: NÚMEROS DEL 000 AL 199</h3><div class="grid-4-cols"><div>${createTableBlock1000(0, 49, ticketMap)}</div><div>${createTableBlock1000(50, 99, ticketMap)}</div><div>${createTableBlock1000(100, 149, ticketMap)}</div><div>${createTableBlock1000(150, 199, ticketMap)}</div></div></div>
          <div class="page">${getHeaderHtml1000()}<h3 class="part-title">PARTE 2: NÚMEROS DEL 200 AL 399</h3><div class="grid-4-cols"><div>${createTableBlock1000(200, 249, ticketMap)}</div><div>${createTableBlock1000(250, 299, ticketMap)}</div><div>${createTableBlock1000(300, 349, ticketMap)}</div><div>${createTableBlock1000(350, 399, ticketMap)}</div></div></div>
          <div class="page">${getHeaderHtml1000()}<h3 class="part-title">PARTE 3: NÚMEROS DEL 400 AL 599</h3><div class="grid-4-cols"><div>${createTableBlock1000(400, 449, ticketMap)}</div><div>${createTableBlock1000(450, 499, ticketMap)}</div><div>${createTableBlock1000(500, 549, ticketMap)}</div><div>${createTableBlock1000(550, 599, ticketMap)}</div></div></div>
          <div class="page">${getHeaderHtml1000()}<h3 class="part-title">PARTE 4: NÚMEROS DEL 600 AL 799</h3><div class="grid-4-cols"><div>${createTableBlock1000(600, 649, ticketMap)}</div><div>${createTableBlock1000(650, 699, ticketMap)}</div><div>${createTableBlock1000(700, 749, ticketMap)}</div><div>${createTableBlock1000(750, 799, ticketMap)}</div></div></div>
          <div class="page">${getHeaderHtml1000()}<h3 class="part-title">PARTE 5: NÚMEROS DEL 800 AL 999</h3><div class="grid-4-cols"><div>${createTableBlock1000(800, 849, ticketMap)}</div><div>${createTableBlock1000(850, 899, ticketMap)}</div><div>${createTableBlock1000(900, 949, ticketMap)}</div><div>${createTableBlock1000(950, 999, ticketMap)}</div></div></div>
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  const handleDownloadImages1000 = async () => {
    const toastId = toast.loading("⏳ Generando 5 imágenes de 200 boletos...");

    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const createPageWrapper = (id, title, colsArray) => `
      <div id="${id}" style="background: #ffffff; padding: 30px; width: 1500px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 20px;">
        ${getHeaderHtml1000()}
        <h3 style="text-align:center; color:#334155; font-size: 28px; margin-bottom: 20px; font-family: Arial, sans-serif; font-weight: 900;">${title}</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
          ${colsArray.map(c => `<div>${c}</div>`).join('')}
        </div>
      </div>
    `;

    const contents = [
      createPageWrapper("export-img-1", "PARTE 1: NÚMEROS DEL 000 AL 199", [
        createTableBlock1000(0, 49, ticketMap), createTableBlock1000(50, 99, ticketMap),
        createTableBlock1000(100, 149, ticketMap), createTableBlock1000(150, 199, ticketMap)
      ]),
      createPageWrapper("export-img-2", "PARTE 2: NÚMEROS DEL 200 AL 399", [
        createTableBlock1000(200, 249, ticketMap), createTableBlock1000(250, 299, ticketMap),
        createTableBlock1000(300, 349, ticketMap), createTableBlock1000(350, 399, ticketMap)
      ]),
      createPageWrapper("export-img-3", "PARTE 3: NÚMEROS DEL 400 AL 599", [
        createTableBlock1000(400, 449, ticketMap), createTableBlock1000(450, 499, ticketMap),
        createTableBlock1000(500, 549, ticketMap), createTableBlock1000(550, 599, ticketMap)
      ]),
      createPageWrapper("export-img-4", "PARTE 4: NÚMEROS DEL 600 AL 799", [
        createTableBlock1000(600, 649, ticketMap), createTableBlock1000(650, 699, ticketMap),
        createTableBlock1000(700, 749, ticketMap), createTableBlock1000(750, 799, ticketMap)
      ]),
      createPageWrapper("export-img-5", "PARTE 5: NÚMEROS DEL 800 AL 999", [
        createTableBlock1000(800, 849, ticketMap), createTableBlock1000(850, 899, ticketMap),
        createTableBlock1000(900, 949, ticketMap), createTableBlock1000(950, 999, ticketMap)
      ])
    ];

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = contents.join("");
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      for (let i = 1; i <= 5; i++) {
        const element = document.getElementById(`export-img-${i}`);
        const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Boletos_Sorteo_Parte_${i}.png`;
        link.click();
      }

      toast.update(toastId, { render: "✅ ¡Las 5 imágenes se descargaron con éxito!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Error al procesar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const handleViewPublicGrid = () => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      ticketMap.set(num, t);
    });

    let boxesHtml = "";
    for (let i = 0; i < 1000; i++) {
      const num = i.toString().padStart(3, "0");
      const t = ticketMap.get(num);
      const isTaken = t && (t.sold || t.availability === false);

      if (isTaken) {
        boxesHtml += `<div class="ticket-box taken"></div>`;
      } else {
        boxesHtml += `<div class="ticket-box avail">${num}</div>`;
      }
    }

    const gridHtml = `
      <html>
        <head>
          <title>Cuadrícula de Boletos - Disponibilidad</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f1f5f9; padding: 20px; margin: 0; }
            .header-container { max-width: 1300px; margin: 0 auto 20px auto; }
            .legend-container { display: flex; justify-content: center; gap: 30px; margin-bottom: 20px; background: #1e293b; padding: 15px; border-radius: 12px; color: white; }
            .legend-item { display: flex; align-items: center; gap: 10px; font-weight: bold; font-size: 16px; }
            .legend-box { width: 24px; height: 24px; border-radius: 4px; }
            .legend-avail { background: #ffffff; border: 2px solid #0f172a; }
            .legend-taken { background: #0f172a; border: 2px solid #0f172a; }
            .grid-container { display: grid; grid-template-columns: repeat(32, 1fr); gap: 4px; max-width: 1300px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .ticket-box { aspect-ratio: 1 / 1; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 13px; font-weight: 900; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .avail { background: #ffffff; color: #0f172a; border: 1.5px solid #94a3b8; }
            .taken { background: #0f172a; color: transparent; border: 1.5px solid #0f172a; }
          </style>
        </head>
        <body>
          <div class="header-container">
            ${getHeaderHtml1000()}
            <div class="legend-container">
              <div class="legend-item"><div class="legend-box legend-avail"></div> Boleto Disponible</div>
              <div class="legend-item"><div class="legend-box legend-taken"></div> Boleto Ocupado</div>
            </div>
          </div>
          <div class="grid-container">${boxesHtml}</div>
        </body>
      </html>
    `;

    const win = window.open();
    win.document.write(gridHtml);
    win.document.close();
  };

  // ==========================================
  // 🔹 MÓDULO 2: TABLAS DE 250 BOLETOS (4 OPORTUNIDADES)
  // ==========================================

  const renderBlock250 = (start, end, ticketMap, isFour) => {
    return `<table>
      <colgroup>
        <col style="width: 52px;">
        ${isFour ? `
          <col style="width: 52px;">
          <col style="width: 52px;">
          <col style="width: 52px;">
        ` : ''}
        <col style="width: auto;">
      </colgroup>
      <thead>
        <tr>
          <th colspan="${isFour ? 4 : 1}">NÚMEROS</th>
          <th style="text-align: left; padding-left: 12px;">NOMBRES:</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from({ length: end - start + 1 }, (_, index) => {
          const i = start + index;
          const b = i.toString().padStart(3, "0");
          const name = ticketMap.get(b) || "";
          const rowClass = name ? 'sold-row' : '';

          const numCells = isFour
            ? `<td class="base-num">${b}</td>
               <td class="base-num">${i + 250}</td>
               <td class="base-num">${i + 500}</td>
               <td class="base-num">${i + 750}</td>`
            : `<td class="base-num">${b}</td>`;

          return `<tr class="${rowClass}">
            ${numCells}
            <td class="name-td" title="${name}">${name}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  };

  const handleViewPublicTable250 = () => {
    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const isFour = opportunitiesCount === 4;

    const finalHtml = `
      <html>
        <head>
          <title>Tablas de Control 250 - Sorteo</title>
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
              <div class="col">${renderBlock250(0, 49, ticketMap, isFour)}</div>
              <div class="col">${renderBlock250(50, 99, ticketMap, isFour)}</div>
            </div>
          </div>
          <div class="page">
            <div class="split">
              <div class="col">${renderBlock250(100, 149, ticketMap, isFour)}</div>
              <div class="col">${renderBlock250(150, 199, ticketMap, isFour)}</div>
            </div>
          </div>
          <div class="page">
            <div style="max-width: 480px; margin: auto;">
              ${renderBlock250(200, 249, ticketMap, isFour)}
            </div>
          </div>
        </body>
      </html>`;

    const win = window.open();
    win.document.write(finalHtml);
    win.document.close();
  };

  const handleDownloadImages250 = async () => {
    const toastId = toast.loading("⏳ Generando imágenes de 250 boletos (4 oportunidades)...");

    const ticketMap = new Map();
    rowData.forEach((t) => {
      const num = t.ticketNumber.toString().padStart(3, "0");
      const name = t.user && t.user.trim() !== "" ? t.user.split(" (")[0].toUpperCase() : "";
      ticketMap.set(num, name);
    });

    const isFour = opportunitiesCount === 4;

    const renderBlockInline250 = (start, end) => {
      let html = `<table style="border-collapse: collapse; width: 100%; table-layout: fixed; font-family: 'Arial Narrow', Arial, sans-serif;">
        <colgroup>
          <col style="width: 52px;">
          ${isFour ? `
            <col style="width: 52px;">
            <col style="width: 52px;">
            <col style="width: 52px;">
          ` : ''}
          <col style="width: auto;">
        </colgroup>
        <thead>
          <tr>
            <th colspan="${isFour ? 4 : 1}" style="border: 1px solid #cbd5e1; background: #0f172a; color: #ffffff; padding: 10px 4px; font-size: 14px; font-weight: bold; text-align: center;">NÚMEROS</th>
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

        const numCells = isFour
          ? `<td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${b}</td>
             <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 250}</td>
             <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 500}</td>
             <td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${i + 750}</td>`
          : `<td style="border: 1px solid #cbd5e1; padding: 6px 2px; text-align: center; font-size: 19px; ${numColor}">${b}</td>`;

        html += `<tr style="${rowBg}">
          ${numCells}
          <td style="border: 1px solid #cbd5e1; padding: 6px 2px; ${nameStyle}">${name}</td>
        </tr>`;
      }
      return html + `</tbody></table>`;
    };

    const createPageWrapper250 = (id, content) => `
      <div id="${id}" style="background: #ffffff; padding: 15px; width: 950px; font-family: 'Arial Narrow', Arial, sans-serif; box-sizing: border-box; margin-bottom: 20px;">
        ${content}
      </div>
    `;

    const bannerHtml250 = `
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border: 1px solid #334155; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: #f8fafc; font-size: 26px; font-weight: 900; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;">🎉 Gran Sorteo Efectivo 🎉</h2>
        <div style="display: flex; justify-content: space-around; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎁 Premio Principal</span>
            <span style="font-size: 18px; font-weight: 900; color: #fbbf24;">${lotteryPrize}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">📅 Fecha del Sorteo</span>
            <span style="font-size: 18px; font-weight: bold; color: #e2e8f0;">${lotteryDate}</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; text-align: center;">
            <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">🎟️ Precio por Boleto</span>
            <span style="font-size: 18px; font-weight: 900; color: #22c55e;">$${ticketPrice} Pesos</span>
          </div>
        </div>
      </div>
    `;

    const content1 = `${bannerHtml250}<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline250(0, 49)}</div><div style="flex: 1;">${renderBlockInline250(50, 99)}</div></div>`;
    const content2 = `<div style="display: flex; gap: 20px;"><div style="flex: 1;">${renderBlockInline250(100, 149)}</div><div style="flex: 1;">${renderBlockInline250(150, 199)}</div></div>`;
    const content3 = `<div style="max-width: 480px; margin: auto;">${renderBlockInline250(200, 249)}</div>`;

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.innerHTML = createPageWrapper250("export-img-250-1", content1) + createPageWrapper250("export-img-250-2", content2) + createPageWrapper250("export-img-250-3", content3);
    document.body.appendChild(tempContainer);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`export-img-250-${i}`);
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `Tabla_250_Oportunidades_Parte_${i}.png`;
        link.click();
      }

      toast.update(toastId, { render: "✅ ¡Tablas de 250 descargadas con éxito!", type: "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error("Error al generar imágenes:", error);
      toast.update(toastId, { render: "❌ Ocurrió un error al procesar las imágenes.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      {/* BARRA SUPERIOR DE ACCIONES */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text"
          id="quickFilter"
          placeholder="🔍 Buscar participante o número..."
          onChange={onQuickFilterChanged}
          style={{ flex: 1, minWidth: "150px", padding: "10px", borderRadius: "5px", border: "1px solid #444", backgroundColor: "#1e1e1e", color: "white" }}
        />

        {/* Botones Modo 1000 números */}
        <button onClick={handleViewPublicGrid} style={{ padding: "10px 14px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          🔲 Cuadrícula 1000
        </button>

        <button onClick={handleViewPublicTable1000} style={{ padding: "10px 14px", backgroundColor: "#be123c", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          📸 HTML 1000 (5 Partes)
        </button>

        <button onClick={handleDownloadImages1000} style={{ padding: "10px 14px", backgroundColor: "#0284c7", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          ⬇️ Img 1000 (5 Pzas)
        </button>

        {/* Separador vertical */}
        <div style={{ width: "1px", height: "30px", backgroundColor: "#475569", margin: "0 4px" }}></div>

        {/* Botones Modo 250 números con 4 oportunidades */}
        <button onClick={handleViewPublicTable250} style={{ padding: "10px 14px", backgroundColor: "#9333ea", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          📸 HTML 250 (4 Oportunidades)
        </button>

        <button onClick={handleDownloadImages250} style={{ padding: "10px 14px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
          ⬇️ Img 250 (3 Pzas)
        </button>
      </div>

      {/* TABLA PRINCIPAL DE CONTROL */}
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
