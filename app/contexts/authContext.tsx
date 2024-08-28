"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  isLoggedIn: boolean;
  isFecthing: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  isFecthing: true,
  setIsLoggedIn: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isFecthing, setIsFetching] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check user authentication status
    const checkLogin = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          setIsLoggedIn(true);
          setIsFetching(false);
        } else {
          setIsLoggedIn(false);
          setIsFetching(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setIsFetching(false);
        router.push("/auth/login");
      }
    };

    checkLogin();
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isFecthing }}>
      {children}
    </AuthContext.Provider>
  );
};
