# Roadmap d'Implémentation des Services CV Genius 🗺️

## 🎯 Plan d'Action - 7 Étapes

### Étape 1: Créer les Fondations (30 min)
```bash
# 1. Créer la structure des dossiers
mkdir -p lib/services/base
mkdir -p lib/services/user
mkdir -p lib/services/resume
mkdir -p lib/services/file
mkdir -p lib/services/ai

# 2. Les fichiers sont déjà créés dans votre projet !
# ✅ lib/services/base/BaseService.ts
# ✅ lib/services/user/UserService.ts  
# ✅ lib/services/index.ts
```

### Étape 2: Implémenter ResumeService (1h)
```typescript
// lib/services/resume/ResumeService.ts - À CRÉER
import { BaseService, ServiceResponse } from '../base/BaseService'
import { supabase } from '@/lib/supabase/client'
import type { CVFormData } from '@/types'

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

export class ResumeService extends BaseService {
  protected serviceName = 'ResumeService'
  
  static async create(data: {
    title: string
    raw_content: CVFormData
    user_id: string
  }): Promise<ServiceResponse<Resume>> {
    const service = new ResumeService()
    
    return service.measureTime('create-resume', async () => {
      try {
        service.validateRequired(data, ['title', 'raw_content', 'user_id'])
        
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
          throw new Error(`Erreur lors de la création: ${error.message}`)
        }
        
        return service.createSuccessResponse(resume, 'CV créé avec succès')
        
      } catch (error) {
        service.logError('Failed to create resume', error as Error)
        return service.createErrorResponse(error)
      }
    })
  }
  
  static async getById(id: string): Promise<ServiceResponse<Resume>> {
    const service = new ResumeService()
    
    try {
      service.validateRequired({ id }, ['id'])
      
      const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        throw new Error(`CV non trouvé: ${error.message}`)
      }
      
      return service.createSuccessResponse(resume)
      
    } catch (error) {
      service.logError('Failed to fetch resume', error as Error)
      return service.createErrorResponse(error)
    }
  }
}
```

### Étape 3: Créer FileService pour PDF (45 min)
```typescript
// lib/services/file/FileService.ts - À CRÉER
import { BaseService, ServiceResponse } from '../base/BaseService'

export interface ParsedFile {
  text: string
  metadata: {
    pages: number
    size: number
    name: string
  }
}

export class FileService extends BaseService {
  protected serviceName = 'FileService'
  
  static async parsePDF(file: File): Promise<ServiceResponse<ParsedFile>> {
    const service = new FileService()
    
    return service.measureTime('parse-pdf', async () => {
      try {
        service.validateRequired({ file }, ['file'])
        
        // Validation du fichier
        if (file.type !== 'application/pdf') {
          throw new Error('Seuls les fichiers PDF sont acceptés')
        }
        
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Le fichier ne peut pas dépasser 5MB')
        }
        
        // Appel à votre API existante
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Erreur lors du parsing du PDF')
        }
        
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur inconnue')
        }
        
        return service.createSuccessResponse(result.data, 'PDF analysé avec succès')
        
      } catch (error) {
        service.logError('Failed to parse PDF', error as Error)
        return service.createErrorResponse(error)
      }
    })
  }
}
```

### Étape 4: Refactoriser useCVForm (45 min)
```typescript
// lib/hooks/useCVForm.ts - MODIFIER
import { useState } from 'react'
import { CVFormData } from '@/types'
import { getCurrentUser } from '../supabase/client'
import { ResumeService, FileService } from '@/lib/services'  // ✅ NOUVEAU

export const useCVForm = () => {
  // ... états existants ...
  
  const handleSubmit = async (uploadedFile: File | null, setFileError: (error: string) => void) => {
    if (!uploadedFile) {
      setFileError('Veuillez sélectionner un fichier')
      return
    }

    setError('')
    setShowToast(false)
    setIsSubmitting(true)
    
    try {
      // ✅ NOUVEAU: Vérification auth avec votre code existant
      const {user, error: authError} = await getCurrentUser()
      
      if (!user) {
        setShowCard(true)
        return
      }

      if (authError) {
        setError(`Erreur d'authentification: ${authError.message}`)
        setShowToast(true)
        return
      }

      // ✅ NOUVEAU: Utilisation du FileService
      console.log('Parsing PDF with FileService...')
      const parseResult = await FileService.parsePDF(uploadedFile)
      
      if (!parseResult.success) {
        setError(`Erreur lors de l'analyse du PDF: ${parseResult.error}`)
        setShowToast(true)
        return
      }

      // ✅ NOUVEAU: Utilisation du ResumeService
      console.log('Creating CV with ResumeService...')
      const resumeResult = await ResumeService.create({
        title: `CV ${new Date().toLocaleDateString()}`,
        raw_content: formData,
        user_id: user.id
      })
      
      if (!resumeResult.success) {
        setError(`Erreur lors de la création du CV: ${resumeResult.error}`)
        setShowToast(true)
        return
      }

      console.log('✅ CV créé avec succès!', resumeResult.data)
      
      // TODO: Intégrer avec Gemini pour amélioration
      
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(`Erreur: ${errorMessage}`)
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... reste du code existant ...
}
```

### Étape 5: Tester les Services (30 min)
```typescript
// tests/services/ResumeService.test.ts - À CRÉER
import { ResumeService } from '@/lib/services'
import { supabase } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')
const mockSupabase = supabase as any

