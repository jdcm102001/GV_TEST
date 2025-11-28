/**
 * April Market Data for GV_TEST
 * Replace with actual market data
 */

const AprilData = {
    month: 'April',
    year: 2024,

    prices: {
        lme_spot: 8520,
        lme_m1: 8580,
        comex_spot: 8550,
        comex_m1: 8620
    },

    suppliers: [
        {
            id: 'peru_carlos',
            premium: 85,
            available: true,
            pricingType: 'spot',
            maxCargos: 4,
            quality: 'Grade A',
            terms: 'FOB Callao'
        },
        {
            id: 'chile_maria',
            premium: 75,
            available: true,
            pricingType: 'm1',
            maxCargos: 5,
            quality: 'Grade A',
            terms: 'FOB Valparaiso'
        },
        {
            id: 'zambia_joseph',
            premium: 65,
            available: true,
            pricingType: 'spot',
            maxCargos: 3,
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
            premium: 118,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'medium',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 98,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 102,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 112,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'medium',
            terms: 'CIF Mumbai'
        }
    ],

    events: [
        {
            type: 'news',
            headline: 'Market Consolidation',
            description: 'Prices stabilize after March rally as market seeks direction.',
            impact: 'neutral'
        }
    ],

    sentiment: {
        overall: 'neutral',
        factors: [
            'Market awaiting Fed signals',
            'Mixed manufacturing data',
            'Inventory levels normalizing'
        ]
    }
};
