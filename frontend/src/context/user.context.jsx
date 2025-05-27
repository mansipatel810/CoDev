import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // check for valid cookie token on first load
    const validateUser = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${apiUrl}/api/auth/validate`, {
          credentials: "include", // send cookie
        });

        if (!res.ok) {
          throw new Error("User not authenticated");
        }

        const data = await res.json();
        setUser(data.data); 
      } catch (err) {
        console.log("Not authenticated");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
