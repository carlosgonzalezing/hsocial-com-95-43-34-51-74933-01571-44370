import { Link } from "react-router-dom";
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
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Minimal monochrome logo: blanco/negro, minimalista y profesional */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-white border border-gray-200 dark:bg-transparent dark:border-gray-600 flex items-center justify-center text-black dark:text-white font-semibold transition-transform duration-200`}
        aria-hidden
      >
        <span className="text-lg leading-none">H</span>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-medium text-slate-800 dark:text-slate-200`}>Social</span>
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
