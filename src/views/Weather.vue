<template>
    <div>
		<div v-if="!preloader && photoChecked" class="forecast-page">

			<div class="place-img-wrapper">
				<img :src="photo" alt="">
			</div>

			<h1 class="place-name">
				Weather forecast for <span>{{ $store.state.place.name }}</span>
			</h1>

			<div class="forecast-wrapper">
				<div v-for="(day, index) in weather" class="forecast">

					<div class="forecast__left-triangle">
						<div class="forecast__date">
							<div class="forecast__day-name">
								{{ getDayName($store.state.days[index]) }}
							</div>

							<div class="forecast__day">
								<span>{{ getDayNum($store.state.days[index]) }}</span>
								<span>{{ getMonthName($store.state.days[index]) }}</span>
							</div>
						</div>
						<div class="forecast__icon-mobile" :style="{'background-image': 'url(' + require('@/assets/weather-icons/' + day.daily.data[0].icon +'.svg') + ')'}"></div>
					</div>

					<div class="forecast__details">

						<div class="day-temperature">
							<div class="day-temperature__info">
								<div class="day-temperature__temperature">
									<span>{{ day.daily.data[0].temperatureLow }}</span> &deg;C
								</div>
								<div class="day-temperature__desc">
									Min at night
								</div>
							</div>
							<div class="day-temperature__line"></div>
							<div class="day-temperature__info">
								<div class="day-temperature__temperature">
									<span>{{ day.daily.data[0].temperatureHigh }}</span> &deg;C
								</div>
								<div class="day-temperature__desc">
									Max at day
								</div>
							</div>
						</div>

						<div class="day-sun">
							<div class="day-sun__sunrise">
								<div>Sunrise</div>
								<div>{{ getSunTime(day.daily.data[0].sunriseTime, day.timezone) }}</div>
							</div>
							<div class="day-sun__sunset">
								<div>Sunset</div>
								<div>{{ getSunTime(day.daily.data[0].sunsetTime,  day.timezone) }}</div>
							</div>
						</div>

						<div class="day-rest">
							<div class="day-rest__humidity">
								Humidity:<span>{{ day.daily.data[0].humidity }}</span> %
							</div>
							<div class="day-rest__wind">
								Wind:<span>{{ day.daily.data[0].windSpeed }}</span> km/h
							</div>
						</div>

					</div>

					<div class="forecast__right-triangle">
						<div class="forecast__icon" :style="{'background-image': 'url(' + require('@/assets/weather-icons/' + day.daily.data[0].icon +'.svg') + ')'}"></div>
					</div>

				</div>
			</div>

		</div>
		<preloader v-else></preloader>
    </div>
</template>

