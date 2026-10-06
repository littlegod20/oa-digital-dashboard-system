import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { PHASE_META } from "@/lib/types";
import type { PipelinePhase } from "@/lib/types";

export const PHASE_TONE: Record<PipelinePhase, BadgeTone> = {
  lead:     "neutral",
  proposal: "info",
  await:    "warning",
  meet:     "violet",
  action:   "danger",
  progress: "success",
  done:     "success",
  hold:     "neutral",
};

export function PhaseBadge({ phase }: { phase: PipelinePhase }) {
  const meta = PHASE_META[phase];
  return (
    <Badge tone={PHASE_TONE[phase] ?? "neutral"} dot>
      {meta?.label ?? phase}
    </Badge>
  );
}
