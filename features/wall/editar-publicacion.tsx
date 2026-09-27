"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, Skeleton, type Publicacion } from "@gestionresidencial/shared-ui";
import { getPublicacion, updatePublicacion } from "@/lib/wall-client";
import { PublicacionForm } from "./publicacion-form";

export function EditarPublicacion({ id }: { id: number }) {
  const router = useRouter();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    getPublicacion(id)
      .then((result) => {
        if (active) {
          setPublicacion(result);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(input: Parameters<typeof updatePublicacion>[1]) {
    await updatePublicacion(id, input);
    router.push("/");
  }

  if (status === "loading") return <Skeleton label="Cargando publicación" />;

  if (status === "error" || !publicacion) {
    return (
      <EmptyState
        title="No pudimos cargar esta publicación"
        description="Comprueba tu conexión e inténtalo de nuevo."
      />
    );
  }

  return (
    <PublicacionForm
      initial={publicacion}
      onSubmit={handleSubmit}
      submitLabel="Guardar cambios"
      pendingLabel="Guardando…"
    />
  );
}
