import React from "react";

export function Alert({ children, className = "", ...props }) {
  return (
    <div
      role="alert"
      className={`border-l-4 border-red-500 bg-red-50 p-4 text-red-700 rounded-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}
