import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store.js';
import { AppThemeProvider } from './theme/ThemeProvider.jsx';
import { router } from './app/router.jsx';

export const App = () => {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </Provider>
  );
};

export default App;
