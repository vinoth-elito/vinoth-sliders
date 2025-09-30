function showDateRangePicker($input) {
    $input = $($input);
    const today = new Date();
    const $container = $($input.closest(".vin--datepicker__container"));
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

(() => {
    const dateRangeInputs = document.querySelectorAll(".vindaterange--from__date, .vindaterange--to__date");
    dateRangeInputs.forEach(input => {
        input.addEventListener("focus", function () {
            showDateRangePicker(this);
        });
    });
})();