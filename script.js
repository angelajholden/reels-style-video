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
