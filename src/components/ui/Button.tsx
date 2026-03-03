import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps {
  $variant?: ButtonVariant;
  $size?: ButtonSize;
  $fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.fast};
  white-space: nowrap;

  /* Size */
  ${({ $size = "md" }) =>
    $size === "sm"
      ? css`
          padding: 7px 14px;
          font-size: ${theme.typography.fontSize.sm};
        `
      : css`
          padding: 10px 20px;
          font-size: ${theme.typography.fontSize.base};
        `}

  /* Full width */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  /* Variant */
  ${({ $variant = "secondary" }) => {
    switch ($variant) {
      case "primary":
        return css`
          background: ${theme.colors.accent};
          color: ${theme.colors.textInverse};
          &:hover:not(:disabled) {
            background: ${theme.colors.accentHover};
            transform: translateY(-1px);
          }
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case "danger":
        return css`
          background: ${theme.colors.errorLight};
          color: ${theme.colors.error};
          &:hover:not(:disabled) {
            background: ${theme.colors.error};
            color: ${theme.colors.textInverse};
          }
        `;
      case "ghost":
        return css`
          background: transparent;
          color: ${theme.colors.textSecondary};
          &:hover:not(:disabled) {
            background: ${theme.colors.background};
            color: ${theme.colors.textPrimary};
          }
        `;
      default: // secondary
        return css`
          background: ${theme.colors.surface};
          color: ${theme.colors.textSecondary};
          border: 1.5px solid ${theme.colors.border};
          &:hover:not(:disabled) {
            border-color: ${theme.colors.borderHover};
            background: ${theme.colors.background};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: center;
  }
`;
