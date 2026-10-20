import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@gestionresidencial/shared-ui";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { PublicacionDetail } from "@/features/wall/publicacion-detail";

export default async function PublicacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return (
    <AuthenticatedShell>
      <Suspense fallback={<Skeleton label="Cargando publicación" />}>
        <PublicacionDetail key={numericId} id={numericId} />
      </Suspense>
    </AuthenticatedShell>
  );
}
