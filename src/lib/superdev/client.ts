import { createSuperdevClient } from "@superdevhq/client";

// Only create Superdev client if environment variables are set
const appId = import.meta.env.VITE_APP_ID;
const baseUrl = import.meta.env.VITE_SUPERDEV_BASE_URL;

export const superdevClient = appId && baseUrl 
  ? createSuperdevClient({
      appId,
      requiresAuth: false,
      baseUrl,
    })
  : null;
