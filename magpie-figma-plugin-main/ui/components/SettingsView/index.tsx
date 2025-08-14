import * as React from "react";
import MySelect from "../Select";
import "../DetailView/index.css";

const BackCaret = () => (
  <svg width="10" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2 2 8l7 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const imageOptions = [
  { value: "1920", label: "1920px width (1080p)" },
  { value: "1280", label: "1280px width (720p)" },
  { value: "1x", label: "1x target container width" },
  { value: "2x", label: "2x target container width" },
];

const fillModeOptions = [
  { value: "smart", label: "Smart fill (prioritize existing images)" },
  { value: "all", label: "Fill all nodes" },
  { value: "parent", label: "Fill parent only" },
  { value: "children", label: "Fill children only" },
];

const SettingsView = ({ onBackClick, insertWidth, setInsertWidth, fillMode, setFillMode }) => {
  return (
    <>
      <div className="detail-view-header">
        <button onClick={onBackClick}>
          <BackCaret />
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <p>Constrain inserted image asset width:</p>

        <MySelect
          value={insertWidth}
          defaultValue={imageOptions[0]["value"]}
          labelWhenDefault={imageOptions[0]["label"]}
          onChange={(event) => {
            parent.postMessage({
              pluginMessage: { type: 'save insert width', insertWidth: event.target.value }
            }, '*')
            setInsertWidth(event.target.value);
          }}
          options={imageOptions}
        />

        <p style={{ marginTop: '20px' }}>Fill behavior:</p>

        <MySelect
          value={fillMode}
          defaultValue={fillModeOptions[0]["value"]}
          labelWhenDefault={fillModeOptions[0]["label"]}
          onChange={(event) => {
            // Only update the UI state, don't persist to storage
            // This will reset to "smart" on plugin restart
            setFillMode(event.target.value);
          }}
          options={fillModeOptions}
        />
      </div>
    </>
  );
};

export default SettingsView;
