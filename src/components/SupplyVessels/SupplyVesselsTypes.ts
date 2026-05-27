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
    [key: string]: any;
}

export interface CargoItem {
    id: string;
    name: string;
}

export interface CargoVessel {
    id: string;
    name: string;
    arrivalDate: string;
    containers: CargoItem[];
}

export interface DynamicColumn {
    name: string;
    key: string;
    unit?: string;
}