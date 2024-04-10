const btn = document.querySelector('.btn_1');
const content = document.querySelector('.content');
const screenInfo = document.querySelector('.screenInfo');
const navigatorInfo = document.querySelector('.navigatorInfo');

btn.addEventListener ('click', () => {
    content.style.visibility = 'visible';
    screenInfo.textContent = `Высота экрана: ${screen.height}px, ширина экрана: ${screen.width}px.`;

    const error = () => {
        navigatorInfo.textContent = 'Информация о местоположении недоступна.';
    }

    const success = (position) => {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;

        navigatorInfo.textContent = `Широта: ${latitude} °, Долгота: ${longitude} °`;
    }

    if (!navigator.geolocation) {
        error();
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
})