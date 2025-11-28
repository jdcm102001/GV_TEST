/**
 * markets.js - Suppliers/Buyers Display Widget for GV_TEST
 */

const Markets = {
    // Current active tab
    activeTab: 'suppliers',

    /**
     * Initialize markets widget
     */
    init() {
        this.render();
        console.log('[Markets] Initialized');
    },

    /**
     * Show tab
     * @param {string} tab - 'suppliers' or 'buyers'
     */
    showTab(tab) {
        this.activeTab = tab;

        // Update tab buttons
        document.querySelectorAll('#panel-markets .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('#panel-markets .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
        });
    },

    /**
     * Render markets widget
     */
    render() {
        this.renderSuppliers();
        this.renderBuyers();
    },

    /**
     * Render suppliers list
     */
    renderSuppliers() {
        const container = document.getElementById('tab-suppliers');
        if (!container) return;

        const monthData = Trading.currentMonthData;
        if (!monthData) {
            container.innerHTML = '<div class="empty-state">Loading market data...</div>';
            return;
        }

        const suppliers = getEnabledSuppliers(monthData);

        if (suppliers.length === 0) {
            container.innerHTML = '<div class="empty-state">No suppliers available</div>';
            return;
        }

        container.innerHTML = suppliers.map(supplier => {
            const profile = getSupplierProfile(supplier.id);
            const buyCost = Trading.calculateBuyCost(supplier);

            return `
                <div class="market-card" onclick="Trading.showBuyModal('${supplier.id}')">
                    <div class="avatar avatar-${profile.avatar}"></div>
                    <div class="market-card-info">
                        <h4>${profile.name}</h4>
                        <p>${profile.company}, ${profile.country}</p>
                    </div>
                    <div class="market-card-price">
                        <div class="price">$${buyCost.perMT.toLocaleString()}/MT</div>
                        <div class="premium">+$${supplier.premium}/MT premium</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render buyers list
     */
    renderBuyers() {
        const container = document.getElementById('tab-buyers');
        if (!container) return;

        const monthData = Trading.currentMonthData;
        if (!monthData) {
            container.innerHTML = '<div class="empty-state">Loading market data...</div>';
            return;
        }

        const buyers = getEnabledBuyers(monthData);

        if (buyers.length === 0) {
            container.innerHTML = '<div class="empty-state">No buyers available</div>';
            return;
        }

        container.innerHTML = buyers.map(buyer => {
            const profile = getBuyerProfile(buyer.id);
            const exchange = buyer.exchange || 'lme';
            const basePrice = getRelevantPrice(monthData, exchange, false);

            return `
                <div class="market-card" onclick="Trading.showSellModal(null, '${buyer.id}')">
                    <div class="avatar avatar-${profile.avatar}"></div>
                    <div class="market-card-info">
                        <h4>${profile.name}</h4>
                        <p>${profile.company}, ${profile.country}</p>
                    </div>
                    <div class="market-card-price">
                        <div class="price">$${(basePrice + buyer.premium).toLocaleString()}/MT</div>
                        <div class="premium">+$${buyer.premium}/MT premium (${exchange.toUpperCase()})</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Update display with new month data
     */
    update() {
        this.render();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Markets;
}
