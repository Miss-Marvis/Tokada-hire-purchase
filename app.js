// Infinite Slider with improved performance
const sliderTrack = document.querySelector('.slider-track')
const imageItems = document.querySelectorAll('.image-item')

if (sliderTrack && imageItems.length > 0) {
	const clonedItems = Array.from(imageItems).map((item) => item.cloneNode(true))
	clonedItems.forEach((item) => sliderTrack.appendChild(item))

	let position = 0
	let animationId
	let isPaused = false

	function moveSlider() {
		if (!isPaused) {
			position -= 1

			if (Math.abs(position) >= sliderTrack.scrollWidth / 2) {
				position = 0
			}

			sliderTrack.style.transform = `translateX(${position}px)`
		}
		animationId = requestAnimationFrame(moveSlider)
	}

	const sliderObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				isPaused = !entry.isIntersecting
			})
		},
		{ threshold: 0.1 }
	)

	sliderObserver.observe(sliderTrack.parentElement)

	moveSlider()

	window.addEventListener('beforeunload', () => {
		if (animationId) {
			cancelAnimationFrame(animationId)
		}
		sliderObserver.disconnect()
	})
}

//Counter animation
function animateCounter(element) {
	if (!element) return

	const target = parseInt(element.dataset.target, 10) || 0
	const suffix = element.dataset.suffix || ''
	let count = 0
	const duration = 2000
	const steps = 60
	const increment = target / steps
	const stepDuration = duration / steps

	// Format number function with improved readability
	const formatNumber = (num) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
		}
		return Math.round(num)
	}

	// Optimization: Used requestAnimationFrame for smoother animation
	const startTime = performance.now()
	const endValue = target

	const updateCounter = (currentTime) => {
		const elapsedTime = currentTime - startTime
		const progress = Math.min(elapsedTime / duration, 1)
		const currentValue = Math.floor(progress * endValue)

		element.textContent = formatNumber(currentValue) + suffix

		if (progress < 1) {
			requestAnimationFrame(updateCounter)
		} else {
			element.textContent = formatNumber(endValue) + suffix
		}
	}

	requestAnimationFrame(updateCounter)
}

const counterObserver = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				animateCounter(entry.target)
				counterObserver.unobserve(entry.target)
			}
		})
	},
	{ threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
)

document.querySelectorAll('.stat-number').forEach((counter) => {
	counterObserver.observe(counter)
})

// testimonial slider
const testimonialSlider = {
	currentIndex: 0,
	slides: document.querySelectorAll('.slide'),
	container: document.querySelector('.slides'),
	interval: null,

	init() {
		if (!this.slides.length || !this.container) return

		this.showSlide(0)
		this.startAutoSlide()
		this.addControls()

		// Pause on hover
		this.container.parentElement.addEventListener('mouseenter', () =>
			this.stopAutoSlide()
		)
		this.container.parentElement.addEventListener('mouseleave', () =>
			this.startAutoSlide()
		)
	},

	showSlide(index) {
		const totalSlides = this.slides.length

		if (index >= totalSlides) {
			this.currentIndex = 0
		} else if (index < 0) {
			this.currentIndex = totalSlides - 1
		} else {
			this.currentIndex = index
		}

		const offset = -this.currentIndex * 100
		this.container.style.transform = `translateX(${offset}%)`
	},

	nextSlide() {
		this.showSlide(this.currentIndex + 1)
	},

	prevSlide() {
		this.showSlide(this.currentIndex - 1)
	},

	startAutoSlide() {
		this.interval = setInterval(() => this.nextSlide(), 5000)
	},

	stopAutoSlide() {
		clearInterval(this.interval)
	},

	addControls() {
		const dotsContainer = document.createElement('div')
		dotsContainer.className = 'slider-dots'

		for (let i = 0; i < this.slides.length; i++) {
			const dot = document.createElement('button')
			dot.className = 'slider-dot'
			dot.setAttribute('aria-label', `Go to slide ${i + 1}`)

			dot.addEventListener('click', () => {
				this.showSlide(i)
				this.stopAutoSlide()
				this.startAutoSlide()
			})

			dotsContainer.appendChild(dot)
		}

		this.container.parentElement.appendChild(dotsContainer)

		this.updateActiveDot()
	},

	updateActiveDot() {
		const dots = document.querySelectorAll('.slider-dot')
		dots.forEach((dot, i) => {
			if (i === this.currentIndex) {
				dot.classList.add('active')
			} else {
				dot.classList.remove('active')
			}
		})
	},
}

document.addEventListener('DOMContentLoaded', () => {
	testimonialSlider.init()

	document.querySelectorAll('.fade-in-element').forEach((el) => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('fade-in')
						observer.unobserve(entry.target)
					}
				})
			},
			{ threshold: 0.1 }
		)

		observer.observe(el)
	})
})

