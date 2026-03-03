import { theme } from "@/styles/theme";
import styled from "styled-components";

export const SearchWrapper = styled.div`
  position: relative;
  flex: 1;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 9px 12px 9px 38px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textInverse};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;
