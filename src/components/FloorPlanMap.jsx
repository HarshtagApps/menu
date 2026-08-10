import React from 'react';

/** Pseudo-3D side offset (plan units). Tables sit slightly higher than seats. */
const TABLE_EXTRUDE = { dx: 3, dy: 3.5 };
const SEAT_EXTRUDE = { dx: 2, dy: 2.5 };

const MultilineText = ({ label, x, y, className, lineHeight = 14 }) => {
    const lines = String(label || '').split('\n');
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    return lines.map((line, i) => (
        <text
            key={`${line}-${i}`}
            x={x}
            y={startY + i * lineHeight}
            textAnchor="middle"
            dominantBaseline="middle"
            className={className}
        >
            {line}
        </text>
    ));
};

/**
 * Top-down chair matching Canva style:
 * rounded corners toward table, flat back, backrest line.
 * Local coords: back at top, front (rounded) at bottom.
 */
const CanvaChair = ({ x, y, size, rotation = 0 }) => {
    const r = size * 0.42;
    const backY = y + size * 0.18;
    const pad = size * 0.14;
    const cx = x + size / 2;
    const cy = y + size / 2;

    const d = [
        `M ${x} ${y}`,
        `L ${x + size} ${y}`,
        `L ${x + size} ${y + size - r}`,
        `Q ${x + size} ${y + size} ${x + size - r} ${y + size}`,
        `L ${x + r} ${y + size}`,
        `Q ${x} ${y + size} ${x} ${y + size - r}`,
        'Z'
    ].join(' ');

    return (
        <g
            className="floor-plan-canva-chair"
            transform={`rotate(${rotation} ${cx} ${cy})`}
        >
            <path
                className="floor-plan-canva-extrude floor-plan-canva-extrude--seat"
                d={d}
                transform={`translate(${SEAT_EXTRUDE.dx} ${SEAT_EXTRUDE.dy})`}
            />
            <path className="floor-plan-canva-chair-body" d={d} />
            <line
                className="floor-plan-canva-chair-back"
                x1={x + pad}
                y1={backY}
                x2={x + size - pad}
                y2={backY}
            />
        </g>
    );
};

/** Round table + 4 chairs (N/E/S/W) like the Canva reference. */
const RoundTableWithChairs = ({ table, selected }) => {
    const cx = table.x + table.width / 2;
    const cy = table.y + table.height / 2;
    const radius = Math.min(table.width, table.height) / 2;
    const chairSize = radius * 1.05;
    const gap = radius * 0.14;
    const offset = radius + gap + chairSize / 2;

    const chairs = [
        { key: 'n', x: cx - chairSize / 2, y: cy - offset - chairSize / 2, rotation: 0 },
        { key: 'e', x: cx + offset - chairSize / 2, y: cy - chairSize / 2, rotation: 90 },
        { key: 's', x: cx - chairSize / 2, y: cy + offset - chairSize / 2, rotation: 180 },
        { key: 'w', x: cx - offset - chairSize / 2, y: cy - chairSize / 2, rotation: 270 }
    ];

    const patternId = `table-chevron-${table.id}`;

    return (
        <g className={`floor-plan-round-set${selected ? ' is-selected' : ''}`}>
            <defs>
                <pattern
                    id={patternId}
                    width="10"
                    height="8"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M0 6 L5 2 L10 6"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </pattern>
            </defs>

            {chairs.map((c) => (
                <CanvaChair key={c.key} x={c.x} y={c.y} size={chairSize} rotation={c.rotation} />
            ))}

            <circle
                className="floor-plan-canva-extrude floor-plan-canva-extrude--table"
                cx={cx + TABLE_EXTRUDE.dx}
                cy={cy + TABLE_EXTRUDE.dy}
                r={radius}
            />
            <circle
                className="floor-plan-canva-table"
                cx={cx}
                cy={cy}
                r={radius}
            />
            <circle
                className="floor-plan-canva-table-pattern"
                cx={cx}
                cy={cy}
                r={radius - 3}
                fill={`url(#${patternId})`}
            />

            <circle
                cx={cx}
                cy={cy}
                r={20}
                className="floor-plan-number-circle"
            />
            <MultilineText
                label={`${table.number}`}
                x={cx}
                y={cy}
                className="floor-plan-table-number floor-plan-canva-table-label"
                lineHeight={16}
            />
        </g>
    );
};

/**
 * Booth set: chevron table + bench(es).
 * Horizontal (T1–T3): benches above/below.
 * Vertical one-sided (T6): bench on left or right only.
 */
