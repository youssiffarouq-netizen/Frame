import { useContext, type ReactNode } from "react";
import { authCreatedContext } from "../context/AuthContext";
import Signup from '../src/components/signup/Signup';
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useContext(authCreatedContext);

  if (!token) {
   
    return <Signup/>
  } else {
    return <>{children}</>;
  }
}
