/**
 * analytics.js - Price Charts and Performance Analytics for GV_TEST
 */

const Analytics = {
    // Chart.js instance
    priceChart: null,
    performanceChart: null,

    // Price history
    priceHistory: [],

    // Active tab
    activeTab: 'prices',

    /**
     * Initialize analytics widget
     */
    init() {
        if (!isFeatureEnabled('analytics')) return;

        this.initPriceChart();
        console.log('[Analytics] Initialized');
    },

    /**
     * Show tab
     * @param {string} tab
     */
    showTab(tab) {
        this.activeTab = tab;

        // Update tab buttons
        document.querySelectorAll('#panel-analytics .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('#panel-analytics .tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
        });

        // Render appropriate content
        if (tab === 'prices') {
            this.renderPriceChart();
        } else {
            this.renderPerformance();
        }
    },

    /**
     * Initialize price chart
     */
    initPriceChart() {
        const canvas = document.getElementById('price-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'LME Spot',
                        data: [],
                        borderColor: '#b87333',
                        backgroundColor: 'rgba(184, 115, 51, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'LME M+1',
                        data: [],
                        borderColor: '#d4956a',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#8899a6'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.raw.toLocaleString()}/MT`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8899a6'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#8899a6',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    },

    /**
     * Render price chart with current data
     */
    renderPriceChart() {
        if (!this.priceChart) return;

        // Build price history from month data
        const months = ['January', 'February', 'March', 'April', 'May', 'June'];
        const lmeSpot = [];
        const lmeM1 = [];

        // Access month data (assuming they're loaded as globals)
        const monthDataArray = [
            typeof JanuaryData !== 'undefined' ? JanuaryData : null,
            typeof FebruaryData !== 'undefined' ? FebruaryData : null,
            typeof MarchData !== 'undefined' ? MarchData : null,
            typeof AprilData !== 'undefined' ? AprilData : null,
            typeof MayData !== 'undefined' ? MayData : null,
            typeof JuneData !== 'undefined' ? JuneData : null
        ];

        const currentMonth = GameState.getCurrentMonthIndex();

        monthDataArray.forEach((data, index) => {
            if (data && index <= currentMonth) {
                lmeSpot.push(data.prices.lme_spot);
                lmeM1.push(data.prices.lme_m1);
            }
        });

        // Update chart
        this.priceChart.data.labels = months.slice(0, lmeSpot.length);
        this.priceChart.data.datasets[0].data = lmeSpot;
        this.priceChart.data.datasets[1].data = lmeM1;

        // Add COMEX if enabled
        if (isFeatureEnabled('exchanges.comex')) {
            const comexSpot = monthDataArray
                .filter((d, i) => d && i <= currentMonth)
                .map(d => d.prices.comex_spot);

            // Add or update COMEX dataset
            if (this.priceChart.data.datasets.length < 3) {
                this.priceChart.data.datasets.push({
                    label: 'COMEX Spot',
                    data: comexSpot,
                    borderColor: '#1da1f2',
                    backgroundColor: 'transparent',
                    tension: 0.4
                });
            } else {
                this.priceChart.data.datasets[2].data = comexSpot;
            }
        }

        this.priceChart.update();
    },

    /**
     * Render performance statistics
     */
    renderPerformance() {
        const container = document.querySelector('#tab-performance .performance-stats');
        if (!container) return;

        const analytics = GameState.getAnalytics();
        const state = GameState.getState();
        const scores = Scoring.calculateOverallScore();

        const winRate = analytics.totalTrades > 0 ?
            ((analytics.profitableTrades / analytics.totalTrades) * 100).toFixed(1) : 0;

        const roi = ((state.funds - state.startingFunds) / state.startingFunds * 100).toFixed(2);

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${analytics.totalTrades}</div>
                    <div class="stat-label">Total Trades</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${analytics.profitableTrades}</div>
                    <div class="stat-label">Profitable Trades</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-value">${winRate}%</div>
                    <div class="stat-label">Win Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value ${analytics.totalPnL >= 0 ? 'positive' : 'negative'}">
                        ${analytics.totalPnL >= 0 ? '+' : ''}$${analytics.totalPnL.toLocaleString()}
                    </div>
                    <div class="stat-label">Total P&L</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📉</div>
                    <div class="stat-value ${roi >= 0 ? 'positive' : 'negative'}">
                        ${roi >= 0 ? '+' : ''}${roi}%
                    </div>
                    <div class="stat-label">ROI</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${scores.overall}</div>
                    <div class="stat-label">Score</div>
                </div>
            </div>

            <div class="trade-history">
                <h4>Recent Trades</h4>
                ${this.renderTradeHistory()}
            </div>

            <div class="score-breakdown">
                <h4>Performance Breakdown</h4>
                ${Scoring.getScoreReportHTML()}
            </div>
        `;
    },

    /**
     * Render trade history table
     * @returns {string}
     */
    renderTradeHistory() {
        const completedTrades = GameState.getState().completedTrades;

        if (completedTrades.length === 0) {
            return '<p class="text-muted">No completed trades yet</p>';
        }

        const recentTrades = completedTrades.slice(-5).reverse();

        return `
            <table class="trade-history-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Quantity</th>
                        <th>Buy Price</th>
                        <th>P&L</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentTrades.map(trade => `
                        <tr>
                            <td>${trade.id}</td>
                            <td>${trade.quantity.toLocaleString()} MT</td>
                            <td>$${trade.buyPrice.toLocaleString()}</td>
                            <td class="pnl ${trade.realizedPnL >= 0 ? 'positive' : 'negative'}">
                                ${trade.realizedPnL >= 0 ? '+' : ''}$${trade.realizedPnL.toLocaleString()}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Record price for current month
     * @param {Object} monthData
     */
    recordPrice(monthData) {
        if (!monthData || !monthData.prices) return;

        this.priceHistory.push({
            month: GameState.getCurrentMonthName(),
            lmeSpot: monthData.prices.lme_spot,
            lmeM1: monthData.prices.lme_m1,
            comexSpot: monthData.prices.comex_spot
        });

        // Check for adverse price move (for Tier 2)
        if (this.priceHistory.length >= 2) {
            const prev = this.priceHistory[this.priceHistory.length - 2];
            const current = this.priceHistory[this.priceHistory.length - 1];
            const priceChange = ((current.lmeSpot - prev.lmeSpot) / prev.lmeSpot) * 100;

            Progression.recordPriceMove(priceChange);
        }
    },

    /**
     * Update analytics display
     */
    update() {
        if (!isFeatureEnabled('analytics')) return;

        if (this.activeTab === 'prices') {
            this.renderPriceChart();
        } else {
            this.renderPerformance();
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}
