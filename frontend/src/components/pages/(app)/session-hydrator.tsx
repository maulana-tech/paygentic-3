"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user";
import { hydrateServiceAccesses } from "@/data/store";

export function SessionHydrator() {
  const agentKey = useUserStore((s) => s.ownedAgents.map((a) => a.id).join(","));
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (!user || !agentKey) return;
    const { ownedAgents } = useUserStore.getState();
    hydrateServiceAccesses(
      ownedAgents.map((a) => ({
        id: a.id,
        purchaseId: a.purchaseId,
        listingId: a.listingId,
        buyerUserId: user.id,
        sellerAgentId: a.sellerAgentId,
        accessToken: a.accessToken,
        accessTokenCreated: a.accessTokenCreated,
        expiresAt: a.expiresAt,
        status: a.status,
      }))
    );
  }, [user, agentKey]);

  return null;
}
