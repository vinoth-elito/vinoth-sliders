function showDatePicker($input) {
    $input = $($input);
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
        let html = `
<table>
<thead>
    <tr>
        ${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => `<th>${d}</th>`).join("")}
    </tr>
</thead>
<tbody>
    <tr>
        `;

        for (let i = firstDayIndex - 1; i >= 0; i--) {
            let prevDate = prevMonthLastDate - i;
            let prevMonth = month - 1 < 0 ? 11 : month - 1; let prevYear = month - 1 < 0 ? year - 1 : year; let
                dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;
            html += `<td class="vindatepicker--headernav__prev disabled vin--textcenter" data-date="${dateStr}">
            ${prevDate}
            </td>`;
        }

        for (let d = 1; d <= lastDate; d++) {
            let dateStr = `${year}-${String(month + 1).padStart(2, '0'
            )}-${String(d).padStart(2, '0')}`; let disabled = new Date(year, month, d) > today ? "disabled" : "";

            if ((d + firstDayIndex - 1) % 7 === 0 && d !== 1) {
                html += `</tr>
    <tr>`;
            }

            html += `<td data-date="${dateStr}" class="vin--textcenter ${disabled}">${d}</td>`;
        }

        const lastDayIndex = new Date(year, month, lastDate).getDay();
        const nextMonth = month + 1 > 11 ? 0 : month + 1;
        const nextYear = month + 1 > 11 ? year + 1 : year;

        for (let i = 1; i < 7 - lastDayIndex; i++) {
            let dateStr = `${nextYear}-${String(nextMonth +
                1).padStart(2, '0')}-${String(i).padStart(2, '0')}`; html += `<td
            class="vindatepicker--headernav__next disabled vin--textcenter" data-date="${dateStr}">
            ${i}
            </td>`;
        }

        html += `
    </tr>
</tbody>
</table>
`;
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
        if (state.month < 0) { state.month = 11; state.year--; } render();
    });
    $popup.on("click", ".vindatepicker--headernav__next:not([disabled])", function () {
        state.month++; if (state.month >
            11) { state.month = 0; state.year++; }
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
document.body.addEventListener("click", function (event) {
    if (event.target.matches(".vindatepicker input")) {
        showDatePicker(event.target);
    }
});
$(document).ready(function () {
    initVinDatePickers();
});

function initVinDatePickers() {
    (function ($) {
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
            $input.removeData("selectedDate selectedMonth selectedYear selectedTime");
            $container.find("td.vindatepicker--selected__date, .vindatepicker--selected__date")
                .removeClass("vindatepicker--selected__date");
            $container.find("td.vindatepicker--selected__month")
                .removeClass("vindatepicker--selected__month");
            $input.val("").trigger("change");
            $(this).hide();
            $('.vindatepicker--dropdown__wrapp').remove();
        });
        $("body").on("click", ".calendar-button", function () {
            let $container = $(this).parents('.vin--datepicker__container');
            $container.find('input').click();
            $container.find('input.vindaterange--from__date').focus();
            $container.find('input.vindaterange--to__date').focus();
        });
    })(window.jQuery);
}