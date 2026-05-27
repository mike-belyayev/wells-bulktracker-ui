// src/components/SupplyVessels/index.ts
export { default as SupplyVesselsTable } from './SupplyVesselsTable';
export { default as CargoVesselsSection } from './CargoVesselsSection';
export type { SupplyVessel, DynamicColumn } from './SupplyVesselsTable';
export type { CargoVessel } from './CargoVesselsSection';

// For backward compatibility - CargoItem is now just string
export type CargoItem = string;