import { supabase } from '../lib/supabase'
import type { ListingWithDetails } from '../types/database'

export const favoritesService = {
  // Récupérer les favoris de l'utilisateur
  async getFavorites(): Promise<ListingWithDetails[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        listing_id,
        listings!listing_id(
          *,
          profiles!user_id(id, full_name, avatar_url, rating_avg, location_city),
          categories!category_id(id, name, slug, icon),
          listing_images(id, url, sort_order)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data?.map((f: { listings: ListingWithDetails }) => f.listings).filter(Boolean) ?? []) as ListingWithDetails[]
  },

  // Vérifier si une annonce est en favoris
  async isFavorite(listingId: string): Promise<boolean> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return false

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', user.id)
      .single()

    return !!data
  },

  // Ajouter aux favoris
  async addFavorite(listingId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, listing_id: listingId })

    if (error) throw error
  },

  // Retirer des favoris
  async removeFavorite(listingId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', user.id)

    if (error) throw error
  },

  // Toggle favori
  async toggleFavorite(listingId: string): Promise<boolean> {
    const isFav = await favoritesService.isFavorite(listingId)
    if (isFav) {
      await favoritesService.removeFavorite(listingId)
      return false
    } else {
      await favoritesService.addFavorite(listingId)
      return true
    }
  },
}
