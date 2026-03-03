import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: ${theme.typography.fontFamily.body};
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.textPrimary};
    background-color: ${theme.colors.background};
    line-height: ${theme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    width: 100%;
  }

  img, video {
    max-width: 100%;
    height: auto;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* React DatePicker: ensure it's always visible on mobile */
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker-popper {
    z-index: 1000 !important;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.borderHover};
  }
`;
