/**
 * trading.js - Buy/Sell/Futures Trading Logic for GV_TEST
 *
 * Handles all trading operations including physical trades and futures.
 */

const Trading = {
    // Current month's market data
    currentMonthData: null,

    /**
     * Set current month data
     * @param {Object} monthData
     */
    setMonthData(monthData) {
        this.currentMonthData = monthData;
    },

    /**
     * Calculate buy cost for a supplier
     * @param {Object} supplier - Supplier from month data
     * @returns {Object} { perMT, total, breakdown }
     */
    calculateBuyCost(supplier) {
        const config = getActiveConfig();
        const useM1 = config.features.m1Pricing && supplier.pricingType === 'm1';
        const basePrice = getRelevantPrice(this.currentMonthData, 'lme', useM1);
        const premium = supplier.premium || 0;
        const quantity = getCargoSize(); // Tier-based cargo size

        const perMT = basePrice + premium;
        const total = perMT * quantity;

        return {
            perMT,
            total,
            breakdown: {
                basePrice,
                premium,
                quantity,
                pricingType: useM1 ? 'M+1' : 'Spot'
            }
        };
    },

    /**
     * Calculate sell revenue for a buyer
     * @param {Object} buyer - Buyer from month data
     * @param {Object} route - Route data (for freight)
     * @returns {Object} { perMT, total, breakdown }
     */
    calculateSellRevenue(buyer, route) {
        const config = getActiveConfig();
        const exchange = buyer.exchange || 'lme';
        const useM1 = config.features.m1Pricing && buyer.pricingType === 'm1';
        const basePrice = getRelevantPrice(this.currentMonthData, exchange, useM1);
        const premium = buyer.premium || 0;
        const freightCost = route ? route.freightRate : 0;
        const quantity = getCargoSize(); // Tier-based cargo size

        const grossPerMT = basePrice + premium;
        const netPerMT = grossPerMT - freightCost;
        const total = netPerMT * quantity;

        return {
            perMT: netPerMT,
            grossPerMT,
            total,
            breakdown: {
                basePrice,
                premium,
                freightCost,
                quantity,
                exchange,
                pricingType: useM1 ? 'M+1' : 'Spot'
            }
        };
    },

    /**
     * Calculate potential profit for a trade
     * @param {Object} supplier
     * @param {Object} buyer
     * @param {Object} route
     * @returns {Object}
     */
    calculatePotentialProfit(supplier, buyer, route) {
        const buyCost = this.calculateBuyCost(supplier);
        const sellRevenue = this.calculateSellRevenue(buyer, route);

        const profitPerMT = sellRevenue.perMT - buyCost.perMT;
        const totalProfit = profitPerMT * getCargoSize();
        const marginPercent = (profitPerMT / buyCost.perMT) * 100;

        return {
            profitPerMT,
            totalProfit,
            marginPercent,
            buyCost,
            sellRevenue
        };
    },

    /**
     * Show buy modal
     * @param {string} supplierId - Optional specific supplier
     */
    showBuyModal(supplierId = null) {
        const suppliers = getEnabledSuppliers(this.currentMonthData);

        if (suppliers.length === 0) {
            alert('No suppliers available');
            return;
        }

        // Use specified supplier or first available
        const supplier = supplierId ?
            suppliers.find(s => s.id === supplierId) :
            suppliers[0];

        if (!supplier) return;

        const buyCost = this.calculateBuyCost(supplier);
        const profile = getSupplierProfile(supplier.id);

        const modalHTML = `
            <div class="modal-overlay" id="buy-modal">
                <div class="modal trade-modal">
                    <div class="modal-header">
                        <h2>Buy Copper</h2>
                        <button class="modal-close" onclick="Trading.closeModal('buy-modal')">×</button>
                    </div>

                    <div class="trade-supplier">
                        <div class="avatar avatar-${profile.avatar}"></div>
                        <div class="supplier-info">
                            <h3>${profile.name}</h3>
                            <p>${profile.company}, ${profile.country}</p>
                        </div>
                    </div>

                    <div class="trade-breakdown">
                        <div class="breakdown-row">
                            <span>Base Price (LME ${buyCost.breakdown.pricingType})</span>
                            <span>$${buyCost.breakdown.basePrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Supplier Premium</span>
                            <span>+$${buyCost.breakdown.premium.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row highlight">
                            <span>Buy Price</span>
                            <span>$${buyCost.perMT.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Cargo Size</span>
                            <span>${buyCost.breakdown.quantity.toLocaleString()} MT</span>
                        </div>
                        <div class="breakdown-row total">
                            <span>Total Cost</span>
                            <span>$${buyCost.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="trade-financing">
                        <h4>Financing</h4>
                        <div class="financing-options">
                            <label class="financing-option">
                                <input type="radio" name="financing" value="cash" checked>
                                <span>Cash (Available: $${GameState.getFunds().toLocaleString()})</span>
                            </label>
                            ${isFeatureEnabled('loc') ? `
                            <label class="financing-option">
                                <input type="radio" name="financing" value="loc">
                                <span>LOC (Available: $${(GameState.getState().locLimit - GameState.getState().locUsed).toLocaleString()})</span>
                            </label>
                            ` : ''}
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="Trading.closeModal('buy-modal')">
                            Cancel
                        </button>
                        <button class="btn btn-buy" onclick="Trading.executeBuy('${supplier.id}')">
                            Confirm Purchase
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Execute buy trade
     * @param {string} supplierId
     */
    executeBuy(supplierId) {
        const supplier = this.currentMonthData.suppliers.find(s => s.id === supplierId);
        if (!supplier) return;

        const buyCost = this.calculateBuyCost(supplier);
        const financing = document.querySelector('input[name="financing"]:checked')?.value || 'cash';

        // Check if player can afford
        if (financing === 'cash') {
            if (GameState.getFunds() < buyCost.total) {
                alert('Insufficient funds!');
                return;
            }
            GameState.updateFunds(-buyCost.total);
        } else if (financing === 'loc') {
            if (!GameState.useLoc(buyCost.total)) {
                alert('Insufficient LOC!');
                return;
            }
        }

        // Create position
        const position = {
            type: 'physical',
            side: 'long',
            supplierId: supplier.id,
            buyerId: null, // Set when selling
            quantity: getCargoSize(), // Tier-based cargo size
            buyPrice: buyCost.perMT,
            buyCost: buyCost.total,
            buyMonth: GameState.getCurrentMonthIndex(),
            pricingType: buyCost.breakdown.pricingType,
            financing: financing,
            route: null,
            status: 'purchased'
        };

        const positionId = GameState.addPhysicalPosition(position);

        // Trigger first trade lesson
        if (!GameState.hasLessonTrigger('firstTrade')) {
            GameState.setLessonTrigger('firstTrade');
            if (typeof Microlearning !== 'undefined') {
                Microlearning.triggerLesson('reading_trade_ticket');
            }
        }

        // Trigger first LOC use lesson
        if (financing === 'loc' && !GameState.hasLessonTrigger('firstLOCUse')) {
            GameState.setLessonTrigger('firstLOCUse');
            if (typeof Microlearning !== 'undefined') {
                setTimeout(() => {
                    Microlearning.triggerLesson('loc_financing');
                }, 2000); // Delay to not overwhelm with lessons
            }
        }

        // Close modal
        this.closeModal('buy-modal');

        // Update UI
        if (typeof App !== 'undefined' && App.updateUI) {
            App.updateUI();
        }

        // Show confirmation
        this.showConfirmation('Purchase Complete!', `Bought ${position.quantity.toLocaleString()} MT at $${position.buyPrice.toLocaleString()}/MT`);

        console.log('[Trading] Buy executed:', positionId);
    },

    /**
     * Show sell modal
     * @param {string} positionId - Position to sell
     * @param {string} buyerId - Optional specific buyer
     */
    showSellModal(positionId = null, buyerId = null) {
        // Get position to sell
        const positions = GameState.getOpenPositions();

        if (positions.length === 0) {
            alert('No copper to sell! Buy some first.');
            return;
        }

        const position = positionId ?
            positions.find(p => p.id === positionId) :
            positions[0];

        if (!position) return;

        const buyers = getEnabledBuyers(this.currentMonthData);
        if (buyers.length === 0) {
            alert('No buyers available');
            return;
        }

        const buyer = buyerId ?
            buyers.find(b => b.id === buyerId) :
            buyers[0];

        if (!buyer) return;

        // Get route
        const profile = getSupplierProfile(position.supplierId);
        const buyerProfile = getBuyerProfile(buyer.id);
        const route = this.findRoute(profile.port, buyerProfile.port);

        const sellRevenue = this.calculateSellRevenue(buyer, route);
        const profit = (sellRevenue.perMT - position.buyPrice) * position.quantity;

        const modalHTML = `
            <div class="modal-overlay" id="sell-modal">
                <div class="modal trade-modal">
                    <div class="modal-header">
                        <h2>Sell Copper</h2>
                        <button class="modal-close" onclick="Trading.closeModal('sell-modal')">×</button>
                    </div>

                    <div class="trade-buyer">
                        <div class="avatar avatar-${buyerProfile.avatar}"></div>
                        <div class="buyer-info">
                            <h3>${buyerProfile.name}</h3>
                            <p>${buyerProfile.company}, ${buyerProfile.country}</p>
                        </div>
                    </div>

                    <div class="trade-breakdown">
                        <div class="breakdown-row">
                            <span>Base Price (${sellRevenue.breakdown.exchange.toUpperCase()} ${sellRevenue.breakdown.pricingType})</span>
                            <span>$${sellRevenue.breakdown.basePrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Buyer Premium</span>
                            <span>+$${sellRevenue.breakdown.premium.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Freight (${profile.port} → ${buyerProfile.port})</span>
                            <span>-$${sellRevenue.breakdown.freightCost.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row highlight">
                            <span>Net Price</span>
                            <span>$${sellRevenue.perMT.toLocaleString()}/MT</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Cargo Size</span>
                            <span>${position.quantity.toLocaleString()} MT</span>
                        </div>
                        <div class="breakdown-row total">
                            <span>Total Revenue</span>
                            <span>$${sellRevenue.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="trade-pnl">
                        <h4>Trade P&L</h4>
                        <div class="pnl-row">
                            <span>Buy Cost</span>
                            <span>$${position.buyCost.toLocaleString()}</span>
                        </div>
                        <div class="pnl-row">
                            <span>Sell Revenue</span>
                            <span>$${sellRevenue.total.toLocaleString()}</span>
                        </div>
                        <div class="pnl-row total ${profit >= 0 ? 'positive' : 'negative'}">
                            <span>Profit/Loss</span>
                            <span>${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="Trading.closeModal('sell-modal')">
                            Cancel
                        </button>
                        <button class="btn btn-sell" onclick="Trading.executeSell('${position.id}', '${buyer.id}')">
                            Confirm Sale
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Execute sell trade
     * @param {string} positionId
     * @param {string} buyerId
     */
    executeSell(positionId, buyerId) {
        const position = GameState.getPhysicalPositions().find(p => p.id === positionId);
        if (!position) return;

        const buyer = this.currentMonthData.buyers.find(b => b.id === buyerId);
        if (!buyer) return;

        const buyerProfile = getBuyerProfile(buyerId);
        const supplierProfile = getSupplierProfile(position.supplierId);
        const route = this.findRoute(supplierProfile.port, buyerProfile.port);

        const sellRevenue = this.calculateSellRevenue(buyer, route);
        const profit = sellRevenue.total - position.buyCost;

        // Repay LOC if used
        if (position.financing === 'loc') {
            GameState.repayLoc(position.buyCost);
        }

        // Close position with P&L
        GameState.closePhysicalPosition(positionId, profit);

        // Record trade for progression
        Progression.recordCompletedTrade({
            realizedPnL: profit,
            type: 'physical'
        });

        // Trigger first loss lesson
        if (profit < 0 && !GameState.hasLessonTrigger('firstLoss')) {
            GameState.setLessonTrigger('firstLoss');
            if (typeof Microlearning !== 'undefined') {
                setTimeout(() => {
                    Microlearning.triggerLesson('freight_impact');
                }, 2000);
            }
        }

        // Close modal
        this.closeModal('sell-modal');

        // Update UI
        if (typeof App !== 'undefined' && App.updateUI) {
            App.updateUI();
        }

        // Show confirmation
        const profitText = profit >= 0 ? `Profit: +$${profit.toLocaleString()}` : `Loss: $${profit.toLocaleString()}`;
        this.showConfirmation('Sale Complete!', profitText);

        console.log('[Trading] Sell executed:', positionId, 'P&L:', profit);
    },

    /**
     * Find route between ports
     * @param {string} fromPort
     * @param {string} toPort
     * @returns {Object|null}
     */
    findRoute(fromPort, toPort) {
        // Placeholder - would use routes.json data
        const routes = {
            'Callao_Shanghai': { freightRate: 45, transitDays: 35 },
            'Callao_Houston': { freightRate: 25, transitDays: 15 },
            'Callao_Rotterdam': { freightRate: 35, transitDays: 25 },
            'Valparaiso_Shanghai': { freightRate: 42, transitDays: 33 },
            'Valparaiso_Houston': { freightRate: 22, transitDays: 12 },
            'Durban_Rotterdam': { freightRate: 30, transitDays: 20 },
            'Durban_Shanghai': { freightRate: 35, transitDays: 25 }
        };

        const key = `${fromPort}_${toPort}`;
        return routes[key] || { freightRate: 40, transitDays: 30 };
    },

    /**
     * Show futures trading modal (Tier 4 only)
     * @param {string} action - 'buy' or 'sell'
     */
    showFuturesModal(action = 'buy') {
        if (!isFeatureEnabled('futuresTrading')) {
            alert('Futures trading not available in this tier');
            return;
        }

        const currentPrice = getRelevantPrice(this.currentMonthData, 'lme', false);
        const contractSize = GameConfig.constants.futuresContractSize;
        const marginReq = GameConfig.constants.marginRequirement;

        const modalHTML = `
            <div class="modal-overlay" id="futures-modal">
                <div class="modal trade-modal">
                    <div class="modal-header">
                        <h2>${action === 'buy' ? 'Buy' : 'Sell'} Futures</h2>
                        <button class="modal-close" onclick="Trading.closeModal('futures-modal')">×</button>
                    </div>

                    <div class="futures-info">
                        <div class="info-row">
                            <span>Current LME Price</span>
                            <span>$${currentPrice.toLocaleString()}/MT</span>
                        </div>
                        <div class="info-row">
                            <span>Contract Size</span>
                            <span>${contractSize} MT</span>
                        </div>
                        <div class="info-row">
                            <span>Margin Requirement</span>
                            <span>${(marginReq * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Number of Contracts</label>
                        <input type="number" class="form-input" id="futures-contracts"
                               value="1" min="1" max="100"
                               onchange="Trading.updateFuturesCalc()">
                    </div>

                    <div class="futures-calc" id="futures-calc">
                        <div class="calc-row">
                            <span>Notional Value</span>
                            <span id="futures-notional">$${(currentPrice * contractSize).toLocaleString()}</span>
                        </div>
                        <div class="calc-row">
                            <span>Margin Required</span>
                            <span id="futures-margin">$${(currentPrice * contractSize * marginReq).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="Trading.closeModal('futures-modal')">
                            Cancel
                        </button>
                        <button class="btn ${action === 'buy' ? 'btn-buy' : 'btn-sell'}"
                                onclick="Trading.executeFutures('${action}')">
                            ${action === 'buy' ? 'Buy' : 'Sell'} Futures
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Update futures calculation display
     */
    updateFuturesCalc() {
        const contracts = parseInt(document.getElementById('futures-contracts').value) || 1;
        const currentPrice = getRelevantPrice(this.currentMonthData, 'lme', false);
        const contractSize = GameConfig.constants.futuresContractSize;
        const marginReq = GameConfig.constants.marginRequirement;

        const notional = currentPrice * contractSize * contracts;
        const margin = notional * marginReq;

        document.getElementById('futures-notional').textContent = '$' + notional.toLocaleString();
        document.getElementById('futures-margin').textContent = '$' + margin.toLocaleString();
    },

    /**
     * Execute futures trade
     * @param {string} action - 'buy' or 'sell'
     */
    executeFutures(action) {
        const contracts = parseInt(document.getElementById('futures-contracts').value) || 1;
        const currentPrice = getRelevantPrice(this.currentMonthData, 'lme', false);
        const contractSize = GameConfig.constants.futuresContractSize;
        const marginReq = GameConfig.constants.marginRequirement;

        const notional = currentPrice * contractSize * contracts;
        const margin = notional * marginReq;

        // Check if player has enough margin
        if (GameState.getFunds() < margin) {
            alert('Insufficient funds for margin!');
            return;
        }

        // Deduct margin
        GameState.updateFunds(-margin);

        // Create futures position
        const position = {
            type: 'futures',
            side: action === 'buy' ? 'long' : 'short',
            contracts: contracts,
            entryPrice: currentPrice,
            notionalValue: notional,
            marginPosted: margin,
            exchange: 'lme'
        };

        const positionId = GameState.addFuturesPosition(position);

        // Trigger first futures position lesson
        if (!GameState.hasLessonTrigger('firstFuturesPosition')) {
            GameState.setLessonTrigger('firstFuturesPosition');
            if (typeof Microlearning !== 'undefined') {
                setTimeout(() => {
                    Microlearning.triggerLesson('margin_management');
                }, 2000);
            }
        }

        // Record hedge for progression
        if (action === 'sell') {
            Progression.recordHedge(position);
        }

        // Close modal
        this.closeModal('futures-modal');

        // Update UI
        if (typeof App !== 'undefined' && App.updateUI) {
            App.updateUI();
        }

        this.showConfirmation('Futures Trade Executed!',
            `${action === 'buy' ? 'Bought' : 'Sold'} ${contracts} contract(s) at $${currentPrice.toLocaleString()}/MT`);

        console.log('[Trading] Futures executed:', positionId);
    },

    /**
     * Show confirmation toast
     * @param {string} title
     * @param {string} message
     */
    showConfirmation(title, message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">✓</span>
                <div>
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Close modal by ID
     * @param {string} modalId
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Initialize trading system
     */
    init() {
        console.log('[Trading] Initialized');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Trading;
}
