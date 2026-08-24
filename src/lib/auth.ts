export type Permission =
  | "lojas.visualizar"
  | "mudancas.visualizar"
  | "mudancas.visualizar_detalhes"
  | "mudancas.executar"
  | "mudancas.cancelar"
  | "mudancas.reprocessar"
  | "mudancas.administrar"
  | "admin.usuarios"
  | "admin.perfis";

export type ProfileType = "admin" | "operador" | "consulta";

export interface UserProfile {
  type: ProfileType;
  label: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile: ProfileType;
  initials: string;
}

export const PROFILES: Record<ProfileType, UserProfile> = {
  admin: {
    type: "admin",
    label: "Administrador",
    permissions: [
      "lojas.visualizar",
      "mudancas.visualizar",
      "mudancas.visualizar_detalhes",
      "mudancas.executar",
      "mudancas.cancelar",
      "mudancas.reprocessar",
      "mudancas.administrar",
      "admin.usuarios",
      "admin.perfis",
    ],
  },
  operador: {
    type: "operador",
    label: "Operador",
    permissions: [
      "lojas.visualizar",
      "mudancas.visualizar",
      "mudancas.visualizar_detalhes",
      "mudancas.executar",
      "mudancas.cancelar",
    ],
  },
  consulta: {
    type: "consulta",
    label: "Consulta",
    permissions: ["lojas.visualizar"],
  },
};

export interface ModuleConfig {
  name: string;
  href: string;
  requiredPermission: Permission;
  icon: string;
}

export const MODULES: ModuleConfig[] = [
  { name: "Lojas", href: "/lojas", requiredPermission: "lojas.visualizar", icon: "lojas" },
  { name: "Mudancas MegaStore", href: "/mudancas", requiredPermission: "mudancas.visualizar", icon: "mudancas" },
  { name: "Administracao", href: "/admin", requiredPermission: "admin.usuarios", icon: "admin" },
];

export function hasPermission(profile: ProfileType, permission: Permission): boolean {
  return PROFILES[profile].permissions.includes(permission);
}

export function getVisibleModules(profile: ProfileType): ModuleConfig[] {
  return MODULES.filter((m) => hasPermission(profile, m.requiredPermission));
}
