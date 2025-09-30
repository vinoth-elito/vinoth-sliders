//vindatepicker, vinmonthyearpicker, vindatetimepicker, [vintimepicker, vintimepicker--with__wrrow, vintimepicker--with__circle], [vindaterangepicker, vindaterangepicker--single__input]

function showDatePicker($input) {
    let now = new Date();
    let selectedDateStr = $input.data("selectedDate");
    let selectedDate = selectedDateStr ? new Date(selectedDateStr) : null;
    let state = {
        year: selectedDate ? selectedDate.getFullYear() : now.getFullYear(),
        month: selectedDate ? selectedDate.getMonth() : now.getMonth(),
        selectedDate: selectedDateStr || null
    };
    let $container = $input.closest(".vin--datepicker__container");
    $input.closest("div").find(".vindatepicker--dropdown__wrapp").remove();
    let $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $input.closest("div").append($popup);
    function buildCalendar(year, month) {
        const today = new Date();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        let html = "<table><thead><tr>";
        ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(d => html += "<th>" + d + "</th>");
        html += "</tr></thead><tbody><tr>";
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            let prevDate = prevMonthLastDate - i;
            let prevMonth = month - 1 < 0 ? 11 : month - 1;
            let prevYear = month - 1 < 0 ? year - 1 : year;
            let dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;
            html += `<td class="vindatepicker--headernav__prev disabled vin--textcenter" data-date="${dateStr}">${prevDate}</td>`;
        }
        for (let d = 1; d <= lastDate; d++) {
            let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            let disabled = new Date(year, month, d) > today ? "disabled" : "";
            if ((d + firstDayIndex - 1) % 7 === 0 && d !== 1) html += "</tr><tr>";
            html += `<td data-date="${dateStr}" class="vin--textcenter ${disabled}">${d}</td>`;
        }
        const lastDayIndex = new Date(year, month, lastDate).getDay();
        const nextMonth = month + 1 > 11 ? 0 : month + 1;
        const nextYear = month + 1 > 11 ? year + 1 : year;
        for (let i = 1; i < 7 - lastDayIndex; i++) {
            let dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            html += `<td class="vindatepicker--headernav__next disabled vin--textcenter" data-date="${dateStr}">${i}</td>`;
        }
        html += "</tr></tbody></table>";
        return html;
    }
    function render() {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let nextDisabled = state.year > now.getFullYear() ||
            (state.year === now.getFullYear() && state.month >= now.getMonth()) ? 'disabled' : '';
        let prevDisabled = '';
        let header = `<div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
            <button class="vindatepicker--headernav__prev" ${prevDisabled}>«</button>
            <span class="vin--textcenter vinflex--1">${months[state.month]} ${state.year}</span>
            <button class="vindatepicker--headernav__next" ${nextDisabled}>»</button>
        </div>`;
        let body = buildCalendar(state.year, state.month);
        body = $(body).find("td").each(function () {
            let dateStr = $(this).data("date");
            if (!dateStr) return;
            let d = new Date(dateStr);
            if (d > now) $(this).addClass("disabled");
            if (d.toDateString() === now.toDateString()) $(this).addClass("vindatepicker--current__date");
            if (state.selectedDate && dateStr === state.selectedDate) $(this).addClass("vindatepicker--selected__date");
        }).end().prop('outerHTML');
        $popup.html(header + body);
    }
    render();
    $popup.on("click", ".vindatepicker--headernav__prev:not([disabled])", function () {
        state.month--;
        if (state.month < 0) { state.month = 11; state.year--; }
        render();
    });
    $popup.on("click", ".vindatepicker--headernav__next:not([disabled])", function () {
        state.month++;
        if (state.month > 11) { state.month = 0; state.year++; }
        render();
    });
    $popup.on("click", "td[data-date]:not(.disabled)", function () {
        state.selectedDate = $(this).data("date");
        $input.data("selectedDate", state.selectedDate);
        $input.val(state.selectedDate).trigger("change");
        $popup.find("td").removeClass("vindatepicker--selected__date");
        $(this).addClass("vindatepicker--selected__date");
        $popup.remove();
        $(document).off("mousedown.cuzpicker");
    });
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
}

