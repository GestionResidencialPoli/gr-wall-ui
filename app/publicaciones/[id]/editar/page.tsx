import { notFound } from "next/navigation";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { EditarPublicacion } from "@/features/wall/editar-publicacion";

export default async function EditarPublicacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">El muro</span>
        <h1>Editar publicación</h1>
      </div>
      <EditarPublicacion id={numericId} />
    </AuthenticatedShell>
  );
}
