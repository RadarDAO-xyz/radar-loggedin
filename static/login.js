if (getAccessToken() && getExpiresIn() > Date.now()) {
	document.location.pathname = "/profile-page";
}
