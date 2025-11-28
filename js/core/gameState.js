/**
 * gameState.js - Central State Management for GV_TEST Copper Trading Simulator
 *
 * Manages all game state including:
 * - Current tier and progression
 * - Financial state (funds, P&L, LOC)
 * - Open positions and trades
 * - Futures positions
 * - Game timeline (current month)
 */

const GameState = {
    // ========================================================================
    // CORE STATE
    // ========================================================================

    // Current state object (initialized by init())
    state: null,

    // State change listeners
    listeners: [],

    // Default initial state
    defaultState: {
        // Tier and progression
        currentTier: 1,
        tierProgress: {
            1: { profitableTrades: 0, completed: false },
            2: { monthsSurvived: 0, adverseMoveOccurred: false, completed: false },
            3: { basisTradesCompleted: 0, completed: false },
            4: { monthsCompleted: 0, hedgesExecuted: 0, completed: false }
        },

        // Timeline
        currentMonth: 0, // Index into month data array (0 = January)
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June'],
        gameStarted: false,
        gameEnded: false,

        // Financial state
        funds: 500000,
        startingFunds: 500000,
        locUsed: 0,
        locLimit: 500000, // Reduced for balance

        // Positions
        physicalPositions: [], // Active physical trades
        futuresPositions: [], // Active futures positions
        completedTrades: [], // Historical trades

        // Inventory
        inventory: {
            copper: 0 // MT in transit or storage
        },

        // Analytics
        analytics: {
            totalTrades: 0,
            profitableTrades: 0,
            totalPnL: 0,
            bestTrade: 0,
            worstTrade: 0,
            averageMargin: 0
        },

        // UI state
        ui: {
            activePanels: ['markets', 'map', 'positions', 'analytics'],
            selectedPosition: null,
            showTutorial: true,
            lessonsCompleted: []
        },

        // Microlearning tracking
        shownLessons: [],
        lessonTriggers: {
            firstTrade: false,
            firstLoss: false,
            firstM1Settlement: false,
            firstLOCUse: false,
            firstBasisTrade: false,
            firstFuturesPosition: false
        },
        quizResults: {
            attempted: 0,
            correct: 0,
            byModule: {}
        }
    },

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /**
     * Initialize game state (fresh start or from saved state)
     * @param {Object} savedState - Optional saved state to restore
     */
    init(savedState = null) {
        if (savedState) {
            this.state = { ...this.defaultState, ...savedState };
        } else {
            this.state = JSON.parse(JSON.stringify(this.defaultState));
        }

        // Apply tier-specific initial values
        this.applyTierDefaults();

        console.log('[GameState] Initialized:', this.state);
        this.notifyListeners('init');
    },

    /**
     * Apply default values based on current tier
     */
    applyTierDefaults() {
        const tier = this.state.currentTier;
        const tierConfig = GameConfig.tiers[tier];

        // Set funds based on tier
        if (tier === 1) {
            this.state.funds = 500000;
            this.state.startingFunds = 500000;
        } else if (tier >= 2) {
            this.state.funds = 1000000;
            this.state.startingFunds = 1000000;
        }

        // Reset LOC based on tier
        if (!tierConfig.features.loc) {
            this.state.locUsed = 0;
            this.state.locLimit = 0;
        } else {
            this.state.locLimit = GameConfig.constants.locLimit;
        }
    },

    /**
     * Reset game state to defaults
     * @param {boolean} keepTier - If true, keeps current tier unlocks
     */
    reset(keepTier = false) {
        const preservedTierProgress = keepTier ?
            JSON.parse(JSON.stringify(this.state.tierProgress)) : null;
        const preservedTier = keepTier ? this.state.currentTier : 1;

        this.state = JSON.parse(JSON.stringify(this.defaultState));

        if (keepTier) {
            this.state.tierProgress = preservedTierProgress;
            this.state.currentTier = preservedTier;
        }

        this.applyTierDefaults();
        this.notifyListeners('reset');
    },

    // ========================================================================
    // TIER MANAGEMENT
    // ========================================================================

    /**
     * Get current tier number
     * @returns {number}
     */
    getCurrentTier() {
        return this.state.currentTier;
    },

    /**
     * Advance to next tier
     * @returns {boolean} Whether advancement was successful
     */
    advanceTier() {
        const currentTier = this.state.currentTier;

        if (currentTier >= 4) {
            console.log('[GameState] Already at max tier');
            return false;
        }

        // Mark current tier as completed
        this.state.tierProgress[currentTier].completed = true;

        // Advance to next tier
        this.state.currentTier = currentTier + 1;

        // Apply new tier defaults
        this.applyTierDefaults();

        console.log('[GameState] Advanced to Tier', this.state.currentTier);
        this.notifyListeners('tierAdvance');

        return true;
    },

    /**
     * Get progress for current tier
     * @returns {Object}
     */
    getTierProgress() {
        return this.state.tierProgress[this.state.currentTier];
    },

    /**
     * Update tier progress
     * @param {Object} updates - Progress updates
     */
    updateTierProgress(updates) {
        const currentTier = this.state.currentTier;
        this.state.tierProgress[currentTier] = {
            ...this.state.tierProgress[currentTier],
            ...updates
        };
        this.notifyListeners('tierProgress');
    },

    // ========================================================================
    // TIMELINE MANAGEMENT
    // ========================================================================

    /**
     * Get current month name
     * @returns {string}
     */
    getCurrentMonthName() {
        return this.state.monthNames[this.state.currentMonth];
    },

    /**
     * Get current month index
     * @returns {number}
     */
    getCurrentMonthIndex() {
        return this.state.currentMonth;
    },

    /**
     * Advance to next month
     * @returns {boolean} Whether advancement was successful
     */
    advanceMonth() {
        if (this.state.currentMonth >= this.state.monthNames.length - 1) {
            this.state.gameEnded = true;
            this.notifyListeners('gameEnd');
            return false;
        }

        this.state.currentMonth++;
        this.notifyListeners('monthAdvance');
        return true;
    },

    /**
     * Start the game
     */
    startGame() {
        this.state.gameStarted = true;
        this.notifyListeners('gameStart');
    },

    // ========================================================================
    // FINANCIAL MANAGEMENT
    // ========================================================================

    /**
     * Get current funds
     * @returns {number}
     */
    getFunds() {
        return this.state.funds;
    },

    /**
     * Get current P&L
     * @returns {number}
     */
    getPnL() {
        return this.state.funds - this.state.startingFunds;
    },

    /**
     * Update funds
     * @param {number} amount - Amount to add (negative for deduction)
     * @returns {boolean} Whether update was successful
     */
    updateFunds(amount) {
        const newFunds = this.state.funds + amount;

        if (newFunds < 0) {
            console.warn('[GameState] Insufficient funds');
            return false;
        }

        this.state.funds = newFunds;
        this.notifyListeners('fundsUpdate');
        return true;
    },

    /**
     * Get buying power (funds + available LOC)
     * @returns {number}
     */
    getBuyingPower() {
        const availableLoc = this.state.locLimit - this.state.locUsed;
        return this.state.funds + availableLoc;
    },

    /**
     * Use LOC financing
     * @param {number} amount - Amount to draw from LOC
     * @returns {boolean} Whether draw was successful
     */
    useLoc(amount) {
        const availableLoc = this.state.locLimit - this.state.locUsed;

        if (amount > availableLoc) {
            console.warn('[GameState] Insufficient LOC');
            return false;
        }

        this.state.locUsed += amount;
        this.notifyListeners('locUpdate');
        return true;
    },

    /**
     * Repay LOC
     * @param {number} amount - Amount to repay
     */
    repayLoc(amount) {
        this.state.locUsed = Math.max(0, this.state.locUsed - amount);
        this.notifyListeners('locUpdate');
    },

    // ========================================================================
    // POSITION MANAGEMENT
    // ========================================================================

    /**
     * Add a physical position (trade)
     * @param {Object} position - Position data
     * @returns {string} Position ID
     */
    addPhysicalPosition(position) {
        const positionId = 'PHY-' + Date.now();
        const newPosition = {
            id: positionId,
            createdAt: new Date().toISOString(),
            createdMonth: this.state.currentMonth,
            status: 'open', // open, in_transit, delivered, completed
            ...position
        };

        this.state.physicalPositions.push(newPosition);
        this.updateInventory(position.quantity || 0);
        this.notifyListeners('positionAdd');

        return positionId;
    },

    /**
     * Update a physical position
     * @param {string} positionId - Position ID
     * @param {Object} updates - Updates to apply
     */
    updatePhysicalPosition(positionId, updates) {
        const index = this.state.physicalPositions.findIndex(p => p.id === positionId);

        if (index === -1) {
            console.warn('[GameState] Position not found:', positionId);
            return;
        }

        this.state.physicalPositions[index] = {
            ...this.state.physicalPositions[index],
            ...updates
        };

        this.notifyListeners('positionUpdate');
    },

    /**
     * Close a physical position
     * @param {string} positionId - Position ID
     * @param {number} pnl - Realized P&L
     */
    closePhysicalPosition(positionId, pnl) {
        const index = this.state.physicalPositions.findIndex(p => p.id === positionId);

        if (index === -1) {
            console.warn('[GameState] Position not found:', positionId);
            return;
        }

        const position = this.state.physicalPositions[index];
        position.status = 'completed';
        position.closedAt = new Date().toISOString();
        position.closedMonth = this.state.currentMonth;
        position.realizedPnL = pnl;

        // Move to completed trades
        this.state.completedTrades.push(position);
        this.state.physicalPositions.splice(index, 1);

        // Update inventory
        this.updateInventory(-(position.quantity || 0));

        // Update analytics
        this.updateAnalytics(pnl);

        // Update funds
        this.updateFunds(pnl);

        this.notifyListeners('positionClose');
    },

    /**
     * Get all physical positions
     * @returns {Array}
     */
    getPhysicalPositions() {
        return this.state.physicalPositions;
    },

    /**
     * Get open physical positions only
     * @returns {Array}
     */
    getOpenPositions() {
        return this.state.physicalPositions.filter(p => p.status !== 'completed');
    },

    // ========================================================================
    // FUTURES MANAGEMENT
    // ========================================================================

    /**
     * Add a futures position
     * @param {Object} position - Futures position data
     * @returns {string} Position ID
     */
    addFuturesPosition(position) {
        const positionId = 'FUT-' + Date.now();
        const newPosition = {
            id: positionId,
            createdAt: new Date().toISOString(),
            createdMonth: this.state.currentMonth,
            status: 'open',
            ...position
        };

        this.state.futuresPositions.push(newPosition);
        this.notifyListeners('futuresAdd');

        return positionId;
    },

    /**
     * Close a futures position
     * @param {string} positionId - Position ID
     * @param {number} pnl - Realized P&L
     */
    closeFuturesPosition(positionId, pnl) {
        const index = this.state.futuresPositions.findIndex(p => p.id === positionId);

        if (index === -1) {
            console.warn('[GameState] Futures position not found:', positionId);
            return;
        }

        const position = this.state.futuresPositions[index];
        position.status = 'closed';
        position.closedAt = new Date().toISOString();
        position.realizedPnL = pnl;

        // Update funds with P&L
        this.updateFunds(pnl);

        // Remove from active positions
        this.state.futuresPositions.splice(index, 1);

        this.notifyListeners('futuresClose');
    },

    /**
     * Get all futures positions
     * @returns {Array}
     */
    getFuturesPositions() {
        return this.state.futuresPositions;
    },

    // ========================================================================
    // INVENTORY MANAGEMENT
    // ========================================================================

    /**
     * Update copper inventory
     * @param {number} amount - Amount to add (negative for reduction)
     */
    updateInventory(amount) {
        this.state.inventory.copper += amount;
        this.notifyListeners('inventoryUpdate');
    },

    /**
     * Get current inventory
     * @returns {Object}
     */
    getInventory() {
        return this.state.inventory;
    },

    // ========================================================================
    // ANALYTICS
    // ========================================================================

    /**
     * Update analytics after a trade closes
     * @param {number} pnl - Realized P&L from the trade
     */
    updateAnalytics(pnl) {
        const analytics = this.state.analytics;

        analytics.totalTrades++;
        analytics.totalPnL += pnl;

        if (pnl > 0) {
            analytics.profitableTrades++;

            // Update tier progress for profitable trade
            if (this.state.currentTier === 1) {
                this.updateTierProgress({
                    profitableTrades: this.state.tierProgress[1].profitableTrades + 1
                });
            }
        }

        if (pnl > analytics.bestTrade) {
            analytics.bestTrade = pnl;
        }

        if (pnl < analytics.worstTrade) {
            analytics.worstTrade = pnl;
        }

        analytics.averageMargin = analytics.totalPnL / analytics.totalTrades;

        this.notifyListeners('analyticsUpdate');
    },

    /**
     * Get analytics data
     * @returns {Object}
     */
    getAnalytics() {
        return this.state.analytics;
    },

    // ========================================================================
    // UI STATE
    // ========================================================================

    /**
     * Mark a lesson as completed
     * @param {string} lessonId
     */
    completeLesson(lessonId) {
        if (!this.state.ui.lessonsCompleted.includes(lessonId)) {
            this.state.ui.lessonsCompleted.push(lessonId);
            this.notifyListeners('lessonComplete');
        }
    },

    /**
     * Check if a lesson has been completed
     * @param {string} lessonId
     * @returns {boolean}
     */
    isLessonCompleted(lessonId) {
        return this.state.ui.lessonsCompleted.includes(lessonId);
    },

    /**
     * Set selected position
     * @param {string|null} positionId
     */
    setSelectedPosition(positionId) {
        this.state.ui.selectedPosition = positionId;
        this.notifyListeners('selectionChange');
    },

    // ========================================================================
    // MICROLEARNING TRACKING
    // ========================================================================

    /**
     * Mark a lesson as shown
     * @param {string} lessonId
     */
    markLessonShown(lessonId) {
        if (!this.state.shownLessons.includes(lessonId)) {
            this.state.shownLessons.push(lessonId);
            this.notifyListeners('lessonShown');
        }
    },

    /**
     * Check if a lesson has been shown
     * @param {string} lessonId
     * @returns {boolean}
     */
    hasLessonBeenShown(lessonId) {
        return this.state.shownLessons.includes(lessonId);
    },

    /**
     * Track a quiz attempt
     * @param {string} lessonId
     * @param {boolean} correct
     */
    trackQuizAttempt(lessonId, correct) {
        this.state.quizResults.attempted++;
        if (correct) {
            this.state.quizResults.correct++;
        }

        // Track by module
        if (!this.state.quizResults.byModule[lessonId]) {
            this.state.quizResults.byModule[lessonId] = { attempted: 0, correct: 0 };
        }
        this.state.quizResults.byModule[lessonId].attempted++;
        if (correct) {
            this.state.quizResults.byModule[lessonId].correct++;
        }

        this.notifyListeners('quizAttempt');
    },

    /**
     * Get quiz statistics
     * @returns {Object}
     */
    getQuizStats() {
        return this.state.quizResults;
    },

    /**
     * Set a lesson trigger flag
     * @param {string} triggerName
     */
    setLessonTrigger(triggerName) {
        if (this.state.lessonTriggers.hasOwnProperty(triggerName)) {
            this.state.lessonTriggers[triggerName] = true;
            this.notifyListeners('lessonTrigger');
        }
    },

    /**
     * Check if a lesson trigger has been set
     * @param {string} triggerName
     * @returns {boolean}
     */
    hasLessonTrigger(triggerName) {
        return this.state.lessonTriggers[triggerName] === true;
    },

    // ========================================================================
    // PERSISTENCE
    // ========================================================================

    /**
     * Save state to localStorage
     */
    save() {
        try {
            localStorage.setItem('gv_test_state', JSON.stringify(this.state));
            console.log('[GameState] Saved to localStorage');
        } catch (e) {
            console.error('[GameState] Save failed:', e);
        }
    },

    /**
     * Load state from localStorage
     * @returns {Object|null}
     */
    load() {
        try {
            const saved = localStorage.getItem('gv_test_state');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('[GameState] Load failed:', e);
            return null;
        }
    },

    /**
     * Clear saved state
     */
    clearSave() {
        localStorage.removeItem('gv_test_state');
        console.log('[GameState] Save cleared');
    },

    // ========================================================================
    // EVENT SYSTEM
    // ========================================================================

    /**
     * Subscribe to state changes
     * @param {Function} callback - Function to call on state change
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },

    /**
     * Notify all listeners of state change
     * @param {string} eventType - Type of change that occurred
     */
    notifyListeners(eventType) {
        this.listeners.forEach(callback => {
            try {
                callback(eventType, this.state);
            } catch (e) {
                console.error('[GameState] Listener error:', e);
            }
        });
    },

    // ========================================================================
    // DEBUG
    // ========================================================================

    /**
     * Get full state (for debugging)
     * @returns {Object}
     */
    getState() {
        return this.state;
    },

    /**
     * Force set tier (for testing)
     * @param {number} tier
     */
    debugSetTier(tier) {
        if (tier >= 1 && tier <= 4) {
            this.state.currentTier = tier;
            this.applyTierDefaults();
            this.notifyListeners('debugTierChange');
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
