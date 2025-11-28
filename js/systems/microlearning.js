/**
 * microlearning.js - Educational Popup System for GV_TEST
 *
 * Provides contextual lessons, tooltips, and quizzes to teach trading concepts.
 * Implements progressive disclosure based on tier and player actions.
 */

const Microlearning = {
    // Lesson definitions organized by tier
    lessons: {
        // =====================================================================
        // TIER 1 LESSONS - Basic Trading
        // =====================================================================
        welcome: {
            id: 'welcome',
            tier: 1,
            title: 'Welcome, Trader!',
            duration: 60,
            content: `
                <p>You are now a <strong>copper trader</strong>!</p>
                <p>Your job is simple:</p>
                <ol>
                    <li>Buy copper from mining companies</li>
                    <li>Ship it across the ocean</li>
                    <li>Sell it to manufacturers</li>
                </ol>
                <p>The difference between your buy price and sell price (minus costs) is your <strong>profit</strong>.</p>
                <p>Let's make some money!</p>
            `,
            quiz: null
        },

        basic_flow: {
            id: 'basic_flow',
            tier: 1,
            title: 'The Trading Flow',
            duration: 90,
            content: `
                <p>Every trade follows this pattern:</p>
                <div class="flow-diagram">
                    <div class="flow-step">📦 BUY</div>
                    <div class="flow-arrow">→</div>
                    <div class="flow-step">🚢 SHIP</div>
                    <div class="flow-arrow">→</div>
                    <div class="flow-step">💰 SELL</div>
                </div>
                <p><strong>Buy:</strong> Purchase copper at LME price + supplier premium</p>
                <p><strong>Ship:</strong> Cargo travels by sea (takes weeks!)</p>
                <p><strong>Sell:</strong> Deliver to buyer at LME price + buyer premium</p>
            `,
            quiz: {
                question: 'What determines your profit in physical trading?',
                options: [
                    'Only the LME price',
                    'Sell price minus buy price minus freight costs',
                    'Just the shipping distance'
                ],
                correct: 1
            }
        },

        freight_impact: {
            id: 'freight_impact',
            tier: 1,
            title: 'Freight Eats Your Margin',
            duration: 75,
            content: `
                <p>⚠️ <strong>Freight costs matter!</strong></p>
                <p>Shipping copper across the Pacific costs money:</p>
                <ul>
                    <li>Peru to Shanghai: ~$45/MT</li>
                    <li>Chile to Houston: ~$22/MT</li>
                    <li>Africa to Europe: ~$30/MT</li>
                </ul>
                <p>On a 25,000 MT cargo, that's <strong>$550,000 - $1.1M</strong> in freight!</p>
                <p>Always factor freight into your profit calculations.</p>
            `,
            quiz: {
                question: 'A cargo of 25,000 MT with $40/MT freight costs how much to ship?',
                options: [
                    '$100,000',
                    '$1,000,000',
                    '$25,000'
                ],
                correct: 1
            }
        },

        reading_trade_ticket: {
            id: 'reading_trade_ticket',
            tier: 1,
            title: 'Understanding the Numbers',
            duration: 90,
            content: `
                <p>Let's decode a trade ticket:</p>
                <div class="trade-example">
                    <div class="example-row"><span>LME Price:</span><span>$8,500/MT</span></div>
                    <div class="example-row"><span>Supplier Premium:</span><span>+$85/MT</span></div>
                    <div class="example-row highlight"><span>Buy Price:</span><span>$8,585/MT</span></div>
                    <div class="example-row"><span>Buyer Premium:</span><span>+$120/MT</span></div>
                    <div class="example-row"><span>Freight:</span><span>-$45/MT</span></div>
                    <div class="example-row highlight"><span>Net Sell:</span><span>$8,575/MT</span></div>
                </div>
                <p>Margin: $8,575 - $8,585 = <span class="negative">-$10/MT</span></p>
                <p>⚠️ This trade would <strong>lose money</strong>!</p>
            `,
            quiz: null
        },

        intro_physical_trading: {
            id: 'intro_physical_trading',
            tier: 1,
            title: 'Welcome to Physical Trading',
            duration: 60,
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
            tier: 1,
            title: 'Understanding Spot Price',
            duration: 60,
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
            tier: 1,
            title: 'Freight & Costs',
            duration: 60,
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

        // =====================================================================
        // TIER 2 LESSONS - Timing & Settlement
        // =====================================================================
        m_plus_1_intro: {
            id: 'm_plus_1_intro',
            tier: 2,
            title: 'M+1 Settlement Explained',
            duration: 120,
            content: `
                <p><strong>M+1 Pricing</strong> = price set one month after shipment</p>
                <div class="timeline-example">
                    <div class="timeline-item">
                        <span class="month">January</span>
                        <span class="event">Ship cargo</span>
                    </div>
                    <div class="timeline-arrow">→</div>
                    <div class="timeline-item">
                        <span class="month">February</span>
                        <span class="event">Price averaged</span>
                    </div>
                    <div class="timeline-arrow">→</div>
                    <div class="timeline-item">
                        <span class="month">March</span>
                        <span class="event">Invoice settled</span>
                    </div>
                </div>
                <p>If prices <span class="positive">rise</span> after you buy: You profit more!</p>
                <p>If prices <span class="negative">fall</span> after you buy: Your margin shrinks!</p>
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

        timing_risk: {
            id: 'timing_risk',
            tier: 2,
            title: 'When Timing Works Against You',
            duration: 90,
            content: `
                <p>⚠️ <strong>Price exposure is real!</strong></p>
                <p>Example scenario:</p>
                <ul>
                    <li>You buy at LME $8,500 (January spot)</li>
                    <li>Your sell price settles in February at LME $8,200</li>
                    <li>You lose $300/MT on 25,000 MT = <span class="negative">-$7.5M!</span></li>
                </ul>
                <p>This is why professional traders use <strong>hedging</strong> (coming in Tier 4).</p>
            `,
            quiz: null
        },

        contango_backwardation: {
            id: 'contango_backwardation',
            tier: 2,
            title: 'Reading the Futures Curve',
            duration: 120,
            content: `
                <p>Futures prices tell you market expectations:</p>
                <div class="curve-example">
                    <div class="curve-type">
                        <h4>Contango (Normal)</h4>
                        <p>Future > Spot</p>
                        <p>Market expects prices to rise</p>
                    </div>
                    <div class="curve-type">
                        <h4>Backwardation</h4>
                        <p>Future < Spot</p>
                        <p>Market expects prices to fall</p>
                    </div>
                </div>
                <p>Watch M+1 vs Spot: If M+1 is higher, you might benefit from delayed pricing!</p>
            `,
            quiz: null
        },

        m1_pricing_explained: {
            id: 'm1_pricing_explained',
            tier: 2,
            title: 'M+1 Pricing Explained',
            duration: 90,
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
            tier: 2,
            title: 'Price Volatility',
            duration: 60,
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
            tier: 2,
            title: 'Letters of Credit & Interest',
            duration: 90,
            content: `
                <p>A <strong>Letter of Credit (LOC)</strong> lets you trade bigger:</p>
                <ul>
                    <li>Bank guarantees payment to supplier</li>
                    <li>You don't need full cash upfront</li>
                    <li>Repay when buyer pays you</li>
                </ul>
                <p>⚠️ <strong>But there's a cost!</strong></p>
                <p>Interest accrues while you use the LOC. Longer transits = higher financing costs.</p>
            `,
            quiz: null
        },

        // =====================================================================
        // TIER 3 LESSONS - Basis Trading
        // =====================================================================
        two_exchanges: {
            id: 'two_exchanges',
            tier: 3,
            title: 'LME vs COMEX',
            duration: 90,
            content: `
                <p>Two major copper exchanges:</p>
                <table class="exchange-table">
                    <tr>
                        <th>LME (London)</th>
                        <th>COMEX (New York)</th>
                    </tr>
                    <tr>
                        <td>$/MT pricing</td>
                        <td>$/lb (converted to MT)</td>
                    </tr>
                    <tr>
                        <td>Physical delivery focus</td>
                        <td>More financial trading</td>
                    </tr>
                    <tr>
                        <td>Asian buyers prefer</td>
                        <td>US buyers prefer</td>
                    </tr>
                </table>
                <p>Prices are usually close, but sometimes they diverge...</p>
            `,
            quiz: null
        },

        basis_trading: {
            id: 'basis_trading',
            tier: 3,
            title: 'Trading the Spread',
            duration: 120,
            content: `
                <p><strong>Basis</strong> = COMEX price - LME price</p>
                <p>When basis is wide (COMEX >> LME):</p>
                <ol>
                    <li>Buy physical priced on LME</li>
                    <li>Sell to US buyer priced on COMEX</li>
                    <li>Capture the spread!</li>
                </ol>
                <div class="basis-example">
                    <p>LME: $8,500 | COMEX: $8,600 | Basis: $100</p>
                    <p>On 25,000 MT: Potential <span class="positive">$2.5M extra profit!</span></p>
                </div>
            `,
            quiz: {
                question: 'What is "basis" in copper trading?',
                options: [
                    'The shipping cost',
                    'The price difference between exchanges',
                    'The supplier premium'
                ],
                correct: 1
            }
        },

        basis_trading_intro: {
            id: 'basis_trading_intro',
            tier: 3,
            title: 'Introduction to Basis Trading',
            duration: 90,
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
            tier: 3,
            title: 'LME vs COMEX',
            duration: 60,
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
            tier: 3,
            title: 'Arbitrage Opportunities',
            duration: 90,
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

        // =====================================================================
        // TIER 4 LESSONS - Hedging
        // =====================================================================
        why_hedge: {
            id: 'why_hedge',
            tier: 4,
            title: 'The Case for Hedging',
            duration: 120,
            content: `
                <p><strong>Why hedge?</strong> To sleep at night!</p>
                <p>Without hedging:</p>
                <ul>
                    <li>You're exposed to every price move</li>
                    <li>A 5% drop = potential disaster</li>
                    <li>Profits depend on luck, not skill</li>
                </ul>
                <p>With hedging:</p>
                <ul>
                    <li>Lock in your margin at trade entry</li>
                    <li>Price moves don't affect your P&L</li>
                    <li>Focus on trading, not gambling</li>
                </ul>
            `,
            quiz: {
                question: 'Why do professional traders hedge?',
                options: [
                    'To maximize profits from price moves',
                    'To lock in margins and reduce risk',
                    'To avoid paying taxes'
                ],
                correct: 1
            }
        },

        hedge_mechanics: {
            id: 'hedge_mechanics',
            tier: 4,
            title: 'How Futures Offset Physical',
            duration: 150,
            content: `
                <p><strong>The mechanics of a hedge:</strong></p>
                <div class="hedge-diagram">
                    <div class="hedge-side">
                        <h4>Physical (Long)</h4>
                        <p>You bought 25,000 MT</p>
                        <p>If price drops: You lose</p>
                    </div>
                    <div class="hedge-plus">+</div>
                    <div class="hedge-side">
                        <h4>Futures (Short)</h4>
                        <p>Sold 1,000 contracts</p>
                        <p>If price drops: You gain</p>
                    </div>
                    <div class="hedge-equals">=</div>
                    <div class="hedge-result">
                        <h4>Net Position</h4>
                        <p>Flat (hedged)</p>
                        <p>Margin locked in!</p>
                    </div>
                </div>
            `,
            quiz: null
        },

        portfolio_thinking: {
            id: 'portfolio_thinking',
            tier: 4,
            title: 'Managing Multiple Positions',
            duration: 120,
            content: `
                <p><strong>Think in terms of net exposure:</strong></p>
                <ul>
                    <li><strong>Long physical:</strong> +50,000 MT</li>
                    <li><strong>Short futures:</strong> -40,000 MT</li>
                    <li><strong>Net exposure:</strong> +10,000 MT (underhedged)</li>
                </ul>
                <p>Monitor your book constantly:</p>
                <ul>
                    <li>Cargo arrives → close futures</li>
                    <li>New purchase → add hedge</li>
                    <li>Price rally → let winners run?</li>
                </ul>
            `,
            quiz: null
        },

        futures_hedging_intro: {
            id: 'futures_hedging_intro',
            tier: 4,
            title: 'Futures Hedging',
            duration: 90,
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
            tier: 4,
            title: 'Margin Management',
            duration: 90,
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
            tier: 4,
            title: 'Portfolio Risk',
            duration: 90,
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

    // Queue of lessons to show
    lessonQueue: [],

    // Current position in queue
    queuePosition: 0,

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

        // Check if already shown (unless reviewing)
        if (this.hasBeenShown(lessonId) && !this.isReviewing) {
            console.log('[Microlearning] Lesson already shown:', lessonId);
            return;
        }

        this.currentLesson = lesson;

        // Remove any existing modal first
        this.closeLesson();

        const progressIndicator = this.lessonQueue.length > 1
            ? `<div class="lesson-progress">${this.queuePosition + 1} of ${this.lessonQueue.length}</div>`
            : '';

        const modalHTML = `
            <div class="modal-overlay microlearning-overlay" id="lesson-modal">
                <div class="modal lesson-modal">
                    ${progressIndicator}
                    <div class="lesson-header">
                        <span class="lesson-icon">📚</span>
                        <h2>${lesson.title}</h2>
                        ${lesson.duration ? `<span class="lesson-duration">${lesson.duration}s read</span>` : ''}
                    </div>
                    <div class="lesson-content">
                        ${lesson.content}
                    </div>
                    ${lesson.quiz ? this.getQuizHTML(lesson.quiz) : ''}
                    <div class="lesson-footer">
                        <button class="btn btn-secondary btn-skip" onclick="Microlearning.skipLesson('${lessonId}')">
                            Skip
                        </button>
                        <button class="btn btn-primary" onclick="Microlearning.completeLesson('${lessonId}')">
                            ${lesson.quiz ? 'Continue' : 'Got it!'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add animation class after a tick
        requestAnimationFrame(() => {
            const modal = document.getElementById('lesson-modal');
            if (modal) {
                modal.classList.add('animate-in');
            }
        });
    },

    /**
     * Generate quiz HTML
     * @param {Object} quiz
     * @returns {string}
     */
    getQuizHTML(quiz) {
        if (!quiz || !quiz.options) return '';

        const optionsHTML = quiz.options.map((opt, i) => `
            <label class="quiz-option">
                <input type="radio" name="quiz-answer" value="${i}">
                <span class="quiz-option-text">${opt}</span>
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

        if (!resultEl) return;

        if (!selected) {
            resultEl.innerHTML = '<span class="quiz-incorrect">Please select an answer</span>';
            return;
        }

        // Guard against null currentLesson
        if (!this.currentLesson || !this.currentLesson.quiz) {
            console.warn('[Microlearning] No current lesson or quiz');
            return;
        }

        const answer = parseInt(selected.value);
        const correct = this.currentLesson.quiz.correct;
        const lessonId = this.currentLesson.id;

        // Track quiz attempt
        this.trackQuizAttempt(lessonId, answer === correct);

        if (answer === correct) {
            resultEl.innerHTML = '<span class="quiz-correct">✓ Correct! Well done.</span>';
            // Auto-complete after delay
            setTimeout(() => {
                // Check again that lesson still exists (modal might be closed)
                if (this.currentLesson && this.currentLesson.id === lessonId) {
                    this.completeLesson(lessonId);
                }
            }, 1500);
        } else {
            resultEl.innerHTML = '<span class="quiz-incorrect">✗ Not quite. Try again!</span>';
        }
    },

    /**
     * Skip a lesson (marks as seen but not completed)
     * @param {string} lessonId
     */
    skipLesson(lessonId) {
        this.markAsShown(lessonId);
        this.closeLesson();
        this.showNextInQueue();
    },

    /**
     * Complete and close lesson
     * @param {string} lessonId
     */
    completeLesson(lessonId) {
        if (!lessonId) return;

        this.markAsShown(lessonId);

        // Also mark in GameState if available
        if (typeof GameState !== 'undefined' && GameState.completeLesson) {
            GameState.completeLesson(lessonId);
        }

        this.closeLesson();
        this.showNextInQueue();
    },

    /**
     * Close lesson modal with animation
     */
    closeLesson() {
        const modal = document.getElementById('lesson-modal');
        if (modal) {
            modal.classList.add('animate-out');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 200);
        }
        this.currentLesson = null;
    },

    /**
     * Show next lesson in queue
     */
    showNextInQueue() {
        this.queuePosition++;
        if (this.queuePosition < this.lessonQueue.length) {
            setTimeout(() => {
                this.showLesson(this.lessonQueue[this.queuePosition]);
            }, 300);
        } else {
            // Queue complete
            this.lessonQueue = [];
            this.queuePosition = 0;
        }
    },

    /**
     * Queue multiple lessons
     * @param {Array} lessonIds
     */
    queueLessons(lessonIds) {
        this.lessonQueue = lessonIds.filter(id => !this.hasBeenShown(id));
        this.queuePosition = 0;

        if (this.lessonQueue.length > 0) {
            this.showLesson(this.lessonQueue[0]);
        }
    },

    /**
     * Trigger a lesson based on game event
     * @param {string} lessonId
     */
    triggerLesson(lessonId) {
        const lesson = this.lessons[lessonId];
        if (!lesson) return;

        // Check tier requirement
        const currentTier = typeof GameState !== 'undefined' ? GameState.getCurrentTier() : 1;
        if (lesson.tier > currentTier) {
            console.log('[Microlearning] Lesson tier too high:', lessonId);
            return;
        }

        // Check if already shown
        if (this.hasBeenShown(lessonId)) {
            return;
        }

        this.showLesson(lessonId);
    },

    /**
     * Show tier introduction lessons
     * @param {number} tier
     */
    showTierIntro(tier) {
        const tierLessons = {
            1: ['welcome', 'basic_flow'],
            2: ['m_plus_1_intro', 'timing_risk'],
            3: ['two_exchanges', 'basis_trading'],
            4: ['why_hedge', 'hedge_mechanics']
        };

        const lessons = tierLessons[tier] || [];
        this.queueLessons(lessons);
    },

    // =========================================================================
    // TRACKING
    // =========================================================================

    /**
     * Check if lesson has been shown
     * @param {string} lessonId
     * @returns {boolean}
     */
    hasBeenShown(lessonId) {
        if (typeof GameState !== 'undefined' && GameState.getState) {
            const state = GameState.getState();
            return state && state.shownLessons && state.shownLessons.includes(lessonId);
        }
        return false;
    },

    /**
     * Mark lesson as shown
     * @param {string} lessonId
     */
    markAsShown(lessonId) {
        if (typeof GameState !== 'undefined' && GameState.markLessonShown) {
            GameState.markLessonShown(lessonId);
        }
    },

    /**
     * Track quiz attempt
     * @param {string} lessonId
     * @param {boolean} correct
     */
    trackQuizAttempt(lessonId, correct) {
        if (typeof GameState !== 'undefined' && GameState.trackQuizAttempt) {
            GameState.trackQuizAttempt(lessonId, correct);
        }
    },

    // =========================================================================
    // LESSON LIBRARY
    // =========================================================================

    // Flag to indicate if user is reviewing
    isReviewing: false,

    /**
     * Show lesson library modal
     */
    showLessonLibrary() {
        const currentTier = typeof GameState !== 'undefined' ? GameState.getCurrentTier() : 1;

        // Group lessons by tier
        const lessonsByTier = {};
        for (let t = 1; t <= currentTier; t++) {
            lessonsByTier[t] = [];
        }

        Object.values(this.lessons).forEach(lesson => {
            if (lesson.tier <= currentTier) {
                lessonsByTier[lesson.tier].push(lesson);
            }
        });

        let libraryHTML = '';
        for (let t = 1; t <= currentTier; t++) {
            const tierLessons = lessonsByTier[t];
            if (!tierLessons || tierLessons.length === 0) continue;

            const tierName = ['', 'Single Cargo', 'Timing Game', 'Basis Trade', 'Hedged Portfolio'][t];
            libraryHTML += `
                <div class="library-tier">
                    <h4>Tier ${t}: ${tierName}</h4>
                    <div class="library-lessons">
                        ${tierLessons.map(lesson => {
                            const completed = this.hasBeenShown(lesson.id);
                            return `
                                <button class="library-lesson ${completed ? 'completed' : ''}"
                                        onclick="Microlearning.reviewLesson('${lesson.id}')">
                                    <span class="lesson-status">${completed ? '✓' : '○'}</span>
                                    <span class="lesson-title">${lesson.title}</span>
                                    ${lesson.quiz ? '<span class="has-quiz">Quiz</span>' : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        // Get quiz stats
        const quizStats = this.getQuizStats();

        const modalHTML = `
            <div class="modal-overlay" id="library-modal">
                <div class="modal library-modal">
                    <div class="modal-header">
                        <h2>📚 Lesson Library</h2>
                        <button class="modal-close" onclick="Microlearning.closeLibrary()">×</button>
                    </div>
                    <div class="library-stats">
                        <div class="stat">
                            <span class="stat-value">${quizStats.attempted}</span>
                            <span class="stat-label">Quizzes Taken</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${quizStats.correct}</span>
                            <span class="stat-label">Correct</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${quizStats.attempted > 0 ? Math.round(quizStats.correct / quizStats.attempted * 100) : 0}%</span>
                            <span class="stat-label">Accuracy</span>
                        </div>
                    </div>
                    <div class="library-content">
                        ${libraryHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Review a previously shown lesson
     * @param {string} lessonId
     */
    reviewLesson(lessonId) {
        this.closeLibrary();
        this.isReviewing = true;
        this.showLesson(lessonId);
        this.isReviewing = false;
    },

    /**
     * Close library modal
     */
    closeLibrary() {
        const modal = document.getElementById('library-modal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Get quiz statistics
     * @returns {Object}
     */
    getQuizStats() {
        if (typeof GameState !== 'undefined' && GameState.getState) {
            const state = GameState.getState();
            if (state && state.quizResults) {
                return state.quizResults;
            }
        }
        return { attempted: 0, correct: 0, byModule: {} };
    },

    // =========================================================================
    // HELP SYSTEM
    // =========================================================================

    /**
     * Show help overlay
     */
    showHelp() {
        let currentTier = 1;
        let tierConfig = { name: 'Single Cargo' };

        if (typeof GameState !== 'undefined' && GameState.getCurrentTier) {
            currentTier = GameState.getCurrentTier();
        }
        if (typeof GameConfig !== 'undefined' && GameConfig.tiers) {
            tierConfig = GameConfig.tiers[currentTier] || tierConfig;
        }

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
                    <div class="help-actions">
                        <button class="btn btn-secondary" onclick="Microlearning.closeHelp(); Microlearning.showLessonLibrary();">
                            📚 Review Lessons
                        </button>
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
     * Get lesson list HTML for tier (legacy support)
     * @param {number} tier
     * @returns {string}
     */
    getLessonListHTML(tier) {
        const allLessons = [];

        if (typeof GameConfig !== 'undefined' && GameConfig.tiers) {
            for (let t = 1; t <= tier; t++) {
                const tierConfig = GameConfig.tiers[t];
                if (tierConfig && tierConfig.lessons) {
                    allLessons.push(...tierConfig.lessons);
                }
            }
        }

        return allLessons.map(lessonId => {
            const lesson = this.lessons[lessonId];
            if (!lesson) return '';

            const completed = this.hasBeenShown(lessonId);
            return `
                <button class="lesson-btn ${completed ? 'completed' : ''}"
                        onclick="Microlearning.closeHelp(); Microlearning.reviewLesson('${lessonId}')">
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
        if (!element) return;

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
        console.log('[Microlearning] Initialized with', Object.keys(this.lessons).length, 'lessons');
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Microlearning;
}
