import React, { useState } from "react";
import "./Modal.css";
import { ClipLoader } from "react-spinners";

function Modal({ show, onClose, onConfirm, title, message, loading }) {
  const modalStyle = show ? {} : { display: "none" };

  return (
    <div>
      {show && <div className="overlay"></div>}
      <div className="modal-container" style={modalStyle}>
        <div className="modal-header">
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} className="success">
            {loading ? <ClipLoader color="white" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
