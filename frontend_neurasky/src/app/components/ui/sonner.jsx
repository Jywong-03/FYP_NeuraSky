"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group z-9999"
      richColors
      style={
        {
          "--normal-bg": "#eff6ff", // blue-50
          "--normal-text": "#1e3a8a", // blue-900
          "--normal-border": "#bfdbfe", // blue-200
        }
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:!bg-blue-50 group-[.toaster]:!text-blue-900 group-[.toaster]:!border-blue-200 group-[.toaster]:!shadow-lg group-[.toaster]:!opacity-100",
          description: "group-[.toast]:!text-blue-700",
          actionButton: "group-[.toast]:!bg-blue-600 group-[.toast]:!text-white",
          cancelButton: "group-[.toast]:!bg-blue-100 group-[.toast]:!text-blue-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
