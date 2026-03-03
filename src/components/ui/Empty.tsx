import { theme } from "@/styles/theme";
import styled from "styled-components";

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing.xxl} ${theme.spacing.xl};
  gap: ${theme.spacing.md};
`;

export const EmptyTitle = styled.h3`
  font-family: ${theme.typography.fontFamily.heading};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.textPrimary};
`;

export const EmptyDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
  max-width: 320px;
`;
