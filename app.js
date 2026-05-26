'use strict';

const body = document.body;
const topbar = document.getElementById('topbar');

let _openCatModalFn = null;

function isMobileViewport() {
  return window.innerWidth < 768;
}

const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
body.appendChild(overlay);

function closeMobileSidebar() {
  body.classList.remove('sidebar-open');
  overlay.classList.remove('active');
}

function syncSidebarState() {
  if (!isMobileViewport()) {
    closeMobileSidebar();
  }
}

const sidebar = document.getElementById('sidebar');
const sidebarPinBtn = document.getElementById('sidebarPinBtn');

if (sidebarPinBtn) {
  sidebarPinBtn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-pinned');
    const isPinned = sidebar.classList.contains('sidebar-pinned');
    sidebarPinBtn.title = isPinned ? 'Minimizar menu' : 'Fixar menu';
  });
}

overlay.addEventListener('click', closeMobileSidebar);

window.addEventListener('scroll', () => {
  topbar.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(0,87,184,.12)'
    : '0 1px 3px rgba(0,0,0,.06)';
}, { passive: true });

document.querySelectorAll('.topbar-nav > .nav-link, .topbar-nav > .nav-dropdown > .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

document.querySelectorAll('.sidebar-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');

    if (isMobileViewport()) {
      closeMobileSidebar();
    }
  });
});

document.querySelectorAll('.mobile-nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.mobile-nav-item').forEach((navItem) => navItem.classList.remove('active'));
    item.classList.add('active');
  });
});

window.addEventListener('resize', syncSidebarState, { passive: true });
syncSidebarState();

