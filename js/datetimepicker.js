function showDateTimePicker($input) {
    $input = $($input);
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
    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthLastDay = new Date(year, month, 0);
        let html = `
        <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
            <button class="vindatepicker--headernav__prev">«</button>
            <span class="vin--textcenter vinflex--1">${months[month]} ${year}</span>
            <button class="vindatepicker--headernav__next" ${year > today.getFullYear() || (year === today.getFullYear() && month
                >= today.getMonth()) ? 'disabled' : ''}>»</button>
        </div>
        <table>
            <thead>
                <tr>${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => `<th>${d}</th>`).join("")}</tr>
            </thead>
            <tbody>
                <tr>
                    `;
        for (let i = 0; i < firstDay.getDay(); i++) {
            let dateNum = prevMonthLastDay.getDate() - firstDay.getDay() + 1
                + i; let dateStr = `${prevMonthLastDay.getFullYear()}-${String(prevMonthLastDay.getMonth() +
                    1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`; html += `<td data-date="${dateStr}"
                        class="disabled prev__month vin--textcenter">${dateNum}</td>`;
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            let dateStr = `${year}-${String(month + 1).padStart(2, "0"
            )}-${String(d).padStart(2, "0")}`; let dateObj = new Date(year, month, d); let classes = []; if
                (dateObj > today) classes.push("disabled");
            if (selectedDate && dateObj.toDateString() === selectedDate.toDateString())
                classes.push("vindatepicker--selected__date");
            if (dateObj.toDateString() === today.toDateString()) classes.push("vindatepicker--current__date");
            html += `<td data-date="${dateStr}" class="vin--textcenter ${classes.join(" ")}">${d}</td>`;
            if ((d + firstDay.getDay()) % 7 === 0) html += "</tr><tr>";
        }
        const totalCells = firstDay.getDay() + lastDay.getDate();
        const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= nextMonthDays; d++) {
            let nextDate = new Date(year, month + 1, d); let
                dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0"
                )}-${String(d).padStart(2, "0")}`; html += `<td data-date="${dateStr}"
                        class="disabled next__month vin--textcenter">${d}</td>`;
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
                        <div
                            class="vindatepicker--time__unit vinflex vinflex--justifycenter vinflex--alignitemscenter vinflex--1 vin--textcenter">
                            <button class="vindatepicker--time__hup">▲</button>
                            <div class="vindatepicker--time__hval">${selectedHour}</div>
                            <button class="vindatepicker--time__hdown">▼</button>
                        </div>
                        <span>:</span>
                        <div
                            class="vindatepicker--time__unit vinflex vinflex--justifycenter vinflex--alignitemscenter vinflex--1 vin--textcenter">
                            <button class="vindatepicker--time__mup">▲</button>
                            <div class="vindatepicker--time__mval">${String(selectedMinute).padStart(2, '0')}</div>
                            <button class="vindatepicker--time__mdown">▼</button>
                        </div>
                    </div>
                    <!-- AM/PM Toggle -->
                    <div class="vindatepicker--time__ampm" style="text-align:center; margin-top:10px;">
                        <div class="vindatepicker--time__ampmgroup vin--inflex">
                            <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}"
                                data-value="AM">AM</button>
                            <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}"
                                data-value="PM">PM</button>
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
        if (state.month < 0) { state.month = 11; state.year--; } render();
    });
    $popup.on("click", ".vindatepicker--headernav__next:not([disabled])", function () {
        state.month++; if (state.month >
            11) { state.month = 0; state.year++; }
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
        if (!selectedDate) return alert("Please select a date first", 'danger')
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

document.body.addEventListener("click", function (event) {
    if (event.target.matches(".vindatetimepicker input")) {
        showDateTimePicker(event.target);
    }
});

