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
}

export interface SupplyVesselsTableProps {
    vessels: SupplyVessel[];
    onVesselsChange: (vessels: SupplyVessel[]) => void;
    onSave?: (vessel: SupplyVessel) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    readOnly?: boolean;
}