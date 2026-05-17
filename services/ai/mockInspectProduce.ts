import type { InspectionResult } from '../../types/index';

// Simulates a conservative produce inspection result.
// Real AI analysis replaces this in a later phase.

export const MOCK_NEXT_ACTION =
  'Review the captured produce image and continue to notify Bob if the issue needs escalation.';

const MOCK_RESULT: InspectionResult = {
  produceStatus: 'Needs attention',
  identifiedIssue: 'Some produce appears damaged or quality is uncertain.',
  suggestedSolution: 'Set the box aside and mark it for manual inspection.',
  spokenMessage:
    "I'm seeing a possible quality issue with this box. Some produce may be damaged or below expected condition. I recommend setting it aside for inspection.",
  confidence: 'medium',
};

export async function mockInspectProduce(_imageUri: string): Promise<InspectionResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 700));
  return { ...MOCK_RESULT };
}
