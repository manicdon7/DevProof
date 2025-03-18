import { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const useUserContext = () => {
  return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [Token, setToken] = useState(null);

  const refreshToken = async () => {
    if (users && users.stsTokenManager.isExpired) {
      console.log("Token expired, refreshing...");
      try {
        const newToken = await users.getIdToken(true);
        console.log(newToken);
        setToken(newToken);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
  };

  useEffect(() => {
    if (users) {
      refreshToken();
    }
  }, [users]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (users) {
        refreshToken();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [users]);

  return (
    <UserContext.Provider value={{ users, setUsers, Token }}>
      {children}
    </UserContext.Provider>
  );
};
