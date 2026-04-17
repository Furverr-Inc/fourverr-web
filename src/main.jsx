import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeModeProvider } from "./ThemeContext";
import { LanguageProvider } from "./LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google"; //
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="464885428939-7kpa14pougj5jshat56iiq6ak48qulu0.apps.googleusercontent.com">
      <ThemeModeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeModeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);