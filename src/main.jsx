import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from '@mui/material'; // <--- IMPORTANTE
import App from "./App.jsx";
import theme from "./theme"; // <--- IMPORTA TU TEMA

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* <--- Esto limpia los estilos del navegador */}
      <App />
    </ThemeProvider>
  </StrictMode>
);