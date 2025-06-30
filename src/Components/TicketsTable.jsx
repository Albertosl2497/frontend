import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ticket.css";

// Copiar nombre en mayúsculas
const copyUserName = (userName) => {
  const [name] = userName.split(" (");
  const uppercaseName = name.trim().toUpperCase();
  navigator.clipboard.writeText(uppercaseName);
  toast.success("Nombre de usuario copiado exitosamente");
};

// Exportar todos los boletos con nombre (aunque esté vacío)
const exportVerticalPatternAsDoc = (tickets) => {
  const ticketMap = new Map();
  tickets.forEach((ticket) => {
    const number = String(ticket.ticketNumber).padStart(3, "0");
    const name =
      ticket.user && ticket.user.trim() !== ""
        ? ticket.user.split(" (")[0].toUpperCase()
        : "";
    ticketMap.set(number, name);
  });

  let tableHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>Boletos</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 13px;
          }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Lista de Boletos</h2>
        <table>
          <thead>
            <tr>
              <th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th>
            </tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i <= 249; i++) {
    const row = [];
    const baseNumbers = [];
    for (let offset = 0; offset <= 750; offset += 250) {
      const num = i + offset;
      const numberStr = String(num).padStart(3, "0");
      baseNumbers.push(numberStr);
      row.push(`<td>${numberStr}</td>`);
    }
    const name = ticketMap.get(baseNumbers[0]) || "";
    tableHtml += `<tr>${row.join("")}<td>${name}</td></tr>`;
  }

  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], {
    type: "application/msword;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_formato_tabla.doc";
  link.click();
  toast.success("Archivo .doc con todos los boletos descargado");
};

// Exportar solo boletos no vendidos y sin nombre
const exportOnlyAvailableTicketsAsDoc = (tickets) => {
  const ticketMap = new Map();

  tickets.forEach((ticket) => {
    const isEmptyName = !ticket.user || ticket.user.trim() === "";
    if (!ticket.sold && isEmptyName) {
      const number = String(ticket.ticketNumber).padStart(3, "0");
      ticketMap.set(number, "");
    }
  });

  let tableHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="UTF-8">
        <title>Boletos No Vendidos Sin Nombre</title>
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 13px;
          }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center">Boletos No Vendidos Sin Nombre</h2>
        <table>
          <thead>
            <tr>
              <th>000</th><th>250</th><th>500</th><th>750</th><th>NOMBRE</th>
            </tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i <= 249; i++) {
    const row = [];
    const baseNumbers = [];
    for (let offset = 0; offset <= 750; offset += 250) {
      const num = i + offset;
      const numberStr = String(num).padStart(3, "0");
      baseNumbers.push(numberStr);
      row.push(`<td>${numberStr}</td>`);
    }
    const name = ticketMap.get(baseNumbers[0]) || "";
    if (ticketMap.has(baseNumbers[0])) {
      tableHtml += `<tr>${row.join("")}<td>${name}</td></tr>`;
    }
  }

  tableHtml += `</tbody></table></body></html>`;

  const blob = new Blob([tableHtml], {
    type: "application/msword;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "boletos_no_vendidos_sin_nombre.doc";
  link.click();
  toast.success("Archivo .doc solo con boletos sin nombre descargado");
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
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  const onCellDoubleClicked = (params) => {
    const ticketToUpdate = params.data;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    if (params.colDef.field === "sold" || params.colDef.field === "availability") {
      let url = `https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${!ticketToUpdate[params.colDef.field]}`;
      fetch(url, requestOptions)
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Sold Tickets can not be made available") {
            toast.error(data.message);
            return;
          }
          const updatedData = [...rowData];
          const rowIndex = updatedData.findIndex((row) => row.ticketNumber === ticketToUpdate.ticketNumber);
          const updatedTicket = { ...ticketToUpdate };
          updatedTicket[params.colDef.field] = !updatedTicket[params.colDef.field];

          if (params.colDef.field === "sold") {
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
    }
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
          style={{ backgroundColor: "black", color: "white", border: "none" }}
        />
        <button
          onClick={() => exportVerticalPatternAsDoc(rowData)}
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
          Descargar Todos (.doc)
        </button>
        <button
          onClick={() => exportOnlyAvailableTicketsAsDoc(rowData)}
          style={{
            marginLeft: 10,
            padding: "10px 20px",
            backgroundColor: "#009688",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Descargar No Vendidos (.doc)
        </button>
      </div>

      <div className="ag-theme-alpine-dark">
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
