const btn = document.querySelector('.btn_1');
const content = document.querySelector('.content');
const timezoneInfo = document.querySelector('.timezoneInfo');
const dateTimeInfo = document.querySelector('.dateTimeInfo');

btn.addEventListener ('click', () => {
    content.style.visibility = 'visible';

    const error = () => {
        timezoneInfo.textContent = 'Информация о местоположении недоступна.';
        dateTimeInfo.textContent = 'Информация о местоположении недоступна.';
    }
    const success = (position) => {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;

        fetch('https://api.ipgeolocation.io/timezone?apiKey=32bcd4a6e4b548968e7afcdb682ac679&lat='+latitude+'&long='+longitude)
            .then ((response) => {
                if (response.ok) {
                    const result = response.json();
                    return result;
                    } else {
                        throw new Error(response.status);
                    }
            })
            .then ((data) => {
                timezoneInfo.textContent = data.timezone;
                dateTimeInfo.textContent = data.date_time_txt;
            })
            .catch((error) => { 
                timezoneInfo.textContent = error;
                dateTimeInfo.textContent = error;
            });
    }

    if (!navigator.geolocation) {
        error();
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
})