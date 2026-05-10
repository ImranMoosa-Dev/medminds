import { useState, useEffect, useContext, createContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });

  const [authLoading, setAuthLoading] = useState(true);
  // Load auth data from localStorage when app loads
  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      setAuth(JSON.parse(data));
    }
    setAuthLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth, authLoading]}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
