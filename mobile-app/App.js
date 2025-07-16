// import "./global.css"

import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from './src/contexts/AuthProvider'; // adapte aussi le chemin ici

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}