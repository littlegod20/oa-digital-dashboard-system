import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { PHASE_META } from "@/lib/types";
import type { PipelinePhase } from "@/lib/types";

const PHASE_TONE: Record<PipelinePhase, BadgeTone> = {
  lead:     "neutral",
  proposal: "info",
  await:    "warning",
  meet:     "info",
  action:   "warning",
  progress: "success",
  done:     "success",
  hold:     "neutral",
};

export function PhaseBadge({ phase }: { phase: PipelinePhase }) {
  const meta = PHASE_META[phase];
  const tone = PHASE_TONE[phase];
  return <Badge tone={tone} dot>{meta.label}</Badge>;
}