const RectBoothTable = ({ table, selected }) => {
    const cx = table.x + table.width / 2;
    const cy = table.y + table.height / 2;
    const patternId = `booth-chevron-${table.id}`;
    const rx = 4;
    const isVertical = table.height > table.width;
    const seats = table.seating || [];

    const renderBench = (bench, side) => {
        const { x, y, width: w, height: h } = bench;
        const r = Math.min(5, (side === 'left' || side === 'right' ? w : h) * 0.35);
        const linePadH = w * 0.06;
        const linePadV = h * 0.06;

        let d;
        let backLine;

        if (side === 'top') {
            const backY = y + Math.max(4, h * 0.28);
            d = [
                `M ${x} ${y}`,
                `L ${x + w} ${y}`,
                `L ${x + w} ${y + h - r}`,
                `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
                `L ${x + r} ${y + h}`,
                `Q ${x} ${y + h} ${x} ${y + h - r}`,
                'Z'
            ].join(' ');
            backLine = { x1: x + linePadH, y1: backY, x2: x + w - linePadH, y2: backY };
        } else if (side === 'bottom') {
            const backY = y + h - Math.max(4, h * 0.28);
            d = [
                `M ${x + r} ${y}`,
                `L ${x + w - r} ${y}`,
                `Q ${x + w} ${y} ${x + w} ${y + r}`,
                `L ${x + w} ${y + h}`,
                `L ${x} ${y + h}`,
                `L ${x} ${y + r}`,
                `Q ${x} ${y} ${x + r} ${y}`,
                'Z'
            ].join(' ');
            backLine = { x1: x + linePadH, y1: backY, x2: x + w - linePadH, y2: backY };
        } else if (side === 'left') {
            // Sharp on outer left (back); rounded on right (toward table)
            const backX = x + Math.max(4, w * 0.28);
            d = [
                `M ${x} ${y}`,
                `L ${x + w - r} ${y}`,
                `Q ${x + w} ${y} ${x + w} ${y + r}`,
                `L ${x + w} ${y + h - r}`,
                `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
                `L ${x} ${y + h}`,
                'Z'
            ].join(' ');
            backLine = { x1: backX, y1: y + linePadV, x2: backX, y2: y + h - linePadV };
        } else {
            // right: sharp on outer right; rounded on left (toward table)
            const backX = x + w - Math.max(4, w * 0.28);
            d = [
                `M ${x + r} ${y}`,
                `L ${x + w} ${y}`,
                `L ${x + w} ${y + h}`,
                `L ${x + r} ${y + h}`,
                `Q ${x} ${y + h} ${x} ${y + h - r}`,
                `L ${x} ${y + r}`,
                `Q ${x} ${y} ${x + r} ${y}`,
                'Z'
            ].join(' ');
            backLine = { x1: backX, y1: y + linePadV, x2: backX, y2: y + h - linePadV };
        }

        return (
            <g className="floor-plan-canva-bench">
                <path
                    className="floor-plan-canva-extrude floor-plan-canva-extrude--seat"
                    d={d}
                    transform={`translate(${SEAT_EXTRUDE.dx} ${SEAT_EXTRUDE.dy})`}
                />
                <path className="floor-plan-canva-bench-body" d={d} />
                <line
                    className="floor-plan-canva-bench-back"
                    x1={backLine.x1}
                    y1={backLine.y1}
                    x2={backLine.x2}
                    y2={backLine.y2}
                />
            </g>
        );
    };

    let benches = [];
    if (isVertical) {
        const seat = seats[0];
        if (seat) {
            const seatMid = seat.x + seat.width / 2;
            const side = seatMid < cx ? 'left' : 'right';
            benches = [{ bench: seat, side }];
        } else if (table.seatingSide && table.seatingSide !== 'none') {
            const benchW = Math.max(36, table.width * 0.55);
            const gap = 8;
            const side = table.seatingSide === 'right' ? 'right' : 'left';
            const bench =
                side === 'left'
                    ? { x: table.x - gap - benchW, y: table.y, width: benchW, height: table.height }
                    : { x: table.x + table.width + gap, y: table.y, width: benchW, height: table.height };
            benches = [{ bench, side }];
        }
    } else if (seats.length >= 2) {
        const sorted = [...seats].sort((a, b) => a.y - b.y);
        benches = [
            { bench: sorted[0], side: 'top' },
            { bench: sorted[sorted.length - 1], side: 'bottom' }
        ];
    } else if (seats.length === 1) {
        const seat = seats[0];
        const seatMidY = seat.y + seat.height / 2;
        const side = seatMidY < cy ? 'top' : 'bottom';
        benches = [{ bench: seat, side }];
    } else {
        const benchH = Math.max(22, table.height * 0.4);
        const gap = 8;
        benches = [
            {
                bench: { x: table.x, y: table.y - gap - benchH, width: table.width, height: benchH },
                side: 'top'
            },
            {
                bench: { x: table.x, y: table.y + table.height + gap, width: table.width, height: benchH },
                side: 'bottom'
            }
        ];
    }

    return (
        <g className={`floor-plan-booth-set${selected ? ' is-selected' : ''}`}>
            <defs>
                <pattern
                    id={patternId}
                    width="10"
                    height="8"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M0 6 L5 2 L10 6"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </pattern>
            </defs>

            {benches.map(({ bench, side }) => (
                <React.Fragment key={side}>{renderBench(bench, side)}</React.Fragment>
            ))}

            <rect
                className="floor-plan-canva-extrude floor-plan-canva-extrude--table"
                x={table.x + TABLE_EXTRUDE.dx}
                y={table.y + TABLE_EXTRUDE.dy}
                width={table.width}
                height={table.height}
                rx={rx}
                ry={rx}
            />
            <rect
                className="floor-plan-canva-table floor-plan-canva-table--rect"
                x={table.x}
                y={table.y}
                width={table.width}
                height={table.height}
                rx={rx}
                ry={rx}
            />
            <rect
                className="floor-plan-canva-table-pattern"
                x={table.x + 3}
                y={table.y + 3}
                width={table.width - 6}
                height={table.height - 6}
                rx={Math.max(2, rx - 1)}
                ry={Math.max(2, rx - 1)}
                fill={`url(#${patternId})`}
            />

            {isVertical ? (
                <>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={20}
                        className="floor-plan-number-circle"
                    />
                    <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="floor-plan-table-number floor-plan-canva-table-label"
                        transform={`rotate(-90 ${cx} ${cy})`}
                    >
                        {`${table.number}`}
                    </text>
                </>
            ) : (
                <>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={20}
                        className="floor-plan-number-circle"
                    />
                    <MultilineText
                        label={`${table.number}`}
                        x={cx}
                        y={cy}
                        className="floor-plan-table-number floor-plan-canva-table-label"
                        lineHeight={15}
                    />
                </>
            )}
        </g>
    );
};

