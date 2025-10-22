import React from "react";

export function Card({ children, className }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={`mb-2 ${className || ""}`}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={`text-lg font-bold ${className || ""}`}>{children}</h2>;
}

export function CardContent({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return <div className={`mt-4 flex justify-end ${className || ""}`}>{children}</div>;
}
