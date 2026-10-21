import { apiFetch } from "@gestionresidencial/auth-client";
import type {
  CategoriaPublicacion,
  PageResult,
  Publicacion,
  PublicacionResumen,
} from "@gestionresidencial/shared-ui";

const BASE_PATH = "/api/v1/publicaciones";

export type PublicacionInput = {
  titulo: string;
  cuerpo: string;
  categoria: CategoriaPublicacion;
  vigenciaHasta?: string | null;
};

export async function listPublicaciones(params: {
  page?: number;
  size?: number;
  categoria?: CategoriaPublicacion;
}): Promise<PageResult<PublicacionResumen>> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  if (params.categoria) query.set("categoria", params.categoria);

  const { payload } = await apiFetch<{ payload: PageResult<PublicacionResumen> }>(
    `${BASE_PATH}?${query.toString()}`,
  );
  return payload;
}

export async function getPublicacion(id: number): Promise<Publicacion> {
  const { payload } = await apiFetch<{ payload: Publicacion }>(`${BASE_PATH}/${id}`);
  return payload;
}

export async function createPublicacion(input: PublicacionInput): Promise<Publicacion> {
  const { payload } = await apiFetch<{ payload: Publicacion }>(BASE_PATH, {
    method: "POST",
    body: input,
  });
  return payload;
}

export async function updatePublicacion(id: number, input: PublicacionInput): Promise<Publicacion> {
  const { payload } = await apiFetch<{ payload: Publicacion }>(`${BASE_PATH}/${id}`, {
    method: "PUT",
    body: input,
  });
  return payload;
}

export async function pinPublicacion(id: number): Promise<Publicacion> {
  const { payload } = await apiFetch<{ payload: Publicacion }>(`${BASE_PATH}/${id}/fijar`, {
    method: "PATCH",
  });
  return payload;
}

export async function unpinPublicacion(id: number): Promise<Publicacion> {
  const { payload } = await apiFetch<{ payload: Publicacion }>(`${BASE_PATH}/${id}/desfijar`, {
    method: "PATCH",
  });
  return payload;
}

export async function deletePublicacion(id: number): Promise<void> {
  await apiFetch(`${BASE_PATH}/${id}`, { method: "DELETE" });
}
