import { Suspense } from "react";
import { Skeleton } from "@gestionresidencial/shared-ui";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";
import { WallList } from "@/features/wall/wall-list";

export default function WallPage() {
  return (
    <AuthenticatedShell>
      <div className="page-heading">
        <span className="gr-eyebrow">El muro</span>
        <h1>Comunicados y avisos</h1>
        <p>Noticias, avisos y comunicados de tu unidad residencial.</p>
      </div>
      <Suspense fallback={<Skeleton label="Cargando publicaciones" />}>
        <WallList />
      </Suspense>
    </AuthenticatedShell>
  );
}
