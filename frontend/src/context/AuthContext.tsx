import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";
import { getErrorMessage } from "../utils/errors";

export type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<unknown>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch (err) {
      if (__DEV__) console.warn("Auth restore failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await API.post("/auth/register", {
          name: name.trim(),
          email: email.trim(),
          password,
        });
      } catch (err) {
        throw new Error(getErrorMessage(err, "Registration failed"));
      }
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const payload = res?.data?.data as
        | { token?: string; user?: AuthUser }
        | undefined;
      if (!payload?.token || !payload?.user) {
        throw new Error("Invalid login response");
      }

      const { token: nextToken, user: nextUser } = payload;
      const cleanToken = String(nextToken).trim();

      setToken(cleanToken);
      setUser(nextUser);

      await AsyncStorage.setItem("token", cleanToken);
      await AsyncStorage.setItem("user", JSON.stringify(nextUser));

      return res.data;
    } catch (err) {
      throw new Error(getErrorMessage(err, "Login failed"));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setToken(null);
      setUser(null);
      await AsyncStorage.multiRemove(["token", "user"]);
    } catch (err) {
      if (__DEV__) console.warn("Logout storage clear failed:", err);
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
