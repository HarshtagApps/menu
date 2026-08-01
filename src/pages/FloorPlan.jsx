import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import FloorPlanMap from '../components/FloorPlanMap';
import demoFloorPlan from '../data/floorPlans/demo.json';
import '../styles/styles.css';
import '../styles/floor-plan.css';

const FloorPlan = ({ restaurantData }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('r');
    const [selectedTable, setSelectedTable] = useState(null);

    const plan = useMemo(() => {
        const name = restaurantData?.restoDetails?.restoName;
        if (!name) return demoFloorPlan;
        return {
            ...demoFloorPlan,
            restaurantId: restaurantId || demoFloorPlan.restaurantId,
            name: `${name} Floor Plan`
        };
    }, [restaurantData, restaurantId]);

    if (!restaurantData) return null;

    const handleOpenSlots = () => {
        if (!selectedTable) return;
        navigate(
            `/reserve/table?r=${restaurantId}&table=${selectedTable.number}`
        );
    };

    return (
        <div className="floor-plan-page">
            <div className="secondary-appbar">
                <div className="appbar-content">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                    <div className="appbar-title">Floor Plan</div>
                </div>
                <div className="appbar-border"></div>
            </div>

            <div className="floor-plan-container">
                <p className="floor-plan-hint">
                    Tap a table to select it.
                </p>

                <div className="floor-plan-legend">
                    <div className="floor-plan-legend-item">
                        <span className="floor-plan-legend-swatch table" />
                        Tables
                    </div>
                    <div className="floor-plan-legend-item">
                        <span className="floor-plan-legend-swatch seating" />
                        Seating
                    </div>
                    <div className="floor-plan-legend-item">
                        <span className="floor-plan-legend-swatch counter" />
                        Counter
                    </div>
                    <div className="floor-plan-legend-item">
                        <span className="floor-plan-legend-swatch door" />
                        Entry / Washroom
                    </div>
                    <div className="floor-plan-legend-item">
                        <span className="floor-plan-legend-swatch stairs" />
                        Stairs
                    </div>
                </div>

                <div className="floor-plan-canvas-wrap">
                    <FloorPlanMap
                        plan={plan}
                        selectedTableId={selectedTable?.id}
                        onTableSelect={setSelectedTable}
                    />
                </div>

                {selectedTable ? (
                    <div className="floor-plan-detail">
                        <div className="floor-plan-detail-title">
                            Table {selectedTable.number}
                        </div>
                        <div className="floor-plan-detail-meta">
                            {selectedTable.seats} seats · {selectedTable.shape === 'round' ? 'Round' : 'Rectangle'}
                        </div>
                        <div className="floor-plan-detail-actions">
                            <button
                                type="button"
                                className="floor-plan-btn floor-plan-btn-secondary"
                                onClick={() => setSelectedTable(null)}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="floor-plan-btn floor-plan-btn-primary"
                                onClick={handleOpenSlots}
                            >
                                View time slots
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default FloorPlan;
