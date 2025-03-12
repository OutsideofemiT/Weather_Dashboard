"use strict";
(function () { const t = document.createElement("link").relList; if (t && t.supports && t.supports("modulepreload"))
    return; for (const n of document.querySelectorAll('link[rel="modulepreload"]'))
    o(n); new MutationObserver(n => { for (const c of n)
    if (c.type === "childList")
        for (const s of c.addedNodes)
            s.tagName === "LINK" && s.rel === "modulepreload" && o(s); }).observe(document, { childList: !0, subtree: !0 }); function r(n) { const c = {}; return n.integrity && (c.integrity = n.integrity), n.referrerPolicy && (c.referrerPolicy = n.referrerPolicy), n.crossOrigin === "use-credentials" ? c.credentials = "include" : n.crossOrigin === "anonymous" ? c.credentials = "omit" : c.credentials = "same-origin", c; } function o(n) { if (n.ep)
    return; n.ep = !0; const c = r(n); fetch(n.href, c); } })();
const p = document.getElementById("search-form"), f = document.getElementById("search-input"), h = document.querySelector("#today"), d = document.querySelector("#forecast"), i = document.getElementById("history"), l = document.getElementById("search-title"), m = document.getElementById("weather-img"), E = document.getElementById("temp"), g = document.getElementById("wind"), w = document.getElementById("humidity"), b = async (e) => { try {
    const t = await fetch("/api/weather/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city: e }) });
    if (!t.ok) {
        const o = t.headers.get("content-type");
        if (o && o.includes("application/json")) {
            const n = await t.json();
            throw console.error("Server responded with an error:", n), new Error("Server error");
        }
        else {
            const n = await t.text();
            throw console.error("Server responded with an error:", n), new Error("Server error");
        }
    }
    const r = await t.json();
    console.log("weatherData:", r), I(r.weather[0]), D(r.weather.slice(1));
}
catch (t) {
    console.error("Error fetching weather data:", t);
} }, x = async () => await fetch("/api/weather/history", { method: "GET", headers: { "Content-Type": "application/json" } }), H = async (e) => { await fetch(`/api/weather/history/${e}`, { method: "DELETE", headers: { "Content-Type": "application/json" } }); }, I = e => { const { city: t, date: r, icon: o, iconDescription: n, tempF: c, windSpeed: s, humidity: a } = e; l.textContent = `${t} (${r})`, m.setAttribute("src", `https://openweathermap.org/img/w/${o}.png`), m.setAttribute("alt", n), m.setAttribute("class", "weather-img"), l.querySelector("img") || l.append(m), E.textContent = `Temp: ${c}°F`, g.textContent = `Wind: ${s} MPH`, w.textContent = `Humidity: ${a} %`, h && (h.innerHTML = "", h.append(l, E, g, w)); }, D = e => { const t = document.createElement("div"), r = document.createElement("h4"); t.setAttribute("class", "col-12"), r.textContent = "5-Day Forecast:", t.append(r), d && (d.innerHTML = "", d.append(t)); for (let o = 0; o < e.length; o++)
    T(e[o]); }, T = e => { const { date: t, icon: r, iconDescription: o, tempF: n, windSpeed: c, humidity: s } = e, { col: a, cardTitle: L, weatherIcon: y, tempEl: C, windEl: S, humidityEl: v } = A(); L.textContent = t, y.setAttribute("src", `https://openweathermap.org/img/w/${r}.png`), y.setAttribute("alt", o), C.textContent = `Temp: ${n} °F`, S.textContent = `Wind: ${c} MPH`, v.textContent = `Humidity: ${s} %`, d && d.append(a); }, B = async (e) => { const t = await e.json(); if (i) {
    i.innerHTML = "", t.length || (i.innerHTML = '<p class="text-center">No Previous Search History</p>');
    for (let r = t.length - 1; r >= 0; r--) {
        const o = P(t[r]);
        i.append(o);
    }
} }, A = () => { const e = document.createElement("div"), t = document.createElement("div"), r = document.createElement("div"), o = document.createElement("h5"), n = document.createElement("img"), c = document.createElement("p"), s = document.createElement("p"), a = document.createElement("p"); return e.append(t), t.append(r), r.append(o, n, c, s, a), e.classList.add("col-auto"), t.classList.add("forecast-card", "card", "text-white", "bg-primary", "h-100"), r.classList.add("card-body", "p-2"), o.classList.add("card-title"), c.classList.add("card-text"), s.classList.add("card-text"), a.classList.add("card-text"), { col: e, cardTitle: o, weatherIcon: n, tempEl: c, windEl: s, humidityEl: a }; }, $ = e => { const t = document.createElement("button"); return t.setAttribute("type", "button"), t.setAttribute("aria-controls", "today forecast"), t.classList.add("history-btn", "btn", "btn-secondary", "col-10"), t.textContent = e, t; }, F = () => { const e = document.createElement("button"); return e.setAttribute("type", "button"), e.classList.add("fas", "fa-trash-alt", "delete-city", "btn", "btn-danger", "col-2"), e.addEventListener("click", N), e; }, O = () => { const e = document.createElement("div"); return e.classList.add("display-flex", "gap-2", "col-12", "m-1"), e; }, P = e => { const t = $(e.name), r = F(); r.dataset.city = JSON.stringify(e); const o = O(); return o.append(t, r), o; }, j = e => { e.preventDefault(); const t = f.value.trim() || "San Diego"; b(t).then(() => { u(); }), f.value = ""; }, M = e => { if (e.target.matches(".history-btn")) {
    const t = e.target.textContent;
    t && b(t).then(u);
} }, N = e => { e.stopPropagation(); const t = JSON.parse(e.target.getAttribute("data-city")).id; H(t).then(u); }, u = () => x().then(B);
p == null || p.addEventListener("submit", j);
i == null || i.addEventListener("click", M);
u();
