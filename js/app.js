/**
 * app.js - Main Application Initialization for GV_TEST Copper Trading Simulator
 */

const App = {
    // Month data array
    monthData: [],

    // Current active panel (standard layout)
    activePanel: 'markets',

    /**
     * Initialize the application
     */
    async init() {
        console.log('[App] Initializing GV_TEST Copper Trading Simulator...');

        try {
            // Load month data
            this.loadMonthData();

            // Initialize game state
            const savedState = GameState.load();
            GameState.init(savedState);

            // Initialize progression system
            Progression.init();

            // Initialize all systems
            Microlearning.init();
            Scoring.init();
            Trading.init();

            // Set current month data for trading
            Trading.setMonthData(this.getCurrentMonthData());

            // Initialize widgets based on layout
            this.initializeLayout();

            // Subscribe to state changes
            this.subscribeToStateChanges();

            // Hide loading screen
            this.hideLoadingScreen();

            // Show initial tutorial if needed
            this.checkInitialTutorial();

            // Auto-save periodically
            setInterval(() => GameState.save(), 30000);

            console.log('[App] Initialization complete!');

        } catch (error) {
            console.error('[App] Initialization error:', error);
            this.showError('Failed to initialize game. Please refresh.');
        }
    },

    /**
     * Load month data from globals
     */
    loadMonthData() {
        this.monthData = [
            typeof JanuaryData !== 'undefined' ? JanuaryData : this.getPlaceholderMonthData('January'),
            typeof FebruaryData !== 'undefined' ? FebruaryData : this.getPlaceholderMonthData('February'),
            typeof MarchData !== 'undefined' ? MarchData : this.getPlaceholderMonthData('March'),
            typeof AprilData !== 'undefined' ? AprilData : this.getPlaceholderMonthData('April'),
            typeof MayData !== 'undefined' ? MayData : this.getPlaceholderMonthData('May'),
            typeof JuneData !== 'undefined' ? JuneData : this.getPlaceholderMonthData('June')
        ];

        console.log('[App] Month data loaded:', this.monthData.length, 'months');
    },

    /**
     * Get placeholder month data (for development)
     * @param {string} monthName
     * @returns {Object}
     */
    getPlaceholderMonthData(monthName) {
        const basePrice = 8500 + Math.random() * 500;
        return {
            month: monthName,
            prices: {
                lme_spot: Math.round(basePrice),
                lme_m1: Math.round(basePrice + 50 + Math.random() * 100),
                comex_spot: Math.round(basePrice + 30 + Math.random() * 80),
                comex_m1: Math.round(basePrice + 80 + Math.random() * 120)
            },
            suppliers: [
                { id: 'peru_carlos', premium: 85, available: true, pricingType: 'spot' },
                { id: 'chile_maria', premium: 75, available: true, pricingType: 'm1' },
                { id: 'zambia_joseph', premium: 65, available: true, pricingType: 'spot' },
                { id: 'congo_emmanuel', premium: 60, available: true, pricingType: 'm1' }
            ],
            buyers: [
                { id: 'shanghai_wei', premium: 120, exchange: 'lme', pricingType: 'spot' },
                { id: 'houston_mike', premium: 95, exchange: 'comex', pricingType: 'm1' },
                { id: 'rotterdam_anna', premium: 100, exchange: 'lme', pricingType: 'm1' },
                { id: 'mumbai_raj', premium: 110, exchange: 'lme', pricingType: 'spot' }
            ],
            events: []
        };
    },

    /**
     * Get current month's data
     * @returns {Object}
     */
    getCurrentMonthData() {
        const monthIndex = GameState.getCurrentMonthIndex();
        return this.monthData[monthIndex] || this.monthData[0];
    },

    /**
     * Initialize layout based on current tier
     */
    initializeLayout() {
        const config = getActiveConfig();
        const isSimplified = config.layout === 'simplified';

        // Show appropriate layout
        document.getElementById('layout-simplified').classList.toggle('hidden', !isSimplified);
        document.getElementById('layout-standard').classList.toggle('hidden', isSimplified);

        // Add tier class to body
        document.body.className = `tier-${GameState.getCurrentTier()}`;

        if (isSimplified) {
            this.initSimplifiedLayout();
        } else {
            this.initStandardLayout();
        }
    },

    /**
     * Initialize simplified layout (Tier 1)
     */
    initSimplifiedLayout() {
        // Update progress bar
        Progression.updateProgressBar();

        // Update financial display
        this.updateSimplifiedFinancials();

        // Update trade cards
        this.updateSimplifiedTradeCards();

        // Initialize map
        setTimeout(() => {
            MapWidget.init();
        }, 100);
    },

    /**
     * Initialize standard layout (Tier 2+)
     */
    initStandardLayout() {
        // Update header
        this.updateStandardHeader();

        // Update progress bar
        const progressContainer = document.getElementById('tier-progress-container-standard');
        if (progressContainer) {
            progressContainer.innerHTML = Progression.getProgressBarHTML();
        }

        // Update tier badge
        const badgeContainer = document.getElementById('tier-badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = Progression.getTierBadgeHTML();
        }

        // Initialize widgets
        Markets.init();
        Positions.init();
        Futures.init();
        Analytics.init();

        // Initialize map
        setTimeout(() => {
            MapWidget.init();
        }, 100);

        // Hide/show features based on tier
        this.updateFeatureVisibility();
    },

    /**
     * Update feature visibility based on tier
     */
    updateFeatureVisibility() {
        // Futures nav button
        const futuresNav = document.getElementById('nav-futures');
        if (futuresNav) {
            futuresNav.style.display = isFeatureEnabled('futuresTrading') ? 'flex' : 'none';
        }

        // Futures tab in positions
        const futuresTab = document.getElementById('tab-futures-pos');
        if (futuresTab) {
            futuresTab.parentElement.style.display = isFeatureEnabled('futuresTrading') ? 'flex' : 'none';
        }

        // LOC display
        const locBox = document.getElementById('loc-box');
        if (locBox) {
            locBox.style.display = isFeatureEnabled('loc') ? 'block' : 'none';
        }

        // Buying power display
        const buyingPowerBox = document.getElementById('buying-power-box');
        if (buyingPowerBox) {
            buyingPowerBox.style.display = isFeatureEnabled('loc') ? 'block' : 'none';
        }
    },

    /**
     * Subscribe to game state changes
     */
    subscribeToStateChanges() {
        GameState.subscribe((eventType, state) => {
            console.log('[App] State change:', eventType);

            switch (eventType) {
                case 'fundsUpdate':
                case 'locUpdate':
                case 'inventoryUpdate':
                    this.updateUI();
                    break;

                case 'positionAdd':
                case 'positionClose':
                case 'positionUpdate':
                    this.updatePositions();
                    break;

                case 'tierAdvance':
                    this.onTierChange(state.currentTier);
                    break;

                case 'monthAdvance':
                    this.onMonthChange();
                    break;
            }
        });
    },

    /**
     * Update all UI elements
     */
    updateUI() {
        const isSimplified = isSimplifiedLayout();

        if (isSimplified) {
            this.updateSimplifiedFinancials();
            this.updateSimplifiedTradeCards();
        } else {
            this.updateStandardHeader();
            Markets.update();
            Positions.update();
            Futures.update();
            Analytics.update();
        }

        Progression.updateProgressBar();
    },

    /**
     * Update simplified layout financials
     */
    updateSimplifiedFinancials() {
        const fundsEl = document.getElementById('funds-simple');
        const pnlEl = document.getElementById('pnl-simple');

        if (fundsEl) {
            fundsEl.textContent = '$' + GameState.getFunds().toLocaleString();
        }

        if (pnlEl) {
            const pnl = GameState.getPnL();
            pnlEl.textContent = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toLocaleString();
            pnlEl.className = 'stat-value pnl ' + (pnl >= 0 ? 'positive' : 'negative');
        }

        // Update progress container
        const progressContainer = document.getElementById('tier-progress-container');
        if (progressContainer) {
            progressContainer.innerHTML = Progression.getProgressBarHTML();
        }
    },

    /**
     * Update simplified trade cards
     */
    updateSimplifiedTradeCards() {
        const monthData = this.getCurrentMonthData();
        if (!monthData) return;

        // Get first supplier and buyer for simplified view
        const suppliers = getEnabledSuppliers(monthData);
        const buyers = getEnabledBuyers(monthData);

        if (suppliers.length > 0) {
            const supplier = suppliers[0];
            const buyCost = Trading.calculateBuyCost(supplier);

            const priceEl = document.getElementById('buy-price-simple');
            const premiumEl = document.getElementById('buy-premium-simple');
            const totalEl = document.getElementById('buy-total-simple');

            if (priceEl) priceEl.textContent = '$' + buyCost.breakdown.basePrice.toLocaleString() + '/MT';
            if (premiumEl) premiumEl.textContent = '+$' + supplier.premium + '/MT';
            if (totalEl) totalEl.textContent = '$' + buyCost.total.toLocaleString();
        }

        if (buyers.length > 0) {
            const buyer = buyers[0];
            const route = Trading.findRoute('Callao', 'Shanghai');
            const sellRevenue = Trading.calculateSellRevenue(buyer, route);

            const priceEl = document.getElementById('sell-price-simple');
            const premiumEl = document.getElementById('sell-premium-simple');
            const freightEl = document.getElementById('freight-cost-simple');
            const totalEl = document.getElementById('sell-total-simple');

            if (priceEl) priceEl.textContent = '$' + sellRevenue.breakdown.basePrice.toLocaleString() + '/MT';
            if (premiumEl) premiumEl.textContent = '+$' + buyer.premium + '/MT';
            if (freightEl) freightEl.textContent = '-$' + route.freightRate + '/MT';
            if (totalEl) totalEl.textContent = '$' + sellRevenue.total.toLocaleString();
        }

        // Update sell button state
        const positions = GameState.getOpenPositions();
        const sellBtn = document.getElementById('btn-sell-simple');
        const sellHint = document.getElementById('sell-hint-simple');

        if (sellBtn) {
            sellBtn.disabled = positions.length === 0;
        }
        if (sellHint) {
            sellHint.style.display = positions.length === 0 ? 'block' : 'none';
        }

        // Update active position display
        this.updateSimplifiedPosition();
    },

    /**
     * Update simplified position display
     */
    updateSimplifiedPosition() {
        const container = document.getElementById('active-position-simple');
        if (!container) return;

        const positions = GameState.getOpenPositions();

        if (positions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        const position = positions[0];
        const monthData = this.getCurrentMonthData();
        const currentPrice = getRelevantPrice(monthData, 'lme', false);
        const unrealizedPnL = (currentPrice - position.buyPrice) * position.quantity;

        document.getElementById('position-status-simple').textContent = position.status.replace('_', ' ');
        document.getElementById('position-buy-price').textContent = '$' + position.buyPrice.toLocaleString() + '/MT';
        document.getElementById('position-current-price').textContent = '$' + currentPrice.toLocaleString() + '/MT';

        const pnlEl = document.getElementById('position-unrealized-pnl');
        pnlEl.textContent = (unrealizedPnL >= 0 ? '+$' : '-$') + Math.abs(unrealizedPnL).toLocaleString();
        pnlEl.className = 'pnl ' + (unrealizedPnL >= 0 ? 'positive' : 'negative');
    },

    /**
     * Update standard header display
     */
    updateStandardHeader() {
        const state = GameState.getState();

        // Period
        const periodEl = document.getElementById('current-period');
        if (periodEl) {
            periodEl.textContent = GameState.getCurrentMonthName() + ' 2024';
        }

        // Funds
        const fundsEl = document.getElementById('funds-display');
        if (fundsEl) {
            fundsEl.textContent = '$' + state.funds.toLocaleString();
        }

        // P&L
        const pnlEl = document.getElementById('pnl-display');
        if (pnlEl) {
            const pnl = GameState.getPnL();
            pnlEl.textContent = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toLocaleString();
            pnlEl.className = 'stat-value pnl ' + (pnl >= 0 ? 'positive' : 'negative');
        }

        // Buying Power
        const bpEl = document.getElementById('buying-power-display');
        if (bpEl) {
            bpEl.textContent = '$' + GameState.getBuyingPower().toLocaleString();
        }

        // Inventory
        const invEl = document.getElementById('inventory-display');
        if (invEl) {
            invEl.textContent = state.inventory.copper.toLocaleString() + ' MT';
        }

        // LOC
        const locEl = document.getElementById('loc-display');
        if (locEl) {
            locEl.textContent = '$' + (state.locUsed / 1000000).toFixed(1) + 'M / $' +
                (state.locLimit / 1000000).toFixed(0) + 'M';
        }
    },

    /**
     * Update positions display
     */
    updatePositions() {
        if (!isSimplifiedLayout()) {
            Positions.update();
        }
        this.updateSimplifiedPosition();
        MapWidget.update();
    },

    /**
     * Show panel in workspace
     * @param {string} panelId
     */
    showPanel(panelId) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.panel === panelId);
        });

        this.activePanel = panelId;
    },

    /**
     * Maximize a panel
     * @param {string} panelId
     */
    maximizePanel(panelId) {
        const panel = document.getElementById('panel-' + panelId);
        if (panel) {
            panel.classList.toggle('maximized');

            // Resize map if needed
            if (panelId === 'map') {
                setTimeout(() => MapWidget.resize(), 100);
            }
        }
    },

    /**
     * Advance to next month
     */
    advanceMonth() {
        if (!GameState.advanceMonth()) {
            this.showGameEnd();
            return;
        }

        // Update month data
        Trading.setMonthData(this.getCurrentMonthData());

        // Record month for progression
        Progression.recordMonthComplete();

        // Record price for analytics
        Analytics.recordPrice(this.getCurrentMonthData());

        // Update UI
        this.updateUI();

        // Save game
        GameState.save();
    },

    /**
     * Handle tier change
     * @param {number} newTier
     */
    onTierChange(newTier) {
        console.log('[App] Tier changed to:', newTier);

        // Reinitialize layout
        this.initializeLayout();

        // Save game
        GameState.save();
    },

    /**
     * Handle month change
     */
    onMonthChange() {
        console.log('[App] Month changed to:', GameState.getCurrentMonthName());
        this.updateUI();
    },

    /**
     * Check and show initial tutorial
     */
    checkInitialTutorial() {
        const state = GameState.getState();

        if (state.ui.showTutorial && !GameState.isLessonCompleted('intro_physical_trading')) {
            // Show intro lesson after short delay
            setTimeout(() => {
                Microlearning.showLesson('intro_physical_trading');
            }, 1000);
        }
    },

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    },

    /**
     * Show game end screen
     */
    showGameEnd() {
        Progression.showGameCompleteModal();
    },

    /**
     * Restart the game
     * @param {boolean} keepProgress
     */
    restart(keepProgress = false) {
        GameState.reset(keepProgress);
        GameState.save();
        location.reload();
    },

    /**
     * Show error message
     * @param {string} message
     */
    showError(message) {
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.innerHTML = `
                <h1>Error</h1>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Reload</button>
            `;
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
