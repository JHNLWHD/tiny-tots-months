
import React from 'react';
import { Navigate } from 'react-router-dom';

// This page is no longer needed as we have a Landing page
// Redirecting to the landing page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
