/**
 * gameConfig.js - Tier Configurations for GV_TEST Copper Trading Simulator
 *
 * Defines 4 progressive tiers controlling what features/content are visible:
 * - Tier 1: Single Cargo (basic buy→ship→sell)
 * - Tier 2: Timing Game (M+1 settlement pricing)
 * - Tier 3: Basis Trade (LME vs COMEX spreads)
 * - Tier 4: Hedged Portfolio (futures hedging)
 */

const GameConfig = {
    // Mapbox configuration
    mapbox: {
        token: 'pk.eyJ1IjoiamRjbTEwMjAwMSIsImEiOiJjbWhtcTdhNGQyNHlmMnFwcjF3YTF6YmlyIn0.uugX8H3ObKHWL7ia1MBFBg',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [100, 10], // Default center (Asia-Pacific)
        zoom: 2
    },

    // Game constants
    constants: {
        defaultFunds: 500000, // Starting funds
        locLimit: 500000, // Letter of Credit limit (reduced for balance)
        futuresContractSize: 25, // MT per futures contract
        marginRequirement: 0.10, // 10% margin for futures
    },

    // Tier-based cargo settings (balanced for starting funds)
    tierSettings: {
        1: {
            cargoSize: 10,      // 10 MT (~$90,000 per trade) - learn basics
            maxCargoes: 1,      // Only one cargo at a time
        },
        2: {
            cargoSize: 25,      // 25 MT (~$225,000 per trade)
            maxCargoes: 2,
        },
        3: {
            cargoSize: 50,      // 50 MT (~$450,000 per trade)
            maxCargoes: 3,
        },
        4: {
            cargoSize: 100,     // 100 MT (~$900,000 per trade)
            maxCargoes: 5,
        }
    },

    // Tier definitions
    tiers: {
        1: {
            name: "Single Cargo",
            subtitle: "Learn the basics of physical trading",
            description: "Buy copper from a supplier, ship it, and sell to a buyer.",

            // Layout configuration
            layout: "simplified", // simplified | standard

            // Feature flags
            features: {
                // Trading features
                spotTrading: true,
                m1Pricing: false,
                futuresTrading: false,
                basisTrading: false,
                hedging: false,

                // Financial features
                loc: false,
                margin: false,

                // UI features
                sidebar: false,
                analytics: false,
                priceCharts: false,
                marketEvents: false,

                // Exchange access
                exchanges: {
                    lme: true,
                    comex: false
                }
            },

            // Content filters
            content: {
                // Regions available
                regions: ["asia"],

                // Supplier IDs available (filters month data)
                suppliers: ["peru_carlos"],

                // Buyer IDs available
                buyers: ["shanghai_wei"],

                // Routes available
                routes: ["callao_shanghai"]
            },

            // Progression requirements
            progression: {
                type: "profitable_trades",
                target: 3,
                description: "Complete 3 profitable trades"
            },

            // Initial tutorial/microlearning
            lessons: [
                "intro_physical_trading",
                "understanding_spot_price",
                "freight_and_costs"
            ]
        },

        2: {
            name: "Timing Game",
            subtitle: "Master settlement pricing mechanics",
            description: "Learn how M+1 pricing affects your margins when prices move.",

            layout: "standard",

            features: {
                spotTrading: true,
                m1Pricing: true,
                futuresTrading: false,
                basisTrading: false,
                hedging: false,

                loc: true,
                margin: false,

                sidebar: true,
                analytics: true,
                priceCharts: true,
                marketEvents: false,

                exchanges: {
                    lme: true,
                    comex: false
                }
            },

            content: {
                regions: ["asia", "americas"],
                suppliers: ["peru_carlos", "chile_maria"],
                buyers: ["shanghai_wei", "houston_mike"],
                routes: ["callao_shanghai", "valparaiso_houston", "callao_houston"]
            },

            progression: {
                type: "survive_adverse_move",
                target: 3, // months
                description: "Survive an adverse price move over 3 months"
            },

            lessons: [
                "m1_pricing_explained",
                "price_volatility",
                "loc_financing"
            ]
        },

        3: {
            name: "Basis Trade",
            subtitle: "Exploit exchange spreads",
            description: "Trade the spread between LME and COMEX prices.",

            layout: "standard",

            features: {
                spotTrading: true,
                m1Pricing: true,
                futuresTrading: false,
                basisTrading: true,
                hedging: false,

                loc: true,
                margin: false,

                sidebar: true,
                analytics: true,
                priceCharts: true,
                marketEvents: true,

                exchanges: {
                    lme: true,
                    comex: true
                }
            },

            content: {
                regions: ["asia", "americas", "europe"],
                suppliers: ["peru_carlos", "chile_maria", "zambia_joseph"],
                buyers: ["shanghai_wei", "houston_mike", "rotterdam_anna"],
                routes: [
                    "callao_shanghai", "valparaiso_houston", "callao_houston",
                    "durban_rotterdam", "callao_rotterdam"
                ]
            },

            progression: {
                type: "profitable_basis_trade",
                target: 1,
                description: "Execute a profitable basis trade"
            },

            lessons: [
                "basis_trading_intro",
                "lme_vs_comex",
                "arbitrage_opportunities"
            ]
        },

        4: {
            name: "Hedged Portfolio",
            subtitle: "Full trading simulation",
            description: "Use futures to hedge your physical positions.",

            layout: "standard",

            features: {
                spotTrading: true,
                m1Pricing: true,
                futuresTrading: true,
                basisTrading: true,
                hedging: true,

                loc: true,
                margin: true,

                sidebar: true,
                analytics: true,
                priceCharts: true,
                marketEvents: true,

                exchanges: {
                    lme: true,
                    comex: true
                }
            },

            content: {
                regions: ["asia", "americas", "europe"],
                suppliers: ["peru_carlos", "chile_maria", "zambia_joseph", "congo_emmanuel"],
                buyers: ["shanghai_wei", "houston_mike", "rotterdam_anna", "mumbai_raj"],
                routes: "all"
            },

            progression: {
                type: "campaign_with_hedge",
                target: 6, // months
                description: "Complete 6-month campaign with demonstrated hedge"
            },

            lessons: [
                "futures_hedging_intro",
                "margin_management",
                "portfolio_risk"
            ]
        }
    },

    // Supplier definitions (reference data)
    supplierProfiles: {
        peru_carlos: {
            id: "peru_carlos",
            name: "Carlos Mendez",
            company: "Antamina Mining Co.",
            country: "Peru",
            port: "Callao",
            region: "americas",
            avatar: "carlos",
            description: "Reliable supplier with consistent quality"
        },
        chile_maria: {
            id: "chile_maria",
            name: "Maria Santos",
            company: "Codelco",
            country: "Chile",
            port: "Valparaiso",
            region: "americas",
            avatar: "maria",
            description: "Large volumes, competitive pricing"
        },
        zambia_joseph: {
            id: "zambia_joseph",
            name: "Joseph Mwanza",
            company: "Konkola Copper Mines",
            country: "Zambia",
            port: "Durban",
            region: "africa",
            avatar: "joseph",
            description: "African copper, longer lead times"
        },
        congo_emmanuel: {
            id: "congo_emmanuel",
            name: "Emmanuel Kabila",
            company: "Gécamines",
            country: "DRC",
            port: "Durban",
            region: "africa",
            avatar: "emmanuel",
            description: "High grade copper, variable supply"
        }
    },

    // Buyer definitions (reference data)
    buyerProfiles: {
        shanghai_wei: {
            id: "shanghai_wei",
            name: "Wei Chen",
            company: "Shanghai Metals",
            country: "China",
            port: "Shanghai",
            region: "asia",
            avatar: "wei",
            description: "High demand, pays premium for quality"
        },
        houston_mike: {
            id: "houston_mike",
            name: "Mike Johnson",
            company: "US Copper Inc.",
            country: "USA",
            port: "Houston",
            region: "americas",
            avatar: "mike",
            description: "COMEX pricing, consistent buyer"
        },
        rotterdam_anna: {
            id: "rotterdam_anna",
            name: "Anna van Berg",
            company: "European Metals GmbH",
            country: "Netherlands",
            port: "Rotterdam",
            region: "europe",
            avatar: "anna",
            description: "LME pricing, warehouse delivery"
        },
        mumbai_raj: {
            id: "mumbai_raj",
            name: "Raj Patel",
            company: "Hindalco Industries",
            country: "India",
            port: "Mumbai",
            region: "asia",
            avatar: "raj",
            description: "Growing demand, flexible terms"
        }
    }
};

