// Entry point: Initializes the reels video player functionality and UI
function initReels() {
	// Helper for selecting elements
	const $ = (sel, ctx = document) => ctx.querySelector(sel);
	const reelsEl = $("#reels");

	// ------- Config -------
	// Path to the JSON data describing the reels
	const DATA_URL = "data.json"; // same folder as index.html

	// ------- Global State -------
	let sections = []; // Array of reel section elements
	let videos = []; // Array of video elements
	let activeIndex = 0; // Index of currently active reel
	// Global mute state, persisted in localStorage (default: muted)
	let globalMuted = localStorage.getItem("reels_muted") === "false" ? false : true;

	// ------- Build UI from JSON -------
	// Fetch reels data and dynamically build the UI
	fetch(DATA_URL)
		.then((r) => {
			if (!r.ok) throw new Error(`Failed to load ${DATA_URL} (${r.status})`);
			return r.json();
		})
		.then((list) => {
			if (!Array.isArray(list) || list.length === 0) {
				throw new Error("JSON loaded but no reels found.");
			}

			// Build each reel section from JSON
			const frag = document.createDocumentFragment();
			list.forEach((item) => {
				const sec = document.createElement("section");
				sec.className = "reel";
				sec.dataset.id = item.id;

				const overlay = document.createElement("div");
				overlay.className = "overlay";
				overlay.innerHTML = `
					<div class="top">
						<button type="button">
							<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M328 112L184 256l144 144" /></svg>
						</button>
						<div class="title">Reels</div>
					</div>
					<article class="meta_container">
						<div class="author">
							<figure class="figure">
								<img src="profile.jpg" alt="Reels author profile image" />
							</figure>
							<div class="author_artist-container">
								<div class="reel_author">fiberandkraft</div>
								<div class="reel_artist">
									<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="musical_note" viewBox="0 0 512 512"><path d="M421.84 37.37a25.86 25.86 0 00-22.6-4.46L199.92 86.49A32.3 32.3 0 00176 118v226c0 6.74-4.36 12.56-11.11 14.83l-.12.05-52 18C92.88 383.53 80 402 80 423.91a55.54 55.54 0 0023.23 45.63A54.78 54.78 0 00135.34 480a55.82 55.82 0 0017.75-2.93l.38-.13 21.84-7.94A47.84 47.84 0 00208 423.91v-212c0-7.29 4.77-13.21 12.16-15.07l.21-.06L395 150.14a4 4 0 015 3.86v141.93c0 6.75-4.25 12.38-11.11 14.68l-.25.09-50.89 18.11A49.09 49.09 0 00304 375.92a55.67 55.67 0 0023.23 45.8 54.63 54.63 0 0049.88 7.35l.36-.12 21.84-7.95A47.83 47.83 0 00432 375.92V58a25.74 25.74 0 00-10.16-20.63z" /></svg>
									<div class="reel_scroll">
										<p class="reel_song">Just like U &mdash; The Wildcardz</p>
									</div>
								</div>
							</div>
						</div>
						<div class="caption"><p>Starting the spin with fresh roving — steady rhythm, soft twist.</p></div>
						<div class="like_comments">
							<figure class="figure">
								<img src="heidisheltie.jpg" alt="Reels commenter profile image" />
							</figure>
							<p>Liked by HeidiSheltie and 23 others.</p>
						</div>
					</article>
					<aside class="meta_sidebar">
						<div class="hearts meta_count-container">
							<span class="access-hidden">Number of Likes</span>
							<button type="button" aria-label="Tap heart to Like">
								<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0018 0c96.26-65.34 184.09-143.09 183-252.42-.54-52.67-42.32-96.81-95.08-96.81z" fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" /></svg>
							</button>
							<div class="meta_count">92</div>
						</div>
						<div class="comments meta_count-container">
							<span class="access-hidden">Number of Comments</span>
							<button type="button" aria-label="Tap to comment">
								<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M87.49 380c1.19-4.38-1.44-10.47-3.95-14.86a44.86 44.86 0 00-2.54-3.8 199.81 199.81 0 01-33-110C47.65 139.09 140.73 48 255.83 48 356.21 48 440 117.54 459.58 209.85a199 199 0 014.42 41.64c0 112.41-89.49 204.93-204.59 204.93-18.3 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.09 31.09 0 00-11.12-2.07 30.71 30.71 0 00-12.09 2.43l-67.83 24.48a16 16 0 01-4.67 1.22 9.6 9.6 0 01-9.57-9.74 15.85 15.85 0 01.6-3.29z" fill="none" stroke="" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" /></svg>
							</button>
							<div class="meta_count">6</div>
						</div>
						<div class="remix meta_count-container">
							<span class="access-hidden">Reels Remix</span>
							<button type="button" aria-label="Tap to Remix">
								<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512">
									<path fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 120l48 48-48 48" />
									<path d="M352 168H144a80.24 80.24 0 00-80 80v16M192 392l-48-48 48-48" fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
									<path d="M160 344h208a80.24 80.24 0 0080-80v-16" fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
								</svg>
							</button>
						</div>
						<div class="share meta_count-container">
							<span class="access-hidden">Share this Reel</span>
							<button type="button" aria-label="Tap to Share">
								<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M448 64L64 240.14h200a8 8 0 018 8V448z" fill="none" stroke="" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" /></svg>
							</button>
						</div>
						<div class="ellipsis meta_count-container">
							<span class="access-hidden">More about this Reel</span>
							<button type="button" aria-label="Tap to learn more about this Reel">
								<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512">
									<circle cx="256" cy="256" r="48" />
									<circle cx="416" cy="256" r="48" />
									<circle cx="96" cy="256" r="48" />
								</svg>
							</button>
						</div>
						<div class="cover_art meta_count-container">
							<figure class="figure">
								<img src="heidisheltie.jpg" alt="Artist album cover art" />
							</figure>
						</div>
					</aside>
				`;

				// Create mute button for each reel
				const btn = document.createElement("button");
				btn.className = "mute";
				btn.type = "button";
				btn.textContent = "🔇";
				btn.setAttribute("aria-pressed", "true");
				btn.setAttribute("aria-label", "Unmute");

				// Create video element for reel
				const v = document.createElement("video");
				v.setAttribute("playsinline", "");
				v.setAttribute("preload", "metadata");
				v.poster = item.video.poster;
				v.src = item.video.src;
				v.loop = true; // Enable looping for reels

				// Add captions track if available
				if (item.video.captions) {
					const track = document.createElement("track");
					track.kind = "captions";
					track.srclang = "en";
					track.label = "English";
					track.src = item.video.captions;
					// No "default" — user can toggle if CC button is added
					v.appendChild(track);
				}

				// Minimal left/right overlay hooks (optional, for future meta info)
				// You can add author/music/meta overlays here if desired

				sec.appendChild(overlay);
				sec.appendChild(btn);
				sec.appendChild(v);
				frag.appendChild(sec);
			});

			// Add all built sections to the main reels container
			reelsEl.appendChild(frag);

			// Cache references to all sections and videos after DOM insert
			sections = [...reelsEl.querySelectorAll(".reel")];
			videos = sections.map((s) => s.querySelector("video"));

			// Initialize audio UI/state now that videos exist
			applyGlobalMute();
			syncMuteButtons();

			// Wire up all interactive behavior
			setupIntersection(); // Play/pause based on visibility
			setupMuteButtons(); // Mute button click handling
			setupKeyboard(); // Keyboard navigation and controls
			setupPageVisibility(); // Pause/resume on tab visibility

			// Focus container so ↑/↓ keys work immediately
			reelsEl.tabIndex = 0;
			reelsEl.focus();

			// Warm the very first video (muted autoplay on intersect)
			// IntersectionObserver will handle play once it's ≥ 75% visible
		})
		.catch((err) => {
			// Show error message if reels fail to load
			console.error(err);
			reelsEl.innerHTML = `
				<div style="color:#fff; padding:1rem; font:16px system-ui, sans-serif;">
					<strong>Couldn’t load reels.</strong><br/>
					<code>${String(err.message || err)}</code>
				</div>`;
		});

	// ------- Helpers -------

	// Apply global mute state to all videos and persist to localStorage
	function applyGlobalMute() {
		videos.forEach((v) => (v.muted = globalMuted));
		localStorage.setItem("reels_muted", String(globalMuted));
	}

	// Update mute button icons and accessibility labels in each section
	function syncMuteButtons() {
		sections.forEach((sec) => {
			const btn = sec.querySelector(".mute");
			if (!btn) return;
			btn.textContent = globalMuted ? "🔇" : "🔊";
			btn.setAttribute("aria-pressed", String(!globalMuted));
			btn.setAttribute("aria-label", globalMuted ? "Unmute" : "Mute");
		});
	}

	// Pause all videos except the one at exceptIdx
	function pauseAll(exceptIdx) {
		videos.forEach((v, i) => {
			if (i !== exceptIdx) v.pause();
		});
	}

	// Preload the next video for smoother playback
	function warmNext(idx) {
		const next = videos[idx + 1];
		if (next && next.preload !== "auto") next.preload = "auto";
	}

	// ------- Behavior -------

	// Use IntersectionObserver to play/pause videos based on visibility
	function setupIntersection() {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
						const idx = sections.indexOf(entry.target);
						if (idx === -1) return;
						activeIndex = idx;

						const vid = videos[idx];
						pauseAll(idx); // Pause all others
						vid.muted = globalMuted; // Honor global audio state
						vid.play().catch(() => {}); // Safe on iOS if muted or after gesture
						warmNext(idx); // Preload next video
					}
				});
			},
			{ threshold: [0, 0.75, 1] }
		);

		// Observe each reel section for visibility changes
		sections.forEach((sec) => io.observe(sec));
	}

	// Add click event to mute button in each section to toggle global mute
	function setupMuteButtons() {
		sections.forEach((sec) => {
			const btn = sec.querySelector(".mute");
			btn?.addEventListener("click", () => {
				globalMuted = !globalMuted;
				applyGlobalMute();
				syncMuteButtons();
				// User gesture primes audio; ensure current video plays with new mute state
				videos[activeIndex]?.play().catch(() => {});
			});
		});
	}

	// Keyboard controls for navigation and playback:
	// ArrowUp/Down: navigate reels
	// Space/K: play/pause
	// M: toggle global mute
	function setupKeyboard() {
		reelsEl.addEventListener("keydown", (e) => {
			const vid = videos[activeIndex];
			if (!vid) return;

			if (e.key === "ArrowDown") {
				e.preventDefault();
				sections[Math.min(activeIndex + 1, sections.length - 1)].scrollIntoView({ behavior: "smooth", block: "start" });
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				sections[Math.max(activeIndex - 1, 0)].scrollIntoView({ behavior: "smooth", block: "start" });
			} else if (e.code === "Space" || e.key.toLowerCase() === "k") {
				e.preventDefault();
				vid.paused ? vid.play().catch(() => {}) : vid.pause();
			} else if (e.key.toLowerCase() === "m") {
				e.preventDefault();
				globalMuted = !globalMuted;
				applyGlobalMute();
				syncMuteButtons();
				videos[activeIndex]?.play().catch(() => {});
			}
		});
	}

	// Pause the active video when tab is hidden; resume when focused
	function setupPageVisibility() {
		document.addEventListener("visibilitychange", () => {
			const vid = videos[activeIndex];
			if (!vid) return;
			if (document.hidden) vid.pause();
			else vid.play().catch(() => {});
		});
	}
}

// Start reels functionality when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	initReels();
});
