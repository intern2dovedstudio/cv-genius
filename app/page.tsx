import { Sparkles, FileText, Zap, Users, Code, Database } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-primary-600" />,
      title: "IA Avancée",
      description: "Utilise l'API Gemini pour transformer votre contenu brut en texte professionnel"
    },
    {
      icon: <FileText className="w-6 h-6 text-primary-600" />,
      title: "CV Optimisé",
      description: "Génère automatiquement un CV percutant et adapté aux standards du marché"
    },
    {
      icon: <Zap className="w-6 h-6 text-primary-600" />,
      title: "Résultats Instantanés",
      description: "Transformation rapide de vos informations en quelques secondes"
    }
  ]

  const techStack = [
    { name: "Next.js 14", description: "Framework React avec App Router" },
    { name: "TypeScript", description: "Typage statique pour un code robuste" },
    { name: "Tailwind CSS", description: "Framework CSS utilitaire" },
    { name: "Supabase", description: "Backend-as-a-Service (Auth + PostgreSQL)" },
    { name: "API Gemini", description: "Intelligence artificielle Google" },
    { name: "Vercel", description: "Plateforme de déploiement" }
  ]

  const learningObjectives = [
    "Clean Code & SOLID",
    "Design Patterns",
    "Tests (Unit, Integration, E2E)",
    "CI/CD avec Vercel",
    "Git & Workflow",
    "PostgreSQL & Supabase",
    "APIs REST",
    "Méthodologie Scrum"
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">CV Genius</h1>
            </div>
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
              🚧 Projet en cours de développement
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transformez votre CV avec{' '}
              <span className="text-primary-600">l'Intelligence Artificielle</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Une application web qui transforme votre brouillon de CV en document professionnel 
              grâce à l'API Gemini. Projet pédagogique pour apprendre les meilleures pratiques du développement web.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                🚀 Commencer le développement
              </button>
              <button className="btn-secondary">
                📖 Voir la documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h3>
            <p className="text-lg text-gray-600">
              Ce que l'application permettra de faire une fois terminée
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Code className="w-8 h-8 text-primary-600 mr-2" />
              <h3 className="text-3xl font-bold text-gray-900">Stack Technique</h3>
            </div>
            <p className="text-lg text-gray-600">
              Technologies modernes pour un apprentissage complet
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="card">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {tech.name}
                </h4>
                <p className="text-gray-600 text-sm">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Objectives */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary-600 mr-2" />
              <h3 className="text-3xl font-bold text-gray-900">Objectifs Pédagogiques</h3>
            </div>
            <p className="text-lg text-gray-600">
              Compétences développées à travers ce projet
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {learningObjectives.map((objective, index) => (
              <div key={index} className="bg-primary-50 rounded-lg p-4 text-center">
                <span className="text-primary-700 font-medium">
                  {objective}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Status */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-6">
            🎯 Prêt à commencer l'aventure ?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Ce projet est conçu comme une base d'apprentissage progressive. 
            Chaque fonctionnalité sera développée étape par étape en suivant les meilleures pratiques.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/10 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">📋 Documentation</h4>
              <p className="opacity-90">
                Consultez les fichiers PROJECT_OVERVIEW.md et LEARNING_OBJECTIVES.md 
                pour comprendre le projet en détail.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <h4 className="text-xl font-semibold mb-3">🛠️ Structure</h4>
              <p className="opacity-90">
                La structure du projet suit les conventions Next.js avec une 
                organisation claire des composants et services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-6 h-6 text-primary-400" />
                <span className="text-xl font-bold">CV Genius</span>
              </div>
              <p className="text-gray-400">
                Projet pédagogique pour apprendre le développement web moderne 
                avec Next.js, TypeScript et l'IA.
              </p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Technologies</h5>
              <ul className="space-y-2 text-gray-400">
                <li>• Next.js 14 + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• Supabase + PostgreSQL</li>
                <li>• API Gemini</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Apprentissage</h5>
              <ul className="space-y-2 text-gray-400">
                <li>• Clean Code & SOLID</li>
                <li>• Tests automatisés</li>
                <li>• CI/CD</li>
                <li>• Méthodologie Scrum</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 CV Genius - Projet pédagogique de développement web</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 