// ============================================================================
// CONFIG HELPER FUNCTIONS
// ============================================================================

/**
 * Get the active tier configuration
 * @returns {Object} Current tier config
 */
function getActiveConfig() {
    const currentTier = GameState.getCurrentTier();
    return GameConfig.tiers[currentTier];
}

/**
 * Get enabled suppliers for current tier from month data
 * @param {Object} monthData - The current month's market data
 * @returns {Array} Filtered suppliers available for current tier
 */
function getEnabledSuppliers(monthData) {
    const config = getActiveConfig();
    const allowedIds = config.content.suppliers;

    if (!monthData || !monthData.suppliers) {
        return [];
    }

    return monthData.suppliers.filter(supplier =>
        allowedIds.includes(supplier.id)
    );
}

/**
 * Get enabled buyers for current tier from month data
 * @param {Object} monthData - The current month's market data
 * @returns {Array} Filtered buyers available for current tier
 */
function getEnabledBuyers(monthData) {
    const config = getActiveConfig();
    const allowedIds = config.content.buyers;

    if (!monthData || !monthData.buyers) {
        return [];
    }

    return monthData.buyers.filter(buyer =>
        allowedIds.includes(buyer.id)
    );
}

/**
 * Check if a feature is enabled for current tier
 * @param {string} featurePath - Dot-notation path to feature (e.g., "exchanges.comex")
 * @returns {boolean} Whether feature is enabled
 */
