// src/components/Dashboard/WellInformation.tsx
import { Paper, Typography, Divider } from '@mui/material';
import './WellInformation.css';

export interface WellInformationProps {
    wellData?: any;
    onUpdate?: (data: any) => void;
    readOnly?: boolean;
}

const WellInformation = ({ wellData, onUpdate, readOnly = false }: WellInformationProps) => {
    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    Well Information
                </Typography>
            </div>
            <Divider />
            <div className="panel-content">
                {wellData ? (
                    <div className="well-info-content">
                        {/* Add your well information fields here */}
                        <Typography variant="body2">Well Name: {wellData.wellName}</Typography>
                        <Typography variant="body2">Well AFE: {wellData.wellAFE}</Typography>
                        {/* Add more fields as needed */}
                    </div>
                ) : (
                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                        Well details will appear here
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default WellInformation;