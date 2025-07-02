# CV Genius 📄✨

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green)](https://supabase.com/)

> **Projet pédagogique** : Application web qui transforme votre brouillon de CV en document professionnel grâce à l'intelligence artificielle.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (gratuit)
- Clé API Gemini (Google AI Studio)

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd cv-genius
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Remplir les variables d'environnement dans `.env.local` :
```env
# Supabase (à obtenir depuis https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API (à obtenir depuis https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key

# Next.js
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📚 Documentation

- **[📋 Aperçu du projet](./PROJECT_OVERVIEW.md)** - Description complète et architecture
- **[🎓 Objectifs pédagogiques](./LEARNING_OBJECTIVES.md)** - Compétences à développer
- **[🛠️ Guide de développement](./docs/DEVELOPMENT.md)** - Conventions et workflow (à créer)

## 🏗️ Structure du projet

```
cv-genius/
├── 📱 app/                 # App Router Next.js 14
│   ├── 🔐 (auth)/         # Routes d'authentification  
│   ├── 📊 dashboard/      # Interface utilisateur
│   ├── ✏️ cv-builder/     # Création de CV
│   ├── 🔌 api/           # API Routes
│   └── 📄 page.tsx       # Page d'accueil
├── 🧩 components/         # Composants React
│   ├── ui/               # Composants de base
│   ├── forms/            # Formulaires
│   └── layout/           # Mise en page
├── 📚 lib/               # Services et utilitaires
│   ├── supabase/         # Configuration base de données
│   ├── gemini/           # Service IA
│   └── utils/            # Fonctions utilitaires
├── 🏷️ types/             # Définitions TypeScript
└── 🧪 tests/             # Tests automatisés
```

## 🛠️ Scripts de développement

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production

# Tests
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run test:coverage # Couverture de code
npm run test:e2e     # Tests end-to-end

# Qualité de code
npm run lint         # ESLint
npm run type-check   # Vérification TypeScript
```

## 📋 Plan d'apprentissage

### Phase 1 : Fondations (Semaines 1-2)
- [ ] Configuration de l'environnement de développement
- [ ] Compréhension de l'architecture Next.js 14
- [ ] Mise en place de l'authentification Supabase
- [ ] Création des premiers composants

### Phase 2 : Fonctionnalités Core (Semaines 3-4)
- [ ] Formulaires de saisie avec validation
- [ ] Intégration base de données
- [ ] Tests unitaires et d'intégration
- [ ] Interface utilisateur responsive

### Phase 3 : IA et Génération (Semaines 5-6)
- [ ] Intégration API Gemini
- [ ] Gestion des erreurs et états de chargement
- [ ] Optimisation des prompts IA
- [ ] Tests des API externes

### Phase 4 : Production (Semaines 7-8)
- [ ] Tests end-to-end complets
- [ ] Optimisation des performances
- [ ] Déploiement et monitoring
- [ ] Documentation finale

## 🔧 Configuration Supabase

### 1. Créer un nouveau projet
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé API anonyme

### 2. Configurer la base de données
```sql
-- Création de la table des CV
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  raw_content JSONB NOT NULL,
  generated_content JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Politique de sécurité (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own resumes" ON resumes
  FOR ALL USING (auth.uid() = user_id);
```

## 🤖 Configuration Gemini API

1. Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créer une nouvelle clé API
3. L'ajouter dans `.env.local`

## 🧪 Tests

Le projet inclut une suite de tests complète :

- **Tests unitaires** : Composants et fonctions utilitaires
- **Tests d'intégration** : API Routes et services
- **Tests E2E** : Parcours utilisateur complets

```bash
# Exécuter tous les tests
npm run test

# Tests avec couverture
npm run test:coverage

# Tests E2E avec Playwright
npm run test:e2e
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Le déploiement se fait automatiquement

### Variables d'environnement production
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🎯 Fonctionnalités prévues

### ✅ Phase 1 - MVP
- [x] Page d'accueil informative
- [ ] Authentification utilisateur
- [ ] Formulaire de saisie CV
- [ ] Intégration IA Gemini
- [ ] Prévisualisation résultats

### 🔄 Phase 2 - Améliorations
- [ ] Templates de CV multiples
- [ ] Édition du contenu généré
- [ ] Export PDF
- [ ] Historique des versions

### 🚀 Phase 3 - Avancé
- [ ] Optimisation ATS
- [ ] Suggestions intelligentes
- [ ] Partage public
- [ ] Analytics et métriques

## 📞 Support et contributions

Ce projet est conçu à des fins pédagogiques. Pour toute question :

1. Consulter la documentation dans `/docs`
2. Vérifier les issues GitHub existantes
3. Créer une nouvelle issue si nécessaire

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Bonne chance dans votre apprentissage ! 🎓✨** 