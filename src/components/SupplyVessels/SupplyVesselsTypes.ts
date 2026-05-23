// src/components/SupplyVessels/SupplyVesselsTypes.ts
export interface SupplyVessel {
    id: string;
    vessel: string;
    location: string;
    crewChange: string;
    fuelOil: number;
    potWater: number;
    drlWater: number;
    barite: number;
    baseOil: number;
    cementG: number;
    [key: string]: any; // Allow dynamic fields
}

export interface SupplyVesselsTableProps {
    vessels: SupplyVessel[];
    wellId?: string; // Add wellId to know which well to update
    onVesselsChange: (vessels: SupplyVessel[]) => void;
    onSave?: (vessel: SupplyVessel) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    readOnly?: boolean;
}

export interface DynamicColumn {
    name: string;
    key: string;
    unit?: string;
}