import React from "react";

export function Checkbox({ id, checked, onCheckedChange, className = "", ...props }) {
  const handleChange = (e) => {
    if (typeof onCheckedChange === "function") {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={handleChange}
      className={`h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
}


