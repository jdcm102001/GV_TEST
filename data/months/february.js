/**
 * February Market Data for GV_TEST
 * Replace with actual market data
 */

const FebruaryData = {
    month: 'February',
    year: 2024,

    prices: {
        lme_spot: 8380,
        lme_m1: 8450,
        comex_spot: 8410,
        comex_m1: 8480
    },

    suppliers: [
        {
            id: 'peru_carlos',
            premium: 80,
            available: true,
            pricingType: 'spot',
            maxCargos: 3,
            quality: 'Grade A',
            terms: 'FOB Callao'
        },
        {
            id: 'chile_maria',
            premium: 70,
            available: true,
            pricingType: 'm1',
            maxCargos: 4,
            quality: 'Grade A',
            terms: 'FOB Valparaiso'
        },
        {
            id: 'zambia_joseph',
            premium: 60,
            available: true,
            pricingType: 'spot',
            maxCargos: 2,
            quality: 'Grade A',
            terms: 'FOB Durban'
        },
        {
            id: 'congo_emmanuel',
            premium: 50,
            available: true,
            pricingType: 'm1',
            maxCargos: 2,
            quality: 'Grade B',
            terms: 'FOB Durban'
        }
    ],

    buyers: [
        {
            id: 'shanghai_wei',
            premium: 115,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'medium',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 100,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 100,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'low',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 105,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'medium',
            terms: 'CIF Mumbai'
        }
    ],

    events: [
        {
            type: 'news',
            headline: 'Chinese New Year Slowdown',
            description: 'Markets soften as Chinese demand pauses for holiday season.',
            impact: 'bearish'
        }
    ],

    sentiment: {
        overall: 'neutral',
        factors: [
            'Lunar New Year factory closures',
            'Inventory builds at warehouses',
            'Dollar strength pressuring commodities'
        ]
    }
};
