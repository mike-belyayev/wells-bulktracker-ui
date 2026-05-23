// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider } from '@mui/material';
import './MudPitFluidData.css';

export interface MudPitFluidDataProps {
    fluidData?: any;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}

const MudPitFluidData = ({ fluidData, onUpdate, readOnly = false }: MudPitFluidDataProps) => {
    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    Mud Pit Capacities & Fluid Data
                </Typography>
            </div>
            <Divider />
            <div className="panel-content">
                {fluidData ? (
                    <div className="fluid-data-content">
                        {/* Add your fluid data fields here */}
                        <Typography variant="body2">Pit Volume: {fluidData.pitVolume}</Typography>
                        <Typography variant="body2">Mud Weight: {fluidData.mudWeight}</Typography>
                        {/* Add more fields as needed */}
                    </div>
                ) : (
                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                        Mud pit and fluid data will appear here
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default MudPitFluidData;