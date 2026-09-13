export const SITE_URL = "https://docs.reex-api.dev";
export const SITE_NAME = "Reex API Builder Documentation";
export const TITLE_TEMPLATE = "%s | Reex API Builder";
export const SITE_DESCRIPTION =
  "Learn to test APIs and generate TypeScript API clients, React Query hooks, and authentication flows with Reex API Builder's guides and examples.";

export const SITE_KEYWORDS = [
  "Reex API Builder",
  "API testing",
  "REST endpoint testing",
  "React API code generation",
  "TypeScript API clients",
  "React Query hooks",
  "React and Next.js setup",
  "Authentication and custom React hooks",
  "API collection testing",
  "Swagger",
  "OpenAPI",
  "Postman collections",
  "API Sandbox",
  "two-way synchronization",
  "API",
  "Builder",
  "Integration",
  "Code Generation",
  "Reex",
  "reex commands",
  "reex cli",
  "reex start",
  "reex reset",
  "reex sync",
  "reex add",
  "npx reex-cli",
  "npm reex-cli",
  "Reex API",
  "reex-cli",
  "React Query generator",
  "TanStack Query",
  "OpenAPI code generator",
  "Postman collection parser",
  "AST code generator",
  "Private Network Access API testing",
  "open source API client",
  "TypeScript API hooks",
  "reex",
  "reex-api-builder",
  "api-builder",
  "api",
  "openapi",
  "swagger",
  "typescript",
  "react-query",
  "code-generator",
  "cli",
  "rest-api",
  "hooks",
];

export const SOCIAL_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Reex API Builder logo",
};

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
