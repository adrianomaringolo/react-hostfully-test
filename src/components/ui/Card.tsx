import { theme } from "@/styles/theme";
import styled from "styled-components";

export const Card = styled.article`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.normal};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  overflow: hidden;

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
    border-color: ${theme.colors.borderHover};
  }
`;

export const CoverImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: 0 ${theme.spacing.lg};
`;

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const CardActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  margin-top: auto;
`;
