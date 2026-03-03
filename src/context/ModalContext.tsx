import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { ModalState, UUID } from "@/types";

interface ModalContextValue {
  modal: ModalState;
  openCreateModal: () => void;
  openEditModal: (bookingId: UUID) => void;
  openViewModal: (bookingId: UUID) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const openCreateModal = useCallback(() => setModal({ mode: "create" }), []);

  const openEditModal = useCallback(
    (bookingId: UUID) => setModal({ mode: "edit", bookingId }),
    [],
  );

  const openViewModal = useCallback(
    (bookingId: UUID) => setModal({ mode: "view", bookingId }),
    [],
  );

  const closeModal = useCallback(() => setModal({ mode: "closed" }), []);

  return (
    <ModalContext.Provider
      value={{
        modal,
        openCreateModal,
        openEditModal,
        openViewModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
