// src/components/Dashboard/CasingDiagram.tsx
import { Typography, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import type { CasingProfile } from '../../utils/casingDiagramUtils';
import './CasingDiagram.css';

interface CasingDiagramProps {
    profiles: CasingProfile[];
    onEdit: () => void;
    readOnly?: boolean;
    containerHeight?: number;  // Add this prop
}

const CasingDiagram = ({ profiles, onEdit, readOnly = false, containerHeight = 300 }: CasingDiagramProps) => {
    const diagramHeight = Math.max(200, containerHeight);
    
    if (profiles.length === 0) {
        return (
            <div className="casing-diagram-container">
                <div className="diagram-wrapper" style={{ minHeight: `${diagramHeight}px` }}>
                    <div className="empty-diagram">
                        <Typography variant="body2" color="textSecondary">
                            No casing profiles defined.
                        </Typography>
                    </div>
                    {!readOnly && (
                        <IconButton 
                            size="small" 
                            onClick={onEdit} 
                            className="casing-edit-top-btn"
                            title="Edit Casing Profiles"
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    )}
                </div>
            </div>
        );
    }
    
    // Keep original order: shallowest at top, deepest at bottom
    const orderedProfiles = [...profiles];
    const total = orderedProfiles.length;
    
    return (
        <div className="casing-diagram-container">
            <div className="diagram-wrapper" style={{ minHeight: `${diagramHeight}px` }}>
                {/* Edit button at top right */}
                {!readOnly && (
                    <IconButton 
                        size="small" 
                        onClick={onEdit} 
                        className="casing-edit-top-btn"
                        title="Edit Casing Profiles"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                )}
                
                <div className="casing-stack">
                    {orderedProfiles.map((profile, idx) => {
                        // Calculate offset from bottom: deepest (last) gets 0px, each above gets +12px
                        const distanceFromBottom = total - 1 - idx;
                        const offset = distanceFromBottom * 12;
                        
                        return (
                            <div 
                                key={profile.index}
                                className="casing-row"
                                style={{
                                    marginLeft: `${offset}px`,
                                    zIndex: total - idx
                                }}
                            >
                                {idx < total - 1 && <div className="casing-dotted-border" />}
                                
                                {/* Vertical line with tip sticking to the right */}
                                <div className={`casing-line-container ${profile.type}`}>
                                    <div className="casing-vertical-line" />
                                    <div className="casing-line-tip" />
                                </div>
                                
                                {/* Text label at bottom right */}
                                <div className="casing-text">
                                    <span className="casing-size">{profile.size}</span>
                                    {profile.description && (
                                        <span className="casing-description">{profile.description}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CasingDiagram;