function initFullCalendar() {
  const calEl = $('#fullCalendar');
  if (calEl.length === 0) return;

  /* ── Modal state ── */
  const overlay  = document.getElementById('calModalOverlay');
  const titleIn  = document.getElementById('calEventTitle');
  const dateIn   = document.getElementById('calEventDate');
  const catIn    = document.getElementById('calEventCategory');
  const modalTtl = document.getElementById('calModalTitle');
  const delBtn   = document.getElementById('calModalDelete');
  const saveBtn  = document.getElementById('calModalSave');
  const closeBtn = document.getElementById('calModalClose');
  const cancelBtn = document.getElementById('calModalCancel');

  let _pendingSelect = null;
  let _editEvent     = null;

  function syncCategorySelect(selectedColor) {
    catIn.innerHTML = '';
    document.querySelector('.cal-chips')?.querySelectorAll('.cal-chip').forEach(chip => {
      const chipColor = chip.style.getPropertyValue('--chip-color').trim();
      const chipName  = chip.textContent.trim();
      if (!chipColor) return;
      const opt = document.createElement('option');
      opt.value       = chipColor;
      opt.textContent = chipName;
      catIn.appendChild(opt);
    });
    catIn.value = selectedColor;
    if (!catIn.value && catIn.options.length > 0) catIn.selectedIndex = 0;
  }

  function openModal({ title = '', date = '', color = '#2389d7', mode = 'add' } = {}) {
    syncCategorySelect(color);
    titleIn.value = title;
    dateIn.value  = date;
    modalTtl.textContent = mode === 'edit' ? 'Editar Evento' : 'Novo Evento';
    delBtn.style.display  = mode === 'edit' ? 'flex' : 'none';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => titleIn.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    _pendingSelect = null;
    _editEvent     = null;
  }

  saveBtn.addEventListener('click', () => {
    const title = titleIn.value.trim();
    if (!title) { titleIn.focus(); return; }
    const color = catIn.value;

    if (_editEvent) {
      _editEvent.title     = title;
      _editEvent.color     = color;
      _editEvent.textColor = '';
      _editEvent.borderColor = '';
      _editEvent.backgroundColor = '';
      calEl.fullCalendar('updateEvent', _editEvent);
    } else if (_pendingSelect) {
      calEl.fullCalendar('renderEvent', {
        title, start: _pendingSelect.start, end: _pendingSelect.end,
        allDay: true, color,
      }, true);
      calEl.fullCalendar('unselect');
    } else {
      calEl.fullCalendar('renderEvent', {
        title, start: moment().format('YYYY-MM-DD'),
        allDay: true, color,
      }, true);
    }
    closeModal();
  });

  delBtn.addEventListener('click', () => {
    if (_editEvent) calEl.fullCalendar('removeEvents', _editEvent._id);
    closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  calEl.fullCalendar({
    defaultView: 'month',
    handleWindowResize: true,
    height: 'auto',
    header: {
      left: 'prev,next today',
      center: '',
      right: '',
    },
    buttonText: { today: 'Hoje', month: 'Mês' },
    monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
    dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    events: [
      /* Feriado */
      { title: 'Feriado', start: '2026-05-01', color: '#e8a0a0', textColor: '#8b0000' },
      /* Grupo HDOC (azul) - toda segunda */
      { title: 'Reunião Gestão Negócios - 10:30', start: '2026-05-04', color: '#2389d7' },
      { title: 'Reunião Comitê Comercial - 14:30', start: '2026-05-04', color: '#2389d7' },
      { title: 'Reunião Gestão Negócios - 10:30', start: '2026-05-11', color: '#2389d7' },
      { title: 'Reunião Comitê Comercial - 14:30', start: '2026-05-11', color: '#2389d7' },
      { title: 'Reunião Gestão Negócios - 10:30', start: '2026-05-18', color: '#2389d7' },
      { title: 'Reunião Comitê Comercial - 14:30', start: '2026-05-18', color: '#2389d7' },
      { title: 'Reunião Gestão Negócios - 10:30', start: '2026-05-25', color: '#2389d7' },
      { title: 'Reunião Comitê Comercial - 14:30', start: '2026-05-25', color: '#2389d7' },
      /* Outros (cinza) - terças */
      { title: 'Reunião Gov de dados - 11h', start: '2026-05-05', color: '#5a6a7e' },
      { title: 'Reunião Comitê Contratos - 14h', start: '2026-05-05', color: '#5a6a7e' },
      { title: 'Reunião Comitê Contratos - 14h', start: '2026-05-12', color: '#5a6a7e' },
      { title: 'Reunião Comitê Contratos - 14h', start: '2026-05-19', color: '#5a6a7e' },
      { title: 'Reunião Comitê Contratos - 14h', start: '2026-05-26', color: '#5a6a7e' },
      /* COAPH (vermelho) */
      { title: 'Reunião CAD COAPH - 11h', start: '2026-05-06', color: '#e74c3c' },
      { title: 'Reunião CAD COAPH - 11h', start: '2026-05-20', color: '#e74c3c' },
      /* Grupo HDOC (azul) */
      { title: 'Reunião CAD Grupo HDOC - 11h', start: '2026-05-14', color: '#2389d7' },
      { title: 'Reunião CAD Grupo HDOC - 11h', start: '2026-05-28', color: '#2389d7' },
    ],
    editable: false,
    selectable: false,
    eventLimit: true,
    select(start, end) {
      _pendingSelect = { start, end };
      _editEvent = null;
      openModal({ date: start.format('YYYY-MM-DD'), mode: 'add' });
    },
    eventClick(event) {
      if (!document.querySelector('.cal-card-wrapper')?.classList.contains('edit-mode')) return;
      _editEvent = event;
      _pendingSelect = null;
      openModal({
        title: event.title,
        date: moment(event.start).format('YYYY-MM-DD'),
        color: event.color || '#2389d7',
        mode: 'edit',
      });
    },
    viewRender(view) {
      const title = view.title.toUpperCase();
      const el = document.getElementById('calMeetingMonth');
      if (el) el.textContent = title;
      const elModal = document.getElementById('calEditModalMonth');
      if (elModal) elModal.textContent = title;
      requestAnimationFrame(alignCalendarPanel);
    },
  });

  document.getElementById('calNewBtn')?.addEventListener('click', () => {
    _pendingSelect = null;
    _editEvent = null;
    openModal({ date: moment().format('YYYY-MM-DD'), mode: 'add' });
  });

  const calWrapper       = document.querySelector('.cal-card-wrapper');
  const editToggle       = document.getElementById('calEditToggle');
  const editModalOverlay = document.getElementById('calEditModalOverlay');
  const editModalClose   = document.getElementById('calEditModalClose');
  const editModalClose2  = document.getElementById('calEditModalClose2');
  const editModalConfirm = document.getElementById('calEditModalConfirm');
  const calNewBtnModal   = document.getElementById('calNewBtnModal');
  const mainChipsEl      = document.querySelector('.cal-chips');

  let _eventsSnapshot  = null;
  let _chipsSnapshot   = null;
  let _calOrigParent   = null;
  let _calNextSibling  = null;

  function syncModalChips() {
    const modalChipsEl = document.getElementById('calChipsInModal');
    const catOv = document.getElementById('calCatModalOverlay');
    if (!modalChipsEl || !mainChipsEl) return;
    modalChipsEl.innerHTML = mainChipsEl.innerHTML;
    modalChipsEl.querySelectorAll('.cal-chip').forEach((chip, i) => {
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', () => {
        const mainChip = mainChipsEl.querySelectorAll('.cal-chip')[i];
        if (mainChip && _openCatModalFn) _openCatModalFn(mainChip);
      });
    });
  }

  function moveCalendarToModal() {
    const calDomEl = document.getElementById('fullCalendar');
    const calSlot  = document.getElementById('calEditCalendarSlot');
    if (!calDomEl || !calSlot) return;
    _calOrigParent  = calDomEl.parentElement;
    _calNextSibling = calDomEl.nextSibling;
    calSlot.appendChild(calDomEl);
    calEl.fullCalendar('render');
  }

  function restoreCalendarPosition() {
    const calDomEl = document.getElementById('fullCalendar');
    const calSlot  = document.getElementById('calEditCalendarSlot');
    if (!calDomEl || !_calOrigParent) return;
    if (_calNextSibling) _calOrigParent.insertBefore(calDomEl, _calNextSibling);
    else _calOrigParent.appendChild(calDomEl);
    calEl.fullCalendar('render');
    _calOrigParent  = null;
    _calNextSibling = null;
  }

  function openEditModal() {
    _eventsSnapshot = calEl.fullCalendar('clientEvents').map(e => ({
      title: e.title,
      start: e.start.toISOString(),
      end: e.end ? e.end.toISOString() : null,
      allDay: e.allDay !== false,
      color: e.color || null,
      textColor: e.textColor || null,
    }));
    _chipsSnapshot = mainChipsEl ? mainChipsEl.innerHTML : '';
    syncModalChips();
    calEl.fullCalendar('option', 'editable', true);
    calEl.fullCalendar('option', 'selectable', true);
    calWrapper.classList.add('edit-mode');
    editToggle.classList.add('is-active');
    editModalOverlay.classList.add('is-open');
    editModalOverlay.setAttribute('aria-hidden', 'false');
    moveCalendarToModal();
  }

  function confirmEditModal() {
    restoreCalendarPosition();
    calEl.fullCalendar('option', 'editable', false);
    calEl.fullCalendar('option', 'selectable', false);
    calWrapper.classList.remove('edit-mode');
    editToggle.classList.remove('is-active');
    _eventsSnapshot = null;
    _chipsSnapshot  = null;
    editModalOverlay.classList.remove('is-open');
    editModalOverlay.setAttribute('aria-hidden', 'true');
  }

  function cancelEditModal() {
    restoreCalendarPosition();
    if (_eventsSnapshot) {
      calEl.fullCalendar('removeEvents');
      _eventsSnapshot.forEach(e => {
        const evt = { title: e.title, start: e.start, allDay: e.allDay };
        if (e.end) evt.end = e.end;
        if (e.color) evt.color = e.color;
        if (e.textColor) evt.textColor = e.textColor;
        calEl.fullCalendar('renderEvent', evt, true);
      });
    }
    if (mainChipsEl && _chipsSnapshot !== null) {
      mainChipsEl.innerHTML = _chipsSnapshot;
      mainChipsEl._attachChipListeners?.();
    }
    calEl.fullCalendar('option', 'editable', false);
    calEl.fullCalendar('option', 'selectable', false);
    calWrapper.classList.remove('edit-mode');
    editToggle.classList.remove('is-active');
    _eventsSnapshot = null;
    _chipsSnapshot  = null;
    editModalOverlay.classList.remove('is-open');
    editModalOverlay.setAttribute('aria-hidden', 'true');
  }

  editToggle?.addEventListener('click', openEditModal);
  editModalClose?.addEventListener('click', cancelEditModal);
  editModalClose2?.addEventListener('click', cancelEditModal);
  editModalConfirm?.addEventListener('click', confirmEditModal);
  editModalOverlay?.addEventListener('click', e => { if (e.target === editModalOverlay) cancelEditModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && editModalOverlay?.classList.contains('is-open')) cancelEditModal();
  });

  calNewBtnModal?.addEventListener('click', () => {
    _pendingSelect = null;
    _editEvent = null;
    openModal({ date: moment().format('YYYY-MM-DD'), mode: 'add' });
  });

  editModalOverlay._syncModalChips = syncModalChips;

  document.addEventListener('cal-category-delete', (e) => {
    const deletedColor = e.detail.color;
    calEl.fullCalendar('clientEvents').forEach(ev => {
      if (ev.color === deletedColor || ev.textColor === deletedColor) {
        ev.color     = '#dde4ed';
        ev.textColor = '#8a9db5';
        calEl.fullCalendar('updateEvent', ev);
      }
    });
  });

  document.addEventListener('cal-category-update', (e) => {
    const { oldColor, newColor } = e.detail;
    calEl.fullCalendar('clientEvents').forEach(ev => {
      let changed = false;
      if (ev.color === oldColor)     { ev.color     = newColor; changed = true; }
      if (ev.textColor === oldColor) { ev.textColor = newColor; changed = true; }
      if (changed) calEl.fullCalendar('updateEvent', ev);
    });
  });
}

