// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider } from '@mui/material';
import './MudPitFluidData.css';

export interface MudPitFluidDataProps {
    fluidData?: PitData[];
}

export interface PitData {
    name: string;
    fluid: string;
    weight: number;
    volume: number;
}

const MudPitFluidData = ({ fluidData }: MudPitFluidDataProps) => {
    // Default mock data
    const defaultData: PitData[] = [
        { name: "Active 1", fluid: "NAF", weight: 10.4, volume: 137 },
        { name: "Active 2", fluid: "PreMix", weight: 7.2, volume: 233 },
        { name: "Active 3", fluid: "NAF", weight: 10.4, volume: 405 },
        { name: "Active 4", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Reserve 1", fluid: "NAF", weight: 10.4, volume: 372 },
        { name: "Reserve 2", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Reserve 3", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Reserve 4", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Reserve 5", fluid: "NAF", weight: 10.4, volume: 192 },
        { name: "Reserve 6", fluid: "NAF", weight: 10.4, volume: 40 },
        { name: "Chem 1", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Chem 2", fluid: "LCM", weight: 12, volume: 100 },
        { name: "Chem 3", fluid: "HiVis", weight: 10.4, volume: 104 },
        { name: "Chem 4", fluid: "Empty", weight: 0, volume: 0 },
        { name: "Brine 1", fluid: "Brine", weight: 11.5, volume: 1011 },
        { name: "Brine 2", fluid: "Brine", weight: 11.5, volume: 1352 },
        { name: "Slug", fluid: "NAF", weight: 13, volume: 96 },
        { name: "SSt 1", fluid: "NAF", weight: 10.4, volume: 45 },
        { name: "SSt 2", fluid: "NAF", weight: 10.4, volume: 865 },
        { name: "SSt 3", fluid: "NAF", weight: 10.4, volume: 91 },
        { name: "SSt 4", fluid: "NAF", weight: 10.4, volume: 97 },
        { name: "Base Oil", fluid: "Base Oil", weight: 6.7, volume: 1383 },
        { name: "PSt 1", fluid: "Empty", weight: 0, volume: 0 },
        { name: "PSt 2", fluid: "Empty", weight: 0, volume: 0 },
        { name: "PSt 3", fluid: "Empty", weight: 0, volume: 0 }
    ];

    const data = fluidData || defaultData;

    return (
        <Paper className="fluid-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    MUD PIT CAPACITIES & FLUID DATA
                </Typography>
            </div>
            <Divider />
            <div className="fluid-content">
                <div className="pit-grid">
                    {data.map((pit, index) => (
                        <div key={index} className="pit-card">
                            <div className="pit-header">
                                <Typography className="pit-name">{pit.name}</Typography>
                            </div>
                            <div className="pit-details">
                                <div className="pit-row">
                                    <Typography className="pit-label">Fluid:</Typography>
                                    <Typography className="pit-value">{pit.fluid}</Typography>
                                </div>
                                <div className="pit-row">
                                    <Typography className="pit-label">Weight:</Typography>
                                    <Typography className="pit-value">{pit.weight} ppg</Typography>
                                </div>
                                <div className="pit-row">
                                    <Typography className="pit-label">Vol. (bbl):</Typography>
                                    <Typography className="pit-value">{pit.volume}</Typography>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Paper>
    );
};

export default MudPitFluidData;