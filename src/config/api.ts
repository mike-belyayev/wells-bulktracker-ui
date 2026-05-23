// src/config/api.ts
// ============================================
// PRODUCTION - Vercel API (UNCOMMENT FOR DEPLOYMENT)
// ============================================
const API_BASE_URL = 'https://wells-bulktracker-api.vercel.app';

// ============================================
// DEVELOPMENT - Vercel API (UNCOMMENT FOR PRODUCTION)
// ============================================
// const API_BASE_URL = 'https://wells-bulktracker-api-dev.vercel.app';

console.log('API Base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_CHECK: `${API_BASE_URL}/api/users/me`,
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/users/forgot-password`,
  RESET_PASSWORD: (token: string) => `${API_BASE_URL}/api/users/reset-password/${token}`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_BY_ID: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  UNVERIFIED_USERS: `${API_BASE_URL}/api/users/unverified`,
  VERIFY_USER: (id: string) => `${API_BASE_URL}/api/users/verify/${id}`,
  
  // Site endpoints
  SITES: `${API_BASE_URL}/api/sites`,
  SITE_BY_NAME: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}`,
  SITE_POB: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}/pob`,
  INITIALIZE_SITES: `${API_BASE_URL}/api/sites/initialize`,
  
  // ===== WELL ENDPOINTS =====
  WELLS: `${API_BASE_URL}/api/wells`,
  WELL_BY_ID: (id: string) => `${API_BASE_URL}/api/wells/${id}`,
  WELL_BY_NAME: (wellName: string) => `${API_BASE_URL}/api/wells/name/${wellName}`,
  WELLS_BY_OWNER: (wellOwner: string) => `${API_BASE_URL}/api/wells/owner/${wellOwner}`,
  WELL_PHASES: (id: string) => `${API_BASE_URL}/api/wells/${id}/phases`,
  WELLS_INITIALIZE: `${API_BASE_URL}/api/wells/initialize`,
  CLONE_WELL: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/clone`, // Added clone endpoint
  
  // ===== PHASE ENDPOINTS =====
  ADD_PHASE: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/phases`,
  DELETE_PHASE: (wellId: string, phaseIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/phases/${phaseIndex}`,
  
  // ===== SUBPHASE ENDPOINTS =====
  DELETE_SUBPHASE: (wellId: string, phaseIndex: number, subPhaseIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/phases/${phaseIndex}/subphases/${subPhaseIndex}`,
  
  // ===== ITEM ENDPOINTS =====
  DELETE_ITEM: (wellId: string, phaseIndex: number, subPhaseIndex: number, itemIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/phases/${phaseIndex}/subphases/${subPhaseIndex}/items/${itemIndex}`,
  
  // ===== BULK OPERATIONS =====
  DELETE_ALL_PHASE_ITEMS: (wellId: string, phaseIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/phases/${phaseIndex}/items`,
  
  // ===== SITE-WELL ASSIGNMENT ENDPOINTS =====
  SITE_ACTIVE_WELL: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}/active-well`,
  SITE_NEXT_WELL: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}/next-well`,
  SITE_WITH_WELLS: (siteName: string) => `${API_BASE_URL}/api/sites/${siteName}/with-wells`,

  // ===== SUPPLY VESSEL ENDPOINTS =====
  WELL_SUPPLY_VESSELS: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/supply-vessels`,
  WELL_SUPPLY_VESSEL_BY_INDEX: (wellId: string, vesselIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/supply-vessels/${vesselIndex}`,
  
  // ===== CARGO VESSEL ENDPOINTS =====
  WELL_CARGO_VESSELS: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/cargo-vessels`,
  WELL_CARGO_VESSEL_BY_INDEX: (wellId: string, vesselIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/cargo-vessels/${vesselIndex}`,
  
  // ===== MUD PIT ENDPOINTS =====
  WELL_MUD_PITS: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/mud-pits`,
  WELL_MUD_PIT_BY_INDEX: (wellId: string, pitIndex: number) => 
    `${API_BASE_URL}/api/wells/${wellId}/mud-pits/${pitIndex}`,
  
  // ===== BOP SYSTEMS ENDPOINTS =====
  WELL_BOP_SYSTEMS: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/bop-systems`,
  
  // ===== MUD PUMP LINERS ENDPOINTS =====
  WELL_MUD_PUMP_LINERS: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/mud-pump-liners`,
  
  // ===== CASING PROFILE ENDPOINTS =====
  WELL_CASING_PROFILE: (wellId: string) => `${API_BASE_URL}/api/wells/${wellId}/casing-profile`,
};

export default API_BASE_URL;