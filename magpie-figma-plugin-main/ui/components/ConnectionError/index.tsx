import * as React from "react";
import "./index.css";

import tailscaleImg from "./tailscale.png";

const ConnectionError = ({ error, onRetry }) => (
  <div className="connection-error">
    <div className="error-container">
      <div className="vpn-section">
        <div className="vpn-header">
          <h3>VPN Connection Required</h3>
        </div>
        <p className="vpn-description">
          You must be connected to the VPN to access the plugin.
        </p>
        <div className="vpn-instructions">
          <img src={tailscaleImg} alt="Tailscale VPN connection interface" />
          <p className="instruction-text">
            Make sure Tailscale is connected as shown above
          </p>
        </div>
        {onRetry && (
          <div className="retry-section">
            <button className="retry-button" onClick={onRetry}>
              Retry Connection
            </button>
          </div>
        )}
      </div>

      <div className="help-section">
        <svg className="help-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#6b7280" strokeWidth="2" fill="none"/>
        </svg>
        <p className="help-text">
          Need help? Join{" "}
          <a href="https://roku.slack.com/archives/C040002BMFY" className="help-link">
            #magpie-figma-plugin
          </a>{" "}
          in Slack for support and feedback.
        </p>
      </div>
    </div>
  </div>
);

export default ConnectionError;
