// Type definitions for the summary/receipt page data model.
// RejectionInfo captures a single reason why the user must apply for a permit.

import type { ProximityDetailPayload } from "../../lib/map/drawingHandlers";
import type { propertyDetailPayload } from "../../lib/map/getPlaces";

// SummaryState bundles all rejection reasons and an early-termination flag.
export interface RejectionInfo {
  questionTitle: string;
  questionDescription: string;
  reason: string;
}

  export interface QAItem{
    questionId: string;
    questionTitle: string;
    answer: string;
  }

export interface SummaryState {
    endedEarly: boolean;
    rejectionInfo: RejectionInfo[];
    qaList: QAItem[];
    proximityDetail?: ProximityDetailPayload | null;
    propertyRawData?: propertyDetailPayload | null;
    mapScreenshot?: string | null; // base64 data url
  };

