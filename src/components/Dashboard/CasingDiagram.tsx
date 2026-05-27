// src/components/Dashboard/CasingDiagram.tsx
import { Typography, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import type { CasingProfile } from '../../utils/casingDiagramUtils';
import './CasingDiagram.css';

interface CasingDiagramProps {
    profiles: CasingProfile[];
    onEdit: () => void;
    readOnly?: boolean;
}

const CasingDiagram = ({ profiles, onEdit, readOnly = false }: CasingDiagramProps) => {
    if (profiles.length === 0) {
        return (
            <div className="casing-diagram-container">
                <div className="diagram-wrapper">
                    <div className="empty-diagram">
                        <Typography variant="body2" color="textSecondary">
                            No casing profiles defined.
                        </Typography>
                    </div>
                    {!readOnly && (
                        <IconButton 
                            size="small" 
                            onClick={onEdit} 
                            className="casing-edit-bottom-btn"
                            title="Edit Casing Profiles"
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="casing-diagram-container">
            <div className="diagram-wrapper">
                <div className="casing-stack">
                    {profiles.map((profile, idx) => (
                        <div 
                            key={profile.index}
                            className="casing-item"
                            style={{
                                marginRight: `${idx * 8}px`
                            }}
                        >
                            <div className="casing-text">
                                <span className="casing-size">{profile.size}</span>
                                {profile.description && (
                                    <span className="casing-description">{profile.description}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {!readOnly && (
                    <IconButton 
                        size="small" 
                        onClick={onEdit} 
                        className="casing-edit-bottom-btn"
                        title="Edit Casing Profiles"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                )}
            </div>
        </div>
    );
};

export default CasingDiagram;