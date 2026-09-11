"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useGroupStore } from "@/store/useGroupStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Dialog, IconButton } from "@/components/ui";
import AuthBrand from "./auth/AuthBrand";
import AuthForm, { COPY } from "./auth/AuthForm";

export default function AuthModal() {
  const router = useRouter();
  const { mode, openModal, closeModal } = useAuthModalStore();
  const slug = useGroupStore((s) => s.slug);

  if (!mode) return null;
  const copy = COPY[mode];

  return (
    <Dialog open onClose={closeModal} width={440} hideClose>
      <AuthBrand>
        <IconButton
          icon={X}
          label="Close"
          variant="plain"
          size={44}
          onClick={closeModal}
          className="ml-auto border border-divider"
        />
      </AuthBrand>

      <h2 className="text-[26px] mt-5">{copy.title}</h2>
      <p className="text-ui text-sand-700 -mt-1.5">{copy.sub}</p>

      <AuthForm
        mode={mode}
        onSwitch={openModal}
        onSuccess={async () => {
          await useSessionStore.getState().bootstrap();
          closeModal();
          const next = new URLSearchParams(window.location.search).get("next");
          router.push(next || `/home`);
        }}
      />
    </Dialog>
  );
}
