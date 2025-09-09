export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          barcode: string | null
          category_id: string | null
          brand: string | null
          unit: string | null
          weight: number | null
          dimensions: Json | null
          stock_quantity: number
          low_stock_threshold: number
          track_inventory: boolean
          is_available: boolean
          is_featured: boolean
          requires_shipping: boolean
          tax_exempt: boolean
          images: Json
          metadata: Json
          seo_title: string | null
          seo_description: string | null
          /** Add cooked flag to power pickup-only rules */
          is_cooked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          brand?: string | null
          unit?: string | null
          weight?: number | null
          dimensions?: Json | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          is_available?: boolean
          is_featured?: boolean
          requires_shipping?: boolean
          tax_exempt?: boolean
          images?: Json
          metadata?: Json
          seo_title?: string | null
          seo_description?: string | null
          /** Optional; defaults to false in DB */
          is_cooked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          category_id?: string | null
          brand?: string | null
          unit?: string | null
          weight?: number | null
          dimensions?: Json | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          is_available?: boolean
          is_featured?: boolean
          requires_shipping?: boolean
          tax_exempt?: boolean
          images?: Json
          metadata?: Json
          seo_title?: string | null
          seo_description?: string | null
          /** Optional on update */
          is_cooked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          is_fresh_meals: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          is_fresh_meals?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          is_fresh_meals?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          email: string | null
          phone: string | null
          status: string
          fulfillment_status: string
          payment_status: string
          subtotal: number
          tax_amount: number
          discount_amount: number
          shipping_amount: number
          total: number
          fulfillment_method: string
          delivery_method: string | null
          pickup_time: string | null
          delivery_time: string | null
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          customer_notes: string | null
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          email?: string | null
          phone?: string | null
          status?: string
          fulfillment_status?: string
          payment_status?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          shipping_amount?: number
          total: number
          fulfillment_method: string
          delivery_method?: string | null
          pickup_time?: string | null
          delivery_time?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          customer_notes?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          email?: string | null
          phone?: string | null
          status?: string
          fulfillment_status?: string
          payment_status?: string
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          shipping_amount?: number
          total?: number
          fulfillment_method?: string
          delivery_method?: string | null
          pickup_time?: string | null
          delivery_time?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          customer_notes?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_variant_id: string | null
          quantity: number
          price: number
          total: number
          product_title: string
          product_sku: string | null
          product_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_variant_id?: string | null
          quantity: number
          price: number
          total: number
          product_title: string
          product_sku?: string | null
          product_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          price?: number
          total?: number
          product_title?: string
          product_sku?: string | null
          product_image?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}