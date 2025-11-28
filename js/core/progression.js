/**
 * progression.js - Tier Advancement Logic for GV_TEST Copper Trading Simulator
 *
 * Handles:
 * - Progress tracking within each tier
 * - Gate conditions for tier advancement
 * - Unlock modals and celebrations
 * - Achievement tracking
 */

const Progression = {
    // ========================================================================
    // TIER GATE CONDITIONS
    // ========================================================================

    /**
     * Tier 1 Gate: Complete 3 profitable trades
     * @returns {Object} { met: boolean, current: number, target: number, description: string }
     */
    checkTier1Gate() {
        const progress = GameState.getTierProgress();
        const target = GameConfig.tiers[1].progression.target;

        return {
            met: progress.profitableTrades >= target,
            current: progress.profitableTrades,
            target: target,
            description: `${progress.profitableTrades}/${target} Profitable Trades`,
            progressPercent: Math.min(100, (progress.profitableTrades / target) * 100)
        };
    },

    /**
     * Tier 2 Gate: Survive adverse price move over 3 months
     * @returns {Object}
     */
    checkTier2Gate() {
        const progress = GameState.getTierProgress();
        const target = GameConfig.tiers[2].progression.target;

        // Must have experienced adverse move AND survived 3 months
        const survived = progress.adverseMoveOccurred && progress.monthsSurvived >= target;

        return {
            met: survived,
            current: progress.monthsSurvived,
            target: target,
            adverseMoveOccurred: progress.adverseMoveOccurred,
            description: progress.adverseMoveOccurred ?
                `${progress.monthsSurvived}/${target} Months Survived` :
                'Awaiting adverse price move...',
            progressPercent: progress.adverseMoveOccurred ?
                Math.min(100, (progress.monthsSurvived / target) * 100) : 0
        };
    },

    /**
     * Tier 3 Gate: Execute a profitable basis trade
     * @returns {Object}
     */
    checkTier3Gate() {
        const progress = GameState.getTierProgress();
        const target = GameConfig.tiers[3].progression.target;

        return {
            met: progress.basisTradesCompleted >= target,
            current: progress.basisTradesCompleted,
            target: target,
            description: `${progress.basisTradesCompleted}/${target} Profitable Basis Trade`,
            progressPercent: Math.min(100, (progress.basisTradesCompleted / target) * 100)
        };
    },

    /**
     * Tier 4 Gate: Complete 6-month campaign with demonstrated hedge
     * @returns {Object}
     */
    checkTier4Gate() {
        const progress = GameState.getTierProgress();
        const monthTarget = GameConfig.tiers[4].progression.target;

        // Must complete 6 months AND have at least one successful hedge
        const campaignComplete = progress.monthsCompleted >= monthTarget;
        const hedgeDemonstrated = progress.hedgesExecuted > 0;

        return {
            met: campaignComplete && hedgeDemonstrated,
            monthsComplete: progress.monthsCompleted >= monthTarget,
            hedgeDemonstrated: hedgeDemonstrated,
            current: progress.monthsCompleted,
            target: monthTarget,
            hedges: progress.hedgesExecuted,
            description: `Campaign: ${progress.monthsCompleted}/${monthTarget} months | Hedges: ${progress.hedgesExecuted}`,
            progressPercent: Math.min(100, (progress.monthsCompleted / monthTarget) * 100)
        };
    },

    /**
     * Check gate condition for current tier
     * @returns {Object}
     */
    checkCurrentGate() {
        const currentTier = GameState.getCurrentTier();

        switch (currentTier) {
            case 1: return this.checkTier1Gate();
            case 2: return this.checkTier2Gate();
            case 3: return this.checkTier3Gate();
            case 4: return this.checkTier4Gate();
            default: return { met: false, description: 'Unknown tier' };
        }
    },

    // ========================================================================
    // PROGRESS UPDATES
    // ========================================================================

    /**
     * Record a completed trade and update progress
     * @param {Object} trade - The completed trade
     */
    recordCompletedTrade(trade) {
        const currentTier = GameState.getCurrentTier();
        const pnl = trade.realizedPnL || 0;

        // Tier 1: Track profitable trades
        if (currentTier === 1 && pnl > 0) {
            const progress = GameState.getTierProgress();
            GameState.updateTierProgress({
                profitableTrades: progress.profitableTrades + 1
            });

            // Check if tier gate is met
            this.checkAndProcessTierAdvancement();
        }

        // Tier 3: Track basis trades
        if (currentTier === 3 && trade.type === 'basis' && pnl > 0) {
            const progress = GameState.getTierProgress();
            GameState.updateTierProgress({
                basisTradesCompleted: progress.basisTradesCompleted + 1
            });

            this.checkAndProcessTierAdvancement();
        }
    },

    /**
     * Record an adverse price move (for Tier 2)
     * @param {number} priceChange - Percentage price change
     */
    recordPriceMove(priceChange) {
        const currentTier = GameState.getCurrentTier();

        if (currentTier === 2) {
            // Consider >5% adverse move as significant
            if (Math.abs(priceChange) > 5) {
                const progress = GameState.getTierProgress();
                if (!progress.adverseMoveOccurred) {
                    GameState.updateTierProgress({
                        adverseMoveOccurred: true,
                        monthsSurvived: 0 // Start counting
                    });
                    console.log('[Progression] Adverse price move detected!');
                }
            }
        }
    },

    /**
     * Record month completion (for Tier 2 and 4)
     */
    recordMonthComplete() {
        const currentTier = GameState.getCurrentTier();
        const progress = GameState.getTierProgress();

        if (currentTier === 2 && progress.adverseMoveOccurred) {
            // Only count months after adverse move occurred
            GameState.updateTierProgress({
                monthsSurvived: progress.monthsSurvived + 1
            });
            this.checkAndProcessTierAdvancement();
        }

        if (currentTier === 4) {
            GameState.updateTierProgress({
                monthsCompleted: progress.monthsCompleted + 1
            });
            this.checkAndProcessTierAdvancement();
        }
    },

    /**
     * Record a hedge execution (for Tier 4)
     * @param {Object} hedge - The hedge trade details
     */
    recordHedge(hedge) {
        const currentTier = GameState.getCurrentTier();

        if (currentTier === 4) {
            const progress = GameState.getTierProgress();
            GameState.updateTierProgress({
                hedgesExecuted: progress.hedgesExecuted + 1
            });
        }
    },

    // ========================================================================
    // TIER ADVANCEMENT
    // ========================================================================

    /**
     * Check if current tier gate is met and process advancement
     */
    checkAndProcessTierAdvancement() {
        const gateStatus = this.checkCurrentGate();
        const currentTier = GameState.getCurrentTier();

        if (gateStatus.met && currentTier < 4) {
            console.log(`[Progression] Tier ${currentTier} gate met! Preparing advancement...`);
            this.showUnlockModal(currentTier + 1);
        } else if (gateStatus.met && currentTier === 4) {
            console.log('[Progression] Game complete! All tiers mastered.');
            this.showGameCompleteModal();
        }
    },

    /**
     * Actually advance to next tier (called after modal confirmation)
     */
    confirmTierAdvancement() {
        const success = GameState.advanceTier();

        if (success) {
            const newTier = GameState.getCurrentTier();
            console.log(`[Progression] Advanced to Tier ${newTier}`);

            // Trigger UI update
            if (typeof App !== 'undefined' && App.onTierChange) {
                App.onTierChange(newTier);
            }

            // Show new tier lessons
            this.showTierLessons(newTier);
        }
    },

    // ========================================================================
    // MODALS
    // ========================================================================

    /**
     * Show tier unlock celebration modal
     * @param {number} newTier - The tier being unlocked
     */
    showUnlockModal(newTier) {
        const tierConfig = GameConfig.tiers[newTier];

        const modalHTML = `
            <div class="modal-overlay" id="unlock-modal">
                <div class="modal unlock-modal">
                    <div class="unlock-celebration">
                        <div class="unlock-icon">🎉</div>
                        <h2>Tier ${newTier} Unlocked!</h2>
                        <h3>${tierConfig.name}</h3>
                        <p class="unlock-subtitle">${tierConfig.subtitle}</p>
                    </div>
                    <div class="unlock-description">
                        <p>${tierConfig.description}</p>
                    </div>
                    <div class="unlock-features">
                        <h4>New Features:</h4>
                        <ul>
                            ${this.getNewFeaturesHTML(newTier)}
                        </ul>
                    </div>
                    <button class="btn btn-primary btn-large" onclick="Progression.confirmTierAdvancement(); Progression.closeModal('unlock-modal');">
                        Continue to Tier ${newTier}
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Get HTML for new features in tier
     * @param {number} tier
     * @returns {string}
     */
    getNewFeaturesHTML(tier) {
        const featureDescriptions = {
            2: [
                'M+1 Settlement Pricing',
                'Letter of Credit Financing',
                'Chilean Supplier (Maria Santos)',
                'Americas Region (Houston buyer)',
                'Price Charts & Analytics'
            ],
            3: [
                'COMEX Exchange Access',
                'Basis Trading (LME vs COMEX)',
                'European Region (Rotterdam buyer)',
                'African Supplier (Joseph Mwanza)',
                'Market Events'
            ],
            4: [
                'Futures Trading',
                'Hedge Positions',
                'Margin Management',
                'Full Portfolio View',
                'All Suppliers & Buyers'
            ]
        };

        const features = featureDescriptions[tier] || [];
        return features.map(f => `<li>${f}</li>`).join('');
    },

    /**
     * Show game complete modal
     */
    showGameCompleteModal() {
        const analytics = GameState.getAnalytics();

        const modalHTML = `
            <div class="modal-overlay" id="complete-modal">
                <div class="modal complete-modal">
                    <div class="complete-celebration">
                        <div class="complete-icon">🏆</div>
                        <h2>Congratulations!</h2>
                        <h3>Master Trader</h3>
                    </div>
                    <div class="complete-stats">
                        <h4>Your Campaign Results:</h4>
                        <div class="stats-grid">
                            <div class="stat">
                                <span class="stat-value">${analytics.totalTrades}</span>
                                <span class="stat-label">Total Trades</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${analytics.profitableTrades}</span>
                                <span class="stat-label">Profitable</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">$${this.formatNumber(analytics.totalPnL)}</span>
                                <span class="stat-label">Total P&L</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">$${this.formatNumber(analytics.bestTrade)}</span>
                                <span class="stat-label">Best Trade</span>
                            </div>
                        </div>
                    </div>
                    <div class="complete-actions">
                        <button class="btn btn-secondary" onclick="Progression.closeModal('complete-modal'); App.restart(true);">
                            Play Again (Keep Progress)
                        </button>
                        <button class="btn btn-primary" onclick="Progression.closeModal('complete-modal'); App.restart(false);">
                            New Game
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Close a modal by ID
     * @param {string} modalId
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    },

    // ========================================================================
    // MICROLEARNING INTEGRATION
    // ========================================================================

    /**
     * Show lessons for a new tier
     * @param {number} tier
     */
    showTierLessons(tier) {
        const tierConfig = GameConfig.tiers[tier];
        const lessons = tierConfig.lessons || [];

        if (lessons.length > 0 && typeof Microlearning !== 'undefined') {
            // Show first lesson that hasn't been completed
            for (const lessonId of lessons) {
                if (!GameState.isLessonCompleted(lessonId)) {
                    Microlearning.showLesson(lessonId);
                    break;
                }
            }
        }
    },

    // ========================================================================
    // PROGRESS UI
    // ========================================================================

    /**
     * Get progress bar HTML for current tier
     * @returns {string}
     */
    getProgressBarHTML() {
        const gateStatus = this.checkCurrentGate();
        const currentTier = GameState.getCurrentTier();

        return `
            <div class="tier-progress">
                <div class="tier-progress-header">
                    <span class="tier-name">Tier ${currentTier}: ${GameConfig.tiers[currentTier].name}</span>
                    <span class="tier-status">${gateStatus.description}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${gateStatus.progressPercent}%"></div>
                </div>
            </div>
        `;
    },

    /**
     * Update progress bar in DOM
     */
    updateProgressBar() {
        const container = document.getElementById('tier-progress-container');
        if (container) {
            container.innerHTML = this.getProgressBarHTML();
        }
    },

    /**
     * Get tier badge HTML
     * @returns {string}
     */
    getTierBadgeHTML() {
        const currentTier = GameState.getCurrentTier();
        const tierConfig = GameConfig.tiers[currentTier];

        return `
            <div class="tier-badge tier-${currentTier}">
                <span class="tier-number">${currentTier}</span>
                <span class="tier-name">${tierConfig.name}</span>
            </div>
        `;
    },

    // ========================================================================
    // UTILITIES
    // ========================================================================

    /**
     * Format number with commas
     * @param {number} num
     * @returns {string}
     */
    formatNumber(num) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    },

    /**
     * Initialize progression system
     */
    init() {
        // Subscribe to state changes to update UI
        GameState.subscribe((eventType, state) => {
            if (['tierProgress', 'positionClose', 'monthAdvance'].includes(eventType)) {
                this.updateProgressBar();
            }
        });

        console.log('[Progression] Initialized');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Progression;
}