function initFeatureCarousels() {
  document.querySelectorAll('.feature-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.feature-track');
    const prevBtn = carousel.querySelector('.feature-arrow-prev');
    const nextBtn = carousel.querySelector('.feature-arrow-next');
    const dotsWrap = carousel.querySelector('.feature-dots');

    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    let index = 0;

    function getSlides() {
      return Array.from(carousel.querySelectorAll('.person-card'));
    }

    function renderDots(slides) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, dotIndex) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `feature-dot${dotIndex === index ? ' is-active' : ''}`;
        dot.setAttribute('aria-label', `Ir para o card ${dotIndex + 1}`);
        dot.addEventListener('click', () => {
          index = dotIndex;
          updateCarousel();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function updateCarousel() {
      const slides = getSlides();
      if (slides.length === 0) {
        track.style.transform = 'translateX(0)';
        dotsWrap.innerHTML = '';
        return;
      }
      if (index >= slides.length) index = slides.length - 1;
      track.style.transform = `translateX(-${index * 100}%)`;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      renderDots(slides);
    }

    let autoId = null;

    function startAutoplay() {
      autoId = window.setInterval(() => {
        const slides = getSlides();
        if (slides.length === 0) return;
        index = (index + 1) % slides.length;
        updateCarousel();
      }, 5000);
    }

    function restartAutoplay() {
      window.clearInterval(autoId);
      startAutoplay();
    }

    prevBtn.addEventListener('click', () => {
      const slides = getSlides();
      if (slides.length === 0) return;
      index = (index - 1 + slides.length) % slides.length;
      updateCarousel();
      restartAutoplay();
    });

    nextBtn.addEventListener('click', () => {
      const slides = getSlides();
      if (slides.length === 0) return;
      index = (index + 1) % slides.length;
      updateCarousel();
      restartAutoplay();
    });

    carousel.addEventListener('mouseenter', () => window.clearInterval(autoId));
    carousel.addEventListener('mouseleave', restartAutoplay);

    carousel._refreshCarousel = updateCarousel;
    updateCarousel();
    startAutoplay();
  });
}

