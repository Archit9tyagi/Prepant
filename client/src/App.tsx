import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Providers } from './app/providers.js';
import { router } from './app/router.js';

export const App: React.FC = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
};

export default App;
