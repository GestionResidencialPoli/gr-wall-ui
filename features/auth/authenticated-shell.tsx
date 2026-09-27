"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppShell, Button, EmptyState, Feedback, Skeleton } from "@gestionresidencial/shared-ui";
import { authUiLoginUrl, type Role } from "@gestionresidencial/auth-client";
import { useAuth } from "./auth-provider";

export function AuthenticatedShell({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: Role;
}) {
  const { user, loading, sessionError, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  useEffect(() => {
    if (!loading && !sessionError && !user) window.location.replace(authUiLoginUrl());
  }, [loading, sessionError, user]);

  async function signOut() {
    setPending(true);
    setLogoutError(false);
    try {
      await logout();
      window.location.replace(authUiLoginUrl());
    } catch {
      setLogoutError(true);
    } finally {
      setPending(false);
    }
  }

  if (loading || (!sessionError && !user)) {
    return (
      <div className="standalone-state">
        <Skeleton label="Cargando el muro" />
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="standalone-state">
        <EmptyState
          title="No pudimos verificar tu sesión"
          description="Comprueba que el servicio de usuarios esté disponible e inténtalo de nuevo."
        />
      </div>
    );
  }

  const hasAccess = !requiredRole || user!.roles.includes(requiredRole);

  return (
    <AppShell
      brand={{ name: "Habitar", description: "El muro de tu comunidad", mark: "h.", href: "/" }}
      navigation={[{ id: "home", label: "Muro", href: "/" }]}
      activeId="home"
      user={{ name: user!.name, caption: "Mi cuenta" }}
      userMenuItems={[]}
      labels={{
        navigation: "El muro",
        menu: "Abrir navegación",
        skip: "Saltar al contenido",
        footer: "Un canal oficial para tu comunidad",
      }}
      eyebrow="El muro de tu comunidad"
      actions={
        <Button variant="ghost" disabled={pending} onClick={signOut}>
          {pending ? "Cerrando sesión" : "Cerrar sesión"}
        </Button>
      }
    >
      {logoutError && <Feedback error>No se pudo cerrar sesión. Inténtalo de nuevo.</Feedback>}
      {hasAccess ? (
        children
      ) : (
        <EmptyState
          title="No tienes acceso a esta sección"
          description="Esta página es solo para el rol de administración."
        />
      )}
    </AppShell>
  );
}
