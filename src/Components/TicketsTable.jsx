import { useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
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
          `http://localhost:5000/api/tickets/sold-ticket/${lotteryNo}/${
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
            toast.success("Ticket status updated successfully");
          })
          .catch((error) => {
            console.error(error);
            toast.error("Error updating ticket status");
          });
      } else {
        const value = ticketToUpdate.availability;
        fetch(
          `http://localhost:5000/api/tickets/claim-ticket/${lotteryNo}/${ticketToUpdate.ticketNumber}/${value}`,
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
      headerName: "Ticket No",
      field: "ticketNumber",
      sortable: true,
      resizable: true,
    },
    {
      headerName: "Status",
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
        return params.value ? "Sold" : "Unsold";
      },
    },
    {
      headerName: "Availability",
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
        return params.value ? "Available" : "Unavailable";
      },
    },
    {
      headerName: "Ticket Owner",
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
          paginationPageSize={10}
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
