const sentUrl = 'wss://echo-ws-service.herokuapp.com/';

const msg = document.querySelector('.msg');
const btnSent = document.querySelector('.btnSent');
const btnGeo = document.querySelector('.btnGeo');
const chatBox = document.querySelector('.chatBox');

let myWebsocket;
let flagGeoMsg = false;

//функция создания WebSocket
const openWebsocket = () => {
    myWebsocket = new WebSocket(sentUrl);
        myWebsocket.onmessage = function(evt) {
            //если отправляем данные гео, ответ от сервера не выводим
            if (!flagGeoMsg){
                writeMsg(evt.data, 'receiving');
            }
            flagGeoMsg = false;
        };
        myWebsocket.onerror = function(evt) {
            writeMsg(evt.data, 'err');
        };
}

//Функция для выполнения ожидания открытия WebSocket,
//для избежания ошибок отправляемых сообщений
const waitConnection = (websocket) => {
    return new Promise((resolve, reject) => {
       const maxAttempt = 5; //количество проверок состояния WebSocket
       let countAttempt = 0;
       const interval = setInterval(() => {
          if (countAttempt > maxAttempt - 1) {
             clearInterval(interval);
             reject(new Error('Превышено время ожидания соединения'));
          } else if (websocket.readyState === websocket.OPEN) {
             clearInterval(interval);
             resolve();
          }
          countAttempt++;
       }, 1000);
    });
}

//функция отправки сообщения, ожидает открытия подключения, т.е. выполнения ф-ии waitConnection
const sendMessage = async (websocket, msg) => {
    if (websocket.readyState !== websocket.OPEN) {
       try {
          await waitConnection(websocket);
          websocket.send(msg);
       } catch (err) {
          writeMsg(err, 'err');
       }
    } else {
        websocket.send(msg);
    }
}

//Функция для вывода сообщения в чат
const writeMsg = (message,type) => {
    let newBlock = document.createElement("div");
    let newH3 = document.createElement("h3");
    newBlock.classList.add("chatText");
    //выбор оформления по типу сообщения отправлено/получено/геолокация/ошибка
    switch(type) {
        case 'sending':
            newBlock.classList.add("chatSent");
            newH3.classList.add("chatSentHeading");
            newH3.innerHTML = "Отправлено:";
            newBlock.innerHTML = message;
            break;
        case 'receiving':
            newBlock.classList.add("chatReceived");
            newH3.classList.add("chatReceivedHeading");
            newH3.innerHTML = "Получено:";
            newBlock.innerHTML = message;
            break;
        case 'geo':
            newBlock.classList.add("chatSent");
            newH3.classList.add("chatSentHeading");
            newH3.innerHTML = "Гео-локация:";
            let newUrl = document.createElement('a')
            newUrl.innerHTML = message;
            newUrl.href = message;
            newBlock.appendChild(newUrl);
            break;
        case 'err':
            newBlock.classList.add("chatErr");
            newH3.classList.add("chatErrHeading");
            newH3.innerHTML = "ОШИБКА!";
            newBlock.innerHTML = message;
            break;
    }
    newBlock.prepend(newH3);
    chatBox.appendChild(newBlock);
    chatBox.scrollTop = chatBox.scrollHeight;
}

//обработчик клика на кнопку "отправить"
btnSent.addEventListener('click', () => {
    textMsg = msg.value;
    //если сообщение напечатано - выводим отправленное сообщение и ответ от сервера
    if (textMsg!==''){
        openWebsocket();
        writeMsg(textMsg, 'sending');
        sendMessage(myWebsocket,textMsg);
        msg.value = '';
    }
});

//обработчик клика на кнопку "Геолокация"
btnGeo.addEventListener ('click', () => {
    openWebsocket();
    //обработка ошибки получения данные геолокации
    const error = () => {
        writeMsg('Информация о местоположении недоступна.', 'err');
    }
    //обработка при успешном получении данных геолокации
    const success = (position) => {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        const geoUrl = 'https://www.openstreetmap.org/search?whereami=1&query=61.67%2C-105.47#map=15/'+latitude+'/'+longitude;        
        writeMsg(geoUrl,'geo');
        flagGeoMsg = true; //флаг для отправления гео, не выводит ответ от сервера
        sendMessage(myWebsocket,geoUrl);
    }
    if (!navigator.geolocation) {
        error();
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
})
