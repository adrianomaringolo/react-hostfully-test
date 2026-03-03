import styled, { css } from "styled-components";
import { theme } from "@/styles/theme";
import type { BookingStatus } from "@/types";

export const StatusBadge = styled.span<{ $status: BookingStatus }>`
  display: inline-flex;
  align-items: center;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  padding: 3px 10px;
  border-radius: ${theme.borderRadius.full};
  white-space: nowrap;

  ${({ $status }) => {
    switch ($status) {
      case "confirmed":
        return css`
          background: ${theme.colors.successLight};
          color: ${theme.colors.success};
        `;
      case "pending":
        return css`
          background: ${theme.colors.warningLight};
          color: ${theme.colors.warning};
        `;
      case "cancelled":
        return css`
          background: ${theme.colors.errorLight};
          color: ${theme.colors.error};
        `;
    }
  }}
`;
