import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;