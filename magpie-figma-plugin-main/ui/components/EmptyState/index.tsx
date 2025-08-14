import * as React from "react";
import "./index.css";

const EmptyState = ({ searchValue, hasFilters }) => (
  <div className="empty-state">
    <div className="empty-container">
      <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2"/>
        <path d="m21 21-4.35-4.35" stroke="#9ca3af" strokeWidth="2"/>
        <circle cx="11" cy="11" r="3" stroke="#d1d5db" strokeWidth="2"/>
      </svg>
      
      <h3 className="empty-title">
        {searchValue ? "No results found" : "Ready to search"}
      </h3>
      
      <p className="empty-description">
        {searchValue ? (
          <>
            No images match your search for <strong>"{searchValue}"</strong>
            {hasFilters && " with the current filters"}. 
            Try adjusting your search terms or filters.
          </>
        ) : (
          "Search for images to get started. You can also use filters to narrow down results."
        )}
      </p>
      
      {(searchValue || hasFilters) && (
        <div className="empty-suggestions">
          <h4>Suggestions:</h4>
          <ul>
            <li>Try different keywords</li>
            <li>Check your spelling</li>
            {hasFilters && <li>Remove some filters</li>}
            <li>Use broader search terms</li>
          </ul>
        </div>
      )}
    </div>
  </div>
);

export default EmptyState;
