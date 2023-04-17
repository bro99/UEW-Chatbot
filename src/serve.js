const express = require('express')
const route = require('./route')
const path = require('path')
const app = express()
var mongoose = require('mongoose');
var dbUrl = 'mongodb+srv://root:root@cluster0.1vupopn.mongodb.net/RoboAtendimento'
const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const { NlpManager } = require("node-nlp");
const http = require('http');
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const io = socketIO(server);
const Message = require('../src/controllers/QuestionController');
const { dockStart } = require('@nlpjs/basic');
const manager = new NlpManager({ languages: ['pt'] });
var numero = [{ tell: '' }];
const delay = require('delay');


(
  async () => {
    const feedback = "Estamos finalizando a conversa. Deixe seu feedback e ajude no nosso crescimento.\nDesde já agradeço e tenha um ótimo dia.\n\n*O - Ótimo*\n*B - Bom*\n*C - Comum*\n*R - Ruim*"
    
    
    const Img_envia01 = await MessageMedia.fromFilePath("data/UEW-mapa.PNG");

    const pdf_catalogo = await MessageMedia.fromFilePath("data/Catalogo_UEW.pdf");


    //#region Conexao Banco
    mongoose.connect(dbUrl, (err) => {
      console.log('Banco ON');
    })

    //#endregion Conexao Banco



    const client = new Client({
      restartOnAuthFail: true,
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process', // <- this one doesn't works in Windows
          '--disable-gpu'
        ],
      },
      authStrategy: new LocalAuth()
    });

    client.initialize();


    client.on('message_create', async (msg) => {
      if (numero.filter(e => e.tel == msg.from) == 0) {
        if (msg.fromMe === true &&
          msg.body === "Foi um prazer poder te ajudar!") {

          var primeiro = numero.shift();
          await client.sendMessage(msg.to, feedback);
          console.log(numero)

        }


      }


    });









    client.on('message', async msg => {
      if (numero.filter(e => e.tel == msg.from) == 0) {




        const message = await Message.index()
        // 
        const test = {

          "locale": "pt-br",
          "data": message

        }



        const dock = await dockStart({ use: ['Basic'] });
        const nlp = dock.get('nlp');
        await nlp.addCorpus(test);

        await nlp.train();


        const response = await nlp.process('pt', msg.body);
        //#endregion Area que pega as respostas do banco      


        if (response.intent === 'None' || response.intent === 'catalogo' || response.intent === 'pedido-duvida-ajuda' || response.intent === 'localizacao') {

          switch (response.intent) {

            case 'None':
              client.sendMessage(msg.from, "Olá, perdão não entendi o que você quis dizer, por gentileza, escolha uma das seguintes opções:\n\n*1.Fazer um pedido* 🙋‍♀️\n\n*2.Dúvidas ou sugestões* 🤔\n\n*3.Catálogo* 📚\n\n*4.Nosso site* 💻\n\n*5.Onde nos encontrar* 🗺️\n\n*6.Ajuda com um pedido* 🆘")
              break;

            case 'catalogo':
              await client.sendMessage(msg.from, pdf_catalogo, { caption: "Catálogo ✔" });
              await delay(360)
              await client.sendMessage(msg.from, response.answer);
              console.log("Numero adicionado lista de não resposta.")
              var adicionar = numero.push({ tel: msg.from });

    


              break;

            case 'pedido-duvida-ajuda':

              await client.sendMessage(msg.from, response.answer);

              console.log("Numero adicionado lista de não resposta.")
              var adicionar = numero.push({ tel: msg.from });


              break;
            case 'localizacao':
              await client.sendMessage(msg.from, Img_envia01);
              await delay(360)
              await client.sendMessage(msg.from, response.answer);


              break;

          }



        }

        else {
          await client.sendMessage(msg.from, response.answer);
        }


      }
    

        else {

         var primeiro = numero.shift();

        }





   




      //#endregion










    });




    io.on('connection', function (socket) {

      socket.emit('message', 'Conectando...');

      client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
          socket.emit('qr', url);
          socket.emit('message', 'QR CODE disponivel, leia-o por favor!');
        });
      });

      client.on('ready', () => {
        socket.emit('ready', 'Whatsapp está pronto!');
        socket.emit('message', 'Whatsapp está pronto!');
      });

      client.on('authenticated', () => {
        socket.emit('authenticated', 'Whatsapp está autenticado!');
        socket.emit('message', 'Whatsapp está autenticado!');
        console.log('AUTHENTICATED');
      });

      client.on('auth_failure', function (session) {
        socket.emit('message', 'Falha na autenticação, reiniciando...');
      });

      client.on('disconnected', (reason) => {
        socket.emit('message', 'Whatsapp foi disconectado!');
        client.destroy();
        client.initialize();
      });




    });







    app.set('view engine', 'ejs')

    app.use(express.static("public"))

    app.set('views', path.join(__dirname, 'views'))

    app.use(express.urlencoded({ extended: true }))

    app.use(route)




    server.listen(port, function () {
      console.log('App running on *: ' + port);
    });


  })();