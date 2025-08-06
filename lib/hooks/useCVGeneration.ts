"use client";

import { useEffect, useCallback, useReducer } from "react";
import { useRouter } from "next/navigation";
import { CVFormData } from "@/types";
import {
  GenerationStep,
  GenerationStepId,
  CVGenerationState,
  CVGenerationError,
  CVGenerationAction,
} from "@/types/cvGeneration";
import { cvGenerationService } from "@/lib/modal/cv-generation-modal-service";
interface UseCVGenerationProps {
  isOpen: boolean;
  cvData?: CVFormData;
  onComplete?: (pdfBlob: Blob, filename: string, resumeId?: string) => void;
  onClose: () => void;
}

// Initialize steps with their default state
const initialSteps: GenerationStep[] = [
  {
    id: "validation",
    label: "Validation des données",
    status: "pending",
  },
  {
    id: "ai-improvement",
    label: "Amélioration par IA",
    status: "pending",
  },
  {
    id: "pdf-generation",
    label: "Génération PDF",
    status: "pending",
  },
];

const initialState: CVGenerationState = {
  steps: initialSteps,
  aiResponse: "",
  currentAiStep: "",
  isGenerating: false,
  error: null,
  resumeId: null,
  isCompleted: false,
};

function modalReducer(state: CVGenerationState, action: CVGenerationAction) {
  switch (action.type) {
    case "PROCESS_SUCCESS":
      return {
        ...state,
        resumeId: action.payload.resumeId || null,
        isCompleted: action.payload.isCompleted,
        currentAiStep: action.payload.isCompleted ? "" : state.currentAiStep,
        steps: state.steps.map((step) =>
          step.id === action.payload.stepId
            ? {
                ...step,
                status: action.payload.status,
                details: action.payload.details,
              }
            : step
        ),
      };
    case "RESET":
      return initialState;

    case "PROCESS_START":
      return {
        ...state,
        currentAiStep: action.payload.stepContent,
        steps: state.steps.map((step) =>
          step.id === action.payload.stepId
            ? {
                ...step,
                status: action.payload.status,
                details: "",
              }
            : step
        ),
      };

    case "SET_STEP_STATUS":
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === action.payload.stepId
            ? {
                ...step,
                status: action.payload.status,
                details: action.payload.details,
              }
            : step
        ),
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload.error,
      };

    case "SET_IS_GENERATING":
      return {
        ...state,
        isGenerating: action.payload.isGenerating,
      };

    case "SET_AI_RESPONSE":
      return {
        ...state,
        aiResponse: action.payload.aiResponse,
      };

    default:
      return state;
  }
}

