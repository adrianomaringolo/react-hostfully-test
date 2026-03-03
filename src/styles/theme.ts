export const theme = {
  colors: {
    // Brand
    primary: "#1C2B3A",
    primaryLight: "#2D4459",
    accent: "#E8622A",
    accentHover: "#CF5422",

    // Neutrals
    background: "#F7F4EF",
    surface: "#FFFFFF",
    border: "#E4DDD4",
    borderHover: "#C9BFB4",

    // Text
    textPrimary: "#1C2B3A",
    textSecondary: "#5C6E7E",
    textMuted: "#94A3B2",
    textInverse: "#FFFFFF",

    // Status
    success: "#2D9B6F",
    successLight: "#D6F2E7",
    warning: "#D4900A",
    warningLight: "#FEF3D0",
    error: "#D94040",
    errorLight: "#FDEAEA",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },

  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 3px rgba(0,0,0,0.08)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 8px 24px rgba(0,0,0,0.10)",
    xl: "0 20px 40px rgba(0,0,0,0.12)",
  },

  typography: {
    fontFamily: {
      heading: "'Fraunces', Georgia, serif",
      body: "'Plus Jakarta Sans', system-ui, sans-serif",
    },
    fontSize: {
      xs: "11px",
      sm: "13px",
      base: "15px",
      md: "16px",
      lg: "18px",
      xl: "22px",
      xxl: "28px",
      xxxl: "36px",
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },

  transitions: {
    fast: "150ms ease",
    normal: "250ms ease",
    slow: "400ms ease",
  },
} as const;

export type Theme = typeof theme;
