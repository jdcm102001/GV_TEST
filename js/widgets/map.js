/**
 * map.js - Mapbox Maritime Routes Widget for GV_TEST
 */

const MapWidget = {
    // Mapbox instance
    map: null,
    mapSimple: null,

    // Route layers
    routeLayers: [],

    // Port coordinates
    ports: {
        'Callao': [-77.1278, -12.0464],
        'Valparaiso': [-71.6273, -33.0458],
        'Shanghai': [121.4737, 31.2304],
        'Houston': [-95.3698, 29.7604],
        'Rotterdam': [4.4777, 51.9244],
        'Durban': [31.0218, -29.8587],
        'Mumbai': [72.8777, 19.0760]
    },

    // Route definitions
    routes: {
        'callao_shanghai': {
            id: 'callao_shanghai',
            from: 'Callao',
            to: 'Shanghai',
            waypoints: [
                [-77.1278, -12.0464],   // Callao
                [-90, -5],               // Pacific waypoint
                [-120, 0],               // Mid Pacific
                [-150, 10],              // Central Pacific
                [-180, 15],              // Date line
                [150, 20],               // Western Pacific
                [121.4737, 31.2304]      // Shanghai
            ],
            color: '#17bf63',
            transitDays: 35
        },
        'callao_houston': {
            id: 'callao_houston',
            from: 'Callao',
            to: 'Houston',
            waypoints: [
                [-77.1278, -12.0464],   // Callao
                [-80, 0],                // Panama approach
                [-82, 10],               // Caribbean
                [-90, 20],               // Gulf of Mexico
                [-95.3698, 29.7604]      // Houston
            ],
            color: '#1da1f2',
            transitDays: 15
        },
        'valparaiso_houston': {
            id: 'valparaiso_houston',
            from: 'Valparaiso',
            to: 'Houston',
            waypoints: [
                [-71.6273, -33.0458],   // Valparaiso
                [-75, -20],              // Chile coast
                [-80, -5],               // Ecuador
                [-82, 10],               // Panama
                [-90, 20],               // Gulf
                [-95.3698, 29.7604]      // Houston
            ],
            color: '#7856ff',
            transitDays: 12
        },
        'durban_rotterdam': {
            id: 'durban_rotterdam',
            from: 'Durban',
            to: 'Rotterdam',
            waypoints: [
                [31.0218, -29.8587],    // Durban
                [20, -35],               // Cape of Good Hope
                [0, -10],                // Atlantic
                [-10, 20],               // West Africa
                [-5, 40],                // Portugal
                [4.4777, 51.9244]        // Rotterdam
            ],
            color: '#ffad1f',
            transitDays: 20
        },
        'callao_rotterdam': {
            id: 'callao_rotterdam',
            from: 'Callao',
            to: 'Rotterdam',
            waypoints: [
                [-77.1278, -12.0464],   // Callao
                [-80, 10],               // Panama
                [-60, 20],               // Caribbean
                [-40, 30],               // Mid Atlantic
                [-10, 45],               // Portugal
                [4.4777, 51.9244]        // Rotterdam
            ],
            color: '#e0245e',
            transitDays: 25
        }
    },

    /**
     * Initialize map widget
     */
    init() {
        this.initMap('map-standard');

        // Init simplified map if in Tier 1
        if (isSimplifiedLayout()) {
            this.initMap('map-simple', true);
        }

        console.log('[MapWidget] Initialized');
    },

    /**
     * Initialize a Mapbox map instance
     * @param {string} containerId
     * @param {boolean} isSimple
     */
    initMap(containerId, isSimple = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        mapboxgl.accessToken = GameConfig.mapbox.token;

        const map = new mapboxgl.Map({
            container: containerId,
            style: GameConfig.mapbox.style,
            center: isSimple ? [60, 5] : GameConfig.mapbox.center,
            zoom: isSimple ? 1.5 : GameConfig.mapbox.zoom,
            projection: 'mercator'
        });

        map.on('load', () => {
            this.addPortMarkers(map, isSimple);

            if (isSimple) {
                // For simplified view, just show the main route
                this.addRoute(map, this.routes['callao_shanghai']);
            } else {
                // Add all enabled routes
                this.addEnabledRoutes(map);
            }
        });

        if (isSimple) {
            this.mapSimple = map;
        } else {
            this.map = map;
        }
    },

    /**
     * Add port markers to map
     * @param {Object} map
     * @param {boolean} isSimple
     */
    addPortMarkers(map, isSimple) {
        const enabledPorts = isSimple ?
            ['Callao', 'Shanghai'] :
            this.getEnabledPorts();

        enabledPorts.forEach(portName => {
            const coords = this.ports[portName];
            if (!coords) return;

            // Create marker element
            const el = document.createElement('div');
            el.className = 'port-marker';
            el.innerHTML = `
                <div class="port-dot"></div>
                <div class="port-label">${portName}</div>
            `;

            new mapboxgl.Marker(el)
                .setLngLat(coords)
                .addTo(map);
        });
    },

    /**
     * Get enabled ports based on current tier
     * @returns {Array}
     */
    getEnabledPorts() {
        const config = getActiveConfig();
        const ports = new Set();

        // Get ports from enabled suppliers
        config.content.suppliers.forEach(supplierId => {
            const profile = getSupplierProfile(supplierId);
            if (profile && profile.port) {
                ports.add(profile.port);
            }
        });

        // Get ports from enabled buyers
        config.content.buyers.forEach(buyerId => {
            const profile = getBuyerProfile(buyerId);
            if (profile && profile.port) {
                ports.add(profile.port);
            }
        });

        return Array.from(ports);
    },

    /**
     * Add all enabled routes to map
     * @param {Object} map
     */
    addEnabledRoutes(map) {
        const config = getActiveConfig();
        const enabledRoutes = config.content.routes === 'all' ?
            Object.keys(this.routes) :
            config.content.routes;

        enabledRoutes.forEach(routeId => {
            const route = this.routes[routeId];
            if (route) {
                this.addRoute(map, route);
            }
        });
    },

    /**
     * Add a route to the map
     * @param {Object} map
     * @param {Object} route
     */
    addRoute(map, route) {
        const sourceId = `route-${route.id}`;
        const layerId = `route-line-${route.id}`;

        // Create GeoJSON for the route
        const geojson = {
            type: 'Feature',
            properties: {
                name: `${route.from} to ${route.to}`
            },
            geometry: {
                type: 'LineString',
                coordinates: route.waypoints
            }
        };

        // Add source
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: geojson
            });
        }

        // Add layer
        if (!map.getLayer(layerId)) {
            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': route.color,
                    'line-width': 2,
                    'line-opacity': 0.7,
                    'line-dasharray': [2, 2]
                }
            });
        }

        this.routeLayers.push(layerId);
    },

    /**
     * Animate a ship along a route
     * @param {string} routeId
     * @param {number} progress - 0 to 1
     */
    animateShip(routeId, progress) {
        const route = this.routes[routeId];
        if (!route) return;

        // Calculate position along route
        const position = this.interpolateRoute(route.waypoints, progress);

        // Update or create ship marker
        this.updateShipMarker(position, route.id);
    },

    /**
     * Interpolate position along route
     * @param {Array} waypoints
     * @param {number} progress
     * @returns {Array} [lng, lat]
     */
    interpolateRoute(waypoints, progress) {
        if (progress <= 0) return waypoints[0];
        if (progress >= 1) return waypoints[waypoints.length - 1];

        const totalSegments = waypoints.length - 1;
        const segmentProgress = progress * totalSegments;
        const segmentIndex = Math.floor(segmentProgress);
        const segmentFraction = segmentProgress - segmentIndex;

        const start = waypoints[segmentIndex];
        const end = waypoints[Math.min(segmentIndex + 1, waypoints.length - 1)];

        return [
            start[0] + (end[0] - start[0]) * segmentFraction,
            start[1] + (end[1] - start[1]) * segmentFraction
        ];
    },

    /**
     * Update ship marker position
     * @param {Array} position
     * @param {string} routeId
     */
    updateShipMarker(position, routeId) {
        const markerId = `ship-${routeId}`;
        let marker = document.getElementById(markerId);

        if (!marker) {
            marker = document.createElement('div');
            marker.id = markerId;
            marker.className = 'ship-marker';
            marker.innerHTML = '🚢';

            // Add to both maps if they exist
            if (this.map) {
                new mapboxgl.Marker(marker)
                    .setLngLat(position)
                    .addTo(this.map);
            }
            if (this.mapSimple) {
                const markerSimple = marker.cloneNode(true);
                markerSimple.id = `${markerId}-simple`;
                new mapboxgl.Marker(markerSimple)
                    .setLngLat(position)
                    .addTo(this.mapSimple);
            }
        }
    },

    /**
     * Update map based on current positions
     */
    update() {
        const positions = GameState.getPhysicalPositions();

        positions.forEach(pos => {
            if (pos.route && pos.status === 'in_transit') {
                const routeId = pos.route;
                const route = this.routes[routeId];

                if (route) {
                    const daysElapsed = GameState.getCurrentMonthIndex() - pos.buyMonth;
                    const progress = Math.min(1, daysElapsed * 30 / route.transitDays);
                    this.animateShip(routeId, progress);
                }
            }
        });
    },

    /**
     * Resize maps (call when layout changes)
     */
    resize() {
        if (this.map) {
            this.map.resize();
        }
        if (this.mapSimple) {
            this.mapSimple.resize();
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapWidget;
}