// form submission section

document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('contactForm')
	const submitButton = document.getElementById('submitButton')
	const loadingIndicator = document.getElementById('loadingIndicator')
	const successMessage = document.getElementById('successMessage')

	// Error elements
	const nameError = document.getElementById('nameError')
	const emailError = document.getElementById('emailError')
	const subjectError = document.getElementById('subjectError')
	const messageError = document.getElementById('messageError')

	// Form elements
	const nameInput = document.getElementById('name')
	const emailInput = document.getElementById('email')
	const subjectInput = document.getElementById('subject')
	const messageInput = document.getElementById('message')

	// Add event listeners for real-time validation
	nameInput.addEventListener('blur', validateName)
	emailInput.addEventListener('blur', validateEmail)
	subjectInput.addEventListener('change', validateSubject)
	messageInput.addEventListener('blur', validateMessage)

	// Form submission
	form.addEventListener('submit', function (event) {
		event.preventDefault()

		// Validate all fields before submission
		const isNameValid = validateName()
		const isEmailValid = validateEmail()
		const isSubjectValid = validateSubject()
		const isMessageValid = validateMessage()

		if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
			submitForm()
		}
	})

	function validateName() {
		const name = nameInput.value.trim()

		if (name === '') {
			nameError.textContent = 'Name is required'
			return false
		} else if (name.length < 2) {
			nameError.textContent = 'Name must be at least 2 characters'
			return false
		} else {
			nameError.textContent = ''
			return true
		}
	}

	function validateEmail() {
		const email = emailInput.value.trim()
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (email === '') {
			emailError.textContent = 'Email is required'
			return false
		} else if (!emailRegex.test(email)) {
			emailError.textContent = 'Please enter a valid email address'
			return false
		} else {
			emailError.textContent = ''
			return true
		}
	}

	function validateSubject() {
		const subject = subjectInput.value

		if (subject === '') {
			subjectError.textContent = 'Please select a subject'
			return false
		} else {
			subjectError.textContent = ''
			return true
		}
	}

	function validateMessage() {
		const message = messageInput.value.trim()

		if (message === '') {
			messageError.textContent = 'Message is required'
			return false
		} else if (message.length < 10) {
			messageError.textContent = 'Message must be at least 10 characters'
			return false
		} else {
			messageError.textContent = ''
			return true
		}
	}

	function submitForm() {
		// Show loading indicator
		loadingIndicator.style.display = 'inline-block'
		submitButton.disabled = true

		// Collect form data
		const formData = {
			name: nameInput.value.trim(),
			email: emailInput.value.trim(),
			subject: subjectInput.value,
			message: messageInput.value.trim(),
		}

		// Simulate form submission with a delay

		setTimeout(function () {
			console.log('Form Data:', formData)

			loadingIndicator.style.display = 'none'
			submitButton.disabled = false

			// Show success message
			successMessage.style.display = 'block'

			// Reset form
			form.reset()
			;('')

			setTimeout(function () {
				successMessage.style.display = 'none'
			}, 5000)
		}, 1500)
	}
})

//  FAQ functionality
const tabs = document.querySelectorAll('.tab')
const accordions = document.querySelectorAll('.accordion')

if (tabs.length && accordions.length) {
	const defaultTab = document.querySelector('.tab[data-category="general"]')
	if (defaultTab) defaultTab.classList.add('active')

	accordions.forEach((accordion) => {
		if (accordion.dataset.category === 'general') {
			accordion.style.display = 'block'
		} else {
			accordion.style.display = 'none'
		}
	})

	tabs.forEach((tab) => {
		tab.addEventListener('click', () => {
			tabs.forEach((t) => t.classList.remove('active'))

			tab.classList.add('active')

			const category = tab.dataset.category
			accordions.forEach((accordion) => {
				if (category === 'general' || accordion.dataset.category === category) {
					accordion.style.display = 'block'
				} else {
					accordion.style.display = 'none'
				}
			})
		})
	})

	// Accordion functionality
	const accordionHeaders = document.querySelectorAll('.accordion-header')

	accordionHeaders.forEach((header) => {
		header.addEventListener('click', () => {
			const accordion = header.parentElement
			const content = header.nextElementSibling

			accordion.classList.toggle('active')
			content.classList.toggle('active')

			const isExpanded = accordion.classList.contains('active')
			header.setAttribute('aria-expanded', isExpanded)

			accordionHeaders.forEach((otherHeader) => {
				if (otherHeader !== header) {
					otherHeader.parentElement.classList.remove('active')
					otherHeader.nextElementSibling.classList.remove('active')
					otherHeader.setAttribute('aria-expanded', 'false')
				}
			})
		})
	})
}
