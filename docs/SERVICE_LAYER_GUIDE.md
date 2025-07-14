# Guide Complet des Couches de Service (Service Layer) 🏗️

## Table des Matières
1. [Qu'est-ce qu'une couche de service ?](#concept)
2. [Pourquoi utiliser une couche de service ?](#pourquoi)
3. [Cas d'usage dans CV Genius](#cas-usage)
4. [Architecture et structure](#architecture)
5. [Guide étape par étape](#guide-etape)
6. [Exemples détaillés avec commentaires](#exemples)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Tests des services](#tests)

---

## 🎯 Qu'est-ce qu'une couche de service ? {#concept}

### Définition Simple
Une **couche de service** (Service Layer) est une couche d'abstraction qui :
- **Encapsule** la logique métier complexe
- **Isole** les détails d'implémentation  
- **Standardise** les interactions avec les données
- **Centralise** les opérations communes

### Analogie : Restaurant
```
👨‍🍳 Chef (Service Layer)     ← Centralise la préparation
    ↓
🥘 Cuisines (Data Sources)   ← Base de données, APIs externes
    ↓  
🍽️ Serveur (Components)     ← Interface utilisateur
    ↓
😊 Client (User)            ← Utilisateur final
```

### Dans le Code
```typescript
// ❌ Sans service layer - Logique dispersée
const LoginComponent = () => {
  const handleLogin = async () => {
    // Validation inline
    if (!email.includes('@')) return
    
    // Appel API direct
    const response = await fetch('/api/auth', { ... })
    
    // Gestion d'erreur inline
    if (!response.ok) {
      setError('Login failed')
    }
    
    // Transformation de données inline
    const user = response.data.user
    localStorage.setItem('user', JSON.stringify(user))
  }
}

// ✅ Avec service layer - Logique centralisée
const LoginComponent = () => {
  const handleLogin = async () => {
    try {
      const user = await AuthService.login(email, password)
      // Le service gère tout : validation, API, erreurs, stockage
    } catch (error) {
      setError(error.message)
    }
  }
}
```

---

## 🤔 Pourquoi utiliser une couche de service ? {#pourquoi}

### 1. **Single Responsibility Principle (SRP)**
Chaque service a une responsabilité unique et bien définie.

### 2. **Réutilisabilité**
```typescript
// ✅ Le même service utilisé partout
await UserService.getUserProfile(id)    // Dans Dashboard
await UserService.getUserProfile(id)    // Dans Settings  
await UserService.getUserProfile(id)    // Dans Profile
```

### 3. **Testabilité**
```typescript
// ✅ Facile à tester en isolation
describe('UserService', () => {
  it('should get user profile', async () => {
    const user = await UserService.getUserProfile('123')
    expect(user.id).toBe('123')
  })
})
```

### 4. **Maintenabilité**
```typescript
// ✅ Changement dans UN seul endroit
export class UserService {
  // Changement d'API ? Modifiez juste ici
  private static API_BASE = 'https://new-api.com/v2'
}
```

### 5. **Type Safety**
```typescript
// ✅ Types cohérents partout
interface UserServiceResponse {
  success: boolean
  user?: User
  error?: string
}
```

---

## 🎯 Cas d'Usage dans CV Genius {#cas-usage}

### Services à Implémenter

#### 1. **ResumeService** - Gestion des CV
```typescript
// Opérations CRUD pour les CV
ResumeService.create(cvData)
ResumeService.getById(id) 
ResumeService.updateContent(id, content)
ResumeService.delete(id)
ResumeService.getUserResumes(userId)
```

#### 2. **AIService** - Intelligence Artificielle
```typescript
// Intégration Gemini + logique IA
AIService.enhanceExperience(rawText)
AIService.generateSummary(cvData)
AIService.optimizeForATS(content)
```

#### 3. **FileService** - Gestion des fichiers
```typescript
// Upload, parsing, validation
FileService.uploadPDF(file)
FileService.parsePDF(file)
FileService.validateFile(file)
FileService.generatePDF(cvData)
```

#### 4. **UserService** - Gestion utilisateur
```typescript
// Profils et préférences
UserService.getProfile(userId)
UserService.updateProfile(userId, data)
UserService.getUsageStats(userId)
```

#### 5. **NotificationService** - Notifications
```typescript
// Messages et alertes
NotificationService.showSuccess(message)
NotificationService.showError(error)
NotificationService.sendEmail(template, data)
```

---

## 🏗️ Architecture et Structure {#architecture}

### Structure des Dossiers
```
lib/
├── services/
│   ├── index.ts           # Export principal
│   ├── base/              # Services de base
│   │   ├── BaseService.ts # Classe abstraite
│   │   └── ApiService.ts  # HTTP client
│   ├── resume/
│   │   ├── ResumeService.ts
│   │   ├── ResumeRepository.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── AIService.ts
│   │   ├── GeminiService.ts
│   │   └── PromptBuilder.ts
│   ├── file/
│   │   ├── FileService.ts
│   │   ├── PDFService.ts
│   │   └── ValidationService.ts
│   └── user/
│       ├── UserService.ts
│       ├── ProfileService.ts
│       └── types.ts
```

### Hiérarchie des Services
```
BaseService (abstrait)
    ↓
ApiService (HTTP operations)
    ↓
ResumeService, UserService, etc.
```

---

## 📚 Guide Étape par Étape {#guide-etape}

### Étape 1: Créer le Service de Base

```typescript
// lib/services/base/BaseService.ts

/**
 * Service de base abstrait pour tous les services
 * Fournit les fonctionnalités communes : logging, error handling, etc.
 */
export abstract class BaseService {
  // Nom du service pour les logs
  protected abstract serviceName: string
  
  /**
   * Log une information de debug
   * @param message - Message à logger
   * @param data - Données optionnelles à inclure
   */
  protected log(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.serviceName}] ${message}`, data || '')
    }
  }
  
  /**
   * Log une erreur
   * @param message - Message d'erreur
   * @param error - Objet erreur
   */
  protected logError(message: string, error?: Error): void {
    console.error(`[${this.serviceName}] ERROR: ${message}`, error)
    
    // En production, on pourrait envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry.captureException(error)
    }
  }
  
  /**
   * Formate une erreur de manière cohérente
   * @param error - Erreur à formater
   * @returns Message d'erreur standardisé
   */
  protected formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Une erreur inconnue s\'est produite'
  }
  
  /**
   * Valide que des paramètres requis sont présents
   * @param params - Objet contenant les paramètres
   * @param required - Liste des clés requises
   * @throws Error si des paramètres sont manquants
   */
  protected validateRequired(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(key => 
      params[key] === undefined || params[key] === null || params[key] === ''
    )
    
    if (missing.length > 0) {
      throw new Error(`Paramètres requis manquants: ${missing.join(', ')}`)
    }
  }
}
```

### Étape 2: Créer le Service API

```typescript
// lib/services/base/ApiService.ts

