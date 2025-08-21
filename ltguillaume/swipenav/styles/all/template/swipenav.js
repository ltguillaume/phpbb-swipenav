if (phpbb.isTouch && !location.pathname.includes('/index.php')) {
	var swipe = {
		factor: 5,	// Used to determine minimal swiping distance and indicator offset

		pagination: document.querySelector('.action-bar .pagination'),
		offset: null,
		pageLinks: null,
		pageCurrent: null,
		pageCount: null,
		threshold: null,
		prev: null,
		next: null,
		startX: null,
		startY: null,
		deltaX: null,
		deltaY: null,
		indicatorShown: false,
		touchStart: false,

		calcThreshold: function() {
			this.threshold = Math.min(window.screen.height / this.factor, window.screen.width / this.factor);
		},

		createIndicator: function(direction) {
			let
				icon = direction == 'prev' ? 'chevron-left' : 'chevron-right',
				el = this[direction] = document.createElement('span');

			if (this.pageCurrent == 1 && direction == 'prev') {
				icon = location.pathname.includes('/viewtopic.php') ? 'list' : 'home';
			}

			el.className = direction +' swipe fa-stack';
			el.innerHTML = '<i class="fa-stack-2x fa-circle"></i><i class="fa-stack-1x fa-'+ icon +'"></i>';
			document.body.appendChild(el);
		},

		detectSwipe: function() {
			if (this.deltaY > this.threshold || Math.abs(this.deltaX) <= Math.max(this.deltaY, this.threshold)) {
				this.hideIndicator();
			} else if (this.prev && this.indicatorShown != this.next && this.deltaX < -this.threshold) {
				this.showIndicator(this.prev);
			} else if (this.next && this.indicatorShown != this.prev && this.deltaX >  this.threshold && this.pageCurrent < this.pageCount) {
				this.showIndicator(this.next);
			} else {
				this.hideIndicator();
			}
		},

		hideIndicator: function() {
			if (this.prev) {
				this.prev.classList.remove('show');
			}
			if (this.next) {
				this.next.classList.remove('show');
			}
		},

		showIndicator: function(direction) {
			if (direction.classList.contains('show')) {
				return;
			}

			this.indicatorShown = direction;
			direction.style.top = Math.max(10, this.startY - this.offset) +'px';
			direction.classList.add('show');
		},

		pageJump: function(direction) {
			const url = this.pagination.querySelector('a[rel='+ direction +']').href;
			location.replace(url +'#start_here');
		},

		init: function() {
			this.offset = 15 * this.factor * window.devicePixelRatio;
			this.pageLinks   = this.pagination ? this.pagination.querySelectorAll('li:not(.arrow)') : [];
			this.pageCurrent = this.pageLinks.length ? parseInt(this.pagination.querySelector('li.active').textContent) : 1;
			this.pageCount   = this.pageLinks.length ? parseInt(this.pageLinks[this.pageLinks.length - 1 ].textContent) : 1;

			this.calcThreshold();
			this.createIndicator('prev');
			if (this.pageCurrent < this.pageCount) {
				this.createIndicator('next');
			}

			window.onpageshow = e => {
				if (e.persisted) {
					this.hideIndicator();	// Hide indicator when returning via browser back button/OS back gesture
				}
			}

			window.ontouchstart = e => {
				if (e.touches.length !== 1 || window.visualViewport.scale > 1) {	// Multiple fingers or pinch-zoomed
					return;
				}
				this.touchStart = true;
				this.startX = e.changedTouches[0].screenX;
				this.startY = e.changedTouches[0].screenY;
				this.deltaX = this.deltaY = this.indicatorShown = false;
			}

			window.ontouchmove = e => {
				if (!this.touchStart || e.touches.length !== 1) {
					return;
				}
				this.deltaX = this.startX - e.changedTouches[0].screenX;
				this.deltaY = Math.abs(this.startY - e.changedTouches[0].screenY);
				this.detectSwipe();
			}

			window.ontouchcancel = () => {
				this.hideIndicator();
				this.touchStart = false;
			}

			window.ontouchend = e => {
				if (this.deltaY > this.threshold || Math.abs(this.deltaX) <= Math.max(this.deltaY, this.threshold)) {
					this.hideIndicator();
				} else if (this.prev && this.indicatorShown == this.prev && this.deltaX < -this.threshold && this.pageCurrent == 1) {
					if (location.pathname.includes('/viewtopic.php')) {
						document.querySelector('.crumb:last-of-type a').click();	// Forum index
					} else {
						document.querySelector('.crumb:first-of-type a').click();	// Site index
					}
				} else if (this.prev && this.indicatorShown == this.prev && this.deltaX < -this.threshold && this.pageCurrent > 1) {
					this.pageJump('prev');
				} else if (this.next && this.indicatorShown == this.next && this.deltaX >  this.threshold && this.pageCurrent < this.pageCount) {
					this.pageJump('next');
				}
				this.touchStart = false;
			}

			console.log('Swipe gestures:', this.prev ? 'Previous' : '', this.next ? '| Next' : ' ');
		},
	};

	swipe.init();
}