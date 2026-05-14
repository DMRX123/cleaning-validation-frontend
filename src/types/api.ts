// src/types/api.ts
// Complete TypeScript interfaces for Cleaning Validation System

// ============================================
// AUTH TYPES
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: number;
  name: string;
  min_batch_size: number;      // kg
  max_batch_size: number;      // kg
  ade_pde: number;              // µg/day
  min_dose: number;             // mg
  max_dose: number;             // mg
  swab_recovery: number;        // %
  lod: number;                  // ppm
  loq: number;                  // ppm
  swab_dilution: number;        // ml
  swab_surface_area: number;    // m²
  solubility: string;
  hardest_to_clean: string;
  plant: string;
  min_batch_max_dose_ratio?: number;
}

export interface ProductCreate {
  name: string;
  min_batch_size: number;
  max_batch_size: number;
  ade_pde: number;
  min_dose: number;
  max_dose: number;
  swab_recovery: number;
  lod: number;
  loq: number;
  swab_dilution: number;
  swab_surface_area?: number;
  solubility: string;
  hardest_to_clean: string;
  plant: string;
}

export interface ProductUpdate extends Partial<ProductCreate> {}

// ============================================
// EQUIPMENT TYPES
// ============================================

export interface Equipment {
  id: number;
  name: string;
  equipment_id: string;
  capacity: number | null;
  surface_area: number;         // m²
  used_for: string;
  cleaning_procedure: string;
  plant: string;
}

export interface EquipmentCreate {
  name: string;
  equipment_id: string;
  capacity?: number;
  surface_area: number;
  used_for: string;
  cleaning_procedure: string;
  plant: string;
}

export interface EquipmentUpdate extends Partial<EquipmentCreate> {}

// ============================================
// MACO CALCULATION TYPES
// ============================================

export interface MACORequest {
  previous_product_id: number;
  next_product_id: number;
}

export interface MACOResponse {
  method_10ppm: number;
  method_tdd: number;
  method_ade_pde: number;
  method_ttc?: number;
  lowest_maco: number;
  purging_factor_used?: number;
  safety_factor_used?: number;
}

export interface MACOAdvancedRequest {
  previous_product_id: number;
  next_product_id: number;
  purging_factor?: number;
  safety_factor?: number;
  production_type?: string;
}

// ============================================
// SWAB LIMIT TYPES
// ============================================

export interface SwabLimitRequest {
  session_id: number;
  total_surface_area: number;
}

export interface SwabLimitResponse {
  mg_per_swab: number;
  ppm: number;
}

export interface SwabResult {
  id: number;
  session_id: number;
  location_name: string;
  absorbance_sample: number;
  absorbance_std: number;
  result_mg_ml: number | null;
  result_ppm: number | null;
  reported: string | null;
  created_at?: string;
}

export interface SwabResultCreate {
  session_id: number;
  location_name: string;
  absorbance_sample: number;
  absorbance_std: number;
}

// ============================================
// RINSE LIMIT TYPES
// ============================================

export interface RinseLimitRequest {
  session_id: number;
  equipment_surface_area: number;
}

export interface RinseLimitResponse {
  limit_mg: number;
  limit_ppm: number;
  volume_10ppm: number;
  volume_loq: number;
}

export interface RinseResult {
  id: number;
  session_id: number;
  equipment_name: string;
  actual_rinse_volume: number;
  absorbance_sample: number;
  absorbance_std: number;
  result_mg_ml: number | null;
  result_ppm: number | null;
  reported: string | null;
  created_at?: string;
}

export interface RinseResultCreate {
  session_id: number;
  equipment_name: string;
  actual_rinse_volume: number;
  absorbance_sample: number;
  absorbance_std: number;
}

// ============================================
// VALIDATION SESSION TYPES
// ============================================

export interface ValidationSession {
  id: number;
  session_code: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  extra_area_percentage: number;
  total_surface_area: number | null;
  created_at: string;
  updated_at: string;
  
  previous_product_id: number;
  next_product_id: number;
  previous_product?: Product;
  next_product?: Product;
  
