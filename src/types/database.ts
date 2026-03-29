export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ListingStatus = 'draft' | 'active' | 'sold' | 'expired' | 'deleted'
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'
export type ListingType = 'sale' | 'rent' | 'free' | 'wanted'
export type ReportType = 'spam' | 'fraud' | 'inappropriate' | 'duplicate' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          bio: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          is_verified: boolean
          rating_avg: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'rating_avg' | 'rating_count' | 'is_verified'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          icon: string | null
          parent_id: number | null
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: number
          title: string
          description: string
          price: number | null
          price_negotiable: boolean
          listing_type: ListingType
          condition: ListingCondition | null
          status: ListingStatus
          location_city: string | null
          location_zip: string | null
          location_lat: number | null
          location_lng: number | null
          views_count: number
          favorites_count: number
          is_boosted: boolean
          boosted_until: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'created_at' | 'updated_at' | 'views_count' | 'favorites_count' | 'is_boosted'>
        Update: Partial<Database['public']['Tables']['listings']['Insert']>
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['listing_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['listing_images']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          listing_id: string | null
          buyer_id: string
          seller_id: string
          last_message: string | null
          last_message_at: string
          buyer_unread_count: number
          seller_unread_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'last_message' | 'last_message_at' | 'buyer_unread_count' | 'seller_unread_count'>
        Update: Partial<Database['public']['Tables']['conversations']['Row']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'is_read'>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: never
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          listing_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>
        Update: never
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          listing_id: string | null
          user_id: string | null
          type: ReportType
          description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Functions: {
      increment_listing_views: { Args: { listing_id: string }; Returns: void }
      search_listings: { Args: { query: string }; Returns: Database['public']['Tables']['listings']['Row'][] }
    }
  }
}

// Types pratiques pour l'app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type ListingImage = Database['public']['Tables']['listing_images']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']

// Types enrichis avec relations
export type ListingWithDetails = Listing & {
  profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'rating_avg' | 'location_city'>
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'icon'>
  listing_images: ListingImage[]
}

export type ConversationWithDetails = Conversation & {
  listings: Pick<Listing, 'id' | 'title' | 'price'> & { listing_images: ListingImage[] }
  buyer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  seller: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}
