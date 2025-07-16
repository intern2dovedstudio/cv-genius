# 🧹 Tutoriel Clean Code & Principes SOLID

## 📚 Table des Matières
1. [Introduction au Clean Code](#introduction)
2. [Les 5 Principes SOLID](#solid)
3. [Analyse du Code Existant](#analyse)
4. [Refactoring Pratique](#refactoring)
5. [Exercices](#exercices)

---

## 🎯 Introduction au Clean Code {#introduction}

### Qu'est-ce que le Clean Code ?

Le **Clean Code** est du code qui :
- **Se lit comme une histoire** : Facile à comprendre
- **Exprime l'intention** : Noms explicites
- **Fait une seule chose** : Responsabilités claires
- **Est facile à modifier** : Extensible sans casser

### Pourquoi c'est important ?

```typescript
// ❌ Code sale
function p(u: any) {
  if (u.e && u.e.includes('@')) {
    const r = fetch('/api/users', {method: 'POST', body: JSON.stringify(u)})
    return r.then(d => d.json()).then(data => {
      if (data.ok) localStorage.setItem('user', JSON.stringify(data.user))
      return data
    })
  }
  throw new Error('Invalid')
}

// ✅ Code propre
interface User {
  email: string;
  name: string;
}

async function createUser(userData: User): Promise<UserResponse> {
  validateUserEmail(userData.email);
  
  const response = await userRepository.create(userData);
  
  if (response.success) {
    localStorage.setItem('user', JSON.stringify(response.user));
  }
  
  return response;
}
```

---

## 🏗️ Les 5 Principes SOLID {#solid}

### S - Single Responsibility Principle (SRP)
> **"Une classe ne devrait avoir qu'une seule raison de changer"**

**❌ Violation SRP :**
```typescript
// Ce composant fait TROP de choses
export function CVDashboard() {
  // 1. Gestion de l'état du CV
  const [cvData, setCvData] = useState<CVData>()
  
  // 2. Gestion des uploads
  const [file, setFile] = useState<File>()
  
  // 3. Gestion de l'authentification
  const [user, setUser] = useState<User>()
  
  // 4. Appels API
  const generateCV = async () => {
    const response = await fetch('/api/cv/generate', {
      method: 'POST',
      body: JSON.stringify(cvData)
    })
    // Logic complexe...
  }
  
  // 5. Validation
  const validateForm = () => {
    // Logic de validation...
  }
  
  // 6. Rendu UI complexe
  return (
    <div>
      {/* 100 lignes de JSX complexe */}
    </div>
  )
}
```

**✅ Respect SRP :**
```typescript
// Chaque composant a UNE responsabilité
export function CVDashboard() {
  return (
    <div>
      <FileUploadSection />
      <CVFormSection />
      <CVGenerationSection />
    </div>
  )
}

// Responsabilité : Gestion de l'upload uniquement
export function FileUploadSection() {
  const { uploadFile, isUploading } = useFileUpload()
  return <div>{/* Logic d'upload */}</div>
}

// Responsabilité : Gestion du formulaire uniquement
export function CVFormSection() {
  const { formData, updateForm } = useCVForm()
  return <div>{/* Logic de formulaire */}</div>
}
```

### O - Open/Closed Principle (OCP)
> **"Ouvert à l'extension, fermé à la modification"**

**❌ Violation OCP :**
```typescript
// Pour ajouter un nouveau type, on doit MODIFIER cette classe
class CVGenerator {
  generate(type: string, data: CVData) {
    if (type === 'modern') {
      return this.generateModern(data)
    } else if (type === 'classic') {
      return this.generateClassic(data)
    } else if (type === 'creative') {  // ⚠️ Modification requise!
      return this.generateCreative(data)
    }
  }
}
```

**✅ Respect OCP :**
```typescript
// Interface pour l'extension
interface CVTemplate {
  generate(data: CVData): Promise<CVOutput>
}

// Implémentations fermées à la modification
class ModernTemplate implements CVTemplate {
  async generate(data: CVData): Promise<CVOutput> {
    // Logic moderne
  }
}

class ClassicTemplate implements CVTemplate {
  async generate(data: CVData): Promise<CVOutput> {
    // Logic classique
  }
}

// Extension SANS modification
class CreativeTemplate implements CVTemplate {
  async generate(data: CVData): Promise<CVOutput> {
    // Logic créative
  }
}

// Factory qui reste fermée à la modification
class CVTemplateFactory {
  private templates = new Map<string, CVTemplate>([
    ['modern', new ModernTemplate()],
    ['classic', new ClassicTemplate()],
    ['creative', new CreativeTemplate()], // ✅ Juste ajout!
  ])
  
  create(type: string): CVTemplate {
    return this.templates.get(type) || new ModernTemplate()
  }
}
```

### L - Liskov Substitution Principle (LSP)
> **"Les objets dérivés doivent pouvoir remplacer leurs types de base"**

**❌ Violation LSP :**
```typescript
interface ContentGenerator {
  generate(content: string): Promise<string>
}

class GeminiGenerator implements ContentGenerator {
  async generate(content: string): Promise<string> {
    // Logic normale
    return improvedContent
  }
}

class MockGenerator implements ContentGenerator {
  async generate(content: string): Promise<string> {
    throw new Error("Not implemented in mock") // ⚠️ Casse le contrat!
  }
}
```

**✅ Respect LSP :**
```typescript
class MockGenerator implements ContentGenerator {
  async generate(content: string): Promise<string> {
    // Comportement cohérent même en mock
    return `[MOCK] ${content}`
  }
}

// Peut être utilisé partout où ContentGenerator est attendu
function useGenerator(generator: ContentGenerator) {
  // Fonctionne avec Gemini ET Mock
  return generator.generate("test content")
}
```

### I - Interface Segregation Principle (ISP)
> **"Ne forcez pas les clients à dépendre d'interfaces qu'ils n'utilisent pas"**

**❌ Violation ISP :**
```typescript
// Interface trop large
interface CVService {
  parse(file: File): Promise<CVData>
  improve(content: string): Promise<string>
  generatePDF(data: CVData): Promise<Buffer>
  sendEmail(cv: Buffer, email: string): Promise<void>
  saveToDatabase(data: CVData): Promise<void>
  analytics(event: string): void
}

// Le composant de parsing n'a pas besoin de tout ça!
class CVParser implements CVService {
  async parse(file: File): Promise<CVData> { /* ... */ }
  
  // ⚠️ Forcé d'implémenter des méthodes inutiles
  async improve(content: string): Promise<string> { throw new Error() }
  async generatePDF(data: CVData): Promise<Buffer> { throw new Error() }
  async sendEmail(cv: Buffer, email: string): Promise<void> { throw new Error() }
  async saveToDatabase(data: CVData): Promise<void> { throw new Error() }
  analytics(event: string): void { throw new Error() }
}
```

**✅ Respect ISP :**
```typescript
// Interfaces spécialisées
interface CVParser {
  parse(file: File): Promise<CVData>
}

interface CVImprover {
  improve(content: string): Promise<string>
}

interface CVGenerator {
  generatePDF(data: CVData): Promise<Buffer>
}

// Classes spécialisées
class PDFParser implements CVParser {
  async parse(file: File): Promise<CVData> { /* Logic de parsing */ }
}

class GeminiImprover implements CVImprover {
  async improve(content: string): Promise<string> { /* Logic d'amélioration */ }
}
```

### D - Dependency Inversion Principle (DIP)
> **"Dépendez d'abstractions, pas de concrétions"**

**❌ Violation DIP :**
```typescript
// Service qui dépend de détails concrets
class CVGenerationService {
  private geminiService = new GeminiService() // ⚠️ Dépendance concrète
  private pdfGenerator = new PDFGenerator()   // ⚠️ Dépendance concrète
  
  async generate(data: CVData) {
    const improved = await this.geminiService.improve(data)
    return this.pdfGenerator.generate(improved)
  }
}
```

**✅ Respect DIP :**
```typescript
// Abstractions
interface ContentImprover {
  improve(data: CVData): Promise<CVData>
}

interface PDFGenerator {
  generate(data: CVData): Promise<Buffer>
}

// Service qui dépend d'abstractions
class CVGenerationService {
  constructor(
    private contentImprover: ContentImprover, // ✅ Abstraction
    private pdfGenerator: PDFGenerator        // ✅ Abstraction
  ) {}
  
  async generate(data: CVData) {
    const improved = await this.contentImprover.improve(data)
    return this.pdfGenerator.generate(improved)
  }
}

// Injection de dépendances
const service = new CVGenerationService(
  new GeminiImprover(),
  new jsPDFGenerator()
)
```

---

## 🔍 Analyse du Code Existant {#analyse}

### Problèmes identifiés dans CV Genius

#### 1. Service Gemini - Violation SRP
**Fichier :** `lib/gemini/service.ts`

**Problème :** La classe `GeminiService` fait trop de choses :
- Communication avec l'API
- Gestion des erreurs
- Parsing de JSON
- Validation des données

**Solution à implémenter :**

```typescript
// ✅ Séparation des responsabilités

// 1. Communication API pure
interface AIProvider {
  generateContent(prompt: string): Promise<string>
}

class GeminiProvider implements AIProvider {
  async generateContent(prompt: string): Promise<string> {
    // Logic de communication uniquement
  }
}

// 2. Gestion des prompts
class CVPromptBuilder {
  buildCompleteImprovementPrompt(data: CVData): string {
    // Logic de construction de prompts
  }
  
  buildSectionImprovementPrompt(content: string, section: string): string {
    // Logic pour prompts de section
  }
}

// 3. Parsing et validation
class CVResponseParser {
  parseImprovedCV(response: string): CVData {
    // Logic de parsing JSON
  }
  
  validateCVStructure(data: any): boolean {
    // Logic de validation
  }
}

// 4. Service orchestrateur
class CVImprovementService {
  constructor(
    private aiProvider: AIProvider,
    private promptBuilder: CVPromptBuilder,
    private responseParser: CVResponseParser
  ) {}
  
  async improveCompleteCV(data: CVData): Promise<CVData> {
    const prompt = this.promptBuilder.buildCompleteImprovementPrompt(data)
    const response = await this.aiProvider.generateContent(prompt)
    return this.responseParser.parseImprovedCV(response)
  }
}
```

#### 2. Hook useCVForm - Violation SRP
**Fichier :** `lib/hooks/useCVForm.ts`

**Problème :** Le hook gère trop de responsabilités :
- État du formulaire
- Validation
- Soumission
- Gestion des toasts
- Navigation

#### 3. Composant Dashboard - Violation SRP
**Fichier :** `app/dashboard/page.tsx`

**Problème :** Le composant principal orchestre trop de logiques différentes.

---

## 🛠️ Refactoring Pratique {#refactoring}

### Exercice 1 : Refactorer GeminiService

**Étape 1 :** Créer les interfaces

```typescript
// lib/ai/interfaces.ts
export interface AIProvider {
  generateContent(prompt: string): Promise<string>
}

export interface PromptBuilder {
  buildPrompt(data: any, context: string): string
}

export interface ResponseParser<T> {
  parse(response: string): T
}
```

**Étape 2 :** Implémenter les classes spécialisées

```typescript
// lib/ai/providers/GeminiProvider.ts
import { GoogleGenAI } from "@google/genai"
import { AIProvider } from "../interfaces"

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey })
  }

  async generateContent(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    })
    
    if (!response.text) {
      throw new Error('No content generated')
    }
    
    return response.text.trim()
  }
}
```

```typescript
// lib/ai/prompts/CVPromptBuilder.ts
import { PromptBuilder } from "../interfaces"
import { CVFormData } from "@/types"

export class CVPromptBuilder implements PromptBuilder {
  buildPrompt(data: CVFormData, context: string): string {
    if (context === 'complete') {
      return this.buildCompletePrompt(data)
    }
    if (context === 'section') {
      return this.buildSectionPrompt(data, context)
    }
    throw new Error(`Unknown context: ${context}`)
  }

  private buildCompletePrompt(data: CVFormData): string {
    return `Tu es un expert en rédaction de CV...
CV À AMÉLIORER :
${JSON.stringify(data, null, 2)}

RETOURNE UNIQUEMENT LE JSON AMÉLIORÉ :`
  }

  private buildSectionPrompt(content: string, section: string): string {
    return `En tant qu'expert en rédaction de CV, réécris le contenu suivant...
Section: ${section}
Contenu original: ${content}`
  }
}
```

**Étape 3 :** Service orchestrateur

```typescript
// lib/ai/CVImprovementService.ts
import { AIProvider, PromptBuilder, ResponseParser } from "./interfaces"
import { CVFormData } from "@/types"

export class CVImprovementService {
  constructor(
    private aiProvider: AIProvider,
    private promptBuilder: PromptBuilder,
    private responseParser: ResponseParser<CVFormData>
  ) {}

  async improveCompleteCV(data: CVFormData): Promise<CVFormData> {
    try {
      const prompt = this.promptBuilder.buildPrompt(data, 'complete')
      const response = await this.aiProvider.generateContent(prompt)
      return this.responseParser.parse(response)
    } catch (error) {
      console.error('CV improvement failed:', error)
      throw new Error(`Unable to improve CV: ${error.message}`)
    }
  }

  async improveCVContent(content: string, section: string): Promise<string> {
    try {
      const prompt = this.promptBuilder.buildPrompt({ content, section }, 'section')
      return await this.aiProvider.generateContent(prompt)
    } catch (error) {
      console.error('Content improvement failed:', error)
      throw new Error(`Unable to improve content: ${error.message}`)
    }
  }
}
```

### Exercice 2 : Refactorer le Hook useCVForm

**Problème actuel :** Un seul hook fait tout
**Solution :** Séparer en hooks spécialisés

```typescript
// lib/hooks/cv/useFormData.ts - Gestion des données uniquement
export function useFormData() {
  const [formData, setFormData] = useState<CVFormData>(initialFormData)

  const updatePersonalInfo = useCallback((info: Partial<PersonalInfo>) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info }
    }))
  }, [])

  const addExperience = useCallback((experience: Experience) => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, experience]
    }))
  }, [])

  // ... autres méthodes

  return {
    formData,
    updatePersonalInfo,
    addExperience,
    // ...
  }
}
```

```typescript
// lib/hooks/cv/useFormValidation.ts - Validation uniquement
export function useFormValidation(formData: CVFormData) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validate = useCallback(() => {
    const newErrors: ValidationErrors = {}
    
    if (!formData.personalInfo.name) {
      newErrors.name = 'Le nom est requis'
    }
    
    if (!formData.personalInfo.email) {
      newErrors.email = 'L\'email est requis'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  return { errors, validate, isValid: Object.keys(errors).length === 0 }
}
```

```typescript
// lib/hooks/cv/useFormSubmission.ts - Soumission uniquement
export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(async (data: CVFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData: data })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const blob = await response.blob()
      // Téléchargement logic...
      
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { submit, isSubmitting }
}
```

```typescript
// lib/hooks/cv/useCVForm.ts - Composition finale
export function useCVForm() {
  const formDataHook = useFormData()
  const validation = useFormValidation(formDataHook.formData)
  const submission = useFormSubmission()

  const handleSubmit = useCallback(async () => {
    if (!validation.validate()) {
      throw new Error('Form validation failed')
    }
    
    await submission.submit(formDataHook.formData)
  }, [formDataHook.formData, validation, submission])

  return {
    ...formDataHook,
    ...validation,
    ...submission,
    handleSubmit
  }
}
```

---

## 📝 Exercices Pratiques {#exercices}

### Exercice 1 : Analyser et Refactorer
1. **Identifier** 3 violations SOLID dans le code actuel
2. **Proposer** une solution pour chaque violation
3. **Implémenter** une des solutions

### Exercice 2 : Créer un Repository Pattern
Implémenter un repository pour l'accès aux données CV :

```typescript
interface CVRepository {
  save(cv: CVFormData): Promise<CV>
  findById(id: string): Promise<CV | null>
  findByUserId(userId: string): Promise<CV[]>
  delete(id: string): Promise<void>
}

class SupabaseCVRepository implements CVRepository {
  // Implementation avec Supabase
}

class MockCVRepository implements CVRepository {
  // Implementation pour les tests
}
```

### Exercice 3 : Appliquer DIP
Refactorer l'API route `/api/cv/generate` pour utiliser l'injection de dépendances.

### Exercice 4 : Code Review
Effectuer une revue de code en cherchant :
- [ ] Noms explicites
- [ ] Fonctions courtes (< 20 lignes)
- [ ] Responsabilité unique
- [ ] Pas de duplication
- [ ] Gestion d'erreurs

---

## 📚 Ressources Complémentaires

- **Clean Code** par Robert C. Martin
- **SOLID Principles** par Uncle Bob
- **Refactoring** par Martin Fowler
- **Architecture Hexagonale** pour l'organisation

## 🎯 Checklist Qualité

Avant chaque commit, vérifiez :
- [ ] **SRP** : Chaque fonction/classe fait une seule chose
- [ ] **OCP** : Extension possible sans modification
- [ ] **LSP** : Les sous-types sont substituables
- [ ] **ISP** : Interfaces spécialisées
- [ ] **DIP** : Dépendances inversées
- [ ] **Nommage** : Intentions claires
- [ ] **Taille** : Fonctions et classes courtes
- [ ] **Tests** : Comportements couverts 