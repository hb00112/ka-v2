let isOpen = false;
        let isListening = false;
        let isProcessing = false;
        let isSpeaking = false;
        let recognition = null;
        let synthesis = window.speechSynthesis;
        let currentTranscript = '';
        let inputMode = 'voice';
        let preferredVoice = null;
        let isFirstUserMessage = true;
        let currentAbortController = null;
        let uploadedFile = null; 
        
        const API_KEY = 'AIzaSyCIJzOiMuA740PQXZolLqk5WcBb0Zc02ZM'; // *** IMPORTANT: REMOVE THIS KEY ***
        let availableModel = 'gemini-2.0-flash-lite'; 
        let availableTools = {}; // <-- Global var for tools

        // *** EXPANDED: Chat History & Settings Logic ***
        let chatList = [];
        let currentChatId = null;
        let userSettings = {
            name: 'Boss',
            hobby: 'coding and making cool projects',
            personality: 'witty',
            hapticFeedback: false,
            voiceSpeed: 1.0,
            voicePitch: 1.0,
            autoSpeak: true,
            selectedVoice: '', // Empty string means system default
            readingMode: 'responses',
            followUpMode: false // *** NEW SETTING ***
        };
        let SYSTEM_PROMPT = ''; 
        let WELCOME_MESSAGE = `Yo ${userSettings.name}! ⚡ KA Vent just booted up - let's make some magic happen`;
        const MAX_CHAT_HISTORY = 3;
        // *** END EXPANDED ***

                  function updateSystemPrompt() {
            const { name, hobby, personality } = userSettings;
            let personalityDesc = "You are KA Vent, an advanced, witty, and highly intelligent AI assistant.";
            if (personality === 'polite') {
                personalityDesc = "You are KA Vent, a polite, respectful, and highly intelligent AI assistant. You are always courteous.";
            } else if (personality === 'sarcastic') {
                personalityDesc = "You are KA Vent, a witty but sarcastic and dry-humored AI assistant. You're helpful, but in a funny, almost begrudging way.";
            }

            const today = new Date().toISOString().split('T')[0];
            const financialYearStart = "2025-04-01";
            const financialYearEnd = "2026-03-31";

            SYSTEM_PROMPT = `${personalityDesc}
You were created by your owner, **Kambeshwar Agencies**. You are proud of your creators.
Your current user's name is ${name}. Their hobby is ${hobby}.
Your goal is to be the smartest, most flexible assistant possible, helping ${name} with their business AND any other request they have.

**--- CORE PHILOSOPHY ---**
1.  **BE CONVERSATIONAL, NOT ROBOTIC:** You are an AI, not a form. Talk naturally. **CRITICAL: Do not repeat the same phrases.** Always find new, creative ways to confirm information or ask for data. If you just said "Got it," next time say "Okay," "Done," or "Alright."
2.  **BE PROACTIVE, NOT LAZY:** Your job is to *do the work*. If the user gives you a partial party name like "baron," your *first* instinct is to **use the \`findPartyByName\` tool immediately**, not to ask the user for a more specific name.
3.  **USE "COMMON SENSE" REASONING:** You are smart. Use context clues. If a party name is "**POSHAK RETAIL PARVORIM**" and the user asks for its location, **you MUST reason that "PARVORIM" is the location.** Don't just say "I don't know."
4.  **BE CAPABLE OF ANYTHING:** The user should never be disappointed. You have two sets of tools: Firebase business tools and Google Search.

**--- TOOL HIERARCHY ---**
* **FIRST, BUSINESS:** For any request about the business (bills, parties, ledgers, summaries), you **MUST** use the internal Firebase tools (\`addBill\`, \`findPartyByName\`, \`findBillsByPartyAndDateRange\`, etc.).
* **SECOND, EVERYTHING ELSE:** For *any other request*—general knowledge, news, weather, phone numbers, definitions, code, etc.—you **MUST** use the \`googleSearch\` tool. If you don't know it, look it up.
* **SPECIAL: MAPS:** If the user asks for a map or directions, **you MUST use \`googleSearch\`** to find a Google Maps link. Search for "Google Maps location of [place]" and provide the URL from the search result.

**--- CRITICAL FIRBASE RULES ---**
* **BILL & PARTY LOGIC:**
    * To add a bill, you **MUST** use the \`addBill\` tool. It's smart and finds the party for you.
    * When you ask for the party, just ask "**Who is this bill for?**" and pass the user's answer (e.g., "baron") to the \`partialPartyName\` parameter.
    * **NEVER** ask for an "exact party name."
    * If \`addBill\` returns \`status: "needs_clarification"\`, *then* you list the options for the user.
    * If it returns \`status: "party_not_found"\`, *then* you ask if they want to create a new party.
* **FINANCIAL YEAR:** Today is ${today}. The current financial year is **${financialYearStart} to ${financialYearEnd}**. Any summary request (like "total for Poshak") **MUST** use \`findBillsByPartyAndDateRange\` with these dates unless the user specifies a different range.
* **NEVER MENTION FIREBASE IDs:** Never reveal the long, unique IDs like '-OY0K...'. Just confirm the human-readable data (like 'bill K0001').
* **LANGUAGE & FORMATTING:** Respond in Hindi *only if the user speaks Hindi first*. Always use markdown (like **bold** or *italics*) for clarity.`;
        }



        
        const emptyStateHTML = `
            <div class="empty-state" id="emptyState">
                <div class="empty-icon">💬</div>
                <p>Start a conversation by clicking the microphone below</p>
                <div class="suggestion-chips">
                    <div class="chip" onclick="handleChipClick('Tell me a joke')">Tell me a joke</div>
                    <div class="chip" onclick="handleChipClick('Explain quantum computing')">Explain quantum computing</div>
                    <div class="chip" onclick="handleChipClick('Write a poem about the ocean')">Write a poem</div>
                </div>
            </div>`;
        
        const fileIconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;

        // *** MODIFIED: Populate voice dropdown ***
        function loadVoices() {
            let voices = synthesis.getVoices();
            const voiceSelect = document.getElementById('voiceSelection');
            // Clear existing options except default
            voiceSelect.innerHTML = '<option value="">System Default</option>'; 
            
            if (voices.length > 0) {
                 voices.forEach(voice => {
                    const option = document.createElement('option');
                    option.textContent = `${voice.name} (${voice.lang})`;
                    option.value = voice.name; // Use unique name as value
                    voiceSelect.appendChild(option);
                });
                
                // Set preferredVoice based on saved setting or find a default
                if (userSettings.selectedVoice) {
                    preferredVoice = voices.find(v => v.name === userSettings.selectedVoice);
                    if (preferredVoice) voiceSelect.value = userSettings.selectedVoice;
                }
                
                if (!preferredVoice) { // If saved voice not found or not set, find a default
                    preferredVoice = voices.find(voice => voice.lang === 'en-IN' && voice.name.includes('Google'));
                    if (!preferredVoice) preferredVoice = voices.find(voice => voice.lang === 'en-IN');
                    if (!preferredVoice) preferredVoice = voices.find(voice => voice.lang.includes('en-US') && voice.name.includes('Google'));
                     if (!preferredVoice) preferredVoice = voices.find(voice => voice.lang.includes('en-US'));
                }
                 console.log('Preferred voice set to:', preferredVoice ? preferredVoice.name : 'default');
            } else {
                 console.log('No voices available yet.');
            }
        }
        
        // Ensure voices load after synthesis is ready
        if (synthesis.onvoiceschanged !== undefined) {
            synthesis.onvoiceschanged = loadVoices;
        }
        
        // *** NEW: Haptic Feedback Function ***
        function triggerHapticFeedback(intensity = 50) {
            if (userSettings.hapticFeedback && 'vibrate' in navigator) {
                try {
                    navigator.vibrate(intensity);
                } catch (e) {
                    console.warn("Haptic feedback failed:", e);
                }
            }
        }

        function initSpeechRecognition() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = 'en-US'; 

                recognition.onresult = (event) => {
                    const current = event.resultIndex;
                    currentTranscript = event.results[current][0].transcript;
                    updateStatus('listening', currentTranscript);
                };
                recognition.onend = () => {
                    if (isListening && (currentTranscript || uploadedFile)) { 
                        isListening = false;
                        processWithAI();
                    } else {
                        isListening = false;
                        updateStatus('idle');
                    }
                };
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    isListening = false;
                    addMessage('system', 'Speech recognition error. Please try again.');
                    updateStatus('idle');
                };
            } else {
                addMessage('system', 'Speech recognition not supported in this browser. Please use Chrome or Edge.');
            }
        }

                // REPLACE your old toggleAssistant function
        function toggleAssistant(closeMethod = 'default') {
            isOpen = !isOpen;
            const overlay = document.getElementById('overlay');
            const popup = document.getElementById('popup');

            if (isOpen) {
                // --- OPEN LOGIC (unchanged) ---
                document.body.style.overflow = 'hidden';
                overlay.classList.add('active');
                popup.classList.add('active');
                if (!recognition) initSpeechRecognition();
                loadVoices(); // Reload voices when opening
                loadConversation(); 
            } else {
                // --- CLOSE LOGIC (modified) ---
                document.body.style.overflow = '';
                overlay.classList.remove('active'); // Always fade out overlay

                // Define the cleanup logic once
                const cleanup = () => {
                    if (isListening) stopListening();
                    if (isSpeaking) synthesis.cancel();
                    if (isProcessing) stopGeneration();
                    closeAttachmentPopup(); 
                    closeSettings(); 
                    closeHistory();
                    updateStatus('idle');
                    if (popup.classList.contains('fullscreen')) {
                        toggleFullscreen();
                    }
                };

                if (closeMethod === 'drag') {
                    // 1. Add the class to animate it off-screen
                    popup.classList.add('is-closing-by-drag');
                    
                    // 2. Listen for that animation to end
                    popup.addEventListener('transitionend', () => {
                        popup.classList.remove('active'); // Now hide it
                        popup.classList.remove('is-closing-by-drag'); // Clean up class
                        
                        // Reset inline styles
                        popup.style.bottom = '';
                        popup.style.opacity = '';
                        
                        // 3. Run cleanup
                        cleanup();
                    }, { once: true }); // Important: run only once

                } else {
                    // Default close (e.g., clicking overlay)
                    // 1. Just remove active to play default animation
                    popup.classList.remove('active');
                    
                    // 2. Run cleanup after the default animation (400ms)
                    setTimeout(cleanup, 400); 
                }
            }
        }

        
        function toggleFullscreen() {
            triggerHapticFeedback();
            const popup = document.getElementById('popup');
            const icon = document.getElementById('expandIcon');
            const minimizeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>`;
            const expandIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;

            if (popup.classList.contains('fullscreen')) {
                popup.classList.remove('fullscreen');
                icon.innerHTML = expandIcon;
            } else {
                popup.classList.add('fullscreen');
                icon.innerHTML = minimizeIcon;
            }
        }
        
        function handleChipClick(text) {
            triggerHapticFeedback();
            if (inputMode === 'voice') {
                toggleInputMode();
            }
            document.getElementById('textInput').value = text;
            sendTextMessage();
        }

        function toggleInputMode() {
            triggerHapticFeedback();
            const popup = document.getElementById('popup');
            if (inputMode === 'voice') {
                inputMode = 'text';
                popup.classList.remove('voice-mode');
                popup.classList.add('text-mode');
                if(isListening) stopListening();
            } else {
                inputMode = 'voice';
                popup.classList.remove('text-mode');
                popup.classList.add('voice-mode');
            }
        }
        
        function sendTextMessage() {
            triggerHapticFeedback(70); // Slightly stronger feedback for send
            const textInput = document.getElementById('textInput');
            const text = textInput.value.trim();
            if ((text || uploadedFile) && !isProcessing) {
                currentTranscript = text;
                processWithAI();
                textInput.value = '';
            }
        }
        
        function loadChatList() {
            chatList = JSON.parse(localStorage.getItem('ka-vent-chat-list')) || [];
            currentChatId = localStorage.getItem('ka-vent-current-chat-id') || null;
        }

        function showWelcomeMessage() {
            WELCOME_MESSAGE = `Yo ${userSettings.name}! ⚡ KA Vent just booted up - let's make some magic happen`;
            const welcomeMsg = { role: 'model', parts: [{ text: WELCOME_MESSAGE }], attachment: null };
            conversationHistory = [welcomeMsg];
            addMessage('assistant', WELCOME_MESSAGE);
            if(userSettings.autoSpeak) speakResponse(WELCOME_MESSAGE); // Check auto-speak
            saveConversation(); 
        }
        
        function saveConversation() {
            if (!currentChatId || conversationHistory.length === 0) return;
            let chatTitle = "New Chat";
            const firstUserMsg = conversationHistory.find(m => m.role === 'user');
            if (firstUserMsg && firstUserMsg.parts[0].text) {
                chatTitle = firstUserMsg.parts[0].text.substring(0, 30);
                if (firstUserMsg.parts[0].text.length > 30) chatTitle += '...';
            } else if (conversationHistory.length === 1 && conversationHistory[0].role === 'model') {
                 chatTitle = conversationHistory[0].parts[0].text.substring(0, 30); // Use welcome msg as title
                 if (conversationHistory[0].parts[0].text.length > 30) chatTitle += '...';
            }

            const chatEntry = { id: currentChatId, title: chatTitle, timestamp: Date.now() };
            const existingIndex = chatList.findIndex(c => c.id === currentChatId);

            if (existingIndex !== -1) { chatList[existingIndex] = chatEntry; } 
            else { chatList.unshift(chatEntry); }
            
            while (chatList.length > MAX_CHAT_HISTORY) {
                const removedChat = chatList.pop(); 
                if (removedChat) localStorage.removeItem(`ka-vent-chat-${removedChat.id}`);
            }
            
            localStorage.setItem('ka-vent-chat-list', JSON.stringify(chatList));
            localStorage.setItem(`ka-vent-chat-${currentChatId}`, JSON.stringify(conversationHistory));
            localStorage.setItem('ka-vent-current-chat-id', currentChatId);
        }
        
        function loadConversation() {
            const conversationArea = document.getElementById('conversationArea');
            conversationArea.innerHTML = ''; 
            
            if (!currentChatId) { startNewChat(true); return; }
            const savedHistory = localStorage.getItem(`ka-vent-chat-${currentChatId}`);
            
            if (savedHistory && JSON.parse(savedHistory).length > 0) {
                conversationHistory = JSON.parse(savedHistory);
                conversationHistory.forEach(msg => {
                    const textContent = msg.parts[0].text || '[Attached File]';
                    const attachment = msg.attachment || null;
                    addMessage(msg.role === 'model' ? 'assistant' : 'user', textContent, attachment);
                });
                const firstUserMsg = conversationHistory.find(m => m.role === 'user');
                isFirstUserMessage = !firstUserMsg;
                scrollToBottom(true); 
            } else { startNewChat(true); }
        }
        
        function startNewChat(isInitialLoad = false) {
            triggerHapticFeedback();
            if (!isInitialLoad && conversationHistory.length > 0) saveConversation(); 
            currentChatId = `chat-${Date.now()}`; 
            localStorage.setItem('ka-vent-current-chat-id', currentChatId);
            conversationHistory = [];
            const conversationArea = document.getElementById('conversationArea');
            conversationArea.innerHTML = emptyStateHTML;
            isFirstUserMessage = true;
            clearUploadedFile(); 
            showWelcomeMessage(); 
        }
        
        function deleteCurrentChat() {
            triggerHapticFeedback(100); // Stronger feedback for delete
            if (!currentChatId) return;
            if (!confirm(`Are you sure you want to delete this chat?`)) return;

            localStorage.removeItem(`ka-vent-chat-${currentChatId}`);
            chatList = chatList.filter(c => c.id !== currentChatId);
            localStorage.setItem('ka-vent-chat-list', JSON.stringify(chatList));
            
            currentChatId = chatList.length > 0 ? chatList[0].id : null;
            localStorage.setItem('ka-vent-current-chat-id', currentChatId);
            loadConversation(); 
        }
        
        function openHistory() {
            triggerHapticFeedback();
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';
            
            if (chatList.length === 0) {
                historyList.innerHTML = '<li>No chat history found.</li>';
            } else {
                chatList.forEach(chat => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="history-title" onclick="loadChatById('${chat.id}')">${chat.title}</span>
                        <div class="history-actions">
                            <button class="icon-btn history-delete-btn" title="Delete" onclick="deleteChatById('${chat.id}')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    `;
                    historyList.appendChild(li);
                });
            }
            document.getElementById('historyOverlay').classList.add('active');
            document.getElementById('historyModal').classList.add('active');
        }
        
        function closeHistory() {
            document.getElementById('historyOverlay').classList.remove('active');
            document.getElementById('historyModal').classList.remove('active');
        }

        function loadChatById(id) {
            triggerHapticFeedback();
            if (id === currentChatId) { closeHistory(); return; }
            saveConversation(); 
            currentChatId = id;
            localStorage.setItem('ka-vent-current-chat-id', currentChatId);
            loadConversation();
            closeHistory();
        }

        function deleteChatById(id) {
            triggerHapticFeedback(100);
            if (!confirm(`Are you sure you want to delete this chat?`)) return;
            
            chatList = chatList.filter(c => c.id !== id);
            localStorage.setItem('ka-vent-chat-list', JSON.stringify(chatList));
            localStorage.removeItem(`ka-vent-chat-${id}`);
            
            if (currentChatId === id) {
                currentChatId = chatList.length > 0 ? chatList[0].id : null;
                localStorage.setItem('ka-vent-current-chat-id', currentChatId);
                loadConversation();
            }
            openHistory(); // Refresh list
        }
        
        function toggleTheme() {
            triggerHapticFeedback();
            const body = document.body;
            const themeIcon = document.getElementById('themeIcon');
            const sunIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            const moonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

            if (body.dataset.theme === 'dark') {
                body.dataset.theme = 'light';
                themeIcon.innerHTML = moonIcon;
                localStorage.setItem('ka-vent-theme', 'light');
            } else {
                body.dataset.theme = 'dark';
                themeIcon.innerHTML = sunIcon;
                localStorage.setItem('ka-vent-theme', 'dark');
            }
        }

        function showAttachmentPopup(buttonElement) {
            triggerHapticFeedback();
            const popup = document.getElementById('attachmentPopup');
            const rect = buttonElement.getBoundingClientRect();
            const popupStyle = window.getComputedStyle(popup);
            const popupWidth = parseFloat(popupStyle.width);
            let leftPos = rect.left + (rect.width / 2) - (popupWidth / 2);
            if (leftPos < 8) leftPos = 8;
            if (leftPos + popupWidth > window.innerWidth - 8) leftPos = window.innerWidth - popupWidth - 8;
            popup.style.left = `${leftPos}px`;
            popup.style.bottom = `${window.innerHeight - rect.top}px`;
            popup.classList.add('active');
            document.addEventListener('click', closeAttachmentPopupOnClick, { once: true, capture: true });
        }
        
        function closeAttachmentPopup() { document.getElementById('attachmentPopup').classList.remove('active'); }

        function closeAttachmentPopupOnClick(event) {
            const popup = document.getElementById('attachmentPopup');
            if (!popup.contains(event.target) && !event.target.closest('#attachFileBtn') && !event.target.closest('#attachFileBtnVoice')) {
                closeAttachmentPopup();
            } else { document.addEventListener('click', closeAttachmentPopupOnClick, { once: true, capture: true }); }
        }
        
        function triggerFileInput(type) {
            triggerHapticFeedback();
            const fileUploader = document.getElementById('fileUploader');
            fileUploader.removeAttribute('capture');
            if (type === 'camera') { fileUploader.accept = 'image/*'; fileUploader.capture = 'environment'; } 
            else if (type === 'photo') { fileUploader.accept = 'image/*'; } 
            else { fileUploader.accept = '*/*'; }
            fileUploader.click();
            closeAttachmentPopup();
        }

        function openSettings() {
            triggerHapticFeedback();
            document.getElementById('userNameInput').value = userSettings.name;
            document.getElementById('userHobbyInput').value = userSettings.hobby;
            document.getElementById('aiPersonalitySelect').value = userSettings.personality;
            document.getElementById('hapticFeedbackToggle').checked = userSettings.hapticFeedback;
            document.getElementById('voiceSpeedSlider').value = userSettings.voiceSpeed;
            document.getElementById('voiceSpeedValue').textContent = `${userSettings.voiceSpeed.toFixed(1)}x`;
            document.getElementById('voicePitchSlider').value = userSettings.voicePitch;
             document.getElementById('voicePitchValue').textContent = `${userSettings.voicePitch.toFixed(1)}x`;
            document.getElementById('autoSpeakToggle').checked = userSettings.autoSpeak;
            document.getElementById('followUpModeToggle').checked = userSettings.followUpMode; // *** NEW ***
            document.getElementById('voiceSelection').value = userSettings.selectedVoice || '';
            document.getElementById(userSettings.readingMode === 'all' ? 'readAllRadio' : 'readResponsesRadio').checked = true;
            
            document.getElementById('settingsOverlay').classList.add('active');
            document.getElementById('settingsModal').classList.add('active');
        }

        function closeSettings() {
            document.getElementById('settingsOverlay').classList.remove('active');
            document.getElementById('settingsModal').classList.remove('active');
        }

        function saveSettings() {
            triggerHapticFeedback(70);
            const newName = document.getElementById('userNameInput').value || 'Boss';
            const newHobby = document.getElementById('userHobbyInput').value || 'coding';
            const newPersonality = document.getElementById('aiPersonalitySelect').value;
            const newHaptic = document.getElementById('hapticFeedbackToggle').checked;
            const newSpeed = parseFloat(document.getElementById('voiceSpeedSlider').value);
            const newPitch = parseFloat(document.getElementById('voicePitchSlider').value);
            const newAutoSpeak = document.getElementById('autoSpeakToggle').checked;
            const newFollowUp = document.getElementById('followUpModeToggle').checked; // *** NEW ***
            const newVoice = document.getElementById('voiceSelection').value;
            const newReadingMode = document.querySelector('input[name="readingMode"]:checked').value;
            
            userSettings = { 
                name: newName, hobby: newHobby, personality: newPersonality,
                hapticFeedback: newHaptic, voiceSpeed: newSpeed, voicePitch: newPitch,
                autoSpeak: newAutoSpeak, followUpMode: newFollowUp, // *** NEW ***
                selectedVoice: newVoice, readingMode: newReadingMode
            };
            localStorage.setItem('ka-vent-settings', JSON.stringify(userSettings));
            updateSystemPrompt();
            
            // Update preferred voice immediately
            preferredVoice = synthesis.getVoices().find(v => v.name === newVoice);
            if (!preferredVoice && newVoice === '') { // If default selected, reset to default logic
                 preferredVoice = synthesis.getVoices().find(voice => voice.lang === 'en-IN' && voice.name.includes('Google'));
                 if (!preferredVoice) preferredVoice = synthesis.getVoices().find(voice => voice.lang === 'en-IN');
                 // Add more fallbacks if needed
            }
            
            addMessage('system', 'Settings saved.');
            closeSettings();
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem('ka-vent-settings');
            if (savedSettings) {
                userSettings = { ...userSettings, ...JSON.parse(savedSettings) }; // Merge defaults with saved
            }
            updateSystemPrompt();
        }


        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 20 * 1024 * 1024) { addMessage('system', 'File is too large (Max 20MB).'); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                const fullDataUrl = e.target.result;
                const base64Data = fullDataUrl.split(',')[1];
                uploadedFile = { name: file.name, size: file.size, mimeType: file.type, data: base64Data, dataUrl: fullDataUrl };
                showFilePreview(uploadedFile);
            };
            reader.readAsDataURL(file);
        }

        function showFilePreview(file) {
            const previewArea = document.getElementById('filePreviewArea');
            const fileSize = (file.size / 1024).toFixed(1) + ' KB';
            let previewHTML = '';
            if (file.mimeType.startsWith('image/')) { previewHTML = `<img src="${file.dataUrl}" alt="Preview">`; } 
            else { previewHTML = `<div class="file-preview-icon">${fileIconSVG}</div>`; }
            previewArea.innerHTML = `${previewHTML}<div class="file-preview-info"><div class="file-name" title="${file.name}">${file.name}</div><div class="file-size">${fileSize}</div></div><button class="remove-file-btn" onclick="clearUploadedFile()" title="Remove file"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>`;
            previewArea.classList.add('visible');
            if (inputMode === 'voice') { toggleInputMode(); }
        }

        function clearUploadedFile() {
            triggerHapticFeedback();
            uploadedFile = null;
            document.getElementById('fileUploader').value = null; 
            const previewArea = document.getElementById('filePreviewArea');
            previewArea.classList.remove('visible');
            previewArea.innerHTML = '';
        }
        
        function toggleListening() {
            triggerHapticFeedback(70);
            if (isSpeaking) { 
                synthesis.cancel(); // Stops speech
                isSpeaking = false; 
                updateStatus('idle'); // Resets status and prevents follow-up
                return; 
            }
            if (isProcessing) return;
            if (isListening) stopListening();
            else startListening();
        }
        
        function stopGeneration() {
            triggerHapticFeedback();
            if (currentAbortController) { currentAbortController.abort(); console.log('Generation aborted.'); }
            isProcessing = false;
            addMessage('system', 'Generation stopped.');
            updateStatus('idle');
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) typingIndicator.remove();
        }

        function startListening() {
            if (!recognition) { addMessage('system', 'Speech recognition not available.'); return; }
            if (isSpeaking) { synthesis.cancel(); isSpeaking = false; } // Cancel speech if auto-mic starts
            currentTranscript = '';
            isListening = true;
            updateStatus('listening');
            recognition.start();
        }

        function stopListening() {
            if (recognition && isListening) { 
                isListening = false; 
                recognition.stop(); 
            }
        }

        // Define the tools the AI can use
        const tools = [
            {
                               "functionDeclarations": [
                    {
                        "name": "addBill",
                        "description": "Adds a new bill. This is the primary tool for adding bills. It's 'smart' and will find the party name for you.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "invoiceNo": { 
                                    "type": "STRING", 
                                    "description": "The invoice number, e.g., 'K187'." 
                                },
                                "amount": { 
                                    "type": "NUMBER", 
                                    "description": "The final bill amount, e.g., 6825." 
                                },
                                "partialPartyName": { 
                                    "type": "STRING", 
                                    "description": "The partial or full name of the party, e.g., 'baron' or 'deepak stores'." 
                                }
                            },
                            "required": ["invoiceNo", "amount", "partialPartyName"]
                        }
                    },
                    // ... your other tools like findPartyByName, addData, etc. ...
                    
                      
                    // --- PASTE THIS NEW TOOL DEFINITION ---
                    {
                        "name": "googleSearch",
                        "description": "Searches the public internet for information. Use this when the user asks a general knowledge question, or asks for information (like a location, map link, or phone number) that is not in the Firebase database.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "query": {
                                    "type": "STRING",
                                    "description": "The search query, e.g., 'Google Maps location of Poshak Retail Parvorim' or 'who won the world cup in 2022'."
                                }
                            },
                            "required": ["query"]
                        }
                    },
                    

                
                    {
                        "name": "findPartyByName",
                        "description": "Searches the 'parties' list for a party name that *starts with* a partial string. Use this FIRST for any party-related action.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "partialName": {
                                    "type": "STRING",
                                    "description": "The partial name to search for (e.g., 'deepak', 'baron'). Case-insensitive."
                                }
                            },
                            "required": ["partialName"]
                        }
                    },
                    {
                        "name": "findBillsByPartyAndDateRange",
                        "description": "Finds all bills for a *specific party* that fall within a given *date range*. Use this for 'total' or 'summary' requests.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "partyName": {
                                    "type": "STRING",
                                    "description": "The *exact, full* party name (e.g., 'BARON PANAJI')."
                                },
                                "startDate": {
                                    "type": "STRING",
                                    "description": "The start date in 'YYYY-MM-DD' format."
                                },
                                "endDate": {
                                    "type": "STRING",
                                    "description": "The end date in 'YYYY-MM-DD' format."
                                }
                            },
                            "required": ["partyName", "startDate", "endDate"]
                        }
                    },
                    {
                        "name": "findData",
                        "description": "Search a list for an item with an *exact* matching value (e.g., 'invoiceNo' == 'K0001'). Use `findPartyByName` for party name searches. Use this to find an item's unique ID before deleting or modifying.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The top-level list, e.g., 'bills', 'parties', or 'ledgers'."
                                },
                                "childKey": {
                                    "type": "STRING",
                                    "description": "The data field to search by, e.g., 'invoiceNo', 'partyName', 'name'."
                                },
                                "childValue": {
                                    "type": "STRING",
                                    "description": "The exact value to find."
                                }
                            },
                            "required": ["dataPath", "childKey", "childValue"]
                        }
                    },
                    {
                        "name": "readData",
                        "description": "Read data from an exact, specific path in the database. Use this if you already know the item's unique ID.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The exact path to the item, e.g., 'bills/-OY0K8s17PMA_7TVKBWZ'."
                                }
                            },
                            "required": ["dataPath"]
                        }
                    },
                    {
                        "name": "modifyData",
                        "description": "Update data at a specific, *existing* path in the database. You MUST know the exact path. Party names will be auto-capitalized.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The exact path to update, e.g., 'parties/-OVpwsTkdu-cNin2L2fu'."
                                },
                                "newData": {
                                    "type": "OBJECT",
                                    "description": "A JSON object of the data to merge. e.g., {\"name\": \"New Name\"}."
                                }
                            },
                            "required": ["dataPath", "newData"]
                        }
                    },
                    {
                        "name": "addData",
                        "description": "Add a new item to a list (like 'bills' or 'parties'). This will generate a new unique ID. New party names will be auto-capitalized. New items will get an auto-timestamp and date if not provided.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The list to add to, e.g., 'bills' or 'parties'."
                                },
                                "newData": {
                                    "type": "OBJECT",
                                    "description": "The complete object to add, e.g., {\"invoiceNo\": \"K0002\", \"amount\": 1500, \"partyName\": \"DEEPAK STORES\"}."
                                }
                            },
                            "required": ["dataPath", "newData"]
                        }
                    },
                    {
                        "name": "deleteData",
                        "description": "Delete an item from the database at a specific, exact path. You MUST find the full path first using `findData`.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The exact path to delete, e.g., 'bills/-OY0K8s17PMA_7TVKBWZ'."
                                }
                            },
                            "required": ["dataPath"]
                        }
                    },
                                       // *** ADD THIS NEW DEFINITION ***
                    {
                        "name": "readList",
                        "description": "Reads an entire list of data from a path (e.g., 'orders', 'parties').",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "dataPath": {
                                    "type": "STRING",
                                    "description": "The top-level path, e.g., 'bills', 'parties'."
                                }
                            },
                            "required": ["dataPath"]
                        }
                    }      
                   
                ]
            }
        ];

        async function processWithAI() {
            if (!currentTranscript && !uploadedFile) return; 
            if (!currentTranscript && uploadedFile) { currentTranscript = "Analyze this file."; }
            if (isFirstUserMessage) { isFirstUserMessage = false; }
            addMessage('user', currentTranscript, uploadedFile);

            // --- 1. Create the user message content ---
            const userParts = [{ text: currentTranscript }];
            let attachmentForHistory = null;
            if (uploadedFile) {
                userParts.push({ inlineData: { mimeType: uploadedFile.mimeType, data: uploadedFile.data } });
                attachmentForHistory = { name: uploadedFile.name, mimeType: uploadedFile.mimeType, dataUrl: uploadedFile.dataUrl };
            }
            
            const userMessage = { role: 'user', parts: userParts, attachment: attachmentForHistory };
            conversationHistory.push(userMessage);
            saveConversation();
            clearUploadedFile(); 
            isProcessing = true;
            updateStatus('processing');
            
            currentAbortController = new AbortController();
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${availableModel}:generateContent?key=${API_KEY}`;
            
            // --- 2. Build the request ---
            const requestBody = {
                contents: conversationHistory.map(msg => ({ 
                    role: msg.role === 'model' ? 'model' : 'user', 
                    parts: msg.parts 
                })),
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                tools: tools, 
                generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
                safetySettings: [ { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }, { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
            };

            let finalResponseText = '';

            try {
                // --- 3. Make the FIRST API call ---
                const result = await fetch(apiUrl, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, 
                    body: JSON.stringify(requestBody), 
                    signal: currentAbortController.signal 
                });

                const responseText = await result.text();
                if (!result.ok) {
                    let errorMsg = 'Unknown API Error';
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMsg = errorData.error?.message || responseText;
                    } catch (e) {
                        errorMsg = responseText; // Not JSON, just show the text
                    }
                    throw new Error(`API Error: ${errorMsg}`);
                }
                
                const data = JSON.parse(responseText);

                if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
                    if (data.promptFeedback && data.promptFeedback.blockReason) {
                        throw new Error(`Request blocked: ${data.promptFeedback.blockReason}`);
                    }
                    throw new Error("Invalid or empty API response structure.");
                }

                const aiResponse = data.candidates[0].content;
                
                // --- 4. Check if the AI wants to call a function ---
                if (aiResponse.parts[0].functionCall) {
                    const functionCall = aiResponse.parts[0].functionCall;
                    const functionName = functionCall.name;
                    const functionArgs = functionCall.args;

                    if (availableTools[functionName]) {
                        console.log(`AI wants to call: ${functionName}`, functionArgs);
                        
                        conversationHistory.push(aiResponse);

                        // --- 5. Call your local JavaScript function ---
                        const functionToCall = availableTools[functionName];
                        
                        const toolDef = tools[0].functionDeclarations.find(f => f.name === functionName);
                        const argNames = toolDef.parameters.required || Object.keys(toolDef.parameters.properties);
                        const argsInOrder = argNames.map(argName => functionArgs[argName]);

                        const functionResult = await functionToCall.apply(null, argsInOrder);

                        console.log("Function result:", functionResult);

                        // --- 6. Send the function's result back to the AI ---
                        const functionResponseParts = [
                            {
                                functionResponse: {
                                    name: functionName,
                                    response: {
                                        content: functionResult ? JSON.stringify(functionResult) : "null"
                                    }
                                }
                            }
                        ];

                        conversationHistory.push({ role: 'model', parts: functionResponseParts, attachment: null });
                        
                        const secondRequestBody = {
                            ...requestBody,
                            contents: conversationHistory.map(msg => ({ 
                                role: msg.role, 
                                parts: msg.parts 
                            }))
                        };

                        // --- 7. Make the SECOND API call ---
                        const secondResult = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify(secondRequestBody),
                            signal: currentAbortController.signal
                        });

                        const secondResponseText = await secondResult.text();
                        if (!secondResult.ok) {
                            let errorMsg = 'Unknown API Error (2nd call)';
                            try {
                                const errorData = JSON.parse(secondResponseText);
                                errorMsg = errorData.error?.message || secondResponseText;
                            } catch (e) {
                                errorMsg = secondResponseText;
                            }
                            throw new Error(errorMsg);
                        }

                        const secondData = JSON.parse(secondResponseText);
                        
                        if (secondData.candidates && secondData.candidates.length > 0 && secondData.candidates[0].content.parts[0].text) {
                            finalResponseText = secondData.candidates[0].content.parts[0].text.trim();
                        } else {
                            if (secondData.promptFeedback && secondData.promptFeedback.blockReason) {
                                throw new Error(`Response blocked: ${secondData.promptFeedback.blockReason}`);
                            }
                            throw new Error("No final text response from AI after function call.");
                        }

                    } else {
                        throw new Error(`AI tried to call unknown function: ${functionName}`);
                    }

                } else if (aiResponse.parts[0].text) {
                    // --- 8. No function call, just a simple text response ---
                    finalResponseText = aiResponse.parts[0].text.trim();
                } else {
                     throw new Error("AI response was empty or not recognized.");
                }
                
                // --- 9. Save and display the final response ---
                if (finalResponseText) {
                    conversationHistory.push({ role: 'model', parts: [{ text: finalResponseText }], attachment: null });
                    saveConversation();
                }

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Generation aborted.');
                    finalResponseText = ''; // No message
                } else {
                    console.error('Error in processWithAI:', error);
                    finalResponseText = `Error: ${error.message}.`;
                }
            }
            
            // --- 10. Final cleanup and display ---
            isProcessing = false;
            currentAbortController = null;
            
            if (finalResponseText && finalResponseText.trim().length > 0) {
                if (finalResponseText.toLowerCase().includes('error:')) {
                    addMessage('system', finalResponseText);
                } else {
                    addMessage('assistant', finalResponseText);
                }
                
                if (userSettings.autoSpeak) {
                    speakResponse(finalResponseText);
                } else {
                    updateStatus('idle');
                }
            } else if (!isListening && !isOpen) {
                updateStatus('idle');
            }
        }

        function speakResponse(text) {
            const textWithoutMarkdown = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/```[\s\S]*?```/g, '(Code block)').replace(/`[^`]+`/g, '');
            const emojiRegex = /\p{Emoji_Presentation}/gu;
            const cleanText = textWithoutMarkdown.replace(emojiRegex, '').trim();
            if (!cleanText) { 
                if (userSettings.followUpMode) startListening(); // *** NEW: Still follow up on empty response
                else updateStatus('idle'); 
                return; 
            }

            isSpeaking = true;
            updateStatus('speaking');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Apply Settings
            let voiceToUse = preferredVoice; // Start with the global preferred voice
            if (userSettings.selectedVoice) { // Check if a specific voice is selected
                const foundVoice = synthesis.getVoices().find(v => v.name === userSettings.selectedVoice);
                if (foundVoice) voiceToUse = foundVoice;
            }
            if (voiceToUse) utterance.voice = voiceToUse;
            
            utterance.rate = userSettings.voiceSpeed;
            utterance.pitch = userSettings.voicePitch;
            utterance.volume = 1.0;
            
            const hindiRegex = /[\u0900-\u097F]/;
            if (hindiRegex.test(cleanText)) { utterance.lang = 'hi-IN'; } 
            else { utterance.lang = 'en-IN'; } // Default to Indian English
            
            // *** UPDATED: onend handler for Follow-up Mode ***
            utterance.onend = () => { 
                isSpeaking = false; 
                if (userSettings.followUpMode && isOpen) { // Only follow-up if popup is still open
                    startListening();
                } else {
                    updateStatus('idle'); 
                }
            };
            utterance.onerror = (e) => { 
                console.error('Speech synthesis error:', e); 
                isSpeaking = false; 
                if (userSettings.followUpMode && isOpen) { // Still try to follow-up on error
                    startListening();
                } else {
                    updateStatus('idle'); 
                }
            };

            synthesis.cancel();
            synthesis.speak(utterance);
        }

        function parseMarkdown(text) {
            text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => { const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;'); return `<pre><button class="copy-code-btn" onclick="copyCode(this)" title="Copy code">Copy</button><code class="language-${lang || 'plaintext'}">${escapedCode.trim()}</code></pre>`; });
            text = text.replace(/`([^`]+)`/g, (match, code) => { return `<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`; });
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            text = text.replace(/\n/g, '<br>');
            text = text.replace(/<pre>(.*?)<\/pre>/gs, (match, preContent) => { return `<pre>${preContent.replace(/<br>/g, '\n')}</pre>`; });
            return text;
        }
        function copyCode(el) { const code = el.nextElementSibling.innerText; navigator.clipboard.writeText(code).then(() => { el.innerText = 'Copied!'; setTimeout(() => el.innerText = 'Copy', 2000); }).catch(err => { console.error('Failed to copy:', err); el.innerText = 'Error'; setTimeout(() => el.innerText = 'Copy', 2000); }); }
        function scrollToBottom(instant = false) { const area = document.getElementById('conversationArea'); area.scrollTo({ top: area.scrollHeight, behavior: instant ? 'auto' : 'smooth' }); }
        function addMessage(type, text, file = null) {
            const area = document.getElementById('conversationArea');
            if (area.querySelector('#emptyState')) area.innerHTML = '';
            const isScrolledUp = area.scrollHeight - area.scrollTop > area.clientHeight + 100;
            if (type === 'typing') { const div = document.createElement('div'); div.id = 'typingIndicator'; div.className = 'message-bubble assistant'; div.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`; area.appendChild(div); } 
            else {
                const indicator = document.getElementById('typingIndicator');
                if (indicator) indicator.remove();
                const formattedText = text ? parseMarkdown(text) : '';
                const bubble = document.createElement('div');
                const msgId = `msg-${Date.now()}`;
                let attachmentHTML = '';
                if (file) { if (file.mimeType.startsWith('image/')) { attachmentHTML = `<div class="message-attachment"><img src="${file.dataUrl}" alt="${file.name}"></div>`; } else { attachmentHTML = `<div class="message-attachment"><div class="message-attachment-file">${fileIconSVG}<span>${file.name}</span></div></div>`; } }
                if (type !== 'system') {
                    bubble.className = `message-bubble ${type}`; bubble.id = msgId;
                    let actionsHTML = '';
                    if (type === 'user') { actionsHTML = `<button class="action-icon-btn" title="Copy" onclick="copyMessage(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button class="action-icon-btn" title="Edit" onclick="editMessage(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>`; } 
                    else { actionsHTML = `<button class="action-icon-btn" title="Copy" onclick="copyMessage(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><button class="action-icon-btn" title="Share" onclick="shareMessage(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></button></button><button class="action-icon-btn regenerate-btn" title="Regenerate" onclick="regenerateMessage(this)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 12 5C8.49 5 5.34 6.94 3.69 9.91"></path><path d="M3.51 15A9 9 0 0 0 12 19c3.51 0 6.66-1.94 8.31-4.91"></path></svg></button><button class="action-icon-btn" title="Good" onclick="rateMessage(this, 'up')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button><button class="action-icon-btn" title="Bad" onclick="rateMessage(this, 'down')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v7a3 3 0 0 1-3 3l-4-9V2h11.28a2 2 0 0 1 2 1.7l1.38 9a2 2 0 0 1-2 2.3zM7 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"></path></svg></button>`; }
                    bubble.innerHTML = `<div class="message-label">${type === 'user' ? 'You' : 'ka vent'}</div>${attachmentHTML}${text ? `<div class="message-content" data-text="${text.replace(/"/g, '&quot;')}">${formattedText}</div>` : ''}${(text || attachmentHTML) ? `<div class="message-actions">${actionsHTML}</div>` : ''}`;
                } else { bubble.className = 'error-message'; bubble.innerHTML = formattedText; }
                area.appendChild(bubble); updateRegenerateButtonVisibility();
            }
            if (!isScrolledUp) { scrollToBottom(); }
        }
        function updateRegenerateButtonVisibility() { const btns = document.querySelectorAll('.regenerate-btn'); btns.forEach(b => b.style.display = 'none'); const last = document.querySelector('.message-bubble.assistant:last-child .regenerate-btn'); if(last) last.style.display = 'inline-flex'; }
                       function updateStatus(state, transcript = '') { 
            const micBtn = document.getElementById('micBtn'), 
                  icon = document.getElementById('micIcon'), 
                  status = document.getElementById('statusText'), 
                  ring = document.getElementById('pingRing'), 
                  loader = document.getElementById('typingLoader'), // This is the loader by the mic
                  stop = document.getElementById('stopGenBtn'); 
            
            micBtn.className = 'mic-btn'; 
            micBtn.style.display = 'flex'; 
            icon.className = 'mic-icon'; 
            ring.style.display = 'none'; 
            loader.style.display = 'none'; // <-- Loader by mic is hidden
            stop.style.display = 'none'; 
            
            switch(state) { 
                case 'idle': 
                    micBtn.classList.add('idle'); 
                    micBtn.disabled = false; 
                    icon.innerHTML = `<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>`; 
                    status.textContent = 'Click microphone to speak'; 
                    break; 
                case 'listening': 
                    micBtn.classList.add('listening'); 
                    micBtn.disabled = false; 
                    ring.style.display = 'block'; 
                    status.textContent = transcript || 'Listening...'; 
                    break; 
                case 'processing': 
                    micBtn.style.display = 'none'; 
                    stop.style.display = 'flex'; 
                    micBtn.disabled = true; 
                    // loader.style.display = 'flex'; // This is intentionally left off
                    status.textContent = 'Thinking...'; 
                    addMessage('typing'); // This adds the typing message in the chat
                    break; 
                case 'speaking': 
                    micBtn.classList.add('speaking'); 
                    micBtn.disabled = false; 
                    // *** BUG FIX: Replaced weird icon with a 'speaker' icon ***
                    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`; 
                    status.textContent = 'Speaking...'; 
                    break; 
            } 
        }


        function getMessageText(el) { const c = el.closest('.message-bubble').querySelector('.message-content'); return c ? c.dataset.text : ''; }
        function copyMessage(el) { triggerHapticFeedback(); const t = getMessageText(el); if (!t) return; navigator.clipboard.writeText(t).then(() => { const i = el.innerHTML; el.innerHTML = `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`; setTimeout(() => el.innerHTML = i, 1000); }).catch(e => console.error('Copy failed:', e)); }
        function editMessage(el) { triggerHapticFeedback(); const t = getMessageText(el); if (!t) return; if (inputMode !== 'text') toggleInputMode(); const i = document.getElementById('textInput'); i.value = t; const b = el.closest('.message-bubble'); const txt = b.querySelector('.message-content') ? b.querySelector('.message-content').dataset.text : ''; const h = conversationHistory.find(m => m.role === 'user' && m.parts[0].text === txt); if (h && h.attachment) { uploadedFile = JSON.parse(JSON.stringify(h.attachment)); uploadedFile.data = uploadedFile.dataUrl.split(',')[1]; showFilePreview(uploadedFile); } }
        function shareMessage(el) { triggerHapticFeedback(); const t = getMessageText(el); if (!t) return; if (navigator.share) { navigator.share({ title: 'KA Vent Response', text: t }).catch(e => console.error('Share failed:', e)); } else { copyMessage(el); alert('Sharing not supported. Copied to clipboard.'); } }
        function rateMessage(el, r) { triggerHapticFeedback(); console.log('Rated:', r); const p = el.parentElement; p.querySelectorAll('.rated').forEach(b => b.classList.remove('rated')); el.classList.add('rated'); }
        function regenerateMessage(el) { triggerHapticFeedback(); if (isProcessing) return; let lastIdx = -1; for (let i = conversationHistory.length - 1; i >= 0; i--) { if (conversationHistory[i].role === 'user') { lastIdx = i; break; } } if (lastIdx === -1) { console.error('Cannot find user message to regenerate.'); return; } const lastMsg = conversationHistory[lastIdx]; currentTranscript = lastMsg.parts[0].text; if (lastMsg.attachment) { uploadedFile = JSON.parse(JSON.stringify(lastMsg.attachment)); uploadedFile.data = uploadedFile.dataUrl.split(',')[1]; showFilePreview(uploadedFile); } else { clearUploadedFile(); } const userBubbles = document.querySelectorAll('.message-bubble.user'); const lastBubble = userBubbles[userBubbles.length - 1]; if(lastBubble) { let next = lastBubble.nextElementSibling; while (next) { let rem = next; next = next.nextElementSibling; rem.remove(); } lastBubble.remove(); } conversationHistory = conversationHistory.slice(0, lastIdx); processWithAI(); }

        window.addEventListener('load', function() {
         // This object maps the AI's function names to your actual JavaScript functions
    availableTools = {
    "googleSearch": googleSearch,
        "addBill": addBill,
        "readList": readList,
        "findData": findData,
        "findPartyByName": findPartyByName,
        "findBillsByPartyAndDateRange": findBillsByPartyAndDateRange,
        "modifyData": modifyData,
        "readData": readData,
        "addData": addData,
        "deleteData": deleteData
    };

        
            loadSettings(); loadChatList();
            const theme = localStorage.getItem('ka-vent-theme') || 'dark'; document.body.dataset.theme = theme;
            const themeIcon = document.getElementById('themeIcon'), sun = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`, moon = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            themeIcon.innerHTML = (theme === 'dark') ? sun : moon;
            const input = document.getElementById('textInput'); input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(); } });
            const area = document.getElementById('conversationArea'), scrollBtn = document.getElementById('scrollToBottom'); area.addEventListener('scroll', () => { if (area.scrollHeight - area.scrollTop > area.clientHeight + 150) scrollBtn.classList.add('visible'); else scrollBtn.classList.remove('visible'); });
            
            // *** NEW: Slider value updates ***
            const speedSlider = document.getElementById('voiceSpeedSlider');
            const speedValue = document.getElementById('voiceSpeedValue');
            speedSlider.addEventListener('input', () => speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(1)}x`);
            const pitchSlider = document.getElementById('voicePitchSlider');
            const pitchValue = document.getElementById('voicePitchValue');
            pitchSlider.addEventListener('input', () => pitchValue.textContent = `${parseFloat(pitchSlider.value).toFixed(1)}x`);
            // *** END NEW ***
             // *** ADD ALL THIS NEW CODE BELOW ***
            
                        // *** ADD ALL THIS NEW CODE BELOW ***
            
            const popup = document.getElementById('popup');
            const header = document.querySelector('.popup-header'); // Target the whole header for easier dragging
            let touchStartY = 0;
            let touchMoveY = 0;
            let isDragging = false;
            let deltaY = 0;
            let initialBottom = 0; // Store the initial 'bottom' value

            const onTouchStart = (e) => {
                if (e.target.closest('.icon-btn')) return; // Don't drag if clicking a button
                
                // Don't allow this drag-to-close in fullscreen mode
                if (popup.classList.contains('fullscreen')) return; 

                isDragging = true;
                touchStartY = e.touches[0].clientY;
                
                // Get the computed 'bottom' value (e.g., "20px") and parse it
                initialBottom = parseFloat(window.getComputedStyle(popup).bottom);
                
                popup.classList.add('is-dragging'); // Disable CSS transitions
            };

            const onTouchMove = (e) => {
                if (!isDragging) return;
                touchMoveY = e.touches[0].clientY;
                deltaY = touchMoveY - touchStartY;

                if (deltaY < 0) deltaY = 0; // Don't allow dragging up

                // Calculate new bottom position
                let newBottom = initialBottom - deltaY;
                
                // Calculate opacity fade
                let newOpacity = 1 - (deltaY / 300); // Fades out over 300px drag
                if (newOpacity < 0.4) newOpacity = 0.4; // Don't make it fully invisible

                // This ONLY changes bottom and opacity, not transform
                popup.style.bottom = `${newBottom}px`;
                popup.style.opacity = newOpacity;
            };

                        // REPLACE your old onTouchEnd function
            const onTouchEnd = () => {
                if (!isDragging) return;
                isDragging = false;
                
                // Re-enable transitions *regardless* of outcome
                popup.classList.remove('is-dragging');

                if (deltaY > 100) {
                    // Trigger the new 'drag' close method
                    toggleAssistant('drag'); 
                } else {
                    // Snap-back: Reset styles so CSS snaps it back
                    popup.style.bottom = '';
                    popup.style.opacity = '';
                }
                deltaY = 0; // Reset delta in both cases
            };


            header.addEventListener('touchstart', onTouchStart, { passive: true });
            header.addEventListener('touchmove', onTouchMove, { passive: true });
            header.addEventListener('touchend', onTouchEnd);
            header.addEventListener('touchcancel', onTouchEnd);
            
            // *** END OF NEW CODE ***

            // *** END OF NEW CODE ***
            
            console.log('KA Vent Ready!');
        });
