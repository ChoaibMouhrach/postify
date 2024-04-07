import React from "react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg
      className={cn("w-8 h-8", className)}
      viewBox="0 0 150 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60.4108 18.0906C60.4108 8.09946 68.5102 0 78.5014 0L88.8215 0V131.909C88.8215 141.901 80.7221 150 70.7309 150H60.4108V18.0906Z" />
      <path d="M20 79.4542C20 69.463 28.0995 61.3635 38.0906 61.3635H48.4108V129.545H20L20 79.4542Z" />
      <path d="M100.822 20.4546H111.142C121.133 20.4546 129.232 28.554 129.232 38.5452V70.5458C129.232 80.5369 121.133 88.6364 111.142 88.6364H100.822V20.4546Z" />
    </svg>
  );
};
