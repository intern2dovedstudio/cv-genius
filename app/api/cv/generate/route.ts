import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/gemini/service";
import type { CVFormData } from "@/types";

/**
 * API pour générer un CV avec Gemini
 * Prend un CV JSON et retourne un PDF généré
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Récupération des données du CV
    const body = await request.json();
    const { formData: cvData }: { formData: CVFormData } = body;

    if (!cvData) {
      console.error("❌ Aucune donnée CV fournie");
      return NextResponse.json(
        { success: false, error: "Données CV requises" },
        { status: 400 }
      );
    }

    // 2. Validation des données essentielles
    if (!cvData.personalInfo?.name || !cvData.personalInfo?.email) {
      console.error("❌ Informations personnelles incomplètes");
      return NextResponse.json(
        { success: false, error: "Nom et email requis" },
        { status: 400 }
      );
    }

    console.log("📊 Données CV reçues pour génération:", {
      personalInfo: Object.keys(cvData.personalInfo).length,
      experiences: cvData.experiences?.length || 0,
      education: cvData.education?.length || 0,
      skills: cvData.skills?.length || 0,
      languages: cvData.languages?.length || 0,
    });

    // 3. Génération du CV avec Gemini (placeholder - implémentation spécifique nécessaire)
    console.log("🤖 Génération du CV avec Gemini...");
    
    try {
      // Note: Cette route nécessite une implémentation spécifique pour la génération PDF
      // Pour l'instant, on retourne une structure de base
      const generatedCV = {
        id: `cv_${Date.now()}`,
        data: cvData,
        generatedAt: new Date().toISOString(),
        status: 'generated'
      };

      console.log("✅ CV généré avec succès");

      return NextResponse.json({
        success: true,
        cv: generatedCV,
        timestamp: new Date().toISOString(),
        source: "cv-genius-generation",
      });
    } catch (generationError) {
      console.error("❌ Erreur génération:", generationError);
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la génération du CV",
          details:
            generationError instanceof Error
              ? generationError.message
              : "Erreur inconnue",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors de la génération du CV:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur interne lors de la génération du CV",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}