import { BaseService } from './BaseService'

/**
 * Interface pour les réponses d'API standardisées
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Configuration pour les requêtes HTTP
 */
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

/**
 * Service HTTP de base pour toutes les requêtes API
 * Centralise la gestion des erreurs, timeouts, etc.
 */
export class ApiService extends BaseService {
  protected serviceName = 'ApiService'
  
  // URL de base de l'API
  private readonly baseUrl: string
  
  // Timeout par défaut (30 secondes)
  private readonly defaultTimeout = 30000
  
  constructor(baseUrl: string = '') {
    super()
    this.baseUrl = baseUrl
  }
  
  /**
   * Effectue une requête HTTP générique
   * @param endpoint - Endpoint à appeler (ex: '/api/users')
   * @param config - Configuration de la requête
   * @returns Promise avec la réponse formatée
   */
  async request<T>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = config
    
    // Construction de l'URL complète
    const url = `${this.baseUrl}${endpoint}`
    
    // Log de la requête (uniquement en dev)
    this.log(`${method} ${url}`, { body })
    
    try {
      // Création du controller pour le timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      // Configuration de la requête fetch
      const fetchConfig: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      }
      
      // Ajout du body si nécessaire
      if (body && method !== 'GET') {
        fetchConfig.body = JSON.stringify(body)
      }
      
      // Exécution de la requête
      const response = await fetch(url, fetchConfig)
      
      // Nettoyage du timeout
      clearTimeout(timeoutId)
      
      // Parse de la réponse JSON
      const data = await response.json()
      
      // Vérification du statut HTTP
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Log du succès
      this.log(`✅ ${method} ${url} - Success`)
      
      return {
        success: true,
        data,
        message: data.message
      }
      
    } catch (error) {
      // Gestion spécifique du timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const errorMsg = `Timeout: La requête vers ${url} a pris trop de temps`
        this.logError(errorMsg)
        return {
          success: false,
          error: errorMsg
        }
      }
      
      // Gestion des autres erreurs
      const errorMsg = this.formatError(error)
      this.logError(`❌ ${method} ${url} - Failed`, error as Error)
      
      return {
        success: false,
        error: errorMsg
      }
    }
  }
  
  /**
   * Méthodes de raccourci pour les verbes HTTP courants
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }
  
  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers })
  }
  
  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers })
  }
  
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}
```

### Étape 3: Créer un Service Métier

```typescript
// lib/services/resume/ResumeService.ts

import { ApiService, ApiResponse } from '../base/ApiService'
import { supabase } from '@/lib/supabase/client'
import type { CVFormData } from '@/types'

/**
 * Types spécifiques au ResumeService
 */
