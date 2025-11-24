import React, { useState, useEffect } from 'react'
import './App.css'
import emailjs from '@emailjs/browser'
import img1 from '../siteimages/hands.jpeg'
import img2 from '../siteimages/together.jpeg'
import img5 from '../siteimages/togetherthird.jpeg'
import placeImg from '../siteimages/place.jpg'
import ceremonyIcon from '../siteimages/brideandgroom.svg'
import foodIcon from '../siteimages/Foodsvg.svg'
import nightmodeIcon from '../siteimages/Nightmode.svg'
import telegramIcon from '../siteimages/Telegram.svg'
import instagramIcon from '../siteimages/Instagram.svg'
import whatsappIcon from '../siteimages/WhatsApp.svg'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    attendance: '',
    drinks: [],
    drinksOther: '',
    food: '',
    transfer: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [visibleSections, setVisibleSections] = useState(new Set())
  const [scrollY, setScrollY] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(0)
  const [sliderBounds, setSliderBounds] = useState({ min: 0, max: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)

  // Дата свадьбы: 7 августа 2026, 18:00
  const weddingDate = new Date('2026-08-07T18:00:00').getTime()

  const drinkLabels = {
    cognac: 'коньяк',
    redwine: 'красное вино',
    whitewine: 'белое вино',
    champagne: 'шампанское',
    vodka: 'водка',
    'non-alcoholic': 'безалкогольные напитки'
  };

  // Плавная прокрутка для навигации
  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      const navHeight = document.querySelector('.nav').offsetHeight
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navHeight - 20

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Отслеживание скролла для параллакса
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Анимация появления элементов при скролле
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]))
        }
      })
    }, observerOptions)

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = weddingDate - now

      if (distance > 0) {
        const totalDays = Math.floor(distance / (1000 * 60 * 60 * 24))
        const months = Math.floor(totalDays / 30)
        const days = totalDays % 30
        
        setTimeLeft({
          months: months,
          days: days,
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [weddingDate])

  // Вычисляем границы слайдера
  useEffect(() => {
    const updateBounds = () => {
      const slider = document.querySelector('.color-slider')
      const wrapper = document.querySelector('.color-slider-wrapper')
      if (slider && wrapper) {
        const max = 0
        const min = -(slider.scrollWidth - wrapper.offsetWidth)
        setSliderBounds({ min, max })
        // Ограничиваем текущую позицию границами
        setSliderPosition(prev => Math.max(min, Math.min(max, prev)))
      }
    }
    
    // Небольшая задержка для правильного расчета размеров
    setTimeout(updateBounds, 100)
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  const handleSliderMove = (direction) => {
    const cardWidth = 180 + 24 // ширина карточки + gap
    const moveDistance = cardWidth * 2 // перемещаем на 2 карточки
    
    if (direction === 'left') {
      setSliderPosition(prev => Math.min(sliderBounds.max, prev + moveDistance))
    } else {
      setSliderPosition(prev => Math.max(sliderBounds.min, prev - moveDistance))
    }
  }

  const formatPhoneNumber = (value) => {
    // Убираем все нецифровые символы
    const numbers = value.replace(/\D/g, '')
    
    // Если пусто, возвращаем пустую строку (пользователь еще не начал вводить)
    if (numbers.length === 0) {
      return ''
    }
    
    // Всегда начинаем с 7 (пользователь вводит со второй цифры)
    let formatted = numbers.startsWith('7') ? numbers : '7' + numbers
    
    // Ограничиваем до 11 цифр (7 + 10)
    formatted = formatted.slice(0, 11)
    
    // Форматируем: +7 (XXX) XXX XX XX
    if (formatted.length <= 1) {
      return `+${formatted}`
    } else if (formatted.length <= 4) {
      return `+7 (${formatted.slice(1)}`
    } else if (formatted.length <= 7) {
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4)}`
    } else if (formatted.length <= 9) {
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)} ${formatted.slice(7)}`
    } else {
      // Полный формат: +7 (XXX) XXX XX XX
      return `+7 (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)} ${formatted.slice(7, 9)} ${formatted.slice(9)}`
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      const currentValues = formData[name] || []
      if (checked) {
        setFormData({ ...formData, [name]: [...currentValues, value] })
      } else {
        setFormData({ ...formData, [name]: currentValues.filter(v => v !== value) })
      }
    } else if (type === 'radio' && name === 'drinks') {
      // Для "другое" в напитках используем радио
      if (value === 'other') {
        setFormData({ ...formData, drinks: ['other'], drinksOther: formData.drinksOther })
      } else {
        setFormData({ ...formData, [name]: value })
      }
    } else if (name === 'phone') {
      // Применяем маску для телефона
      const formatted = formatPhoneNumber(value)
      setFormData({ ...formData, [name]: formatted })
    } else {
      setFormData({ ...formData, [name]: value })
    }
    // Убираем ошибку при изменении поля
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
    if (formErrors.drinksOther && name === 'drinksOther') {
      setFormErrors({ ...formErrors, drinksOther: '' })
    }
  }

  const validatePhone = (phone) => {
    // Проверяем формат: +7 (XXX) XXX XX XX
    // Точный формат: +7, пробел, открывающая скобка, 3 цифры, закрывающая скобка, пробел, 3 цифры, пробел, 2 цифры, пробел, 2 цифры
    const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/
    // Также проверяем, что после удаления всех нецифровых символов остается 11 цифр, начинающихся с 7
    const cleaned = phone.replace(/\D/g, '')
    return phoneRegex.test(phone) && cleaned.length === 11 && cleaned.startsWith('7')
  }

  const validateForm = () => {
    const errors = {}
  
    if (!formData.name?.trim()) {
      errors.name = 'Поле обязательно для заполнения'
    }
    if (!formData.phone?.trim()) {
      errors.phone = 'Поле обязательно для заполнения'
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Введите корректный номер телефона'
    }
    if (!formData.attendance) {
      errors.attendance = 'Поле обязательно для заполнения'
    }
  
    const hasDrinks = formData.drinks.length > 0 || 
      (formData.drinks.includes('other') && formData.drinksOther?.trim())
    
    if (!hasDrinks) {
      errors.drinks = 'Выберите хотя бы один вариант или укажите свой'
    }
    if (formData.drinks.includes('other') && !formData.drinksOther?.trim()) {
      errors.drinksOther = 'Укажите свой вариант напитка'
    }
  
    if (!formData.food) {
      errors.food = 'Поле обязательно для заполнения'
    }
    if (!formData.transfer) {
      errors.transfer = 'Поле обязательно для заполнения'
    }
  
    // ✅ сетаем ошибки — но НЕ полагаемся на них сразу
    setFormErrors(errors)
    
    return errors // ← возвращаем для использования в handleSubmit
  }

  const scrollToError = (fieldName) => {
    const field = document.querySelector(`[name="${fieldName}"]`)
    if (field) {
      const formGroup = field.closest('.form-group')
      if (formGroup) {
        formGroup.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    const isValid = Object.keys(errors).length === 0
  
    if (!isValid) {
      // Скроллим к первому полю с ошибкой — используем errors, а не formErrors!
      setTimeout(() => {
        const firstError = Object.keys(errors)[0]
        if (firstError) {
          // Особый случай для attendance (радио-группа)
          if (firstError === 'attendance') {
            const attendanceField = document.querySelector('[name="attendance"]')
            const formGroup = attendanceField?.closest('.form-group')
            formGroup?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          } else {
            scrollToError(firstError)
          }
        }
      }, 100)
      return
    }
  
    
    // Формируем данные для отправки
    const drinksText = formData.drinks.length > 0 
    ? formData.drinks
        .filter(d => d !== 'other')
        .map(d => drinkLabels[d] || d) // ← переводим, fallback — оставляем как есть
        .join(', ') + 
      (formData.drinks.includes('other') && formData.drinksOther?.trim()
        ? `, другое: ${formData.drinksOther.trim()}`
        : '')
    : formData.drinksOther?.trim() || 'Не указано';
    
    const message = `Новая анкета от гостя:\n\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nПрисутствие: ${formData.attendance === 'yes' ? 'Я приду/мы придём' : 'К сожалению, меня не будет'}\nТрансфер: ${formData.transfer === 'yes' ? 'Да' : formData.transfer === 'no' ? 'Нет' : 'Не указано'}\nНапитки: ${drinksText}\nБлюда: ${formData.food === 'meat' ? 'Мясо' : formData.food === 'fish' ? 'Рыба' : 'Не указано'}`
    
    try {
      // Используем FormSubmit.co - работает с любыми почтами, включая Яндекс
      // Отправляем на основной email, копию на второй через _cc
      
      const formDataToSend = new FormData()
      formDataToSend.append('_subject', 'Новая анкета от гостя')
      formDataToSend.append('_cc', 'semeenowa.alexandra@yandex.ru') // Копия на второй email
      formDataToSend.append('_replyto', formData.phone) // Телефон для ответа
      formDataToSend.append('message', message)
      
      const response = await fetch('https://formsubmit.co/ajax/semeenowa.alexandra@gmail.com', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()
      
      if (data.success) {
        // Показываем модальное окно
        setShowModal(true)
        // НЕ обнуляем форму
        setFormErrors({})
      } else {
        throw new Error(data.message || 'Ошибка отправки')
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error)
      alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.')
    }
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <a href="#location" className="nav-link" onClick={(e) => handleNavClick(e, 'location')}>МЕСТО</a>
          <a href="#program" className="nav-link" onClick={(e) => handleNavClick(e, 'program')}>ПРОГРАММА</a>
          <a href="#dresscode" className="nav-link" onClick={(e) => handleNavClick(e, 'dresscode')}>ДРЕСС-КОД</a>
          <a href="#rsvp" className="nav-link" onClick={(e) => handleNavClick(e, 'rsvp')}>АНКЕТА</a>
          <a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, 'contact')}>КОНТАКТЫ</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="date">
        <div className="hero-image-wrapper">
          <img 
            src={img1} 
            alt="Даниил и Александра" 
            className="hero-image"
          />
        </div>
        <div className="hero-names-small">Д&А</div>
        <div className="hero-names-large">
          <div className="name-block">
            <span className="name-letter">Д</span>
            <span className="name-full">АНИИЛ</span>
          </div>
          <div className="name-block">
            <span className="name-letter">А</span>
            <span className="name-full">ЛЕКСАНДРА</span>
          </div>
        </div>
        <div className="hero-date-section">
          <div className="day">07</div>
          <div className="month-year">АВГУСТА<br />2026</div>
        </div>
      </section>

      <section className={`invitation-text-section ${visibleSections.has('invitation') ? 'visible' : ''}`} id="invitation">
        <div className="container">
          <p className="invitation-text fade-in-up">
            Дорогие гости!
          </p>
          <p className="invitation-text-main fade-in-up">
            Родные и друзья, мы приглашаем вас отпраздновать торжественное событие — нашу свадьбу! 
            Будем счастливы, если вы присоединитесь к нам в этот особенный день.
          </p>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className={`location ${visibleSections.has('location') ? 'visible' : ''}`}>
        <div className="container">
          <h2 className="section-title-location fade-in-up">ЛОКАЦИЯ</h2>
          <p className="location-text fade-in-up">
            Наш праздник пройдет в туристическом центре Яндова губа
          </p>
          <p className="location-address fade-in-up">
            <strong>Он находится по адресу: остров Ягры, г.Северодвинск</strong>
          </p>
          <div className="location-image-wrapper fade-in-up">
            <img src={placeImg} alt="Место проведения свадьбы" className="location-image" />
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className={`program ${visibleSections.has('program') ? 'visible' : ''}`}>
        <div className="container">
          <h2 className="section-title fade-in-up">Программа дня</h2>
          <p className="program-intro fade-in-up">
            День нашей свадьбы может стать одним из самых приятных дней не только для нас, но и для Вас!
          </p>
          <ul className="program-list">
            <li className="program-item fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="program-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="program-time">14:00</span>
              <span className="program-event">Сбор гостей</span>
            </li>
            <li className="program-item fade-in-up" style={{ animationDelay: '0.2s' }}>
              <span className="program-icon">
                <img src={ceremonyIcon} alt="Торжественная регистрация" style={{ width: '32px', height: '32px' }} />
              </span>
              <span className="program-time">15:00</span>
              <span className="program-event">Торжественная регистрация</span>
            </li>
            <li className="program-item fade-in-up" style={{ animationDelay: '0.3s' }}>
              <span className="program-icon">
                <img src={foodIcon} alt="Начало свадебного банкета" style={{ width: '32px', height: '32px' }} />
              </span>
              <span className="program-time">15:40</span>
              <span className="program-event">Начало свадебного банкета</span>
            </li>
            <li className="program-item fade-in-up" style={{ animationDelay: '0.4s' }}>
              <span className="program-icon">
                <img src={nightmodeIcon} alt="Завершение вечера" style={{ width: '32px', height: '32px' }} />
              </span>
              <span className="program-time">22:00</span>
              <span className="program-event">Завершение вечера</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Wishes Section */}
      <section className={`wishes ${visibleSections.has('wishes') ? 'visible' : ''}`} id="wishes">
        <div className="container">
          <h2 className="section-title fade-in-up">Пожелания</h2>
          <p className="wishes-text fade-in-up">
            Дорогие гости, мы хотим подарить вам вечер свободы от забот, поэтому свадьба пройдет без участия детей
          </p>
        </div>
      </section>

      {/* Image Section 3 */}
      <section className="image-section" id="image3">
        <div className="image-parallax">
          <img 
            src={img2} 
            alt="Свадебное фото" 
            className="section-image"
          />
        </div>
      </section>

      {/* Dress Code Section */}
      <section id="dresscode" className={`dresscode ${visibleSections.has('dresscode') ? 'visible' : ''}`}>
        <div className="container">
          <h2 className="section-title fade-in-up">Дресс-код</h2>
          <p className="dresscode-text fade-in-up">
            Для нас главное - ваше присутствие! Но мы будем очень признательны, если вы поддержите цветовую гамму нашего праздника:
          </p>
          <div className="color-slider-container fade-in-up">
            <button 
              className="slider-arrow slider-arrow-left"
              onClick={() => handleSliderMove('left')}
              aria-label="Предыдущий"
              disabled={sliderPosition >= 0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div 
              className="color-slider-wrapper"
              onMouseDown={(e) => {
                setIsDragging(true)
                setStartX(e.clientX - sliderPosition)
              }}
              onMouseMove={(e) => {
                if (!isDragging) return
                e.preventDefault()
                const newPosition = e.clientX - startX
                setSliderPosition(Math.max(sliderBounds.min, Math.min(sliderBounds.max, newPosition)))
              }}
              onMouseUp={() => {
                setIsDragging(false)
              }}
              onMouseLeave={() => {
                setIsDragging(false)
              }}
              onTouchStart={(e) => {
                setIsDragging(true)
                setStartX(e.touches[0].clientX - sliderPosition)
              }}
              onTouchMove={(e) => {
                if (!isDragging) return
                const newPosition = e.touches[0].clientX - startX
                setSliderPosition(Math.max(sliderBounds.min, Math.min(sliderBounds.max, newPosition)))
              }}
              onTouchEnd={() => {
                setIsDragging(false)
              }}
            >
              <div 
                className="color-slider"
                style={{ transform: `translateX(${sliderPosition}px)` }}
              >
                    <div className="color-card" style={{ backgroundColor: '#C69994' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#C69994' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Blush rose</div>
                          <div className="color-code">16-1325 TCX </div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#DABAB5' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#DABAB5' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Rosy</div>
                          <div className="color-code">15-1520 TCX </div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#E9D8E8' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#E9D8E8' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Lavender mist</div>
                          <div className="color-code">13-3207 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#F3D7CC' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#F3D7CC' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Blush peach</div>
                          <div className="color-code">13-1114 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>

                    <div className="color-card" style={{ backgroundColor: '#D1D9CC' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#D1D9CC' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Cabbage white</div>
                          <div className="color-code">14-0410 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#BFCABA' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#BFCABA' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Borrowed light</div>
                          <div className="color-code">17-0412 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#fff' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#fff',     border: '1px solid rgba(216, 216, 216, 0.2)' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">White</div>
                          <div className="color-code">11-0601 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#D8D8D8' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#D8D8D8' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Ice flow</div>
                          <div className="color-code">13-4102 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>

                    <div className="color-card" style={{ backgroundColor: '#D4E4F3' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#D4E4F3' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Ice blue</div>
                          <div className="color-code">13-4108 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#93B3CA' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#93B3CA' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Steel blue</div>
                          <div className="color-code">16-4120 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#F3EBD8' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#F3EBD8' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Soft ivory</div>
                          <div className="color-code">11-0607 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#F3EEEA' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#F3EEEA' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Soft ivory</div>
                          <div className="color-code">11-0605 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
                    <div className="color-card" style={{ backgroundColor: '#EDE3D7' }}>
                      <div className="color-card-frame">
                        <div className="color-block" style={{ backgroundColor: '#EDE3D7' }}></div>
                        <div className="color-text-block">
                          <div className="color-name">Southern sand</div>
                          <div className="color-code">12-0808 TCX</div>
                          <div className="color-brand">Mes couleurs</div>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
            <button 
              className="slider-arrow slider-arrow-right"
              onClick={() => handleSliderMove('right')}
              aria-label="Следующий"
              disabled={sliderPosition <= sliderBounds.min}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="rsvp">
        <div className="container">
          <h2 className="section-title">Анкета для гостей</h2>
          <p className="rsvp-intro">
            Просим ответить на пару важных для нас вопросов. Ответы помогут нам подготовить праздник по высшему разряду!
          </p>
          <p className="rsvp-deadline">
            <strong>Пожалуйста, заполните данную форму до 31 декабря 2025 года.</strong>
          </p>
          <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className={formErrors.name ? 'error-label' : ''}>Ваше имя и фамилия</label>
              <p className="form-hint">Если Вы будете с парой или семьей - укажите все имена через запятую</p>
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              <div className={formErrors.name ? 'error-group' : ''}>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className={formErrors.phone ? 'error-label' : ''}>Номер телефона</label>
              <p className="form-hint">Укажите ваш номер телефона для связи</p>
              {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              <div className={formErrors.phone ? 'error-group' : ''}>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+7 (999) 999 99 99"
                  className={formErrors.phone ? 'error' : ''}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className={formErrors.attendance ? 'error-label' : ''}>Подтвердите своё присутствие</label>
              <p className="form-hint">Выберите подходящий вариант</p>
              {formErrors.attendance && <span className="error-message">{formErrors.attendance}</span>}
              <div className={`radio-group ${formErrors.attendance ? 'error-group' : ''}`}>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="attendance" 
                    value="yes"
                    checked={formData.attendance === 'yes'}
                    onChange={handleInputChange}
                    required 
                  />
                  <span>Я приду/мы придём</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="attendance" 
                    value="no"
                    checked={formData.attendance === 'no'}
                    onChange={handleInputChange}
                    required 
                  />
                  <span>К сожалению, меня/нас не будет</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className={formErrors.drinks ? 'error-label' : ''}>Предпочитаемые напитки:</label>
              <p className="form-hint">Выберите подходящий вариант</p>
              {formErrors.drinks && <span className="error-message">{formErrors.drinks}</span>}
              <div className={`checkbox-group ${formErrors.drinks ? 'error-group' : ''}`}>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="champagne"
                    checked={formData.drinks.includes('champagne')}
                    onChange={handleInputChange}
                  />
                  <span>Шампанское</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="whitewine"
                    checked={formData.drinks.includes('whitewine')}
                    onChange={handleInputChange}
                  />
                  <span>Белое вино</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="redwine"
                    checked={formData.drinks.includes('redwine')}
                    onChange={handleInputChange}
                  />
                  <span>Красное вино</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="vodka"
                    checked={formData.drinks.includes('vodka')}
                    onChange={handleInputChange}
                  />
                  <span>Водка</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="cognac"
                    checked={formData.drinks.includes('cognac')}
                    onChange={handleInputChange}
                  />
                  <span>Коньяк</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="drinks" 
                    value="non-alcoholic"
                    checked={formData.drinks.includes('non-alcoholic')}
                    onChange={handleInputChange}
                  />
                  <span>Безалкогольные напитки</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="drinks" 
                    value="other"
                    checked={formData.drinks.includes('other')}
                    onChange={handleInputChange}
                  />
                  <span>Другое</span>
                </label>
              </div>
              {formData.drinks.includes('other') && (
                <div style={{ marginTop: '1rem' }}>
                  {formErrors.drinksOther && <span className="error-message">{formErrors.drinksOther}</span>}
                  <div className={formErrors.drinksOther ? 'error-group' : ''}>
                    <input 
                      type="text" 
                      name="drinksOther"
                      value={formData.drinksOther}
                      onChange={handleInputChange}
                      placeholder="Укажите свой вариант"
                      className={formErrors.drinksOther ? 'error' : ''}
                      style={{ width: '100%', padding: '0.85rem' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className={formErrors.food ? 'error-label' : ''}>Предпочитаемые блюда:</label>
              <p className="form-hint">Выберите подходящий вариант</p>
              {formErrors.food && <span className="error-message">{formErrors.food}</span>}
              <div className={`radio-group ${formErrors.food ? 'error-group' : ''}`}>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="food" 
                    value="meat"
                    checked={formData.food === 'meat'}
                    onChange={handleInputChange}
                  />
                  <span>Мясо</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="food" 
                    value="fish"
                    checked={formData.food === 'fish'}
                    onChange={handleInputChange}
                  />
                  <span>Рыба</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className={formErrors.transfer ? 'error-label' : ''}>Необходим ли Вам трансфер к месту мероприятия?</label>
              <p className="form-hint">Выберите подходящий вариант</p>
              {formErrors.transfer && <span className="error-message">{formErrors.transfer}</span>}
              <div className={`radio-group ${formErrors.transfer ? 'error-group' : ''}`}>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="transfer" 
                    value="yes"
                    checked={formData.transfer === 'yes'}
                    onChange={handleInputChange}
                  />
                  <span>Да</span>
                </label>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="transfer" 
                    value="no"
                    checked={formData.transfer === 'no'}
                    onChange={handleInputChange}
                  />
                  <span>Нет</span>
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">ОТПРАВИТЬ АНКЕТУ</button>
          </form>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Контакты</h2>
          <p className="contact-text">
            По всем вопросам дня торжества<br />
            можете смело обращаться к нашему организатору:
          </p>
          <p className="contact-name">Анастасия</p>
          <a href="tel:+79502586674" className="contact-phone">+7 (950) 258-66-74</a>
          <div className="contact-social">
            <a href="https://t.me/alexa_semyonova" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={telegramIcon} alt="Telegram" style={{ width: '32px', height: '32px' }} />
            </a>
            <a href="https://www.instagram.com/alexa_semyonova" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={instagramIcon} alt="Instagram" style={{ width: '32px', height: '32px' }} />
            </a>
            <a href="https://wa.me/79014861857" target="_blank" rel="noopener noreferrer" className="social-link">
              <img src={whatsappIcon} alt="WhatsApp" style={{ width: '32px', height: '32px' }} />
            </a>
          </div>
        </div>
      </section>

      {/* Image Section 4 */}
      {/* <section className="image-section">
        <img src={img5} alt="Свадебное фото" className="section-image" />
      </section> */}

      {/* Countdown Timer */}
      <section className={`countdown ${visibleSections.has('countdown') ? 'visible' : ''}`} id="countdown">
        <div className="countdown-background">
          <img src={img5} alt="Background" className="countdown-bg-image" />
        </div>
        <div className="container">
          <h2 className="countdown-title fade-in-up">До свадьбы осталось:</h2>
          <div className="countdown-grid">
            <div className="countdown-item fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="countdown-number animate-number">{timeLeft.months}</div>
              <div className="countdown-label">Месяцев</div>
            </div>
            <div className="countdown-item fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="countdown-number animate-number">{timeLeft.days}</div>
              <div className="countdown-label">Дней</div>
            </div>
            <div className="countdown-item fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="countdown-number animate-number">{timeLeft.hours}</div>
              <div className="countdown-label">Часов</div>
            </div>
            <div className="countdown-item fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="countdown-number animate-number">{timeLeft.minutes}</div>
              <div className="countdown-label">Минут</div>
            </div>
          </div>
          <p className="countdown-text fade-in-up">Будем с нетерпением ждать Вас на нашем празднике!</p>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">Спасибо!</h2>
            <p className="modal-text">Данные успешно отправлены!</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-text">Даниил & Александра</p>
        </div>
      </footer>
    </div>
  )
}

export default App
