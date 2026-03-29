import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

export type CategoryWithChildren = Category & { children?: Category[] }

export const categoriesService = {
  // Récupérer toutes les catégories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return data ?? []
  },

  // Récupérer les catégories parentes avec leurs enfants
  async getTree(): Promise<CategoryWithChildren[]> {
    const all = await categoriesService.getAll()
    const parents = all.filter(c => !c.parent_id)
    return parents.map(parent => ({
      ...parent,
      children: all.filter(c => c.parent_id === parent.id),
    }))
  },

  // Récupérer une catégorie par slug
  async getBySlug(slug: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  },
}