function initHeroCarousel() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const prevBtn = slider.querySelector('.hero-arrow-prev');
  const nextBtn = slider.querySelector('.hero-arrow-next');
  const dotsWrap = slider.querySelector('.hero-dots');

  if (!prevBtn || !nextBtn || !dotsWrap || slides.length === 0) return;

  let index = 0;
  let autoplayId = null;

  function renderDots() {
    dotsWrap.innerHTML = '';

    slides.forEach((_, dotIndex) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `hero-dot${dotIndex === index ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Ir para o banner ${dotIndex + 1}`);
      dot.addEventListener('click', () => {
        index = dotIndex;
        updateHero();
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function updateHero() {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    renderDots();
  }

  function goToNext() {
    index = (index + 1) % slides.length;
    updateHero();
  }

  function goToPrev() {
    index = (index - 1 + slides.length) % slides.length;
    updateHero();
  }

  function startAutoplay() {
    autoplayId = window.setInterval(goToNext, 5000);
  }

  function restartAutoplay() {
    window.clearInterval(autoplayId);
    startAutoplay();
  }

  prevBtn.addEventListener('click', () => {
    goToPrev();
    restartAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    goToNext();
    restartAutoplay();
  });

  slider.addEventListener('mouseenter', () => {
    window.clearInterval(autoplayId);
  });

  slider.addEventListener('mouseleave', () => {
    restartAutoplay();
  });

  updateHero();
  startAutoplay();
}

function observeEntrance() {
  const targets = document.querySelectorAll('.feature-card, .update-card, .calendar-main-area');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(12px)';
    element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    io.observe(element);
  });
}

