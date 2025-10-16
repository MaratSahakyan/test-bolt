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
      house_owners: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          property_name: string
          address: string
          property_type: 'house' | 'apartment' | 'commercial' | 'land' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          property_name: string
          address: string
          property_type?: 'house' | 'apartment' | 'commercial' | 'land' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_name?: string
          address?: string
          property_type?: 'house' | 'apartment' | 'commercial' | 'land' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          owner_id: string
          property_id: string | null
          document_type: 'identity' | 'property_deed' | 'tax_document' | 'certificate' | 'other'
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          property_id?: string | null
          document_type: 'identity' | 'property_deed' | 'tax_document' | 'certificate' | 'other'
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          property_id?: string | null
          document_type?: 'identity' | 'property_deed' | 'tax_document' | 'certificate' | 'other'
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          uploaded_at?: string
        }
      }
    }
  }
}
