// src/components/Cargo/CargoView.tsx
import { useState } from 'react';
import { Paper, Typography, Divider, IconButton } from '@mui/material';
import { Add, Delete, CalendarToday, DeleteOutline, AddCircleOutline } from '@mui/icons-material';
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
            name: 'OCEAN VOYAGER',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c1', name: 'Drill Pipe 5" x 30ft' },
                { id: 'c2', name: 'Casing 9-5/8" BTC' }
            ]
        },
        {
            id: '2',
            name: 'PACIFIC STAR',
            arrivalDate: '2025-01-20',
            containers: [
                { id: 'c3', name: 'Barite 500mt' },
                { id: 'c4', name: 'Bentonite 300mt' },
                { id: 'c5', name: 'Cement Class G' }
            ]
        },
        {
            id: '3',
            name: 'ATLANTIC CARRIER',
            arrivalDate: '2025-01-22',
            containers: [
                { id: 'c6', name: 'Fuel Oil 1000bbl' },
                { id: 'c7', name: 'Base Oil 800bbl' }
            ]
        },
        {
            id: '4',
            name: 'ARCTIC SUPPLIER',
            arrivalDate: '2025-01-25',
            containers: [
                { id: 'c8', name: 'Mud Chemicals' }
            ]
        }
    ]);

    const addContainer = (boatId: string) => {
        const newContainer: CargoItem = {
            id: Date.now().toString(),
            name: 'New Cargo'
        };
        setBoats(boats.map(boat => 
            boat.id === boatId 
                ? { ...boat, containers: [newContainer, ...boat.containers] }
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
            name: 'NEW VESSEL',
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
        <Paper className="cargo-panel" elevation={3}>
            <div className="cargo-header">
                <Typography variant="h6" className="cargo-title">
                    SUPPLY VESSELS
                </Typography>
                <IconButton
                    size="small"
                    onClick={addBoat}
                    className="add-boat-icon-btn"
                    title="Add boat"
                >
                    <Add />
                </IconButton>
            </div>
            <Divider />
            <div className="cargo-content">
                {sortedDates.map(date => (
                    <div key={date} className="date-group">
                        <div className="date-header-full">
                            <CalendarToday className="date-icon" />
                            <Typography className="date-text">{date}</Typography>
                        </div>
                        <div className="boats-container">
                            {groupedBoats[date].map(boat => (
                                <div key={boat.id} className="boat-wrapper">
                                    <div className="containers-stack">
{boat.containers.map(container => (
    <div key={container.id} className="container-box">
        <textarea
            value={container.name}
            onChange={(e) => updateContainerName(boat.id, container.id, e.target.value)}
            className="container-text-input"
            placeholder="Cargo description"
            rows={1}
            style={{ resize: 'vertical' }}
        />
        <IconButton
            size="small"
            onClick={() => removeContainer(boat.id, container.id)}
            className="remove-container-icon"
        >
            <DeleteOutline fontSize="small" />
        </IconButton>
    </div>
))}
                                        {boat.containers.length === 0 && (
                                            <div className="empty-container-placeholder">
                                                <Typography className="empty-text">No cargo</Typography>
                                            </div>
                                        )}
                                    </div>
                                    <div className="boat-shape">
                                        <div className="boat-hull">
                                            <div className="boat-name-label">{boat.name}</div>
                                            <div className="boat-actions">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => addContainer(boat.id)}
                                                    className="add-cargo-icon"
                                                    title="Add cargo"
                                                >
                                                    <AddCircleOutline fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeBoat(boat.id)}
                                                    className="remove-boat-icon"
                                                    title="Remove boat"
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </div>
                                        <div className="boat-water"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Paper>
    );
};

export default CargoView;