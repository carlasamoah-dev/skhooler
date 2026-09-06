"use client";

import AuthModal from "./AuthModal";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export default function AuthModalProvider() {
  const { isOpen, view, closeModal } = useAuthModalStore();

  // Unmount while closed so each opening starts from the requested view with
  // empty fields, rather than whatever the last session left behind.
  if (!isOpen) return null;

  return <AuthModal onClose={closeModal} initialView={view} />;
}
