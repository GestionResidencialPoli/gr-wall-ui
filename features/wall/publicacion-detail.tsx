"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CategoriaBadge,
  EmptyState,
  Skeleton,
  type Publicacion,
} from "@gestionresidencial/shared-ui";
import { ApiClientError } from "@gestionresidencial/auth-client";
import { getPublicacion } from "@/lib/wall-client";
import { formatDate } from "@/lib/format-date";

export function PublicacionDetail({ id }: { id: number }) {
  const searchParams = useSearchParams();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found" | "error">("loading");

  const backQuery = new URLSearchParams();
  const page = searchParams.get("page");
  const categoria = searchParams.get("categoria");
  if (page) backQuery.set("page", page);
  if (categoria) backQuery.set("categoria", categoria);
  const backHref = backQuery.size ? `/?${backQuery.toString()}` : "/";

  useEffect(() => {
    let active = true;

    getPublicacion(id)
      .then((result) => {
        if (active) {
          setPublicacion(result);
          setStatus("ready");
        }
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiClientError && error.status === 404) setStatus("not-found");
        else setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") return <Skeleton label="Cargando publicación" />;

  if (status === "not-found") {
    return (
      <EmptyState
        title="Esta publicación ya no está disponible"
        description="Puede haber sido retirada o haber perdido vigencia."
      >
        <Link href={backHref} className="gr-button gr-button--secondary">
          Volver al muro
        </Link>
      </EmptyState>
    );
  }

  if (status === "error" || !publicacion) {
    return (
      <EmptyState
        title="No pudimos cargar esta publicación"
        description="Comprueba tu conexión e inténtalo de nuevo."
      >
        <Link href={backHref} className="gr-button gr-button--secondary">
          Volver al muro
        </Link>
      </EmptyState>
    );
  }

  return (
    <article className="gr-publicacion-detail">
      <Link href={backHref} className="gr-button gr-button--ghost">
        ← Volver al muro
      </Link>
      {publicacion.fijada && <span className="gr-badge gr-badge--pin">Fijada</span>}
      <CategoriaBadge categoria={publicacion.categoria} />
      <h1>{publicacion.titulo}</h1>
      <div className="gr-publicacion-meta">
        <span>{publicacion.autorNombre}</span>
        <span>
          {formatDate(publicacion.createdAt)}
          {publicacion.editada && ` · editada el ${formatDate(publicacion.updatedAt)}`}
        </span>
      </div>
      <p className="gr-publicacion-body">{publicacion.cuerpo}</p>
    </article>
  );
}
