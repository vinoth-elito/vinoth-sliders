function showTimePicker($input) {
    $input = $($input);
    const $container = $($input).closest(".vintimepicker");
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
        for (let h = 0; h < 24; h++) { for (let m = 0; m < 60; m += 30) times.push(formatTime(h, m)); } const
            currentTimeExact = formatTime(now.getHours(), now.getMinutes()); if (!times.includes(currentTimeExact))
            times.push(currentTimeExact); times.sort((a, b) => {
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
                <!-- AM/PM Toggle -->
                <div class="vindatepicker--time__ampm" style="margin-top: 10px; text-align: center;">
                    <div class="vindatepicker--time__ampmgroup vin--inflex">
                        <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}" data-value="AM">AM</button>
                        <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}" data-value="PM">PM</button>
                        <div class="vindatepicker--timeampm__btnactive-bg"></div>
                    </div>
                </div>
                <div class="vintimepicker--time__actions vinflex vin--textcenter">
                    <button class="vindatepicker--apply__timecancel">Cancel</button>
                    <button class="vindatepicker--apply__timeapply">Apply</button>
                </div>
            </div>
        `);

        const $hourVal = $popup.find(".vindatepicker--time__hval");
        const $minuteVal = $popup.find(".vindatepicker--time__mval");
        $popup.find(".vindatepicker--time__hup").on("click", () => { selectedHour = (selectedHour + 1) % 24; renderArrow(); });
        $popup.find(".vindatepicker--time__hdown").on("click", () => { selectedHour = (selectedHour - 1 + 24) % 24; renderArrow(); });
        $popup.find(".vindatepicker--time__mup").on("click", () => { selectedMinute = (selectedMinute + 1) % 60; renderArrow(); });
        $popup.find(".vindatepicker--time__mdown").on("click", () => { selectedMinute = (selectedMinute - 1 + 60) % 60; renderArrow(); });

        // AM/PM Toggle
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
        });

        $popup.find(".vindatepicker--apply__timecancel").on("click", function () {
            $popup.remove();
        });
    }
    function renderCircle() {
        const radiusHours = 130;
        const radiusMinutes = 130;
        const center = radiusHours + 40;
        let svg = `<div class="vintimepicker--round__clock"><svg class="vintimepicker--circle__clock" width="${2 * center}"
                height="${2 * center}" viewBox="0 0 ${2 * center} ${2 * center}" style="display:block;margin:auto;">
                <circle cx="${center}" cy="${center}" r="${radiusMinutes}" class="vintimepicker--circle__minutesbg">
                </circle>
                <circle cx="${center}" cy="${center}" r="${radiusHours}" class="vintimepicker--circle__hoursbg"></circle>
                <g class="vintimepicker--circle__hwrapp">`;
        for (let h = 1; h <= 12; h++) {
            const angle = (h / 12) * 360 - 90; const rad = (angle * Math.PI) / 180;
            const x = center + radiusHours * Math.cos(rad); const y = center + radiusHours * Math.sin(rad); const
                cls = ((selectedHour % 12) === (h % 12)) ? "vintimepicker--selected__hour" : ""; svg += ` <g
                        class="vintimepicker--circle__hour ${cls}" data-hour="${h}" transform="translate(${x},${y})">
                        <circle r="14" class="vintimepicker--circle__hourbg"></circle>
                        <text text-anchor="middle" alignment-baseline="middle">${h}</text>
                </g>`;
        }
        svg += `</g>
                <g class="vintimepicker--circle__mwrapp">`;
        for (let i = 0; i < 60; i += 5) {
            const angle = (i / 60) * 360 - 90; const rad = (angle * Math.PI) / 180;
            const x = center + radiusMinutes * Math.cos(rad); const y = center + radiusMinutes * Math.sin(rad);
            const cls = (selectedMinute === i) ? "vintimepicker--selected__minute" : ""; svg += ` <g
                        class="vintimepicker--circle__minute ${cls}" data-minute="${i}" transform="translate(${x},${y})">
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
                    <circle id="vintimepicker--hour__knob" class="vintimepicker--draggable__hour" cx="${hourX}"
                        cy="${hourY}" r="8" fill="red" cursor="pointer" style="pointer-events: all;" />
                    <circle id="vintimepicker--minute__knob" class="vintimepicker--draggable__minute" cx="${minX}"
                        cy="${minY}" r="8" fill="blue" cursor="pointer" style="pointer-events: all;" />
                </g>
            </svg>
    
            <div class="vintimepicker--circle__timeinputs" style="text-align:center; margin-top:10px;">
                <input type="number" class="vintimepicker--timeinputs__hour" value="${padHour(selectedHour)}" min="1"
                    max="12" readonly style="width:40px; text-align:center;">
                <span>:</span>
                <input type="number" class="vintimepicker--timeinputs__minute" value="${pad(selectedMinute)}" min="0"
                    max="59" readonly style="width:40px; text-align:center;">
            </div>
    
            <div class="vintimepicker--circle__ampm" style="text-align:center; margin-top:10px;">
                <div class="vindatepicker--time__ampmgroup vin--inflex">
                    <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'AM' ? 'active' : ''}"
                        data-value="AM">AM</button>
                    <button class="vindatepicker--timeampm__btn ${selectedAMPM === 'PM' ? 'active' : ''}"
                        data-value="PM">PM</button>
                    <div class="vindatepicker--timeampm__btnactive-bg"></div>
                </div>
            </div>
            <div class="vintimepicker--time__actions vinflex vin--textcenter" style="margin-top:10px;">
                <button class="vindatepicker--apply__timecancel">Cancel</button>
                <button class="vindatepicker--apply__timeapply">Apply</button>
            </div>
        </div>`;

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
            knob.style.pointerEvents = "all";
            knob.addEventListener("pointerdown", e => {
                e.preventDefault();
                knob.setPointerCapture(e.pointerId);
                const moveHandler = ev => {
                    const rect = $svg.getBoundingClientRect();
                    const x = ev.clientX - rect.left;
                    const y = ev.clientY - rect.top;
                    let angle = getAngle(center, center, x, y);
                    if (angle < 0) angle += 360; if (knobType === "hour") {
                        const hour = Math.round(angle / 30) % 12 ||
                            12; selectedHour = selectedAMPM === "PM" && hour !== 12 ? hour + 12 : (selectedAMPM === "AM" && hour === 12 ? 0 : hour);
                        updateIndicator("hour"); $popup.find(".vintimepicker--circle__hour").removeClass("vintimepicker--selected__hour");
                        $popup.find(`.vintimepicker--circle__hour[data-hour='${hour}' ]`).addClass("vintimepicker--selected__hour");
                        $popup.find(".vintimepicker--timeinputs__hour").val(padHour(hour));
                    } else {
                        const minute = Math.round(angle / 6) % 60; selectedMinute = minute;
                        updateIndicator("minute"); $popup.find(".vintimepicker--circle__minute")
                            .removeClass("vintimepicker--selected__minute");
                        $popup.find(`.vintimepicker--circle__minute[data-minute='${Math.round(minute / 5) * 5}' ]`)
                            .addClass("vintimepicker--selected__minute"); $popup.find(".vintimepicker--timeinputs__minute").val(pad(minute));
                    }
                }; const upHandler = ev => {
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
            selectedHour = selectedAMPM === "PM" && hour !== 12 ? hour + 12 : (selectedAMPM === "AM" && hour === 12 ? 0 :
                hour);
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
                selectedHour = selectedAMPM === "PM" && h !== 12 ? h + 12 : (selectedAMPM === "AM" && h === 12 ?
                    0 : h); updateIndicator("hour");
            }
        }); $minuteInput.on("input", function () {
            let m = parseInt($(this).val(),
                10); if (m >= 0 && m < 60) { selectedMinute = m; updateIndicator("minute"); }
        });
        $popup.find(".vindatepicker--apply__timeapply").on("click", function () {
            let hour24 = selectedHour; if
                (selectedAMPM === "PM" && hour24 !== 12) hour24 += 12; if (selectedAMPM === "AM" && hour24 === 12) hour24 = 0;
            const formatted = `${padHour(hour24)}:${pad(selectedMinute)} ${selectedAMPM}`;
            $input.val(formatted).trigger("change"); $input.data("selectedTime", formatted); $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        });
        $popup.find(".vindatepicker--apply__timecancel").on("click", function () {
            $input.val("").trigger("change"); $input.removeData("selectedTime"); selectedHour = 12; selectedMinute = 0;
            selectedAMPM = "AM"; $popup.remove(); $(document).off("mousedown.cuzTimePicker");
        }); const
            $amPmBtns = $popup.find(".vindatepicker--timeampm__btn"); const
                $activeBg = $popup.find(".vindatepicker--timeampm__btnactive-bg"); function moveActiveBg(value) {
                    if
                        (value === "PM") { $activeBg.css("transform", "translateX(100%)"); } else {
                        $activeBg.css("transform", "translateX(0)");
                    }
                } moveActiveBg(selectedAMPM); $amPmBtns.on("click",
                    function () {
                        selectedAMPM = $(this).data("value"); $amPmBtns.removeClass("active");
                        $(this).addClass("active"); moveActiveBg(selectedAMPM); updateIndicator("hour");
                    });
    } if (isArrowMode)
        renderArrow(); else if (isCircleMode) renderCircle(); else renderList();
    $popup.on("click", ".vintimepicker--time__listitem", function () {
        const time = $(this).text();
        $input.val(time).trigger("change"); $input.data("selectedTime", time); $popup.remove();
        $(document).off("mousedown.cuzTimePicker");
    }); $popup.on("click", ".vindatepicker--time__hup",
        function () { selectedHour = (selectedHour + 1) % 24; renderArrow(); });
    $popup.on("click", ".vindatepicker--time__hdown", function () {
        selectedHour = (selectedHour - 1 + 24) %
            24; renderArrow();
    }); $popup.on("click", ".vindatepicker--time__mup", function () {
        selectedMinute = (selectedMinute + 1) % 60; renderArrow();
    });
    $popup.on("click", ".vindatepicker--time__mdown", function () {
        selectedMinute = (selectedMinute - 1 +
            60) % 60; renderArrow();
    }); $popup.on("click", ".vindatepicker--apply__timeapply", function () {
        const
            formatted = `${padHour(selectedHour)}:${pad(selectedMinute)} ${selectedAMPM}`;
        $input.val(formatted).trigger("change"); $input.data("selectedTime", formatted); $popup.remove();
        $(document).off("mousedown.cuzTimePicker");
    }); $(document).on("mousedown.cuzTimePicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzTimePicker");
        }
    }); return $popup;
}

document.body.addEventListener("click", function (event) {
    if (event.target.matches(".vintimepicker input")) {
        showTimePicker(event.target);
    }
});