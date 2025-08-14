import * as React from "react";
import "./index.css";

const VPNCheckingState = ({ isRetrying = false }) => (
  <div className="vpn-checking-state">
    <div className="vpn-checking-container">
      <div className="vpn-checking-spinner">
        <svg className="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      
      <h3 className="vpn-checking-title">
        {isRetrying ? "Checking VPN connection..." : "Looking for VPN..."}
      </h3>
      
      <p className="vpn-checking-description">
        {isRetrying ? 
          "Continuously checking for VPN connection. Connect to VPN to access the content library." :
          "Checking VPN connection to access the content library."
        }
      </p>
    </div>
  </div>
);

export default VPNCheckingState;
