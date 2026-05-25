// src/components/Cargo/CargoView.tsx
import { useState } from 'react';
import { Typography, IconButton } from '@mui/material';
import { Add, Delete, CalendarToday, DeleteOutline, ChevronLeft, ChevronRight } from '@mui/icons-material';
import './CargoView.css';

export interface CargoItem {
    id: string;
    name: string;
}

export interface Boat {
    id: string;
    name: string;
    arrivalDate: string;
    containers: CargoItem[];
}

const CargoView = () => {
    const [boats, setBoats] = useState<Boat[]>([
        {
            id: '1',
            name: 'VOYAGER',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c1', name: 'Pipe' },
                { id: 'c2', name: 'Casing' }
            ]
        },
        {
            id: '2',
            name: 'PACIFIC',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c3', name: 'Barite' },
                { id: 'c4', name: 'Bentonite' }
            ]
        },
        {
            id: '3',
            name: 'ATLANTIC',
            arrivalDate: '2025-01-22',
            containers: [
                { id: 'c6', name: 'Fuel Oil' }
            ]
        }
    ]);

    const addContainer = (boatId: string) => {
        const newContainer: CargoItem = {
            id: Date.now().toString(),
            name: 'Cargo'
        };
        setBoats(boats.map(boat => 
            boat.id === boatId 
                ? { ...boat, containers: [...boat.containers, newContainer] }
                : boat
        ));
    };

    const removeContainer = (boatId: string, containerId: string) => {
        setBoats(boats.map(boat =>
            boat.id === boatId
                ? { ...boat, containers: boat.containers.filter(c => c.id !== containerId) }
                : boat
        ));
    };

    const updateContainerName = (boatId: string, containerId: string, name: string) => {
        setBoats(boats.map(boat =>
            boat.id === boatId
                ? {
                    ...boat,
                    containers: boat.containers.map(c =>
                        c.id === containerId ? { ...c, name } : c
                    )
                  }
                : boat
        ));
    };

    const addBoat = () => {
        const newBoat: Boat = {
            id: Date.now().toString(),
            name: 'NEW',
            arrivalDate: new Date().toISOString().split('T')[0],
            containers: []
        };
        setBoats([...boats, newBoat]);
    };

    const removeBoat = (boatId: string) => {
        setBoats(boats.filter(b => b.id !== boatId));
    };

    const groupedBoats = boats.reduce((groups, boat) => {
        const date = boat.arrivalDate;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(boat);
        return groups;
    }, {} as Record<string, Boat[]>);

    const sortedDates = Object.keys(groupedBoats).sort();

    return (
        <div className="cargo-bar">
            <div className="cargo-bar-header">
                <Typography className="cargo-bar-title">CARGO</Typography>
                <IconButton size="small" onClick={addBoat} className="cargo-add-boat-btn" title="Add vessel">
                    <Add fontSize="small" />
                </IconButton>
            </div>
            <div className="cargo-scroll-wrapper">
                <IconButton 
                    size="small" 
                    className="scroll-btn scroll-left" 
                    onClick={() => {
                        const container = document.querySelector('.cargo-scroll-container');
                        if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                >
                    <ChevronLeft fontSize="small" />
                </IconButton>
                <div className="cargo-scroll-container">
                    {sortedDates.map(date => (
                        <div key={date} className="cargo-date-group">
                            <div className="cargo-date-tag">
                                <CalendarToday className="cargo-date-icon" />
                                <span className="cargo-date-text">{date}</span>
                            </div>
                            <div className="cargo-boats-row">
                                {groupedBoats[date].map(boat => (
                                    <div key={boat.id} className="cargo-boat-card">
                                        <div className="cargo-boat-name">
                                            <span className="boat-name-text">{boat.name}</span>
                                            <IconButton
                                                size="small"
                                                onClick={() => removeBoat(boat.id)}
                                                className="cargo-remove-boat"
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </div>
                                        <div className="cargo-containers-row">
                                            {boat.containers.map(container => (
                                                <div key={container.id} className="cargo-container-chip">
                                                    <input
                                                        type="text"
                                                        value={container.name}
                                                        onChange={(e) => updateContainerName(boat.id, container.id, e.target.value)}
                                                        className="cargo-container-input"
                                                        placeholder="Cargo"
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeContainer(boat.id, container.id)}
                                                        className="cargo-remove-container"
                                                    >
                                                        <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <IconButton
                                                size="small"
                                                onClick={() => addContainer(boat.id)}
                                                className="cargo-add-container"
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <IconButton 
                    size="small" 
                    className="scroll-btn scroll-right" 
                    onClick={() => {
                        const container = document.querySelector('.cargo-scroll-container');
                        if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                >
                    <ChevronRight fontSize="small" />
                </IconButton>
            </div>
        </div>
    );
};

export default CargoView;