describe('ResumeService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a resume successfully', async () => {
    // Mock Supabase response
    mockSupabase.from.mockReturnThis()
    mockSupabase.insert.mockReturnThis()
    mockSupabase.select.mockReturnThis()
    mockSupabase.single.mockResolvedValue({
      data: { id: '123', title: 'Test CV' },
      error: null
    })

    const result = await ResumeService.create({
      title: 'Test CV',
      raw_content: { personalInfo: { name: 'John' } },
      user_id: 'user123'
    })

    expect(result.success).toBe(true)
    expect(result.data?.title).toBe('Test CV')
  })
})
```

### Étape 6: Mettre à Jour les Exports (5 min)
```typescript
// lib/services/index.ts - MODIFIER
export { BaseService } from './base/BaseService'
export type { ServiceResponse } from './base/BaseService'

export { UserService } from './user/UserService'
export type { UserProfile, UserPreferences } from './user/UserService'

// ✅ NOUVEAU: Ajouter ces lignes
export { ResumeService } from './resume/ResumeService'
export type { Resume } from './resume/ResumeService'

export { FileService } from './file/FileService'
export type { ParsedFile } from './file/FileService'
```

### Étape 7: Test d'Intégration (15 min)
```bash
# 1. Tester que tout compile
npm run type-check

# 2. Tester que les services fonctionnent
npm run test

# 3. Tester l'application
npm run dev
# Essayer de créer un CV avec upload PDF
```

## 🚀 Services Futurs (Prochaines Étapes)

### AIService - Intégration Gemini (1h)
```typescript
// lib/services/ai/AIService.ts - FUTUR
export class AIService extends BaseService {
  static async enhanceCV(resumeId: string): Promise<ServiceResponse<any>> {
    // Intégration avec votre GeminiService existant
  }
}
```

### NotificationService - UX (30 min)
```typescript
// lib/services/notification/NotificationService.ts - FUTUR
export class NotificationService extends BaseService {
  static showSuccess(message: string) {
    // Gestion centralisée des notifications
  }
}
```

## ✅ Checklist de Validation

### Phase 1 - Fondations
- [ ] BaseService créé et documenté
- [ ] UserService implémenté et testé
- [ ] Structure des dossiers organisée
- [ ] Types TypeScript définis

### Phase 2 - CV Management
- [ ] ResumeService implémenté
- [ ] FileService pour PDF parsing
- [ ] useCVForm refactorisé
- [ ] Tests unitaires passent

### Phase 3 - Intégration
- [ ] Services utilisés dans l'UI
- [ ] Gestion d'erreurs fonctionnelle
- [ ] Logging opérationnel
- [ ] Performance mesurée

## 🎓 Concepts Maîtrisés

Après cette implémentation, vous maîtriserez :

✅ **Architecture en couches** - Séparation claire des responsabilités  
✅ **Design Patterns** - Repository, Service Layer, Factory  
✅ **Type Safety** - Types TypeScript stricts partout  
✅ **Error Handling** - Gestion centralisée et cohérente  
✅ **Testing** - Tests unitaires et d'intégration  
✅ **Logging** - Debugging et monitoring structurés  
✅ **Validation** - Données propres et sécurisées  
✅ **Réutilisabilité** - Code DRY et maintenable  

## 💡 Conseils de Démarrage

1. **Commencez petit** : Implémentez juste ResumeService.create() d'abord
2. **Testez immédiatement** : Chaque fonction doit avoir son test
3. **Documentez au fur et à mesure** : Les commentaires sont votre ami
4. **Refactorisez graduellement** : Migrez un hook à la fois
5. **Mesurez l'impact** : Vérifiez que ça marche mieux qu'avant

**Temps total estimé : 4h pour avoir un système de services fonctionnel !** 🚀

Bonne implémentation ! 🎯 