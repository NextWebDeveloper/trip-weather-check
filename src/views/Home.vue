<template>
    <div class="home">
		<div class="home-wrapper">
			<div class="home-img">
				<img sizes="100vw" src="@/assets/main-bg-775.jpg" srcset="@/assets/main-bg-775.jpg 775w, @/assets/main-bg-1550.jpg 1550w, @/assets/main-bg-3100.jpg 3100w">
			</div>
			<div class="home-inner">
				<div class="home-content">
					<h1>Planning a trip?</h1>
					<h2>Check a weather on any days with our weather time machine!</h2>
					<div class="place-wrapper">
						<label for="" class="date-input__label">Where</label>
						<input ref="autocomplete" 
       					placeholder="Anywhere" 
       					class="search-location"
       					onfocus="value = ''" 
       					type="text" />
					</div>
					<div class="date-wrapper">
						<div class="date-input">
							<label for="" class="date-input__label">From</label>
							<date-picker class="date-input__picker date-input__picker_from" v-model="time1" lang="en" :not-before="new Date()" :first-day-of-week="1" @focus="closePopup"></date-picker>
						</div>
						<div class="date-input">
							<label for="" class="date-input__label">To</label>
							<date-picker class="date-input__picker date-input__picker_to" :disabled="!startDate" v-model="time2" lang="en" :not-before="time1" :not-after="endDate" :first-day-of-week="1" @focus="closePopup"></date-picker>
						</div>						
					</div>
					<div class="link-wrapper">
						<button class="button-link" @click="checkWeather">Check weather</button>
					</div>
				</div>
			</div>

		</div>
    </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import DatePicker from 'vue2-datepicker'

export default {
    name: 'home',
    data() {
        return {
			time1: null,
			time2: null,
			placeInfo: {}
		};
    },
    methods: {
		getPlace() {
			this.autocomplete.addListener('place_changed', async () => {
			  	let place = await this.autocomplete.getPlace();
			  	this.placeInfo.latitude = place.geometry.location.lat();
			  	this.placeInfo.longitude = place.geometry.location.lng();
				this.placeInfo.place_id = place.place_id;
				this.placeInfo.name = place.name;
			  	this.$store.commit('setPlace', this.placeInfo)
			});
		},
		getDays() {
			if (this.time1 instanceof Date && this.time2 instanceof Date) {
				let arr=[], 
					dt=new Date(this.time1.getTime());
				while (dt<=this.time2) {
					arr.push( ((new Date(dt)).getTime()/1000).toFixed(0) );
					dt.setDate(dt.getDate()+1)
				}
    			this.$store.commit('setDays', arr)
			}
		},
		closePopup(event) {
			const target = event.target.closest('.date-input');
			target.querySelector('.mx-datepicker-popup').style.display = '';
			const nb = target.nextElementSibling ? target.nextElementSibling : target.previousElementSibling;
			nb.querySelector('.mx-datepicker-popup').style.display = 'none';
		},
		checkWeather() {
			if (this.time1 != null && this.time2 != null && Object.keys(this.placeInfo).length !== 0) {
				this.$router.push({ path: 'weather'})
			}
		}
    },
    mounted() {
		this.autocomplete = new google.maps.places.Autocomplete(
      		(this.$refs.autocomplete),
      		{types: ['geocode']}
		);
		this.getPlace();
	},
	computed: {
		startDate: function() {
			return this.time1 instanceof Date
		},
		endDate: function() {
			let date = new Date();
			if (this.time1 instanceof Date) {
				return new Date(this.time1.getTime() + (14 * 24 * 60 * 60 * 1000))
			}
			else return date
		},
	},
	components: { 
		DatePicker
	},
	watch: {
		time1: function() {
			if (this.time1 > this.time2) this.time2 = null;
			this.getDays();
		},
		time2: function() {
			this.getDays();
		}
	}
};
</script>

<style lang="scss">
.home {
	width: 100vw;
	max-width: 100%;
	height: 100vh;
}
.home-wrapper {
	width: 100%;
	height: 100%;
	padding-top: 140px;
	position: relative;
}
.home-img {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	overflow: hidden;
	img {
		height: auto !important;
    	width: auto !important;
    	min-height: 100% !important;
    	min-width: 100% !important;
	}
}
.home-inner {
	max-width: 900px;
	margin: 0 auto;
	display: flex;
	justify-content: flex-end;
}
.home-content {
	background: #FFFDAC;
	color: #229ad6;
    border-radius: 4px;
    padding: 32px;
	padding-bottom: 24px;
	width: 100%;
    max-width: 460px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
	h1 {
		margin: 0;
	}
	label {
		text-transform: uppercase;
		margin-bottom: 5px;
		font-size: 14px;
		font-weight: 700;
	}
}
.place-wrapper {
	width: 100%;
	display: flex;
	flex-direction: column;
	margin-bottom: 20px;
}
.search-location {
	display: inline-block;
    height: 34px;
    padding: 6px 30px;
    padding-left: 10px;
    font-size: 14px;
    line-height: 1.4;
    color: #555;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
	box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}
.date-wrapper {
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
}
.date-input {
	display: flex;
	flex-direction: column;
	width: 49%;
	&__picker {
		width: 100%!important;
		&_from {
			.mx-datepicker-popup {
				left: 0!important;
			}
		}
	}
}
.link-wrapper {
	display: flex;
	justify-content: flex-end;
}
.button-link {
	background-color: #229ad6;
	padding: 9px 20px;
	display: inline-block;
	border-radius: 3px;
	text-decoration: none;
	font-size: 20px;
	color: #fff;
	border: none;
	outline: none;
	cursor: pointer;
}
@media only screen and (max-width: 991px) {
	.home-inner {
		padding-right: 50px;
	}
}
@media only screen and (max-width: 767px) {
	.home-inner {
		padding: 0 15px;
		justify-content: center;
	}
	.home-content {
		padding: 24px 16px;
		h1 {
			font-size: 24px;
		}
		h2 {
			font-size: 20px;
		}
	}
}
</style>
