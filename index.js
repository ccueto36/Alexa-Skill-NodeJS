'use strict';
const Alexa = require('alexa-sdk');
const cheerio = require('cheerio');
const request = require('request');
const ConfigParser = require('configparser');

const config = new ConfigParser();
config.read('config.ini');
let app_id = config.get('Alexa', 'app_id');

const APP_ID = app_id;
const SKILL_NAME = 'Travel Quotes';
const GET_QUOTE_MESSAGE = "Here's your quote: ";
const WELCOME_MESSAGE = "Welcome to Travel Quotes. You can say tell me a travel quote, or you can say exit...What can I help you with?";
const HELP_MESSAGE = 'You can say tell me a travel quote, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

let generateRandomQuote = function(callback) {
    let quotes = [];
    let url = 'https://www.brainyquote.com/topics/travel';
    let randomPage = Math.floor(Math.random() * 5);
    url = `${url}_${randomPage}`
    request(url, function(err, res, body){
        if(err){
            callback(err, null);
        }
        else {
            let $ = cheerio.load(body);
            $('.oncl_q').each(function (){
                let quote = $(this).text();
                if(quote != undefined && quote.length != 0)
                    quotes.push($(this).text());
            });
            let randomQuote =  quotes[Math.floor(Math.random() * quotes.length)];
            callback(err, randomQuote)
        }
    });   
}

const handlers = {
    'LaunchRequest': function () {
        const speechOutput = WELCOME_MESSAGE;
        const reprompt = HELP_REPROMPT;
        
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        this.emit(':ask', 'Error while trying to run skill');
        },
    'GetNewTravelQuoteIntent': function () {
        let travelQuoteIntent = this;
        generateRandomQuote(function(err, randomQuote){
            if(err){
                travelQuoteIntent.emit(':ask', 'Error while retrieving quote');
            }
            else {
                const speechOutput = GET_QUOTE_MESSAGE + randomQuote;
                travelQuoteIntent.response.cardRenderer(SKILL_NAME, randomQuote);
                travelQuoteIntent.response.speak(speechOutput);
                travelQuoteIntent.emit(':responseReady');
            }
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};





    
    