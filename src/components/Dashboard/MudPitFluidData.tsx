// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider, Box, TextField, Grid } from '@mui/material';
import './MudPitFluidData.css';

export interface MudPitFluidDataProps {
    fluidData?: {
        reservePits?: PitData[];
        activePits?: PitData[];
        chemPits?: PitData[];
        hullStoragePort?: PitData[];
        hullStorageStarboard?: PitData[];
        brineTanks?: PitData[];
        baseOil?: PitData;
        slug?: PitData;
        barite?: BariteData;
    };
}

export interface PitData {
    name: string;
    capacity: number;
    fluid: string;
    ppg: number;
    volume: number;
}

export interface BariteData {
    minRequired: number;
    actual: number;
}

const MudPitFluidData = ({ fluidData }: MudPitFluidDataProps) => {
    // Default mock data
    const defaultData = {
        reservePits: [
            { name: "Reserve 6", capacity: 503, fluid: "", ppg: 0, volume: 0 },
            { name: "Reserve 5", capacity: 503, fluid: "", ppg: 0, volume: 0 },
            { name: "Reserve 4", capacity: 503, fluid: "", ppg: 0, volume: 0 },
            { name: "Reserve 3", capacity: 503, fluid: "", ppg: 0, volume: 0 },
            { name: "Reserve 2", capacity: 377, fluid: "", ppg: 0, volume: 0 },
            { name: "Reserve 1", capacity: 377, fluid: "", ppg: 0, volume: 0 }
        ],
        activePits: [
            { name: "Active 4", capacity: 629, fluid: "", ppg: 0, volume: 0 },
            { name: "Active 3", capacity: 629, fluid: "", ppg: 0, volume: 0 },
            { name: "Active 2", capacity: 377, fluid: "", ppg: 0, volume: 0 },
            { name: "Active 1", capacity: 377, fluid: "", ppg: 0, volume: 0 }
        ],
        chemPits: [
            { name: "Chem 4", capacity: 113, fluid: "", ppg: 0, volume: 0 },
            { name: "Chem 3", capacity: 113, fluid: "", ppg: 0, volume: 0 },
            { name: "Chem 2", capacity: 113, fluid: "", ppg: 0, volume: 0 },
            { name: "Chem 1", capacity: 113, fluid: "", ppg: 0, volume: 0 }
        ],
        hullStoragePort: [
            { name: "PSt 1", capacity: 2723, fluid: "", ppg: 0, volume: 0 },
            { name: "PSt 2", capacity: 2723, fluid: "", ppg: 0, volume: 0 },
            { name: "PSt 3", capacity: 2723, fluid: "", ppg: 0, volume: 0 }
        ],
        hullStorageStarboard: [
            { name: "SSt 3", capacity: 1572, fluid: "", ppg: 0, volume: 0 },
            { name: "SSt 4", capacity: 1572, fluid: "", ppg: 0, volume: 0 },
            { name: "SSt 1", capacity: 1572, fluid: "", ppg: 0, volume: 0 },
            { name: "SSt 2", capacity: 1572, fluid: "", ppg: 0, volume: 0 }
        ],
        brineTanks: [
            { name: "Brine 2", capacity: 1572, fluid: "", ppg: 0, volume: 0 },
            { name: "Brine 1", capacity: 1572, fluid: "", ppg: 0, volume: 0 }
        ],
        baseOil: { name: "Base Oil", capacity: 3145, fluid: "", ppg: 0, volume: 0 },
        slug: { name: "Slug", capacity: 113, fluid: "", ppg: 0, volume: 0 },
        barite: { minRequired: 0, actual: 0 }
    };

    const data = fluidData || defaultData;

    const PitCard = ({ pit, title }: { pit: PitData; title?: string }) => (
        <div className="pit-card">
            <div className="pit-title">
                <Typography className="pit-name">{pit.name}</Typography>
                <Typography className="pit-capacity">({pit.capacity}bbl)</Typography>
            </div>
            <div className="pit-row">
                <Typography className="pit-label">Fluid:</Typography>
                <Typography className="pit-value">{pit.fluid || "0"}</Typography>
            </div>
            <div className="pit-row">
                <Typography className="pit-label">ppg:</Typography>
                <Typography className="pit-value">{pit.ppg || "0.0"}</Typography>
            </div>
            <div className="pit-row">
                <Typography className="pit-label">Vol. (bbl):</Typography>
                <Typography className="pit-value">{pit.volume || "0"}</Typography>
            </div>
        </div>
    );

    return (
        <Paper className="fluid-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    MUD PIT CAPACITIES & FLUID DATA
                </Typography>
            </div>
            <Divider />
            <div className="fluid-content">
                {/* Reserve Pits Row 1 */}
                <div className="fluid-section">
                    <div className="pit-grid">
                        {data.reservePits?.slice(0, 3).map((pit, idx) => (
                            <PitCard key={idx} pit={pit} />
                        ))}
                    </div>
                </div>

                {/* Reserve Pits Row 2 */}
                <div className="fluid-section">
                    <div className="pit-grid">
                        {data.reservePits?.slice(3, 6).map((pit, idx) => (
                            <PitCard key={idx} pit={pit} />
                        ))}
                    </div>
                </div>

                {/* Active Pits Row */}
                <div className="fluid-section">
                    <div className="pit-grid">
                        {data.activePits?.slice(0, 2).map((pit, idx) => (
                            <PitCard key={idx} pit={pit} />
                        ))}
                        {data.activePits?.slice(2, 4).map((pit, idx) => (
                            <PitCard key={idx + 2} pit={pit} />
                        ))}
                    </div>
                </div>

                {/* Hull Mud Storage Port */}
                <div className="fluid-section">
                    <div className="section-label">HULL MUD STORAGE PORT</div>
                    <div className="pit-grid">
                        {data.hullStoragePort?.map((pit, idx) => (
                            <PitCard key={idx} pit={pit} />
                        ))}
                    </div>
                </div>

                {/* Hull Mud Storage Starboard */}
                <div className="fluid-section">
                    <div className="section-label">HULL MUD STORAGE STARBOARD</div>
                    <div className="pit-grid">
                        {data.hullStorageStarboard?.map((pit, idx) => (
                            <PitCard key={idx} pit={pit} />
                        ))}
                    </div>
                </div>

                {/* Chemical Pits and Bottom Section */}
                <div className="fluid-section-bottom">
                    <div className="bottom-left">
                        <div className="section-label">CHEMICAL PITS</div>
                        <div className="pit-grid-small">
                            {data.chemPits?.map((pit, idx) => (
                                <PitCard key={idx} pit={pit} />
                            ))}
                        </div>
                    </div>
                    
                    <div className="bottom-right">
                        <div className="pit-grid-bottom">
                            {data.brineTanks?.map((pit, idx) => (
                                <PitCard key={idx} pit={pit} />
                            ))}
                            {data.baseOil && <PitCard pit={data.baseOil} />}
                            {data.slug && <PitCard pit={data.slug} />}
                        </div>
                        
                        <div className="barite-section">
                            <div className="barite-title">BARITE</div>
                            <div className="barite-row">
                                <Typography className="barite-label">Min Req'd:</Typography>
                                <Typography className="barite-value">{data.barite?.minRequired || 0}</Typography>
                            </div>
                            <div className="barite-row">
                                <Typography className="barite-label">Actual:</Typography>
                                <Typography className="barite-value">{data.barite?.actual || 0}</Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Paper>
    );
};

export default MudPitFluidData;