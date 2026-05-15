import React from "react";

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <h1 className="text-center">{message}</h1>
      <div className="spinner-border mt-3" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
    </div>
  );
};

export default Spinner;
