const conversations = {};

function getConversation(sessionId) {

    if (!conversations[sessionId]) {

        conversations[sessionId] = {
            intent: "",
            specialty: "",
            doctor: "",
            date: "",
            time: ""
        };

    }

    return conversations[sessionId];

}

function updateConversation(sessionId, ai) {

    const conversation = getConversation(sessionId);

    if (ai.intent) conversation.intent = ai.intent;
    if (ai.specialty) conversation.specialty = ai.specialty;
    if (ai.doctor) conversation.doctor = ai.doctor;
    if (ai.date) conversation.date = ai.date;
    if (ai.time) conversation.time = ai.time;

    return conversation;

}

function clearConversation(sessionId) {

    delete conversations[sessionId];

}

module.exports = {
    getConversation,
    updateConversation,
    clearConversation
};