import { NextRequest, NextResponse } from 'next/server'
import { geminiService } from '@/lib/gemini/service'
import type { CVFormData } from '@/types'

/**
 * API de test pour vérifier le bon fonctionnement de Gemini
 * Utilise des données de test pour valider la structure JSON
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de la variable d'environnement
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GEMINI_API_KEY non configurée',
          details: 'Veuillez configurer la variable d\'environnement GEMINI_API_KEY'
        },
        { status: 500 }
      )
    }

    // Données de test minimales
    const testCV: CVFormData = {
      personalInfo: {
        name: "Jean Dupont",
        email: "jean.dupont@example.com",
        phone: "06 12 34 56 78",
        location: "Paris, France",
        linkedin: "",
        website: ""
      },
      experiences: [
        {
          id: "exp-1",
          company: "TechCorp",
          position: "Développeur",
          location: "Paris",
          startDate: "2020-01",
          endDate: "2023-12",
          description: "Développement d'applications web. Travail en équipe. Utilisation de JavaScript.",
          isCurrentPosition: false
        }
      ],
      education: [
        {
          id: "edu-1",
          institution: "Université Paris",
          degree: "Master",
          field: "Informatique",
          startDate: "2018-09",
          endDate: "2020-06",
          description: "Formation en développement logiciel"
        }
      ],
      skills: [
        {
          id: "skill-1",
          name: "JavaScript",
          level: "intermediate",
          category: "technical"
        }
      ],
      languages: [
        {
          id: "lang-1",
          name: "Français",
          level: "native"
        }
      ]
    };

    // Test de l'amélioration Gemini
    const improvedCV = await geminiService.improveCompleteCV(testCV)

    // Vérifications de structure
    const validations = {
      personalInfoValid: !!(improvedCV.personalInfo?.name && improvedCV.personalInfo?.email),
      experiencesValid: Array.isArray(improvedCV.experiences) && 
        improvedCV.experiences.every(exp => exp.id && exp.company && exp.position),
      educationValid: Array.isArray(improvedCV.education) && 
        improvedCV.education.every(edu => edu.id && edu.institution && edu.degree),
      skillsValid: Array.isArray(improvedCV.skills) && 
        improvedCV.skills.every(skill => skill.id && skill.name),
      languagesValid: Array.isArray(improvedCV.languages) && 
        improvedCV.languages.every(lang => lang.id && lang.name)
    }

    const allValid = Object.values(validations).every(Boolean)
    const structureValidation = {
      hasPersonalInfo: !!improvedCV.personalInfo,
      hasExperiences: Array.isArray(improvedCV.experiences),
      hasEducation: Array.isArray(improvedCV.education),
      hasSkills: Array.isArray(improvedCV.skills),
      hasLanguages: Array.isArray(improvedCV.languages),
      experiencesCount: improvedCV.experiences?.length || 0,
      educationCount: improvedCV.education?.length || 0,
      skillsCount: improvedCV.skills?.length || 0,
      languagesCount: improvedCV.languages?.length || 0
    }

    return NextResponse.json({
      success: true,
      message: allValid ? 'Test réussi - Structure JSON valide' : 'Test échoué - Structure JSON invalide',
      validations,
      structureValidation,
      originalCV: testCV,
      improvedCV,
      improvements: {
        personalInfoImproved: JSON.stringify(testCV.personalInfo) !== JSON.stringify(improvedCV.personalInfo),
        experiencesImproved: JSON.stringify(testCV.experiences) !== JSON.stringify(improvedCV.experiences),
        educationImproved: JSON.stringify(testCV.education) !== JSON.stringify(improvedCV.education),
        skillsImproved: JSON.stringify(testCV.skills) !== JSON.stringify(improvedCV.skills),
        languagesImproved: JSON.stringify(testCV.languages) !== JSON.stringify(improvedCV.languages)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du test Gemini:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test échoué',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Endpoint GET pour afficher les informations de test
 */
export async function GET() {
  return NextResponse.json({
    message: '🧪 API de Test Gemini CV Genius',
    description: 'Utilisez POST pour tester l\'amélioration d\'un CV par Gemini AI',
    usage: {
      method: 'POST',
      endpoint: '/api/test-gemini',
      body: 'Aucun - utilise des données de test prédéfinies'
    },
    tests: [
      'Validation de la structure JSON retournée',
      'Vérification des champs obligatoires',
      'Test des améliorations par IA',
      'Validation des types de données'
    ],
    model: 'gemini-2.5-flash',
    apiImplementation: '@google/genai avec API key automatique',
    environmentVariable: 'GEMINI_API_KEY',
    timestamp: new Date().toISOString()
  })
} 