  maco_10ppm: number | null;
  maco_tdd: number | null;
  maco_ade_pde: number | null;
  lowest_maco: number | null;
  
  swab_limit_mg: number | null;
  swab_limit_ppm: number | null;
  
  rinse_limit_mg: number | null;
  rinse_limit_ppm: number | null;
  rinse_volume_loq: number | null;
  rinse_volume_10ppm: number | null;
  
  standard_prep?: StandardPrep;
  swab_results?: SwabResult[];
  rinse_results?: RinseResult[];
}

export interface SessionCreate {
  previous_product_id: number;
  next_product_id: number;
  extra_area_percentage?: number;
}

// ============================================
// STANDARD PREPARATION TYPES
// ============================================

export interface StandardPrep {
  id: number;
  session_id: number;
  wt_of_std: number;
  first_dilution: number;
  second_dilution: number;
  third_dilution: number;
  fourth_dilution: number;
  fifth_dilution: number;
  potency: number;
  dilution_factor: number | null;
  created_at: string;
}

export interface StandardPrepCreate {
  session_id: number;
  wt_of_std: number;
  first_dilution: number;
  second_dilution: number;
  third_dilution: number;
  fourth_dilution: number;
  fifth_dilution: number;
  potency: number;
}

// ============================================
// STATIC DATA TYPES
// ============================================

export type Plant = 'Plant-1' | 'Plant-2' | 'Plant-3' | 'Plant-4';

export type Solubility = 
  | 'Very Soluble'
  | 'Freely Soluble'
  | 'Soluble'
  | 'Sparingly Soluble'
  | 'Slightly Soluble'
  | 'Very Slightly Soluble'
  | 'Practically Insoluble'
  | 'Insoluble';

export type CleaningDifficulty = 
  | 'Very Easy'
  | 'Easy'
  | 'Medium'
  | 'Difficult'
  | 'Very Difficult';

export type CleaningLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2';

// ============================================
// APIC GUIDELINE TYPES (Sections 4.2.6, 5.0, 7.0, 8.1, 9.0, 9.7)
// ============================================

export interface CleaningLevelResponse {
  cleaning_level: CleaningLevel;
  requirements: {
    visual_inspection: boolean;
    analytical_testing: boolean;
    microbiological_testing: boolean;
    validation_required: boolean;
    verification_frequency: string | null;
    max_residue_ppm: number | null;
    description: string;
  };
  justification: string;
}

export interface HoldTimeValidationRequest {
  equipment_id: number;
  end_of_batch_time: string;
  cleaning_start_time: string;
  max_dht_hours?: number;
}

export interface CleanHoldTimeRequest {
  equipment_id: number;
  cleaning_completion_time: string;
  next_use_time: string;
  max_cht_hours?: number;
  storage_conditions?: string;
}

export interface HoldTimeResponse {
  equipment_id: number;
  actual_hours: number;
  max_validated_hours: number;
  is_within_limit: boolean;
  status: 'PASS' | 'FAIL';
  action_required?: string;
}

export interface MicrobiologicalLimitsResponse {
  product_type: string;
  limits: {
    total_germ_count: number;
    yeast_mold: number | null;
    endotoxin: number | null;
    sampling_method: string;
  };
  sampling_frequency: string;
  reference: string;
}

export interface BracketingMatrixResponse {
  bracketing_matrix: Array<{
    Substance: string;
    "Cleaning Method Class": string;
    "a) Hardest to clean": number;
    "b) Solubility": number;
    "c) ADE/PDE": number;
    "d) Therapeutic dose": number;
    "Total Rating": number;
  }>;
  worst_case_product: {
    id: number;
    name: string;
  } | null;
  recommendation: string;
  total_products_in_bracket: number;
}

export interface LimitRationaleResponse {
  production_type: string;
  applied_factor: number | null;
  justification: string[];
  references: string[];
  limit_stringency?: string;
}

// ============================================
// VALIDATION PROTOCOL TYPES (Section 9.0)
// ============================================

