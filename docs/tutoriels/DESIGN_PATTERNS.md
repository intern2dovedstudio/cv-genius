# 🎨 Tutoriel Design Patterns dans CV Genius

## 📚 Table des Matières
1. [Introduction aux Design Patterns](#introduction)
2. [Patterns Créationnels](#creationnels)
3. [Patterns Structurels](#structurels)
4. [Patterns Comportementaux](#comportementaux)
5. [Mise en Pratique dans CV Genius](#pratique)
6. [Exercices](#exercices)

---

## 🎯 Introduction aux Design Patterns {#introduction}

### Qu'est-ce qu'un Design Pattern ?

Un **Design Pattern** est une solution réutilisable à un problème récurrent dans la conception logicielle. C'est comme une "recette" que vous pouvez adapter à votre contexte.

### Pourquoi les utiliser ?

- **🔄 Réutilisabilité** : Solutions éprouvées
- **📖 Communication** : Langage commun entre développeurs
- **🛠️ Maintenance** : Code plus structuré et prévisible
- **🚀 Évolutivité** : Facilite les modifications futures

### Les 3 Catégories

```
🏗️ CRÉATIONNELS     🔗 STRUCTURELS      🎭 COMPORTEMENTAUX
Comment créer        Comment composer     Comment collaborer
des objets          des objets          les objets

• Factory           • Adapter           • Observer
• Builder           • Decorator         • Strategy
• Singleton         • Facade            • Command
```

---

## 🏗️ Patterns Créationnels {#creationnels}

### 1. Factory Pattern - Création d'objets similaires

**Problème :** Comment créer différents types de CVs sans connaître les détails ?

**❌ Sans Pattern :**
```typescript
// Code rigide et difficile à étendre
function generateCV(type: string, data: CVFormData) {
  if (type === 'modern') {
    return new ModernCV(data).generate()
  } else if (type === 'classic') {
    return new ClassicCV(data).generate()
  } else if (type === 'creative') {
    return new CreativeCV(data).generate()
  }
  // Pour ajouter un type, il faut modifier cette fonction ⚠️
}
```

**✅ Avec Factory Pattern :**
```typescript
// 1. Interface commune
interface CVTemplate {
  generate(data: CVFormData): Promise<CVOutput>
  getPreview(): string
}

// 2. Implémentations concrètes
class ModernCVTemplate implements CVTemplate {
  async generate(data: CVFormData): Promise<CVOutput> {
    return {
      pdf: await this.generateModernPDF(data),
      preview: this.generateModernPreview(data),
      style: 'modern'
    }
  }
  
  getPreview(): string {
    return "CV moderne avec design épuré et sections colorées"
  }
  
  private generateModernPDF(data: CVFormData) {
    // Logic spécifique au style moderne
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.setTextColor('#2980B9') // Bleu moderne
    // ...
    return doc.output('arraybuffer')
  }
}

class ClassicCVTemplate implements CVTemplate {
  async generate(data: CVFormData): Promise<CVOutput> {
    return {
      pdf: await this.generateClassicPDF(data),
      preview: this.generateClassicPreview(data),
      style: 'classic'
    }
  }
  
  getPreview(): string {
    return "CV classique en noir et blanc, format traditionnel"
  }
  
  private generateClassicPDF(data: CVFormData) {
    // Logic spécifique au style classique
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.setTextColor('#000000') // Noir classique
    // ...
    return doc.output('arraybuffer')
  }
}

// 3. Factory pour créer les templates
class CVTemplateFactory {
  private static templates = new Map<string, () => CVTemplate>([
    ['modern', () => new ModernCVTemplate()],
    ['classic', () => new ClassicCVTemplate()],
    ['creative', () => new CreativeCVTemplate()], // ✅ Facile à ajouter!
  ])
  
  static create(type: string): CVTemplate {
    const creator = this.templates.get(type)
    if (!creator) {
      throw new Error(`Unknown CV template type: ${type}`)
    }
    return creator()
  }
  
  static getAvailableTypes(): string[] {
    return Array.from(this.templates.keys())
  }
}

// 4. Utilisation simplifiée
export class CVGenerationService {
  async generateCV(type: string, data: CVFormData): Promise<CVOutput> {
    const template = CVTemplateFactory.create(type)
    return template.generate(data)
  }
  
  getTemplatePreview(type: string): string {
    const template = CVTemplateFactory.create(type)
    return template.getPreview()
  }
}
```

**Avantages :**
- ✅ Facile d'ajouter de nouveaux types
- ✅ Code client simplifié
- ✅ Responsabilités séparées

### 2. Builder Pattern - Construction complexe étape par étape

**Problème :** Construire un CV avec de nombreuses options optionnelles

**❌ Sans Pattern :**
```typescript
// Constructeur avec trop de paramètres
function createCV(
  name: string,
  email: string,
  phone?: string,
  linkedin?: string,
  website?: string,
  experiences?: Experience[],
  education?: Education[],
  skills?: Skill[],
  languages?: Language[],
  template?: string,
  colors?: ColorScheme,
  fonts?: FontScheme
) {
  // Construction complexe...
}

// Appel difficile à lire
const cv = createCV(
  "John Doe", 
  "john@example.com", 
  undefined, 
  "linkedin.com/in/john", 
  undefined, 
  [], 
  [], 
  [], 
  [], 
  "modern",
  undefined,
  { primary: "Arial" }
)
```

**✅ Avec Builder Pattern :**
```typescript
// 1. Builder pour construire un CV étape par étape
class CVBuilder {
  private cv: Partial<CVFormData> = {}
  private options: CVOptions = {}

  setPersonalInfo(name: string, email: string): CVBuilder {
    this.cv.personalInfo = { 
      ...this.cv.personalInfo, 
      name, 
      email 
    }
    return this
  }

  setContact(phone?: string, linkedin?: string, website?: string): CVBuilder {
    this.cv.personalInfo = {
      ...this.cv.personalInfo,
      phone,
      linkedin,
      website
    }
    return this
  }

  addExperience(experience: Experience): CVBuilder {
    this.cv.experiences = [...(this.cv.experiences || []), experience]
    return this
  }

  addEducation(education: Education): CVBuilder {
    this.cv.education = [...(this.cv.education || []), education]
    return this
  }

  addSkill(skill: Skill): CVBuilder {
    this.cv.skills = [...(this.cv.skills || []), skill]
    return this
  }

  setTemplate(template: string): CVBuilder {
    this.options.template = template
    return this
  }

  setColorScheme(colors: ColorScheme): CVBuilder {
    this.options.colors = colors
    return this
  }

  build(): CVFormData {
    // Validation avant construction
    if (!this.cv.personalInfo?.name || !this.cv.personalInfo?.email) {
      throw new Error('Name and email are required')
    }

    return {
      personalInfo: this.cv.personalInfo!,
      experiences: this.cv.experiences || [],
      education: this.cv.education || [],
      skills: this.cv.skills || [],
      languages: this.cv.languages || [],
      options: this.options
    }
  }
}

// 2. Director pour des constructions prédéfinies
class CVDirector {
  static createBasicCV(name: string, email: string): CVFormData {
    return new CVBuilder()
      .setPersonalInfo(name, email)
      .setTemplate('modern')
      .build()
  }

  static createDeveloperCV(name: string, email: string, github: string): CVFormData {
    return new CVBuilder()
      .setPersonalInfo(name, email)
      .setContact(undefined, undefined, github)
      .addSkill({ name: 'JavaScript', level: 'Expert', category: 'Programming' })
      .addSkill({ name: 'React', level: 'Advanced', category: 'Framework' })
      .setTemplate('modern')
      .setColorScheme({ primary: '#2980B9', secondary: '#3498DB' })
      .build()
  }
}

// 3. Utilisation fluide
const cv = new CVBuilder()
  .setPersonalInfo("John Doe", "john@example.com")
  .setContact("0123456789", "linkedin.com/in/john")
  .addExperience({
    title: "Developer",
    company: "Tech Corp",
    startDate: "2020",
    endDate: "present",
    description: "Full-stack development"
  })
  .setTemplate("modern")
  .build()

// Ou utiliser le director
const basicCV = CVDirector.createDeveloperCV("Jane Doe", "jane@dev.com", "github.com/jane")
```

### 3. Singleton Pattern - Instance unique

**Utilisation dans CV Genius :** Configuration globale, logging

```typescript
// 1. Configuration globale de l'application
class AppConfig {
  private static instance: AppConfig
  private config: {
    apiBaseUrl: string
    geminiApiKey: string
    environment: 'development' | 'production'
  }

  private constructor() {
    this.config = {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    }
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig()
    }
    return AppConfig.instance
  }

  get apiUrl(): string {
    return this.config.apiBaseUrl
  }

  get isProduction(): boolean {
    return this.config.environment === 'production'
  }

  get geminiKey(): string {
    return this.config.geminiApiKey
  }
}

// 2. Logger global
class Logger {
  private static instance: Logger

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  info(message: string, context?: any) {
    if (AppConfig.getInstance().isProduction) {
      // En production, utiliser un service de logging externe
      console.log(`[INFO] ${message}`, context)
    } else {
      console.log(`🔵 ${message}`, context)
    }
  }

  error(message: string, error?: Error) {
    if (AppConfig.getInstance().isProduction) {
      // En production, envoyer à un service d'erreurs
      console.error(`[ERROR] ${message}`, error)
    } else {
      console.error(`🔴 ${message}`, error)
    }
  }
}

// Utilisation
const config = AppConfig.getInstance()
const logger = Logger.getInstance()

logger.info('CV generation started', { userId: '123' })
```

---

## 🔗 Patterns Structurels {#structurels}

### 1. Adapter Pattern - Adaptation d'interfaces

**Problème :** Intégrer des services externes avec des interfaces différentes

**Exemple :** Adapter différents parsers de PDF

```typescript
// 1. Interface uniforme pour notre application
interface DocumentParser {
  parse(file: File): Promise<ParsedContent>
  getSupportedFormats(): string[]
}

interface ParsedContent {
  text: string
  personalInfo: PersonalInfo
  experiences: Experience[]
  education: Education[]
  skills: string[]
}

// 2. Service externe avec interface différente
class PDFPlumberParser {
  extractText(buffer: ArrayBuffer): string { /* ... */ }
  getMetadata(buffer: ArrayBuffer): object { /* ... */ }
}

class TesseractOCRParser {
  recognize(imageBuffer: Buffer): Promise<{ text: string }> { /* ... */ }
}

// 3. Adapters pour uniformiser les interfaces
class PDFPlumberAdapter implements DocumentParser {
  private parser = new PDFPlumberParser()

  async parse(file: File): Promise<ParsedContent> {
    const buffer = await file.arrayBuffer()
    const text = this.parser.extractText(buffer)
    
    return {
      text,
      personalInfo: this.extractPersonalInfo(text),
      experiences: this.extractExperiences(text),
      education: this.extractEducation(text),
      skills: this.extractSkills(text)
    }
  }

  getSupportedFormats(): string[] {
    return ['application/pdf']
  }

  private extractPersonalInfo(text: string): PersonalInfo {
    // Logic d'extraction spécifique
    return { name: '', email: '' }
  }
}

class OCRAdapter implements DocumentParser {
  private ocr = new TesseractOCRParser()

  async parse(file: File): Promise<ParsedContent> {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await this.ocr.recognize(buffer)
    
    return {
      text: result.text,
      personalInfo: this.extractPersonalInfo(result.text),
      experiences: this.extractExperiences(result.text),
      education: this.extractEducation(result.text),
      skills: this.extractSkills(result.text)
    }
  }

  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/png', 'image/webp']
  }
}

// 4. Factory pour sélectionner le bon adapter
class ParserFactory {
  static createParser(mimeType: string): DocumentParser {
    if (mimeType === 'application/pdf') {
      return new PDFPlumberAdapter()
    }
    if (mimeType.startsWith('image/')) {
      return new OCRAdapter()
    }
    throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

// 5. Service unifié
class DocumentParsingService {
  async parseDocument(file: File): Promise<ParsedContent> {
    const parser = ParserFactory.createParser(file.type)
    return parser.parse(file)
  }

  getSupportedFormats(): string[] {
    const pdfParser = new PDFPlumberAdapter()
    const ocrParser = new OCRAdapter()
    
    return [
      ...pdfParser.getSupportedFormats(),
      ...ocrParser.getSupportedFormats()
    ]
  }
}
```

### 2. Decorator Pattern - Ajout de fonctionnalités

**Problème :** Ajouter des fonctionnalités aux CVs sans modifier le code existant

```typescript
// 1. Interface de base
interface CVProcessor {
  process(data: CVFormData): Promise<CVFormData>
}

// 2. Implémentation de base
class BasicCVProcessor implements CVProcessor {
  async process(data: CVFormData): Promise<CVFormData> {
    return data // Aucun traitement
  }
}

// 3. Decorators pour ajouter des fonctionnalités
class AIEnhancementDecorator implements CVProcessor {
  constructor(private processor: CVProcessor) {}

  async process(data: CVFormData): Promise<CVFormData> {
    // D'abord traiter par le processor précédent
    const processedData = await this.processor.process(data)
    
    // Puis ajouter l'amélioration IA
    const geminiService = new GeminiService()
    return geminiService.improveCompleteCV(processedData)
  }
}

class SpellCheckDecorator implements CVProcessor {
  constructor(private processor: CVProcessor) {}

  async process(data: CVFormData): Promise<CVFormData> {
    const processedData = await this.processor.process(data)
    
    // Ajouter la correction orthographique
    return {
      ...processedData,
      experiences: processedData.experiences.map(exp => ({
        ...exp,
        description: this.correctSpelling(exp.description)
      }))
    }
  }

  private correctSpelling(text: string): string {
    // Logic de correction orthographique
    return text.replace(/developper/gi, 'développer')
  }
}

class ATSOptimizationDecorator implements CVProcessor {
  constructor(private processor: CVProcessor) {}

  async process(data: CVFormData): Promise<CVFormData> {
    const processedData = await this.processor.process(data)
    
    // Optimiser pour les ATS
    return {
      ...processedData,
      skills: this.optimizeSkillsForATS(processedData.skills)
    }
  }

  private optimizeSkillsForATS(skills: Skill[]): Skill[] {
    // Ajouter des mots-clés populaires, standardiser les noms
    return skills.map(skill => ({
      ...skill,
      name: this.standardizeSkillName(skill.name)
    }))
  }

  private standardizeSkillName(name: string): string {
    const mapping: { [key: string]: string } = {
      'js': 'JavaScript',
      'react': 'React.js',
      'node': 'Node.js'
    }
    return mapping[name.toLowerCase()] || name
  }
}

// 4. Factory pour créer des pipelines
class CVProcessorFactory {
  static createBasicProcessor(): CVProcessor {
    return new BasicCVProcessor()
  }

  static createPremiumProcessor(): CVProcessor {
    return new ATSOptimizationDecorator(
      new SpellCheckDecorator(
        new AIEnhancementDecorator(
          new BasicCVProcessor()
        )
      )
    )
  }

  static createCustomProcessor(features: string[]): CVProcessor {
    let processor: CVProcessor = new BasicCVProcessor()

    for (const feature of features) {
      switch (feature) {
        case 'ai-enhancement':
          processor = new AIEnhancementDecorator(processor)
          break
        case 'spell-check':
          processor = new SpellCheckDecorator(processor)
          break
        case 'ats-optimization':
          processor = new ATSOptimizationDecorator(processor)
          break
      }
    }

    return processor
  }
}

// 5. Utilisation
export class CVGenerationService {
  async generateCV(data: CVFormData, plan: 'basic' | 'premium'): Promise<CVFormData> {
    const processor = plan === 'premium' 
      ? CVProcessorFactory.createPremiumProcessor()
      : CVProcessorFactory.createBasicProcessor()

    return processor.process(data)
  }
}
```

---

## 🎭 Patterns Comportementaux {#comportementaux}

### 1. Observer Pattern - Notifications et événements

**Problème :** Notifier plusieurs composants lors d'événements CV

```typescript
// 1. Interface Observer
interface CVEventObserver {
  onCVEvent(event: CVEvent): void
}

// 2. Types d'événements
type CVEvent = 
  | { type: 'cv_created', data: { id: string, userId: string } }
  | { type: 'cv_updated', data: { id: string, changes: Partial<CVFormData> } }
  | { type: 'cv_generated', data: { id: string, pdfUrl: string } }
  | { type: 'ai_improvement_started', data: { id: string } }
  | { type: 'ai_improvement_completed', data: { id: string, improvements: string[] } }

// 3. Subject (Observable)
class CVEventManager {
  private observers: CVEventObserver[] = []

  subscribe(observer: CVEventObserver): void {
    this.observers.push(observer)
  }

  unsubscribe(observer: CVEventObserver): void {
    const index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  notify(event: CVEvent): void {
    for (const observer of this.observers) {
      try {
        observer.onCVEvent(event)
      } catch (error) {
        console.error('Observer error:', error)
      }
    }
  }
}

// 4. Observateurs concrets
class AnalyticsObserver implements CVEventObserver {
  onCVEvent(event: CVEvent): void {
    switch (event.type) {
      case 'cv_created':
        this.trackCVCreation(event.data.userId)
        break
      case 'cv_generated':
        this.trackCVGeneration(event.data.id)
        break
      case 'ai_improvement_completed':
        this.trackAIUsage(event.data.id, event.data.improvements)
        break
    }
  }

  private trackCVCreation(userId: string) {
    // Envoyer à Google Analytics, Mixpanel, etc.
    console.log('📊 CV created for user:', userId)
  }

  private trackCVGeneration(cvId: string) {
    console.log('📊 CV generated:', cvId)
  }

  private trackAIUsage(cvId: string, improvements: string[]) {
    console.log('📊 AI improvements:', improvements.length)
  }
}

class NotificationObserver implements CVEventObserver {
  onCVEvent(event: CVEvent): void {
    switch (event.type) {
      case 'cv_generated':
        this.sendSuccessNotification(event.data.pdfUrl)
        break
      case 'ai_improvement_completed':
        this.sendImprovementNotification(event.data.improvements)
        break
    }
  }

  private sendSuccessNotification(pdfUrl: string) {
    // Notification push, email, ou toast
    console.log('🔔 CV generated successfully:', pdfUrl)
  }

  private sendImprovementNotification(improvements: string[]) {
    console.log('🔔 AI improvements completed:', improvements)
  }
}

class DatabaseObserver implements CVEventObserver {
  onCVEvent(event: CVEvent): void {
    switch (event.type) {
      case 'cv_created':
        this.logCVCreation(event.data)
        break
      case 'cv_updated':
        this.logCVUpdate(event.data)
        break
    }
  }

  private async logCVCreation(data: { id: string, userId: string }) {
    // Sauvegarder dans la base de données
    console.log('💾 Logging CV creation:', data)
  }

  private async logCVUpdate(data: { id: string, changes: Partial<CVFormData> }) {
    console.log('💾 Logging CV update:', data)
  }
}

// 5. Service CV avec événements
export class CVService {
  private eventManager = new CVEventManager()

  constructor() {
    // S'abonner aux observateurs
    this.eventManager.subscribe(new AnalyticsObserver())
    this.eventManager.subscribe(new NotificationObserver())
    this.eventManager.subscribe(new DatabaseObserver())
  }

  async createCV(userId: string, data: CVFormData): Promise<string> {
    const id = generateId()
    
    // Logique de création...
    
    // Notifier tous les observateurs
    this.eventManager.notify({
      type: 'cv_created',
      data: { id, userId }
    })

    return id
  }

  async generatePDF(id: string, data: CVFormData): Promise<string> {
    // Amélioration IA
    this.eventManager.notify({
      type: 'ai_improvement_started',
      data: { id }
    })

    const improvements = await this.improveWithAI(data)
    
    this.eventManager.notify({
      type: 'ai_improvement_completed',
      data: { id, improvements }
    })

    // Génération PDF
    const pdfUrl = await this.generatePDFFile(data)
    
    this.eventManager.notify({
      type: 'cv_generated',
      data: { id, pdfUrl }
    })

    return pdfUrl
  }
}
```

### 2. Strategy Pattern - Algorithmes interchangeables

**Problème :** Différentes stratégies d'amélioration de contenu

```typescript
// 1. Interface Strategy
interface ContentImprovementStrategy {
  improve(content: string, context: ContentContext): Promise<string>
  getDescription(): string
}

interface ContentContext {
  section: string
  targetLevel: 'junior' | 'senior' | 'executive'
  industry: string
  language: 'fr' | 'en'
}

// 2. Stratégies concrètes
class AIImprovementStrategy implements ContentImprovementStrategy {
  constructor(private geminiService: GeminiService) {}

  async improve(content: string, context: ContentContext): Promise<string> {
    const prompt = this.buildPrompt(content, context)
    return this.geminiService.generateContent(prompt)
  }

  getDescription(): string {
    return "Amélioration par IA avec Gemini"
  }

  private buildPrompt(content: string, context: ContentContext): string {
    return `Améliore ce contenu pour un ${context.targetLevel} dans ${context.industry}:
${content}

Retourne un contenu professionnel et percutant.`
  }
}

class TemplateImprovementStrategy implements ContentImprovementStrategy {
  private templates = new Map<string, Map<string, string>>([
    ['experience', new Map([
      ['junior', 'Participé à {action} et {result}'],
      ['senior', 'Dirigé {action} aboutissant à {result}'],
      ['executive', 'Piloté {action} générant {result}']
    ])],
    ['skills', new Map([
      ['junior', 'Utilisation de {skill} dans des projets {type}'],
      ['senior', 'Expertise en {skill} avec {years} années d\'expérience'],
      ['executive', 'Vision stratégique de {skill} pour {business_impact}']
    ])]
  ])

  async improve(content: string, context: ContentContext): Promise<string> {
    const sectionTemplates = this.templates.get(context.section)
    if (!sectionTemplates) {
      return content
    }

    const template = sectionTemplates.get(context.targetLevel)
    if (!template) {
      return content
    }

    return this.applyTemplate(content, template)
  }

  getDescription(): string {
    return "Amélioration basée sur des templates prédéfinis"
  }

  private applyTemplate(content: string, template: string): string {
    // Logic pour appliquer le template au contenu
    return template.replace('{action}', this.extractAction(content))
                  .replace('{result}', this.extractResult(content))
  }

  private extractAction(content: string): string {
    // Extraction des actions du contenu original
    return "développé"
  }

  private extractResult(content: string): string {
    // Extraction des résultats du contenu original
    return "une amélioration de 20%"
  }
}

class HybridImprovementStrategy implements ContentImprovementStrategy {
  constructor(
    private aiStrategy: AIImprovementStrategy,
    private templateStrategy: TemplateImprovementStrategy
  ) {}

  async improve(content: string, context: ContentContext): Promise<string> {
    // D'abord appliquer les templates
    const templateImproved = await this.templateStrategy.improve(content, context)
    
    // Puis affiner avec l'IA
    return this.aiStrategy.improve(templateImproved, context)
  }

  getDescription(): string {
    return "Amélioration hybride : templates + IA"
  }
}

// 3. Context qui utilise les stratégies
class ContentImprover {
  constructor(private strategy: ContentImprovementStrategy) {}

  setStrategy(strategy: ContentImprovementStrategy): void {
    this.strategy = strategy
  }

  async improveContent(content: string, context: ContentContext): Promise<string> {
    return this.strategy.improve(content, context)
  }

  getStrategyDescription(): string {
    return this.strategy.getDescription()
  }
}

// 4. Factory pour sélectionner la stratégie
class ImprovementStrategyFactory {
  static create(
    type: 'ai' | 'template' | 'hybrid',
    services: { geminiService?: GeminiService } = {}
  ): ContentImprovementStrategy {
    switch (type) {
      case 'ai':
        if (!services.geminiService) {
          throw new Error('GeminiService required for AI strategy')
        }
        return new AIImprovementStrategy(services.geminiService)
      
      case 'template':
        return new TemplateImprovementStrategy()
      
      case 'hybrid':
        if (!services.geminiService) {
          throw new Error('GeminiService required for hybrid strategy')
        }
        return new HybridImprovementStrategy(
          new AIImprovementStrategy(services.geminiService),
          new TemplateImprovementStrategy()
        )
      
      default:
        throw new Error(`Unknown strategy type: ${type}`)
    }
  }
}

// 5. Service d'amélioration configurable
export class CVImprovementService {
  private improver: ContentImprover

  constructor(strategyType: 'ai' | 'template' | 'hybrid' = 'ai') {
    const strategy = ImprovementStrategyFactory.create(strategyType, {
      geminiService: new GeminiService()
    })
    this.improver = new ContentImprover(strategy)
  }

  async improveCVSection(
    content: string,
    section: string,
    userProfile: {
      level: 'junior' | 'senior' | 'executive'
      industry: string
      language: 'fr' | 'en'
    }
  ): Promise<string> {
    const context: ContentContext = {
      section,
      targetLevel: userProfile.level,
      industry: userProfile.industry,
      language: userProfile.language
    }

    return this.improver.improveContent(content, context)
  }

  changeStrategy(strategyType: 'ai' | 'template' | 'hybrid'): void {
    const strategy = ImprovementStrategyFactory.create(strategyType, {
      geminiService: new GeminiService()
    })
    this.improver.setStrategy(strategy)
  }
}
```

---

## 🚀 Mise en Pratique dans CV Genius {#pratique}

### Architecture Complète avec Patterns

```typescript
// 1. Structure modulaire avec tous les patterns
export class CVPlatform {
  private eventManager: CVEventManager
  private templateFactory: CVTemplateFactory
  private processorFactory: CVProcessorFactory
  private improvementService: CVImprovementService
  private parsingService: DocumentParsingService

  constructor() {
    // Initialisation des services avec patterns
    this.eventManager = new CVEventManager()
    this.templateFactory = new CVTemplateFactory()
    this.processorFactory = new CVProcessorFactory()
    this.improvementService = new CVImprovementService('hybrid')
    this.parsingService = new DocumentParsingService()

    // Configuration des observateurs
    this.setupEventObservers()
  }

  // Factory Method pour créer des CVs selon différents profils
  async createCVForProfile(
    data: CVFormData,
    profile: UserProfile
  ): Promise<CVOutput> {
    // Strategy Pattern pour l'amélioration
    const improved = await this.improvementService.improveCVSection(
      JSON.stringify(data),
      'complete',
      profile
    )

    // Factory Pattern pour le template
    const template = this.templateFactory.create(profile.preferredTemplate)

    // Decorator Pattern pour le traitement
    const processor = this.processorFactory.createCustomProcessor(
      profile.features
    )

    const processedData = await processor.process(JSON.parse(improved))

    // Observer Pattern pour les événements
    this.eventManager.notify({
      type: 'cv_generated',
      data: { id: generateId(), pdfUrl: 'temp-url' }
    })

    return template.generate(processedData)
  }

  // Builder Pattern pour configuration avancée
  createAdvancedCV(): CVBuilder {
    return new CVBuilder()
  }

  // Adapter Pattern pour différents formats d'entrée
  async parseDocument(file: File): Promise<ParsedContent> {
    return this.parsingService.parseDocument(file)
  }

  private setupEventObservers(): void {
    this.eventManager.subscribe(new AnalyticsObserver())
    this.eventManager.subscribe(new NotificationObserver())
    this.eventManager.subscribe(new DatabaseObserver())
  }
}

// 2. Types et interfaces
interface UserProfile {
  level: 'junior' | 'senior' | 'executive'
  industry: string
  language: 'fr' | 'en'
  preferredTemplate: string
  features: string[]
}

interface CVOutput {
  pdf: ArrayBuffer
  preview: string
  style: string
  metadata: {
    generatedAt: Date
    template: string
    features: string[]
  }
}
```

---

## 📝 Exercices Pratiques {#exercices}

### Exercice 1 : Implémenter le Factory Pattern
Créez une factory pour différents types d'export (PDF, Word, HTML) :

```typescript
interface CVExporter {
  export(data: CVFormData): Promise<ExportResult>
  getMimeType(): string
}

class CVExporterFactory {
  // À implémenter
}
```

### Exercice 2 : Builder Pattern pour CV
Créez un builder qui permet de construire des CVs étape par étape avec validation :

```typescript
class AdvancedCVBuilder {
  // À implémenter avec validation à chaque étape
}
```

### Exercice 3 : Observer Pattern pour Analytics
Implémentez un système d'événements pour tracker l'utilisation :

```typescript
interface AnalyticsEvent {
  // À définir
}

class AnalyticsManager {
  // À implémenter
}
```

### Exercice 4 : Strategy Pattern pour Validation
Créez différentes stratégies de validation selon le type de CV :

```typescript
interface ValidationStrategy {
  validate(data: CVFormData): ValidationResult
}

class DeveloperCVValidation implements ValidationStrategy {
  // Validation spécifique aux développeurs
}

class ExecutiveCVValidation implements ValidationStrategy {
  // Validation spécifique aux executives
}
```

---

## 🎯 Checklist des Patterns

Avant d'implémenter, vérifiez :

### Factory Pattern
- [ ] Plusieurs types d'objets similaires à créer
- [ ] Logic de création complexe ou variable
- [ ] Besoin d'extensibilité pour nouveaux types

### Builder Pattern
- [ ] Construction complexe en plusieurs étapes
- [ ] Nombreux paramètres optionnels
- [ ] Besoin de configurations prédéfinies

### Observer Pattern
- [ ] Plusieurs composants intéressés par un événement
- [ ] Couplage faible souhaité
- [ ] Notifications asynchrones

### Strategy Pattern
- [ ] Plusieurs algorithmes pour la même tâche
- [ ] Besoin de changer d'algorithme à l'exécution
- [ ] Éviter les conditions if/else complexes

### Adapter Pattern
- [ ] Intégration de services externes
- [ ] Interfaces incompatibles à réconcilier
- [ ] Legacy code à moderniser

---

## 📚 Ressources Complémentaires

- **Gang of Four** - Design Patterns: Elements of Reusable Object-Oriented Software
- **Head First Design Patterns** - Version accessible
- **Refactoring Guru** - Excellentes explications visuelles
- **JavaScript Patterns** - Patterns spécifiques à JS/TS

## 🚀 Prochaines Étapes

1. **Choisir un pattern** à implémenter en premier
2. **Identifier les cas d'usage** dans CV Genius
3. **Implémenter progressivement** avec tests
4. **Documenter les décisions** d'architecture
5. **Partager avec l'équipe** pour review 