/**
 * Renders DEMO.pdf-style floor plan from JSON.
 * Edge pieces sit flush against walls.
 */
const FloorPlanMap = ({ plan, selectedTableId, onTableSelect }) => {
    if (!plan?.viewBox || !plan?.room) return null;

    const room = plan.room;
    const wallT = plan.wallThickness || 14;
    const innerX = room.x + wallT / 2;
    const innerY = room.y + wallT / 2;
    const innerW = room.width - wallT;
    const innerH = room.height - wallT;

    // Crop to floor content so the map fills the white container
    const stairs = plan.stairs || [];
    const doors = plan.doors || [];
    const pad = 20;
    let minX = room.x;
    let minY = room.y;
    let maxX = room.x + room.width;
    let maxY = room.y + room.height;
    stairs.forEach((s) => {
        minX = Math.min(minX, s.x);
        maxX = Math.max(maxX, s.x + s.width);
        maxY = Math.max(maxY, s.y + s.height + 18);
    });
    doors.forEach((d) => {
        minX = Math.min(minX, d.x);
        minY = Math.min(minY, d.y);
        maxX = Math.max(maxX, d.x + d.width);
        maxY = Math.max(maxY, d.y + d.height);
    });
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = maxX - minX + pad * 2;
    const vbH = maxY - minY + pad * 2;

    return (
        <svg
            className="floor-plan-svg"
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={plan.name || 'Restaurant floor plan'}
        >
            <defs>
                <filter
                    id="floor-plan-shadow-table"
                    x="-30%"
                    y="-30%"
                    width="160%"
                    height="160%"
                >
                    <feDropShadow
                        dx="3"
                        dy="4"
                        stdDeviation="3.5"
                        floodColor="#000000"
                        floodOpacity="0.28"
                    />
                </filter>
                <filter
                    id="floor-plan-shadow-seat"
                    x="-35%"
                    y="-35%"
                    width="170%"
                    height="170%"
                >
                    <feDropShadow
                        dx="2"
                        dy="2.5"
                        stdDeviation="2.5"
                        floodColor="#000000"
                        floodOpacity="0.22"
                    />
                </filter>
                <filter
                    id="floor-plan-shadow-zone"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                >
                    <feDropShadow
                        dx="2"
                        dy="3"
                        stdDeviation="2.5"
                        floodColor="#000000"
                        floodOpacity="0.2"
                    />
                </filter>

                <pattern
                    id="floor-plan-floor-texture"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                >
                    <rect width="28" height="28" fill="#D9D9D9" />
                    <path
                        d="M0 28 L28 0"
                        fill="none"
                        stroke="#C0C0C0"
                        strokeWidth="0.9"
                    />
                    <path
                        d="M-8 28 L20 0 M8 28 L36 0"
                        fill="none"
                        stroke="#D0D0D0"
                        strokeWidth="0.6"
                    />
                    <circle cx="8" cy="12" r="0.7" fill="#B8B8B8" />
                    <circle cx="20" cy="20" r="0.55" fill="#C8C8C8" />
                </pattern>

                <linearGradient id="floor-plan-seat-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFDF8" />
                    <stop offset="45%" stopColor="#F7F0E4" />
                    <stop offset="100%" stopColor="#EDE3D2" />
                </linearGradient>

                <linearGradient id="floor-plan-table-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5EDE3" />
                    <stop offset="50%" stopColor="#E8D9C8" />
                    <stop offset="100%" stopColor="#D9C4AE" />
                </linearGradient>

                <linearGradient id="floor-plan-table-fill-selected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-tint)" />
                    <stop offset="45%" stopColor="var(--primary-color)" />
                    <stop offset="100%" stopColor="var(--primary-dark)" />
                </linearGradient>

                <linearGradient id="floor-plan-seat-fill-selected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-soft)" />
                    <stop offset="45%" stopColor="var(--primary-tint-strong)" />
                    <stop offset="100%" stopColor="var(--primary-color)" />
                </linearGradient>

                <linearGradient id="floor-plan-counter-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFCC80" />
                    <stop offset="55%" stopColor="#FF9800" />
                    <stop offset="100%" stopColor="#EF6C00" />
                </linearGradient>

                <linearGradient id="floor-plan-door-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#BBDEFB" />
                    <stop offset="100%" stopColor="#64B5F6" />
                </linearGradient>

                <linearGradient id="floor-plan-stair-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#555555" />
                    <stop offset="100%" stopColor="#2A2A2A" />
                </linearGradient>
            </defs>

            <rect
                className="floor-plan-floor"
                x={innerX}
                y={innerY}
                width={innerW}
                height={innerH}
            />

            <rect
                className="floor-plan-outer-wall"
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill="none"
                strokeWidth={wallT}
            />

            {(plan.stairs || []).map((step) => (
                <g key={step.id}>
                    <rect
                        className="floor-plan-canva-extrude floor-plan-canva-extrude--seat"
                        x={step.x + 2}
                        y={step.y + 2.5}
                        width={step.width}
                        height={step.height}
                        rx="2"
                    />
                    <rect
                        className="floor-plan-stair"
                        x={step.x}
                        y={step.y}
                        width={step.width}
                        height={step.height}
                        rx="2"
                    />
                </g>
            ))}
            {(plan.stairs || []).length > 0 && (
                <text
                    x={(plan.stairs[0].x + plan.stairs[0].width / 2)}
                    y={plan.stairs[plan.stairs.length - 1].y + plan.stairs[0].height + 16}
                    textAnchor="middle"
                    className="floor-plan-stair-label"
                >
                    STAIRS
                </text>
            )}

            {(plan.zones || []).map((zone) => (
                <g key={zone.id} className={`floor-plan-zone floor-plan-zone--${zone.type}`}>
                    <rect
                        className="floor-plan-zone-extrude"
                        x={zone.x + 3}
                        y={zone.y + 3.5}
                        width={zone.width}
                        height={zone.height}
                    />
                    <rect
                        className="floor-plan-zone-face"
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                    />
                    <MultilineText
                        label={zone.label}
                        x={zone.x + zone.width / 2}
                        y={zone.y + zone.height / 2}
                        className="floor-plan-zone-label"
                        lineHeight={18}
                    />
                </g>
            ))}

            {(plan.walls || []).map((wall) => (
                <line
                    key={wall.id}
                    className="floor-plan-wall"
                    x1={wall.x1}
                    y1={wall.y1}
                    x2={wall.x2}
                    y2={wall.y2}
                    strokeWidth={wallT}
                />
            ))}

            {(plan.doors || []).map((door) => (
                <g key={door.id} className={`floor-plan-door floor-plan-door--${door.type}`}>
                    <rect
                        className="floor-plan-door-extrude"
                        x={door.x + 2}
                        y={door.y + 2.5}
                        width={door.width}
                        height={door.height}
                    />
                    <rect
                        className="floor-plan-door-face"
                        x={door.x}
                        y={door.y}
                        width={door.width}
                        height={door.height}
                    />
                    <MultilineText
                        label={door.label}
                        x={door.x + door.width / 2}
                        y={door.y + door.height / 2}
                        className="floor-plan-door-label"
                        lineHeight={16}
                    />
                </g>
            ))}

            {(plan.windows || []).map((window) => (
                <g key={window.id} className="floor-plan-window-set">
                    <rect
                        className="floor-plan-door-extrude"
                        x={window.x + 2}
                        y={window.y + 2.5}
                        width={window.width}
                        height={window.height}
                    />
                    <rect
                        className="floor-plan-window"
                        x={window.x}
                        y={window.y}
                        width={window.width}
                        height={window.height}
                    />
                </g>
            ))}

            {(plan.tables || []).map((table) => {
                const selected = selectedTableId === table.id;
                const cx = table.x + table.width / 2;
                const cy = table.y + table.height / 2;
                const useCanvaRound =
                    table.shape === 'round' &&
                    (table.seatingLayout === 'cross' || table.seats >= 4);
                const useCanvaBooth =
                    table.shape === 'rect' &&
                    (table.seatingLayout === 'booth' ||
                        ((table.seating?.length ?? 0) >= 1 &&
                            (table.width >= table.height
                                ? (table.seating?.length ?? 0) >= 2
                                : true)));

                return (
                    <g
                        key={table.id}
                        className={`floor-plan-table-group${selected ? ' is-selected' : ''}`}
                        onClick={() => onTableSelect?.(table)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onTableSelect?.(table);
                            }
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {useCanvaRound ? (
                            <RoundTableWithChairs table={table} selected={selected} />
                        ) : useCanvaBooth ? (
                            <RectBoothTable table={table} selected={selected} />
                        ) : (
                            <>
                                {(table.seating || []).map((seat, idx) => (
                                    <g key={`${table.id}-seat-${idx}`}>
                                        <rect
                                            className="floor-plan-canva-extrude floor-plan-canva-extrude--seat"
                                            x={seat.x + SEAT_EXTRUDE.dx}
                                            y={seat.y + SEAT_EXTRUDE.dy}
                                            width={seat.width}
                                            height={seat.height}
                                        />
                                        <rect
                                            className="floor-plan-seating"
                                            x={seat.x}
                                            y={seat.y}
                                            width={seat.width}
                                            height={seat.height}
                                        />
                                        {seat.label ? (
                                            <MultilineText
                                                label={seat.label}
                                                x={seat.x + seat.width / 2}
                                                y={seat.y + seat.height / 2}
                                                className="floor-plan-seating-label"
                                                lineHeight={12}
                                            />
                                        ) : null}
                                    </g>
                                ))}

                                {table.shape === 'round' ? (
                                    <>
                                        <ellipse
                                            className="floor-plan-canva-extrude floor-plan-canva-extrude--table"
                                            cx={cx + TABLE_EXTRUDE.dx}
                                            cy={cy + TABLE_EXTRUDE.dy}
                                            rx={table.width / 2}
                                            ry={table.height / 2}
                                        />
                                        <ellipse
                                            className="floor-plan-table"
                                            cx={cx}
                                            cy={cy}
                                            rx={table.width / 2}
                                            ry={table.height / 2}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <rect
                                            className="floor-plan-canva-extrude floor-plan-canva-extrude--table"
                                            x={table.x + TABLE_EXTRUDE.dx}
                                            y={table.y + TABLE_EXTRUDE.dy}
                                            width={table.width}
                                            height={table.height}
                                        />
                                        <rect
                                            className="floor-plan-table"
                                            x={table.x}
                                            y={table.y}
                                            width={table.width}
                                            height={table.height}
                                        />
                                    </>
                                )}

                                {table.labelMode === 'vertical' ? (
                                    <>
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={20}
                                            className="floor-plan-number-circle"
                                        />
                                        <text
                                            x={cx}
                                            y={cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className="floor-plan-table-number"
                                            transform={`rotate(-90 ${cx} ${cy})`}
                                        >
                                            {`${table.number}`}
                                        </text>
                                    </>
                                ) : (
                                    <>
                                        <circle
                                            cx={cx}
                                            cy={cy}
                                            r={20}
                                            className="floor-plan-number-circle"
                                        />
                                        <MultilineText
                                            label={`${table.number}`}
                                            x={cx}
                                            y={cy}
                                            className="floor-plan-table-number"
                                            lineHeight={16}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default FloorPlanMap;
