var utilKeyMessages = {
    keyMessageIndex: 0,
    keyMessages: [],
    keyMessageNames: [],
    keyMessage: {},
    slides: null,
    totalKeyMessages: 0,

    setKeyMessageNames: function (){
        utilKeyMessages.keyMessageNames = utilKeyMessages.keyMessages.map(function(e) {
            return e.key_message;
        });
    },
    getKeyMessageByIndex: function (index) {

        var keyMessage = {},
            valideIndex = index || 0;

        if(valideIndex > utilKeyMessages.totalKeyMessages){
            valideIndex = 0;
        }
        else if(valideIndex < 0){
            valideIndex = utilKeyMessages.totalKeyMessages;
        }

        keyMessage = utilKeyMessages.keyMessages[valideIndex];

        keyMessage.index = valideIndex;
        keyMessage.numSlides = keyMessage.slides.length || 0;
        keyMessage.sectionNextIndex = (valideIndex+1) === utilKeyMessages.totalKeyMessages ? 0 : valideIndex +1;


        return keyMessage;
    },
    getKeyMessageByName: function (name) {

        var keyMessageIndex = utilKeyMessages.keyMessageNames.indexOf(name),
            keyMessage = {};

        if(keyMessageIndex !== -1){
            keyMessage = utilKeyMessages.getKeyMessageByIndex(keyMessageIndex);
        }

        return  keyMessage;
    },
    getNextKeyMessage: function (index) {
        var keyMessage = {};

        keyMessage = utilKeyMessages.getKeyMessageByIndex(index+1);

        return  keyMessage;
    },
    getPrevKeyMessage: function (index) {

        var keyMessage = {};

        keyMessage = utilKeyMessages.getKeyMessageByIndex(index-1);

        return  keyMessage;
    },
    loadKeymessages: function(data){

        utilKeyMessages.keyMessages = data;

        utilKeyMessages.setKeyMessageNames();

        utilKeyMessages.totalKeyMessages = utilKeyMessages.keyMessages.length -1;


    }
};
