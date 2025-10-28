import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface HSocialLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const HSocialLogo = ({ className = "", showText = true, size = "md", onClick }: HSocialLogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={`flex items-center gap-1.5 group ${className}`}>
      {/* 1. CAMBIO: Aplicado el degradado de color (bg-gradient-to-br from-blue-500 to-purple-600) */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-110 transition-transform duration-300`}
      >
        <span className="text-lg">H</span>
      </div>
      {showText && (
        // 2. CAMBIO: Color del texto 'Social' cambiado a morado (text-purple-600)
        <span className={`${textSizeClasses[size]} font-bold text-purple-600`}>Social</span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link to="/" className="cursor-pointer">
      {content}
    </Link>
  );
};
