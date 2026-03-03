import { theme } from "@/styles/theme";
import styled from "styled-components";

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const DatePickerWrapper = styled.div<{ $hasError?: boolean }>`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid
      ${({ $hasError }) =>
        $hasError ? theme.colors.error : theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    font-size: ${theme.typography.fontSize.base};
    color: ${theme.colors.textPrimary};
    background: ${theme.colors.surface};
    transition: border-color ${theme.transitions.fast};
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: ${({ $hasError }) =>
        $hasError ? theme.colors.error : theme.colors.accent};
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column-reverse;
  }
`;
