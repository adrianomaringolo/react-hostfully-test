import styled from "styled-components";
import { theme } from "@/styles/theme";

export const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const Label = styled.label`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textSecondary};
  letter-spacing: 0.6px;
  text-transform: uppercase;
`;

const inputStyles = (hasError?: boolean) => `
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.surface};
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${hasError ? theme.colors.error : theme.colors.accent};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

export const Input = styled.input<{ $hasError?: boolean }>`
  ${({ $hasError }) => inputStyles($hasError)}
`;

export const Select = styled.select<{ $hasError?: boolean }>`
  ${({ $hasError }) => inputStyles($hasError)}
  cursor: pointer;
`;

export const Textarea = styled.textarea<{ $hasError?: boolean }>`
  ${({ $hasError }) => inputStyles($hasError)}
  resize: vertical;
  min-height: 80px;
`;

export const ErrorMessage = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.error};
`;

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;
