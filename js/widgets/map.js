/**
 * map.js - Mapbox Maritime Routes Widget for GV_TEST
 *
 * Handles:
 * - Map initialization with proper world-wrapping
 * - Maritime route rendering with antimeridian handling
 * - Port markers
 * - Ship animation along routes
 */

const MapWidget = {
    // Mapbox instance
    map: null,
    mapSimple: null,

    // Ship markers
    shipMarkers: {},

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
        'Mumbai': [72.8777, 19.0760],
        'Ningbo': [121.5440, 29.8683],
        'Busan': [129.0756, 35.1796],
        'Singapore': [103.8198, 1.3521]
    },

    // Route definitions - using continuous coordinates for antimeridian handling
    // For westward Pacific routes, we continue past -180 using negative values
    routes: {
        'callao_shanghai': {
            id: 'callao_shanghai',
            from: 'Callao',
            to: 'Shanghai',
            // Going WEST across Pacific - use continuous negative longitude
            waypoints: [
                [-77.1278, -12.0464],   // Callao, Peru
                [-100, -5],              // Eastern Pacific
                [-130, 5],               // Central Pacific
                [-160, 15],              // Western Pacific approach
                [-180, 20],              // Date line
                [-210, 25],              // Continuing west (same as 150°E)
                [-238.53, 31.23]         // Shanghai (121.47°E as -238.53)
            ],
            color: '#17bf63',
            transitDays: 35
        },
        'valparaiso_shanghai': {
            id: 'valparaiso_shanghai',
            from: 'Valparaiso',
            to: 'Shanghai',
            waypoints: [
                [-71.6273, -33.0458],   // Valparaiso, Chile
                [-100, -20],             // Southeast Pacific
                [-140, -5],              // Central Pacific
                [-170, 10],              // Western Pacific
                [-200, 20],              // Continuing west
                [-238.53, 31.23]         // Shanghai
            ],
            color: '#17bf63',
            transitDays: 33
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
        'durban_shanghai': {
            id: 'durban_shanghai',
            from: 'Durban',
            to: 'Shanghai',
            // Going east from Africa to Asia
            waypoints: [
                [31.0218, -29.8587],    // Durban
                [50, -15],               // Indian Ocean
                [75, 0],                 // Central Indian Ocean
                [95, 10],                // Bay of Bengal
                [110, 20],               // South China Sea
                [121.4737, 31.2304]      // Shanghai
            ],
            color: '#17bf63',
            transitDays: 25
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
        },
        'durban_mumbai': {
            id: 'durban_mumbai',
            from: 'Durban',
            to: 'Mumbai',
            waypoints: [
                [31.0218, -29.8587],    // Durban
                [45, -15],               // Mozambique Channel
                [55, 0],                 // Indian Ocean
                [65, 12],                // Arabian Sea
                [72.8777, 19.0760]       // Mumbai
            ],
            color: '#9c27b0',
            transitDays: 15
        }
    },

    /**
     * Initialize map widget
     */
    init() {
        this.initMap('map-standard');

        // Init simplified map if in Tier 1
        if (typeof isSimplifiedLayout === 'function' && isSimplifiedLayout()) {
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

        if (typeof mapboxgl === 'undefined') {
            console.error('[MapWidget] Mapbox GL JS not loaded');
            return;
        }

        if (typeof GameConfig === 'undefined' || !GameConfig.mapbox) {
            console.error('[MapWidget] GameConfig.mapbox not defined');
            return;
        }

        mapboxgl.accessToken = GameConfig.mapbox.token;

        const map = new mapboxgl.Map({
            container: containerId,
            style: GameConfig.mapbox.style,
            center: isSimple ? [-120, 10] : GameConfig.mapbox.center,
            zoom: isSimple ? 1.2 : GameConfig.mapbox.zoom,
            projection: 'mercator',
            // Enable rendering beyond -180 to 180 for continuous routes
            renderWorldCopies: true
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
            let coords = this.ports[portName];
            if (!coords) return;

            // For Asian ports when showing Pacific route, use negative longitude
            if (isSimple && coords[0] > 100) {
                coords = [coords[0] - 360, coords[1]];
            }

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
        if (typeof getActiveConfig !== 'function') {
            return Object.keys(this.ports);
        }

        const config = getActiveConfig();
        if (!config || !config.content) {
            return Object.keys(this.ports);
        }

        const ports = new Set();

        // Get ports from enabled suppliers
        if (config.content.suppliers) {
            config.content.suppliers.forEach(supplierId => {
                if (typeof getSupplierProfile === 'function') {
                    const profile = getSupplierProfile(supplierId);
                    if (profile && profile.port) {
                        ports.add(profile.port);
                    }
                }
            });
        }

        // Get ports from enabled buyers
        if (config.content.buyers) {
            config.content.buyers.forEach(buyerId => {
                if (typeof getBuyerProfile === 'function') {
                    const profile = getBuyerProfile(buyerId);
                    if (profile && profile.port) {
                        ports.add(profile.port);
                    }
                }
            });
        }

        return Array.from(ports);
    },

    /**
     * Add all enabled routes to map
     * @param {Object} map
     */
    addEnabledRoutes(map) {
        if (typeof getActiveConfig !== 'function') {
            // Add all routes if no config
            Object.values(this.routes).forEach(route => {
                this.addRoute(map, route);
            });
            return;
        }

        const config = getActiveConfig();
        if (!config || !config.content) return;

        const enabledRoutes = config.content.routes === 'all' ?
            Object.keys(this.routes) :
            (config.content.routes || []);

        enabledRoutes.forEach(routeId => {
            const route = this.routes[routeId];
            if (route) {
                this.addRoute(map, route);
            }
        });
    },

    /**
     * Fix coordinates for antimeridian crossing
     * For routes going west to Asia, convert positive Asian longitudes to negative
     * @param {Array} coordinates - Array of [lng, lat] pairs
     * @returns {Array} Fixed coordinates
     */
    fixAntimeridianCoordinates(coordinates) {
        if (!coordinates || coordinates.length < 2) return coordinates;

        const originLng = coordinates[0][0];
        const destLng = coordinates[coordinates.length - 1][0];

        // Check if this is a westward Pacific route
        // Origin in Americas (negative longitude) and destination in Asia (positive > 100)
        if (originLng < -60 && destLng > 100) {
            // Convert Asian coordinates to negative (subtract 360)
            return coordinates.map(coord => {
                const [lng, lat] = coord;
                // Convert longitudes > 100 to negative equivalent
                if (lng > 100) {
                    return [lng - 360, lat];
                }
                return coord;
            });
        }

        return coordinates;
    },

    /**
     * Add a route to the map
     * @param {Object} map
     * @param {Object} route
     */
    addRoute(map, route) {
        if (!map || !route) return;

        const sourceId = `route-${route.id}`;
        const layerId = `route-line-${route.id}`;

        // Route waypoints are already fixed in the route definitions
        // but apply fix in case of dynamic routes
        const fixedWaypoints = this.fixAntimeridianCoordinates(route.waypoints);

        // Create GeoJSON for the route
        const geojson = {
            type: 'Feature',
            properties: {
                name: `${route.from} to ${route.to}`
            },
            geometry: {
                type: 'LineString',
                coordinates: fixedWaypoints
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
        if (!waypoints || waypoints.length === 0) return [0, 0];
        if (progress <= 0) return waypoints[0];
        if (progress >= 1) return waypoints[waypoints.length - 1];

        const totalSegments = waypoints.length - 1;
        const segmentProgress = progress * totalSegments;
        const segmentIndex = Math.floor(segmentProgress);
        const segmentFraction = segmentProgress - segmentIndex;

        const start = waypoints[segmentIndex];
        const end = waypoints[Math.min(segmentIndex + 1, waypoints.length - 1)];

        if (!start || !end) return waypoints[0];

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

        // Update existing marker or create new one
        if (this.shipMarkers[markerId]) {
            this.shipMarkers[markerId].setLngLat(position);
        } else {
            const el = document.createElement('div');
            el.id = markerId;
            el.className = 'ship-marker';
            el.innerHTML = '🚢';

            // Add to main map
            if (this.map) {
                const marker = new mapboxgl.Marker(el)
                    .setLngLat(position)
                    .addTo(this.map);
                this.shipMarkers[markerId] = marker;
            }
        }

        // Also update simple map if exists
        const simpleMarkerId = `${markerId}-simple`;
        if (this.mapSimple) {
            if (this.shipMarkers[simpleMarkerId]) {
                this.shipMarkers[simpleMarkerId].setLngLat(position);
            } else {
                const elSimple = document.createElement('div');
                elSimple.id = simpleMarkerId;
                elSimple.className = 'ship-marker';
                elSimple.innerHTML = '🚢';

                const markerSimple = new mapboxgl.Marker(elSimple)
                    .setLngLat(position)
                    .addTo(this.mapSimple);
                this.shipMarkers[simpleMarkerId] = markerSimple;
            }
        }
    },

    /**
     * Remove ship marker
     * @param {string} routeId
     */
    removeShipMarker(routeId) {
        const markerId = `ship-${routeId}`;
        if (this.shipMarkers[markerId]) {
            this.shipMarkers[markerId].remove();
            delete this.shipMarkers[markerId];
        }

        const simpleMarkerId = `${markerId}-simple`;
        if (this.shipMarkers[simpleMarkerId]) {
            this.shipMarkers[simpleMarkerId].remove();
            delete this.shipMarkers[simpleMarkerId];
        }
    },

    /**
     * Update map based on current positions
     */
    update() {
        if (typeof GameState === 'undefined' || !GameState.getPhysicalPositions) return;

        const positions = GameState.getPhysicalPositions();

        positions.forEach(pos => {
            if (pos.route && pos.status === 'in_transit') {
                const routeId = pos.route;
                const route = this.routes[routeId];

                if (route) {
                    const currentMonth = GameState.getCurrentMonthIndex();
                    const daysElapsed = (currentMonth - pos.buyMonth) * 30;
                    const progress = Math.min(1, daysElapsed / route.transitDays);
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
    },

    /**
     * Center map on a specific route
     * @param {string} routeId
     */
    centerOnRoute(routeId) {
        const route = this.routes[routeId];
        if (!route || !this.map) return;

        const coordinates = route.waypoints;
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        this.map.fitBounds(bounds, { padding: 50 });
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapWidget;
}
