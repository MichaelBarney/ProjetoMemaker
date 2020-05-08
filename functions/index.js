const functions = require('firebase-functions');
const axios = require('axios');

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(async (request, response) => {
    // Analisar a mensagem recebida e delegar a função correta à ser executada de acordo com seu Intent.
    const agent = new WebhookClient({ request, response });
    
    function welcome(agent) {
        agent.add(`Bem bindo ao meu agente!`);
    }

    async function temperatura(cidade){
        tempJSON =  await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=8ceb48353bf895add769572636422ae8`)
        tempKelvin =  tempJSON.data.main.temp
        tempCelcius = tempKelvin - 273
        return tempCelcius.toFixed(1)
    }

    async function previsao(agent) {
        const cidade = agent.parameters.location.city;
        const temp = await temperatura(cidade);
        agent.add(`A temperatura em ${cidade} é de ${temp}°C`);
        
        const quickReplies = new Suggestion(
            {
                title: 'Está quente ou frio?',
                reply: 'Frio'
            }
        )
        quickReplies.addReply_('Quente')
        agent.add(quickReplies)
    }

    console.log(request)
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Previsão de Tempo', previsao);
    await agent.handleRequest(intentMap)
});
