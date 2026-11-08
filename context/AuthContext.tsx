import { createContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}
interface AuthContextType {
  token: string | null;
  setTokenValue: (tkn: string) => void;
  removeTokenValue: () => void;
  userID: string | null;
  // The logged-in user's object. Save it at login with setUserValue(...)
  user: User | null;
  setUserValue: (user: User) => void;
}

interface AuthContextPropsType {
  children: ReactNode;
}

export const authCreatedContext = createContext<AuthContextType>({
  token: null,
  setTokenValue() {},
  removeTokenValue() {},
  userID: null,
  user: null,
  setUserValue() {},
});

export default function AuthContext(props: AuthContextPropsType) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token") || "";
  });

  const [userID, setUserId] = useState<string | null>("");

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(
    function () {
      if (!token) {
        setUserId("");
        return;
      }
      try {
        // The id field name depends on your API. Check with console.log(decoded).
        const decoded = jwtDecode<any>(token);
        setUserId(decoded.user ?? decoded.id ?? decoded._id ?? "");
      } catch {
        setUserId("");
      }
    },
    [token],
  );

  function setTokenValue(tkn: string) {
    setToken(tkn);
    localStorage.setItem("token", tkn);
  }

  function removeTokenValue() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setUserId("");
  }

  function setUserValue(u: User) {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  }

  return (
    <authCreatedContext.Provider
      value={{
        token,
        setTokenValue,
        removeTokenValue,
        userID,
        user,
        setUserValue,
      }}
    >
      {props.children}
    </authCreatedContext.Provider>
  );
}
