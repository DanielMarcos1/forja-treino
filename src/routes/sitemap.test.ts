import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config }));

describe("sitemap", () => {
  it("serves all public pages in every language with alternate links", async () => {
    const { Route } = await import("./sitemap[.]xml");
    const handler = (Route as unknown as { server: { handlers: { GET: () => Promise<Response> } } })
      .server.handlers.GET;
    const response = await handler();
    const xml = await response.text();
    expect(response.headers.get("Content-Type")).toBe("application/xml");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(xml.match(/<url>/g)).toHaveLength(8);
    expect(xml).toContain("<loc>https://forjatreino.com</loc>");
    expect(xml).toContain("<loc>https://forjatreino.com/fr/sobre</loc>");
    expect(xml).toContain('hreflang="x-default"');
  });
});
