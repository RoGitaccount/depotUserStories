// import { createContext } from 'react';

// export const AuthContext = createContext();


// src/contexts/AuthContext.js
import React from 'react';

export const AuthContext = React.createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});
