// src/components/Dashboard/MudPitFluidData.tsx
import { Paper, Typography, Divider } from '@mui/material';
import './MudPitFluidData.css';

export interface MudPitFluidDataProps {
    fluidData?: any;
    _onUpdate?: (data: any) => void;  // Prefix with _
    _readOnly?: boolean;  // Prefix with _
}

const MudPitFluidData = ({ fluidData, _onUpdate, _readOnly }: MudPitFluidDataProps) => {
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
                        <Typography variant="body2">Pit Volume: {fluidData.pitVolume}</Typography>
                        <Typography variant="body2">Mud Weight: {fluidData.mudWeight}</Typography>
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