import { EmptyState } from "@gestionresidencial/shared-ui";
import { AuthenticatedShell } from "@/features/auth/authenticated-shell";

export default function WallPage() {
  return (
    <AuthenticatedShell>
      <div className="page-heading">
        <span className="gr-eyebrow">El muro</span>
        <h1>Comunicados y avisos</h1>
        <p>Aquí verás las publicaciones de tu unidad residencial.</p>
      </div>
      <EmptyState
        title="Todavía no hay publicaciones"
        description="Cuando la administración publique un comunicado, aparecerá aquí."
      />
    </AuthenticatedShell>
  );
}
