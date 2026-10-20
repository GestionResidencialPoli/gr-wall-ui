"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Button,
  Dialog,
  EmptyState,
  PublicacionCard,
  Skeleton,
  categoriaLabel,
  CATEGORIAS_PUBLICACION,
  type CategoriaPublicacion,
  type PublicacionResumen,
} from "@gestionresidencial/shared-ui";
import { useAuth } from "@/features/auth/auth-provider";
import { deletePublicacion, listPublicaciones, pinPublicacion, unpinPublicacion } from "@/lib/wall-client";
import { formatDate } from "@/lib/format-date";

const PAGE_SIZE = 10;

export function WallList() {
  const searchParams = useSearchParams();
  const categoria = (searchParams.get("categoria") as CategoriaPublicacion | null) ?? undefined;

  return <WallListForCategory key={categoria ?? "todas"} categoria={categoria} />;
}

function WallListForCategory({ categoria }: { categoria?: CategoriaPublicacion }) {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("ADMINISTRACION") ?? false;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<PublicacionResumen[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const load = useCallback(
    async (targetPage: number, replace: boolean) => {
      try {
        const result = await listPublicaciones({ page: targetPage, size: PAGE_SIZE, categoria });
        setItems((previous) => (replace ? result.content : [...previous, ...result.content]));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setStatus("ready");
      } catch {
        setStatus("error");
      } finally {
        setLoadingMore(false);
      }
    },
    [categoria],
  );

  useEffect(() => {
    let active = true;

    listPublicaciones({ page: 0, size: PAGE_SIZE, categoria })
      .then((result) => {
        if (!active) return;
        setItems(result.content);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [categoria]);

  function hrefForCategory(next: CategoriaPublicacion | undefined): string {
    const query = new URLSearchParams(searchParams);
    if (next) query.set("categoria", next);
    else query.delete("categoria");
    return query.size ? `${pathname}?${query.toString()}` : pathname;
  }

  async function loadMore() {
    setLoadingMore(true);
    await load(page + 1, false);
  }

  async function togglePin(publicacion: PublicacionResumen) {
    setPendingId(publicacion.id);
    try {
      if (publicacion.fijada) await unpinPublicacion(publicacion.id);
      else await pinPublicacion(publicacion.id);
      setItems((previous) =>
        previous.map((item) =>
          item.id === publicacion.id ? { ...item, fijada: !publicacion.fijada } : item,
        ),
      );
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete() {
    if (confirmDeleteId === null) return;
    setPendingId(confirmDeleteId);
    try {
      await deletePublicacion(confirmDeleteId);
      setItems((previous) => previous.filter((item) => item.id !== confirmDeleteId));
    } finally {
      setPendingId(null);
      setConfirmDeleteId(null);
    }
  }

  if (status === "loading") {
    return <Skeleton label="Cargando publicaciones" />;
  }

  if (status === "error") {
    return (
      <EmptyState
        title="No pudimos cargar el muro"
        description="Comprueba tu conexión e inténtalo de nuevo."
      >
        <Button variant="secondary" onClick={() => void load(0, true)}>
          Reintentar
        </Button>
      </EmptyState>
    );
  }

  return (
    <>
      <div className="gr-wall-filters">
        <Link href={hrefForCategory(undefined)} aria-current={!categoria}>
          Todas
        </Link>
        {CATEGORIAS_PUBLICACION.map((option) => (
          <Link key={option} href={hrefForCategory(option)} aria-current={categoria === option}>
            {categoriaLabel(option)}
          </Link>
        ))}
      </div>

      {isAdmin && (
        <div className="gr-form-actions">
          <Link href="/publicaciones/nueva" className="gr-button gr-button--primary">
            Nueva publicación
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Todavía no hay publicaciones"
          description="Cuando la administración publique un comunicado, aparecerá aquí."
        />
      ) : (
        <div className="gr-wall-list">
          {items.map((publicacion) => (
            <PublicacionCard
              key={publicacion.id}
              publicacion={publicacion}
              href={`/publicaciones/${publicacion.id}?page=${page}${categoria ? `&categoria=${categoria}` : ""}`}
              dateLabel={formatDate(publicacion.createdAt)}
              actions={
                isAdmin ? (
                  <>
                    <Link
                      href={`/publicaciones/${publicacion.id}/editar`}
                      className="gr-button gr-button--secondary"
                    >
                      Editar
                    </Link>
                    <Button
                      variant="secondary"
                      disabled={pendingId === publicacion.id}
                      onClick={() => togglePin(publicacion)}
                    >
                      {publicacion.fijada ? "Desfijar" : "Fijar"}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={pendingId === publicacion.id}
                      onClick={() => setConfirmDeleteId(publicacion.id)}
                    >
                      Eliminar
                    </Button>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {page + 1 < totalPages && (
        <div className="gr-form-actions">
          <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? "Cargando…" : "Cargar más"}
          </Button>
        </div>
      )}

      <Dialog
        open={confirmDeleteId !== null}
        title="Eliminar publicación"
        closeLabel="Cancelar"
        onClose={() => setConfirmDeleteId(null)}
      >
        <p>Esta acción retira la publicación del muro. ¿Quieres continuar?</p>
        <div className="gr-form-actions">
          <Button
            variant="primary"
            disabled={pendingId === confirmDeleteId}
            onClick={confirmDelete}
          >
            Eliminar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
