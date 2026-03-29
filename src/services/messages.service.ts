import { supabase } from '../lib/supabase'
import type { Conversation, ConversationWithDetails, Message } from '../types/database'

export const messagesService = {
  // Récupérer ou créer une conversation
  async getOrCreateConversation(listingId: string, sellerId: string): Promise<Conversation> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    // Chercher une conversation existante
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('listing_id', listingId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single()

    if (existing) return existing

    // Créer une nouvelle conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, buyer_id: user.id, seller_id: sellerId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Récupérer toutes les conversations de l'utilisateur
  async getConversations(): Promise<ConversationWithDetails[]> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        listings!listing_id(id, title, price, listing_images(url, sort_order)),
        buyer:profiles!buyer_id(id, full_name, avatar_url),
        seller:profiles!seller_id(id, full_name, avatar_url)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return (data as ConversationWithDetails[]) ?? []
  },

  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  // Envoyer un message
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Non connecté')

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Marquer les messages comme lus
  async markAsRead(conversationId: string): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    // Réinitialiser le compteur non-lus
    const conv = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single()

    if (conv.data) {
      const isBuyer = conv.data.buyer_id === user.id
      await supabase
        .from('conversations')
        .update(isBuyer ? { buyer_unread_count: 0 } : { seller_unread_count: 0 })
        .eq('id', conversationId)
    }
  },

  // Nombre total de messages non lus
  async getTotalUnread(): Promise<number> {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return 0

    const { data } = await supabase
      .from('conversations')
      .select('buyer_id, buyer_unread_count, seller_unread_count')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)

    if (!data) return 0

    return data.reduce((total, conv) => {
      if (conv.buyer_id === user.id) return total + (conv.buyer_unread_count ?? 0)
      return total + (conv.seller_unread_count ?? 0)
    }, 0)
  },

  // Écouter les nouveaux messages en temps réel
  subscribeToConversation(conversationId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => onMessage(payload.new as Message)
      )
      .subscribe()
  },

  // Écouter les mises à jour des conversations
  subscribeToConversations(userId: string, onUpdate: (conv: Conversation) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => onUpdate(payload.new as Conversation)
      )
      .subscribe()
  },

  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel)
  },
}
