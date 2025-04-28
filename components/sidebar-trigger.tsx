"use client";

import { ChevronRight, X } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarArrowTriggerProps {
  className?: string;
}

export function SidebarArrowTrigger({ className }: SidebarArrowTriggerProps) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <>
      {/* Open button - visible when sidebar is closed */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-5 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-r-md shadow-lg transition-transform duration-300 ease-in-out",
          open ? "-translate-x-5" : "translate-x-0", // Slide ke kiri pas sidebar buka
          className
        )}
        aria-label="Open sidebar"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>

      {/* Close button - visible when sidebar is open */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-5 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-r-md shadow-lg transition-transform duration-300 ease-in-out",
          open ? "translate-x-[250px]" : "translate-x-[-20px]" // Slide dari kiri pas sidebar buka
        )}
        aria-label="Close sidebar"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </>
  );
}