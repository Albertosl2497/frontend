import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./ticket.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TicketTable({ tickets, lotteryNo, setStats, stats }) {
  const onCellDoubleClicked = (params) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    if (params.colDef.field === "sold") {
      const ticketToUpdate = params.data;
      const newValue = !ticketToUpdate.sold;

      // Solo si estamos cambiando de "pagado" a "no pagado", también cambiamos la disponibilidad
      const newAvailability = newValue ? ticketToUpdate.availability : true;

      fetch(
        `https://rifasefectivocampotreinta.onrender.com/api/tickets/sold-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${newValue}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          // Actualizamos el estado solo si no hay errores en la solicitud
          if (data.error) {
            toast.error(data.error);
          } else {
            const updatedData = [...rowData];
            const updatedTicket = {
              ...ticketToUpdate,
              sold: newValue,
              availability: newAvailability,
            };
            const rowIndex = updatedData.findIndex((row) => {
              return row.ticketNumber === ticketToUpdate.ticketNumber;
            });

            let soldCount = newValue ? 1 : -1;

            setStats({
              soldCount: stats.soldCount + soldCount,
              bookedCount: stats.bookedCount,
            });

            updatedData[rowIndex] = updatedTicket;
            setRowData(updatedData);
            toast.success("Estado del boleto actualizado exitosamente");
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error("Error al actualizar el estado del boleto");
        });
    }
  };

  const [rowData, setRowData] = useState([]);

  const columnDefs = [
    {
      headerName: "Boletos No.#",
      field: "ticketNumber",
      sortable: true,
      resizable: true,
    },
    {
      headerName: "Estado",
      field: "sold",
      editable: true,
      sortable: true,
      resizable: true,
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
      headerName: "Propietario",
      field: "user",
      flex: 1,
      resizable: true,
      sortable: true,
      cellRenderer: function (params) {
        return params.value;
      },
    },
  ];

  useEffect(() => {
    setRowData(tickets || []);
  }, [tickets]);

  return (
    <div style={{ width: "100%", marginTop: 20, height: "100%" }}>
      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onCellDoubleClicked={onCellDoubleClicked}
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
