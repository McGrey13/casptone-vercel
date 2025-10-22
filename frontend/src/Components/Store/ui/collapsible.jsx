import React, { useState } from "react";

export function Collapsible({ children }) {
  return <div className="collapsible">{children}</div>;
}

export function CollapsibleTrigger({ children, onClick }) {
  return (
    <button onClick={onClick} className="collapsible-trigger">
      {children}
    </button>
  );
}

export function CollapsibleContent({ isOpen, children }) {
  if (!isOpen) return null;
  return <div className="collapsible-content">{children}</div>;
}
