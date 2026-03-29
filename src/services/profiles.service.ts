import { supabase } from '../lib/supabase'
import type { Database, Profile } from '../types/database'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export const profilesService = {
  // Récupérer un profil par ID
  async getProfile(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Récupérer le profil de l'utilisateur connecté
  async getCurrentProfile(): Promise<Profile | null> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return null
    return profilesService.getProfile(user.id)
  },

  // Mettre à jour le profil
  async updateProfile(id: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    await profilesService.updateProfile(userId, { avatar_url: publicUrl })

    return publicUrl
  },

  // Récupérer les avis d'un utilisateur
  async getReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, avatar_url)
      `)
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  // Laisser un avis
  async leaveReview(reviewedId: string, listingId: string, rating: number, comment?: string) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        listing_id: listingId,
        rating,
        comment,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}
