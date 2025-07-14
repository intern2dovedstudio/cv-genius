# Exemples Pratiques d'Utilisation des Services 🎯

## 🧩 Intégration dans les Composants React

### Exemple 1: Composant de Profil Simple

```typescript
// components/UserProfile.tsx
import { useState, useEffect } from 'react'
import { UserService, UserProfile, ServiceResponse } from '@/lib/services'

export function UserProfile({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      
      // ✅ Utilisation correcte du service
      const result: ServiceResponse<UserProfile> = await UserService.getProfile(userId)
      
      if (result.success) {
        setProfile(result.data!)
      } else {
        setError(result.error!)
      }
      
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  if (loading) return <div>Chargement du profil...</div>
  if (error) return <div className="error">Erreur: {error}</div>
  if (!profile) return <div>Aucun profil trouvé</div>

  return (
    <div className="profile">
      <h1>{profile.first_name} {profile.last_name}</h1>
      <p>{profile.bio}</p>
      <p>Thème: {profile.preferences.theme}</p>
    </div>
  )
}
```

### Exemple 2: Hook Personnalisé Avancé

```typescript
// hooks/useUserProfile.ts
import { useState, useEffect, useCallback } from 'react'
import { UserService, UserProfile, UpdateProfileRequest } from '@/lib/services'

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  updateProfile: (updates: UpdateProfileRequest) => Promise<boolean>
  refreshProfile: () => Promise<void>
}

export function useUserProfile(userId: string): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await UserService.getProfile(userId)
    
    if (result.success) {
      setProfile(result.data!)
    } else {
      setError(result.error!)
    }
    
    setLoading(false)
  }, [userId])

  const updateProfile = useCallback(async (updates: UpdateProfileRequest): Promise<boolean> => {
    setError(null)

    const result = await UserService.updateProfile(userId, updates)
    
    if (result.success) {
      setProfile(result.data!)
      return true
    } else {
      setError(result.error!)
      return false
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile
  }
}
```

### Exemple 3: Formulaire avec Validation

```typescript
// components/ProfileForm.tsx
import { useState } from 'react'
import { useUserProfile } from '@/hooks/useUserProfile'
import { UpdateProfileRequest } from '@/lib/services'

export function ProfileForm({ userId }: { userId: string }) {
  const { profile, loading, error, updateProfile } = useUserProfile(userId)
  const [formData, setFormData] = useState<UpdateProfileRequest>({})
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage('')

    // ✅ Le service gère toute la validation et la logique métier
    const success = await updateProfile(formData)
    
    if (success) {
      setSuccessMessage('Profil mis à jour avec succès !')
      setFormData({}) // Reset du formulaire
    }
    
    setSaving(false)
  }

  if (loading) return <div>Chargement...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="first_name">Prénom</label>
        <input
          id="first_name"
          type="text"
          value={formData.first_name ?? profile?.first_name ?? ''}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="bio">Biographie</label>
        <textarea
          id="bio"
          value={formData.bio ?? profile?.bio ?? ''}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="textarea"
          maxLength={500}
        />
      </div>

      <div>
        <label htmlFor="theme">Thème</label>
        <select
          id="theme"
          value={formData.preferences?.theme ?? profile?.preferences.theme ?? 'auto'}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            preferences: {
              ...prev.preferences,
              theme: e.target.value as 'light' | 'dark' | 'auto'
            }
          }))}
          className="select"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="auto">Automatique</option>
        </select>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || Object.keys(formData).length === 0}
        className="btn-primary"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </form>
  )
}
```

## 🔄 Intégration dans votre Hook CV existant

### Avant (Logique dispersée)

```typescript
// ❌ Ancien useCVForm.ts - Logique mélangée
const handleSubmit = async (uploadedFile: File | null) => {
  // Validation inline
  if (!uploadedFile) {
    setFileError('Veuillez sélectionner un fichier')
    return
  }

  // Logique auth inline
  const {user, error: authError} = await getCurrentUser()
  if (!user) {
    setShowCard(true)
    return
  }

  // TODO: Logique métier dispersée
  console.log('File:', uploadedFile)
  console.log('CV Data:', formData)
}
```

### Après (Avec services)

