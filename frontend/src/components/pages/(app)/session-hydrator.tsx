"use client";

import { useUserStore } from "@/store/user";

export function SessionHydrator() {
  const user = useUserStore((s) => s.user);
  const ownedAgents = useUserStore((s) => s.ownedAgents);

  if (!user || ownedAgents.length === 0) return null;

  return null;
}
