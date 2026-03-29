import { supabase } from '../lib/supabase'
import type { Database, Listing, ListingWithDetails } from '../types/database'

type ListingInsert = Database['public']['Tables']['listings']['Insert']
type ListingUpdate = Database['public']['Tables']['listings']['Update']

export interface ListingsFilter {
  categoryId?: number
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  city?: string
  condition?: string
  listingType?: string
  query?: string
  userId?: string
  status?: string
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'price_asc' | 'price_desc' | 'views'
}

export const listingsService = {
  // Récupérer les annonces avec filtres
  async getListings(filters: ListingsFilter = {}): Promise<{ data: ListingWithDetails[]; count: number }> {
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles!user_id(id, full_name, avatar_url, rating_avg, location_city),
        categories!category_id(id, name, slug, icon),
        listing_images(id, url, sort_order)
      `, { count: 'exact' })

    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.eq('status', 'active')
    }

    if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
    if (filters.city) query = query.ilike('location_city', `%${filters.city}%`)
    if (filters.condition) query = query.eq('condition', filters.condition)
    if (filters.listingType) query = query.eq('listing_type', filters.listingType)
    if (filters.userId) query = query.eq('user_id', filters.userId)
    if (filters.query) query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)

    // Tri
    switch (filters.sortBy) {
      case 'price_asc': query = query.order('price', { ascending: true, nullsFirst: false }); break
      case 'price_desc': query = query.order('price', { ascending: false, nullsFirst: false }); break
      case 'views': query = query.order('views_count', { ascending: false }); break
      default: query = query.order('is_boosted', { ascending: false }).order('created_at', { ascending: false })
    }

    const limit = filters.limit ?? 20
    const offset = filters.offset ?? 0
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error
    return { data: (data as ListingWithDetails[]) ?? [], count: count ?? 0 }
  },

  // Récupérer une annonce par ID
  async getListing(id: string): Promise<ListingWithDetails> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!user_id(id, full_name, avatar_url, rating_avg, location_city, phone),
        categories!category_id(id, name, slug, icon),
        listing_images(id, url, sort_order)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Incrémenter les vues (sans attendre)
    supabase.rpc('increment_listing_views', { listing_id: id })

    return data as ListingWithDetails
  },

  // Créer une annonce
  async createListing(listing: ListingInsert, images: File[]): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single()

    if (error) throw error

    // Upload des images si fournies
    if (images.length > 0) {
      await listingsService.uploadImages(data.id, listing.user_id, images)
    }

    return data
  },

  // Mettre à jour une annonce
  async updateListing(id: string, updates: ListingUpdate): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Supprimer (marquer comme deleted)
  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'deleted' })
      .eq('id', id)

    if (error) throw error
  },

  // Marquer comme vendu
  async markAsSold(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', id)

    if (error) throw error
  },

  // Upload images
  async uploadImages(listingId: string, userId: string, files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const path = `${userId}/${listingId}/${Date.now()}_${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(path)

      uploadedUrls.push(publicUrl)

      await supabase.from('listing_images').insert({
        listing_id: listingId,
        url: publicUrl,
        sort_order: i,
      })
    }

    return uploadedUrls
  },

  // Supprimer une image
  async deleteImage(imageId: string, url: string): Promise<void> {
    // Extraire le path depuis l'URL
    const path = url.split('/listing-images/')[1]
    if (path) {
      await supabase.storage.from('listing-images').remove([path])
    }
    const { error } = await supabase.from('listing_images').delete().eq('id', imageId)
    if (error) throw error
  },

  // Recherche full-text
  async search(query: string): Promise<Listing[]> {
    const { data, error } = await supabase.rpc('search_listings', { query })
    if (error) throw error
    return data ?? []
  },

  // Annonces similaires (même catégorie)
  async getSimilar(listing: Listing, limit = 4): Promise<ListingWithDetails[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles!user_id(id, full_name, avatar_url, rating_avg, location_city),
        categories!category_id(id, name, slug, icon),
        listing_images(id, url, sort_order)
      `)
      .eq('category_id', listing.category_id)
      .eq('status', 'active')
      .neq('id', listing.id)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ListingWithDetails[]) ?? []
  },
}
