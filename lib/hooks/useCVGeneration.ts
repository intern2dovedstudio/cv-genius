"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CVFormData } from "@/types";
import {
  GenerationStep,
  CVGenerationState,
  CVGenerationCallbacks,
} from "@/types/cvGeneration";
import { cvGenerationService } from "@/lib/modal/cv-generation-modal-service";
interface UseCVGenerationProps {
  isOpen: boolean;
  cvData?: CVFormData;
  onComplete?: (pdfBlob: Blob, filename: string, resumeId?: string) => void;
  onClose: () => void;
}

export function useCVGeneration({ 
  isOpen, 
  cvData, 
  onComplete, 
  onClose 
}: UseCVGenerationProps) {
  const router = useRouter();

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

  // State management
  const [state, setState] = useState<CVGenerationState>({
    steps: initialSteps,
    aiResponse: "",
    currentAiStep: "",
    isGenerating: false,
    error: null,
    resumeId: null,
    isCompleted: false,
  });

  // Update step status helper
  const updateStepStatus = useCallback((
    stepId: string,
    status: GenerationStep["status"],
    details?: string
  ) => {
    setState((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, status, details } : step
      ),
    }));
  }, []);

  // Set AI response helper
  const setAiResponse = useCallback((
    updater: string | ((prev: string) => string)
  ) => {
    setState((prev) => ({
      ...prev,
      aiResponse: typeof updater === "function" ? updater(prev.aiResponse) : updater,
    }));
  }, []);

  // Set current AI step helper
  const setCurrentAiStep = useCallback((step: string) => {
    setState((prev) => ({ ...prev, currentAiStep: step }));
  }, []);

  // Set error helper
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Set generating state helper
  const setIsGenerating = useCallback((isGenerating: boolean) => {
    setState((prev) => ({ ...prev, isGenerating }));
  }, []);

  // PDF generation logic
  const generatePDF = useCallback(async (improvedCVData: CVFormData) => {
    // Check if already completed to prevent double execution
    let shouldSkip = false;
    setState((prev) => {
      if (prev.isCompleted) {
        console.log("useCVGeneration: PDF generation already completed, skipping");
        shouldSkip = true;
      }
      return prev;
    });
    
    if (shouldSkip) return;

    // Step 3: PDF Generation
    updateStepStatus("pdf-generation", "running");
    setCurrentAiStep("Génération du PDF professionnel...");

    const result = await cvGenerationService.generatePDF(improvedCVData);

    if (!result.success) {
      throw new Error(result.error || "Erreur lors de la génération PDF");
    }

    // Update state with successful result
    setState((prev) => ({
      ...prev,
      resumeId: result.resumeId || null,
      isCompleted: true,
    }));

    updateStepStatus("pdf-generation", "completed", "PDF généré avec succès");
    setCurrentAiStep("✅ CV généré avec succès !");

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
      console.log("useCVGeneration: No onComplete callback provided or missing data");
    }
  }, [updateStepStatus, setCurrentAiStep, onComplete]);

  // Main generation orchestration
  const startGeneration = useCallback(async () => {
    // Use functional state updates to check current state without dependencies
    let shouldReturn = false;
    setState((prev) => {
      if (!cvData || prev.isGenerating) {
        shouldReturn = true;
        return prev;
      }
      return prev;
    });
    
    if (shouldReturn) return;

    setIsGenerating(true);
    setError(null);
    setAiResponse("");
    setState((prev) => ({ ...prev, isCompleted: false, resumeId: null }));

    try {
      // Step 1: Validation
      updateStepStatus("validation", "running");
      setCurrentAiStep("Vérification des données du CV...");

      const validation = cvGenerationService.validateCVData(cvData!);
      if (!validation.isValid) {
        throw new Error(validation.error || "Données invalides");
      }

      updateStepStatus(
        "validation",
        "completed",
        "Données validées avec succès"
      );

      // Step 2: AI Improvement
      updateStepStatus("ai-improvement", "running");
      setCurrentAiStep("Connexion à Gemini AI...");

      // Start AI streaming simulation
      const streamText = cvGenerationService.getAIStreamText(cvData!);
      cvGenerationService.simulateAIStreaming(streamText, setAiResponse);

      // Make actual AI improvement call
      setCurrentAiStep("Amélioration du contenu par IA...");
      const aiResult = await cvGenerationService.improveCV(cvData!);

      if (!aiResult.success) {
        throw new Error(aiResult.error || "Erreur lors de l'amélioration IA");
      }

      // Stop streaming and complete AI step
      cvGenerationService.stopStreaming();
      updateStepStatus("ai-improvement", "completed", "CV amélioré par l'IA");

      // Step 3: Generate PDF
      if (aiResult.improvedCV) {
        await generatePDF(aiResult.improvedCV);
      } else {
        throw new Error("Données améliorées manquantes");
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setError(errorMessage);

      // Mark current running step as error using functional update
      setState((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.status === "running"
            ? { ...step, status: "error" as const, details: errorMessage }
            : step
        ),
      }));
    } finally {
      setIsGenerating(false);
    }
  }, [
    cvData,
    updateStepStatus,
    setCurrentAiStep,
    setAiResponse,
    setError,
    setIsGenerating,
    generatePDF,
  ]);

  // Navigate to preview page
  const handlePreview = useCallback(() => {
    if (state.resumeId) {
      router.push(`/preview/${state.resumeId}`);
      onClose();
    }
  }, [state.resumeId, router, onClose]);

  // Reset state when modal closes
  const resetState = useCallback(() => {
    setState({
      steps: initialSteps,
      aiResponse: "",
      currentAiStep: "",
      isGenerating: false,
      error: null,
      resumeId: null,
      isCompleted: false,
    });
    cvGenerationService.stopStreaming();
  }, []);

  // Start generation when modal opens
  useEffect(() => {
    if (isOpen && cvData && !state.isGenerating && !state.isCompleted) {
      console.log("useCVGeneration: Starting generation due to modal opening");
      startGeneration();
    }
  }, [isOpen, cvData, startGeneration]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  return {
    // State
    ...state,
    
    // Actions
    startGeneration,
    handlePreview,
    resetState,
  };
}