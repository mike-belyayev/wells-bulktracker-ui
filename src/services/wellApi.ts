// src/services/wellApi.ts
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

// Helper to get auth token
const getAuthToken = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.token;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// Helper for API calls with auth
const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
};

// Supply Vessel specific API calls
export const supplyVesselApi = {
    addSupplyVessel: async (wellId: string, vessel: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/supply-vessels`;
        return authFetch(url, {
            method: 'POST',
            body: JSON.stringify(vessel)
        });
    },
    updateSupplyVessel: async (wellId: string, vesselIndex: number, vessel: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/supply-vessels/${vesselIndex}`;
        return authFetch(url, {
            method: 'PUT',
            body: JSON.stringify(vessel)
        });
    },
    deleteSupplyVessel: async (wellId: string, vesselIndex: number) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/supply-vessels/${vesselIndex}`;
        return authFetch(url, {
            method: 'DELETE'
        });
    }
};

// Cargo Vessel API calls
export const cargoVesselApi = {
    addCargoVessel: async (wellId: string, vessel: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/cargo-vessels`;
        return authFetch(url, {
            method: 'POST',
            body: JSON.stringify(vessel)
        });
    },
    updateCargoVessel: async (wellId: string, vesselIndex: number, vessel: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/cargo-vessels/${vesselIndex}`;
        return authFetch(url, {
            method: 'PUT',
            body: JSON.stringify(vessel)
        });
    },
    deleteCargoVessel: async (wellId: string, vesselIndex: number) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/cargo-vessels/${vesselIndex}`;
        return authFetch(url, {
            method: 'DELETE'
        });
    }
};

// Mud Pit API calls
export const mudPitApi = {
    getMudPits: async (wellId: string) => {
        const well = await wellApi.getWell(wellId);
        return well.mudPits || [];
    },
    addMudPit: async (wellId: string, mudPit: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/mud-pits`;
        return authFetch(url, {
            method: 'POST',
            body: JSON.stringify(mudPit)
        });
    },
    updateMudPit: async (wellId: string, pitIndex: number, mudPit: any) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/mud-pits/${pitIndex}`;
        return authFetch(url, {
            method: 'PUT',
            body: JSON.stringify(mudPit)
        });
    },
    deleteMudPit: async (wellId: string, pitIndex: number) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/mud-pits/${pitIndex}`;
        return authFetch(url, {
            method: 'DELETE'
        });
    },
    updateAllMudPits: async (wellId: string, mudPits: any[]) => {
        return wellApi.patchWell(wellId, { mudPits });
    }
};

// BOP Systems API calls
export const bopSystemsApi = {
    updateBopSystems: async (wellId: string, bopSystems: any[]) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/bop-systems`;
        return authFetch(url, {
            method: 'PUT',
            body: JSON.stringify({ bopSystems })
        });
    }
};

// Mud Pump Liners API calls
export const mudPumpLinersApi = {
    updateMudPumpLiners: async (wellId: string, mudPumpLiners: any[]) => {
        const url = `${API_BASE_URL}/api/wells/${wellId}/mud-pump-liners`;
        return authFetch(url, {
            method: 'PUT',
            body: JSON.stringify({ mudPumpLiners })
        });
    }
};

// Well API calls
export const wellApi = {
    getWell: async (wellId: string) => {
        return authFetch(API_ENDPOINTS.WELL_BY_ID(wellId));
    },
    getWellByName: async (wellName: string) => {
        return authFetch(API_ENDPOINTS.WELL_BY_NAME(wellName));
    },
    getWellsByOwner: async (wellOwner: string) => {
        return authFetch(API_ENDPOINTS.WELLS_BY_OWNER(wellOwner));
    },
    getAllWells: async () => {
        return authFetch(API_ENDPOINTS.WELLS);
    },
    createWell: async (wellData: any) => {
        return authFetch(API_ENDPOINTS.WELLS, {
            method: 'POST',
            body: JSON.stringify(wellData)
        });
    },
    updateWell: async (wellId: string, wellData: any) => {
        return authFetch(API_ENDPOINTS.WELL_BY_ID(wellId), {
            method: 'PUT',
            body: JSON.stringify(wellData)
        });
    },
    patchWell: async (wellId: string, updates: any) => {
        return authFetch(API_ENDPOINTS.WELL_BY_ID(wellId), {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    },
    cloneWell: async (wellId: string) => {
        return authFetch(API_ENDPOINTS.CLONE_WELL(wellId), {
            method: 'POST'
        });
    },
    deleteWell: async (wellId: string) => {
        return authFetch(API_ENDPOINTS.WELL_BY_ID(wellId), {
            method: 'DELETE'
        });
    },
    updateCasingProfile: async (wellId: string, casingProfile: any[]) => {
        return authFetch(`${API_BASE_URL}/api/wells/${wellId}/casing-profile`, {
            method: 'PATCH',
            body: JSON.stringify({ casingProfile })
        });
    }
};

// Site (Rig) API calls for well assignment
export const siteApi = {
    getSiteWithWells: async (siteName: string) => {
        return authFetch(API_ENDPOINTS.SITE_WITH_WELLS(siteName));
    },
    setActiveWell: async (siteName: string, wellId: string) => {
        return authFetch(API_ENDPOINTS.SITE_ACTIVE_WELL(siteName), {
            method: 'PUT',
            body: JSON.stringify({ wellId })
        });
    },
    setNextWell: async (siteName: string, wellId: string) => {
        return authFetch(API_ENDPOINTS.SITE_NEXT_WELL(siteName), {
            method: 'PUT',
            body: JSON.stringify({ wellId })
        });
    }
};

export default {
    wellApi,
    supplyVesselApi,
    cargoVesselApi,
    mudPitApi,
    bopSystemsApi,
    mudPumpLinersApi,
    siteApi
};