<script>
import Preloader from '@/components/preloader'
export default {
    name: 'About',
    data() {
        return {
			preloader: true,
			googlePlaceApiKey: 'AIzaSyAcMmm3BetI3KfWDAnQKaV292gi5MnnhSg',
            proxyUrl: 'https://cors-anywhere.herokuapp.com/',
            weatherApiUrl: 'https://api.darksky.net/forecast/',
            weatherApiKey: '42aeaef5bfe709f25439ab7506a1006d/',
            latitude: '',
			longitude: '',
			date: '',
			lang: 'lang=en',
			units: 'units=si',
			exclude: 'exclude=hourly,minutely,currently,flags',
			// timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			place_id: '',
			weather: [],
			photoChecked: false,
			photo: null,
			photo_reference: null
        };
    },
    methods: {
		getPlace() {
			this.latitude = this.$store.state.place.latitude;
			this.longitude = this.$store.state.place.longitude;
			this.place_id = this.$store.state.place.place_id;
		},
		async getWeather() {
			const days = this.$store.state.days;
			try {
				Promise.all(
					days.map(day=>{
						const apiCall = this.proxyUrl +
            	    					this.weatherApiUrl +
            	    					this.weatherApiKey +
            	    					this.latitude +
            	    					',' +
										this.longitude +
										',' +
										day +
										'?' +
										this.lang +
										'&' +
										this.units +
										'&' +
										this.exclude;
						return fetch(apiCall).then(value => value.json())
					})
				).then(apiResponses => {
					this.weather = apiResponses;
				}).then(()=>this.preloader = false)
			}
			catch(e) {
				console.log(e.message)
			}
		},
		async getPhotoRef() {
			const apiCall = this.proxyUrl +
							'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + 
							this.$store.state.place.place_id +
							'&fields=photo&key=' +
							this.googlePlaceApiKey;
			const response = await fetch(apiCall);
			const responseJSON = await response.json();
			if ( Object.keys(responseJSON.result).length !== 0 ) {
				this.photo_reference = responseJSON.result.photos[0].photo_reference;
				this.getPhoto(this.photo_reference);
			} else this.photoChecked = true;
			
		},
		async getPhoto(ref) {
			const apiCall = this.proxyUrl +
							'https://maps.googleapis.com/maps/api/place/photo?maxwidth=900&photoreference=' +
							ref +
							'&key=' +
							this.googlePlaceApiKey;
			const response = await fetch(apiCall);
			const responseFile = await response.blob();
			const outside = await URL.createObjectURL(responseFile)
			this.photo = outside;
			this.photoChecked = true;
		},
		averageTemperature(day, night) {
			return ((+day + +night)/2).toFixed(2)
		},
		getDayName(timestamp, zone) {
			const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			const date = new Date(timestamp * 1000);
			return days[date.getDay()]
		},
		getMonthName(timestamp) {
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			const date = new Date(timestamp * 1000);
			return months[date.getMonth()];
		},
		getDayNum(timestamp) {
			const date = new Date(timestamp * 1000);
			return date.getDate();
		},
		getSunTime(timestamp, zone) {
			let date = new Date(timestamp * 1000).toLocaleString("en-US", {timeZone: zone});
			date = new Date(date);
			return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2)
		}
	},
	mounted() {
		this.getPlace();
		this.getPhotoRef();
		this.getWeather();
	},
	components: {
		Preloader
	}
};
</script>

