import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
		place: {
			latitude: null,
			longitude: null,
			place_id: null,
			name: null
		},
		days: [],
	},
    mutations: {
		setPlace(state, payload) {
			state.place.latitude = payload.latitude;
			state.place.longitude = payload.longitude;
			state.place.place_id = payload.place_id;
			state.place.name = payload.name;
		},
		setDays(state, days) {
			state.days = days;
		}
	},
    actions: {}
});
