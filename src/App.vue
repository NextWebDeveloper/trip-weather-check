<template>
    <div id="app">
        <router-view />
    </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Acme');
@import url('https://fonts.googleapis.com/css?family=Nunito:300,400,600');
@import "../node_modules/normalize.css/normalize.css";

#app {
    font-family: 'Acme', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	input {
		font-family: 'Nunito', sans-serif;
		font-weight: 600;
		&::placeholder {
			font-weight: 300;
			color: rgb(105, 105, 105);
		}
		&:focus {
			outline: none;
			border: 1px solid rgb(70, 159, 204);
		}
	}
}
</style>
