"use client";

import AuthModal from "./AuthModal";
import { useAuthModalStore } from "@/store/useAuthModalStore";

export default function AuthModalProvider() {
  const { isOpen, view, closeModal } = useAuthModalStore();
  
  return <AuthModal isOpen={isOpen} onClose={closeModal} initialView={view} />;
}
