function showMonthYearPicker($input) {
    $input = $($input);
    let now = new Date();
    let currentYear = now.getFullYear();
    function renderMonthYear(year) {
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let currentMonth = now.getMonth();
        let selectedYear = $input.data("selectedYear");
        let selectedMonth = $input.data("selectedMonth");
        let html = `
<table>
    <tbody>
        <tr>
            `;

        months.forEach((m, idx) => {
            if (idx % 3 === 0 && idx > 0) {
                html += `
        </tr>
        <tr>
            `;
            }

            let classes = [];
            if (year > currentYear || (year === currentYear && idx > currentMonth)) {
                classes.push("disabled");
            }
            if (year === currentYear && idx === currentMonth) {
                classes.push("vindatepicker--current__month");
            }
            if (selectedYear === year && selectedMonth === idx) {
                classes.push("vindatepicker--selected__month");
            }

            html += `
            <td data-month="${idx}" data-year="${year}" class="vin--textcenter ${classes.join(" ")}">
                ${m}
            </td>
            `;
        });

        html += `
        </tr>
    </tbody>
</table>
`;
        return html;
    }
    function renderYearRange(startYear, endYear) {
        let html = `
<table>
    <tr>
        `;

        for (let y = startYear; y <= endYear; y++) {
            if ((y - startYear) % 3 === 0 && y > startYear) {
                html += `
    </tr>
    <tr>
        `;
            }

            let yearClasses = [];
            if (y > currentYear) {
                yearClasses.push("disabled");
            }
            if (y === currentYear) {
                yearClasses.push("vindatepicker--current__year");
            }
            if ($input.data("selectedYear") === y) {
                yearClasses.push("vindatepicker--selected__month");
            }

            html += `
        <td data-pick-year="${y}" class="vin--textcenter ${yearClasses.join(" ")}">
            ${y}
        </td>
        `;
        }

        html += `
    </tr>
</table>
`;
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
            if (state.view === "month" && state.year < currentYear) state.year++; else if (state.view === "yearRange") {
                let
                    startYear = Math.floor(state.year / 10) * 10; if (startYear + 9 < currentYear) state.year += 10;
            } render();
        });
        $popup.on("click", ".vindatepicker--dropdown__wrapp__headernav span", function () {
            state.view = state.view === "month"
                ? "yearRange" : "month"; render();
        }); $popup.on("click", "td[data-pick-year]", function () {
            if
                ($(this).hasClass("disabled")) return; state.year = parseInt($(this).data("pick-year")); state.view = "month";
            render();
        }); $popup.on("click", "td[data-month]", function () {
            if ($(this).hasClass("disabled")) return; let
                monthIndex = parseInt($(this).data("month")); let year = $(this).data("year"); $input.data("selectedMonth", monthIndex);
            $input.data("selectedYear", year); let monthName = ["January", "February", "March", "April", "May", "June"
                , "July", "August", "September", "October", "November", "December"][monthIndex]; $input.val(monthName + " " +
                    year).trigger("change"); $popup.remove(); $(document).off("mousedown.cuzpicker");
        }); setTimeout(() => {
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
document.body.addEventListener("click", function (event) {
    if (event.target.matches(".vinmonthyearpicker input")) {
        showMonthYearPicker(event.target);
    }
});