function isFeatureEnabled(featurePath) {
    const config = getActiveConfig();
    const parts = featurePath.split('.');

    let value = config.features;
    for (const part of parts) {
        if (value === undefined || value === null) {
            return false;
        }
        value = value[part];
    }

    return value === true;
}

/**
 * Get the relevant price for current tier
 * @param {Object} monthData - The current month's market data
 * @param {string} exchange - "lme" or "comex"
 * @param {boolean} useM1 - Whether to use M+1 pricing
 * @returns {number|null} The applicable price
 */
function getRelevantPrice(monthData, exchange = 'lme', useM1 = false) {
    const config = getActiveConfig();

    // Check if exchange is enabled
    if (!config.features.exchanges[exchange]) {
        return null;
    }

    // Check if M+1 is enabled and requested
    if (useM1 && !config.features.m1Pricing) {
        useM1 = false;
    }

    const prices = monthData.prices;

    if (exchange === 'lme') {
        return useM1 ? prices.lme_m1 : prices.lme_spot;
    } else if (exchange === 'comex') {
        return useM1 ? prices.comex_m1 : prices.comex_spot;
    }

    return null;
}

/**
 * Get enabled routes for current tier
 * @param {Object} routesData - The routes.json data
 * @returns {Array} Filtered routes available for current tier
 */
function getEnabledRoutes(routesData) {
    const config = getActiveConfig();

    if (config.content.routes === "all") {
        return routesData.routes;
    }

    return routesData.routes.filter(route =>
        config.content.routes.includes(route.id)
    );
}

/**
 * Get tier configuration by tier number
 * @param {number} tierNum - Tier number (1-4)
 * @returns {Object} Tier configuration
 */
function getTierConfig(tierNum) {
    return GameConfig.tiers[tierNum] || null;
}

/**
 * Check if current tier uses simplified layout
 * @returns {boolean}
 */
function isSimplifiedLayout() {
    const config = getActiveConfig();
    return config.layout === "simplified";
}

/**
 * Get all available exchanges for current tier
 * @returns {Array} Array of exchange names
 */
function getAvailableExchanges() {
    const config = getActiveConfig();
    const exchanges = [];

    if (config.features.exchanges.lme) exchanges.push('lme');
    if (config.features.exchanges.comex) exchanges.push('comex');

    return exchanges;
}

/**
 * Get supplier profile by ID
 * @param {string} supplierId
 * @returns {Object|null}
 */
function getSupplierProfile(supplierId) {
    return GameConfig.supplierProfiles[supplierId] || null;
}

/**
 * Get buyer profile by ID
 * @param {string} buyerId
 * @returns {Object|null}
 */
function getBuyerProfile(buyerId) {
    return GameConfig.buyerProfiles[buyerId] || null;
}

/**
 * Get cargo size for current tier
 * @returns {number} Cargo size in MT
 */
function getCargoSize() {
    const currentTier = typeof GameState !== 'undefined' ? GameState.getCurrentTier() : 1;
    return GameConfig.tierSettings[currentTier]?.cargoSize || 10;
}

/**
 * Get max cargoes allowed for current tier
 * @returns {number} Maximum concurrent cargoes
 */
function getMaxCargoes() {
    const currentTier = typeof GameState !== 'undefined' ? GameState.getCurrentTier() : 1;
    return GameConfig.tierSettings[currentTier]?.maxCargoes || 1;
}

/**
 * Get tier settings for current tier
 * @returns {Object} Tier settings
 */
function getTierSettings() {
    const currentTier = typeof GameState !== 'undefined' ? GameState.getCurrentTier() : 1;
    return GameConfig.tierSettings[currentTier] || GameConfig.tierSettings[1];
}

// Export for module usage (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameConfig,
        getActiveConfig,
        getEnabledSuppliers,
        getEnabledBuyers,
        isFeatureEnabled,
        getRelevantPrice,
        getEnabledRoutes,
        getTierConfig,
        isSimplifiedLayout,
        getAvailableExchanges,
        getSupplierProfile,
        getBuyerProfile,
        getCargoSize,
        getMaxCargoes,
        getTierSettings
    };
}
