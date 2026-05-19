// src/types/api.ts
// COMPLETE TYPES - ALL MISSING TYPES ADDED

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
// APIC GUIDELINE TYPES
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
// VALIDATION PROTOCOL TYPES
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
// CHANGE CONTROL TYPES
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
// TRAINING TYPES
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

// ============================================
// FMEA Risk Assessment Types
// ============================================

export interface FMEARiskAssessment {
  id: number
  equipment_id: number
  equipment_name?: string
  failure_mode: string
  location_description: string | null
  severity: number
  occurrence: number
  detection: number
  rpn: number
  risk_level: 'Low' | 'Medium' | 'High'
  is_sampling_point: boolean
  sampling_method: 'swab' | 'rinse' | 'contact_plate'
  sampling_area_cm2: number
  justification: string | null
  mitigation_controls: string | null
  created_at: string
}

export interface FMEACreate {
  equipment_id: number
  failure_mode: string
  location_description?: string
  severity: number
  occurrence: number
  detection: number
  is_sampling_point?: boolean
  sampling_method?: string
  sampling_area_cm2?: number
  justification?: string
  mitigation_controls?: string
}

// ============================================
// Recovery Study Types
// ============================================

export interface RecoveryStudy {
  id: number
  product_id: number
  product_name?: string
  material_of_construction: string
  recovery_percent: number
  correction_factor: number
  study_date: string
  report_reference: string | null
  is_valid: boolean
  valid_until: string | null
  notes: string | null
}

export interface RecoveryStudyCreate {
  product_id: number
  material_of_construction: string
  recovery_percent: number
  study_date?: string
  report_reference?: string
  notes?: string
}

// ============================================
// Nitrosamine Risk Assessment Types
// ============================================

export interface NitrosamineRiskAssessment {
  id: number
  product_id: number
  product_name?: string
  secondary_amine_present: boolean
  tertiary_amine_present: boolean
  primary_amine_present: boolean
  nitrite_in_raw_materials: boolean
  recovered_solvents_used: boolean
  nitrosating_agents_used: boolean
  low_ph_conditions: boolean
  high_temperature_used: boolean
  temperature_threshold_c: number | null
  water_nitrite_level_ppm: number | null
  chloramines_in_water: boolean
  shared_with_nitrosating_products: boolean
  overall_risk_level: 'Low' | 'Medium' | 'High'
  risk_justification: string | null
  requires_confirmatory_testing: boolean
  mitigation_plan: string | null
  assessment_date: string
  assessed_by: string
}

export interface NitrosamineCreate {
  product_id: number
  assessed_by: string
  secondary_amine_present?: boolean
  tertiary_amine_present?: boolean
  primary_amine_present?: boolean
  nitrite_in_raw_materials?: boolean
  nitrosating_agents_used?: boolean
  low_ph_conditions?: boolean
  high_temperature_used?: boolean
}

// ============================================
// Operator Qualification Types
// ============================================

export interface OperatorQualification {
  id: number
  user_id: number
  username?: string
  eyesight_certified: boolean
  eyesight_certified_date: string | null
  eyesight_certified_by: string | null
  left_eye_vision: string | null
  right_eye_vision: string | null
  color_blindness_test_passed: boolean
  color_blindness_test_date: string | null
  training_completed: boolean
  training_date: string | null
  training_duration_hours: number | null
  trainer_name: string | null
  training_scores: number | null
  practical_demo_passed: boolean
  practical_demo_date: string | null
  qualification_valid_until: string | null
  qualified_by: string | null
  is_active: boolean
}

export interface OperatorQualificationCreate {
  user_id: number
  qualified_by: string
}

// ============================================
// Bracketing Group Types
// ============================================

export interface BracketingGroup {
  id: number
  name: string
  equipment_type: string
  cleaning_procedure_class: string
  description: string | null
  products?: BracketingProduct[]
  worst_case?: BracketingWorstCase
  created_at: string
}

export interface BracketingProduct {
  id: number
  group_id: number
  product_id: number
  product_name?: string
  rating_hardest_to_clean: number
  rating_solubility: number
  rating_toxicity: number
  rating_dose: number
  total_rating: number
  is_worst_case: boolean
}

export interface BracketingWorstCase {
  id: number
  group_id: number
  product_id: number
  product_name?: string
  selection_justification: string
  validation_completed: boolean
  validation_session_id: number | null
}

export interface BracketingGroupCreate {
  name: string
  equipment_type: string
  cleaning_procedure_class: string
  description?: string
}

// ============================================
// Validation Protocol Extended Types
// ============================================

export interface ProtocolTemplate {
  id: number
  template_name: string
  template_section: string
  content_html: string | null
  content_json: any
  version: number
  is_active: boolean
}

export interface CleaningValidationProtocol {
  id: number
  protocol_number: string
  revision: string
  product_id: number
  product_name?: string
  date_of_issue: string
  location: string
  manufacturing_block: string | null
  batch_size_range: string | null
  prepared_by: string
  prepared_date: string | null
  checked_by_production: string | null
  checked_by_production_date: string | null
  checked_by_ppa: string | null
  checked_by_ppa_date: string | null
  checked_by_engineering: string | null
  checked_by_engineering_date: string | null
  checked_by_qc: string | null
  checked_by_qc_date: string | null
  checked_by_qa: string | null
  checked_by_qa_date: string | null
  approved_by: string | null
  approved_date: string | null
  campaign_max_batches: number
  campaign_max_days: number
  dht_hours: number
  cht_days: number
  apply_recovery_correction: boolean
  custom_introduction: string | null
  custom_objective: string | null
  custom_scope: string | null
  custom_responsibilities: string | null
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'OBSOLETE'
  pdf_path: string | null
  pdf_generated_at: string | null
}

