/**
 * scoring.js - Multi-dimensional Scoring System for GV_TEST
 *
 * Tracks and scores player performance across multiple dimensions.
 */

const Scoring = {
    // Score dimensions
    dimensions: {
        profitability: {
            name: 'Profitability',
            description: 'Total P&L and ROI',
            weight: 0.4
        },
        consistency: {
            name: 'Consistency',
            description: 'Win rate and variance',
            weight: 0.25
        },
        riskManagement: {
            name: 'Risk Management',
            description: 'Hedging effectiveness',
            weight: 0.2
        },
        learning: {
            name: 'Learning',
            description: 'Lessons completed',
            weight: 0.15
        }
    },

    /**
     * Calculate profitability score (0-100)
     * @returns {number}
     */
    calculateProfitabilityScore() {
        const analytics = GameState.getAnalytics();
        const state = GameState.getState();

        if (analytics.totalTrades === 0) return 0;

        // ROI calculation
        const roi = (state.funds - state.startingFunds) / state.startingFunds;

        // Score based on ROI tiers
        // 20%+ = 100, 10%+ = 80, 5%+ = 60, 0%+ = 40, negative = scaled down
        let score;
        if (roi >= 0.20) score = 100;
        else if (roi >= 0.10) score = 80 + (roi - 0.10) / 0.10 * 20;
        else if (roi >= 0.05) score = 60 + (roi - 0.05) / 0.05 * 20;
        else if (roi >= 0) score = 40 + roi / 0.05 * 20;
        else score = Math.max(0, 40 + roi * 100); // Negative ROI

        return Math.round(score);
    },

    /**
     * Calculate consistency score (0-100)
     * @returns {number}
     */
    calculateConsistencyScore() {
        const analytics = GameState.getAnalytics();

        if (analytics.totalTrades === 0) return 0;

        // Win rate (profitable / total)
        const winRate = analytics.profitableTrades / analytics.totalTrades;

        // Score based on win rate
        // 80%+ = 100, 60%+ = 80, 40%+ = 60, etc.
        let score = winRate * 100;

        // Bonus for low variance (if we have enough trades)
        if (analytics.totalTrades >= 5) {
            const avgTrade = analytics.averageMargin;
            const variance = Math.abs(analytics.bestTrade - analytics.worstTrade);
            const varianceRatio = avgTrade !== 0 ? variance / Math.abs(avgTrade) : 10;

            // Lower variance = higher bonus (up to 10 points)
            const varianceBonus = Math.max(0, 10 - varianceRatio);
            score = Math.min(100, score + varianceBonus);
        }

        return Math.round(score);
    },

    /**
     * Calculate risk management score (0-100)
     * @returns {number}
     */
    calculateRiskManagementScore() {
        const currentTier = GameState.getCurrentTier();
        const analytics = GameState.getAnalytics();
        const progress = GameState.getTierProgress();

        // Tier 1-2: Based on surviving without bankruptcy
        if (currentTier <= 2) {
            const state = GameState.getState();
            const drawdown = (state.startingFunds - Math.min(state.funds, state.startingFunds)) / state.startingFunds;

            // Never went below 50% = 100, below 75% = 80, etc.
            if (drawdown <= 0.1) return 100;
            if (drawdown <= 0.25) return 80;
            if (drawdown <= 0.50) return 60;
            if (drawdown <= 0.75) return 40;
            return 20;
        }

        // Tier 3-4: Based on hedging activity
        if (currentTier >= 4 && progress.hedgesExecuted > 0) {
            // Score based on hedge ratio
            const hedgeRatio = progress.hedgesExecuted / Math.max(1, analytics.totalTrades);
            return Math.round(Math.min(100, hedgeRatio * 150)); // 67% hedge ratio = 100
        }

        // Default: moderate score
        return 50;
    },

    /**
     * Calculate learning score (0-100)
     * @returns {number}
     */
    calculateLearningScore() {
        const currentTier = GameState.getCurrentTier();
        const lessonsCompleted = GameState.getState().ui.lessonsCompleted.length;

        // Get total lessons available up to current tier
        let totalLessons = 0;
        for (let t = 1; t <= currentTier; t++) {
            const tierConfig = GameConfig.tiers[t];
            if (tierConfig.lessons) {
                totalLessons += tierConfig.lessons.length;
            }
        }

        if (totalLessons === 0) return 100;

        const completionRate = lessonsCompleted / totalLessons;
        return Math.round(completionRate * 100);
    },

    /**
     * Calculate overall score
     * @returns {Object} { overall: number, dimensions: Object }
     */
    calculateOverallScore() {
        const profitability = this.calculateProfitabilityScore();
        const consistency = this.calculateConsistencyScore();
        const riskManagement = this.calculateRiskManagementScore();
        const learning = this.calculateLearningScore();

        const overall = Math.round(
            profitability * this.dimensions.profitability.weight +
            consistency * this.dimensions.consistency.weight +
            riskManagement * this.dimensions.riskManagement.weight +
            learning * this.dimensions.learning.weight
        );

        return {
            overall,
            dimensions: {
                profitability,
                consistency,
                riskManagement,
                learning
            }
        };
    },

    /**
     * Get grade from score
     * @param {number} score
     * @returns {string}
     */
    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 45) return 'D+';
        if (score >= 40) return 'D';
        return 'F';
    },

    /**
     * Get rank title from score
     * @param {number} score
     * @returns {string}
     */
    getRankTitle(score) {
        if (score >= 95) return 'Master Trader';
        if (score >= 85) return 'Senior Trader';
        if (score >= 75) return 'Trader';
        if (score >= 65) return 'Associate Trader';
        if (score >= 50) return 'Junior Trader';
        if (score >= 35) return 'Trainee';
        return 'Apprentice';
    },

    /**
     * Generate score report HTML
     * @returns {string}
     */
    getScoreReportHTML() {
        const scores = this.calculateOverallScore();
        const grade = this.getGrade(scores.overall);
        const rank = this.getRankTitle(scores.overall);

        return `
            <div class="score-report">
                <div class="score-overall">
                    <div class="score-grade">${grade}</div>
                    <div class="score-value">${scores.overall}</div>
                    <div class="score-rank">${rank}</div>
                </div>
                <div class="score-dimensions">
                    ${Object.entries(this.dimensions).map(([key, dim]) => `
                        <div class="score-dimension">
                            <div class="dimension-header">
                                <span class="dimension-name">${dim.name}</span>
                                <span class="dimension-score">${scores.dimensions[key]}</span>
                            </div>
                            <div class="dimension-bar">
                                <div class="dimension-fill" style="width: ${scores.dimensions[key]}%"></div>
                            </div>
                            <div class="dimension-description">${dim.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Show score modal
     */
    showScoreModal() {
        const modalHTML = `
            <div class="modal-overlay" id="score-modal">
                <div class="modal score-modal">
                    <div class="modal-header">
                        <h2>Performance Report</h2>
                    </div>
                    ${this.getScoreReportHTML()}
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="Scoring.closeModal()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Close score modal
     */
    closeModal() {
        const modal = document.getElementById('score-modal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Get achievements based on performance
     * @returns {Array}
     */
    getAchievements() {
        const analytics = GameState.getAnalytics();
        const state = GameState.getState();
        const achievements = [];

        // Trade count achievements
        if (analytics.totalTrades >= 1) {
            achievements.push({ id: 'first_trade', name: 'First Trade', icon: '🎯' });
        }
        if (analytics.totalTrades >= 10) {
            achievements.push({ id: 'ten_trades', name: 'Getting Started', icon: '📊' });
        }
        if (analytics.totalTrades >= 50) {
            achievements.push({ id: 'fifty_trades', name: 'Experienced', icon: '⭐' });
        }

        // Profit achievements
        if (analytics.totalPnL >= 100000) {
            achievements.push({ id: 'profit_100k', name: 'Six Figures', icon: '💰' });
        }
        if (analytics.totalPnL >= 1000000) {
            achievements.push({ id: 'profit_1m', name: 'Millionaire', icon: '💎' });
        }

        // Win streak (would need to track this)
        if (analytics.profitableTrades >= 5) {
            achievements.push({ id: 'win_streak_5', name: 'Hot Streak', icon: '🔥' });
        }

        // Tier achievements
        if (state.currentTier >= 2) {
            achievements.push({ id: 'tier_2', name: 'Timing Master', icon: '⏱️' });
        }
        if (state.currentTier >= 3) {
            achievements.push({ id: 'tier_3', name: 'Basis Trader', icon: '📈' });
        }
        if (state.currentTier >= 4) {
            achievements.push({ id: 'tier_4', name: 'Hedge Fund', icon: '🏦' });
        }

        // Learning achievements
        if (state.ui.lessonsCompleted.length >= 5) {
            achievements.push({ id: 'learner', name: 'Quick Learner', icon: '📚' });
        }
        if (state.ui.lessonsCompleted.length >= 12) {
            achievements.push({ id: 'scholar', name: 'Scholar', icon: '🎓' });
        }

        return achievements;
    },

    /**
     * Initialize scoring system
     */
    init() {
        console.log('[Scoring] Initialized');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Scoring;
}
