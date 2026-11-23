import { ApiClientError, apiFetch } from "@gestionresidencial/auth-client";
import type {
  CategoriaPublicacion,
  PageResult,
  Publicacion,
  PublicacionResumen,
} from "@gestionresidencial/shared-ui";

const BASE_PATH = "/api/v1/publicaciones";
const GRAPHQL_PATH = `${BASE_PATH}/graphql`;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

export type PublicacionInput = {
  titulo: string;
  cuerpo: string;
  categoria: CategoriaPublicacion;
  vigenciaHasta?: string | null;
};

const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  CONFLICT: 409,
  UNAUTHENTICATED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

function toApiError(fallbackStatus: number, body: unknown): ApiClientError {
  const error = (body as GraphQLResponse<unknown> | null)?.errors?.[0];
  if (!error) return new ApiClientError(fallbackStatus, body);
  const status = STATUS_BY_CODE[error.extensions?.code ?? ""] ?? 400;
  return new ApiClientError(status, { error: { message: error.message } });
}

async function graphQLRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  let response: GraphQLResponse<T>;

  try {
    response = await apiFetch<GraphQLResponse<T>>(GRAPHQL_PATH, {
      method: "POST",
      body: { query, variables },
    });
  } catch (error) {
    throw error instanceof ApiClientError ? toApiError(error.status, error.body) : error;
  }

  if (response.errors?.length) throw toApiError(400, response);
  if (!response.data) throw new ApiClientError(502, response);
  return response.data;
}

export async function listPublicaciones(params: {
  page?: number;
  size?: number;
  categoria?: CategoriaPublicacion;
}): Promise<PageResult<PublicacionResumen>> {
  const withCategory = params.categoria !== undefined;
  const result = await graphQLRequest<{ publicaciones: PageResult<PublicacionResumen> }>(
    withCategory
      ? `query ListPublicaciones($page: Int!, $size: Int!, $categoria: CategoriaPublicacion!) {
      publicaciones(page: $page, size: $size, categoria: $categoria) {
        content { id autorNombre titulo extracto categoria fijada createdAt }
        page size totalElements totalPages
      }
    }`
      : `query ListPublicaciones($page: Int!, $size: Int!) {
      publicaciones(page: $page, size: $size) {
        content { id autorNombre titulo extracto categoria fijada createdAt }
        page size totalElements totalPages
      }
    }`,
    withCategory
      ? { page: params.page ?? 0, size: params.size ?? 10, categoria: params.categoria }
      : { page: params.page ?? 0, size: params.size ?? 10 },
  );
  return { ...result.publicaciones, content: result.publicaciones.content.map((item) => ({ ...item, id: Number(item.id) })) };
}

export async function getPublicacion(id: number): Promise<Publicacion> {
  const result = await graphQLRequest<{ publicacion: Publicacion }>(
    `query GetPublicacion($id: ID!) {
      publicacion(id: $id) { id autorUserId autorNombre titulo cuerpo categoria fijada vigenciaHasta editada createdAt updatedAt }
    }`,
    { id: String(id) },
  );
  return { ...result.publicacion, id: Number(result.publicacion.id) };
}

export async function createPublicacion(input: PublicacionInput): Promise<Publicacion> {
  const result = await graphQLRequest<{ crearPublicacion: Publicacion }>(
    `mutation CrearPublicacion($input: PublicacionInput!) {
      crearPublicacion(input: $input) { id autorUserId autorNombre titulo cuerpo categoria fijada vigenciaHasta editada createdAt updatedAt }
    }`,
    { input },
  );
  return { ...result.crearPublicacion, id: Number(result.crearPublicacion.id) };
}

export async function updatePublicacion(id: number, input: PublicacionInput): Promise<Publicacion> {
  const result = await graphQLRequest<{ actualizarPublicacion: Publicacion }>(
    `mutation ActualizarPublicacion($id: ID!, $input: PublicacionInput!) {
      actualizarPublicacion(id: $id, input: $input) { id autorUserId autorNombre titulo cuerpo categoria fijada vigenciaHasta editada createdAt updatedAt }
    }`,
    { id: String(id), input },
  );
  return { ...result.actualizarPublicacion, id: Number(result.actualizarPublicacion.id) };
}

export async function pinPublicacion(id: number): Promise<Publicacion> {
  const result = await graphQLRequest<{ fijarPublicacion: Publicacion }>(
    `mutation FijarPublicacion($id: ID!) {
      fijarPublicacion(id: $id) { id autorUserId autorNombre titulo cuerpo categoria fijada vigenciaHasta editada createdAt updatedAt }
    }`,
    { id: String(id) },
  );
  return { ...result.fijarPublicacion, id: Number(result.fijarPublicacion.id) };
}

export async function unpinPublicacion(id: number): Promise<Publicacion> {
  const result = await graphQLRequest<{ desfijarPublicacion: Publicacion }>(
    `mutation DesfijarPublicacion($id: ID!) {
      desfijarPublicacion(id: $id) { id autorUserId autorNombre titulo cuerpo categoria fijada vigenciaHasta editada createdAt updatedAt }
    }`,
    { id: String(id) },
  );
  return { ...result.desfijarPublicacion, id: Number(result.desfijarPublicacion.id) };
}

export async function deletePublicacion(id: number): Promise<void> {
  await graphQLRequest<{ eliminarPublicacion: boolean }>(
    `mutation EliminarPublicacion($id: ID!) { eliminarPublicacion(id: $id) }`,
    { id: String(id) },
  );
}
