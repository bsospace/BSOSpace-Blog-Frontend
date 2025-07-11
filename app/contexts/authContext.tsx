"use client";
import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useRouter } from "next/navigation";
import envConfig from "../configs/envConfig";
import { axiosInstance } from "../utils/api";
import { User } from "../interfaces";

interface AuthContextProps {
  isLoggedIn: boolean;
  isFecthing: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  setIsFetching: (isFecthing: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  oauthLogin: (provider: 'discord' | 'github' | 'google') => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  isFecthing: true,
  setIsFetching: () => { },
  setIsLoggedIn: () => { },
  oauthLogin: () => { },
  user: null,
  setUser: () => { },
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isFecthing, setIsFetching] = useState<boolean>(true);
  const router = useRouter();

  const oauthLogin = async (provider: 'discord' | 'github' | 'google') => {
    const service = 'blog'

    window.location.href = `${envConfig.openIdApiUrl}/auth/${provider}?service=${service}&redirect=${envConfig.callBackUrl}`
  }


  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check user authentication status
    const checkLogin = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        if (response.data.success) {
          setIsLoggedIn(true);
          setIsFetching(false);
          setUser(response.data.data);
        } else {
          setIsLoggedIn(false);
          setIsFetching(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setIsFetching(false);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };

    checkLogin();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, isFecthing, setIsFetching, oauthLogin, user, setUser } }
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}