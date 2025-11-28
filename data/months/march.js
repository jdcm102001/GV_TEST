/**
 * March Market Data for GV_TEST
 * Replace with actual market data
 */

const MarchData = {
    month: 'March',
    year: 2024,

    prices: {
        lme_spot: 8650,
        lme_m1: 8720,
        comex_spot: 8700,
        comex_m1: 8780
    },

    suppliers: [
        {
            id: 'peru_carlos',
            premium: 90,
            available: true,
            pricingType: 'spot',
            maxCargos: 2,
            quality: 'Grade A',
            terms: 'FOB Callao'
        },
        {
            id: 'chile_maria',
            premium: 80,
            available: true,
            pricingType: 'm1',
            maxCargos: 3,
            quality: 'Grade A',
            terms: 'FOB Valparaiso'
        },
        {
            id: 'zambia_joseph',
            premium: 70,
            available: true,
            pricingType: 'spot',
            maxCargos: 3,
            quality: 'Grade A',
            terms: 'FOB Durban'
        },
        {
            id: 'congo_emmanuel',
            premium: 55,
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
            premium: 130,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 105,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'high',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 110,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 120,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Mumbai'
        }
    ],

    events: [
        {
            type: 'news',
            headline: 'Spring Rally Underway',
            description: 'Post-holiday demand surge drives copper prices higher.',
            impact: 'bullish'
        },
        {
            type: 'event',
            headline: 'Chilean Mine Strike',
            description: 'Workers at major Chilean mine begin 48-hour strike.',
            impact: 'bullish'
        }
    ],

    sentiment: {
        overall: 'bullish',
        factors: [
            'China restocking after holiday',
            'Supply disruptions in Chile',
            'Green energy investments accelerating'
        ]
    }
};
