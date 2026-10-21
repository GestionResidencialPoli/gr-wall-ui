import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { CrearPublicacion } from "@/features/wall/crear-publicacion";

export default function NuevaPublicacionPage() {
  return (
    <AuthenticatedShell requiredRole="ADMINISTRACION">
      <div className="page-heading">
        <span className="gr-eyebrow">El muro</span>
        <h1>Nueva publicación</h1>
      </div>
      <CrearPublicacion />
    </AuthenticatedShell>
  );
}