export function useCVGeneration({
  isOpen,
  cvData,
  onComplete,
  onClose,
}: UseCVGenerationProps) {
  const router = useRouter();

  const [state, dispatch] = useReducer(modalReducer, initialState);

  // PDF generation logic
  const generatePDF = useCallback(
    async (improvedCVData: CVFormData) => {
      // Check if already completed to prevent double execution
      let shouldSkip = false;
      if (state.isCompleted) {
        console.log(
          "useCVGeneration: PDF generation already completed, skipping"
        );
        shouldSkip = true;
      }

      if (shouldSkip) return;

      // Step 3: PDF Generation
      dispatch({
        type: "PROCESS_START",
        payload: {
          stepId: "pdf-generation",
          status: "running",
          stepContent: "Génération du PDF professionnel...",
        },
      });

      const result = await cvGenerationService.generatePDF(improvedCVData);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la génération PDF");
      }
      dispatch({
        type: "PROCESS_SUCCESS",
        payload: {
          resumeId: result.resumeId || null,
          isCompleted: true,
          stepId: "pdf-generation",
          status: "completed",
          details: "PDF généré avec succès",
          stepContent: "✅ CV généré avec succès !",
        },
      });

      // Call onComplete callback
      console.log("useCVGeneration: About to call onComplete callback", {
        hasOnComplete: !!onComplete,
        resumeId: result.resumeId,
        filename: result.filename,
      });

      if (onComplete && result.resumeId && result.filename) {
        onComplete(new Blob(), result.filename, result.resumeId);
        console.log("useCVGeneration: onComplete callback called successfully");
      } else {
        console.log(
          "useCVGeneration: No onComplete callback provided or missing data"
        );
      }
    },
    [state.isCompleted, onComplete, dispatch]
  );

  // Main generation orchestration
  const startGeneration = useCallback(async () => {
    // Use functional state updates to check current state without dependencies
    let shouldReturn = false;
    if (!cvData || state.isGenerating) {
      shouldReturn = true;
    }

    if (shouldReturn) return;

    dispatch({ type: "SET_IS_GENERATING", payload: { isGenerating: true } });

    try {
      // Step 1: Validation
      dispatch({
        type: "PROCESS_START",
        payload: {
          stepContent: "Vérification des données du CV...",
          stepId: "validation",
          status: "running",
        },
      });

      const validation = await new Promise((resolve) => {
        setTimeout(() => {
          const result = cvGenerationService.validateCVData(cvData!);
          resolve(result);
        }, 1000);
      });

      if (!(validation as any).isValid) {
        throw new Error((validation as any).error || "Données invalides");
      }

      dispatch({
        type: "PROCESS_SUCCESS",
        payload: {
          resumeId: null,
          isCompleted: false,
          stepId: "validation",
          status: "completed",
          details: "Validation completed",
          stepContent: "Données validées avec succès",
        },
      });

      // Step 2: AI Improvement
      dispatch({
        type: "PROCESS_START",
        payload: {
          stepContent: "Amélioration du contenu par IA...",
          stepId: "ai-improvement",
          status: "running",
        },
      });

      // Start AI streaming simulation
      const streamText = cvGenerationService.getAIStreamText(cvData!);
      const updateAiResponse = (response: string) => {
        dispatch({
          type: "SET_AI_RESPONSE",
          payload: { aiResponse: response },
        });
      };
      cvGenerationService.simulateAIStreaming(streamText, updateAiResponse);

      const aiResult = await cvGenerationService.improveCV(cvData!);

      if (!aiResult.success) {
        throw new Error(aiResult.error || "Erreur lors de l'amélioration IA");
      }

      // Stop streaming and complete AI step
      cvGenerationService.stopStreaming();
      dispatch({
        type: "PROCESS_SUCCESS",
        payload: {
          resumeId: null,
          isCompleted: false,
          stepId: "ai-improvement",
          status: "completed",
          details: "AI improvement completed",
          stepContent: "CV amélioré par l'IA",
        },
      });

      // Step 3: Generate PDF
      if (aiResult.improvedCV) {
        await generatePDF(aiResult.improvedCV);
      } else {
        throw new Error("Données améliorées manquantes");
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";

      // Find the current running step
      const currentStep = state.steps.find((step) => step.status === "running");
      if (currentStep) {
        dispatch({
          type: "SET_STEP_STATUS",
          payload: {
            stepId: currentStep.id,
            status: "error",
            details: errorMessage,
          },
        });
      }

      const cvError = cvGenerationService.createCVGenerationError(
        errorMessage,
        {
          step: currentStep?.id,
          error: error instanceof Error ? error : undefined,
        }
      );
      dispatch({
        type: "SET_ERROR",
        payload: { error: cvError },
      });
    } finally {
      dispatch({
        type: "SET_IS_GENERATING",
        payload: { isGenerating: false },
      });
    }
  }, [cvData, dispatch, state.isGenerating, state.steps, generatePDF]);

  // Navigate to preview page
  const handlePreview = useCallback(() => {
    if (state.resumeId) {
      router.push(`/preview/${state.resumeId}`);
      onClose();
    }
  }, [state.resumeId, router, onClose]);

  // Start generation when modal opens
  useEffect(() => {
    if (isOpen && cvData && !state.isGenerating && !state.isCompleted) {
      console.log("useCVGeneration: Starting generation due to modal opening");
      startGeneration();
    }
  }, [isOpen, cvData, state.isGenerating, state.isCompleted, startGeneration]);

  // Reset when modal close
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: "RESET" });
      cvGenerationService.stopStreaming();
    }
  }, [isOpen]);

  return {
    // State
    ...state,

    // Actions
    startGeneration,
    handlePreview,
  };
}
