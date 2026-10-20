"use client";

import { useRouter } from "next/navigation";
import { PublicacionForm } from "./publicacion-form";
import { createPublicacion } from "@/lib/wall-client";

export function CrearPublicacion() {
  const router = useRouter();

  async function handleSubmit(input: Parameters<typeof createPublicacion>[0]) {
    await createPublicacion(input);
    router.push("/");
  }

  return (
    <PublicacionForm onSubmit={handleSubmit} submitLabel="Publicar" pendingLabel="Publicando…" />
  );
}
