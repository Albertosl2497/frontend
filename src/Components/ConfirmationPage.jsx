import React from 'react';

function ConfirmationPage({ selectedTickets, totalPrice }) {
  return (
    <div>
      <h2>Confirmación de Compra</h2>
      <p>Cantidad de boletos: {selectedTickets.length}</p>
      <p>Costo total: ${totalPrice}</p>
      {/* Otros detalles de confirmación */}
    </div>
  );
}

export default ConfirmationPage;