export interface ValidationProtocol {
  id: number;
  protocol_number: string;
  title: string;
  version: number;
  status: 'DRAFT' | 'APPROVED' | 'EXECUTED' | 'CLOSED';
  
  background: string | null;
  purpose: string | null;
  scope: string | null;
  
  equipment_id: number;
  cleaning_procedure_id: string;
  previous_product_id: number;
  next_product_id: number;
  
  visual_acceptance: string;
  chemical_acceptance_ppm: number | null;
  microbiological_acceptance: number | null;
  
  sampling_locations: Array<{
    location: string;
    surface_type: string;
    area_dm2: number;
  }> | null;
  
  rinse_volume: number | null;
  analytical_methods: Array<{
    test: string;
    method: string;
    lod: number;
    loq: number;
    acceptance_criteria: string;
  }> | null;
  
  dirty_hold_time_hours: number | null;
  clean_hold_time_hours: number | null;
  
  prepared_by: string;
  prepared_date: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  
  created_at: string;
  updated_at: string | null;
}

export interface ProtocolCreate {
  equipment_id: number;
  previous_product_id: number;
  next_product_id: number;
  cleaning_procedure_id: string;
  prepared_by: string;
}

export interface ProtocolExecution {
  id: number;
  protocol_id: number;
  execution_number: number;
  execution_date: string;
  visual_result: 'PASS' | 'FAIL';
  chemical_result_ppm: number;
  microbiological_result: number | null;
  overall_result: 'PASS' | 'FAIL';
  deviations: string | null;
  investigator: string;
}

export interface ProtocolExecutionCreate {
  protocol_id: number;
  execution_number: number;
  visual_result: 'PASS' | 'FAIL';
  chemical_result_ppm: number;
  microbiological_result?: number;
  deviations?: string;
  investigator: string;
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportData {
  session_id: number;
  session_code: string;
  session_status: string;
  created_at: string;
  
  previous_product: {
    name: string;
    min_batch_size: number;
    max_batch_size: number;
  };
  next_product: {
    name: string;
    min_batch_size: number;
    max_batch_size: number;
    solubility: string;
  };
  
  lowest_maco: number;
  swab_limit_ppm: number;
  
  swab_results: Array<{
    location_name: string;
    result_ppm: number;
    reported: string;
  }>;
  
  rinse_results: Array<{
    equipment_name: string;
    result_ppm: number;
    reported: string;
  }>;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  products: number;
  equipment: number;
  active_sessions: number;
  pass_rate: number;
  trends: {
    products: string;
    equipment: string;
    sessions: string;
    pass_rate: string;
  };
}

export interface RecentActivity {
  id: number;
  session_code: string;
  status: string;
  created_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ErrorResponse {
  detail: string;
  status_code?: number;
}

// ============================================
// CHANGE CONTROL TYPES (Section 10.0)
// ============================================

export interface ChangeControl {
  id: number;
  change_number: string;
  title: string;
  type: string;
  description: string;
  reason: string;
  impact_on_cleaning: string | null;
  impact_on_validation: string | null;
  risk_assessment: string | null;
  equipment_id: number | null;
  product_id: number | null;
  cleaning_procedure_id: string | null;
  status: 'PROPOSED' | 'REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'CLOSED' | 'REJECTED';
  proposed_by: string;
  proposed_date: string;
  reviewed_by: string | null;
  approved_by: string | null;
  implementation_date: string | null;
  revalidation_required: boolean;
  revalidation_completed: boolean;
  closure_notes: string | null;
}

// ============================================
// TRAINING TYPES (Section 9.8)
// ============================================

export interface TrainingModule {
  id: number;
  module_code: string;
  title: string;
  description: string;
  category: string;
  version: number;
  is_active: boolean;
}

export interface TrainingRecord {
  id: number;
  user_id: number;
  module_id: number;
  training_date: string;
  expiry_date: string | null;
  trainer: string;
  score: number | null;
  is_passed: boolean;
  certificate_issued: boolean;
}