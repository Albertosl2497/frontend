import { AgGridReact } from "ag-grid-react";
import React, { useEffect, useState } from "react";

function UsersTable() {
  const [rowData, setRowData] = useState([]);

  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const columnsDef = [
    {
      headerName: "User",
      children: [
        {
          field: "user.fullName",
          headerName: "Full Name",
          sortable: true,
          resizable: true,
        },
        {
          field: "user.email",
          headerName: "Email",
          sortable: true,
          resizable: true,
        },
        {
          field: "user.phoneNumber",
          headerName: "Phone Number",
          sortable: true,
          resizable: true,
        },
        {
          field: "user.state",
          headerName: "State",
          sortable: true,
          resizable: true,
        },
        {
          field: "user.city",
          headerName: "City",
          sortable: true,
          resizable: true,
        },
      ],
    },
    {
      headerName: "Booked Tickets",
      field: "bookedTickets",
      sortable: true,
      valueGetter: (params) => {
        return params.data.bookedTickets
          .map((ticket) => ticket.ticketNumbers.join(", "))
          .join("\n");
      },
      resizable: true,
    },
    {
      headerName: "Sold Tickets",
      field: "soldTickets",
      sortable: true,
      valueGetter: (params) => {
        return params.data.soldTickets.map((ticket) =>
          ticket.ticketNumbers.join(", ")
        );
      },
      resizable: true,
    },
  ];

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  const onQuickFilterChanged = () => {
    gridApi.setQuickFilter(document.getElementById("quickFilter").value);
  };

  useEffect(() => {
    const getUsers = async () => {
      fetch("https://rifasefectivocampotreinta.onrender.com/api/users/latest-lottery")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setRowData(data); // do something with the response data
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    };

    getUsers();
  }, []);
  return (
    <div style={{ width: "100%", marginTop: 20 }}>
      <input
        type="text"
        id="quickFilter"
        placeholder="Search..."
        onChange={onQuickFilterChanged}
        style={{ backgroundColor: "black", color: "white", border: "none" }}
      />
      <div className="ag-theme-alpine-dark">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnsDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={100}
          rowSelection={"single"}
          editType={"fullRow"}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
}

export default UsersTable;
