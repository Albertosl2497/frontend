import { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ticket.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Definimos la función copyUserName fuera del componente
const copyUserName = (userName) => {
  // Dividir el nombre de usuario y el correo electrónico
  const [name, email] = userName.split(' (');
  const uppercaseName = name.trim().toUpperCase(); // Convertir el nombre a mayúsculas
  navigator.clipboard.writeText(uppercaseName); // Copiar el nombre de usuario en mayúsculas
  toast.success("Nombre de usuario copiado exitosamente");
};

function TicketTable({ tickets, lotteryNo, setStats, stats }) {
  const onCellDoubleClicked = (params) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    let isChanged = false;
    if (
      params.colDef.field === "sold" ||
      params.colDef.field === "availability"
    ) {
      const ticketToUpdate = params.data;
      let newStatus, newAvailability;
      if (params.colDef.field === "sold") {
        let value = ticketToUpdate.sold;
        fetch(
          `https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${
            ticketToUpdate.ticketNumber
          }/${!value}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((data) => {
            newStatus = ticketToUpdate.sold ? false : true;
            newAvailability = ticketToUpdate.availability;
            isChanged = true;
            if (isChanged) {
              const updatedData = [...rowData];
              const updatedTicket = {
                ...ticketToUpdate,
                sold: newStatus,
                availability: !newStatus,
              };
              const rowIndex = updatedData.findIndex((row) => {
                return row.ticketNumber === ticketToUpdate.ticketNumber;
              });

              let soldCount = newStatus ? 1 : -1;

              setStats({
                soldCount: stats.soldCount + soldCount,
                bookedCount: stats.bookedCount,
              });

              updatedData[rowIndex] = updatedTicket;
              setRowData(updatedData);
            }
            toast.success("Estado del boleto actualizado exitosamente");
          })
          .catch((error) => {
            console.error(error);
            toast.error("Error al actualizar el estado del boleto");
          });
      } else {
        const value = ticketToUpdate.availability;
        fetch(
          `https://rifasefectivocampotreinta.onrender.com/api/tickets/claim-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${value}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "Sold Tickets can not be made available") {
              toast.error(data.message);
              return;
            }

            newStatus = ticketToUpdate.sold;
            newAvailability = ticketToUpdate.availability ? false : true;
            isChanged = true;
            if (isChanged) {
              const updatedData = [...rowData];
              const updatedTicket = {
                ...ticketToUpdate,
                sold: newAvailability ? false : newStatus,
                availability: newAvailability,
              };

              let bookedCount = !newAvailability ? 1 : -1;

              setStats({
                soldCount: stats.soldCount,
                bookedCount: stats.bookedCount + bookedCount,
              });

              const rowIndex = updatedData.findIndex((row) => {
                return row.ticketNumber === ticketToUpdate.ticketNumber;
              });

              updatedData[rowIndex] = updatedTicket;
              setRowData(updatedData);
            }
            toast.success("Ticket availability updated successfully");
          })
          .catch((error) => {
            console.error(error);
            toast.error("Error updating ticket availability");
          });
      }
    }
  };

  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  const columnDefs = [
    {
  headerName: "Boletos #",
      field: "ticketNumber",
      sortable: true,
      resizable: true,
       },
    {
      headerName: "Propietario",
      field: "user",
      flex: 1,
      resizable: true,
      sortable: true,
      width: 110,
      cellRenderer: function (params) {
        return params.value;
      },
    },
    {
      headerName: "Estado",
      field: "sold",
      editable: true,
      sortable: true,
      resizable: true,
      width: 130,
      cellClassRules: {
        "cell-value-green": function (params) {
          return !params.value;
        },
        "cell-value-red": function (params) {
          return params.value;
        },
      },
      cellRenderer: function (params) {
        return params.value ? "Pagado" : "No Pagado";
      },
    },
    {
      headerName: "Disponibilidad",
      field: "availability",
      editable: true,
      sortable: true,
      resizable: true,
      width: 130,
      cellClassRules: {
        "cell-value-green": function (params) {
          return !params.value;
        },
        "cell-value-red": function (params) {
          return params.value;
        },
      },
      cellRenderer: function (params) {
        return params.value ? "Disponible" : "No Disponible";
      },
    },

    {
      headerName: "Copiar Usuario",
      field: "user",
      width: 110,
      cellRendererFramework: (params) => (
        <button onClick={() => copyUserName(params.value)}
        style={{ backgroundColor: "blue", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}
          >Copiar</button>
      ),
    },
    
  ];

  useEffect(() => {
    setRowData(tickets || []);
  }, [tickets]);

  return (
    <div style={{ width: "100%", marginTop: 20, height: "100%" }}>
      <input
        type="text"
        id="quickFilter"
        placeholder="Search..."
        onChange={onQuickFilterChanged}
        style={{
          backgroundColor: "black",
          color: "white",
          border: "none",
        }}
      />
      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onCellDoubleClicked={onCellDoubleClicked} // add
          pagination={true}
          paginationPageSize={1000}
          rowSelection={"single"}
          editType={"fullRow"}
          detailRowAutoHeight={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default TicketTable;