function initMediaManager() {
  const overlay    = document.getElementById('mediaModalOverlay');
  const grid       = document.getElementById('mediaGrid');
  const titleEl    = document.getElementById('mediaModalTitle');
  const fileInput  = document.getElementById('mediaFileInput');
  const closeBtn   = document.getElementById('mediaModalClose');
  const closeBtn2  = document.getElementById('mediaModalClose2');
  const confirmBtn = document.getElementById('mediaModalConfirm');

  if (!overlay) return;

  let _track    = null;
  let _cardClass = '';
  let _snapshot  = null;

  function openModal(carouselKey) {
    const carousel = document.querySelector(`.feature-carousel[data-carousel="${carouselKey}"]`);
    if (!carousel) return;
    _track     = carousel.querySelector('.feature-track');
    _cardClass = carouselKey === 'birthday' ? 'person-card-birthday' : 'person-card-tenure';
    titleEl.textContent = carouselKey === 'birthday' ? 'Aniversariantes' : 'Tempo de Empresa';
    _snapshot = Array.from(_track.children).map(child => child.cloneNode(true));
    renderGrid();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function confirmModal() {
    _snapshot = null;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    _track = null;
  }

  function cancelModal() {
    if (_track && _snapshot) {
      _track.innerHTML = '';
      _snapshot.forEach(node => _track.appendChild(node));
      const featureCarousel = _track.closest('.feature-carousel');
      if (featureCarousel && featureCarousel._refreshCarousel) featureCarousel._refreshCarousel();
    }
    _snapshot = null;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    _track = null;
  }

  let _dragSrc = null;

  function makeDraggable(thumb) {
    thumb.draggable = true;
    thumb.addEventListener('dragstart', e => {
      _dragSrc = thumb;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => thumb.classList.add('is-dragging'), 0);
    });
    thumb.addEventListener('dragend', () => {
      thumb.classList.remove('is-dragging');
      grid.querySelectorAll('.media-thumb').forEach(t => t.classList.remove('drag-over'));
      syncTrackOrder();
    });
    thumb.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (thumb !== _dragSrc) {
        grid.querySelectorAll('.media-thumb').forEach(t => t.classList.remove('drag-over'));
        thumb.classList.add('drag-over');
      }
    });
    thumb.addEventListener('drop', e => {
      e.preventDefault();
      if (_dragSrc && _dragSrc !== thumb) {
        const thumbs = [...grid.querySelectorAll('.media-thumb')];
        const srcIdx  = thumbs.indexOf(_dragSrc);
        const destIdx = thumbs.indexOf(thumb);
        if (srcIdx < destIdx) grid.insertBefore(_dragSrc, thumb.nextSibling);
        else grid.insertBefore(_dragSrc, thumb);
      }
    });
  }

  function syncTrackOrder() {
    if (!_track) return;
    const imgs = [...grid.querySelectorAll('.media-thumb img')];
    const cards = [..._track.querySelectorAll('.person-card')];
    imgs.forEach((img, i) => {
      const card = cards.find(c => c.querySelector('img')?.src === img.src);
      if (card) _track.appendChild(card);
    });
  }

  function makeThumb(img, card) {
    const thumb = document.createElement('div');
    thumb.className = 'media-thumb';
    const i = document.createElement('img');
    const srcImg = img || card.querySelector('img');
    i.src = srcImg.getAttribute('src') || srcImg.src;
    i.alt = srcImg.alt || '';
    const del = document.createElement('button');
    del.className = 'media-thumb-del';
    del.title = 'Remover';
    del.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    del.addEventListener('click', () => {
      (img ? img.closest('.person-card') : card).remove();
      thumb.remove();
      if (_track) {
        const featureCarousel = _track.closest('.feature-carousel');
        if (featureCarousel && featureCarousel._refreshCarousel) featureCarousel._refreshCarousel();
      }
    });
    thumb.appendChild(i);
    thumb.appendChild(del);
    makeDraggable(thumb);
    return thumb;
  }

  function renderGrid() {
    grid.innerHTML = '';
    if (!_track) return;
    _track.querySelectorAll('.person-card-photo img').forEach(img => {
      grid.appendChild(makeThumb(img, null));
    });
  }

  fileInput.addEventListener('change', () => {
    Array.from(fileInput.files).forEach(file => {
      const url = URL.createObjectURL(file);
      const card = document.createElement('article');
      card.className = `person-card ${_cardClass}`;
      card.innerHTML = `<div class="person-card-photo"><img src="${url}" alt="Imagem"></div>`;
      _track.appendChild(card);
      grid.appendChild(makeThumb(card.querySelector('img'), card));
    });
    fileInput.value = '';
  });

  closeBtn.addEventListener('click', cancelModal);
  closeBtn2.addEventListener('click', cancelModal);
  confirmBtn.addEventListener('click', confirmModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) cancelModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) cancelModal();
  });

  document.querySelectorAll('.feature-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.target));
  });
}