export interface Resume {
  id: string
  user_id: string
  title: string
  raw_content: CVFormData
  generated_content?: CVFormData
  status: 'draft' | 'generated' | 'published'
  created_at: string
  updated_at: string
}

export interface CreateResumeRequest {
  title: string
  raw_content: CVFormData
  user_id: string
}

export interface UpdateResumeRequest {
  title?: string
  raw_content?: CVFormData
  generated_content?: CVFormData
  status?: Resume['status']
}

/**
 * Service pour la gestion des CV
 * Gère toutes les opérations CRUD et logique métier des CV
 */
export class ResumeService extends ApiService {
  protected serviceName = 'ResumeService'
  
  /**
   * Crée un nouveau CV
   * @param data - Données du CV à créer
   * @returns Promise avec le CV créé
   */
  static async create(data: CreateResumeRequest): Promise<ApiResponse<Resume>> {
    // Instanciation pour accéder aux méthodes de logging
    const service = new ResumeService()
    
    try {
      // Validation des données requises
      service.validateRequired(data, ['title', 'raw_content', 'user_id'])
      
      service.log('Creating new resume', { title: data.title, userId: data.user_id })
      
      // Appel Supabase avec gestion d'erreur
      const { data: resume, error } = await supabase
        .from('resumes')
        .insert({
          title: data.title,
          raw_content: data.raw_content,
          user_id: data.user_id,
          status: 'draft'
        })
        .select()
        .single()
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`)
      }
      
      service.log('✅ Resume created successfully', { id: resume.id })
      
      return {
        success: true,
        data: resume,
        message: 'CV créé avec succès'
      }
      
    } catch (error) {
      service.logError('Failed to create resume', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
  
  /**
   * Récupère un CV par son ID
   * @param id - ID du CV
   * @returns Promise avec le CV
   */
  static async getById(id: string): Promise<ApiResponse<Resume>> {
    const service = new ResumeService()
    
    try {
      // Validation
      if (!id) {
        throw new Error('ID du CV requis')
      }
      
      service.log('Fetching resume by ID', { id })
      
      // Requête Supabase
      const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        // Gestion spécifique : CV non trouvé
        if (error.code === 'PGRST116') {
          return {
            success: false,
            error: 'CV non trouvé'
          }
        }
        throw new Error(`Erreur Supabase: ${error.message}`)
      }
      
      service.log('✅ Resume fetched successfully')
      
      return {
        success: true,
        data: resume
      }
      
    } catch (error) {
      service.logError('Failed to fetch resume', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
  
  /**
   * Récupère tous les CV d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param limit - Nombre maximum de résultats
   * @param offset - Décalage pour la pagination
   * @returns Promise avec la liste des CV
   */
  static async getUserResumes(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<ApiResponse<Resume[]>> {
    const service = new ResumeService()
    
    try {
      service.validateRequired({ userId }, ['userId'])
      
      service.log('Fetching user resumes', { userId, limit, offset })
      
      // Requête avec pagination et tri
      const { data: resumes, error, count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`)
      }
      
      service.log('✅ User resumes fetched', { count: resumes?.length })
      
