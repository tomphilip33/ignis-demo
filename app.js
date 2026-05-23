/**
 * ==========================================================================
 * IGNIS — CLIENT-SIDE STATE, AUTHS, STREAKS & SOUL-ALIGNMENT ENGINE
 * Cyber-Monastic Edition V2.5 (Vibrant UI, Simulated Social Auth, & String IDs Fix)
 * ==========================================================================
 */

const app = {
    // Current Global States
    currentView: 'pitch-hub',
    currentExamenStep: 1,
    activeSpiritualWeek: 1,
    tempOTP: null,
    pendingUser: null,
    
    // User Authentication Session
    session: null,
    
    // Audio Synthesis Contexts
    audioCtx: null,
    ambientPadNode: null,
    ambientRainNode: null,
    volumeNode: null,
    isPadPlaying: false,
    isRainPlaying: false,
    
    // Discernment Lab State
    discernment: {
        decision: '',
        consolations: [],
        desolations: [],
        balance: 0,
        socraticQuestion: '',
        savedReflections: []
    },

    // Initialize Application
    init() {
        this.loadSavedTheme();
        this.setupDateTime();
        this.setupEventListeners();
        this.loadSession();
        this.loadLocalStorage();
        this.renderHistory();
        this.renderDiscernmentLists();
        this.renderSavedDecisions();
        this.renderExerciseLogs();
        this.renderFeedbackLogs();
        this.updateDiscernmentMeter();
        this.updateStreakDisplay();
    },

    // Setup Top-Header Date Display
    setupDateTime() {
        const dateEl = document.getElementById('current-date');
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    },

    // Setup Multi-View Routing and Interactive Events
    setupEventListeners() {
        // Sidebar Navigation click router
        document.querySelectorAll('.nav-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Reset Data action
        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all local Ignis app data? This cannot be undone.')) {
                localStorage.clear();
                this.showToast('App data reset successfully.');
                setTimeout(() => location.reload(), 1000);
            }
        });

        // Contemplative Zen sound controller
        document.getElementById('btn-sound-pad').addEventListener('click', () => this.toggleAmbientPad());
        document.getElementById('btn-sound-rain').addEventListener('click', () => this.toggleAmbientRain());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value));

        // Daily Examen stepper navigation
        document.getElementById('btn-examen-prev').addEventListener('click', () => this.navigateExamen(-1));
        document.getElementById('btn-examen-next').addEventListener('click', () => this.navigateExamen(1));
        document.getElementById('btn-examen-finish').addEventListener('click', () => this.completeExamen());

        // Discernment Lab actions
        document.getElementById('btn-analyze-discernment').addEventListener('click', () => this.analyzeDecision());
        document.getElementById('btn-clear-discernment').addEventListener('click', () => this.clearDiscernment());
        document.getElementById('btn-save-socratic-reflection').addEventListener('click', () => this.saveSocraticReflection());

        // Discernment Lab Add buttons (explicit event listeners working exactly alike)
        document.getElementById('btn-add-consolation').addEventListener('click', () => this.addDiscernmentItem('consolation'));
        document.getElementById('btn-add-desolation').addEventListener('click', () => this.addDiscernmentItem('desolation'));

        // Discernment keyboard shortcuts
        document.getElementById('consolation-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addDiscernmentItem('consolation');
            }
        });
        document.getElementById('desolation-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addDiscernmentItem('desolation');
            }
        });

        // Spiritual Exercises levels pickers
        document.querySelectorAll('.week-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const weekNum = parseInt(e.currentTarget.getAttribute('data-week'));
                this.switchSpiritualWeek(weekNum);
            });
        });

        // Spiritual Exercises Logs saver
        document.getElementById('btn-save-exercise').addEventListener('click', () => this.saveExerciseLog());

        // Zen Focus Mode toggle
        const zenCheckbox = document.getElementById('zen-mode-checkbox');
        if (zenCheckbox) {
            zenCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.body.classList.add('zen-active');
                    this.showToast('Zen Focus Mode active 🌌');
                } else {
                    document.body.classList.remove('zen-active');
                    this.showToast('Main dashboard restored 🕯️');
                }
            });
        }

        // Simulated Authentication tabs toggles
        document.getElementById('tab-login-btn').addEventListener('click', () => this.toggleAuthTab('login'));
        document.getElementById('tab-signup-btn').addEventListener('click', () => this.toggleAuthTab('signup'));

        // Auth submit actions
        document.getElementById('btn-login-submit').addEventListener('click', () => this.handleLogin());
        document.getElementById('btn-signup-submit').addEventListener('click', () => this.handleSignup());
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());

        // Theme Toggle action
        document.getElementById('btn-theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Simulated OTP Verification actions
        document.getElementById('btn-otp-cancel').addEventListener('click', () => this.hideOTPModal());
        document.getElementById('btn-otp-verify').addEventListener('click', () => this.verifyOTP());

        // Feedback & Developer Hub submit action
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }
    },

    // Single Page App View Navigator
    switchView(viewId) {
        this.currentView = viewId;
        
        // Hide all views, show targeted view
        document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
        const activePanel = document.getElementById(`view-${viewId}`);
        if (activePanel) {
            activePanel.classList.add('active');
        }

        // Dynamically update headers
        const headerTitle = document.getElementById('page-title');
        const titlesMap = {
            'pitch-hub': 'Ignis Portfolio Pitch Hub',
            'examen-journal': 'Daily Vibe Check 🙏',
            'discernment-coach': 'Spiritual Alignment Lab ✨',
            'spiritual-exercises': 'The Four Soul Workouts ⚔️',
            'soul-space': 'Soul Space Profile'
        };
        headerTitle.textContent = titlesMap[viewId] || 'Ignis';

        // Synchronize navbar active state
        document.querySelectorAll('.nav-item').forEach(btn => {
            if (btn.getAttribute('data-view') === viewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // ==========================================================================
    // SIMULATED USER ACCOUNT AUTHENTICATION SYSTEM
    // ==========================================================================
    toggleAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        if (tab === 'login') {
            document.getElementById('tab-login-btn').classList.add('active');
            document.getElementById('form-login').classList.add('active');
        } else {
            document.getElementById('tab-signup-btn').classList.add('active');
            document.getElementById('form-signup').classList.add('active');
        }
    },

    handleSignup() {
        const usernameInput = document.getElementById('signup-username');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const avatarSelect = document.getElementById('signup-avatar');
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const avatar = avatarSelect.value;

        if (!username || !email || !password) {
            alert('Please supply a Soul Tag, an Email, and a passcode.');
            return;
        }

        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailReg.test(email)) {
            alert('Please enter a valid email address (e.g. pilgrim@holyplace.org).');
            return;
        }

        const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');
        const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === email.toLowerCase()));

        if (exists) {
            alert('That Soul Tag or Email Address is already registered! Please pick another.');
            return;
        }

        // Prepare pending session
        const newUser = {
            username,
            email,
            password,
            avatar,
            streak: 1, // Pre-seed 1 day streak for satisfying visual feedback!
            lastLoggedExamen: new Date().toDateString(),
            joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        // Generate 6-digit confirmation OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.pendingUser = newUser;
        this.tempOTP = code;

        // Display beautiful verification alert
        document.getElementById('otp-modal').classList.remove('hidden');
        document.getElementById('otp-input').value = '';
        this.showToast(`🔥 Security OTP Sent: ${code}`);

        // Clean inputs
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
    },

    handleLogin() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            alert('Please supply your Email/Soul Tag and passcode.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');
        const user = users.find(u => (u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === username.toLowerCase())) && u.password === password);

        if (!user) {
            alert('Invalid credentials or passcode. Please try again.');
            return;
        }

        // Trigger secure OTP flow for login as well (making it highly professional!)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.pendingUser = user;
        this.tempOTP = code;

        document.getElementById('otp-modal').classList.remove('hidden');
        document.getElementById('otp-input').value = '';
        this.showToast(`🔥 Security OTP Sent: ${code}`);

        usernameInput.value = '';
        passwordInput.value = '';
    },


    handleLogout() {
        this.session = null;
        localStorage.removeItem('ignis_session');
        this.showToast('Signed out of Soul Space.');
        this.updateProfileDashboard();
        this.updateStreakDisplay();
        this.switchView('pitch-hub');
    },

    handleSocialAuth(provider) {
        // Toggle simulated modal loader
        const modal = document.getElementById('social-modal');
        const title = document.getElementById('social-modal-title');
        const desc = document.getElementById('social-modal-desc');

        title.textContent = `Connecting to ${provider}...`;
        desc.textContent = `Authenticating secure OAuth handshake with ${provider} soul nodes. Stand by...`;
        modal.classList.remove('hidden');

        setTimeout(() => {
            // Generate fun pilgrim credentials
            const randomNum = Math.floor(Math.random() * 90) + 10;
            const prefix = provider === 'Google' ? 'google_monk' : 'whatsapp_pilgrim';
            const username = `${prefix}_${randomNum}`;
            const avatar = provider === 'Google' ? '✨ Star' : '🕊️ Dove';

            const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');
            let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

            if (!user) {
                user = {
                    username,
                    password: 'social-authenticated',
                    avatar,
                    streak: 1, // Start with 1 day streak for immediate momentum!
                    lastLoggedExamen: new Date().toDateString(),
                    joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };
                users.push(user);
                localStorage.setItem('ignis_users', JSON.stringify(users));
            }

            // Bind session
            this.session = user;
            localStorage.setItem('ignis_session', JSON.stringify(user));
            
            // Hide modal loader
            modal.classList.add('hidden');
            this.showToast(`Logged in via ${provider} as @${username} 🔥`);

            this.updateProfileDashboard();
            this.updateStreakDisplay();
        }, 2200);
    },

    loadSession() {
        const cached = localStorage.getItem('ignis_session');
        if (cached) {
            this.session = JSON.parse(cached);
        }
        this.updateProfileDashboard();
    },

    updateProfileDashboard() {
        const authContainer = document.getElementById('auth-forms-container');
        const dashboard = document.getElementById('profile-dashboard');
        const headerPill = document.getElementById('header-streak-pill');

        if (this.session) {
            authContainer.classList.add('hidden');
            dashboard.classList.remove('hidden');
            headerPill.classList.remove('hidden');

            const avatarVal = this.session.avatar ? (this.session.avatar.split ? this.session.avatar.split(' ')[0] : this.session.avatar) : '🔥';
            document.getElementById('profile-avatar-circle').textContent = avatarVal;
            document.getElementById('profile-display-username').textContent = this.session.username;
            document.getElementById('profile-display-joined').textContent = `Joined ${this.session.joined}`;

            const examens = JSON.parse(localStorage.getItem('examen_history') || '[]');
            const alignments = JSON.parse(localStorage.getItem('saved_decisions') || '[]');
            const logs = JSON.parse(localStorage.getItem('exercise_logs') || '[]');

            document.getElementById('stat-examen-count').textContent = examens.length;
            document.getElementById('stat-decision-count').textContent = alignments.length;
            document.getElementById('stat-exercise-count').textContent = logs.length;
        } else {
            authContainer.classList.remove('hidden');
            dashboard.classList.add('hidden');
            headerPill.classList.add('hidden');
        }
    },

    // ==========================================================================
    // GAMIFIED SPIRITUAL MOMENTUM STREAK SYSTEM
    // ==========================================================================
    updateStreakDisplay() {
        let streak = 0;
        if (this.session) {
            const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');
            const dbUser = users.find(u => u.username.toLowerCase() === this.session.username.toLowerCase());
            if (dbUser) {
                streak = dbUser.streak;
                this.session.streak = streak;
                localStorage.setItem('ignis_session', JSON.stringify(this.session));
            }
        } else {
            streak = parseInt(localStorage.getItem('guest_streak') || '0');
        }

        document.getElementById('sidebar-streak-count').textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
        document.getElementById('header-streak-count').textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
        document.getElementById('streak-days-number').textContent = `${streak} Consecutive ${streak === 1 ? 'Day' : 'Days'}`;

        const flameRender = document.getElementById('glowing-flame-render');
        const levelTitle = document.getElementById('streak-level-title');
        const levelDesc = document.getElementById('streak-level-description');

        if (streak === 0) {
            flameRender.textContent = '💨';
            flameRender.style.filter = 'drop-shadow(0 0 2px gray)';
            levelTitle.textContent = 'Ember Spark';
            levelDesc.textContent = 'Your internal fire is quiet. Record a Daily Vibe Check or save a workout log to ignite your flame!';
        } else if (streak >= 1 && streak <= 3) {
            flameRender.textContent = '🔥';
            flameRender.style.filter = 'drop-shadow(0 0 10px rgba(255, 179, 0, 0.4))';
            levelTitle.textContent = 'Hearth Flame 🕯️';
            levelDesc.textContent = 'Cozy and consistent! You are starting to focus your daily actions with reflection. Keep it going!';
        } else if (streak >= 4 && streak <= 7) {
            flameRender.textContent = '✨🔥';
            flameRender.style.filter = 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.6))';
            levelTitle.textContent = 'Ascending Beacon 🌟';
            levelDesc.textContent = 'You have active spiritual momentum. Ignatius smiles at your steady, daily commitment to alignment!';
        } else {
            flameRender.textContent = '⚡💜🔥';
            flameRender.style.filter = 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.8))';
            levelTitle.textContent = 'Wildfire Beacon 💥';
            levelDesc.textContent = 'Absolute Wildfire! Your interior light is glowing brightly and radiating active, mindful clarity. Outstanding soul workout!';
        }
    },

    incrementStreak() {
        const today = new Date().toDateString();
        
        if (this.session) {
            const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');
            const idx = users.findIndex(u => u.username.toLowerCase() === this.session.username.toLowerCase());
            
            if (idx !== -1) {
                const user = users[idx];
                const lastDate = user.lastLoggedExamen;

                if (lastDate === today) {
                    return;
                } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
                    user.streak += 1;
                } else {
                    user.streak = 1;
                }

                user.lastLoggedExamen = today;
                users[idx] = user;
                localStorage.setItem('ignis_users', JSON.stringify(users));
                
                this.session = user;
                localStorage.setItem('ignis_session', JSON.stringify(user));
            }
        } else {
            const lastDate = localStorage.getItem('guest_last_logged');
            let streak = parseInt(localStorage.getItem('guest_streak') || '0');

            if (lastDate === today) {
                return;
            } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
                streak += 1;
            } else {
                streak = 1;
            }

            localStorage.setItem('guest_streak', streak.toString());
            localStorage.setItem('guest_last_logged', today);
        }

        this.updateStreakDisplay();
        this.updateProfileDashboard();
    },

    // ==========================================================================
    // CONTEMPLATIVE AUDIO SYNTHESIS ENGINE (Web Audio API)
    // Dynamic generation of warm pad and rain sounds. No asset footprint.
    // ==========================================================================
    initAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.volumeNode = this.audioCtx.createGain();
            this.volumeNode.gain.value = 0.5; // Default 50%
            this.volumeNode.connect(this.audioCtx.destination);
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    setVolume(value) {
        this.initAudioContext();
        if (this.volumeNode) {
            this.volumeNode.gain.setValueAtTime(value / 100, this.audioCtx.currentTime);
        }
    },

    toggleAmbientPad() {
        this.initAudioContext();
        const btn = document.getElementById('btn-sound-pad');
        
        if (this.isPadPlaying) {
            if (this.ambientPadNode) {
                const now = this.audioCtx.currentTime;
                this.ambientPadNode.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
                setTimeout(() => {
                    if (this.ambientPadNode) {
                        this.ambientPadNode.oscs.forEach(osc => osc.stop());
                        this.ambientPadNode = null;
                    }
                }, 1600);
            }
            btn.classList.remove('playing');
            this.isPadPlaying = false;
            this.showToast('Lumina Pad Stopped.');
        } else {
            const now = this.audioCtx.currentTime;
            const oscs = [];
            const gainNode = this.audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.2, now + 2.0); // Warm swell

            const filterNode = this.audioCtx.createBiquadFilter();
            filterNode.type = 'lowpass';
            filterNode.Q.value = 3.5;
            filterNode.frequency.setValueAtTime(500, now);

            const baseFreqs = [65.41, 130.81, 196.00, 261.63];
            
            baseFreqs.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
                osc.frequency.setValueAtTime(freq, now);
                osc.detune.setValueAtTime((Math.random() - 0.5) * 16, now);
                
                osc.connect(filterNode);
                osc.start(now);
                oscs.push(osc);
            });

            const delayNode = this.audioCtx.createDelay();
            delayNode.delayTime.setValueAtTime(0.45, now);
            const feedbackNode = this.audioCtx.createGain();
            feedbackNode.gain.setValueAtTime(0.38, now);

            filterNode.connect(gainNode);
            gainNode.connect(this.volumeNode);
            
            gainNode.connect(delayNode);
            delayNode.connect(feedbackNode);
            feedbackNode.connect(delayNode);
            delayNode.connect(this.volumeNode);

            const lfo = this.audioCtx.createOscillator();
            lfo.frequency.setValueAtTime(0.1, now);
            const lfoGain = this.audioCtx.createGain();
            lfoGain.gain.setValueAtTime(200, now);
            
            lfo.connect(lfoGain);
            lfoGain.connect(filterNode.frequency);
            lfo.start(now);
            oscs.push(lfo);

            this.ambientPadNode = { oscs, gainNode };
            btn.classList.add('playing');
            this.isPadPlaying = true;
            this.showToast('Lumina Pad Active. Breathe...');
        }
    },

    toggleAmbientRain() {
        this.initAudioContext();
        const btn = document.getElementById('btn-sound-rain');

        if (this.isRainPlaying) {
            if (this.ambientRainNode) {
                const now = this.audioCtx.currentTime;
                this.ambientRainNode.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                setTimeout(() => {
                    if (this.ambientRainNode) {
                        this.ambientRainNode.source.stop();
                        this.ambientRainNode = null;
                    }
                }, 1300);
            }
            btn.classList.remove('playing');
            this.isRainPlaying = false;
            this.showToast('Zen Rain Stopped.');
        } else {
            const now = this.audioCtx.currentTime;
            const bufferSize = 2 * this.audioCtx.sampleRate;
            const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }

            const source = this.audioCtx.createBufferSource();
            source.buffer = noiseBuffer;
            source.loop = true;

            const filter = this.audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(950, now);

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.001, now);
            gainNode.gain.exponentialRampToValueAtTime(0.45, now + 1.5);

            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.volumeNode);

            source.start(now);
            this.ambientRainNode = { source, gainNode };
            btn.classList.add('playing');
            this.isRainPlaying = true;
            this.showToast('Zen Rainscape Active.');
        }
    },

    // ==========================================================================
    // VIEW 2: GUIDED DAILY EXAMEN SYSTEM (DAILY VIBE CHECK)
    // ==========================================================================
    navigateExamen(direction) {
        const nextStep = this.currentExamenStep + direction;
        if (nextStep >= 1 && nextStep <= 5) {
            document.querySelectorAll('.examen-step').forEach(step => step.classList.remove('active'));
            document.querySelector(`.examen-step[data-step="${nextStep}"]`).classList.add('active');
            
            this.currentExamenStep = nextStep;
            document.querySelector('.stepper-indicator').textContent = `Vibe Check: Step ${this.currentExamenStep} of 5`;
            document.querySelector('.progress-bar-fill').style.width = `${this.currentExamenStep * 20}%`;
            
            document.getElementById('btn-examen-prev').disabled = this.currentExamenStep === 1;
            
            if (this.currentExamenStep === 5) {
                document.getElementById('btn-examen-next').classList.add('hidden');
                document.getElementById('btn-examen-finish').classList.remove('hidden');
            } else {
                document.getElementById('btn-examen-next').classList.remove('hidden');
                document.getElementById('btn-examen-finish').classList.add('hidden');
            }
            
            this.updateExamenGuidance(this.currentExamenStep);
        }
    },

    updateExamenGuidance(step) {
        const guidanceEl = document.getElementById('examen-guidance-content');
        const guidanceData = {
            1: {
                text: "Gratitude is the grounding platform of all soul exercises. Ignatius notes that an ungrateful mind closes down our ability to see beauty and divine gifts around us.",
                cit: "— Ignatian Insights"
            },
            2: {
                text: "We ask for clear, unfiltered light because our ego creates protective layers. We desire the grace to inspect our day clearly, with complete self-compassion.",
                cit: "— Fr. Pedro Arrupe, SJ"
            },
            3: {
                text: "Your day is a stream of emotional data. Look for Consolation (peace, hope, energy) and Desolation (vanity, dryness, fear). Ignatius teaches that your genuine path reveals itself in these waves.",
                cit: "— Spiritual Alignment lab"
            },
            4: {
                text: "Resetting means forgiving. Rest in the understanding that mercy is completely unconditional. Drop the heavy weights of failure; you are restored.",
                cit: "— Pope Francis"
            },
            5: {
                text: "Tomorrow is an empty script. Ditch future-anxiety; map out one small conscious choices where you can show up with more charity and absolute presence.",
                cit: "— Ignatian Insight"
            }
        };
        
        const data = guidanceData[step];
        guidanceEl.innerHTML = `<p class="guidance-text">"${data.text}"</p><div class="citation">${data.cit}</div>`;
    },

    completeExamen() {
        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            step1: document.getElementById('examen-input-1').value.trim(),
            step2: document.getElementById('examen-input-2').value.trim(),
            step3: document.getElementById('examen-input-3').value.trim(),
            step4: document.getElementById('examen-input-4').value.trim(),
            step5: document.getElementById('examen-input-5').value.trim(),
        };

        if (!entry.step1 && !entry.step3 && !entry.step5) {
            alert("Record a few thoughts in your Examen steps before saving!");
            return;
        }

        const history = JSON.parse(localStorage.getItem('examen_history') || '[]');
        history.unshift(entry);
        localStorage.setItem('examen_history', JSON.stringify(history));

        this.incrementStreak();

        this.showToast('-> Entry written to local block');
        
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`examen-input-${i}`).value = '';
        }
        this.navigateExamen(-4); // Return step 1
        this.renderHistory();
    },

    renderHistory() {
        const historyList = document.getElementById('examen-history-list');
        const history = JSON.parse(localStorage.getItem('examen_history') || '[]');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No examen entries saved yet. Complete your first Examen to build your history!</p>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="item-header">
                    <span>Examen Vibe Check</span>
                    <span>${entry.date}</span>
                </div>
                <div class="item-body">Gratitude: ${entry.step1 || 'No entry'} | Review: ${entry.step3 || 'No entry'}</div>
            `;
            div.addEventListener('click', () => this.viewExamenDetail(entry));
            historyList.appendChild(div);
        });
    },

    viewExamenDetail(entry) {
        const detailStr = `
Date: ${entry.date}
------------------------------------
1. Gratitude 🙏:
${entry.step1 || 'Empty'}

2. Petition 🕯️:
${entry.step2 || 'Empty'}

3. Review of Day 🔍:
${entry.step3 || 'Empty'}

4. Forgiveness 🤍:
${entry.step4 || 'Empty'}

5. Resolve for Tomorrow ⚡:
${entry.step5 || 'Empty'}
        `;
        alert(detailStr);
    },

    // ==========================================================================
    // VIEW 3: SPIRITUAL ALIGNMENT LAB (DISCERNMENT LAB)
    // ==========================================================================
    addDiscernmentItem(type) {
        const inputEl = document.getElementById(`${type}-input`);
        const weightEl = document.getElementById(`${type}-weight`);
        const text = inputEl.value.trim();
        const weight = parseInt(weightEl.value);

        if (!text) return;

        // String IDs generated for absolute HTML compatibility
        const item = {
            id: Date.now().toString() + Math.random().toString(),
            text,
            weight: type === 'consolation' ? weight : -weight
        };

        if (type === 'consolation') {
            this.discernment.consolations.push(item);
        } else {
            this.discernment.desolations.push(item);
        }

        inputEl.value = '';
        this.renderDiscernmentLists();
        this.updateDiscernmentMeter();
    },

    deleteDiscernmentItem(type, id) {
        // String comparisons (item.id.toString() !== id.toString())
        if (type === 'consolation') {
            this.discernment.consolations = this.discernment.consolations.filter(item => item.id.toString() !== id.toString());
        } else {
            this.discernment.desolations = this.discernment.desolations.filter(item => item.id.toString() !== id.toString());
        }
        this.renderDiscernmentLists();
        this.updateDiscernmentMeter();
    },

    renderDiscernmentLists() {
        const consolationsUl = document.getElementById('list-consolations');
        const desolationsUl = document.getElementById('list-desolations');

        consolationsUl.innerHTML = '';
        this.discernment.consolations.forEach(item => {
            const li = document.createElement('li');
            li.className = 'discernment-list-item consolation-type';
            li.innerHTML = `
                <span class="item-text">${item.text}</span>
                <span class="item-badge">+${item.weight}</span>
                <button class="btn-delete-item" onclick="app.deleteDiscernmentItem('consolation', '${item.id}')">×</button>
            `;
            consolationsUl.appendChild(li);
        });

        desolationsUl.innerHTML = '';
        this.discernment.desolations.forEach(item => {
            const li = document.createElement('li');
            li.className = 'discernment-list-item desolation-type';
            li.innerHTML = `
                <span class="item-text">${item.text}</span>
                <span class="item-badge">${item.weight}</span>
                <button class="btn-delete-item" onclick="app.deleteDiscernmentItem('desolation', '${item.id}')">×</button>
            `;
            desolationsUl.appendChild(li);
        });
    },

    updateDiscernmentMeter() {
        const cSum = this.discernment.consolations.reduce((sum, item) => sum + item.weight, 0);
        const dSum = this.discernment.desolations.reduce((sum, item) => sum + item.weight, 0);
        const total = cSum + dSum; // dSum is negative
        
        this.discernment.balance = total;

        const meter = document.getElementById('analysis-meter');
        const meterText = document.getElementById('analysis-meter-text');
        const caption = document.getElementById('meter-caption');

        const clampedVal = Math.max(-25, Math.min(25, total));
        const percentage = ((clampedVal + 25) / 50) * 100;
        
        meter.style.width = `${percentage}%`;

        // SVG Scale Beam rotation
        const beam = document.getElementById('scale-beam-group');
        if (beam) {
            const angle = -(clampedVal / 25) * 15; // negative rotates left down, positive right down
            beam.style.transform = `rotate(${angle}deg)`;
        }

        // SVG Scale pan indicator lights
        const cIndicator = document.getElementById('scale-consolations-indicator');
        const dIndicator = document.getElementById('scale-desolations-indicator');
        if (cIndicator && dIndicator) {
            if (total > 0) {
                cIndicator.style.opacity = '1';
                dIndicator.style.opacity = '0';
            } else if (total < 0) {
                cIndicator.style.opacity = '0';
                dIndicator.style.opacity = '1';
            } else {
                cIndicator.style.opacity = '0';
                dIndicator.style.opacity = '0';
            }
        }

        // Dynamic glass-panel glow shifts based on dominant wave
        if (total > 0) {
            document.documentElement.style.setProperty('--glow-aura-color', 'rgba(255, 191, 0, 0.25)'); // Amber/gold
        } else if (total < 0) {
            document.documentElement.style.setProperty('--glow-aura-color', 'rgba(99, 102, 241, 0.25)'); // Indigo/obsidian
        } else {
            document.documentElement.style.setProperty('--glow-aura-color', 'rgba(139, 92, 246, 0.15)'); // default violet
        }

        if (total > 0) {
            meterText.textContent = `Consolation Active (+${total})`;
            caption.textContent = "Spiritual Consolation detected. Ignatius guides us to stick firmly to our initial spiritual goals and share our inner peace with those suffering.";
        } else if (total < 0) {
            meterText.textContent = `Desolation Active (${total})`;
            caption.textContent = "Interior Desolation detected. Ignatius's CRITICAL rule is: *'In time of desolation, never make a change.'* Focus on patience and trust that peaceful waves will return.";
        } else {
            meterText.textContent = `Equilibrium (0)`;
            caption.textContent = "Perfect balance. Sit with your thoughts, or list more aspects of your choice to identify subtle emotional movements.";
        }
    },

    analyzeDecision() {
        const decisionText = document.getElementById('decision-text').value.trim();
        if (!decisionText) {
            alert("State your decision question before running alignment analysis.");
            return;
        }

        this.discernment.decision = decisionText;

        const cTexts = this.discernment.consolations.map(c => c.text.toLowerCase()).join(' ');
        const dTexts = this.discernment.desolations.map(d => d.text.toLowerCase()).join(' ');
        const fullText = `${decisionText.toLowerCase()} ${cTexts} ${dTexts}`;

        let question = '';

        if (fullText.includes('career') || fullText.includes('job') || fullText.includes('move') || fullText.includes('transition')) {
            question = "Are you moving toward a greater freedom to serve, or running from an attachment you fear confronting? Ignatius warns of 'spiritual ambition'—is this shift driven by status, or does it expand your capacity for quiet service to others?";
        } else if (fullText.includes('relationship')) {
            question = "St. Ignatius invites us to love in a way that is free, not clinging. Does this connection elevate your soul to seek the truth, or are you clinging to it to shield yourself from your own inner void?";
        } else if (fullText.includes('fear') || fullText.includes('anxious') || fullText.includes('scared') || fullText.includes('worry')) {
            question = "I notice fear or worry is highly visible in your logs. St. Ignatius teaches that the 'spirit of desolation' uses fear to trap our freedom. Can you look beneath the static: does this fear stem from constructive caution, or is it trying to isolate you?";
        } else if (fullText.includes('money') || fullText.includes('wealth') || fullText.includes('salary') || fullText.includes('status')) {
            question = "Your decision touches on security, wealth, or status. Ignatius advocates a spirit of 'holy indifference'—desiring only what fosters genuine love. If both choices paid exactly the same and had the same profile, which would you pick?";
        } else if (fullText.includes('exhaust') || fullText.includes('tired') || fullText.includes('burnout') || fullText.includes('busy')) {
            question = "You feel exhausted. Ignatius values stewardship of our own vessel (*cura personalis*). In what way does each choice nourish your physical, emotional, and spiritual core so you can serve others long-term?";
        } else if (fullText.includes('peace') || fullText.includes('calm') || fullText.includes('joy') || fullText.includes('grateful')) {
            question = "You have deep peace (consolation). St. Ignatius challenges us to double check: is this a lasting consolation that increases faith, hope, and charity, or a passing rush of vanity? Does it call you to serve others in humility?";
        } else if (this.discernment.consolations.length === 0 && this.discernment.desolations.length === 0) {
            question = "Your alignment lists are empty. Try jotting down raw vibes: what feelings surface when you imagine picking A? What arises when you imagine choosing B?";
        } else {
            const prompts = [
                "St. Ignatius suggests a drill: Imagine giving advice to a stranger seeking counsel on this exact choice. What would you tell them in a spirit of complete charity? Does that apply to you too?",
                "Imagine you are at the end of your life, looking back. Which decision will you wish you had made, presenting it to the Divine with a clean heart?",
                "Identify your 'attachments' here. What is the one fear or desire you are holding onto that blocks you from feeling free to pick either path?"
            ];
            question = prompts[Math.floor(Math.random() * prompts.length)];
        }

        this.discernment.socraticQuestion = question;

        const bubble = document.getElementById('socratic-chat-bubble');
        bubble.innerHTML = `
            <p class="coach-text">"${question}"</p>
            <div class="coach-signature">— Socratic Companion</div>
        `;

        document.getElementById('socratic-response-actions').classList.remove('hidden');
        this.showToast('Vibes analyzed. Coach prompt loaded.');
    },

    saveSocraticReflection() {
        const text = document.getElementById('socratic-journal-input').value.trim();
        if (!text) {
            alert("Write down your reflection insights before saving.");
            return;
        }

        const discernmentCase = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            decision: this.discernment.decision,
            consolations: [...this.discernment.consolations],
            desolations: [...this.discernment.desolations],
            balance: this.discernment.balance,
            question: this.discernment.socraticQuestion,
            reflection: text
        };

        const saved = JSON.parse(localStorage.getItem('saved_decisions') || '[]');
        saved.unshift(discernmentCase);
        localStorage.setItem('saved_decisions', JSON.stringify(saved));

        this.incrementStreak();

        this.showToast('Alignment case saved. Streak active 🔥');
        
        document.getElementById('socratic-journal-input').value = '';
        document.getElementById('socratic-response-actions').classList.add('hidden');
        document.getElementById('socratic-chat-bubble').innerHTML = `
            <p class="coach-text">"Welcome to the Alignment Lab. Input your decision question and list interior movements. I will analyze the spirits and challenge your motives Socratic-style."</p>
            <div class="coach-signature">— Socratic Companion</div>
        `;
        
        this.clearDiscernment();
        this.renderSavedDecisions();
    },

    clearDiscernment() {
        this.discernment.consolations = [];
        this.discernment.desolations = [];
        this.discernment.decision = '';
        document.getElementById('decision-text').value = '';
        this.renderDiscernmentLists();
        this.updateDiscernmentMeter();
    },

    renderSavedDecisions() {
        const list = document.getElementById('saved-decisions-list');
        const saved = JSON.parse(localStorage.getItem('saved_decisions') || '[]');

        if (saved.length === 0) {
            list.innerHTML = '<p class="empty-state">No saved alignment cases yet.</p>';
            return;
        }

        list.innerHTML = '';
        saved.forEach(item => {
            const div = document.createElement('div');
            div.className = 'decision-item';
            div.innerHTML = `
                <div class="item-header">
                    <span>${item.date}</span>
                    <span>Alignment Score: ${item.balance > 0 ? '+' : ''}${item.balance}</span>
                </div>
                <div class="item-body">Q: ${item.decision}</div>
            `;
            div.addEventListener('click', () => this.viewDecisionDetail(item));
            list.appendChild(div);
        });
    },

    viewDecisionDetail(item) {
        const cNames = item.consolations.map(c => `• ${c.text} (+${c.weight})`).join('\n');
        const dNames = item.desolations.map(d => `• ${d.text} (${d.weight})`).join('\n');

        const detailStr = `
Decision: ${item.decision}
Date: ${item.date}
Alignment Score: ${item.balance}
------------------------------------
Consolations Listed ✨:
${cNames || 'None'}

Desolations Listed 🌪️:
${dNames || 'None'}

Socratic Question Posed:
"${item.question}"

Logged Reflection:
"${item.reflection}"
        `;
        alert(detailStr);
    },

    // ==========================================================================
    // VIEW 4: SPIRITUAL EXERCISES CONTROLLER (SOUL WORKOUTS)
    // ==========================================================================
    switchSpiritualWeek(weekNum) {
        this.activeSpiritualWeek = weekNum;

        document.querySelectorAll('.week-tab').forEach(tab => {
            if (parseInt(tab.getAttribute('data-week')) === weekNum) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        document.querySelectorAll('.week-detail').forEach(detail => {
            if (parseInt(detail.getAttribute('data-week-content')) === weekNum) {
                detail.classList.add('active');
            } else {
                detail.classList.remove('active');
            }
        });
    },

    saveExerciseLog() {
        const title = document.getElementById('exercise-title').value.trim();
        const journal = document.getElementById('exercise-journal').value.trim();

        if (!title || !journal) {
            alert("Complete the title and journal input fields before saving.");
            return;
        }

        const log = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            week: this.activeSpiritualWeek,
            title,
            journal
        };

        const logs = JSON.parse(localStorage.getItem('exercise_logs') || '[]');
        logs.unshift(log);
        localStorage.setItem('exercise_logs', JSON.stringify(logs));

        this.incrementStreak();

        this.showToast('Workout journal logged. Streak active 🔥');

        document.getElementById('exercise-title').value = '';
        document.getElementById('exercise-journal').value = '';

        this.renderExerciseLogs();
    },

    renderExerciseLogs() {
        const list = document.getElementById('exercise-logs-list');
        const logs = JSON.parse(localStorage.getItem('exercise_logs') || '[]');

        if (logs.length === 0) {
            list.innerHTML = '<p class="empty-state">No exercise journals recorded yet.</p>';
            return;
        }

        list.innerHTML = '';
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `
                <div class="item-header">
                    <span>Level ${log.week}: ${log.title}</span>
                    <span>${log.date}</span>
                </div>
                <div class="item-body">${log.journal}</div>
            `;
            div.addEventListener('click', () => {
                alert(`Level ${log.week}: ${log.title}\nDate: ${log.date}\n------------------\n${log.journal}`);
            });
            list.appendChild(div);
        });
    },

    submitFeedback() {
        const type = document.getElementById('feedback-type').value;
        const email = document.getElementById('feedback-email').value.trim();
        const details = document.getElementById('feedback-details').value.trim();

        if (!details) {
            alert("Please input some details for your feedback before submitting.");
            return;
        }

        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            type: type,
            email: email || "Anonymous Pilgrim",
            details: details
        };

        const list = JSON.parse(localStorage.getItem('feedback_history') || '[]');
        list.unshift(entry);
        localStorage.setItem('feedback_history', JSON.stringify(list));

        // Clear details input
        document.getElementById('feedback-details').value = '';
        document.getElementById('feedback-email').value = '';

        this.showToast('-> Feedback logged to local block');
        this.renderFeedbackLogs();
    },

    renderFeedbackLogs() {
        const list = document.getElementById('feedback-logs-list');
        const logs = JSON.parse(localStorage.getItem('feedback_history') || '[]');

        if (logs.length === 0) {
            list.innerHTML = '<p class="empty-state">No feedback logged yet. Your suggestions will be saved locally in your vault!</p>';
            return;
        }

        list.innerHTML = '';
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'feedback-item';
            div.innerHTML = `
                <div class="item-header">
                    <span>${log.type} (${log.email})</span>
                    <span>${log.date}</span>
                </div>
                <div class="item-body" style="white-space: normal; overflow: visible; text-overflow: clip;">${log.details}</div>
            `;
            div.addEventListener('click', () => {
                alert(`Submission Type: ${log.type}\nFrom: ${log.email}\nDate: ${log.date}\n------------------\n${log.details}`);
            });
            list.appendChild(div);
        });
    },

    // ==========================================================================
    // NOTIFICATION TOAST & DATA PERSISTENCE
    // ==========================================================================
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },

    loadLocalStorage() {
        const history = localStorage.getItem('examen_history');
        if (!history) {
            const sampleExamen = [{
                id: "101",
                date: "May 22, 2026, 09:30 PM",
                step1: "Incredibly grateful for the warm fellowship during our team dinner tonight, and the opportunity to pair-program on this prototype project.",
                step2: "Grace to see where my ego dominated conversations or where I was impatient.",
                step3: "Reviewed. Consolation when walking home under the stars. Desolation when I felt defensive during feedback on a UI component.",
                step4: "Offered my defensiveness to grace and asked for pardon. Rested in quiet peace.",
                step5: "Resolved to listen actively tomorrow before offering counter-ideas."
            }];
            localStorage.setItem('examen_history', JSON.stringify(sampleExamen));
        }

        const decisions = localStorage.getItem('saved_decisions');
        if (!decisions) {
            const sampleDecision = [{
                id: "201",
                date: "May 21, 2026",
                decision: "Should I accept the offer to transition into a new vocational role?",
                consolations: [
                    { id: "1", text: "Sense of creative growth and collaborative excitement", weight: 5 },
                    { id: "2", text: "More alignment with my commitment to serving the community", weight: 3 }
                ],
                desolations: [
                    { id: "3", text: "Anxiety about relocating to a new city and starting over", weight: -3 }
                ],
                balance: 5,
                question: "St. Ignatius advises an exercise: Imagine you are at the end of your life. Which decision would you wish you had made, so that you could present it to the Divine with a clean heart?",
                reflection: "I realized that at the end of my life, I would regret letting fear of relocation hold me back from a role that offers so much creative and spiritual expansion. The desolation is real but it's just fear of the unknown, not a lack of alignment."
            }];
            localStorage.setItem('saved_decisions', JSON.stringify(sampleDecision));
        }

        if (!localStorage.getItem('guest_streak') && !localStorage.getItem('ignis_session')) {
            localStorage.setItem('guest_streak', '1');
            localStorage.setItem('guest_last_logged', new Date().toDateString());
        }
    },

    // ==========================================================================
    // THEME & DYNAMIC REAL-TIME OTP AUTH ENHANCEMENTS
    // ==========================================================================
    loadSavedTheme() {
        const theme = localStorage.getItem('ignis_theme') || 'dark';
        const toggleIcon = document.querySelector('#btn-theme-toggle .theme-icon');
        
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            if (toggleIcon) toggleIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('light-theme');
            if (toggleIcon) toggleIcon.textContent = '☀️';
        }
    },

    toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('ignis_theme', isLight ? 'light' : 'dark');
        
        const toggleIcon = document.querySelector('#btn-theme-toggle .theme-icon');
        if (toggleIcon) toggleIcon.textContent = isLight ? '🌙' : '☀️';
        
        this.showToast(isLight ? 'Light parchment theme active 🕯️' : 'Obsidian dark theme active 🔥');
    },

    hideOTPModal() {
        document.getElementById('otp-modal').classList.add('hidden');
        document.getElementById('otp-input').value = '';
        this.tempOTP = null;
        this.pendingUser = null;
    },

    verifyOTP() {
        const otpInput = document.getElementById('otp-input');
        const otpVal = otpInput.value.trim();

        if (otpVal === this.tempOTP) {
            const users = JSON.parse(localStorage.getItem('ignis_users') || '[]');

            // If it's a new signup (not yet in users db)
            const exists = users.some(u => u.username.toLowerCase() === this.pendingUser.username.toLowerCase());
            if (!exists) {
                users.push(this.pendingUser);
                localStorage.setItem('ignis_users', JSON.stringify(users));
            }

            this.session = this.pendingUser;
            localStorage.setItem('ignis_session', JSON.stringify(this.pendingUser));

            this.hideOTPModal();
            this.showToast(`Soul Space Authorized! Welcome @${this.session.username} ✨`);
            this.updateProfileDashboard();
            this.updateStreakDisplay();
        } else {
            alert('Incorrect security code. Please check your notifications at the top of your screen.');
        }
    }
};

// Bind app globally to resolve scope issues with dynamic onclick inline handlers
window.app = app;

// Start the app on DOM Load
window.addEventListener('DOMContentLoaded', () => app.init());