function showDateRangePicker($input) {
    const today = new Date();
    const $container = $input.closest(".vin--datepicker__container");
    $container.find(".vindatepicker--dropdown__wrapp").remove();
    const $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $container.append($popup);
    const isSingleInput = $container.hasClass("vindaterangepicker--single__input");
    let selectedFrom = isSingleInput
        ? ($input.val().split(" - ")[0] || null)
        : $container.find(".vindaterange--from__date").val() || null;
    let selectedTo = isSingleInput
        ? ($input.val().split(" - ")[1] || null)
        : $container.find(".vindaterange--to__date").val() || null;
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    function formatDisplay(date) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct", "Nov", "Dec"];
        const d = String(date.getDate()).padStart(2, "0");
        return `${d} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
    function parseDate(str) {
        return str ? new Date(str) : null;
    }
    let fromDate = parseDate(selectedFrom);
    let toDate = parseDate(selectedTo);
    let state = {
        left: { year: today.getFullYear(), month: today.getMonth() },
        right: { year: today.getFullYear(), month: today.getMonth() }
    };
    if (fromDate) {
        state.left.year = fromDate.getFullYear();
        state.left.month = fromDate.getMonth();
    }
    if (toDate) {
        state.right.year = toDate.getFullYear();
        state.right.month = toDate.getMonth();
    }
    if (!fromDate && !toDate) {
        state.left.year = today.getFullYear();
        state.left.month = today.getMonth();
        state.right.year = today.getFullYear();
        state.right.month = today.getMonth();
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    function renderHeader(side) {
        return `
            <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
                <button class="vindatepicker--headernav__prev" data-side="${side}">«</button>
                <span class="vin--textcenter vinflex--1">${months[state[side].month]} ${state[side].year}</span>
                <button class="vindatepicker--headernav__next" data-side="${side}" ${state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month >= today.getMonth()) ? 'disabled' : ''}>»</button>
            </div>
        `;
    }
    // function renderCalendar(year, month) {
    //     let firstDay = new Date(year, month, 1);
    //     let lastDay = new Date(year, month + 1, 0);
    //     let html = '<table><tbody><tr>';

    //     // empty cells for first week
    //     for (let i = 0; i < firstDay.getDay(); i++) html += '<td class="vin--textcenter"></td>';

    //     for (let d = 1; d <= lastDay.getDate(); d++) {
    //         let dateObj = new Date(year, month, d);
    //         let dateStr = formatDate(dateObj);

    //         let disabled = '';
    //         // Disable future dates
    //         if (dateObj > today) disabled = 'disabled';

    //         html += `<td data-date="${dateStr}" class="${disabled}">${d}</td>`;
    //         if ((d + firstDay.getDay()) % 7 === 0) html += '</tr><tr>';
    //     }

    //     html += '</tr></tbody></table>';
    //     return html;
    // }
    let selectedLeft = null;
    let selectedRight = null;
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
            function isSameDate(d1, d2) {
                return d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate();
            }
            if (minDate) {
                if (isSameDate(dateObj, minDate)) {
                    classes.push("vindatepicker--equal__date");
                } else if (dateObj < minDate) {
                    classes.push("vindatepicker--less__date", "disabled");
                }
            }
            if (!classes.includes("vindatepicker--equal__date") && dateObj > today) {
                classes.push("disabled");
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
    function render() {
        if (state.right.year > today.getFullYear()) {
            state.right.year = today.getFullYear();
            state.right.month = today.getMonth();
        } else if (state.right.year === today.getFullYear() && state.right.month > today.getMonth()) {
            state.right.month = today.getMonth();
        }
        let minDate = selectedFrom ? new Date(selectedFrom) : null;
        const body = `
        <div class="vindaterangepicker--calendar vinflex">
            <div class="vindaterangepicker--calendarleft vin--daterange__calendar">
                ${renderHeader("left")}
                ${renderCalendar(state.left.year, state.left.month, selectedFrom)}
            </div>
            <div class="vindaterangepicker--calendarright vin--daterange__calendar">
                ${renderHeader("right")}
                ${renderCalendar(state.right.year, state.right.month, selectedTo, minDate)}
            </div>
        </div>
    `;
        $popup.html(body);
        $popup.find("td").off("click").on("click", function () {
            const $td = $(this);
            if ($td.hasClass("disabled")) return;
            const date = $td.data("date");
            const $calendar = $td.closest(".vin--daterange__calendar");
            if ($calendar.hasClass("vindaterangepicker--calendarleft")) {
                selectedLeft = date;
            } else {
                selectedRight = date;
            }
        });
        if (selectedFrom) $popup.find(`.vindaterangepicker--calendarleft td[data-date="${selectedFrom}"]`).addClass("vindatepicker--selected__from");
        if (selectedTo) $popup.find(`.vindaterangepicker--calendarright td[data-date="${selectedTo}"]`).addClass("vindatepicker--selected__to");
        if (selectedFrom && selectedTo) {
            $popup.find("td[data-date]").each(function () {
                const date = $(this).data("date");
                if (date <= selectedFrom && date >= selectedTo) $(this).addClass("vindatepicker--in__range");
            });
        }
    }
    render();
    $popup.on("click", ".vindatepicker--headernav__prev, .vindatepicker--headernav__next", function () {
        const side = $(this).data("side");
        if (!state[side]) return;
        if ($(this).hasClass("vindatepicker--headernav__prev")) {
            state[side].month--;
            if (state[side].month < 0) { state[side].month = 11; state[side].year--; }
        } else {
            state[side].month++;
            if (state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month > today.getMonth())) {
                state[side].month = today.getMonth();
                state[side].year = today.getFullYear();
            }
        }
        render();
    });
    $popup.on("click", "td[data-date]:not(.disabled):not(.vindatepicker--less__date)", function () {
        const $td = $(this);
        const dateStr = $td.data("date");
        const $calendar = $td.closest(".vin--daterange__calendar");
        if ($calendar.hasClass("vindaterangepicker--calendarright") && !selectedFrom) {
            notify("Please select a From date first", "danger");
            return;
        }
        if ($calendar.hasClass("vindaterangepicker--calendarleft")) {
            selectedFrom = dateStr;
            if (!isSingleInput) {
                $container.find(".vindaterange--from__date").val(dateStr).trigger("change");
            }
            selectedTo = null;
        } else {
            if (selectedFrom && dateStr < selectedFrom) {
                notify("To date cannot be less than From date", 'danger');
                return;
            }
            selectedTo = dateStr;
            if (!isSingleInput) {
                $container.find(".vindaterange--to__date").val(dateStr).trigger("change");
            }
        }
        render();
        if (selectedFrom && selectedTo) {
            if (isSingleInput) {
                const fromText = formatDisplay(new Date(selectedFrom));
                const toText = formatDisplay(new Date(selectedTo));
                $input.val(`${fromText} - ${toText}`).trigger("change");
            }
            $popup.remove();
        }
    });
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
    return $popup;
}

function showTimePicker($input) {
    $input = $($input);
    const $container = $input.closest(".vintimepicker");
    const isArrowMode = $container.hasClass("vintimepicker--with__wrrow");
    const isCircleMode = $container.hasClass("vintimepicker--with__circle");
    $container.find(".vindatepicker--dropdown__wrapp").remove();
    const $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $container.append($popup);
    const now = new Date();
    let selectedHour = now.getHours();
    let selectedMinute = now.getMinutes();
    let selectedAMPM = selectedHour >= 12 ? "PM" : "AM";
    const savedTime = $input.data("selectedTime");
    if (savedTime) {
        const match = savedTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
        if (match) {
            selectedHour = parseInt(match[1], 10) % 12;
            if (match[3].toUpperCase() === "PM") selectedHour += 12;
            selectedMinute = parseInt(match[2], 10);
            selectedAMPM = match[3].toUpperCase();
        }
    }
    function pad(num) { return String(num).padStart(2, "0"); }
    function padHour(h) { return pad(h % 12 === 0 ? 12 : h % 12); }
    function formatTime(h, m) { return `${padHour(h)}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`; }
    function renderList() {
        const times = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) times.push(formatTime(h, m));
        }
        const currentTimeExact = formatTime(now.getHours(), now.getMinutes());
        if (!times.includes(currentTimeExact)) times.push(currentTimeExact);
        times.sort((a, b) => {
            const parse = t => {
                const [hm, ap] = t.split(" ");
                let [hh, mm] = hm.split(":").map(Number);
                if (ap === "PM" && hh !== 12) hh += 12;
                if (ap === "AM" && hh === 12) hh = 0;
                return hh * 60 + mm;
            };
            return parse(a) - parse(b);
        });
        let html = '<div class="vintimepicker--time__list vin--textcenter">';
        times.forEach(time => {
            let classes = [];
            if (time === currentTimeExact) classes.push("vintimepicker--time__current");
            if (time === savedTime) classes.push("vindatepicker--selected__date");
            html += `<div class="vintimepicker--time__listitem ${classes.join(" ")}">${time}</div>`;
        });
        html += "</div>";
        $popup.html(html);
    }
    function renderArrow() {
        $popup.html(`
        <div class="vintimepicker--time__arrow">
            <div class="vindatepicker--time__controlselect vinflex vinflex--alignitemscenter">
                <!-- Hour Column -->
                <div class="vintimepicker--time__col vinflex vinflex--alignitemscenter vinflex--1">
                    <button class="vindatepicker--time__hup">▲</button>
                    <div class="vindatepicker--time__hval">${padHour(selectedHour)}</div>
                    <button class="vindatepicker--time__hdown">▼</button>
                </div>
                <span>:</span>
                <!-- Minute Column -->
                <div class="vintimepicker--time__col vinflex vinflex--alignitemscenter vinflex--1">
                    <button class="vindatepicker--time__mup">▲</button>
                    <div class="vindatepicker--time__mval">${pad(selectedMinute)}</div>
                    <button class="vindatepicker--time__mdown">▼</button>
                </div>
            </div>
            <!-- AM/PM Toggle (your original structure, enhanced) -->
            <div class="vindatepicker--time__ampm" style="margin-top: 10px; text-align: center;">
                <div class="vindatepicker--time__ampmgroup vin--inflex">
                    <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}" data-value="AM">AM</button>
                    <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}" data-value="PM">PM</button>
                    <div class="vindatepicker--timeampm__btnactive-bg"></div>
                </div>
            </div>
        </div>
        <!-- Apply Button -->
        <div class="vintimepicker--time__actions vinflex vin--textcenter">
            <button class="vindatepicker--apply__timecancel">Cancel</button>
            <button class="vindatepicker--apply__timeapply">Apply</button>
        </div>
    `);
        $popup.find(".vindatepicker--time__hup").on("click", function () {
            selectedHour = (selectedHour + 1) % 24;
            renderArrow();
        });
        $popup.find(".vindatepicker--time__hdown").on("click", function () {
            selectedHour = (selectedHour - 1 + 24) % 24;
            renderArrow();
        });
        $popup.find(".vindatepicker--time__mup").on("click", function () {
            selectedMinute = (selectedMinute + 1) % 60;
            renderArrow();
        });
        $popup.find(".vindatepicker--time__mdown").on("click", function () {
            selectedMinute = (selectedMinute - 1 + 60) % 60;
            renderArrow();
        });
        const $amPmBtns = $popup.find(".vindatepicker--timeampm__btn");
        const $activeBg = $popup.find(".vindatepicker--timeampm__btnactive-bg");
        $activeBg.css("transform", selectedAMPM === "PM" ? "translateX(100%)" : "translateX(0)");
        $amPmBtns.on("click", function () {
            selectedAMPM = $(this).data("value");
            $amPmBtns.removeClass("active");
            $(this).addClass("active");
            $activeBg.css("transform", selectedAMPM === "PM" ? "translateX(100%)" : "translateX(0)");
        });
        $popup.find(".vindatepicker--apply__timeapply").on("click", function () {
            let hour24 = selectedHour;
            if (selectedAMPM === "PM" && hour24 !== 12) hour24 += 12;
            if (selectedAMPM === "AM" && hour24 === 12) hour24 = 0;
            const formatted = `${padHour(hour24)}:${pad(selectedMinute)} ${selectedAMPM}`;
            $input.val(formatted).trigger("change");
            $input.data("selectedTime", formatted);
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        });
        $popup.find(".vindatepicker--apply__timecancel").on("click", function () {
            $input.val("").trigger("change");
            $input.removeData("selectedTime");
            selectedHour = 12;
            selectedMinute = 0;
            selectedAMPM = "AM";
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        });
    }
    function renderCircle() {
        const radiusHours = 130;
        const radiusMinutes = 130;
        const center = radiusHours + 40;
        let svg = `<div class="vintimepicker--round__clock"><svg class="vintimepicker--circle__clock" width="${2 * center}" height="${2 * center}" viewBox="0 0 ${2 * center} ${2 * center}" style="display:block;margin:auto;">
                    <circle cx="${center}" cy="${center}" r="${radiusMinutes}" class="vintimepicker--circle__minutesbg"></circle>
                    <circle cx="${center}" cy="${center}" r="${radiusHours}" class="vintimepicker--circle__hoursbg"></circle>
        <g class="vintimepicker--circle__hwrapp">`;
        for (let h = 1; h <= 12; h++) {
            const angle = (h / 12) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = center + radiusHours * Math.cos(rad);
            const y = center + radiusHours * Math.sin(rad);
            const cls = ((selectedHour % 12) === (h % 12)) ? "vintimepicker--selected__hour" : "";
            svg += `
            <g class="vintimepicker--circle__hour ${cls}" data-hour="${h}" transform="translate(${x},${y})">
                <circle r="14" class="vintimepicker--circle__hourbg"></circle>
                <text text-anchor="middle" alignment-baseline="middle">${h}</text>
            </g>`;
        }
        svg += `</g><g class="vintimepicker--circle__mwrapp">`;
        for (let i = 0; i < 60; i += 5) {
            const angle = (i / 60) * 360 - 90;
            const rad = (angle * Math.PI) / 180;
            const x = center + radiusMinutes * Math.cos(rad);
            const y = center + radiusMinutes * Math.sin(rad);
            const cls = (selectedMinute === i) ? "vintimepicker--selected__minute" : "";
            svg += `
            <g class="vintimepicker--circle__minute ${cls}" data-minute="${i}" transform="translate(${x},${y})">
                <circle r="10" class="vintimepicker--circle__minutebg"></circle>
                <text text-anchor="middle" alignment-baseline="middle">${pad(i)}</text>
            </g>`;
        }
        const hourIndicatorLength = radiusHours - 40;
        const minuteIndicatorLength = radiusMinutes - 40;
        const hourAngle = ((selectedHour % 12) / 12) * 360 - 90;
        const hourRad = (hourAngle * Math.PI) / 180;
        const hourX = center + hourIndicatorLength * Math.cos(hourRad);
        const hourY = center + hourIndicatorLength * Math.sin(hourRad);
        const minuteAngle = (selectedMinute / 60) * 360 - 90;
        const minuteRad = (minuteAngle * Math.PI) / 180;
        const minX = center + minuteIndicatorLength * Math.cos(minuteRad);
        const minY = center + minuteIndicatorLength * Math.sin(minuteRad);

        svg += `</g>
            <g class="vintimepicker--circle__indicators">
                <line id="vintimepicker--hour__indicators" x1="${center}" y1="${center}" x2="${hourX}" y2="${hourY}" 
                    stroke="red" stroke-width="3" />
                <line id="vintimepicker--minute__indicators" x1="${center}" y1="${center}" x2="${minX}" y2="${minY}" 
                    stroke="blue" stroke-width="2" />

                <!-- Put knobs last but with pointer-events so they don't block text -->
                <circle id="vintimepicker--hour__knob" class="vintimepicker--draggable__hour" cx="${hourX}" cy="${hourY}" r="8" fill="red"
                        cursor="pointer" style="pointer-events: all;" />
                <circle id="vintimepicker--minute__knob" class="vintimepicker--draggable__minute" cx="${minX}" cy="${minY}" r="8" fill="blue"
                        cursor="pointer" style="pointer-events: all;" />
            </g>
        </svg>

        <div class="vintimepicker--circle__timeinputs" style="text-align:center; margin-top:10px;">
            <input type="number" class="vintimepicker--timeinputs__hour" value="${padHour(selectedHour)}" min="1" max="12" readonly style="width:40px; text-align:center;">
            <span>:</span>
            <input type="number" class="vintimepicker--timeinputs__minute" value="${pad(selectedMinute)}" min="0" max="59" readonly style="width:40px; text-align:center;">
        </div>

        <div class="vintimepicker--circle__ampm" style="text-align:center; margin-top:10px;">
            <div class="vindatepicker--time__ampmgroup vin--inflex">
                <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}" data-value="AM">AM</button>
                <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}" data-value="PM">PM</button>
                <div class="vindatepicker--timeampm__btnactive-bg"></div>
            </div>
        </div>
        <div class="vintimepicker--time__actions vinflex vin--textcenter" style="margin-top:10px;">
            <button class="vindatepicker--apply__timecancel">Cancel</button>
            <button class="vindatepicker--apply__timeapply">Apply</button>
        </div></div>`;

        $popup.html(svg);

        const $svg = $popup.find("svg")[0];
        const hourIndicator = $svg.querySelector("#vintimepicker--hour__indicators");
        const hourKnob = $svg.querySelector("#vintimepicker--hour__knob");
        const minuteIndicator = $svg.querySelector("#vintimepicker--minute__indicators");
        const minuteKnob = $svg.querySelector("#vintimepicker--minute__knob");

        function updateIndicator(type) {
            let angle, rad, r, x, y;
            if (type === "hour") {
                const rawHour = selectedHour % 12 === 0 ? 12 : selectedHour % 12;
                angle = (rawHour / 12) * 360 - 90;
                r = radiusHours - 40;
                rad = (angle * Math.PI) / 180;
                x = center + r * Math.cos(rad);
                y = center + r * Math.sin(rad);
                hourIndicator.setAttribute("x2", x);
                hourIndicator.setAttribute("y2", y);
                hourKnob.setAttribute("cx", x);
                hourKnob.setAttribute("cy", y);
            } else {
                angle = (selectedMinute / 60) * 360 - 90;
                r = radiusMinutes - 40;
                rad = (angle * Math.PI) / 180;
                x = center + r * Math.cos(rad);
                y = center + r * Math.sin(rad);
                minuteIndicator.setAttribute("x2", x);
                minuteIndicator.setAttribute("y2", y);
                minuteKnob.setAttribute("cx", x);
                minuteKnob.setAttribute("cy", y);
            }
        }

        function getAngle(cx, cy, x, y) {
            return Math.atan2(y - cy, x - cx) * 180 / Math.PI + 90;
        }

        function dragKnob(knobType) {
            const knob = knobType === "hour" ? hourKnob : minuteKnob;
            const rCircle = knobType === "hour" ? radiusHours : radiusMinutes;

            knob.style.pointerEvents = "all"; // ensure knob is draggable

            knob.addEventListener("pointerdown", e => {
                e.preventDefault();
                knob.setPointerCapture(e.pointerId);

                const moveHandler = ev => {
                    const rect = $svg.getBoundingClientRect();
                    const x = ev.clientX - rect.left;
                    const y = ev.clientY - rect.top;
                    let angle = getAngle(center, center, x, y);
                    if (angle < 0) angle += 360;

                    if (knobType === "hour") {
                        const hour = Math.round(angle / 30) % 12 || 12;
                        selectedHour = selectedAMPM === "PM" && hour !== 12
                            ? hour + 12
                            : (selectedAMPM === "AM" && hour === 12 ? 0 : hour);

                        updateIndicator("hour");
                        $popup.find(".vintimepicker--circle__hour")
                            .removeClass("vintimepicker--selected__hour");
                        $popup.find(`.vintimepicker--circle__hour[data-hour='${hour}']`)
                            .addClass("vintimepicker--selected__hour");
                        $popup.find(".vintimepicker--timeinputs__hour").val(padHour(hour));
                    } else {
                        const minute = Math.round(angle / 6) % 60;
                        selectedMinute = minute;

                        updateIndicator("minute");
                        $popup.find(".vintimepicker--circle__minute")
                            .removeClass("vintimepicker--selected__minute");
                        $popup.find(`.vintimepicker--circle__minute[data-minute='${Math.round(minute / 5) * 5}']`)
                            .addClass("vintimepicker--selected__minute");
                        $popup.find(".vintimepicker--timeinputs__minute").val(pad(minute));
                    }
                };

                const upHandler = ev => {
                    knob.releasePointerCapture(ev.pointerId);
                    knob.removeEventListener("pointermove", moveHandler);
                    knob.removeEventListener("pointerup", upHandler);
                };

                knob.addEventListener("pointermove", moveHandler);
                knob.addEventListener("pointerup", upHandler);
            });
        }
        dragKnob("hour");
        dragKnob("minute");

        const $hourInput = $popup.find(".vintimepicker--timeinputs__hour");
        const $minuteInput = $popup.find(".vintimepicker--timeinputs__minute");
        const $hourCircle = $popup.find(".vintimepicker--circle__hoursbg, .vintimepicker--circle__hwrapp");
        const $minuteCircle = $popup.find(".vintimepicker--circle__minutesbg, .vintimepicker--circle__mwrapp");
        const $hourIndicator = $popup.find("#vintimepicker--hour__indicators, #vintimepicker--hour__knob");
        const $minuteIndicator = $popup.find("#vintimepicker--minute__indicators, #vintimepicker--minute__knob");
        $minuteCircle.addClass("vintimepicker--circle__hidden");
        $hourCircle.removeClass("vintimepicker--circle__hidden");
        $hourInput.on("focus click", function (e) {
            e.stopPropagation();
            $minuteCircle.addClass("vintimepicker--circle__hidden");
            $hourCircle.removeClass("vintimepicker--circle__hidden");
        });
        $minuteInput.on("focus click", function (e) {
            e.stopPropagation();
            $hourCircle.addClass("vintimepicker--circle__hidden");
            $minuteCircle.removeClass("vintimepicker--circle__hidden");
        });
        $minuteIndicator.hide();
        $hourIndicator.show();
        $hourInput.on("focus click", function (e) {
            e.stopPropagation();
            $minuteCircle.addClass("vintimepicker--circle__hidden");
            $hourCircle.removeClass("vintimepicker--circle__hidden");
            $hourIndicator.fadeIn(200);
            $minuteIndicator.fadeOut(200);
        });
        $minuteInput.on("focus click", function (e) {
            e.stopPropagation();
            $hourCircle.addClass("vintimepicker--circle__hidden");
            $minuteCircle.removeClass("vintimepicker--circle__hidden");
            $minuteIndicator.fadeIn(200);
            $hourIndicator.fadeOut(200);
        });
        $popup.find("svg").on("click", ".vintimepicker--circle__hour, .vintimepicker--circle__hour *", function (e) {
            e.stopPropagation();
            const $hourG = $(this).closest(".vintimepicker--circle__hour");
            if (!$hourG.length) return;
            $popup.find(".circle-hour").removeClass("vintimepicker--selected__hour");
            $hourG.addClass("vintimepicker--selected__hour");
            const hour = parseInt($hourG.data("hour"), 10);
            selectedHour = selectedAMPM === "PM" && hour !== 12 ? hour + 12 : (selectedAMPM === "AM" && hour === 12 ? 0 : hour);
            $popup.find(".vintimepicker--timeinputs__hour").val(padHour(hour));
            updateIndicator("hour");
        });
        $popup.find("svg").on("click", ".vintimepicker--circle__minute, .vintimepicker--circle__minute *", function (e) {
            e.stopPropagation();
            const $minuteG = $(this).closest(".vintimepicker--circle__minute");
            $popup.find(".vintimepicker--circle__minute").removeClass("vintimepicker--selected__minute");
            $minuteG.addClass("vintimepicker--selected__minute");
            selectedMinute = parseInt($minuteG.data("minute"), 10);
            $popup.find(".vintimepicker--timeinputs__minute").val(pad(selectedMinute));
            updateIndicator("minute");
        });
        $hourInput.on("input", function () {
            let h = parseInt($(this).val(), 10);
            if (h >= 1 && h <= 12) {
                selectedHour = selectedAMPM === "PM" && h !== 12 ? h + 12 : (selectedAMPM === "AM" && h === 12 ? 0 : h);
                updateIndicator("hour");
            }
        });
        $minuteInput.on("input", function () {
            let m = parseInt($(this).val(), 10);
            if (m >= 0 && m < 60) {
                selectedMinute = m;
                updateIndicator("minute");
            }
        });
        $popup.find(".vindatepicker--apply__timeapply").on("click", function () {
            let hour24 = selectedHour;
            if (selectedAMPM === "PM" && hour24 !== 12) hour24 += 12;
            if (selectedAMPM === "AM" && hour24 === 12) hour24 = 0;
            const formatted = `${padHour(hour24)}:${pad(selectedMinute)} ${selectedAMPM}`;
            $input.val(formatted).trigger("change");
            $input.data("selectedTime", formatted);
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        });
        $popup.find(".vindatepicker--apply__timecancel").on("click", function () {
            $input.val("").trigger("change");
            $input.removeData("selectedTime");
            selectedHour = 12;
            selectedMinute = 0;
            selectedAMPM = "AM";
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        });
        const $amPmBtns = $popup.find(".vindatepicker--timeampm__btn");
        const $activeBg = $popup.find(".vindatepicker--timeampm__btnactive-bg");
        function moveActiveBg(value) {
            if (value === "PM") {
                $activeBg.css("transform", "translateX(100%)");
            } else {
                $activeBg.css("transform", "translateX(0)");
            }
        }
        moveActiveBg(selectedAMPM);
        $amPmBtns.on("click", function () {
            selectedAMPM = $(this).data("value");
            $amPmBtns.removeClass("active");
            $(this).addClass("active");
            moveActiveBg(selectedAMPM);
            updateIndicator("hour");
        });
    }
    if (isArrowMode) renderArrow();
    else if (isCircleMode) renderCircle();
    else renderList();
    $popup.on("click", ".vintimepicker--time__listitem", function () {
        const time = $(this).text();
        $input.val(time).trigger("change");
        $input.data("selectedTime", time);
        $popup.remove();
        $(document).off("mousedown.cuzTimePicker");
    });
    $popup.on("click", ".vindatepicker--time__hup", function () {
        selectedHour = (selectedHour + 1) % 24;
        renderArrow();
    });
    $popup.on("click", ".vindatepicker--time__hdown", function () {
        selectedHour = (selectedHour - 1 + 24) % 24;
        renderArrow();
    });
    $popup.on("click", ".vindatepicker--time__mup", function () {
        selectedMinute = (selectedMinute + 1) % 60;
        renderArrow();
    });
    $popup.on("click", ".vindatepicker--time__mdown", function () {
        selectedMinute = (selectedMinute - 1 + 60) % 60;
        renderArrow();
    });
    $popup.on("click", ".vindatepicker--apply__timeapply", function () {
        const formatted = `${padHour(selectedHour)}:${pad(selectedMinute)} ${selectedAMPM}`;
        $input.val(formatted).trigger("change");
        $input.data("selectedTime", formatted);
        $popup.remove();
        $(document).off("mousedown.cuzTimePicker");
    });
    $(document).on("mousedown.cuzTimePicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        }
    });
    return $popup;
}

function showMonthYearPicker($input) {
    let now = new Date();
    let currentYear = now.getFullYear();
    function renderMonthYear(year) {
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let currentMonth = now.getMonth();
        let selectedYear = $input.data("selectedYear");
        let selectedMonth = $input.data("selectedMonth");
        let html = "<table><tbody><tr>";
        months.forEach((m, idx) => {
            if (idx % 3 === 0 && idx > 0) html += "</tr><tr>";
            let classes = [];
            if (year > currentYear || (year === currentYear && idx > currentMonth)) classes.push("disabled");
            if (year === currentYear && idx === currentMonth) classes.push("vindatepicker--current__month");
            if (selectedYear === year && selectedMonth === idx) classes.push("vindatepicker--selected__month");
            html += `<td data-month="${idx}" data-year="${year}" class="vin--textcenter ${classes.join(" ")}">${m}</td>`;
        });
        html += "</tr></tbody></table>";
        return html;
    }
    function renderYearRange(startYear, endYear) {
        let html = "<table><tr>";
        for (let y = startYear; y <= endYear; y++) {
            if ((y - startYear) % 3 === 0 && y > startYear) html += "</tr><tr>";
            let yearClasses = [];
            if (y > currentYear) yearClasses.push("disabled");
            if (y === currentYear) yearClasses.push("vindatepicker--current__year");
            if ($input.data("selectedYear") === y) yearClasses.push("vindatepicker--selected__month");
            html += `<td data-pick-year="${y}" class="vin--textcenter ${yearClasses.join(" ")}">${y}</td>`;
        }
        html += "</tr></table>";
        return html;
    }
    function showPopup() {
        $(".vindatepicker--dropdown__wrapp").remove();
        let $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
        $input.closest("div").append($popup);
        let selectedYear = $input.data("selectedYear") || currentYear;
        let state = { year: selectedYear, view: "month" };
        function render() {
            let headerText;
            let nextStyle = "";
            let prevStyle = "";
            if (state.view === "month") {
                headerText = state.year;
                if (state.year >= currentYear) nextStyle = "style='display:none;'";
            } else {
                let startYear = Math.floor(state.year / 10) * 10;
                let endYear = startYear + 9;
                headerText = `${startYear}-${endYear}`;
                if (endYear >= currentYear) nextStyle = "style='display:none;'";
            }
            let header = `
                <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
                    <button class="vindatepicker--headernav__prev" ${prevStyle}>«</button>
                    <span class="vin--textcenter vinflex--1">${headerText}</span>
                    <button class="vindatepicker--headernav__next" ${nextStyle}>»</button>
                </div>
            `;
            let body;
            if (state.view === "month") body = renderMonthYear(state.year);
            else {
                let startYear = Math.floor(state.year / 10) * 10;
                body = renderYearRange(startYear, startYear + 9);
            }
            $popup.html(header + body);
        }
        render();
        $popup.on("click", ".vindatepicker--headernav__prev", function () {
            if (state.view === "month") state.year--;
            else state.year -= 10;
            render();
            $popup.find(".vindatepicker--headernav__next").show();
        });
        $popup.on("click", ".vindatepicker--headernav__next", function () {
            if (state.view === "month" && state.year < currentYear) state.year++;
            else if (state.view === "yearRange") {
                let startYear = Math.floor(state.year / 10) * 10;
                if (startYear + 9 < currentYear) state.year += 10;
            }
            render();
        });
        $popup.on("click", ".vindatepicker--dropdown__wrapp__headernav span", function () {
            state.view = state.view === "month" ? "yearRange" : "month";
            render();
        });
        $popup.on("click", "td[data-pick-year]", function () {
            if ($(this).hasClass("disabled")) return;
            state.year = parseInt($(this).data("pick-year"));
            state.view = "month";
            render();
        });
        $popup.on("click", "td[data-month]", function () {
            if ($(this).hasClass("disabled")) return;
            let monthIndex = parseInt($(this).data("month"));
            let year = $(this).data("year");
            $input.data("selectedMonth", monthIndex);
            $input.data("selectedYear", year);
            let monthName = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ][monthIndex];
            $input.val(monthName + " " + year).trigger("change");
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        });
        setTimeout(() => {
            $(document).on("mousedown.cuzpicker", function (e) {
                if (!$popup.is(e.target) && $popup.has(e.target).length === 0) {
                    $popup.remove();
                    $(document).off("mousedown.cuzpicker");
                }
            });
        }, 0);
        return $popup;
    }
    showPopup();
}

function showDateTimePicker($input) {
    const $container = $input.closest(".vin--datepicker__container");
    $container.find(".vindatepicker--dropdown__wrapp").remove();
    const $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $container.append($popup);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    let state = { year: today.getFullYear(), month: today.getMonth() };
    let selectedDate = null;
    let selectedHour = 12;
    let selectedMinute = 0;
    let selectedAMPM = "AM";
    let savedDate = $input.data("selectedDate");
    if (savedDate) {
        selectedDate = new Date(savedDate);
        selectedHour = $input.data("selectedHour") || 12;
        selectedMinute = $input.data("selectedMinute") || 0;
        selectedAMPM = $input.data("selectedAMPM") || "AM";
        state.year = selectedDate.getFullYear();
        state.month = selectedDate.getMonth();
    }
    // AM/PM Toggle
    function formatDisplay(dateObj, h, m, ampm) {
        const d = String(dateObj.getDate()).padStart(2, "0");
        const minStr = String(m).padStart(2, "0");
        return `${d} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} ${h}:${minStr} ${ampm}`;
    }
    // function renderCalendar(year, month) {
    //     const firstDay = new Date(year, month, 1);
    //     const lastDay = new Date(year, month + 1, 0);
    //     let html = `
    //         <div class="vindatepicker--dropdown__wrapp__headernav">
    //             <button class="vindatepicker--headernav__prev">«</button>
    //             <span>${months[month]} ${year}</span>
    //             <button class="vindatepicker--headernav__next" ${year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth()) ? 'disabled' : ''}>»</button>
    //         </div>
    //         <table>
    //             <thead><tr>${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => `<th>${d}</th>`).join("")}</tr></thead>
    //             <tbody><tr>
    //     `;
    //     for (let i = 0; i < firstDay.getDay(); i++) html += "<td></td>";
    //     for (let d = 1; d <= lastDay.getDate(); d++) {
    //         let dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    //         let dateObj = new Date(year, month, d);
    //         let classes = [];
    //         if (dateObj > today) classes.push("disabled");
    //         if (selectedDate && dateObj.toDateString() === selectedDate.toDateString()) classes.push("vindatepicker--selected__date");
    //         if (dateObj.toDateString() === today.toDateString()) classes.push("vindatepicker--current__date");
    //         html += `<td data-date="${dateStr}" class="${classes.join(" ")}">${d}</td>`;
    //         if ((d + firstDay.getDay()) % 7 === 0) html += "</tr><tr>";
    //     }
    //     html += "</tr></tbody></table>";
    //     return html;
    // }
    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthLastDay = new Date(year, month, 0);
        let html = `
        <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
            <button class="vindatepicker--headernav__prev">«</button>
            <span class="vin--textcenter vinflex--1">${months[month]} ${year}</span>
            <button class="vindatepicker--headernav__next" ${year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth()) ? 'disabled' : ''}>»</button>
        </div>
        <table>
            <thead><tr>${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => `<th>${d}</th>`).join("")}</tr></thead>
            <tbody><tr>
    `;
        for (let i = 0; i < firstDay.getDay(); i++) {
            let dateNum = prevMonthLastDay.getDate() - firstDay.getDay() + 1 + i;
            let dateStr = `${prevMonthLastDay.getFullYear()}-${String(prevMonthLastDay.getMonth() + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
            html += `<td data-date="${dateStr}" class="disabled prev__month vin--textcenter">${dateNum}</td>`;
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            let dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            let dateObj = new Date(year, month, d);
            let classes = [];
            if (dateObj > today) classes.push("disabled");
            if (selectedDate && dateObj.toDateString() === selectedDate.toDateString()) classes.push("vindatepicker--selected__date");
            if (dateObj.toDateString() === today.toDateString()) classes.push("vindatepicker--current__date");
            html += `<td data-date="${dateStr}" class="vin--textcenter ${classes.join(" ")}">${d}</td>`;
            if ((d + firstDay.getDay()) % 7 === 0) html += "</tr><tr>";
        }
        const totalCells = firstDay.getDay() + lastDay.getDate();
        const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= nextMonthDays; d++) {
            let nextDate = new Date(year, month + 1, d);
            let dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            html += `<td data-date="${dateStr}" class="disabled next__month vin--textcenter">${d}</td>`;
        }
        html += "</tr></tbody></table>";
        return html;
    }
    function renderTimePicker() {
        return `
          <div class="vindatepicker--time__toggle vinflex vinflex--justifycenter vinflex--alignitemscenter vin--textcenter">
              <i class="fa fa-clock time-icon"></i>
          </div>
          <div class="vindatepicker--timepicker hidden">
            <div class="vindatepicker--timepicker__select vinflex vinflex--justifycenter vinflex--alignitemscenter">
                <div class="vindatepicker--time__control vinflex vinflex--justifycenter vinflex--alignitemscenter vinflex--1">
                    <div class="vindatepicker--time__controlselect vinflex vinflex--alignitemscenter">
                        <div class="vindatepicker--time__unit vinflex vinflex--justifycenter vinflex--alignitemscenter vinflex--1 vin--textcenter">
                            <button class="vindatepicker--time__hup">▲</button>
                            <div class="vindatepicker--time__hval">${selectedHour}</div>
                            <button class="vindatepicker--time__hdown">▼</button>
                        </div> 
                        <span>:</span>
                        <div class="vindatepicker--time__unit vinflex vinflex--justifycenter vinflex--alignitemscenter vinflex--1 vin--textcenter">
                            <button class="vindatepicker--time__mup">▲</button>
                            <div class="vindatepicker--time__mval">${String(selectedMinute).padStart(2, '0')}</div>
                            <button class="vindatepicker--time__mdown">▼</button>
                        </div>
                    </div>
                    <!-- AM/PM Toggle -->
                    <div class="vindatepicker--time__ampm" style="text-align:center; margin-top:10px;">
                        <div class="vindatepicker--time__ampmgroup vin--inflex">
                            <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}" data-value="AM">AM</button>
                            <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}" data-value="PM">PM</button>
                            <div class="vindatepicker--timeampm__btnactive-bg"></div>
                        </div>
                    </div>
                </div>
                <div class="vindatepicker--apply__time vinflex vin--textcenter">
                    <button class="vindatepicker--apply__timecancel">Cancel</button>
                    <button class="vindatepicker--apply__timeapply">Apply</button>
                </div>
            </div>
          </div>
        `;
    }
    function render() {
        $popup.html(`
            <div class="vindatepicker--calendar__wrapper">${renderCalendar(state.year, state.month)}</div>
            ${renderTimePicker()}
        `);
    }
    render();
    $popup.on("click", ".vindatepicker--headernav__prev", function () {
        state.month--;
        if (state.month < 0) { state.month = 11; state.year--; }
        render();
    });
    $popup.on("click", ".vindatepicker--headernav__next:not([disabled])", function () {
        state.month++;
        if (state.month > 11) { state.month = 0; state.year++; }
        render();
    });
    $popup.on("click", "td[data-date]:not(.disabled):not(.vindatepicker--less__date)", function () {
        const dateStr = $(this).data("date");
        selectedDate = new Date(dateStr + "T00:00:00");
        render();
        const $timepicker = $popup.find(".vindatepicker--timepicker");
        if ($timepicker.length) {
            $timepicker.hide().removeClass("hidden").slideDown();
        }

    });
    $popup.on("click", ".time-icon", function () {
        const $timepicker = $popup.find(".vindatepicker--timepicker");
        if ($timepicker.hasClass("hidden")) $timepicker.hide().removeClass("hidden").slideDown();
        else $timepicker.slideUp(() => $timepicker.addClass("hidden"));
    });
    $popup.on("click", ".vindatepicker--time__hup", function () {
        selectedHour = selectedHour % 12 + 1;
        $popup.find(".vindatepicker--time__hval").text(selectedHour);
    });
    $popup.on("click", ".vindatepicker--time__hdown", function () {
        selectedHour = (selectedHour - 1 || 12);
        $popup.find(".vindatepicker--time__hval").text(selectedHour);
    });
    $popup.on("click", ".vindatepicker--time__mup", function () {
        selectedMinute = (selectedMinute + 1) % 60;
        $popup.find(".vindatepicker--time__mval").text(String(selectedMinute).padStart(2, '0'));
    });
    $popup.on("click", ".vindatepicker--time__mdown", function () {
        selectedMinute = (selectedMinute - 1 + 60) % 60;
        $popup.find(".vindatepicker--time__mval").text(String(selectedMinute).padStart(2, '0'));
    });
    // AM/PM Toggle //
    let $amPmBtns = $popup.find(".vindatepicker--timeampm__btn");
    let $activeBg = $popup.find(".vindatepicker--timeampm__btnactive-bg");
    function moveActiveBg(value) {
        if (value === "PM") {
            $activeBg.css("transform", "translateX(100%)");
        } else {
            $activeBg.css("transform", "translateX(0)");
        }
    }
    moveActiveBg(selectedAMPM);
    $amPmBtns.removeClass("active");
    $amPmBtns.filter(`[data-value="${selectedAMPM}"]`).addClass("active");
    $popup.off("click", ".vindatepicker--timeampm__btn");
    $popup.on("click", ".vindatepicker--timeampm__btn", function () {
        selectedAMPM = $(this).data("value");
        $amPmBtns = $popup.find(".vindatepicker--timeampm__btn");
        $activeBg = $popup.find(".vindatepicker--timeampm__btnactive-bg");
        $amPmBtns.removeClass("active");
        $(this).addClass("active");
        moveActiveBg(selectedAMPM);
    });
    $popup.on("click", ".vindatepicker--apply__timeapply", function () {
        if (!selectedDate) return notify("Please select a date first", 'danger')
        $input.val(formatDisplay(selectedDate, selectedHour, selectedMinute, selectedAMPM)).trigger("change");
        $input.data("selectedDate", selectedDate.toISOString());
        $input.data("selectedHour", selectedHour);
        $input.data("selectedMinute", selectedMinute);
        $input.data("selectedAMPM", selectedAMPM);
        $popup.remove();
    });
    $popup.on("click", ".vindatepicker--apply__timecancel", function () {
        selectedHour = 12;
        selectedMinute = 0;
        selectedAMPM = "AM";
        $popup.find("td.vindatepicker--selected__date").removeClass("vindatepicker--selected__date");
        $input.val("").trigger("change");
        $input.removeData("selectedDate");
        $input.removeData("selectedHour");
        $input.removeData("selectedMinute");
        $input.removeData("selectedAMPM");

        $popup.remove();
    });
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
}

// $("body").on("click", ".vindatepicker input", function () {
//     let $input = $(this);
//     showDatePicker($input);
// });

// $("body").on("click", ".vinmonthyearpicker input", function () {
//     let $input = $(this);
//     showMonthYearPicker($input);
// });

// $(".vindaterange--from__date, .vindaterange--to__date").on("focus", function () {
//     showDateRangePicker($(this));
// });

// $("body").on("click", ".vindatetimepicker input", function () {
//     let $input = $(this);
//     showDateTimePicker($input);
// });

// $("body").on("click", ".vintimepicker input", function () {
//     showTimePicker($(this));
// });

$(document).ready(function () {
    const observer = new MutationObserver(() => {
        $(".vin--datepicker__container").each(function () {
            let $container = $(this);
            let $popup = $container.find(".vindatepicker--dropdown__wrapp");
            if ($popup.length && $popup.is(":visible")) {
                $container.addClass("datepicker-visible");
            } else {
                $container.removeClass("datepicker-visible");
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    $("body").on("focus click",
        ".vinmonthyearpicker input, \
         .vindaterangepicker input, \
         .vindatetimepicker input, \
         .vintimepicker input, \
         .vindatepicker input",
        function () {
            let $container = $(this).closest(".vin--datepicker__container");
            let $popup = $container.find(".vindatepicker--dropdown__wrapp");

            if ($popup.length && $popup.is(":visible")) {
                $container.addClass("datepicker-visible");
            } else {
                $container.removeClass("datepicker-visible");
            }
        }
    );
});

$("body").on("input change",
    ".vinmonthyearpicker input, \
     .vindaterangepicker input, \
     .vindatetimepicker input, \
     .vintimepicker input, \
     .vindatepicker input",
    function () {
        let $container = $(this).closest(".vin--datepicker__container");
        let $clearBtn = $container.find(".clear__selected__month");

        if ($(this).val().trim() !== "") {
            $clearBtn.show();
        } else {
            $clearBtn.hide();
        }
    }
);

$("body").on("click", ".clear__selected__month", function () {
    let $container = $(this).closest(".vin--datepicker__container");
    let $input = $container.find("input");
    $input.removeData("selectedDate");
    $input.removeData("selectedMonth");
    $input.removeData("selectedYear");
    $input.removeData("selectedTime");
    $container.find("td.vindatepicker--selected__date, .vindatepicker--selected__date").removeClass("vindatepicker--selected__date");
    $container.find("td.vindatepicker--selected__month").removeClass("vindatepicker--selected__month");
    $input.val("").trigger("change");
    $(this).hide()
    $('.vindatepicker--dropdown__wrapp').remove();
});
$("body").on("click", ".calendar-button", function () {
    $(this).parents('.vin--datepicker__container').find('input').click();
    $(this).parents('.vin--datepicker__container').find('input.vindaterange--from__date').focus();
    $(this).parents('.vin--datepicker__container').find('input.vindaterange--to__date').focus();
});
