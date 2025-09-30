function showDateRangePicker($input) {
    $input = $($input);
    const today = new Date();
    const $container = $($input.closest(".vin--datepicker__container"));
    $container.find(".vindatepicker--dropdown__wrapp").remove();
    const isSingleInput = $container.hasClass("vindaterangepicker--single__input");
    const isCustom = $container.hasClass("vindaterangepicker__custom");
    let selectedFrom = isSingleInput
        ? ($input.val().split(" - ")[0] || null)
        : $container.find(".vindaterange--from__date").val() || null;
    let selectedTo = isSingleInput
        ? ($input.val().split(" - ")[1] || null)
        : $container.find(".vindaterange--to__date").val() || null;

    let fromDate = selectedFrom ? new Date(selectedFrom) : null;
    let toDate = selectedTo ? new Date(selectedTo) : null;
    let state = {
        left: { year: fromDate ? fromDate.getFullYear() : today.getFullYear(), month: fromDate ? fromDate.getMonth() : today.getMonth() },
        right: { year: toDate ? toDate.getFullYear() : today.getFullYear(), month: toDate ? toDate.getMonth() : today.getMonth() }
    };
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    function formatDateTime(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ampm = date.getHours() >= 12 ? "PM" : "AM";
        let hour12 = date.getHours() % 12 || 12;
        return `${y}-${m}-${d} ${String(hour12).padStart(2, '0')}:${min} ${ampm}`;
    }
    function formatDisplay(date) {
        const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
        return date.toLocaleString(undefined, options);
    }
    function parseDate(str) {
        return str ? new Date(str) : null;
    }
    let selectedLeft = null;
    let selectedRight = null;
    function renderHeader(side) {
        if (!isCustom) {
            return `
            <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
            <button class="vindatepicker--headernav__prev" data-side="${side}">«</button>
            <span class="vin--textcenter vinflex--1">${months[state[side].month]} ${state[side].year}</span>
            <button class="vindatepicker--headernav__next" data-side="${side}" ${state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month >= today.getMonth()) ? 'disabled' : ''}>»</button>
            </div>`;
        } else {
            return `
            <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vinflex--alignitemscenter vin__range__header">
                <div class="vincustom__year__clmn vinflex vinflex--1 vin--textcenter">${months[state[side].month]} ${state[side].year}</div>
                <div class="vin__day__clmn vinflex vinflex--1 vinflex--justifyend vinflex--alignitemscenter">
                    Today <button class="vin-day-up">▲</button><button class="vin-day-down">▼</button>
                </div>
            </div>`;
        }
    }
    function renderCalendar(year, month, selectedDate, minDate = null) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthLastDay = new Date(year, month, 0);
        let html = '<table><tbody>';
        const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        html += '<tr>' + daysOfWeek.map(d => `<th>${d}</th>`).join('') + '</tr><tr>';
        for (let i = 0; i < firstDay.getDay(); i++) {
            let dateNum = prevMonthLastDay.getDate() - firstDay.getDay() + 1 + i;
            let dateObj = new Date(year, month - 1, dateNum);
            html += `<td data-date="${formatDate(dateObj)}" class="vin--textcenter prev__month disabled">${dateNum}</td>`;
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            let dateObj = new Date(year, month, d);
            let dateStr = formatDate(dateObj);
            let classes = [];
            if (dateObj > today) classes.push("disabled");
            if (minDate) {
                if (dateObj < minDate) classes.push("vindatepicker--less__date", "disabled");
                else if (dateObj.getTime() === minDate.getTime()) classes.push("vindatepicker--equal__date");
            }
            if (dateObj.toDateString() === today.toDateString()) classes.push("vindatepicker--current__date");
            if (selectedDate && dateStr === selectedDate) classes.push("vindatepicker--selected__date");
            let cls = classes.length ? ` class="vin--textcenter ${classes.join(" ")}"` : ` class="vin--textcenter"`;
            html += `<td data-date="${dateStr}"${cls}>${d}</td>`;
            if ((d + firstDay.getDay()) % 7 === 0) html += '</tr><tr>';
        }
        const totalCells = firstDay.getDay() + lastDay.getDate();
        const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= nextMonthDays; d++) {
            let dateObj = new Date(year, month + 1, d);
            html += `<td data-date="${formatDate(dateObj)}" class="next__month disabled vin--textcenter">${d}</td>`;
        }
        html += '</tr></tbody></table>';
        return html;
    }
    const $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $container.append($popup);
    function render() {
        if (state.right.year > today.getFullYear()) {
            state.right.year = today.getFullYear();
            state.right.month = today.getMonth();
        } else if (state.right.year === today.getFullYear() && state.right.month > today.getMonth()) {
            state.right.month = today.getMonth();
        }
        const minDate = selectedFrom ? parseDate(selectedFrom) : null;
        const isCustom = $container.hasClass("vindaterangepicker__custom");
        let sidebarHTML = '';
        if (isCustom) {
            sidebarHTML = `
        <div class="vindaterangepicker--sidebar">
            <ul>
                <li data-range="all">All</li>
                <li data-range="last3">Last 3 Months</li>
                <li data-range="last2">Last 2 Months</li>
                <li data-range="last1">Last Month</li>
                <li data-range="last10">Last 10 Days</li>
                <li data-range="weekly">Weekly</li>
                <li data-range="today">Today</li>
            </ul>
        </div>`;
        }
        let timeHTMLLeft = '';
        let timeHTMLRight = '';
        let buttonHTML = '';
        if (isCustom) {
            const now = new Date();
            let currentHour = now.getHours();
            let currentMinute = now.getMinutes();
            const currentAMPM = currentHour >= 12 ? "PM" : "AM";
            let hour12 = currentHour % 12;
            if (hour12 === 0) hour12 = 12;
            timeHTMLLeft = `
    <div class="vin--time__picker vin--time__picker-left vinflex vinflex--justifycenter">
    <form class="vin__range__time" aria-label="Select time range">
        <label for="vin__hour-left">From:</label>
        <select id="vin__hour-left" class="vin-time-hour-left">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === hour12 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select> :
        <select id="vin__minute-left" class="vin-time-minute-left">${Array.from({ length: 60 }, (_, i) => `<option ${i === currentMinute ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
        <select id="vin__ampm-left" class="vin-time-ampm-left"><option ${currentAMPM === 'AM' ? 'selected' : ''}>AM</option><option ${currentAMPM === 'PM' ? 'selected' : ''}>PM</option></select>
    </form>
    </div>`;
            timeHTMLRight = `
    <div class="vin--time__picker vin--time__picker-right vinflex vinflex--justifycenter">
    <form class="vin__range__time">
        <label for="vin__hour-right">To:</label>
        <select id="vin__hour-right" class="vin-time-hour-right">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === hour12 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select> :
        <select id="vin__minute-right" class="vin-time-minute-right">${Array.from({ length: 60 }, (_, i) => `<option ${i === currentMinute ? 'selected' : ''}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
        <select id="vin__ampm-right" class="vin-time-ampm-right"><option ${currentAMPM === 'AM' ? 'selected' : ''}>AM</option><option ${currentAMPM === 'PM' ? 'selected' : ''}>PM</option></select>
    </form>
    </div>`;
            buttonHTML = `
    <div class="vin--datepicker-buttons vinflex vinflex--justifyend vin__canapply__sec">
        <button type="button" class="vin-btn-cancel">Cancel</button>
        <button type="button" class="vin-btn-apply">Apply</button>
    </div>`;
        }
        const body = `
<div class="range__with__sidebar vinflex">
    ${sidebarHTML}
    <div class="vindaterangepicker--calendar vinflex">
        <div class="vindaterangepicker--calendarleft vin--daterange__calendar">
            ${renderHeader("left")}
            ${renderCalendar(state.left.year, state.left.month, selectedFrom)}
            ${timeHTMLLeft}
        </div>
        <div class="vindaterangepicker--calendarright vin--daterange__calendar">
            ${renderHeader("right")}
            ${renderCalendar(state.right.year, state.right.month, selectedTo, minDate)}
            ${timeHTMLRight}
        </div>
    </div>
</div>
${buttonHTML}`;
        $popup.html(body);
        if (isCustom) {
            $popup.find(".vin-time-hour-left, .vin-time-hour-right").val("1");
            $popup.find(".vin-time-minute-left, .vin-time-minute-right").val("00");
            $popup.find(".vin-time-ampm-left, .vin-time-ampm-right").val("AM");
            $popup.find(".vin-btn-cancel").off("click").on("click", () => $popup.remove());
            $popup.find(".vin-btn-apply").off("click").on("click", function () {
                const hourFrom = parseInt($popup.find(".vin-time-hour-left").val(), 10);
                const minuteFrom = parseInt($popup.find(".vin-time-minute-left").val(), 10);
                const ampmFrom = $popup.find(".vin-time-ampm-left").val();
                const hourTo = parseInt($popup.find(".vin-time-hour-right").val(), 10);
                const minuteTo = parseInt($popup.find(".vin-time-minute-right").val(), 10);
                const ampmTo = $popup.find(".vin-time-ampm-right").val();
                if (!selectedFrom) { alert("Please select From date first"); return; }
                if (!selectedFrom || !selectedTo || isNaN(hourFrom) || isNaN(minuteFrom) || !ampmFrom || isNaN(hourTo) || isNaN(minuteTo) || !ampmTo) {
                    alert("Please select both From and To dates and times");
                    return;
                }
                let finalHourFrom = hourFrom % 12; if (ampmFrom === "PM") finalHourFrom += 12;
                let finalHourTo = hourTo % 12; if (ampmTo === "PM") finalHourTo += 12;
                let fromDateObj = new Date(selectedFrom); fromDateObj.setHours(finalHourFrom, minuteFrom, 0, 0);
                let toDateObj = new Date(selectedTo); toDateObj.setHours(finalHourTo, minuteTo, 0, 0);
                $container.find(".vindaterange--from__date").val(formatDateTime(fromDateObj)).trigger("change");
                $container.find(".vindaterange--to__date").val(formatDateTime(toDateObj)).trigger("change");
                if (isSingleInput) {
                    $input.val(`${formatDisplay(fromDateObj)} ${formatTime(fromDateObj)} - ${formatDisplay(toDateObj)} ${formatTime(toDateObj)}`).trigger("change");
                }
                $popup.remove();
            });
        }
        $popup.find("td").off("click").on("click", function () {
            const $td = $(this);
            if ($td.hasClass("disabled")) return;
            const date = $td.data("date");
            const $calendar = $td.closest(".vin--daterange__calendar");
            if ($calendar.hasClass("vindaterangepicker--calendarleft")) {
                selectedFrom = date;
                if (!isCustom) selectedTo = null;
            } else {
                if (!selectedFrom) {
                    alert("Please select From date first");
                    return;
                }
                selectedTo = date;
            }
            if (!isCustom) {
                if (!isSingleInput) {
                    if (selectedFrom) $container.find(".vindaterange--from__date").val(selectedFrom).trigger("change");
                    if (selectedTo) $container.find(".vindaterange--to__date").val(selectedTo).trigger("change");
                } else if (selectedFrom && selectedTo) {
                    $input.val(`${formatDisplay(new Date(selectedFrom))} - ${formatDisplay(new Date(selectedTo))}`).trigger("change");
                }
                if (selectedFrom && selectedTo) {
                    $popup.remove();
                    $(document).off("mousedown.cuzpicker");
                }
            }
            render();
        });
    }
    render();
    $popup.on("click", ".vindatepicker--headernav__prev,.vindatepicker--headernav__next", function () {
        const side = $(this).data("side");
        if (!state[side]) return;
        if ($(this).hasClass("vindatepicker--headernav__prev")) {
            state[side].month--; if (state[side].month < 0) { state[side].month = 11; state[side].year--; }
        } else {
            state[side].month++; if (state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month > today.getMonth())) { state[side].month = today.getMonth(); state[side].year = today.getFullYear(); }
        }
        render();
    });
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
    return $popup;
}
(() => {
    const dateRangeInputs = document.querySelectorAll(".vindaterange--from__date, .vindaterange--to__date");
    dateRangeInputs.forEach(input => {
        input.addEventListener("focus", function () {
            showDateRangePicker(this);
        });
    });
})();
