import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ticket.css";

import jsPDF from "jspdf";
import "jspdf-autotable";

const copyUserName = (userName) => {
  const [name] = userName.split(" (");
  const uppercaseName = name.trim().toUpperCase();
  navigator.clipboard.writeText(uppercaseName);
  toast.success("Nombre de usuario copiado exitosamente");
};

const PDF_PAGE_WIDTH = 612;  // 8.5 inch * 72
const PDF_PAGE_HEIGHT = 936; // 13 inch * 72

const generatePDF = (tickets, fileName, filterFn, title) => {
  const doc = new jsPDF({
    unit: "pt",
    format: [PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT],
  });

  doc.setFontSize(18);
  doc.text(title, PDF_PAGE_WIDTH / 2, 40, { align: "center" });

  // Filtrar tickets si filterFn definido
  const filteredTickets = filterFn
    ? tickets.filter(filterFn)
    : tickets;

  // Construir filas para la tabla, cada fila es:
  // [ "000", "250", "500", "750", "NOMBRE" ]
  // Como antes, agrupamos por bloques de 250 pero solo filas donde el base '000' exista en la lista filtrada

  // Crear mapa número -> usuario (solo mayúsculas para nombre)
  const ticketMap = new Map();
  filteredTickets.forEach((t) => {
    const numStr = t.ticketNumber.toString().padStart(3, "0");
    const userName = t.user ? t.user.split(" (")[0].toUpperCase() : "";
    ticketMap.set(numStr, userName);
  });

  // Crear filas para la tabla
  const rows = [];
  for (let i = 0; i <= 249; i++) {
    const rowNumbers = [];
    let includeRow = false;
    for (let offset = 0; offset <= 750; offset += 250) {
      const num = i + offset;
      const numStr = num.toString().padStart(3, "0");
      rowNumbers.push(numStr);
      if (ticketMap.has(numStr)) includeRow = true;
    }
    if (includeRow) {
      const name = ticketMap.get(rowNumbers[0]) || "";
      rows.push([...rowNumbers, name]);
    }
  }

  // Encabezados
  const headers = ["000", "250", "500", "750", "NOMBRE"];

  // Agregar tabla con autotable
  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 60,
    styles: { fontSize: 11, cellPadding: 4 },
    headStyles: { fillColor: [242, 242, 242], textColor: 20, fontStyle: "bold" },
    theme: "grid",
    margin: { top: 50, left: 40, right: 40 },
    columnStyles: {
      4: { cellWidth: 120 }, // Columna NOMBRE más ancha
    },
  });

  doc.save(fileName);
  toast.success(`Archivo ${fileName} descargado correctamente`);
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

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    fetch(
      `https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${!ticketToUpdate[field]}`,
      requestOptions
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Sold Tickets can not be made available") {
          toast.error(data.message);
          return;
        }

        const updatedData = [...rowData];
        const rowIndex = updatedData.findIndex(
          (row) => row.ticketNumber === ticketToUpdate.ticketNumber
        );
        const updatedTicket = { ...ticketToUpdate };
        updatedTicket[field] = !updatedTicket[field];

        if (field === "sold") {
          updatedTicket.availability = !updatedTicket.sold;
          const soldCount = updatedTicket.sold ? 1 : -1;
          setStats({ ...stats, soldCount: stats.soldCount + soldCount });
        } else {
          if (updatedTicket.availability) updatedTicket.sold = false;
          const bookedCount = updatedTicket.availability ? -1 : 1;
          setStats({ ...stats, bookedCount: stats.bookedCount + bookedCount });
        }

        updatedData[rowIndex] = updatedTicket;
        setRowData(updatedData);
        toast.success("Estado actualizado exitosamente");
      })
      .catch(() => toast.error("Error al actualizar estado"));
  };

  const columnDefs = [
    {
      headerName: "Boletos #",
      field: "ticketNumber",
      sortable: true,
      resizable: true,
      width: 80,
    },
    {
      headerName: "Propietario",
      field: "user",
      flex: 1,
      sortable: true,
      resizable: true,
    },
    {
      headerName: "Estado",
      field: "sold",
      editable: true,
      sortable: true,
      resizable: true,
      width: 130,
      cellClassRules: {
        "cell-value-green": (params) => !params.value,
        "cell-value-red": (params) => params.value,
      },
      cellRenderer: (params) => (params.value ? "Pagado" : "No Pagado"),
    },
    {
      headerName: "Disponibilidad",
      field: "availability",
      editable: true,
      sortable: true,
      resizable: true,
      width: 130,
      cellClassRules: {
        "cell-value-green": (params) => !params.value,
        "cell-value-red": (params) => params.value,
      },
      cellRenderer: (params) => (params.value ? "Disponible" : "No Disponible"),
    },
    {
      headerName: "Copiar Usuario",
      field: "user",
      width: 110,
      cellRendererFramework: (params) => (
        <button
          onClick={() => copyUserName(params.value)}
          style={{
            backgroundColor: "blue",
            color: "white",
            border: "none",
            padding: "10px 10px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Copiar
        </button>
      ),
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
          }}
        />
        <button
          onClick={() => generatePDF(rowData, "boletos_oficio.pdf", null, "Lista de Boletos")}
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
          Descargar PDF (Todos)
        </button>

        <button
          onClick={() =>
            generatePDF(
              rowData,
              "boletos_no_vendidos_sin_nombre_oficio.pdf",
              (t) => t.sold === false && (!t.user || t.user.trim() === ""),
              "Boletos No Vendidos Sin Nombre"
            )
          }
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            backgroundColor: "#009933",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Descargar PDF (No vendidos sin nombre)
        </button>
      </div>

      <div className="ag-theme-alpine-dark" style={{ width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked}
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
