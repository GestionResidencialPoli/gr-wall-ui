"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Feedback,
  TextField,
  CATEGORIAS_PUBLICACION,
  categoriaLabel,
  type CategoriaPublicacion,
  type Publicacion,
} from "@gestionresidencial/shared-ui";
import { ApiClientError } from "@gestionresidencial/auth-client";
import type { PublicacionInput } from "@/lib/wall-client";
import { hoyEnColombia } from "@/lib/format-date";

export function PublicacionForm({
  initial,
  onSubmit,
  submitLabel,
  pendingLabel,
}: {
  initial?: Publicacion;
  onSubmit: (input: PublicacionInput) => Promise<void>;
  submitLabel: string;
  pendingLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    const data = new FormData(event.currentTarget);
    const vigenciaHasta = String(data.get("vigenciaHasta") || "").trim();

    const input: PublicacionInput = {
      titulo: String(data.get("titulo") || "").trim(),
      cuerpo: String(data.get("cuerpo") || "").trim(),
      categoria: String(data.get("categoria")) as CategoriaPublicacion,
      vigenciaHasta: vigenciaHasta || null,
    };

    try {
      await onSubmit(input);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiClientError && typeof caughtError.body === "object"
          ? messageFrom(caughtError.body) ?? "No se pudo guardar la publicación."
          : "No se pudo guardar la publicación.",
      );
    } finally {
      setPending(false);
    }
  }

  function messageFrom(body: unknown): string | undefined {
    if (body && typeof body === "object" && "error" in body) {
      const errorBody = (body as { error?: { message?: string } }).error;
      return errorBody?.message;
    }
    return undefined;
  }

  return (
    <form className="gr-form" onSubmit={handleSubmit}>
      <TextField
        id="titulo"
        name="titulo"
        label="Título"
        defaultValue={initial?.titulo}
        required
        maxLength={150}
        pattern=".*\S.*"
        title="El título no puede estar vacío."
        disabled={pending}
      />
      <div className="gr-field">
        <label htmlFor="cuerpo">Cuerpo</label>
        <textarea
          id="cuerpo"
          name="cuerpo"
          defaultValue={initial?.cuerpo}
          required
          maxLength={10000}
          disabled={pending}
        />
      </div>
      <div className="gr-field">
        <label htmlFor="categoria">Categoría</label>
        <select id="categoria" name="categoria" defaultValue={initial?.categoria ?? ""} required disabled={pending}>
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {CATEGORIAS_PUBLICACION.map((option) => (
            <option key={option} value={option}>
              {categoriaLabel(option)}
            </option>
          ))}
        </select>
      </div>
      <TextField
        id="vigenciaHasta"
        name="vigenciaHasta"
        label="Vigente hasta (opcional)"
        type="date"
        defaultValue={initial?.vigenciaHasta ?? ""}
        min={hoyEnColombia()}
        disabled={pending}
      />
      {error && <Feedback error>{error}</Feedback>}
      <div className="gr-form-actions">
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
