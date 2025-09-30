function attachResize($slider, $track, init) {
    let resizeTimeout;
    let lastWidth = $(window).width();
    let id = $slider.attr('id');
    if (!id) {
        if (!$slider.data('uid')) {
            $slider.data('uid', 'slider-' + Math.random().toString(36).substr(2, 9));
        }
        id = $slider.data('uid');
    }
    let ns = `.resize-${id}`;
    $(window).off(`resize${ns} orientationchange${ns}`);
    $(window).on(`resize${ns} orientationchange${ns}`, function () {
        const newWidth = $(window).width();
        if (newWidth === lastWidth) return;
        lastWidth = newWidth;
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            $track.css('transition', 'none');
            init(0);
            requestAnimationFrame(() => {
                $track.css('transition', 'transform 0.5s ease');
            });
        }, 200);
    });
    init(0);
}
function CustomAppSlider(context = document) {
    const defaults = {
        direction: 'horizontal',
        autoplay: 3000,
        move: 1,
        pagination: true,
        loop: true,
        effect: 'slide',
        breakpoints: {},
        controls: true
    };
    function getSlidesPerView(breakpoints) {
        const w = $(window).width();
        let spv = null;
        Object.keys(breakpoints || {}).forEach(bp => {
            if (w >= parseInt(bp)) {
                spv = breakpoints[bp].slidesPerView;
            }
        });
        return spv || 1;
    }
    function getSettings(config) {
        let settings = { ...config };
        let w = $(window).width();

        if (config.breakpoints) {
            let bpKeys = Object.keys(config.breakpoints)
                .map(k => parseInt(k))
                .sort((a, b) => a - b);

            let activeBP = null;
            for (let k of bpKeys) {
                if (w >= k) activeBP = k;
            }

            if (activeBP !== null) {
                settings = { ...settings, ...config.breakpoints[activeBP] };
            }
        }
        return settings;
    }
    $(context).find('.cuz__slider').each(function () {
        const $slider = $(this);
        if ($slider.data("slider-initialized")) return;
        $slider.data("slider-initialized", true);
        let config = $slider.data("config") || {};
        try {
            config = JSON.parse($slider.attr('data-config'));
        } catch (e) {
            console.error('Invalid JSON in data-config:', e);
        }
        const settings = { ...defaults, ...config };
        const $track = $slider.find('.cuz__slider__track');
        let $slides = $slider.find('.cuz__slider__slide');
        const $pagination = $slider.find('.cuz__paginations');
        if ($slides.length <= 1) {
            $slider.addClass("single-slide");
            return;
        }
        let autoplayTimer;
        let idx = 0;
        let animating = false;
        let visible = 1;
        let pct = 100;
        function updateDots() {
            if (!$pagination.length) return;
            const settings = getSettings(config);
            const totalSlides = $slides.not('.cuz__slider__xr').length;
            let pageCount;
            if (settings.loop) {
                pageCount = totalSlides;
            } else {
                pageCount = Math.max(1, totalSlides - visible + 1);
            }
            const $dots = $pagination.find('.cuz__dot');
            $dots.removeClass('active medium').addClass('small');
            let dotIndex;
            if (settings.loop) {
                dotIndex = (idx - visible + totalSlides) % totalSlides;
            } else {
                dotIndex = idx;
            }
            $dots.eq(dotIndex).removeClass('small').addClass('active');
            if (dotIndex > 0) {
                $dots.eq(dotIndex - 1).removeClass('small').addClass('medium');
            }
            if (dotIndex < pageCount - 1) {
                $dots.eq(dotIndex + 1).removeClass('small').addClass('medium');
            }
            const $slider = $pagination.closest('.cuz__slider');
            $slider.parents('.khelo__tour__carousel__section, .aviator_main_sec')
                .removeClass('first-activated last-activated');

            if (dotIndex === 0) {
                $slider.parents('.khelo__tour__carousel__section, .aviator_main_sec')
                    .addClass('first-activated');
            } else if (dotIndex === pageCount - 1) {
                $slider.parents('.khelo__tour__carousel__section, .aviator_main_sec')
                    .addClass('last-activated');
            }
        }
        function clearAuto() {
            if (autoplayTimer) {
                clearTimeout(autoplayTimer);
                autoplayTimer = null;
            }
        }
        function startAuto() {
            clearAuto();
            if (settings.autoplay && typeof settings.autoplay === "number" && settings.autoplay > 0) {
                autoplayTimer = setTimeout(() => goTo(idx + 1), settings.autoplay);
            }
        }
        function goTo(index, fromDrag = false) {
            if (animating && !fromDrag) return;
            animating = true;
            let settings = getSettings(config);
            const totalSlides = $track.find('.cuz__slider__slide').not('.cuz__slider__xr').length;
            if (settings.effect === 'fade') {
                idx = (index + totalSlides) % totalSlides;
                $slides.css({
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    opacity: 0, zIndex: 0,
                    transition: 'opacity 0.5s ease'
                }).eq(idx).css({ opacity: 1, zIndex: 1 });
                updateDots()
                animating = false;
                if (!fromDrag) startAuto();
                return;
            }
            const slideSize = settings.direction === 'vertical'
                ? $slides.first().outerHeight(true)
                : $slides.first().outerWidth(true);
            if (!settings.loop) {
                if (index < 0) index = 0;
                if (index > totalSlides - visible) index = totalSlides - visible;
            }
            idx = index;
            const translateValue = settings.direction === 'vertical'
                ? `translate3d(0, ${-idx * slideSize}px, 0)`
                : `translate3d(${-idx * slideSize}px, 0, 0)`;
            $track.css({
                transition: fromDrag ? 'none' : 'transform 0.5s ease',
                transform: translateValue,
                cursor: fromDrag ? 'grabbing' : 'grab'
            });
            setTimeout(() => {
                if (settings.loop) {
                    if (idx >= totalSlides + visible) {
                        idx = visible;
                        const resetValue = settings.direction === 'vertical'
                            ? `translate3d(0, ${-idx * slideSize}px, 0)`
                            : `translate3d(${-idx * slideSize}px, 0, 0)`;
                        $track.css({ transition: 'none', transform: resetValue });
                    }
                    if (idx < visible) {
                        idx = totalSlides - 1 + visible;
                        const resetValue = settings.direction === 'vertical'
                            ? `translate3d(0, ${-idx * slideSize}px, 0)`
                            : `translate3d(${-idx * slideSize}px, 0, 0)`;
                        $track.css({ transition: 'none', transform: resetValue });
                    }
                }
                animating = false;
                if (!fromDrag) startAuto();
            }, fromDrag ? 0 : 500);
            updateDots();
            $slides.removeClass('active center');
            const totalOriginal = $slides.not(".cuz__slider__xr").length;
            if (totalOriginal === 0) return;
            const currentIndex = (idx - visible + totalOriginal) % totalOriginal;
            $slides.each(function (j) {
                const mappedIndex = ((j - visible) % totalOriginal + totalOriginal) % totalOriginal;
                if (mappedIndex === currentIndex) {
                    $(this).addClass('active');
                }
            });
            if (settings.center === true && settings.effect !== 'fade') {
                const centerOffset = Math.floor(visible / 2);
                const centerIndex = (currentIndex + centerOffset) % totalOriginal;

                $slides.each(function (j) {
                    const mappedIndex = ((j - visible) % totalOriginal + totalOriginal) % totalOriginal;
                    if (mappedIndex === centerIndex) {
                        $(this).addClass('center');
                    }
                });
            }
        }
        function init(preserveIndex = false) {
            clearAuto();
            $pagination.empty();
            let settings = getSettings(config);
            visible = getSlidesPerView(settings.breakpoints);
            pct = 100 / visible;
            // $track.css({
            //     display: 'flex',
            //     flexDirection: settings.direction === 'vertical' ? 'column' : 'row',
            //     transition: 'transform 0.5s ease'
            // });

            // $slides.css({
            //     flex: `0 0 ${pct}%`,
            //     maxWidth: `${pct}%`
            // });
            if (!preserveIndex) {
                $track.find('.cuz__slider__slide.cuz__slider__xr').remove();
                $slides = $track.find('.cuz__slider__slide');
            }
            $slides.removeClass('active');

            if (settings.loop && settings.effect === 'slide') {
                const $firstClones = $slides.slice(0, visible).clone().addClass('cuz__slider__xr');
                const $lastClones = $slides.slice(-visible).clone().addClass('cuz__slider__xr');
                $track.prepend($lastClones);
                $track.append($firstClones);
                $slides = $track.find('.cuz__slider__slide');
            }
            // if (settings.effect === 'slide' && settings.direction === 'horizontal') {
            //     const $firstImg = $slides.not('.clone').find('img').first();
            //     if ($firstImg.length) {
            //         $firstImg.on('load', function () {
            //             const w = this.naturalWidth;
            //             const h = this.naturalHeight;
            //             if (w && h) {
            //                 $slider.css("aspect-ratio", w + " / " + h);
            //                 // clear any fixed height if present
            //                 $slider.css("height", "");
            //             }
            //         }).each(function () {
            //             if (this.complete) $(this).trigger("load");
            //         });
            //     }
            // }
            const total = $slides.not('.cuz__slider__xr').length;
            function getCurrentBreakpointConfig(breakpoints) {
                const w = $(window).width();
                let matched = null;
                const sortedKeys = Object.keys(breakpoints || {})
                    .map(bp => parseInt(bp))
                    .sort((a, b) => a - b);

                for (let i = 0; i < sortedKeys.length; i++) {
                    const current = sortedKeys[i];
                    const next = sortedKeys[i + 1] ?? Infinity;

                    if (w >= current && w < next) {
                        matched = breakpoints[current.toString()];
                        break;
                    }
                }
                return matched || {};
            }
            const bpConfig = getCurrentBreakpointConfig(settings.breakpoints);
            const padding = bpConfig["custom-padding"] ?? config["custom-padding"];
            if (typeof padding !== 'undefined') {
                $slider.css("padding-left", padding + "%");
                $slider.css("padding-right", padding + "%");
            }
            $slider[0].offsetHeight;
            const margin = bpConfig["margin"] ?? config["margin"];
            if (typeof margin !== 'undefined') {
                $slides.css("margin-left", margin / 2 + "px");
                $slides.css("margin-right", margin / 2 + "px");
            }
            if (settings.effect === 'fade') {
                $track.css({
                    position: 'relative',
                    height: $slides.first().outerHeight(),
                    display: 'block'
                });
                $slides.css({
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%',
                    opacity: 0, zIndex: 0,
                    transition: 'opacity 0.5s ease'
                });
            } else {
                $track.css({
                    display: 'flex',
                    flexDirection: settings.direction === 'vertical' ? 'column' : 'row',
                    transition: 'transform 0.5s ease',
                    position: 'relative',
                    cursor: 'grab',
                    userSelect: 'none'
                });
                if (settings.direction === 'vertical') {
                    const margin = bpConfig["margin"] ?? config["margin"] ?? 0;
                    $slides.css({ margin: '0' });
                    $slides.css({
                        flex: `0 0 auto`,
                        width: '100%',
                        marginBottom: margin + "px"
                    });
                    $slides.last().css("margin-bottom", "0");
                } else {
                    const margin = bpConfig["margin"] ?? config["margin"] ?? 0;
                    const totalMargin = margin * (visible - 1);
                    const slideWidth = `calc((100% - ${totalMargin}px) / ${visible})`;
                    $slides.css({ margin: '0' });
                    $slides.css({
                        flex: `0 0 ${slideWidth}`,
                        maxWidth: slideWidth,
                        marginRight: margin + "px"
                    });
                    $slides.last().css("margin-right", "0");
                }
            }
            if (settings.pagination) {
                let totalSlides = $slides.not('.cuz__slider__xr').length;
                let pageCount;
                if (settings.loop) {
                    pageCount = totalSlides;
                } else {
                    pageCount = Math.max(1, totalSlides - visible + 1);
                }
                if ($pagination.find('.cuz__paginations__wrap').length === 0) {
                    $pagination.html('<div class="cuz__paginations__wrap"></div>');
                }
                const $paginationInn = $pagination.find('.cuz__paginations__wrap');
                if ($paginationInn.find('.cuz__dot').length !== pageCount) {
                    $paginationInn.empty();
                    for (let i = 0; i < pageCount; i++) {
                        $paginationInn.append(`<div class="cuz__dot" data-index="${i}"></div>`);
                    }
                    $paginationInn.find('.cuz__dot').first().addClass('active');

                    $pagination.off('click').on('click', '.cuz__dot', function () {
                        const dotIndex = $(this).data('index');
                        if (settings.loop) {
                            goTo(dotIndex + visible);
                        } else {
                            goTo(dotIndex);
                        }
                    });
                }
                updateDots();
            }
            if (settings.controls) {
                if ($slider.find('.slider-controls').length === 0) {
                    if ($slider.hasClass('tour__custom__slider') || $slider.hasClass('aviator__custom__slider')) {
                        $slider.append(`
                        <div class="slider-controls">
                            <button class="slider-prev">Prev</button>
                            <button class="slider-next">Next</button>
                        </div>
                    `);
                    } else {
                        $slider.append(`
                        <div class="slider-controls">
                            <button class="slider-prev"><i class="fa-solid fa-angle-left"></i></button>
                            <button class="slider-next"><i class="fa-solid fa-angle-right"></i></button>
                        </div>
                    `);
                    }
                }
                const $prevBtn = $slider.find('.slider-prev');
                const $nextBtn = $slider.find('.slider-next');
                $prevBtn.off('click').on('click', () => goTo(idx - 1));
                $nextBtn.off('click').on('click', () => goTo(idx + 1));

            } else {
                $slider.find('.slider-controls').remove();
            }
            $slides.removeClass('active center');
            const totalOriginal = $slides.not(".cuz__slider__xr").length;
            if (totalOriginal === 0) return;
            const currentIndex = (idx - visible + totalOriginal) % totalOriginal;
            $slides.each(function (j) {
                const mappedIndex = ((j - visible) % totalOriginal + totalOriginal) % totalOriginal;
                if (mappedIndex === currentIndex) {
                    $(this).addClass('active');
                }
            });
            if (settings.center === true && settings.effect !== 'fade') {
                const centerOffset = Math.floor(visible / 2);
                const centerIndex = (currentIndex + centerOffset) % totalOriginal;

                $slides.each(function (j) {
                    const mappedIndex = ((j - visible) % totalOriginal + totalOriginal) % totalOriginal;
                    if (mappedIndex === centerIndex) {
                        $(this).addClass('center');
                    }
                });
            }
            if (!preserveIndex) {
                if (settings.loop && settings.effect === 'slide') {
                    idx = visible;
                } else {
                    idx = 0;
                }
            } else {
                idx = Math.min(idx, totalOriginal - 1);
            }
            if (settings.effect === 'slide') {
                $track.css({
                    display: 'flex',
                    flexDirection: settings.direction === 'vertical' ? 'column' : 'row',
                    transition: 'transform 0.5s ease'
                });
                // $slides.css({
                //     flex: `0 0 ${pct}%`,
                //     maxWidth: `${pct}%`
                // });
            }
            goTo(idx, true);
            updateDots();
            startAuto();
            $slider.off('mouseenter mouseleave');
            $slider.on('mouseenter', clearAuto);
            $slider.on('mouseleave', startAuto);
            startAuto();
            let isDragging = false;
            let startX = 0, startY = 0, deltaX = 0, deltaY = 0;
            let dragThreshold = 10;
            let dragMoved = false;
            $track.off('.drag');
            $track.on('mousedown.drag touchstart.drag', function (e) {
                clearAuto();
                isDragging = true;
                dragMoved = false;
                startX = e.pageX || e.originalEvent.touches[0].pageX;
                startY = e.pageY || e.originalEvent.touches[0].pageY;
                deltaX = deltaY = 0;
                $track.css({ cursor: 'grabbing', transition: 'none' });
            });
            $(document).on('mousemove.drag touchmove.drag', function (e) {
                if (!isDragging) return;
                const x = e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX);
                const y = e.pageY || (e.originalEvent.touches && e.originalEvent.touches[0].pageY);
                deltaX = x - startX;
                deltaY = y - startY;
                if (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold) {
                    dragMoved = true;
                }
                if (settings.effect !== 'fade') {
                    const slideSize = settings.direction === 'vertical'
                        ? $slides.first().outerHeight(true)
                        : $slides.first().outerWidth(true);
                    const baseOffset = -idx * slideSize;
                    const dragOffset = settings.direction === 'vertical'
                        ? `translate3d(0, ${baseOffset + deltaY}px, 0)`
                        : `translate3d(${baseOffset + deltaX}px, 0, 0)`;
                    $track.css('transform', dragOffset);
                }
            });
            $(document).on('mouseup.drag touchend.drag', function (e) {
                if (!isDragging) return;
                isDragging = false;
                $track.css({ cursor: 'grab', transition: 'transform 0.5s ease' });
                if (dragMoved) {
                    if (settings.effect === 'fade') {
                        if (settings.direction === 'vertical') {
                            if (deltaY > 50) goTo(idx - 1);
                            else if (deltaY < -50) goTo(idx + 1);
                        } else {
                            if (deltaX > 50) goTo(idx - 1);
                            else if (deltaX < -50) goTo(idx + 1);
                        }
                    } else {
                        const slideSize = settings.direction === 'vertical'
                            ? $slides.first().outerHeight(true)
                            : $slides.first().outerWidth(true);

                        const threshold = slideSize * 0.25;
                        if (settings.direction === 'horizontal') {
                            if (deltaX > threshold) goTo(idx - 1);
                            else if (deltaX < -threshold) goTo(idx + 1);
                            else goTo(idx);
                        } else {
                            if (deltaY > threshold) goTo(idx - 1);
                            else if (deltaY < -threshold) goTo(idx + 1);
                            else goTo(idx);
                        }
                    }
                } else {
                    const target = $(e.target);
                    if (target.closest('.casinoLink').length) {
                        target.closest('.casinoLink')[0].click();
                    }
                }

                deltaX = deltaY = 0;
            });
        }
        attachResize($slider, $track, init);
    });
    // For on drag remove link
    const dragThreshold = 6;
    $(context).find('.cuz__slider__slide, .casinoLink').each(function () {
        const slide = this;
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let activePointerId = null;
        const inlineClickHandler = slide.onclick || null;
        const anchor = slide.querySelector('a[href]');
        if (anchor) {
            anchor.dataset.savedHref = anchor.getAttribute('href');
            anchor.removeAttribute('href');
        }
        if (slide.hasAttribute && slide.hasAttribute('onclick')) slide.removeAttribute('onclick');
        slide.onclick = null;
        const onPointerDown = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
            activePointerId = e.pointerId;
            if (slide.setPointerCapture) {
                try { slide.setPointerCapture(activePointerId); } catch (err) { }
            }
        };
        const onPointerMove = (e) => {
            if (activePointerId !== null && e.pointerId !== activePointerId) return;
            if (Math.abs(e.clientX - startX) > dragThreshold || Math.abs(e.clientY - startY) > dragThreshold) {
                isDragging = true;
            }
        };
        const onPointerUpOrCancel = (e) => {
            if (activePointerId !== null && e.pointerId !== activePointerId) return;
            if (slide.releasePointerCapture) {
                try { slide.releasePointerCapture(activePointerId); } catch (err) { }
            }
            activePointerId = null;
            if (!isDragging) {
                if (typeof inlineClickHandler === 'function') {
                    try { inlineClickHandler.call(slide, e || window.event); } catch (err) { console.error(err); }
                } else if (anchor && anchor.dataset && anchor.dataset.savedHref) {
                    window.location.href = anchor.dataset.savedHref;
                } else if (slide.dataset && slide.dataset.href) {
                    window.location.href = slide.dataset.href;
                }
            }
            setTimeout(() => { isDragging = false; }, 0);
        };
        const onClickCapture = (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        };
        if (window.PointerEvent) {
            slide.addEventListener('pointerdown', onPointerDown, { passive: true });
            slide.addEventListener('pointermove', onPointerMove, { passive: true });
            slide.addEventListener('pointerup', onPointerUpOrCancel);
            slide.addEventListener('pointercancel', onPointerUpOrCancel);
        }
        slide.addEventListener('click', onClickCapture, true);
    });
}
$('.cuz__slider').each(function () {
    CustomAppSlider($(this));
});
$(document).ready(function () {
    CustomAppSlider();
});



