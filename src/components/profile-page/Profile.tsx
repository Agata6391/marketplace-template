// src/components/profile-page/Profile.tsx
"use client";

import { Box, Flex, Heading } from "@chakra-ui/react";
import ProfileEarnings from "@/components/profile-page/ProfileEarnings";
import SalesHistory from "@/components/profile-page/SalesHistory";

// Si tienes ya un <ProfileSection/> propio, puedes meter estos bloques dentro.
// Aquí un contenedor básico:
export default function Profile() {
  return (
    <Flex direction="column" gap="6" mt="24px">
      <Heading size="lg">Profile</Heading>

      {/* KPI de ventas */}
      <ProfileEarnings />

      {/* Historial de ventas */}
      <SalesHistory />
    </Flex>
  );
}