```typescript
// ✅ Nouveau useCVForm.ts - Clean et maintenable
import { ResumeService, FileService, ServiceResponse } from '@/lib/services'

const handleSubmit = async (uploadedFile: File | null) => {
  setIsSubmitting(true)
  setError('')

  try {
    // 1. Validation et parsing du fichier
    const parseResult = await FileService.parsePDF(uploadedFile)
    if (!parseResult.success) {
      throw new Error(parseResult.error)
    }

    // 2. Création du CV
    const cvResult = await ResumeService.create({
      title: 'Mon CV',
      raw_content: formData,
      user_id: user.id
    })

    if (!cvResult.success) {
      throw new Error(cvResult.error)
    }

    // 3. Génération du contenu IA
    const aiResult = await AIService.enhanceCV(cvResult.data!.id)
    if (!aiResult.success) {
      // Pas critique - on peut continuer sans IA
      console.warn('IA enhancement failed:', aiResult.error)
    }

    setSuccessMessage('CV créé avec succès !')
    
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Erreur inconnue')
  } finally {
    setIsSubmitting(false)
  }
}
```

## 🧪 Tests avec les Services

### Test Unitaire d'un Service

```typescript
// tests/services/UserService.test.ts
import { UserService } from '@/lib/services'
import { supabase } from '@/lib/supabase/client'

jest.mock('@/lib/supabase/client')
const mockSupabase = supabase as any

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      const mockProfile = {
        id: '123',
        user_id: 'user123',
        first_name: 'John',
        last_name: 'Doe',
        preferences: {
          theme: 'dark',
          language: 'fr'
        }
      }

      mockSupabase.from.mockReturnThis()
      mockSupabase.select.mockReturnThis()
      mockSupabase.eq.mockReturnThis()
      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      // Act
      const result = await UserService.getProfile('user123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual(expect.objectContaining(mockProfile))
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
    })

    it('should handle validation errors', async () => {
      // Act
      const result = await UserService.getProfile('')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Paramètres requis manquants')
    })
  })
})
```

### Test d'Intégration avec un Composant

```typescript
// tests/components/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { UserProfile } from '@/components/UserProfile'
import { UserService } from '@/lib/services'

jest.mock('@/lib/services')
const mockUserService = UserService as jest.Mocked<typeof UserService>

describe('UserProfile Component', () => {
  it('should display user profile when loaded successfully', async () => {
    // Arrange
    const mockProfile = {
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Développeur passionné',
      preferences: { theme: 'dark' }
    }

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile
    })

    // Act
    render(<UserProfile userId="user123" />)

    // Assert
    expect(screen.getByText('Chargement du profil...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Développeur passionné')).toBeInTheDocument()
      expect(screen.getByText('Thème: dark')).toBeInTheDocument()
    })
  })

  it('should display error message when service fails', async () => {
    // Arrange
    mockUserService.getProfile.mockResolvedValue({
      success: false,
      error: 'Profil non trouvé'
    })

    // Act
    render(<UserProfile userId="invalid" />)

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Erreur: Profil non trouvé')).toBeInTheDocument()
    })
  })
})
```

## 🚀 Patterns Avancés

### Pattern: Service avec Cache

```typescript
// services/CachedUserService.ts
export class CachedUserService extends UserService {
  private static cache = new Map<string, { data: UserProfile; expiry: number }>()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static async getProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    // Vérifier le cache d'abord
    const cached = this.cache.get(userId)
    if (cached && Date.now() < cached.expiry) {
      return this.createSuccessResponse(cached.data, 'Données mises en cache')
    }

    // Appel au service parent
    const result = await super.getProfile(userId)
    
    // Mettre en cache si succès
    if (result.success && result.data) {
      this.cache.set(userId, {
        data: result.data,
        expiry: Date.now() + this.CACHE_DURATION
      })
    }

    return result
  }
}
```

### Pattern: Service avec Retry et Circuit Breaker

```typescript
// services/RobustUserService.ts
export class RobustUserService extends UserService {
  static async getProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    const service = new RobustUserService()
    
    // Utilisation du retry automatique du BaseService
    return service.withRetry(
      () => super.getProfile(userId),
      3, // 3 tentatives
      1000 // 1 seconde entre les tentatives
    )
  }
}
```

## 🎯 Résumé des Bonnes Pratiques

### ✅ À Faire
- Toujours vérifier `result.success` avant d'utiliser `result.data`
- Utiliser des hooks personnalisés pour encapsuler la logique de service
- Gérer les états de loading et d'erreur dans l'UI
- Tester les services avec des mocks appropriés
- Centraliser la logique métier dans les services

### ❌ À Éviter
- Accéder directement à `result.data` sans vérification
- Dupliquer la logique de validation dans les composants
- Ignorer les erreurs retournées par les services
- Faire des appels directs à Supabase depuis les composants
- Mélanger la logique UI avec la logique métier

Ces exemples montrent comment intégrer proprement les services dans votre application CV Genius ! 🚀 