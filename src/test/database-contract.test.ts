import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const quotaMigration = readFileSync(
  "supabase/migrations/20260529131340_a692a258-0c88-4905-82d3-cd06cf91a866.sql",
  "utf8",
);
const savedMigration = readFileSync(
  "supabase/migrations/20260616175522_bcd3e52c-ca8d-4aa0-bfd7-669c8d0dd6ee.sql",
  "utf8",
);

describe("database security contract", () => {
  it("protects generation records and grants only required access", () => {
    expect(quotaMigration).toMatch(/GRANT SELECT, INSERT ON public\.workout_generations TO authenticated/i);
    expect(quotaMigration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(quotaMigration.match(/auth\.uid\(\) = user_id/g)).toHaveLength(2);
    expect(quotaMigration).not.toMatch(/TO anon/i);
  });

  it("protects every saved-workout operation by ownership", () => {
    expect(savedMigration).toMatch(/GRANT SELECT, INSERT, UPDATE, DELETE ON public\.saved_workouts TO authenticated/i);
    expect(savedMigration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(savedMigration.match(/auth\.uid\(\) = user_id/g)?.length).toBeGreaterThanOrEqual(5);
    expect(savedMigration).toMatch(/BEFORE UPDATE ON public\.saved_workouts/i);
    expect(savedMigration).not.toMatch(/TO anon/i);
  });
});