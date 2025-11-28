/**
 * microlearning.js - Educational Popup System for GV_TEST
 *
 * Provides contextual lessons, tooltips, and quizzes to teach trading concepts.
 */

const Microlearning = {
    // Lesson definitions
    lessons: {
        // Tier 1 Lessons
        intro_physical_trading: {
            id: 'intro_physical_trading',
            title: 'Welcome to Physical Trading',
            content: `
                <p>You're about to become a copper trader! Here's how it works:</p>
                <ol>
                    <li><strong>Buy</strong> copper from a mining company</li>
                    <li><strong>Ship</strong> it across the ocean to your buyer</li>
                    <li><strong>Sell</strong> at a profit (hopefully!)</li>
                </ol>
                <p>Your profit comes from buying low and selling high, minus shipping costs.</p>
            `,
            quiz: {
                question: 'What determines your profit in physical trading?',
                options: [
                    'Buy price minus sell price',
                    'Sell price minus buy price and costs',
                    'Just the shipping distance'
                ],
                correct: 1
            }
        },

        understanding_spot_price: {
            id: 'understanding_spot_price',
            title: 'Understanding Spot Price',
            content: `
                <p>The <strong>LME Spot Price</strong> is the global benchmark for copper.</p>
                <p>When you trade, prices are based on LME plus a <strong>premium</strong>:</p>
                <ul>
                    <li><strong>Supplier Premium:</strong> Added to buy price (covers their costs)</li>
                    <li><strong>Buyer Premium:</strong> What they'll pay above LME</li>
                </ul>
                <p>Your goal: Find buyers willing to pay more premium than suppliers charge!</p>
            `,
            quiz: null
        },

        freight_and_costs: {
            id: 'freight_and_costs',
            title: 'Freight & Costs',
            content: `
                <p>Shipping copper isn't free! Key costs include:</p>
                <ul>
                    <li><strong>Freight Rate:</strong> $/MT based on route distance</li>
                    <li><strong>Transit Time:</strong> Longer = more price risk</li>
                    <li><strong>Insurance:</strong> Protects against loss</li>
                </ul>
                <p>A cargo from Peru to China takes ~35 days. A lot can happen to prices!</p>
            `,
            quiz: {
                question: 'Why does transit time matter?',
                options: [
                    'Longer transit means less fuel',
                    'Prices can change while cargo is at sea',
                    'Transit time doesn\'t matter'
                ],
                correct: 1
            }
        },

        // Tier 2 Lessons
        m1_pricing_explained: {
            id: 'm1_pricing_explained',
            title: 'M+1 Pricing Explained',
            content: `
                <p><strong>M+1</strong> means the price is set one month after shipment.</p>
                <p>Here's what happens:</p>
                <ol>
                    <li>You ship cargo in January</li>
                    <li>Price is based on February's average LME</li>
                    <li>Final invoice calculated at month-end</li>
                </ol>
                <p>This creates <strong>price exposure</strong> - if LME drops, you lose money!</p>
            `,
            quiz: {
                question: 'With M+1 pricing, when is your final price determined?',
                options: [
                    'When you buy',
                    'One month after shipment',
                    'When cargo arrives'
                ],
                correct: 1
            }
        },

        price_volatility: {
            id: 'price_volatility',
            title: 'Price Volatility',
            content: `
                <p>Copper prices move based on:</p>
                <ul>
                    <li><strong>Supply:</strong> Mine production, inventory levels</li>
                    <li><strong>Demand:</strong> Construction, electronics, EVs</li>
                    <li><strong>Macro:</strong> USD strength, interest rates</li>
                </ul>
                <p>Prices can move 5-10% in a month. On 25,000 MT, that's $1M+ exposure!</p>
            `,
            quiz: null
        },

        loc_financing: {
            id: 'loc_financing',
            title: 'Letter of Credit (LOC)',
            content: `
                <p>A <strong>Letter of Credit</strong> lets you trade bigger:</p>
                <ul>
                    <li>Bank guarantees payment to supplier</li>
                    <li>You don't need full cash upfront</li>
                    <li>Repay when buyer pays you</li>
                </ul>
                <p>LOC increases your <strong>buying power</strong> but has limits!</p>
            `,
            quiz: null
        },

        // Tier 3 Lessons
        basis_trading_intro: {
            id: 'basis_trading_intro',
            title: 'Introduction to Basis Trading',
            content: `
                <p><strong>Basis</strong> is the price difference between exchanges.</p>
                <p>COMEX (USA) and LME (London) can have different prices:</p>
                <ul>
                    <li>Usually within $50-100/MT</li>
                    <li>Sometimes spreads wider (opportunity!)</li>
                    <li>Trade by buying on one, selling on other</li>
                </ul>
            `,
            quiz: null
        },

        lme_vs_comex: {
            id: 'lme_vs_comex',
            title: 'LME vs COMEX',
            content: `
                <p>Two major copper exchanges:</p>
                <table>
                    <tr><th>LME</th><th>COMEX</th></tr>
                    <tr><td>London</td><td>New York</td></tr>
                    <tr><td>$/MT pricing</td><td>$/lb (converted)</td></tr>
                    <tr><td>Physical delivery focus</td><td>More financial trading</td></tr>
                </table>
                <p>Most Asian buyers use LME, US buyers often prefer COMEX.</p>
            `,
            quiz: null
        },

        arbitrage_opportunities: {
            id: 'arbitrage_opportunities',
            title: 'Arbitrage Opportunities',
            content: `
                <p><strong>Arbitrage</strong>: Profit from price differences.</p>
                <p>When COMEX is $80 above LME:</p>
                <ol>
                    <li>Buy physical priced on LME</li>
                    <li>Sell to US buyer on COMEX pricing</li>
                    <li>Capture the spread (minus costs)</li>
                </ol>
                <p>Watch out - spreads can narrow before you close!</p>
            `,
            quiz: null
        },

        // Tier 4 Lessons
        futures_hedging_intro: {
            id: 'futures_hedging_intro',
            title: 'Futures Hedging',
            content: `
                <p><strong>Hedging</strong> protects against price moves.</p>
                <p>If you're buying physical copper:</p>
                <ol>
                    <li>You're "long" physical copper</li>
                    <li>Sell futures to offset (go "short")</li>
                    <li>If prices drop: physical loses, futures gains</li>
                </ol>
                <p>Net effect: Locked in your margin regardless of price!</p>
            `,
            quiz: {
                question: 'Why do traders hedge?',
                options: [
                    'To maximize profits',
                    'To lock in margins and reduce risk',
                    'To avoid buying copper'
                ],
                correct: 1
            }
        },

        margin_management: {
            id: 'margin_management',
            title: 'Margin Management',
            content: `
                <p>Futures require <strong>margin</strong> deposits:</p>
                <ul>
                    <li><strong>Initial Margin:</strong> ~10% of contract value</li>
                    <li><strong>Variation Margin:</strong> Daily P&L adjustments</li>
                    <li><strong>Margin Call:</strong> Add funds if losing</li>
                </ul>
                <p>Don't over-leverage! Margin calls can force you to close.</p>
            `,
            quiz: null
        },

        portfolio_risk: {
            id: 'portfolio_risk',
            title: 'Portfolio Risk',
            content: `
                <p>Managing a trading book means tracking:</p>
                <ul>
                    <li><strong>Net Position:</strong> Long physical - short futures</li>
                    <li><strong>Mark-to-Market:</strong> Current value of all positions</li>
                    <li><strong>VaR:</strong> Value at Risk from price moves</li>
                </ul>
                <p>Professional traders keep positions balanced!</p>
            `,
            quiz: null
        }
    },

    // Current lesson being shown
    currentLesson: null,

    /**
     * Show a lesson by ID
     * @param {string} lessonId
     */
    showLesson(lessonId) {
        const lesson = this.lessons[lessonId];
        if (!lesson) {
            console.warn('[Microlearning] Lesson not found:', lessonId);
            return;
        }

        this.currentLesson = lesson;

        const modalHTML = `
            <div class="modal-overlay" id="lesson-modal">
                <div class="modal lesson-modal">
                    <div class="lesson-header">
                        <span class="lesson-icon">📚</span>
                        <h2>${lesson.title}</h2>
                    </div>
                    <div class="lesson-content">
                        ${lesson.content}
                    </div>
                    ${lesson.quiz ? this.getQuizHTML(lesson.quiz) : ''}
                    <div class="lesson-footer">
                        <button class="btn btn-primary" onclick="Microlearning.completeLesson('${lessonId}')">
                            ${lesson.quiz ? 'Skip Quiz' : 'Got it!'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Generate quiz HTML
     * @param {Object} quiz
     * @returns {string}
     */
    getQuizHTML(quiz) {
        const optionsHTML = quiz.options.map((opt, i) => `
            <label class="quiz-option">
                <input type="radio" name="quiz-answer" value="${i}">
                <span>${opt}</span>
            </label>
        `).join('');

        return `
            <div class="lesson-quiz">
                <h3>Quick Quiz</h3>
                <p class="quiz-question">${quiz.question}</p>
                <div class="quiz-options">
                    ${optionsHTML}
                </div>
                <button class="btn btn-secondary" onclick="Microlearning.checkAnswer()">
                    Check Answer
                </button>
                <div class="quiz-result" id="quiz-result"></div>
            </div>
        `;
    },

    /**
     * Check quiz answer
     */
    checkAnswer() {
        const selected = document.querySelector('input[name="quiz-answer"]:checked');
        const resultEl = document.getElementById('quiz-result');

        if (!selected) {
            resultEl.innerHTML = '<span class="quiz-incorrect">Please select an answer</span>';
            return;
        }

        const answer = parseInt(selected.value);
        const correct = this.currentLesson.quiz.correct;

        if (answer === correct) {
            resultEl.innerHTML = '<span class="quiz-correct">Correct! Well done.</span>';
            // Auto-complete after delay
            setTimeout(() => {
                this.completeLesson(this.currentLesson.id);
            }, 1500);
        } else {
            resultEl.innerHTML = '<span class="quiz-incorrect">Not quite. Try again!</span>';
        }
    },

    /**
     * Complete and close lesson
     * @param {string} lessonId
     */
    completeLesson(lessonId) {
        GameState.completeLesson(lessonId);
        this.closeLesson();
    },

    /**
     * Close lesson modal
     */
    closeLesson() {
        const modal = document.getElementById('lesson-modal');
        if (modal) {
            modal.remove();
        }
        this.currentLesson = null;
    },

    /**
     * Show help overlay
     */
    showHelp() {
        const currentTier = GameState.getCurrentTier();
        const tierConfig = GameConfig.tiers[currentTier];

        const helpContent = this.getHelpContent(currentTier);

        const modalHTML = `
            <div class="modal-overlay" id="help-modal">
                <div class="modal help-modal">
                    <div class="help-header">
                        <span class="help-icon">❓</span>
                        <h2>Help - Tier ${currentTier}: ${tierConfig.name}</h2>
                    </div>
                    <div class="help-content">
                        ${helpContent}
                    </div>
                    <div class="help-lessons">
                        <h3>Review Lessons</h3>
                        <div class="lesson-list">
                            ${this.getLessonListHTML(currentTier)}
                        </div>
                    </div>
                    <div class="help-footer">
                        <button class="btn btn-primary" onclick="Microlearning.closeHelp()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Get help content for tier
     * @param {number} tier
     * @returns {string}
     */
    getHelpContent(tier) {
        const content = {
            1: `
                <p><strong>Your Goal:</strong> Complete 3 profitable trades.</p>
                <h4>How to Trade:</h4>
                <ol>
                    <li>Click "BUY FROM CARLOS" to purchase a copper cargo</li>
                    <li>Watch your cargo travel across the map</li>
                    <li>Click "SELL TO WEI" when cargo arrives</li>
                </ol>
                <p><strong>Tip:</strong> Your profit = Sell price - Buy price - Freight costs</p>
            `,
            2: `
                <p><strong>Your Goal:</strong> Survive an adverse price move over 3 months.</p>
                <h4>New in Tier 2:</h4>
                <ul>
                    <li><strong>M+1 Pricing:</strong> Final price set next month</li>
                    <li><strong>LOC:</strong> Borrow to trade bigger</li>
                    <li><strong>More Markets:</strong> Chile supplier, Houston buyer</li>
                </ul>
                <p><strong>Tip:</strong> Watch the price charts - timing matters!</p>
            `,
            3: `
                <p><strong>Your Goal:</strong> Execute a profitable basis trade.</p>
                <h4>New in Tier 3:</h4>
                <ul>
                    <li><strong>COMEX Exchange:</strong> US-based pricing</li>
                    <li><strong>Basis Trading:</strong> Exploit LME/COMEX spreads</li>
                    <li><strong>European Market:</strong> Rotterdam buyer</li>
                </ul>
                <p><strong>Tip:</strong> Buy where prices are low, sell where they're high!</p>
            `,
            4: `
                <p><strong>Your Goal:</strong> Complete 6-month campaign with demonstrated hedge.</p>
                <h4>New in Tier 4:</h4>
                <ul>
                    <li><strong>Futures Trading:</strong> Lock in prices with derivatives</li>
                    <li><strong>Hedging:</strong> Protect your physical positions</li>
                    <li><strong>Full Access:</strong> All suppliers and buyers</li>
                </ul>
                <p><strong>Tip:</strong> Use futures to reduce risk on large positions!</p>
            `
        };

        return content[tier] || '';
    },

    /**
     * Get lesson list HTML for tier
     * @param {number} tier
     * @returns {string}
     */
    getLessonListHTML(tier) {
        // Get lessons for current and previous tiers
        const allLessons = [];
        for (let t = 1; t <= tier; t++) {
            const tierConfig = GameConfig.tiers[t];
            if (tierConfig.lessons) {
                allLessons.push(...tierConfig.lessons);
            }
        }

        return allLessons.map(lessonId => {
            const lesson = this.lessons[lessonId];
            if (!lesson) return '';

            const completed = GameState.isLessonCompleted(lessonId);
            return `
                <button class="lesson-btn ${completed ? 'completed' : ''}"
                        onclick="Microlearning.closeHelp(); Microlearning.showLesson('${lessonId}')">
                    <span class="lesson-status">${completed ? '✓' : '○'}</span>
                    <span class="lesson-title">${lesson.title}</span>
                </button>
            `;
        }).join('');
    },

    /**
     * Close help modal
     */
    closeHelp() {
        const modal = document.getElementById('help-modal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Show contextual tooltip
     * @param {string} text
     * @param {HTMLElement} element
     */
    showTooltip(text, element) {
        // Remove any existing tooltips
        this.hideTooltip();

        const rect = element.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.id = 'active-tooltip';
        tooltip.innerHTML = text;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;

        document.body.appendChild(tooltip);
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },

    /**
     * Initialize microlearning system
     */
    init() {
        console.log('[Microlearning] Initialized');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Microlearning;
}
