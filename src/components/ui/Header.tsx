import { theme } from "@/styles/theme";
import styled from "styled-components";

export const Header = styled.header`
  background: ${theme.colors.primary};
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: ${theme.shadows.lg};
`;

export const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.md}) {
    flex-wrap: wrap;
    padding: ${theme.spacing.md};
    gap: ${theme.spacing.md};
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;

  svg {
    color: ${theme.colors.accent};
  }
`;

export const LogoTitle = styled.h1`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.textInverse};
  letter-spacing: -0.5px;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex: 1;

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    order: 3;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-wrap: wrap;
  }
`;
