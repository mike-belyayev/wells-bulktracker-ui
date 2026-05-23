// src/components/Dashboard/LastUpdated.tsx
import { Paper, Typography, Divider } from '@mui/material';
import './LastUpdated.css';

export interface LastUpdatedProps {
    updates?: Array<{ id: string; message: string; timestamp: Date }>;
    onRefresh?: () => void;
}

const LastUpdated = ({ updates, onRefresh }: LastUpdatedProps) => {
    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title">
                    Last Updated
                </Typography>
            </div>
            <Divider />
            <div className="panel-content">
                {updates && updates.length > 0 ? (
                    <div className="updates-list">
                        {updates.map(update => (
                            <div key={update.id} className="update-item">
                                <Typography variant="body2" className="update-message">
                                    {update.message}
                                </Typography>
                                <Typography variant="caption" className="update-timestamp">
                                    {update.timestamp.toLocaleString()}
                                </Typography>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Typography variant="body2" color="textSecondary" className="placeholder-text">
                        Recent updates will appear here
                    </Typography>
                )}
            </div>
        </Paper>
    );
};

export default LastUpdated;