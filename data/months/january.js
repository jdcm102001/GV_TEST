/**
 * January Market Data for GV_TEST
 * Replace with actual market data
 */

const JanuaryData = {
    month: 'January',
    year: 2024,

    // Price data
    prices: {
        lme_spot: 8450,      // LME Cash Settlement $/MT
        lme_m1: 8520,        // LME M+1 Forward $/MT
        comex_spot: 8480,    // COMEX Spot $/MT
        comex_m1: 8550       // COMEX M+1 $/MT
    },

    // Supplier offers for this month
    suppliers: [
        {
            id: 'peru_carlos',
            premium: 85,          // $/MT above LME
            available: true,
            pricingType: 'spot',  // spot or m1
            maxCargos: 3,
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
            maxCargos: 2,
            quality: 'Grade A',
            terms: 'FOB Durban'
        },
        {
            id: 'congo_emmanuel',
            premium: 55,
            available: false,     // Not available this month
            pricingType: 'm1',
            maxCargos: 1,
            quality: 'Grade B',
            terms: 'FOB Durban'
        }
    ],

    // Buyer demands for this month
    buyers: [
        {
            id: 'shanghai_wei',
            premium: 120,         // $/MT above exchange
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Shanghai'
        },
        {
            id: 'houston_mike',
            premium: 95,
            exchange: 'comex',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Houston'
        },
        {
            id: 'rotterdam_anna',
            premium: 105,
            exchange: 'lme',
            pricingType: 'm1',
            demand: 'medium',
            terms: 'CIF Rotterdam'
        },
        {
            id: 'mumbai_raj',
            premium: 110,
            exchange: 'lme',
            pricingType: 'spot',
            demand: 'high',
            terms: 'CIF Mumbai'
        }
    ],

    // Market events/news for this month
    events: [
        {
            type: 'news',
            headline: 'Strong Start to 2024',
            description: 'Copper markets open the year with steady demand from Asia.',
            impact: 'neutral'
        }
    ],

    // Market sentiment
    sentiment: {
        overall: 'bullish',
        factors: [
            'Strong Chinese manufacturing PMI',
            'EV production forecasts raised',
            'Mine supply concerns in Chile'
        ]
    }
};
