import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App';
import theme from './theme/index';
import { ThemeProvider } from './shared/context/ThemeContext';
import './index.css';

export const mountApp = () => {
  const root = document.getElementById('root');
  if (!root || root.dataset.algoArenaMounted === 'true') return;

  root.dataset.algoArenaMounted = 'true';

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ChakraProvider>
    </React.StrictMode>,
  );
};
