class WeatherApp {
    constructor() {
        this.apiKey = '98520460f021d7fc0dd2ff8802b49f91';
        this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
        this.uvUrl = 'https://api.openweathermap.org/data/2.5/uvi';
        
        this.initializeElements();
        this.bindEvents();
        this.loadDefaultWeather();
    }
    
    initializeElements() {
        this.locationInput = document.getElementById('locationInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.weatherContainer = document.getElementById('weatherContainer');
        this.loading = document.getElementById('loading');
        this.weatherInfo = document.getElementById('weatherInfo');
        this.error = document.getElementById('error');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.country = document.getElementById('country');
        this.temp = document.getElementById('temp');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.description = document.getElementById('description');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.pressure = document.getElementById('pressure');
        this.visibility = document.getElementById('visibility');
        this.uvIndex = document.getElementById('uvIndex');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
    }
    
    async loadDefaultWeather() {
        // Load weather for a default city (London) on page load
        await this.getWeatherByCity('London');
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.weatherInfo.style.display = 'none';
        this.error.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
    }
    
    showError(message) {
        this.hideLoading();
        this.weatherInfo.style.display = 'none';
        this.error.style.display = 'block';
        this.errorMessage.textContent = message;
    }
    
    showWeatherInfo() {
        this.hideLoading();
        this.error.style.display = 'none';
        this.weatherInfo.style.display = 'block';
    }
    
    async searchWeather() {
        const location = this.locationInput.value.trim();
        if (!location) {
            this.showError('Please enter a city name');
            return;
        }
        
        await this.getWeatherByCity(location);
    }
    
    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }
        
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                this.showError(message);
            }
        );
    }
    
    async getWeatherByCity(city) {
        this.showLoading();
        
        try {
            const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found');
                } else if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your API key.');
                } else {
                    throw new Error('Weather data unavailable');
                }
            }
            
            const data = await response.json();
            await this.displayWeather(data);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async getWeatherByCoords(lat, lon) {
        try {
            const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your API key.');
                } else {
                    throw new Error('Weather data unavailable');
                }
            }
            
            const data = await response.json();
            await this.displayWeather(data);
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    async displayWeather(data) {
        // Update location
        this.cityName.textContent = data.name;
        this.country.textContent = data.sys.country;
        
        // Update temperature
        this.temp.textContent = Math.round(data.main.temp);
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        this.weatherIcon.alt = data.weather[0].description;
        
        // Update description
        this.description.textContent = data.weather[0].description;
        
        // Update details
        this.feelsLike.textContent = Math.round(data.main.feels_like);
        this.humidity.textContent = data.main.humidity;
        this.windSpeed.textContent = data.wind.speed;
        this.pressure.textContent = data.main.pressure;
        this.visibility.textContent = data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A';
        
        // Fetch UV Index data
        await this.getUVIndex(data.coord.lat, data.coord.lon);
        
        this.showWeatherInfo();
    }
    
    async getUVIndex(lat, lon) {
        try {
            const url = `${this.uvUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const uvData = await response.json();
                this.uvIndex.textContent = uvData.value.toFixed(1);
            } else {
                this.uvIndex.textContent = 'N/A';
            }
        } catch (error) {
            this.uvIndex.textContent = 'N/A';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});