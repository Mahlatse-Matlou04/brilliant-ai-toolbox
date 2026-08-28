import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runStudyToolOnGateway } from "./study.server";

const StudyToolInput = z.object({
  tool: z.enum(["homework", "notes", "planner", "research", "email"]),
  fields: z.record(z.string(), z.string()),
});

export const runStudyTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => StudyToolInput.parse(data))
  .handler(async ({ data }) => runStudyToolOnGateway(data.tool, data.fields));
