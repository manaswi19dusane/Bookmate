import { createContext } from "react";
import type { AuthPayload, User } from "../services/api";

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: AuthPayload) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
