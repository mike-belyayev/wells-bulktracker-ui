// src/components/Dashboard/WellInformation.tsx
import { Paper, Typography, Divider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import './WellInformation.css';

export interface WellInformationProps {
    wellData?: {
        wellName?: string;
        waterDepth?: number;
        airGap?: number;
        casingProfiles?: CasingProfile[];
    };
}

export interface CasingProfile {
    id: string;
    label: string;
    mMD: number;
    mTVD: number;
    size: string;
    depth: number;
}

const WellInformation = ({ wellData }: WellInformationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(500);

    // Default mock data if none provided
    const defaultWellData = {
        wellName: "WELL B-07",
        waterDepth: 1245,
        airGap: 28,
        casingProfiles: [
            { id: '1', label: "36\" Conductor", size: "36\"", depth: 120, mMD: 120, mTVD: 120 },
            { id: '2', label: "28\" Casing", size: "28\"", depth: 450, mMD: 450, mTVD: 448 },
            { id: '3', label: "22\" Casing", size: "22\"", depth: 850, mMD: 850, mTVD: 845 },
            { id: '4', label: "16\" Casing", size: "16\"", depth: 1250, mMD: 1250, mTVD: 1240 },
            { id: '5', label: "7\" Liner Shoe", size: "7\"", depth: 1890, mMD: 1890, mTVD: 1875 }
        ]
    };

    // Safely access data with fallbacks
    const data = wellData || defaultWellData;
    let casingProfiles = data.casingProfiles || defaultWellData.casingProfiles;
    
    // Sort so deepest casing (largest depth) is on the left
    casingProfiles = [...casingProfiles].sort((a, b) => b.depth - a.depth);
    
    // Set custom depths for proportional sizing:
    // First casing (deepest) goes to 95% of section height
    // Last casing (shallowest) goes to ~20% of section height
    const adjustedProfiles = casingProfiles.map((profile, index) => {
        if (index === 0) {
            return { ...profile, adjustedDepth: 95 };
        } else {
            const total = casingProfiles.length - 1;
            const progress = index / total;
            const adjustedHeight = 95 - (progress * 75);
            return { ...profile, adjustedDepth: adjustedHeight };
        }
    });

    // Calculate dynamic scaling based on container size - Reduced scale factor
    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const height = containerRef.current.clientHeight;
                setContainerHeight(height);
                // Reduced scale factor - base at 400px height = 0.7 (was 1)
                const newScale = Math.max(0.5, Math.min(1.2, height / 550));
                setScale(newScale);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Dynamic font sizes based on scale - Reduced sizes
    const titleFontSize = `${Math.max(12, 14 * scale)}px`;
    const labelFontSize = `${Math.max(10, 12 * scale)}px`;
    const depthFontSize = `${Math.max(9, 10 * scale)}px`;
    const metadataFontSize = `${Math.max(10, 11 * scale)}px`;
    const lineWidth = Math.max(2, 2.5 * scale);
    const tipWidth = Math.max(10, 14 * scale);
    const labelLeftOffset = Math.max(12, 16 * scale);
    const labelPadding = Math.max(3, 5 * scale);
    const horizontalSpacing = Math.max(14, 18 * scale);
    const startLeft = Math.max(6, 10 * scale);

    return (
        <Paper className="info-panel" elevation={3}>
            <div className="panel-header">
                <Typography variant="h6" className="panel-title" style={{ fontSize: titleFontSize }}>
                    Well Information
                </Typography>
            </div>
            <Divider />
            <div className="panel-content" ref={containerRef}>
                {/* Well Metadata with dynamic font sizes */}
                <div className="well-metadata">
                    <div className="metadata-row">
                        <Typography variant="body2" className="metadata-label" style={{ fontSize: metadataFontSize }}>
                            Well Name:
                        </Typography>
                        <Typography variant="body2" className="metadata-value" style={{ fontSize: metadataFontSize }}>
                            {data.wellName || 'N/A'}
                        </Typography>
                    </div>
                    <div className="metadata-row">
                        <Typography variant="body2" className="metadata-label" style={{ fontSize: metadataFontSize }}>
                            Water Depth (m):
                        </Typography>
                        <Typography variant="body2" className="metadata-value" style={{ fontSize: metadataFontSize }}>
                            {data.waterDepth || 0}
                        </Typography>
                    </div>
                    <div className="metadata-row">
                        <Typography variant="body2" className="metadata-label" style={{ fontSize: metadataFontSize }}>
                            Air Gap (m):
                        </Typography>
                        <Typography variant="body2" className="metadata-value" style={{ fontSize: metadataFontSize }}>
                            {data.airGap || 0}
                        </Typography>
                    </div>
                </div>

                <Divider className="section-divider" />

                {/* Casing Profile Diagram */}
                <div className="casing-diagram-container">
                    <Typography variant="subtitle2" className="diagram-title" style={{ fontSize: titleFontSize }}>
                        Casing Profile
                    </Typography>
                    
                    <div className="diagram-wrapper" style={{ minHeight: `${containerHeight * 0.6}px` }}>
                        <div className="diagram-area" style={{ minHeight: `${containerHeight * 0.55}px` }}>
                            {adjustedProfiles && adjustedProfiles.map((profile, index) => {
                                const heightPercent = profile.adjustedDepth;
                                const leftPosition = startLeft + (index * horizontalSpacing);
                                
                                return (
                                    <div 
                                        key={profile.id}
                                        className="casing-string"
                                        style={{
                                            height: `${heightPercent}%`,
                                            top: '0%',
                                            left: `${leftPosition}px`,
                                        }}
                                    >
                                        <div className="casing-line" style={{ width: `${lineWidth}px` }} />
                                        <div className="casing-tip-flag" style={{
                                            borderLeft: `${tipWidth}px solid #000000`,
                                            borderTop: `${tipWidth * 0.35}px solid transparent`,
                                            borderBottom: `${tipWidth * 0.35}px solid transparent`,
                                            bottom: `${-lineWidth}px`,
                                            left: `${-lineWidth / 2}px`
                                        }} />
                                        <div className="casing-label" style={{
                                            bottom: `${-lineWidth * 1.5}px`,
                                            left: `${labelLeftOffset}px`,
                                            padding: `${labelPadding * 0.5}px ${labelPadding}px`
                                        }}>
                                            <Typography variant="caption" className="casing-size" style={{ fontSize: labelFontSize }}>
                                                {profile.size}
                                            </Typography>
                                            <Typography variant="caption" className="casing-depth" style={{ fontSize: depthFontSize }}>
                                                {profile.mMD}m MD ({profile.mTVD}m TVD)
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </Paper>
    );
};

export default WellInformation;