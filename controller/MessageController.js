"use strict";

const venom = require('venom-bot');
const fs = require('fs');

var clientsArray = [];

let chromiumArgs = [ "--incognito",
"--no-sandbox",
"--single-process",
"--no-zygote"];

async function opendata(req, res, sessionName) {
    console.log(sessionName)
    clientsArray[sessionName] = await venom.create(sessionName, (base64Qr, asciiQR) => {
       
      

        exportQR(req, res, base64Qr, sessionName + '.png', sessionName);
    }, (statusFind) => {
        console.log(statusFind + '\n\n')
       
    }, {
        headless: true, // Headless chrome
        devtools: false, // Open devtools by default
        executablePath: '/usr/bin/google-chrome',
        useChrome: true, // If false will use Chromium instance
        debug: false, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        browserArgs: chromiumArgs, // Parameters to be added into the chrome browser instance
        refreshQR: 15000, // Will refresh QR every 15 seconds, 0 will load QR once. Default is 30 seconds
        disableSpins: true,
    }).catch(erro => console.log(erro))

    await start(req, res, clientsArray, sessionName);

    res.status(201).json({
        response: 'Sessão aberta com sucesso!',
    })

    req.io.emit('whatsapp-status', true)
}

function exportQR(req, res, qrCode, path, session) {
    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    fs.writeFileSync(path, imageBuffer);
    req.io.emit('qrCode',
        {
            data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
            session: session
        }
    );
}

async function start(req, res, client, sessionName) {
    await client[sessionName].onStateChange((state) => {
        const conflits = [
            venom.SocketState.CONFLICT,
            venom.SocketState.UNPAIRED,
            venom.SocketState.UNLAUNCHED,
        ];
        if (conflits.includes(state)) {
            client[sessionName].useHere();
        }
    });

    await client[sessionName].onMessage((message) => {
        console.log(`[${sessionName}]: Mensagem Recebida: \nTelefone: ' ${message.from}, Mensagem: ${message.body}`)
        req.io.emit('mensagem-recebida', {data: message, session: sessionName})
    });
}

module.exports = {
    async abrirSessao(req, res) {
        const {sessionName} = req.body

        opendata(req, res, sessionName)
    },
    async fecharSessao(req, res) {
        const {session} = req.body
        await clientsArray[session].close();

        req.io.emit('whatsapp-status', false)
    },

    async enviar_msg1(req, res) {
        console.log('lalsdlaslaldla')
           res.send('OLA')
    },
    //envio de mensagens
    
    async enviar_msg(req, res) {
    


        let phones = req.body.phone 
        const msg = req.body.texto 
        const session = req.body.session
    
    
       
       

 
        
        for(var phone of phones){
       
            console.log(phone)

            
                sendMessage()
          
                        

        }

             async function sendMessage() {
            try {
                await clientsArray[session].sendText("5521" + phone + "@c.us", msg);

                res.status(201).json({
                    response: {
                        message: msg,
                        contact: "5521" + phone + "@c.us",
                        session: session
                    },
                })

                req.io.emit('mensagem-enviada', {message: msg, to: phone});
            } catch (error) {
                res.status(400).json({
                    response: {
                        message: 'Sua mensagem não foi enviada.',
                        session: session,
                        log: error
                    },
                })
            }
        }
            
    
       




        
    }

    
}