/*
 *
 *  rmoudgil
 *
 */
"use strict";
// An anonymous function that is executed passing "window" to the
// parameter "exports".  That is, it exports startApp to the window
// environment.
(function (exports) {
	var client_id = '2beb216078f74bed86536f34fc92e9c9'; // Fill in with your value from Spotify
	var redirect_uri = 'http://localhost:3000/index.html';
	var g_access_token = '';

	//SEARCH VIEW start
	function SearchView(model, dataModel) {
		this.model = model;
		this.dataModel = dataModel;
		this.model.addObserver(this);
	}

	SearchView.prototype.notify = function (obj) {
		if (obj === undefined || obj.type !== "search-view") return;

		var that = this;

		var $search_button = $('#search-button');
		$search_button.off();
		var $radio_buttons = $('#search-page input[type="radio"]');
		$radio_buttons.off();

		var $results = $("#search-tracks");
		$radio_buttons.change(function () {

			$results.empty();

			that.dataModel.search("rating=" + this.value, function (tracks_db) {
				if (tracks_db.length === 0) return;

				var ids = [];
				tracks_db.forEach(function (track_url) {
					ids.push(track_url.id);
				});

				var idsList = ids.join();

				getTracks(idsList, function (tracks_obj) {
					var tracks = tracks_obj.tracks;

					console.log(tracks.length);
					tracks.forEach(function (track) {

						var $item_inner = $('<div class="list-item-inner"></div>');

						// Get song name
						var $title = $('<div class="list-item-title">' + track.name + ' - ' + track.album.name + '</div>');

						var artists = getArtists(track.artists);

						var $sub_title = $('<div class="list-item-subtitle">' + artists + '</div>');

						$item_inner.append($title);
						$item_inner.append($sub_title);

						// Get the playlist image
						var $item_image = $('<div class="list-item-image"></div>');
						if (track.album.images === undefined || track.album.images.length == 0) {
							$item_image.append('<img>');
						} else {
							var $image = $('<div class="list-item-image"><img src="' + track.album.images[0].url + '"></div>');
							$item_image.append($image);
						}

						// Build html object
						var $li = $('<li></li>');
						var $item = $('<a class="list-item"></a>');

						$item.on('click', function () {
							var newState = {
								dont_update: false,
								view: "track",
								track: track
							};
							that.model.navigateContent(newState);
							history.pushState(newState, "");
						});
						$item.append($item_image);
						$item.append($item_inner);
						$li.append($item);

						console.log("appended");
						$results.append($li);
					});
				});

			});
		});

		$search_button.on('click', function () {
			$results.empty();
			var tags = $("#search-tag").val().split(',');

			that.dataModel.getAll(function (tracksDB) {
				var ids = [];

				_.forEach(tracksDB, function (trackDB) {
					if (trackDB.tags !== undefined) {
						var inter = _.intersection(trackDB.tags, tags);
						if (typeof inter !== 'undefined' && inter.length > 0) {
							ids.push(trackDB.id);
						}
					}
				});

				var idsList = ids.join();
				getTracks(idsList, function (tracks_obj) {
					var tracks = tracks_obj.tracks;

					console.log(tracks.length);
					tracks.forEach(function (track) {

						var $item_inner = $('<div class="list-item-inner"></div>');

						// Get song name
						var $title = $('<div class="list-item-title">' + track.name + ' - ' + track.album.name + '</div>');

						var artists = getArtists(track.artists);

						var $sub_title = $('<div class="list-item-subtitle">' + artists + '</div>');

						$item_inner.append($title);
						$item_inner.append($sub_title);

						// Get the playlist image
						var $item_image = $('<div class="list-item-image"></div>');
						if (track.album.images === undefined || track.album.images.length == 0) {
							$item_image.append('<img>');
						} else {
							var $image = $('<div class="list-item-image"><img src="' + track.album.images[0].url + '"></div>');
							$item_image.append($image);
						}

						// Build html object
						var $li = $('<li></li>');
						var $item = $('<a class="list-item"></a>');

						$item.on('click', function () {
							var newState = {
								dont_update: false,
								view: "track",
								track: track
							};
							that.model.navigateContent(newState);
							history.pushState(newState, "");
						});
						$item.append($item_image);
						$item.append($item_inner);
						$li.append($item);

						console.log("appended");
						$results.append($li);
					});
				});

			});
		});
	};

	//TRACK VIEW start
	function TrackView(model, dataModel) {
		this.model = model;
		this.dataModel = dataModel;
		this.model.addObserver(this);
	}

	TrackView.prototype.notify = function (obj) {
		if (obj === undefined || obj.type != "selected-track") return;

		var that = this;

		var track = obj.track;

		$("#track-page .top-content").show();
		$("#track-page .loader-container").hide();
		$('#tag-selector').empty();
		var $rating_selector = $('#track-page input[type="radio"]');
		$rating_selector.off();
		$rating_selector.prop('checked', false);

		$("#track-title").text(track.name);
		var artists = getArtists(track.artists);
		console.log(artists);
		$("#track-artists").text(artists);

		if (track.album.images !== undefined || track.album.images.length !== 0) {
			$("#track-album-image").attr('src', track.album.images[0].url);
		}

		getAlbum(track.album.href + "/tracks", function (album_tracks) {
			console.log(album_tracks);

			var $album_tracks = $('#album-tracks');
			_.forEach(album_tracks, function (album_track) {
				// create a li, add it to #album-tracks

			});
		});

		var $tags = $('#tag-selector');

		var tags = [];
		var rating = "0";
		that.dataModel.exists(track.id, function (exists) {
			if (exists) {
				console.log("exists");
				that.dataModel.get(track.id, function (data) {
					if (data.tags === undefined) {
						tags = [];
					} else {
						tags = data.tags;
					}

					if (data.rating === undefined) {
						rating = "0";
					} else {
						rating = data.rating;
					}

					_.forEach(tags, function (tag) {
						var $tag = $('<div class="tag"><div class="tag-name">' + tag + '</div></div>');
						var $tag_delete = $('<i class="tag-delete material-icons">cancel</i>');
						$tag_delete.click(function (r) {
							var index = tags.indexOf(tag);
							if (index !== -1) {
								tags.splice(index, 1);
							}

							that.dataModel.update(track.id, {
								tags: tags
							}, function (r) {
								$tag.remove();
							});
						});
						$tag.append($tag_delete);
						$tags.prepend($tag);
					});

					// clear
					$('#track-page input[type="radio"][value=' + rating + ']').prop('checked', true);
				});
			} else {
				console.log("Doesnt exist");
				var update = {
					id: track.id,
					tags: [],
					rating: "0",
				}
				that.dataModel.post(update, null);
			}
		});

		var $add = $('<div class="tag"><i class="tag-add material-icons">add_circle</i></div>');
		$add.on('click', function () {
			var tag = prompt("Please enter the tag", "");
			if (tag != null) {

				tags.push(tag);
				that.dataModel.update(track.id, {
					tags: tags
				}, function (r) {
					var $tag = $('<div class="tag"><div class="tag-name">' + tag + '</div></div>');
					var $tag_delete = $('<i class="tag-delete material-icons">cancel</i>');

					$tag.append($tag_delete);
					$tag_delete.click(function (r) {
						var index = tags.indexOf(tag);
						if (index !== -1) {
							tags.splice(index, 1);
						}

						that.dataModel.update(track.id, {
							tags: tags
						}, function (r) {
							$tag.remove();
						});
					});
					$add.before($tag);
				});
			}
		});
		$tags.append($add);

		$rating_selector.change(function () {
			that.dataModel.update(track.id, {
				rating: this.value
			}, function (r) {});
		});
		// data
	};
	//close

	//PLAYLIST-VIEW start
	function PlaylistView(model, dataModel) {
		this.model = model;
		this.dataModel = dataModel;
		this.model.addObserver(this);
	}

	PlaylistView.prototype.notify = function (obj) {
		if (obj === undefined || obj.type !== "playlist-tracks") return;
		var that = this;

		var playlist = obj.playlist;
		var tracks = obj.tracks;

		$('#playlist-name').text(playlist.name);

		var $playlist_tracks = $('#playlist-tracks');
		$playlist_tracks.empty();

		$("#playlist-page .top-content").show();
		$("#playlist-page .loader-container").hide();

		_.forEach(tracks, function (track_obj, index) {
			var track = track_obj.track;

			var $item_inner = $('<div class="list-item-inner"></div>');

			// Get song name
			var $title = $('<div class="list-item-title">' + track.name + ' - ' + track.album.name + '</div>');

			var artists = getArtists(track.artists);

			var $sub_title = $('<div class="list-item-subtitle">' + artists + '</div>');

			$item_inner.append($title);
			$item_inner.append($sub_title);

			// Get the playlist image
			var $item_image = $('<div class="list-item-image"></div>');
			if (track.album.images === undefined || track.album.images.length == 0) {
				$item_image.append('<img>');
			} else {
				var $image = $('<div class="list-item-image"><img src="' + track.album.images[0].url + '"></div>');
				$item_image.append($image);
			}

			// Build html object
			var $li = $('<li></li>');
			var $item = $('<a class="list-item"></a>');

			$item.on('click', function () {
				var newState = {
					dont_update: false,
					view: "track",
					track: track
				};
				that.model.navigateContent(newState);
				history.pushState(newState, "");
			});
			$item.append($item_image);
			$item.append($item_inner);
			$li.append($item);

			$playlist_tracks.append($li);
		});
	};
	//close

	//MY-PLAYLISTS-VIEW start
	function MyPlaylistsView(model) {
		this.model = model;
		this.model.addObserver(this);
	}

	MyPlaylistsView.prototype.notify = function (obj) {
		if (obj.type === undefined || obj.type !== "my-playlists") return;
		var that = this;

		var playlists = obj.playlists;

		// Remove the loader and show our content
		$("#my-playlists-page .top-content").show();
		$("#my-playlists-page .loader-container").hide();

		_.forEach(playlists, (function (playlist, index) {

			var $item_inner = $('<div class="list-item-inner"></div>');
			var $title = $('<div class="list-item-title">' + playlist.name + '</div>');

			var numTracks = "";
			if (playlist.tracks.total == 1) {
				numTracks = "1 track";
			} else {
				numTracks = playlist.tracks.total + " tracks";
			}

			var $sub_title = $('<div class="list-item-subtitle">' + numTracks + '</div>');
			$item_inner.append($title);
			$item_inner.append($sub_title);

			// Get the playlist image
			var $item_image = $('<div class="list-item-image"></div>');
			if (playlist.images === undefined || playlist.images.length == 0) {
				$item_image.append('<img>');
			} else {
				var $image = $('<div class="list-item-image"><img src="' + playlist.images[0].url + '"></div>');
				$item_image.append($image);
			}

			// Build html object
			var $li = $('<li></li>');
			var $item = $('<a class="list-item"></a>');

			$item.on('click', function () {
				var newState = {
					dont_update: false,
					view: "playlist",
					playlist: playlist
				};
				that.model.navigateContent(newState);
				history.pushState(newState, "");
			});

			$item.append($item_image);
			$item.append($item_inner);
			$li.append($item);

			$('#playlists').append($li);

		}));

	};
	//close

	//NAVIGATION VIEW start
	function NavigationView(model) {
		this.model = model;
		this.model.addObserver(this);

		// Attach event handlers to the tab-bar
		$(".tab-link").on("click", function () {
			var newState = {
				dont_update: true,
				view: $(this).data("page")
			};

			model.navigateContent(newState);
			history.pushState(newState, "");
		});
	}

	NavigationView.prototype.notify = function (state) {
		// must be a valid state object
		if (state.view !== undefined) {
			// Clear
			$(".tab-link.active").removeClass("active");
			$(".page.active").removeClass("active");

			// Activate
			$(("#" + state.view + "-page")).addClass("active");
			$(("#" + state.view + "-tab")).addClass("active");

			// Loader
			if (!state.dont_update) {
				$(("#" + state.view + "-page .top-content")).hide();
				$(("#" + state.view + "-page .loader-container")).show();
			}
		}
	};
	//close

	//NAVIGATION MODEL start
	function NavigationModel() {
		this.observers = [];
		var that = this;

		// Add ourselves as "observers" to the window
		window.addEventListener('popstate', function (e) {
			e.state.dont_update = true;
			that.navigateContent(e.state);
		});
	}

	NavigationModel.prototype.addObserver = function (obs) {
		this.observers.push(obs);
	};

	NavigationModel.prototype.notify = function (arg) {
		this.observers.forEach(function (obs) {
			obs.notify(arg);
		});
	};

	NavigationModel.prototype.navigateContent = function (state) {
		if (!state) {
			return;
		} // if the state object exists

		// Notify the view and any observers that we're changing the view
		this.notify(state);

		var that = this;

		if (state.view === "my-playlists") {
			if (!state.dont_update) {
				getPlaylists(function (playlists) {

					var notification_object = {
						type: "my-playlists",
						playlists: playlists
					};

					that.notify(notification_object);
				});
			}
		} else if (state.view === "playlist") {
			if (!state.dont_update) {

				if (state.playlist === undefined) return;

				// URL of the tracks
				var href = state.playlist.tracks.href;
				getPlaylistTracks(href, function (tracks) {
					var notification_object = {
						type: "playlist-tracks",
						playlist: state.playlist,
						tracks: tracks
					};
					that.notify(notification_object);
				});
			}

		} else if (state.view === "track") {
			if (!state.dont_update) {

				if (state.track === undefined) return;

				var notification_object = {
					type: "selected-track",
					track: state.track
				};

				that.notify(notification_object);
			}
		} else {
			if (state.view === "search") {
				var notification_object = {
					type: "search-view",
					dont_update: state.dont_update
				}

				that.notify(notification_object);
			}
		}
	};
	//close

	//DATA MODEL start
	function DataModel() {
		this.observers = [];
	}

	DataModel.prototype.addObserver = function (obs) {
		this.observers.push(obs);
	};

	DataModel.prototype.notify = function (arg) {
		this.observers.forEach(function (obs) {
			obs.notify(arg);
		});
	};

	DataModel.prototype.exists = function (id, callback) {
		$.ajax("http://localhost:3000/demo/" + id, {
			type: "GET",
			success: function (r) {
				callback(true);
			},
			error: function (r) {
				callback(false);
			}
		});
	};

	DataModel.prototype.search = function (query, callback) {
		$.ajax("http://localhost:3000/demo?" + query, {
			type: "GET",
			success: function (r) {
				callback(r);
			},
			error: function (r) {
				callback(null);
			}
		});
	};

	DataModel.prototype.getAll = function (callback) {
		this.get("", callback);
	}

	DataModel.prototype.get = function (id, callback) {
		$.ajax("http://localhost:3000/demo/" + id, {
			type: "GET",
			success: function (r) {
				callback(r);
			},
			error: function (r) {
				callback(null);
			}
		});
	};

	DataModel.prototype.update = function (id, data, callback) {
		$.ajax("http://localhost:3000/demo/" + id, {
			type: "PATCH",
			contentType: "application/json",
			data: JSON.stringify(data),
			success: function (r) {
				console.log(r);
				callback(r);
			},
			error: function (r) {
				callback(null);
			}
		});
	};

	DataModel.prototype.post = function (data, callback) {
		$.post("http://localhost:3000/demo/", data, callback, "json");
	};
	//close

	// HELPER FUNCTIONS start
	/*
	 * Get the playlists of the logged-in user.
	 */
	function getAjaxCall(href, callback, items) {
		$.ajax(href, {
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + g_access_token
			},
			success: function (r) {
				if (items) {
					callback(r.items);
				} else {
					callback(r);
				}
			},
			error: function (r) {
				console.log("err");
				callback(null);
			}
		});
	}

	function getPlaylistTracks(href, callback) {
		console.log('getPlaylistTracks');
		getAjaxCall(href, callback, true);
	}

	function getAlbum(href, callback) {
		console.log('getAlbum');
		getAjaxCall(href, callback, false);
	}

	function getPlaylists(callback) {
		console.log('getPlaylists');
		var url = 'https://api.spotify.com/v1/me/playlists';
		getAjaxCall(url, callback, true);
	}

	function getTracks(ids, callback) {
		console.log("getTracks");
		var url = 'https://api.spotify.com/v1/tracks/?ids=' + ids;
		console.log("url: " + url);
		getAjaxCall(url, callback, false);
	}

	function getArtists(artists_obj) {
		// Get artists
		var artist_arr = [];
		artists_obj.forEach(function (artist) {
			artist_arr.push(artist.name);
		});
		return artist_arr.join(', ');
	}
	/*
	 * Redirect to Spotify to login.  Spotify will show a login page, if
	 * the user hasn't already authorized this app (identified by client_id).
	 *
	 */
	var doLogin = function (callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id + '&response_type=token' + '&scope=playlist-read-private' + '&redirect_uri=' + encodeURIComponent(redirect_uri);
		console.log("doLogin url = " + url);
		window.location = url;
	};
	//close

	/*
	 * What to do once the user is logged in.
	 */
	function loggedIn() {
		$('#login').hide();
		$('#tab-bar').show();
		$('#loggedin').show();

		// Post data to a server-side database.  See
		// https://github.com/typicode/json-server
		var now = new Date();
		$.ajax("http://localhost:3000/demo/access", {
			type: "PUT",
			contentType: "application/json",
			data: JSON.stringify({
				"msg": "accessed at " + now.toISOString()
			})
		});
	}

	/*
	 * Export startApp to the window so it can be called from the HTML's
	 * onLoad event.
	 */
	exports.startApp = function () {
		console.log('start app.');
		console.log('location = ' + location);
		// Parse the URL to get access token, if there is one.
		var hash = location.hash.replace(/#/g, '');
		var all = hash.split('&');
		var args = {};
		all.forEach(function (keyvalue) {
			var idx = keyvalue.indexOf('=');
			var key = keyvalue.substring(0, idx);
			var val = keyvalue.substring(idx + 1);
			args[key] = val;
		});
		console.log('args', args);
		if (typeof (args['access_token']) == 'undefined') {
			$('#start').click(function () {
				doLogin(function () {});
			});
			$('#login').show();
			$('#tab-bar').hide();
			$('#loggedin').hide();
		} else {
			g_access_token = args['access_token'];
			loggedIn();

			// Start the history from this state
			var initial_data = {
				dont_update: false,
				view: "my-playlists"
			};

			var navigationModel = new NavigationModel();
			var dataModel = new DataModel();
			var navigationView = new NavigationView(navigationModel);
			var myPlaylistsView = new MyPlaylistsView(navigationModel);
			var playlistView = new PlaylistView(navigationModel, dataModel);
			var trackView = new TrackView(navigationModel, dataModel);
			var searchView = new SearchView(navigationModel, dataModel);

			navigationModel.navigateContent(initial_data);
			history.replaceState(initial_data, "");

		}
	}
})(window);
