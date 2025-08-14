import * as React from "react";
import "./index.css";

const BackCaret = () => (
  <svg width="10" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2 2 8l7 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const DataConsole = ({ onBackClick, data }) => {
  return (
    <>
      <div className="data-console-header">
        <button onClick={onBackClick}>
          <BackCaret />
        </button>
        <h1>Select layers to show IDs below</h1>
      </div>
      <div className="data-console-content">
        {data.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </>
  );
};

export default DataConsole;
