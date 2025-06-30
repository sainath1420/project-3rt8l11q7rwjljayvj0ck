import { superdevClient } from "@/lib/superdev/client";

// Only export entities if Superdev client is available
export const Analysis = superdevClient?.entity("Analysis");
export const Company = superdevClient?.entity("Company");
export const MarketingAsset = superdevClient?.entity("MarketingAsset");
export const Session = superdevClient?.entity("Session");
// Remove Superdev auth - we're using Appwrite instead
// export const User = superdevClient.auth;