// ============================================
// Dynamic Report Editable Sections
// ============================================

export interface ReportEditableSections {
  introduction?: string
  objective?: string
  scope?: string
  conclusion?: string
  recommendations?: string
  deviations?: string
}

// ============================================
// Protocol Editable Sections
// ============================================

export interface ProtocolEditableSections {
  background?: string
  purpose?: string
  scope?: string
  responsibilities?: string
  acceptance_criteria?: string
  revalidation_strategy?: string
}

// ============================================
// HOLD TIME TYPES - MISSING (ADDED)
// ============================================

export interface DirtyHoldTime {
  id: number
  equipment_id: number
  equipment_name?: string
  product_name: string
  batch_number: string
  end_of_batch_time: string
  cleaning_start_time: string
  actual_dht_hours: number
  max_validated_dht_hours: number
  is_within_limit: boolean
  is_validated: boolean
  investigation_required: boolean
  investigation_notes: string | null
  corrective_action: string | null
  created_by: string | null
  created_at: string
}

export interface DirtyHoldTimeCreate {
  equipment_id: number
  product_name: string
  batch_number: string
  end_of_batch_time: string
  cleaning_start_time: string
  max_validated_dht_hours?: number
  created_by?: string
}

export interface DirtyHoldTimeUpdate {
  cleaning_start_time?: string
  investigation_required?: boolean
  investigation_notes?: string
  corrective_action?: string
}

export interface CleanHoldTime {
  id: number
  equipment_id: number
  equipment_name?: string
  cleaning_completion_time: string
  next_use_time: string
  actual_cht_hours: number
  max_validated_cht_hours: number
  is_within_limit: boolean
  is_validated: boolean
  storage_conditions: string
  microbiological_testing_done: boolean
  microbiological_result: string | null
  created_by: string | null
  created_at: string
}

export interface CleanHoldTimeCreate {
  equipment_id: number
  cleaning_completion_time: string
  next_use_time: string
  max_validated_cht_hours?: number
  storage_conditions?: string
  created_by?: string
}

export interface CleanHoldTimeUpdate {
  next_use_time?: string
  storage_conditions?: string
  microbiological_testing_done?: boolean
  microbiological_result?: string
}

export interface HoldTimeValidation {
  id: number
  equipment_id: number
  equipment_name?: string
  product_id: number | null
  product_name?: string
  hold_type: 'DHT' | 'CHT'
  validated_hours: number
  tested_hours: number | null
  validation_protocol_id: number | null
  validation_report_id: number | null
  number_of_successful_runs: number
  required_runs: number
  is_validated: boolean
  validation_date: string | null
  expiry_date: string | null
  study_conditions: string | null
  conclusions: string | null
  created_at: string
}

export interface HoldTimeValidationCreate {
  equipment_id: number
  product_id?: number
  hold_type: 'DHT' | 'CHT'
  validated_hours: number
  tested_hours?: number
  study_conditions?: string
}

// ============================================
// FORMULATION / DOSAGE FORM TYPES - MISSING (ADDED)
// ============================================

export interface DosageForm {
  id: number
  name: string
  code: string
  plant_type: string
  requires_sterility: boolean
  requires_endotoxin_testing: boolean
  requires_microbiological_testing: boolean
  default_microbial_limit_cfu: number | null
  default_endotoxin_limit_eu_ml: number | null
  is_active: boolean
  created_at: string
}

export interface ProductDosageForm {
  id: number
  product_id: number
  dosage_form_id: number
  batch_quantity: number | null
  batch_unit: string
  min_daily_dose: number | null
  max_daily_dose: number | null
  dose_unit: string
}

// ============================================
// CLEANING PROCESS TYPES - MISSING (ADDED)
// ============================================

export interface CleaningProcess {
  id: number
  process_code: string
  name: string
  description: string | null
  cleaning_type: 'manual' | 'automated_cip' | 'automated_cop' | 'semi_automated'
  is_validated: boolean
  is_active: boolean
  sop_reference: string | null
  min_temperature_c: number | null
  max_temperature_c: number | null
  min_flow_rate_lpm: number | null
  max_flow_rate_lpm: number | null
  min_pressure_bar: number | null
  max_pressure_bar: number | null
  min_duration_min: number | null
  max_duration_min: number | null
  created_by: string | null
  created_at: string
}

export interface CleaningParameter {
  id: number
  process_id: number
  parameter_name: string
  parameter_unit: string
  target_value: number | null
  min_acceptable: number
  max_acceptable: number
  is_critical: boolean
  measurement_method: string | null
}

export interface CleaningExecution {
  id: number
  process_id: number
  session_id: number | null
  execution_date: string
  executed_by: string
  actual_temperature_c: number | null
  actual_flow_rate_lpm: number | null
  actual_pressure_bar: number | null
  actual_duration_min: number | null
  all_parameters_acceptable: boolean
  deviations: string | null
}

// ============================================
// NOTIFICATION / ALERT TYPES - MISSING (ADDED)
// ============================================

export interface AMVWarning {
  field: string
  display_name: string
  value: any
  advice: string
  severity: 'high' | 'medium' | 'low'
}

// ============================================
// EXPORT TYPES - MISSING (ADDED)
// ============================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json' | 'csv'
  includeCharts?: boolean
  includeTables?: boolean
  includeHeader?: boolean
  dateRange?: {
    from: string
    to: string
  }
}