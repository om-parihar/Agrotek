// ============================================
// Agrotek AI Chatbot - Farming Assistant
// ============================================

class AgroTechChatbot {
    constructor() {
        this.conversationHistory = [];
        this.context = {
            userInterests: [],
            currentTopic: null,
            previousQuestions: []
        };
        this.isTyping = false;
        this.isListening = false;
        this.voiceEnabled = true;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.init();
    }

    init() {
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.chatForm = document.getElementById('chatbotForm');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.suggestions = document.querySelectorAll('.suggestion-chip');
        this.micButton = document.getElementById('micButton');
        this.voiceToggleButton = document.getElementById('voiceToggleButton');
        this.voiceStatus = document.getElementById('voiceStatus');

        // Stop any ongoing speech when page loads
        this.stopAllSpeech();

        this.initSpeechRecognition();
        this.setupEventListeners();
        this.loadConversationHistory();
        this.loadVoiceSettings();
        
        // Stop speech when page is about to unload/refresh
        window.addEventListener('beforeunload', () => {
            this.stopAllSpeech();
        });
        
        // Stop speech when page becomes hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAllSpeech();
            }
        });
    }

    initSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            if (this.micButton) {
                this.micButton.style.display = 'none';
            }
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButton(true);
            this.showVoiceStatus('Listening... Speak now');
            
            // Stop any ongoing speech when listening starts
            if (this.synthesis && this.synthesis.speaking) {
                this.synthesis.cancel();
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.chatInput.value = transcript;
            this.isListening = false;
            this.updateMicButton(false);
            this.hideVoiceStatus();
            
            // Auto-submit after a short delay
            setTimeout(() => {
                this.handleUserMessage();
            }, 500);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateMicButton(false);
            
            if (event.error === 'no-speech') {
                this.showVoiceStatus('No speech detected. Try again.', true);
            } else if (event.error === 'audio-capture') {
                this.showVoiceStatus('No microphone found. Please check your microphone.', true);
            } else if (event.error === 'not-allowed') {
                this.showVoiceStatus('Microphone permission denied. Please allow microphone access.', true);
            } else {
                this.showVoiceStatus('Error: ' + event.error, true);
            }
            
            setTimeout(() => this.hideVoiceStatus(), 3000);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton(false);
        };
    }

    setupEventListeners() {
        // Form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserMessage();
        });

        // Suggestion chips
        this.suggestions.forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                this.chatInput.value = query;
                this.handleUserMessage();
            });
        });

        // Enter key handling
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });

        // Auto-resize input
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
        });

        // Voice input button
        if (this.micButton) {
            this.micButton.addEventListener('click', () => {
                this.toggleVoiceInput();
            });
        }

        // Voice output toggle button
        if (this.voiceToggleButton) {
            this.voiceToggleButton.addEventListener('click', () => {
                this.toggleVoiceOutput();
            });
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showVoiceStatus('Speech recognition not supported in your browser', true);
            setTimeout(() => this.hideVoiceStatus(), 3000);
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateMicButton(false);
            this.hideVoiceStatus();
        } else {
            // Stop any ongoing speech when starting voice input
            if (this.synthesis && this.synthesis.speaking) {
                this.synthesis.cancel();
            }
            
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                this.showVoiceStatus('Error starting voice recognition', true);
                setTimeout(() => this.hideVoiceStatus(), 3000);
            }
        }
    }

    toggleVoiceOutput() {
        this.voiceEnabled = !this.voiceEnabled;
        this.updateVoiceToggleButton();
        this.saveVoiceSettings();
        
        if (this.voiceEnabled) {
            this.showVoiceStatus('Voice output enabled', false);
        } else {
            this.showVoiceStatus('Voice output disabled', false);
            // Stop any ongoing speech
            this.synthesis.cancel();
        }
        setTimeout(() => this.hideVoiceStatus(), 2000);
    }

    updateMicButton(isListening) {
        if (!this.micButton) return;
        
        if (isListening) {
            this.micButton.classList.add('listening');
            this.micButton.title = 'Listening... Click to stop';
        } else {
            this.micButton.classList.remove('listening');
            this.micButton.title = 'Click to speak';
        }
    }

    updateVoiceToggleButton() {
        if (!this.voiceToggleButton) return;
        
        if (this.voiceEnabled) {
            this.voiceToggleButton.classList.add('active');
            this.voiceToggleButton.title = 'Voice output enabled - Click to disable';
        } else {
            this.voiceToggleButton.classList.remove('active');
            this.voiceToggleButton.title = 'Voice output disabled - Click to enable';
        }
    }

    showVoiceStatus(message, isError = false) {
        if (!this.voiceStatus) return;
        
        this.voiceStatus.textContent = message;
        this.voiceStatus.className = 'voice-status' + (isError ? ' error' : '');
        this.voiceStatus.style.display = 'block';
    }

    hideVoiceStatus() {
        if (this.voiceStatus) {
            this.voiceStatus.style.display = 'none';
        }
    }

    stopAllSpeech() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    speakText(text) {
        if (!this.voiceEnabled || !this.synthesis) return;

        // Stop any ongoing speech
        this.synthesis.cancel();

        // Clean text for speech (remove HTML tags)
        const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };

        this.synthesis.speak(utterance);
    }

    handleUserMessage() {
        const userMessage = this.chatInput.value.trim();
        if (!userMessage || this.isTyping) return;

        // Add user message to chat
        this.addMessage(userMessage, 'user');
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Update context
        this.updateContext(userMessage);

        // Show typing indicator
        this.showTypingIndicator();

        // Generate response with delay for realism
        setTimeout(() => {
            const response = this.generateResponse(userMessage);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.saveConversationHistory();
            
            // Speak the response if voice is enabled
            if (this.voiceEnabled) {
                // Small delay before speaking
                setTimeout(() => {
                    this.speakText(response);
                }, 300);
            }
        }, 1000 + Math.random() * 1000);
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="avatar-circle">🌾</div>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.formatResponse(text)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content user-content">
                    <div class="message-text">${this.escapeHtml(text)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
                <div class="message-avatar">
                    <div class="avatar-circle user-avatar">👤</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Add to history
        this.conversationHistory.push({ sender, text, timestamp });
    }

    formatResponse(text) {
        // Convert markdown-like formatting to HTML
        let formatted = this.escapeHtml(text);
        
        // Bold text (**text**)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Lists (- item)
        formatted = formatted.replace(/^\- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Paragraphs (double line breaks)
        formatted = formatted.split(/\n\n/).map(p => {
            if (p.trim() && !p.includes('<ul>')) {
                return `<p>${p.trim()}</p>`;
            }
            return p;
        }).join('');
        
        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateContext(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Extract topics
        const topics = ['soil', 'irrigation', 'pest', 'crop', 'yield', 'fertilizer', 'water', 'climate', 'sustainable', 'organic'];
        topics.forEach(topic => {
            if (lowerMessage.includes(topic) && !this.context.userInterests.includes(topic)) {
                this.context.userInterests.push(topic);
            }
        });

        // Store previous questions
        this.context.previousQuestions.push(userMessage);
        if (this.context.previousQuestions.length > 5) {
            this.context.previousQuestions.shift();
        }
    }

    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for greetings
        if (this.isGreeting(lowerMessage)) {
            return this.getGreetingResponse();
        }

        // Check for specific farming topics
        if (lowerMessage.includes('soil') || lowerMessage.includes('soil health')) {
            return this.getSoilHealthResponse();
        }

        if (lowerMessage.includes('irrigation') || lowerMessage.includes('water')) {
            return this.getIrrigationResponse();
        }

        if (lowerMessage.includes('pest') || lowerMessage.includes('insect')) {
            return this.getPestControlResponse();
        }

        if (lowerMessage.includes('crop') && (lowerMessage.includes('select') || lowerMessage.includes('choose') || lowerMessage.includes('best'))) {
            return this.getCropSelectionResponse();
        }

        if (lowerMessage.includes('yield') || lowerMessage.includes('productivity')) {
            return this.getYieldResponse();
        }

        if (lowerMessage.includes('sustainable') || lowerMessage.includes('organic')) {
            return this.getSustainableFarmingResponse();
        }

        if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient')) {
            return this.getFertilizerResponse();
        }

        if (lowerMessage.includes('climate') || lowerMessage.includes('weather')) {
            return this.getClimateResponse();
        }

        if (lowerMessage.includes('harvest') || lowerMessage.includes('harvesting')) {
            return this.getHarvestResponse();
        }

        if (lowerMessage.includes('seed') || lowerMessage.includes('planting')) {
            return this.getPlantingResponse();
        }

        // Context-aware follow-up responses
        if (this.context.previousQuestions.length > 0) {
            const lastQuestion = this.context.previousQuestions[this.context.previousQuestions.length - 1];
            if (this.isFollowUp(lowerMessage, lastQuestion)) {
                return this.getContextualResponse(userMessage, lastQuestion);
            }
        }

        // Default response with farming context
        return this.getDefaultResponse(userMessage);
    }

    isGreeting(message) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
        return greetings.some(greeting => message.includes(greeting));
    }

    isFollowUp(message, lastQuestion) {
        const followUpKeywords = ['more', 'tell me', 'explain', 'how about', 'what about', 'also', 'and'];
        return followUpKeywords.some(keyword => message.includes(keyword));
    }

    getGreetingResponse() {
        return "Hello! I'm here to help you with all your farming questions. Whether you need advice on crop management, soil health, irrigation, pest control, or sustainable farming practices, feel free to ask!";
    }

    getSoilHealthResponse() {
        return `**Improving Soil Health:**

Soil health is fundamental to successful farming. Here are key strategies:

**1. Organic Matter Management**
- Add compost, manure, or cover crops regularly
- Aim for 3-5% organic matter content
- Use crop residues as mulch

**2. Soil Testing**
- Test pH levels (most crops prefer 6.0-7.0)
- Check nutrient levels (N, P, K, and micronutrients)
- Monitor soil structure and compaction

**3. Crop Rotation**
- Rotate crops to break pest cycles
- Include legumes to fix nitrogen
- Vary root depths to improve soil structure

**4. Minimize Tillage**
- Use no-till or reduced-till methods
- Preserve soil structure and beneficial microorganisms
- Reduce erosion

**5. Cover Crops**
- Plant cover crops during off-seasons
- Legumes add nitrogen, grasses add organic matter
- Protect soil from erosion

Would you like more specific advice on any of these areas?`;
    }

    getIrrigationResponse() {
        return `**Best Irrigation Practices:**

Efficient water management is crucial for sustainable farming:

**1. Drip Irrigation**
- Most efficient method (90-95% efficiency)
- Delivers water directly to plant roots
- Reduces water waste and weed growth
- Ideal for row crops, vegetables, and orchards

**2. Timing**
- Water early morning (4-6 AM) to reduce evaporation
- Avoid evening watering to prevent fungal diseases
- Monitor soil moisture levels

**3. Smart Irrigation Systems**
- Use soil moisture sensors
- Implement weather-based scheduling
- Consider automated systems with timers

**4. Water Conservation**
- Mulch around plants to retain moisture
- Use drought-resistant crop varieties
- Implement rainwater harvesting
- Practice deficit irrigation for certain crops

**5. Monitoring**
- Check soil moisture regularly
- Watch for signs of over/under-watering
- Adjust based on weather conditions

What type of crops are you irrigating? I can provide more specific recommendations.`;
    }

    getPestControlResponse() {
        return `**Natural Pest Control Methods:**

Integrated Pest Management (IPM) combines multiple strategies:

**1. Biological Control**
- Introduce beneficial insects (ladybugs, lacewings, parasitic wasps)
- Use nematodes for soil pests
- Attract birds and bats as natural predators

**2. Cultural Practices**
- Crop rotation to break pest cycles
- Companion planting (marigolds, basil, garlic)
- Remove infected plants immediately
- Clean up crop residues after harvest

**3. Physical Barriers**
- Row covers for insect protection
- Sticky traps for monitoring
- Hand-picking larger pests
- Netting for bird protection

**4. Organic Sprays**
- Neem oil (effective against many insects)
- Insecticidal soap
- Diatomaceous earth
- Garlic and pepper sprays

**5. Prevention**
- Choose pest-resistant varieties
- Maintain healthy soil (strong plants resist pests better)
- Proper spacing for air circulation
- Regular monitoring and early detection

**6. Beneficial Plants**
- Plant trap crops to lure pests away
- Use flowering plants to attract beneficial insects
- Maintain biodiversity on your farm

What specific pests are you dealing with? I can provide targeted solutions.`;
    }

    getCropSelectionResponse() {
        return `**Choosing the Right Crops:**

Selecting appropriate crops depends on several factors:

**1. Climate Considerations**
- Temperature ranges (cool-season vs warm-season crops)
- Frost dates and growing season length
- Rainfall patterns and drought tolerance
- Heat tolerance for your region

**2. Soil Type**
- Soil pH requirements
- Drainage capabilities
- Nutrient availability
- Texture (sandy, loamy, clay)

**3. Market Demand**
- Local market preferences
- Storage and transportation needs
- Value-added potential
- Seasonal demand patterns

**4. Farm Resources**
- Available water for irrigation
- Labor requirements
- Equipment and infrastructure
- Initial investment costs

**5. Crop Rotation Needs**
- Plan for diversity
- Consider nitrogen-fixing crops
- Balance cash crops with cover crops

**6. Risk Management**
- Diversify crop selection
- Mix annuals and perennials
- Include both high-value and staple crops

To give you specific recommendations, could you share your location/climate zone and soil type?`;
    }

    getYieldResponse() {
        return `**Increasing Crop Yield:**

Maximizing productivity requires a holistic approach:

**1. Soil Optimization**
- Regular soil testing and nutrient management
- Maintain optimal pH levels
- Improve organic matter content
- Address compaction issues

**2. Plant Spacing**
- Follow recommended spacing for each crop
- Avoid overcrowding (reduces competition)
- Consider intensive planting for some vegetables

**3. Water Management**
- Consistent, adequate irrigation
- Avoid water stress during critical growth stages
- Use efficient irrigation methods

**4. Nutrient Management**
- Apply fertilizers at right times
- Use slow-release fertilizers
- Foliar feeding for quick nutrient uptake
- Balance macro and micronutrients

**5. Pest and Disease Control**
- Early detection and treatment
- Preventive measures
- Use resistant varieties when available

**6. Timing**
- Plant at optimal times for your region
- Harvest at peak maturity
- Succession planting for continuous harvest

**7. Technology**
- Use precision agriculture tools
- Monitor crop health with sensors
- Data-driven decision making

**8. Genetic Selection**
- Choose high-yielding, adapted varieties
- Consider hybrid seeds for vigor
- Select disease-resistant cultivars

What crops are you growing? I can provide crop-specific yield improvement strategies.`;
    }

    getSustainableFarmingResponse() {
        return `**Sustainable Farming Practices:**

Sustainable agriculture balances productivity with environmental stewardship:

**1. Conservation Tillage**
- No-till or reduced-till methods
- Preserve soil structure and organic matter
- Reduce erosion and fuel consumption

**2. Crop Diversity**
- Rotate crops to maintain soil health
- Intercropping and polycultures
- Maintain genetic diversity

**3. Integrated Pest Management**
- Biological controls first
- Chemical inputs as last resort
- Monitor and prevent rather than react

**4. Water Conservation**
- Efficient irrigation systems
- Rainwater harvesting
- Drought-resistant varieties
- Mulching to retain moisture

**5. Organic Matter Management**
- Composting
- Cover crops
- Green manures
- Crop residue management

**6. Renewable Energy**
- Solar panels for farm operations
- Wind energy where applicable
- Bioenergy from crop residues

**7. Biodiversity**
- Maintain hedgerows and field margins
- Create wildlife habitats
- Plant native species

**8. Economic Sustainability**
- Diversify income sources
- Direct marketing opportunities
- Value-added products
- Community-supported agriculture (CSA)

**9. Carbon Sequestration**
- Agroforestry
- Perennial crops
- Cover crops
- Reduced tillage

**10. Local and Regenerative Practices**
- Support local ecosystems
- Build soil carbon
- Enhance water cycles
- Improve farm resilience

Would you like to explore any specific sustainable practice in more detail?`;
    }

    getFertilizerResponse() {
        return `**Fertilizer and Nutrient Management:**

Proper nutrient management is key to healthy crops:

**1. Soil Testing**
- Test before each growing season
- Check pH, N, P, K, and micronutrients
- Adjust based on crop requirements

**2. Organic Fertilizers**
- Compost (slow-release, improves soil structure)
- Manure (high in nitrogen, must be composted)
- Bone meal (phosphorus source)
- Blood meal (nitrogen source)
- Fish emulsion (quick-release nutrients)

**3. Synthetic Fertilizers**
- Use when organic sources insufficient
- Follow recommended application rates
- Time applications with crop needs
- Avoid over-application (wasteful and harmful)

**4. Application Timing**
- Pre-planting for base nutrients
- Side-dressing during growth
- Foliar feeding for quick correction
- Avoid late-season nitrogen (delays maturity)

**5. Nutrient Balance**
- N-P-K ratios matter
- Don't over-apply one nutrient
- Micronutrients often overlooked but important
- Consider crop-specific needs

**6. Methods**
- Broadcast for general application
- Banding near plant rows (more efficient)
- Foliar sprays for quick uptake
- Fertigation (fertilizer through irrigation)

**7. Environmental Considerations**
- Prevent runoff into waterways
- Time applications before rain
- Use slow-release forms when possible
- Consider precision application

What crops are you fertilizing? Different crops have different nutrient requirements.`;
    }

    getClimateResponse() {
        return `**Climate and Weather Management:**

Adapting to climate variability is essential:

**1. Understanding Your Climate Zone**
- Know your USDA hardiness zone
- Understand local microclimates
- Track historical weather patterns
- Monitor seasonal variations

**2. Weather Monitoring**
- Use weather stations or apps
- Track temperature, rainfall, humidity
- Monitor frost dates
- Watch for extreme weather warnings

**3. Climate Adaptation Strategies**
- Choose climate-appropriate crops
- Use season extension techniques (hoop houses, row covers)
- Implement water management for droughts
- Prepare for extreme weather events

**4. Heat Management**
- Provide shade for sensitive crops
- Increase irrigation during heat waves
- Use heat-tolerant varieties
- Mulch to keep soil cool

**5. Cold Protection**
- Use row covers and frost blankets
- Plant windbreaks
- Choose cold-hardy varieties
- Time planting after last frost

**6. Water Management**
- Rainwater harvesting
- Drought-resistant varieties
- Efficient irrigation systems
- Monitor soil moisture

**7. Seasonal Planning**
- Adjust planting dates based on weather
- Plan for climate variability
- Have backup plans for extreme events
- Use crop insurance when available

**8. Technology Tools**
- Weather forecasting apps
- Soil temperature sensors
- Automated irrigation systems
- Climate data analysis

What specific climate challenges are you facing in your region?`;
    }

    getHarvestResponse() {
        return `**Optimal Harvesting Practices:**

Timing and technique are crucial for quality harvests:

**1. Timing**
- Harvest at peak maturity for best quality
- Check maturity indicators (color, size, firmness)
- Harvest in morning when temperatures are cooler
- Avoid harvesting when plants are wet

**2. Tools and Equipment**
- Use sharp, clean tools
- Proper containers to prevent damage
- Handle produce gently
- Sanitize equipment between uses

**3. Post-Harvest Handling**
- Cool produce quickly after harvest
- Remove field heat promptly
- Sort and grade immediately
- Remove damaged or diseased items

**4. Storage**
- Optimal temperature and humidity
- Proper ventilation
- First-in-first-out rotation
- Monitor for spoilage

**5. Crop-Specific Tips**
- **Vegetables**: Harvest when tender and before over-maturity
- **Fruits**: Pick at proper ripeness stage
- **Grains**: Harvest at correct moisture content
- **Root crops**: Harvest when fully developed

**6. Quality Standards**
- Know market requirements
- Maintain consistency
- Proper packaging
- Label with harvest date

**7. Succession Harvesting**
- Stagger plantings for continuous harvest
- Pick regularly to encourage production
- Don't let crops over-mature on plant

What crops are you harvesting? I can provide specific timing and technique advice.`;
    }

    getPlantingResponse() {
        return `**Successful Planting Strategies:**

Proper planting sets the foundation for a good harvest:

**1. Seed Selection**
- Choose high-quality, certified seeds
- Select varieties adapted to your climate
- Consider disease resistance
- Check germination rates

**2. Soil Preparation**
- Test and amend soil before planting
- Ensure proper drainage
- Remove weeds and debris
- Loosen soil to appropriate depth

**3. Timing**
- Plant after last frost date
- Consider soil temperature requirements
- Follow recommended planting dates for your zone
- Account for days to maturity

**4. Planting Depth**
- Follow seed packet instructions
- General rule: 2-3 times seed diameter
- Deeper for larger seeds, shallower for small
- Adjust for soil type (deeper in sandy soil)

**5. Spacing**
- Follow recommended spacing for each crop
- Consider mature plant size
- Allow for air circulation
- Intensive planting for some vegetables

**6. Watering**
- Water immediately after planting
- Keep soil consistently moist until germination
- Use gentle watering to avoid washing seeds
- Consider pre-soaking large seeds

**7. Protection**
- Use row covers if needed
- Protect from birds and pests
- Consider seed treatments for disease prevention
- Mark planting locations

**8. Succession Planting**
- Stagger plantings for continuous harvest
- Plan for multiple crops per season
- Consider intercropping compatible plants

What are you planning to plant? I can provide specific guidance.`;
    }

    getContextualResponse(currentMessage, lastQuestion) {
        // Provide follow-up information based on previous question
        const lowerLast = lastQuestion.toLowerCase();
        
        if (lowerLast.includes('soil')) {
            return "To build on soil health, consider also testing your soil's texture and drainage. Sandy soils drain quickly but need more frequent watering and organic matter. Clay soils hold water well but may need aeration. Loamy soils are ideal. Adding organic matter improves all soil types. Would you like specific recommendations for your soil type?";
        }
        
        if (lowerLast.includes('irrigation')) {
            return "For irrigation efficiency, also consider your soil type. Sandy soils need frequent, shorter watering sessions, while clay soils benefit from less frequent, deeper watering. Installing a simple rain gauge helps track natural precipitation. Mulching around plants can reduce irrigation needs by up to 50%. Are you dealing with water restrictions in your area?";
        }
        
        return "That's a great follow-up question! Based on our previous discussion, here's additional information that might help: [Contextual advice based on conversation history]. Would you like me to elaborate on any specific aspect?";
    }

    getDefaultResponse(userMessage) {
        const responses = [
            "That's an interesting question about farming! While I specialize in agriculture topics, I'd be happy to help. Could you provide a bit more detail about what specific aspect you'd like to know about?",
            
            "I understand you're asking about farming practices. To give you the most accurate and helpful response, could you clarify: Are you asking about crop management, soil health, pest control, irrigation, or another specific area of agriculture?",
            
            "That's a great question! In farming, context matters a lot. Could you tell me more about: What type of crops are you growing? What's your climate zone? Are you dealing with a specific challenge? This will help me provide more targeted advice.",
            
            "I'd love to help with your farming question! To provide the best guidance, it would help to know: Are you a commercial farmer or home gardener? What's your experience level? What specific outcome are you trying to achieve?",
            
            "Thanks for your question! Farming advice often depends on local conditions. Could you share: Your general location or climate zone? The type of farming you're doing? Any specific challenges you're facing? This will help me tailor my response."
        ];
        
        // Use context to select response
        if (this.context.userInterests.length > 0) {
            const interest = this.context.userInterests[this.context.userInterests.length - 1];
            return `Based on your interest in ${interest}, here's what I can tell you: Farming is a complex field that requires understanding many interconnected factors. For ${interest} specifically, the key is to start with the basics and build from there. Would you like me to explain more about ${interest} management, or do you have a specific question about it?`;
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('agrotech_chat_history', JSON.stringify(this.conversationHistory));
            localStorage.setItem('agrotech_chat_context', JSON.stringify(this.context));
        } catch (e) {
            console.log('Could not save conversation history');
        }
    }

    loadConversationHistory() {
        try {
            const savedHistory = localStorage.getItem('agrotech_chat_history');
            const savedContext = localStorage.getItem('agrotech_chat_context');
            
            if (savedHistory) {
                this.conversationHistory = JSON.parse(savedHistory);
            }
            if (savedContext) {
                this.context = { ...this.context, ...JSON.parse(savedContext) };
            }
        } catch (e) {
            console.log('Could not load conversation history');
        }
    }

    loadVoiceSettings() {
        try {
            const savedVoiceEnabled = localStorage.getItem('agrotech_voice_enabled');
            if (savedVoiceEnabled !== null) {
                this.voiceEnabled = savedVoiceEnabled === 'true';
            }
            this.updateVoiceToggleButton();
        } catch (e) {
            console.log('Could not load voice settings');
        }
    }

    saveVoiceSettings() {
        try {
            localStorage.setItem('agrotech_voice_enabled', this.voiceEnabled.toString());
        } catch (e) {
            console.log('Could not save voice settings');
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AgroTechChatbot();
});