      return {
        success: true,
        data: resumes || [],
        message: `${count} CV(s) trouvé(s)`
      }
      
    } catch (error) {
      service.logError('Failed to fetch user resumes', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
  
  /**
   * Met à jour un CV
   * @param id - ID du CV
   * @param updates - Données à mettre à jour
   * @returns Promise avec le CV mis à jour
   */
  static async update(
    id: string, 
    updates: UpdateResumeRequest
  ): Promise<ApiResponse<Resume>> {
    const service = new ResumeService()
    
    try {
      service.validateRequired({ id }, ['id'])
      
      // Vérification qu'il y a au moins une mise à jour
      if (Object.keys(updates).length === 0) {
        throw new Error('Aucune donnée à mettre à jour')
      }
      
      service.log('Updating resume', { id, updates })
      
      // Mise à jour avec timestamp automatique
      const { data: resume, error } = await supabase
        .from('resumes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`)
      }
      
      service.log('✅ Resume updated successfully')
      
      return {
        success: true,
        data: resume,
        message: 'CV mis à jour avec succès'
      }
      
    } catch (error) {
      service.logError('Failed to update resume', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
  
  /**
   * Supprime un CV
   * @param id - ID du CV à supprimer
   * @returns Promise avec le résultat de la suppression
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    const service = new ResumeService()
    
    try {
      service.validateRequired({ id }, ['id'])
      
      service.log('Deleting resume', { id })
      
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw new Error(`Erreur Supabase: ${error.message}`)
      }
      
      service.log('✅ Resume deleted successfully')
      
      return {
        success: true,
        message: 'CV supprimé avec succès'
      }
      
    } catch (error) {
      service.logError('Failed to delete resume', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
  
  /**
   * Duplique un CV existant
   * @param id - ID du CV à dupliquer
   * @param newTitle - Titre du nouveau CV
   * @returns Promise avec le CV dupliqué
   */
  static async duplicate(id: string, newTitle: string): Promise<ApiResponse<Resume>> {
    const service = new ResumeService()
    
    try {
      service.log('Duplicating resume', { id, newTitle })
      
      // 1. Récupérer le CV original
      const originalResult = await this.getById(id)
      if (!originalResult.success || !originalResult.data) {
        throw new Error('CV original non trouvé')
      }
      
      // 2. Créer une copie
      const duplicateResult = await this.create({
        title: newTitle,
        raw_content: originalResult.data.raw_content,
        user_id: originalResult.data.user_id
      })
      
      if (!duplicateResult.success) {
        throw new Error(duplicateResult.error || 'Échec de la duplication')
      }
      
      service.log('✅ Resume duplicated successfully')
      
      return duplicateResult
      
    } catch (error) {
      service.logError('Failed to duplicate resume', error as Error)
      
      return {
        success: false,
        error: service.formatError(error)
      }
    }
  }
}
```

---

## 🧪 Tests des Services {#tests}

```typescript
// tests/services/ResumeService.test.ts

import { ResumeService } from '@/lib/services/resume/ResumeService'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
  }
}))

const mockSupabase = supabase as any

describe('ResumeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a resume successfully', async () => {
      // Arrange
      const mockResume = {
        id: '123',
        title: 'Mon CV',
        user_id: 'user123',
        raw_content: { personalInfo: { name: 'John' } }
      }
      
      mockSupabase.single.mockResolvedValue({
        data: mockResume,
        error: null
      })

      // Act
      const result = await ResumeService.create({
        title: 'Mon CV',
        raw_content: { personalInfo: { name: 'John' } },
        user_id: 'user123'
      })

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResume)
      expect(mockSupabase.from).toHaveBeenCalledWith('resumes')
    })

    it('should handle validation errors', async () => {
      // Act
      const result = await ResumeService.create({
        title: '',
        raw_content: null as any,
        user_id: ''
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Paramètres requis manquants')
    })
  })
})
```

---

## ✅ Bonnes Pratiques {#bonnes-pratiques}

### 1. **Nommage Cohérent**
```typescript
// ✅ Bon : verbes d'action clairs
UserService.create()
UserService.getById()
UserService.update()
UserService.delete()
UserService.search()

// ❌ Mauvais : noms vagues
UserService.doStuff()
UserService.handle()
UserService.process()
```

### 2. **Gestion d'Erreur Systématique**
```typescript
// ✅ Toujours retourner le même format
interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### 3. **Validation d'Entrée**
```typescript
// ✅ Valider avant traitement
static async create(data: CreateRequest) {
  this.validateRequired(data, ['name', 'email'])
  this.validateEmail(data.email)
  // ... traitement
}
```

### 4. **Logging Approprié**
```typescript
// ✅ Logs utiles pour le debug
this.log('Creating user', { email: data.email })
this.logError('Failed to create user', error)
```

### 5. **Types TypeScript Stricts**
```typescript
// ✅ Types explicites partout
interface CreateUserRequest {
  name: string
  email: string
  role?: 'user' | 'admin'
}
```

---

## 🎯 Prochaines Étapes pour Vous

1. **Commencez Simple** : Implémentez `ResumeService` avec les méthodes de base
2. **Testez Immédiatement** : Écrivez des tests pour chaque méthode
3. **Intégrez Progressivement** : Remplacez les appels directs par les services
4. **Étendez Graduellement** : Ajoutez `UserService`, `FileService`, etc.

### Order d'Implémentation Recommandé :
1. ✅ `BaseService` et `ApiService` (fondations)
2. ✅ `ResumeService` (cœur métier)  
3. ✅ `UserService` (gestion utilisateur)
4. ✅ `FileService` (PDF parsing)
5. ✅ `AIService` (Gemini integration)
6. ✅ `NotificationService` (UX)

---

**Maintenant vous avez tous les outils pour créer des services robustes et maintenables ! 🚀** 