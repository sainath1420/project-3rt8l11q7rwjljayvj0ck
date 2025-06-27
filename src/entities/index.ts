import { superdevClient } from "@/lib/superdev/client";

export const Analysis = superdevClient.entity("Analysis");
export const Company = superdevClient.entity("Company");
export const MarketingAsset = superdevClient.entity("MarketingAsset");
export const User = superdevClient.auth;
