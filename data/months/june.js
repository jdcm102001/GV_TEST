/**
 * June Market Data for GV_TEST
 * Replace with actual market data
 */

const JuneData = {
    month: 'June',
    year: 2024,

    prices: {
        lme_spot: 8750,
        lme_m1: 8820,
        comex_spot: 8790,
        comex_m1: 8870
    },

    suppliers: [
        {
            id: 'peru_carlos',
            premium: 95,
            available: true,
            pricingType: 'spot',
            maxCargos: 2,
            quality: 'Grade A',
            terms: 'FOB Callao'
        },
        {
            id: 'chile_maria',
            premium: 85,
            available: true,
            pricingType: 'm1',
            maxCargos: 3,
            quality: 'Grade A',
            terms: 'FOB Valparaiso'
        },
        {
            id: 'zambia_joseph',
            premium: 75,
            available: true,
            pricingType: 'spot',
            maxCargos: 2,
            quality: 'Grade A',
            terms: 'FOB Durban'
        },
        {
            id: 'congo_emmanuel',
            premium: 60,
            available: false,
            pricingType: 'm1',
            maxCargos: 1,
            quality: 'Grade B',
            terms: 'FOB Durban'
        }
    ],

    buyers: [
        {
            id: 'shanghai_wei',
            premium: 135,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 110,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'high',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 115,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'high',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 125,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Mumbai'
        }
    ],

    events: [
        {
            type: 'news',
            headline: 'Supply Squeeze Intensifies',
            description: 'Multiple supply disruptions drive prices to year-high.',
            impact: 'bullish'
        },
        {
            type: 'event',
            headline: 'Panama Port Delays',
            description: 'Drought conditions cause shipping delays through Panama Canal.',
            impact: 'bullish'
        },
        {
            type: 'event',
            headline: 'AI Datacenter Boom',
            description: 'Tech companies announce massive datacenter expansions requiring copper.',
            impact: 'bullish'
        }
    ],

    sentiment: {
        overall: 'bullish',
        factors: [
            'Supply disruptions across multiple regions',
            'AI infrastructure demand surge',
            'Panama Canal shipping constraints',
            'Low visible inventories'
        ]
    }
};
