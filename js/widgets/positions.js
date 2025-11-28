/**
 * positions.js - Open Positions Widget for GV_TEST
 */

const Positions = {
    // Current active tab
    activeTab: 'physical',

    /**
     * Initialize positions widget
     */
    init() {
        this.render();
        console.log('[Positions] Initialized');
    },

    /**
     * Show tab
     * @param {string} tab - 'physical' or 'futures-pos'
     */
    showTab(tab) {
        this.activeTab = tab;

        // Update tab buttons
        document.querySelectorAll('#panel-positions .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('#panel-positions .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
        });
    },

    /**
     * Render positions widget
     */
    render() {
        this.renderPhysical();
        this.renderFutures();
    },

    /**
     * Render physical positions
     */
    renderPhysical() {
        const container = document.getElementById('tab-physical');
        if (!container) return;

        const positions = GameState.getPhysicalPositions();

        if (positions.length === 0) {
            container.innerHTML = '<div class="empty-state">No open positions</div>';
            return;
        }

        const monthData = Trading.currentMonthData;
        const currentPrice = monthData ? getRelevantPrice(monthData, 'lme', false) : 0;

        container.innerHTML = positions.map(pos => {
            const supplierProfile = getSupplierProfile(pos.supplierId);
            const unrealizedPnL = (currentPrice - pos.buyPrice) * pos.quantity;
            const pnlClass = unrealizedPnL >= 0 ? 'positive' : 'negative';

            return `
                <div class="position-item" onclick="Trading.showSellModal('${pos.id}')">
                    <div class="position-item-header">
                        <span class="position-id">${pos.id}</span>
                        <span class="position-status ${pos.status}">${pos.status.replace('_', ' ')}</span>
                    </div>
                    <div class="position-item-details">
                        <div class="position-detail">
                            <span class="position-detail-label">Supplier</span>
                            <span class="position-detail-value">${supplierProfile.name}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Quantity</span>
                            <span class="position-detail-value">${pos.quantity.toLocaleString()} MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Buy Price</span>
                            <span class="position-detail-value">$${pos.buyPrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Current Price</span>
                            <span class="position-detail-value">$${currentPrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Unrealized P&L</span>
                            <span class="position-detail-value pnl ${pnlClass}">
                                ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toLocaleString()}
                            </span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Financing</span>
                            <span class="position-detail-value">${pos.financing.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render futures positions
     */
    renderFutures() {
        const container = document.getElementById('tab-futures-pos');
        if (!container) return;

        const positions = GameState.getFuturesPositions();

        if (positions.length === 0) {
            container.innerHTML = '<div class="empty-state">No futures positions</div>';
            return;
        }

        const monthData = Trading.currentMonthData;
        const currentPrice = monthData ? getRelevantPrice(monthData, 'lme', false) : 0;

        container.innerHTML = positions.map(pos => {
            const contractSize = GameConfig.constants.futuresContractSize;
            const quantity = pos.contracts * contractSize;
            const multiplier = pos.side === 'long' ? 1 : -1;
            const unrealizedPnL = (currentPrice - pos.entryPrice) * quantity * multiplier;
            const pnlClass = unrealizedPnL >= 0 ? 'positive' : 'negative';

            return `
                <div class="position-item futures-position">
                    <div class="position-item-header">
                        <span class="position-id">${pos.id}</span>
                        <span class="position-status ${pos.side}">${pos.side.toUpperCase()}</span>
                    </div>
                    <div class="position-item-details">
                        <div class="position-detail">
                            <span class="position-detail-label">Contracts</span>
                            <span class="position-detail-value">${pos.contracts}</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Quantity</span>
                            <span class="position-detail-value">${quantity.toLocaleString()} MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Entry Price</span>
                            <span class="position-detail-value">$${pos.entryPrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Current Price</span>
                            <span class="position-detail-value">$${currentPrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Unrealized P&L</span>
                            <span class="position-detail-value pnl ${pnlClass}">
                                ${unrealizedPnL >= 0 ? '+' : ''}$${unrealizedPnL.toLocaleString()}
                            </span>
                        </div>
                        <div class="position-detail">
                            <span class="position-detail-label">Margin Posted</span>
                            <span class="position-detail-value">$${pos.marginPosted.toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-close-position"
                            onclick="event.stopPropagation(); Positions.closeFuturesPosition('${pos.id}')">
                        Close Position
                    </button>
                </div>
            `;
        }).join('');
    },

    /**
     * Close a futures position
     * @param {string} positionId
     */
    closeFuturesPosition(positionId) {
        const position = GameState.getFuturesPositions().find(p => p.id === positionId);
        if (!position) return;

        const monthData = Trading.currentMonthData;
        const currentPrice = getRelevantPrice(monthData, 'lme', false);
        const contractSize = GameConfig.constants.futuresContractSize;
        const quantity = position.contracts * contractSize;
        const multiplier = position.side === 'long' ? 1 : -1;
        const pnl = (currentPrice - position.entryPrice) * quantity * multiplier;

        // Return margin + P&L
        const totalReturn = position.marginPosted + pnl;

        if (confirm(`Close position for ${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()} P&L?`)) {
            GameState.closeFuturesPosition(positionId, pnl);
            GameState.updateFunds(position.marginPosted); // Return margin
            this.render();

            Trading.showConfirmation('Position Closed',
                `P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString()}`);
        }
    },

    /**
     * Update display
     */
    update() {
        this.render();
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Positions;
}
