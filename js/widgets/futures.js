/**
 * futures.js - Futures Trading Panel for GV_TEST (Tier 4)
 */

const Futures = {
    /**
     * Initialize futures widget
     */
    init() {
        if (isFeatureEnabled('futuresTrading')) {
            this.render();
        }
        console.log('[Futures] Initialized');
    },

    /**
     * Render futures trading panel
     */
    render() {
        const container = document.querySelector('#panel-futures .panel-content');
        if (!container) return;

        if (!isFeatureEnabled('futuresTrading')) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Futures trading unlocks in Tier 4</p>
                </div>
            `;
            return;
        }

        const monthData = Trading.currentMonthData;
        if (!monthData) {
            container.innerHTML = '<div class="empty-state">Loading market data...</div>';
            return;
        }

        const lmePrice = getRelevantPrice(monthData, 'lme', false);
        const lmeM1 = getRelevantPrice(monthData, 'lme', true);
        const comexPrice = isFeatureEnabled('exchanges.comex') ?
            getRelevantPrice(monthData, 'comex', false) : null;

        const positions = GameState.getFuturesPositions();
        const netPosition = this.calculateNetPosition(positions);

        container.innerHTML = `
            <div class="futures-prices">
                <h4>Futures Prices</h4>
                <div class="price-grid">
                    <div class="price-item">
                        <span class="price-label">LME Spot</span>
                        <span class="price-value">$${lmePrice.toLocaleString()}</span>
                    </div>
                    <div class="price-item">
                        <span class="price-label">LME M+1</span>
                        <span class="price-value">$${lmeM1.toLocaleString()}</span>
                    </div>
                    ${comexPrice ? `
                    <div class="price-item">
                        <span class="price-label">COMEX Spot</span>
                        <span class="price-value">$${comexPrice.toLocaleString()}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="futures-summary">
                <h4>Position Summary</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Open Contracts</span>
                        <span class="summary-value">${positions.length}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Net Position</span>
                        <span class="summary-value ${netPosition >= 0 ? 'long' : 'short'}">
                            ${netPosition >= 0 ? 'Long' : 'Short'} ${Math.abs(netPosition).toLocaleString()} MT
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Margin</span>
                        <span class="summary-value">$${this.calculateTotalMargin(positions).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="futures-actions">
                <h4>Trade Futures</h4>
                <div class="action-buttons">
                    <button class="btn btn-buy" onclick="Trading.showFuturesModal('buy')">
                        Buy Futures (Go Long)
                    </button>
                    <button class="btn btn-sell" onclick="Trading.showFuturesModal('sell')">
                        Sell Futures (Go Short)
                    </button>
                </div>
            </div>

            <div class="futures-hedging">
                <h4>Hedging Guide</h4>
                <div class="hedging-info">
                    <p><strong>Physical Position:</strong> ${this.getPhysicalExposure().toLocaleString()} MT Long</p>
                    <p><strong>Futures Position:</strong> ${netPosition.toLocaleString()} MT</p>
                    <p><strong>Net Exposure:</strong> ${(this.getPhysicalExposure() + netPosition).toLocaleString()} MT</p>
                    <p class="hedge-recommendation">
                        ${this.getHedgeRecommendation()}
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Calculate net futures position in MT
     * @param {Array} positions
     * @returns {number}
     */
    calculateNetPosition(positions) {
        const contractSize = GameConfig.constants.futuresContractSize;
        return positions.reduce((net, pos) => {
            const quantity = pos.contracts * contractSize;
            return net + (pos.side === 'long' ? quantity : -quantity);
        }, 0);
    },

    /**
     * Calculate total margin posted
     * @param {Array} positions
     * @returns {number}
     */
    calculateTotalMargin(positions) {
        return positions.reduce((total, pos) => total + pos.marginPosted, 0);
    },

    /**
     * Get physical copper exposure
     * @returns {number}
     */
    getPhysicalExposure() {
        const positions = GameState.getPhysicalPositions();
        return positions.reduce((total, pos) => total + pos.quantity, 0);
    },

    /**
     * Get hedge recommendation
     * @returns {string}
     */
    getHedgeRecommendation() {
        const physical = this.getPhysicalExposure();
        const futures = this.calculateNetPosition(GameState.getFuturesPositions());
        const netExposure = physical + futures;

        if (physical === 0) {
            return 'No physical positions to hedge.';
        }

        if (netExposure === 0) {
            return 'Your position is fully hedged.';
        }

        if (netExposure > 0) {
            return `Consider selling ${netExposure.toLocaleString()} MT of futures to fully hedge.`;
        } else {
            return `You are over-hedged by ${Math.abs(netExposure).toLocaleString()} MT.`;
        }
    },

    /**
     * Update display
     */
    update() {
        if (isFeatureEnabled('futuresTrading')) {
            this.render();
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Futures;
}
