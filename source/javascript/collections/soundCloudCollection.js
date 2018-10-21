define(function (require) {
	var _ = require("underscore"),
	    Backbone = require("backbone");

	var SoundCloudCollection = Backbone.Collection.extend({
		name: "SoundCloud",
		description: "the world's largest community of sound creators.",
		siteURL: "https://soundcloud.com/",
		className: "soundcloud",
		url: "https://api.soundcloud.com/tracks.json",
		clientID: "92a7894544c99bb2ba74e6ded0f3945a",

		initialize: function (options) {
			this.defaultFetchOptions = options.defaultFetchOptions;
		},

		fixSoundURL: function (sound_url) {
			return sound_url + "?client_id=" + this.clientID;
		},

		parse: function (response) {
			var convertedResponse = [];

			_.each(response, function (sound) {
				if (!sound.streamable) {
					console.error("Skipping non-streamable SoundCloud sound:", sound); // eslint-disable-line no-console

					return;
				}

				convertedResponse.push({
					duration: sound.duration / 1000,
					id: sound.id,
					sound_url: this.fixSoundURL(sound.stream_url),
					source_name: this.name,
					source_url: sound.permalink_url,
					tags: sound.tag_list.split(" "),
					title: sound.title,
					user: { username: sound.user.username, url: sound.user.permalink_url }
				});
			}, this);

			return convertedResponse;
		},

		fetch: function (options) {
			var options = options || {};
			var existingData = options.data || {};
			options.data = {};

			options.data.filter = "streamable";
			options.data['duration[from]'] = 100;
			options.data['duration[to]'] = (existingData.duration || this.defaultFetchOptions.duration) * 1000;
			options.data.limit = existingData.limit || this.defaultFetchOptions.limit;
			options.data.client_id = this.clientID;

			if (existingData.page)
				options.data.offset = options.data.limit * (existingData.page - 1);

			if (existingData.search)
				options.data.q = existingData.search;

			return Backbone.Collection.prototype.fetch.call(this, options);
		}
	});

	return SoundCloudCollection;
});
