import { LucideIcon } from "lucide-react";

// IconType defines types of icons used throughout the application
export type IconType = LucideIcon;

// Basic user type
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
}

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}