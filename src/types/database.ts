
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "admins": {
                  Row: {
                    "created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"cities": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"slug": string,"state": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"slug": string,"state"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"slug"?: string,"state"?: string
                  }
                  Relationships: [
                    
                  ]
                },"institutions": {
                  Row: {
                    "acronym": string | null,"campus_name": string | null,"city_id": string,"created_at": string,"has_own_housing": boolean,"housing_contact_email": string | null,"housing_contact_phone": string | null,"housing_contact_url": string | null,"housing_notes": string | null,"id": string,"location": unknown,"name": string,"slug": string,"updated_at": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acronym"?: string | null,"campus_name"?: string | null,"city_id": string,"created_at"?: string,"has_own_housing"?: boolean,"housing_contact_email"?: string | null,"housing_contact_phone"?: string | null,"housing_contact_url"?: string | null,"housing_notes"?: string | null,"id"?: string,"location": unknown,"name": string,"slug": string,"updated_at"?: string,"website"?: string | null
                  }
                  Update: {
                    "acronym"?: string | null,"campus_name"?: string | null,"city_id"?: string,"created_at"?: string,"has_own_housing"?: boolean,"housing_contact_email"?: string | null,"housing_contact_phone"?: string | null,"housing_contact_url"?: string | null,"housing_notes"?: string | null,"id"?: string,"location"?: unknown,"name"?: string,"slug"?: string,"updated_at"?: string,"website"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "institutions_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "institutions_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "institution_directory"
      referencedColumns: ["city_id"]
    }
                  ]
                },"listings": {
                  Row: {
                    "approx_location": unknown,"bedrooms": number | null,"city_id": string,"created_at": string,"external_url": string,"furnished": boolean | null,"id": string,"is_sample": boolean,"price": number | null,"source": string | null,"status": Database["public"]['Enums']["listing_status"],"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "approx_location"?: unknown,"bedrooms"?: number | null,"city_id": string,"created_at"?: string,"external_url": string,"furnished"?: boolean | null,"id"?: string,"is_sample"?: boolean,"price"?: number | null,"source"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "approx_location"?: unknown,"bedrooms"?: number | null,"city_id"?: string,"created_at"?: string,"external_url"?: string,"furnished"?: boolean | null,"id"?: string,"is_sample"?: boolean,"price"?: number | null,"source"?: string | null,"status"?: Database["public"]['Enums']["listing_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listings_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "institution_directory"
      referencedColumns: ["city_id"]
    }
                  ]
                },"reports": {
                  Row: {
                    "created_at": string,"id": string,"message": string | null,"reason": Database["public"]['Enums']["report_reason"],"republic_id": string,"resolved_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"message"?: string | null,"reason": Database["public"]['Enums']["report_reason"],"republic_id": string,"resolved_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"message"?: string | null,"reason"?: Database["public"]['Enums']["report_reason"],"republic_id"?: string,"resolved_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_republic_id_fkey"
      columns: ["republic_id"]
isOneToOne: false
      referencedRelation: "republics"
      referencedColumns: ["id"]
    }
                  ]
                },"republic_institutions": {
                  Row: {
                    "created_at": string,"institution_id": string,"republic_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"institution_id": string,"republic_id": string
                  }
                  Update: {
                    "created_at"?: string,"institution_id"?: string,"republic_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "republic_institutions_institution_id_fkey"
      columns: ["institution_id"]
isOneToOne: false
      referencedRelation: "institution_directory"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "republic_institutions_institution_id_fkey"
      columns: ["institution_id"]
isOneToOne: false
      referencedRelation: "institutions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "republic_institutions_republic_id_fkey"
      columns: ["republic_id"]
isOneToOne: false
      referencedRelation: "republics"
      referencedColumns: ["id"]
    }
                  ]
                },"republics": {
                  Row: {
                    "amenities": (string)[],"approx_location": unknown,"city_id": string,"consent_at": string,"contact_name": string | null,"created_at": string,"description": string | null,"house_rules": string | null,"id": string,"instagram": string | null,"is_sample": boolean,"kind": Database["public"]['Enums']["republic_kind"],"name": string,"neighborhood": string | null,"open_spots": number,"owner_user_id": string | null,"photos": (string)[],"price_max": number | null,"price_min": number | null,"slug": string,"status": Database["public"]['Enums']["republic_status"],"total_residents": number | null,"updated_at": string,"verified": boolean,"whatsapp": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amenities"?: (string)[],"approx_location": unknown,"city_id": string,"consent_at": string,"contact_name"?: string | null,"created_at"?: string,"description"?: string | null,"house_rules"?: string | null,"id"?: string,"instagram"?: string | null,"is_sample"?: boolean,"kind": Database["public"]['Enums']["republic_kind"],"name": string,"neighborhood"?: string | null,"open_spots"?: number,"owner_user_id"?: string | null,"photos"?: (string)[],"price_max"?: number | null,"price_min"?: number | null,"slug": string,"status"?: Database["public"]['Enums']["republic_status"],"total_residents"?: number | null,"updated_at"?: string,"verified"?: boolean,"whatsapp"?: string | null
                  }
                  Update: {
                    "amenities"?: (string)[],"approx_location"?: unknown,"city_id"?: string,"consent_at"?: string,"contact_name"?: string | null,"created_at"?: string,"description"?: string | null,"house_rules"?: string | null,"id"?: string,"instagram"?: string | null,"is_sample"?: boolean,"kind"?: Database["public"]['Enums']["republic_kind"],"name"?: string,"neighborhood"?: string | null,"open_spots"?: number,"owner_user_id"?: string | null,"photos"?: (string)[],"price_max"?: number | null,"price_min"?: number | null,"slug"?: string,"status"?: Database["public"]['Enums']["republic_status"],"total_residents"?: number | null,"updated_at"?: string,"verified"?: boolean,"whatsapp"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "republics_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "republics_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "institution_directory"
      referencedColumns: ["city_id"]
    }
                  ]
                }
          }
          Views: {
            "institution_directory": {
                  Row: {
                    "acronym": string | null,"campus_name": string | null,"city_id": string,"city_name": string,"city_slug": string,"city_state": string,"has_own_housing": boolean,"housing_contact_email": string | null,"housing_contact_phone": string | null,"housing_contact_url": string | null,"housing_notes": string | null,"id": string,"lat": number | null,"lng": number | null,"name": string,"slug": string,"website": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_public_republic":
{ Args: { "p_republic_id": string }; Returns: boolean
                           },
"search_republics":
{ Args: { "p_institution_id": string,"p_kind"?: Database["public"]['Enums']["republic_kind"],"p_max_distance_m"?: number,"p_max_price"?: number,"p_only_open"?: boolean }; Returns: {
              "cover_photo": string,"distance_m": number,"id": string,"is_sample": boolean,"kind": Database["public"]['Enums']["republic_kind"],"lat": number,"lng": number,"name": string,"neighborhood": string,"open_spots": number,"price_max": number,"price_min": number,"slug": string,"verified": boolean
            }[]
                           }
          }
          Enums: {
            "listing_status": "active"|"inactive","report_reason": "wrong_info"|"closed"|"no_consent"|"removal_request"|"other","republic_kind": "male"|"female"|"mixed","republic_status": "pending"|"approved"|"rejected"|"archived"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "listing_status": ["active", "inactive"],"report_reason": ["wrong_info", "closed", "no_consent", "removal_request", "other"],"republic_kind": ["male", "female", "mixed"],"republic_status": ["pending", "approved", "rejected", "archived"]
          }
        }
} as const