function alignCalendarPanel() {
  const dayHeader = document.querySelector('#fullCalendar .fc-day-header');
  const panel = document.querySelector('.calendar-panel');
  const fullwrap = document.querySelector('.calendar-fullwrap');
  if (!dayHeader || !panel || !fullwrap) return;
  const offset = dayHeader.getBoundingClientRect().top - fullwrap.getBoundingClientRect().top;
  panel.style.paddingTop = Math.max(0, offset) + 'px';
}

function initCategoryEditor() {
  const catOverlay  = document.getElementById('calCatModalOverlay');
  const mainChipsEl = document.querySelector('.cal-chips');
  const catNameIn   = document.getElementById('calCatName');
  const colorGrid   = document.getElementById('calColorGrid');
  const catSaveBtn   = document.getElementById('calCatModalSave');
  const catDelBtn    = document.getElementById('calCatModalDelete');
  const catCloseBtn  = document.getElementById('calCatModalClose');
  const catCancelBtn = document.getElementById('calCatModalCancel');

  if (!catOverlay) return;

  let _chip = null;
  let _color = null;

  function openCatModal(chip) {
    _chip  = chip;
    _color = chip.style.getPropertyValue('--chip-color').trim();
    catNameIn.value = chip.textContent.trim();
    catDelBtn.style.display = 'flex';

    colorGrid.querySelectorAll('.cal-color-swatch').forEach(sw => {
      sw.classList.toggle('is-selected', sw.dataset.color === _color);
    });

    catOverlay.classList.add('is-open');
    catOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => catNameIn.focus(), 50);
  }

  function closeCatModal() {
    catOverlay.classList.remove('is-open');
    catOverlay.setAttribute('aria-hidden', 'true');
    _chip = null;
    _color = null;
  }

  colorGrid.querySelectorAll('.cal-color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      colorGrid.querySelectorAll('.cal-color-swatch').forEach(s => s.classList.remove('is-selected'));
      sw.classList.add('is-selected');
      _color = sw.dataset.color;
    });
  });

  catSaveBtn.addEventListener('click', () => {
    const name = catNameIn.value.trim();
    if (!name) { catNameIn.focus(); return; }

    if (_chip) {
      const oldColor = _chip.style.getPropertyValue('--chip-color').trim();
      const newColor = _color;
      _chip.style.setProperty('--chip-color', newColor);
      _chip.textContent = name;
      if (oldColor && oldColor !== newColor) {
        document.dispatchEvent(new CustomEvent('cal-category-update', { detail: { oldColor, newColor } }));
      }
    } else {
      const newChip = document.createElement('div');
      newChip.className = 'cal-chip';
      newChip.style.setProperty('--chip-color', _color);
      newChip.textContent = name;
      newChip.style.cursor = 'pointer';
      newChip.addEventListener('click', () => openCatModal(newChip));
      mainChipsEl.appendChild(newChip);
    }
    closeCatModal();
    document.getElementById('calEditModalOverlay')?._syncModalChips?.();
  });

  catCloseBtn.addEventListener('click', closeCatModal);
  catCancelBtn.addEventListener('click', closeCatModal);
  catOverlay.addEventListener('click', e => { if (e.target === catOverlay) closeCatModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && catOverlay.classList.contains('is-open')) closeCatModal();
  });

  document.querySelectorAll('.cal-chip').forEach(chip => {
    chip.style.cursor = 'pointer';
    chip.addEventListener('click', () => openCatModal(chip));
  });

  document.getElementById('calAddCatBtn')?.addEventListener('click', () => {
    _chip = null;
    _color = '#2389d7';
    catNameIn.value = '';
    colorGrid.querySelectorAll('.cal-color-swatch').forEach(sw => {
      sw.classList.toggle('is-selected', sw.dataset.color === _color);
    });
    catDelBtn.style.display = 'none';
    catOverlay.classList.add('is-open');
    catOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => catNameIn.focus(), 50);
  });

  catDelBtn.addEventListener('click', () => {
    if (_chip) {
      const deletedColor = _color;
      _chip.remove();
      closeCatModal();
      document.getElementById('calEditModalOverlay')?._syncModalChips?.();
      if (deletedColor) {
        document.dispatchEvent(new CustomEvent('cal-category-delete', { detail: { color: deletedColor } }));
      }
    } else {
      closeCatModal();
    }
  });

  document.getElementById('calAddCatBtnModal')?.addEventListener('click', () => {
    _chip = null;
    _color = '#2389d7';
    catNameIn.value = '';
    colorGrid.querySelectorAll('.cal-color-swatch').forEach(sw => {
      sw.classList.toggle('is-selected', sw.dataset.color === _color);
    });
    catDelBtn.style.display = 'none';
    catOverlay.classList.add('is-open');
    catOverlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => catNameIn.focus(), 50);
  });

  catOverlay._openForChip = openCatModal;
  _openCatModalFn = openCatModal;

  if (mainChipsEl) {
    mainChipsEl._attachChipListeners = () => {
      mainChipsEl.querySelectorAll('.cal-chip').forEach(chip => {
        chip.style.cursor = 'pointer';
        chip.addEventListener('click', () => openCatModal(chip));
      });
    };
  }
}

initHeroCarousel();
initFeatureCarousels();
initMediaManager();
initCategoryEditor();
if (document.readyState === 'complete') {
  initFullCalendar();
} else {
  window.addEventListener('load', initFullCalendar);
}

requestAnimationFrame(() => {
  setTimeout(observeEntrance, 100);
});

console.log('%cPortal HDOC Saúde', 'font-size:16px;font-weight:bold;color:#0057B8');