<style scoped lang="scss">
.forecast-page {
	padding-top: 30px;
	background: #fff;
}
.place-name {
	text-align: center;
}
.forecast-wrapper {
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
}
.forecast {
	font-size: 20px;
	display: flex;
	margin-bottom: 30px;
	height: 180px;

	&__icon {
		width: 64px;
		height: 64px;
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
		flex-shrink: 0;
	}
	&__icon-mobile {
		width: 64px;
		height: 64px;
		background-repeat: no-repeat;
		background-position: center;
		background-size: contain;
		flex-shrink: 0;
		display: none;
	}
	&__details {
		// background-color: #a8e2ff;
		flex-grow: 1;
		padding: 5px 15px;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: rgb(168,226,255);
		background: -moz-linear-gradient(left, rgb(168,226,255) 0%, rgb(114,208,255) 50%, rgb(168,226,255) 100%);
		background: -webkit-linear-gradient(left, rgb(168,226,255) 0%,rgb(114,208,255) 50%,rgb(168,226,255) 100%);
		background: linear-gradient(to right, rgb(168,226,255) 0%,rgb(114,208,255) 50%,rgb(168,226,255) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#a8e2ff', endColorstr='#a8e2ff',GradientType=1 );
	}
	&__details-block {
		span:last-child {
			margin-left: 15px;
			font-weight: 700;
		}
	}
	&__left-triangle {
		width: 135px;
		padding-top: 7px;
		padding-left: 30px;
		padding-right: 5px;
		height: 100%;
		background: linear-gradient(to top right, #fff 0%, #fff 50%, #a8e2ff 50%, #a8e2ff 100%);
	}
	&__right-triangle {
		width: 135px;
		height: 100%;
		background: linear-gradient(to bottom left, #fff 0%, #fff 50%, #a8e2ff 50%, #a8e2ff 100%);
		display: flex;
		align-items: flex-end;
		padding-bottom: 20px;
	}
	&__date {
		color: #708090;
	}
	&__day {
		z-index: 4;
		text-align: right;
		span:first-child {
			font-size: 30px;
			font-weight: 700;
			margin-right: 8px;
		}
	}
}
.day-temperature {
	display: flex;
	align-items: center;
	width: 100%;
	&__info {
		width: 100px;
		display: flex;
		flex-direction: column;
	}
	&__temperature {
		span {
			font-size: 30px;
			font-weight: 700;
		}
	}
	&__line {
		flex-grow: 1;
		margin: 0 5px;
		height: 18px;
		border-radius: 9px;
		background: rgb(0,71,153);
		background: -moz-linear-gradient(left, rgb(0,71,153) 0%, rgb(29,86,153) 15%, rgb(70,108,153) 30%, rgb(206,88,68) 60%, rgb(214,62,32) 81%, rgb(255,0,0) 100%);
		background: -webkit-linear-gradient(left, rgb(0,71,153) 0%,rgb(29,86,153) 15%,rgb(70,108,153) 30%,rgb(206,88,68) 60%,rgb(214,62,32) 81%,rgb(255,0,0) 100%);
		background: linear-gradient(to right, rgb(0,71,153) 0%,rgb(29,86,153) 15%,rgb(70,108,153) 30%,rgb(206,88,68) 60%,rgb(214,62,32) 81%,rgb(255,0,0) 100%);
		filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#004799', endColorstr='#ff0000',GradientType=1 );
	}
}
.day-sun {
	display: flex;
	margin-bottom: 15px;
	& > div {
		padding-left: 55px;
		div:last-child {
			font-weight: 700;
		}
	}
	&__sunrise {
		margin-right: 30px;
		background: url('../assets/icons/sunrise.svg') no-repeat left center /contain;
	}
	&__sunset {
		background: url('../assets/icons/sunset.svg') no-repeat left center /contain;
	}
}
.day-rest {
	display: flex;
	& > div {
		padding-left: 40px;
		height: 35px;
		display: flex;
		align-items: center;
		span {
			font-weight: 700;
			margin: 0 5px;
		}
	}
	&__humidity {
		margin-right: 30px;
		background: url('../assets/icons/humidity.svg') no-repeat left center /contain;
	}
	&__wind {
		background: url('../assets/icons/weathercock.svg') no-repeat left center /contain;
	}
}
.place-img-wrapper {
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
	height: auto;
	max-height: 600px;
	overflow: hidden; 
	img {
		width: 100%;
		height: auto;
	}
}
@media only screen and (max-width: 767px) {
	.forecast-page {
		padding: 30px 15px 10px;
	}
	.forecast {
		flex-direction: column;
		height: auto;
		margin-bottom: 20px;
		&__right-triangle {
			display: none;
		}
		&__icon-mobile {
			display: block;
			margin-left: 20px;
		}
		&__left-triangle {
			display: flex;
			justify-content: center;
			width: 100%;
			padding: 10px 0 5px;
			background: rgb(168,226,255);
			border-radius: 5px 5px 0 0;
			background: -moz-linear-gradient(left, rgb(168,226,255) 0%, rgb(114,208,255) 50%, rgb(168,226,255) 100%);
			background: -webkit-linear-gradient(left, rgb(168,226,255) 0%,rgb(114,208,255) 50%,rgb(168,226,255) 100%);
			background: linear-gradient(to right, rgb(168,226,255) 0%,rgb(114,208,255) 50%,rgb(168,226,255) 100%);
			filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#a8e2ff', endColorstr='#a8e2ff',GradientType=1 );
		}
		&__details {
			padding: 5px 5px 15px;
			border-radius:  0 0 5px 5px;
		}
	}
	.place-img-wrapper {
		max-height: 300px;
	}
	.day-temperature {
		margin-bottom: 15px;
	}
	.day-rest {
		flex-direction: column;
		&__humidity {
			margin-bottom: 15px;
		}
	}
	.place-name {
		font-size: 24px;
	}
}
</style>

