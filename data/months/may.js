/**
 * May Market Data for GV_TEST
 * Replace with actual market data
 */

const MayData = {
    month: 'May',
    year: 2024,

    prices: {
        lme_spot: 8280,
        lme_m1: 8340,
        comex_spot: 8310,
        comex_m1: 8380
    },

    suppliers: [
        {
            id: 'peru_carlos',
            premium: 75,
            available: true,
            pricingType: 'spot',
            maxCargos: 5,
            quality: 'Grade A',
            terms: 'FOB Callao'
        },
        {
            id: 'chile_maria',
            premium: 65,
            available: true,
            pricingType: 'm1',
            maxCargos: 6,
            quality: 'Grade A',
            terms: 'FOB Valparaiso'
        },
        {
            id: 'zambia_joseph',
            premium: 55,
            available: true,
            pricingType: 'spot',
            maxCargos: 4,
            quality: 'Grade A',
            terms: 'FOB Durban'
        },
        {
            id: 'congo_emmanuel',
            premium: 45,
            available: true,
            pricingType: 'm1',
            maxCargos: 3,
            quality: 'Grade B',
            terms: 'FOB Durban'
        }
    ],

    buyers: [
        {
            id: 'shanghai_wei',
            premium: 108,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'low',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 92,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 95,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'low',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 100,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'medium',
            terms: 'CIF Mumbai'
        }
    ],

    events: [
        {
            type: 'news',
            headline: 'Summer Slowdown Begins',
            description: 'Demand softens as Northern Hemisphere enters seasonal lull.',
            impact: 'bearish'
        },
        {
            type: 'event',
            headline: 'Fed Signals Rate Hold',
            description: 'Federal Reserve indicates rates to stay higher for longer.',
            impact: 'bearish'
        }
    ],

    sentiment: {
        overall: 'bearish',
        factors: [
            'Weak Chinese property sector',
            'Higher-for-longer rate expectations',
            'Seasonal demand weakness'
        ]
    }
};
