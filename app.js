        // Безпечний розбір значень із localStorage: за пошкоджених/невалідних даних
        // повертає fallback замість того, щоб кидати виняток і ламати ініціалізацію (B1).
        function safeParse(raw, fallback) {
            if (raw === null || raw === undefined) return fallback;
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.warn('[safeParse] Пошкоджені дані у сховищі, використано значення за замовчуванням:', e);
                return fallback;
            }
        }

        // Екранує текст перед вставкою в innerHTML, щоб дані користувача/AI зі спецсимволами
        // не ламали верстку й не давали ін'єкції розмітки (B5).
        function escapeHtml(value) {
            if (value === null || value === undefined) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // Делегування подій (O8): елемент з data-action викликає глобальну функцію за іменем.
        // Працює і для динамічно доданих елементів (спливання) → можна ставити data-action
        // навіть у JS-шаблони. Співіснує з рештою inline-обробників під час поетапної міграції.
        // Мета — прибрати inline-обробники, щоб згодом зняти 'unsafe-inline' зі script-src CSP.
        (function initEventDelegation() {
            function dispatch(e) {
                const el = e.target.closest('[data-action]');
                if (!el) return;
                const fn = window[el.getAttribute('data-action')];
                if (typeof fn !== 'function') return;
                const param = el.getAttribute('data-action-param');
                fn(param !== null ? param : undefined, e, el);
            }
            document.addEventListener('click', function (e) {
                const el = e.target.closest && e.target.closest('[data-action]');
                if (el && (el.getAttribute('data-action-on') || 'click') === 'click') dispatch(e);
            });
            ['change', 'input', 'submit', 'keydown', 'keyup'].forEach(function (type) {
                document.addEventListener(type, function (e) {
                    const el = e.target.closest && e.target.closest('[data-action]');
                    if (el && el.getAttribute('data-action-on') === type) dispatch(e);
                });
            });
        })();

        // Перерендер Lucide-іконок (після динамічних вставок у DOM)
        function refreshLucide() {
            if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
        }

        // O8: wrappers для складних обробників — читають аргументи з data-* / події (типобезпечно).
        function dlg_goToStep(p, e, el) { goToStep(el.dataset.scenario, parseInt(el.dataset.step)); }
        function dlg_stop(p, e) { e.stopPropagation(); }
        function dlg_deleteTodo(p, e, el) { deleteTodoItem(Number(el.dataset.id)); }
        function dlg_dashTask(p, e, el) { togglePhaseStep(parseInt(el.dataset.phase), parseInt(el.dataset.idx)); renderDashboard(); }
        function dlg_togglePhase(p, e, el) { togglePhaseStep(parseInt(el.dataset.phase), parseInt(el.dataset.idx)); }
        function dlg_toggleNutrition(p, e, el) { toggleNutritionPhaseStep(parseInt(el.dataset.phase), parseInt(el.dataset.idx)); }
        function dlg_threat(p, e, el) { showThreatProtocol(parseInt(el.dataset.phase), el.dataset.threat); }
        function dlg_quickType(p, e, el) { setQuickLogType(el, el.dataset.type); }
        function dlg_saveCandidate() { saveAICandidate(satCheckCandidate); }
        function dlg_altMenu(p, e, el) { openAlternativeMenu(e, parseInt(el.dataset.id), parseInt(el.dataset.idx), el.dataset.kind, el.dataset.product); }
        function dlg_quicklogOverlay(p, e, el) { if (e.target === el) closeQuickLog(); }
        function dlg_clickTarget(p, e, el) { const t = document.getElementById(el.dataset.target); if (t) t.click(); }
        function dlg_changeVineyard(p, e, el) { changeVineyardQuantity(el.dataset.name, parseInt(el.dataset.delta)); }
        function dlg_changeNursery(p, e, el) { changeNurseryQuantity(el.dataset.name, parseInt(el.dataset.delta)); }
        function dlg_syncCurrent() { syncCurrentWeather(true); }
        function dlg_syncWeather() { syncWeather(true); }
        function dlg_toast(p, e, el) { showToast(el.dataset.msg, el.dataset.toast); }
        function dlg_toggleNPK(p, e, el) { toggleNPKFertilizer(parseInt(el.dataset.idx)); }
        function dlg_todoDate(p, e, el) { updateTodoCompletedDate(Number(el.dataset.id), e.target.value); }
        function dlg_soilPh(p, e, el) { updateSoilStatus(el.dataset.name, e.target.value, document.getElementById('soil-moisture-slider').value); }
        function dlg_soilMoist(p, e, el) { updateSoilStatus(el.dataset.name, document.getElementById('soil-ph-slider').value, e.target.value); }
        function dlg_phaseDate(p, e, el) { updatePhaseStepDate(parseInt(el.dataset.phase), parseInt(el.dataset.idx), el.dataset.nutri === '1', e.target.value); }
        function dlg_mixerUnit(p, e, el) { updateMixerItem(el.dataset.id, 'unit', e.target.value); }
        function dlg_setVineyard(p, e, el) { setVineyardQuantity(el.dataset.name, e.target.value); }
        function dlg_selectAlt(p, e, el) { selectedAlternativeId = el.dataset.altid; }
        function dlg_import(p, e) { importDatabase(e); }
        function dlg_prodPhoto(p, e) { handleProductPhotoUpload(e); }
        function dlg_chatFile(p, e) { handleChatFileSelect(e); }
        function dlg_soilMoistInput(p, e) { const v = e.target.value; document.getElementById('soil-moist-val-display').innerText = v + '%'; document.getElementById('soil-moist-lbl-display').innerText = getMoistureLabel(v); }
        function dlg_soilPhInput(p, e) { const v = e.target.value; const d = document.getElementById('soil-ph-val-display'); d.innerText = v; d.className = 'text-xs font-black px-2 py-0.5 rounded-md ' + getPhBadgeClass(v); document.getElementById('soil-ph-lbl-display').innerText = getPhLabel(v); }
        function dlg_mixerDose(p, e, el) { updateMixerItem(el.dataset.id, 'dose', e.target.value); }
        function dlg_mixerName(p, e, el) { updateMixerItem(el.dataset.id, 'name', e.target.value); }
        function dlg_npkDose(p, e, el) { updateNPKDose(parseInt(el.dataset.idx), e.target.value); }
        function dlg_sharedBushes(p, e) { updateSharedBushes(e.target.value); }
        function dlg_nurserySubmit(p, e) { e.preventDefault(); addNurseryItem(e); }
        function dlg_prodSubmit(p, e) { e.preventDefault(); saveCustomProduct(e); }
        function dlg_varietySubmit(p, e) { e.preventDefault(); saveCustomVariety(e); }
        function dlg_agroKey(p, e) { if (e.key === 'Enter') sendAgroChatMessage(); }

        // Debugging error handlers
        window.onerror = function(message, source, lineno, colno, error) {
            alert("JS Error: " + message + " at line " + lineno + ":" + colno + "\nSource: " + source);
            return false;
        };
        window.onunhandledrejection = function(event) {
            alert("Unhandled Promise Rejection: " + (event.reason ? (event.reason.message || event.reason) : event));
        };

        // Toast notifications utility
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            const toast = document.createElement('div');
            const toastType = type === 'danger' ? 'error' : type;
            toast.className = `toast toast-${toastType}`;
            
            let icon = 'ℹ️';
            if (toastType === 'success') icon = '✅';
            else if (toastType === 'error') icon = '❌';
            else if (toastType === 'warning') icon = '⚠️';
            
            const iconSpan = document.createElement('span');
            iconSpan.className = 'text-base';
            iconSpan.textContent = icon;
            const msgSpan = document.createElement('span');
            msgSpan.className = 'font-bold';
            msgSpan.textContent = message;
            toast.appendChild(iconSpan);
            toast.appendChild(msgSpan);
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('removing');
                toast.addEventListener('transitionend', () => {
                    toast.remove();
                });
            }, 4000);
        }

        let currentTab = 'phases';
        let currentActivePhase = 3;
        let activeVar = 'Аватар';
        let totalSAT = 0;
        let totalSET = 0;
        let thermalMode = 'sat'; // 'sat' or 'set'
        let calcMode = 'simple';
        let colorFilter = 'all';
        let sortMode = 'name';
        let chartInstance = null;

        // Persistent data loading on init
        let satHistory = [];
        let forecastDailyTemps = [];
        let phaseChecklists = {};
        let phaseNutritionChecklists = {};
        let phaseChecklistDates = {};
        let phaseNutritionChecklistDates = {};

        const defaultVarietyData = {
            "Аватар": { rip: "115-125 дн.", col: "B", taste: "Гармонійний", bunch: "700-1200 г", seed: "Безкіст.", care: "⚠️ Потребує ГК зануренням. Схильний до осипання. На зиму ретельно вкривати." },
            "Азія": { rip: "110-115 дн.", col: "R", taste: "Мускат", bunch: "600-1000 г", seed: "З кіст.", care: "⚠️ Схильний до перевантаження. Обов'язкове жорстке нормування суцвіттями." },
            "Алінка": { rip: "105-110 дн.", col: "R", taste: "Мускат", bunch: "500-850 г", seed: "З кіст.", care: "💡 Тонка шкірка — захист від ос сітками обов'язковий." },
            "Арочний": { rip: "115-120 дн.", col: "R", taste: "Гармонійний", bunch: "500-800 г", seed: "З кіст.", care: "💡 Чудово підходить для альтанок, висока зимостійкість." },
            "Антоній великий": { rip: "130-135 дн.", col: "W", taste: "Мускат", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Вразливий до оїдіуму в серпні. Обробка Луною обов'язкова." },
            "Алвіка": { rip: "115-120 дн.", col: "B", taste: "Гармонійний", bunch: "800-2000 г", seed: "З кіст.", care: "⚠️ Гігантська ягода. Залишати лише 1 гроно на пагін." },
            "Алтай": { rip: "120-125 дн.", col: "W", taste: "Легкий мускат", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Схильний до горошіння. Бор перед цвітінням!" },
            "Аркадія": { rip: "115 дн.", col: "W", taste: "Легкий мускат", bunch: "700-2500 г", seed: "З кіст.", care: "⚠️ Слабкий до оїдіуму. Класика ринку." },
            "Абажур": { rip: "115-120 дн.", col: "R", taste: "Гармонійний", bunch: "600-1100 г", seed: "З кіст.", care: "💡 Потребує помірного азоту, щоб лоза не жирувала." },
            "Альбіна": { rip: "100-105 дн.", col: "W", taste: "Мускат", bunch: "500-800 г", seed: "З кіст.", care: "💡 Вчасний збір — перестигла ягода розм'якшується." },
            "Альбатрос": { rip: "120-125 дн.", col: "B", taste: "Простий", bunch: "500-750 г", seed: "З кіст.", care: "💡 Стійкий до мілдью, але боїться сірої гнилі." },
            "Августин мускатний": { rip: "115-120 дн.", col: "W", taste: "Мускат", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Найнадійніший сорт для початківців." },
            "Байконур": { rip: "110-115 дн.", col: "B", taste: "Гармонійний", bunch: "700-1300 г", seed: "З кіст.", care: "⚠️ Схильний до кліща навесні. Санмайт обов'язково." },
            "Божена": { rip: "105-110 дн.", col: "W", taste: "Гармонійний", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Перевантаження. Лоза визріває дуже рано." },
            "Басанті": { rip: "100-105 дн.", col: "R", taste: "Мускат", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Вимагає освітлення грон для яскравого забарвлення." },
            "Багатянівський": { rip: "125 дн.", col: "W", taste: "Солодкий", bunch: "800-2000 г", seed: "З кіст.", care: "⚠️ Тріск від дощу. Хелат Кальцію обов'язково." },
            "Біла леді": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "600-900 г", seed: "З кіст.", care: "💡 Регулярне пасинкування для провітрювання." },
            "Богатир": { rip: "130-135 дн.", col: "W", taste: "Хрусткий", bunch: "1000-2500 г", seed: "З кіст.", care: "⚠️ Жирування лози. Довга обрізка (12 вічок)." },
            "Бананас": { rip: "120 дн.", col: "W", taste: "Банан/Мускат", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Слабкий до оїдіуму. Фалькон перед цвітінням." },
            "Білоцерківський": { rip: "115 дн.", col: "W", taste: "Освіжаючий", bunch: "500-800 г", seed: "З кіст.", care: "💡 Відмінно адаптований до клімату центру України." },
            "Вікінг": { rip: "105 дн.", col: "B", taste: "Фруктовий", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Осипання зав'язі. Бор + прищіпування верхівок." },
            "Вірастюк": { rip: "115 дн.", col: "B", taste: "Гармонійний", bunch: "800-1800 г", seed: "З кіст.", care: "⚠️ Сіра гниль у щільному гроні. Свіч обов'язково." },
            "Велюр": { rip: "100 дн.", col: "R", taste: "Мускат", bunch: "600-1100 г", seed: "З кіст.", care: "💡 Аміностар навесні для швидкого старту." },
            "Вогняний": { rip: "115 дн.", col: "R", taste: "Гармонійний", bunch: "700-1200 г", seed: "З кіст.", care: "💡 Колір набирає тільки на сонці. Освітлюйте грона." },
            "Вінсон": { rip: "110 дн.", col: "R", taste: "Хрусткий", bunch: "600-900 г", seed: "З кіст.", care: "💡 Стійкий до розтріскування, надійний на ринку." },
            "Воплощение": { rip: "120-125 дн.", col: "R", taste: "Гармонійний", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Потребує захисту Акробатом у червні (мілдью)." },
            "Велес": { rip: "100 дн.", col: "R", taste: "Сильний мускат", bunch: "1500-4000 г", seed: "Безкіст.", care: "⚠️ Гниль всередині. ГК до цвітіння на розтягування." },
            "Вітовський": { rip: "115-120 дн.", col: "W", taste: "Мускат/Мед", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Оїдіум у серпні. Тіовіт Джет обов'язково." },
            "Гала": { rip: "115 дн.", col: "B", taste: "Гармонійний", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Затягує дозрівання лози. Жорстке нормування." },
            "Геліодор": { rip: "100 дн.", col: "W", taste: "Мускат", bunch: "1000-3000 г", seed: "Безкіст.", care: "⚠️ Горошіння. ГК у фазі горошини 30 мг/л." },
            "Голд фінгер": { rip: "115 дн.", col: "W", taste: "Дуже солодкий", bunch: "500-850 г", seed: "З кіст.", care: "⚠️ Низька морозостійкість. Тільки сухе укриття." },
            "Гармонія": { rip: "125 дн.", col: "B", taste: "Насичений", bunch: "500-800 г", seed: "З кіст.", care: "💡 Стійкий сорт, хороший для вина та соку." },
            "Горідза": { rip: "115 дн.", col: "W", taste: "Солодкий", bunch: "700-1300 г", seed: "З кіст.", care: "⚠️ Бактеріальний рак. Уникайте травм лози." },
            "Графиня": { rip: "115-120 дн.", col: "B", taste: "Приємний", bunch: "700-1100 г", seed: "З кіст.", care: "💡 Потребує багато Калію влітку для кольору." },
            "Дамаська красуня": { rip: "120 дн.", col: "R", taste: "Мускат", bunch: "600-1000 г", seed: "З кіст.", care: "⚠️ Оїдіум. На зиму ретельно вкривати." },
            "Динька": { rip: "95 дн.", col: "R", taste: "Диня", bunch: "600-1100 г", seed: "З кіст.", care: "⚠️ Тріск від дощу. Хелат Кальцію у червні." },
            "Дубовський рожевий": { rip: "110-115 дн.", col: "R", taste: "Хрусткий", bunch: "800-2500 г", seed: "З кіст.", care: "⚠️ Слабкий колір. Калій + освітлення грон." },
            "Дубовський червоний": { rip: "115 дн.", col: "R", taste: "Хрусткий", bunch: "700-1500 г", seed: "З кіст.", care: "💡 Видалення листя за 2 тижні до збору." },
            "Давінчі": { rip: "115 дн.", col: "B", taste: "Солодкий", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Сіра гниль. Свіч у фазі змикання ягід." },
            "Діксон": { rip: "120-125 дн.", col: "R", taste: "Хрусткий", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Пізнє визрівання лози. Виключити Азот з липня." },
            "Дюшес к-ш": { rip: "115 дн.", col: "W", taste: "Груша/Мускат", bunch: "600-1200 г", seed: "Безкіст.", care: "💡 Добре реагує на ГК для укрупнення." },
            "Ескалібур": { rip: "115-120 дн.", col: "W", taste: "Гармонійний", bunch: "700-1200 г", seed: "З кіст.", care: "💡 Вимагає довгої обрізки (10-12 вічок)." },
            "Ельвіра": { rip: "110 дн.", col: "W", taste: "Освіжаючий", bunch: "500-900 г", seed: "З кіст.", care: "💡 Стійка до вологих умов Вінниччини." },
            "Емір": { rip: "115 дн.", col: "B", taste: "Щільний", bunch: "800-1500 г", seed: "З кіст.", care: "💡 Формувати з великим запасом старої деревини." },
            "Ельдорадо": { rip: "100 дн.", col: "W", taste: "Медовий мускат", bunch: "600-1100 г", seed: "З кіст.", care: "⚠️ Тріск від дощу. Хелат Кальцію обов'язково." },
            "Ейфорія": { rip: "115 дн.", col: "W", taste: "Мускат", bunch: "600-1000 г", seed: "З кіст.", care: "⚠️ Загущення куща. Ретельне пасинкування." },
            "Ізюмінка": { rip: "110 дн.", col: "R", taste: "Гармонійний", bunch: "500-850 г", seed: "З кіст.", care: "⚠️ Мілдью та мороз. Дуже примхливий сорт." },
            "Зарниця": { rip: "115 дн.", col: "W", taste: "Хрусткий", bunch: "700-1300 г", seed: "З кіст.", care: "💡 Стійкий аналог Аркадії, менше тріскається." },
            "Зоренька": { rip: "95-100 дн.", col: "R", taste: "Легкий мускат", bunch: "800-2000 г", seed: "З кіст.", care: "⚠️ Зайва плодючість бруньок. Рано нормувати!" },
            "Зодіак": { rip: "120 дн.", col: "B", taste: "Яскравий мускат", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Оїдіум у серпні. Тіовіт Джет обов'язково." },
            "Каталонія": { rip: "95 дн.", col: "B", taste: "Хрусткий", bunch: "600-1100 г", seed: "З кіст.", care: "💡 Ультрарання, лоза визріває чудово." },
            "Козак": { rip: "115 дн.", col: "W", taste: "Сильний мускат", bunch: "800-1400 г", seed: "З кіст.", care: "⚠️ Перевантаження. Лише 1 гроно на пагін." },
            "Кузьміч": { rip: "120-125 дн.", col: "R", taste: "Хрусткий", bunch: "700-1300 г", seed: "З кіст.", care: "💡 Висока зимостійкість, надійна робоча форма." },
            "Кеша": { rip: "125 дн.", col: "W", taste: "Гармонійний", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Жіноча квітка. Дозапилення пухівками." },
            "Краса балок": { rip: "115 дн.", col: "B", taste: "Гармонійний", bunch: "700-1300 г", seed: "З кіст.", care: "💡 Добре реагує на весняне підживлення Агріфулом." },
            "Казка к-ш": { rip: "125 дн.", col: "B", taste: "Хрусткий", bunch: "700-1400 г", seed: "Безкіст.", care: "💡 Обов'язкове ГК та надійне укриття." },
            "Красавчик": { rip: "100-105 дн.", col: "W", taste: "Насичений мускат", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Оїдіум. Фалькон/Луна обов'язково." },
            "Казанова": { rip: "115-120  дн.", col: "R", taste: "Мускат", bunch: "800-1500 г", seed: "З кіст.", care: "💡 Потребує сонця в зоні грон для кольору." },
            "Корсика": { rip: "120 дн.", col: "B", taste: "Фруктовий", bunch: "700-1200 г", seed: "З кіст.", care: "💡 Регулярне видалення пасинків влітку." },
            "Кетлен": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Сіра гниль. Свіч обов'язково." },
            "К-ш 342": { rip: "105 дн.", col: "W", taste: "Дуже солодкий", bunch: "400-700 г", seed: "Безкіст.", care: "💡 Найбільш невибагливий та солодкий для дітей." },
            "Ламборджині": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "500-900 г", seed: "Безкіст.", care: "⚠️ Ніжна лоза. ГК зануренням. Сухе укриття." },
            "Ландиш": { rip: "125 дн.", col: "W", taste: "Конвалія/Мускат", bunch: "800-1600 г", seed: "З кіст.", care: "⚠️ Осипання зав'язі у дощ. Бор перед цвітінням." },
            "Лівія": { rip: "105 дн.", col: "R", taste: "Мускат", bunch: "700-1400 г", seed: "З кіст.", care: "⚠️ Оїдіум. Підживлення Калієм для кольору." },
            "Львівський": { rip: "115-120 дн.", col: "W", taste: "Приємний", bunch: "500-850 г", seed: "З кіст.", care: "💡 Висока стійкість до мілдью, адаптований до холоду." },
            "Ланселот": { rip: "125 дн.", col: "W", taste: "Хрусткий", bunch: "1000-2500 г", seed: "З кіст.", care: "⚠️ Величезне навантаження. Жорстко нормувати." },
            "Лучистий к-ш": { rip: "125 дн.", col: "R", taste: "Яскравий мускат", bunch: "700-1500  г", seed: "Безкіст.", care: "⚠️ Вразливий до морозів. Укривати першим." },
            "Морозко": { rip: "115 дн.", col: "B", taste: "Солодкий", bunch: "500-800 г", seed: "З кіст.", care: "💡 Екстремальна морозостійкість. Можна на арки." },
            "Манікюр фінгер": { rip: "130 дн.", col: "W", taste: "Хрусткий", bunch: "600-1000 г", seed: "З кіст.", care: "⚠️ Слабкий імунітет. Системна профілактика (Луна)." },
            "Молдова": { rip: "145 дн.", col: "B", taste: "Сливовий", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Може не дозріти. Коротка обрізка, південна стіна." },
            "Монарх": { rip: "125 дн.", col: "W", taste: "Легкий мускат", bunch: "700-1400  г", seed: "З кіст.", care: "⚠️ Скидає суцвіття. Прищипувати пагони перед цвітінням." },
            "Мінор": { rip: "115 дн.", col: "W", taste: "Солодкий", bunch: "500-900 г", seed: "З кіст.", care: "💡 Стійкий до тріскання після літніх дощів." },
            "Медова королева": { rip: "115-120 дн.", col: "W", taste: "Медовий", bunch: "700-1300 г", seed: "З кіст.", care: "⚠️ Дуже приваблює ос. Захисні сітки обов'язково." },
            "Міланка": { rip: "100 дн.", col: "R", taste: "Мускат", bunch: "700-1200 г", seed: "З кіст.", care: "⚠️ Сіра гниль. Свіч у фазі змикання." },
            "Мускат ізюмський": { rip: "115 дн.", col: "B", taste: "Мускат", bunch: "500-950 г", seed: "З кіст.", care: "⚠️ Весняний кліщ. Санмайт -> Вертімек." },
            "Мармеладка": { rip: "125 дн.", col: "W", taste: "Мармелад", bunch: "800-1400 г", seed: "З кіст.", care: "⚠️ Оїдіум у спеку. Тіовіт Джет." },
            "Мелодія": { rip: "115 дн.", col: "W", taste: "Освіжаючий", bunch: "700-1300 г", seed: "З кіст.", care: "💡 Аміностар навесні для гарного старту." },
            "Мальчик с пальчик": { rip: "115 дн.", col: "W", taste: "Хрусткий", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Перевантаження. Раннє нормування." },
            "Мускат медовий": { rip: "115 дн.", col: "W", taste: "Медовий мускат", bunch: "500-900 г", seed: "З кіст.", care: "💡 Видаляти нижнє листя для провітрювання грон." },
            "Надія азос": { rip: "125 дн.", col: "B", taste: "Солодкий", bunch: "700-1400  г", seed: "З кіст.", care: "💡 Класична надійна форма. Стійка до тріскання." },
            "Находка": { rip: "115 дн.", col: "R", taste: "Гармонійний", bunch: "700-1300 г", seed: "Безкіст.", care: "💡 ГК у фазі горошини для розміру." },
            "Новий подарунок Запоріжжю": { rip: "120 дн.", col: "W", taste: "Щільний", bunch: "800-1500 г", seed: "З кіст.", care: "💡 Стійкий до хвороб та приморозків." },
            "Низина": { rip: "130 дн.", col: "R", taste: "Гармонійний", bunch: "800-1800 г", seed: "З кіст.", care: "⚠️ Раннє забарвлення. Не зрізати до набору цукру!" },
            "Незрівнянний к-ш": { rip: "110 дн.", col: "R", taste: "Солодкий", bunch: "700-1400 г", seed: "Безкіст.", care: "⚠️ Мілдью. Танос у червні." },
            "Оріон": { rip: "125 дн.", col: "R", taste: "Солодкий", bunch: "800-1600 г", seed: "З кіст.", care: "💡 Велика площа живлення на шпалері." },
            "Подарунок Несветая": { rip: "100 дн.", col: "B", taste: "Мускат", bunch: "700-1300 г", seed: "З кіст.", care: "⚠️ Перевантаження. Раннє нормування суцвіттями." },
            "Полтавський манікюр": { rip: "125 дн.", col: "W", taste: "Хрусткий", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Оїдіум та Гнилі. Захист Фалькон + Свіч." },
            "Прима України": { rip: "90 дн.", col: "W", taste: "Цитрон/Мускат", bunch: "500-900 г", seed: "З кіст.", care: "💡 Ультраранній, стійкий до морозів." },
            "Перетворення": { rip: "105 дн.", col: "R", taste: "Простий", bunch: "1000-2500 г", seed: "З кіст.", care: "⚠️ Пасинковий врожай. Виламувати пасинки вчасно." },
            "Подарунок Дніпру": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "800-1500 г", seed: "З кіст.", care: "💡 Мікроелементи перед цвітінням." },
            "Подарунок Харкову": { rip: "125 дн.", col: "W", taste: "Солодкий", bunch: "800-1600 г", seed: "З кіст.", care: "💡 Стабільний врожай за будь-якої погоди." },
            "Памʼяті Негруля": { rip: "135 дн.", col: "B", taste: "Простий", bunch: "700-1400  г", seed: "З кіст.", care: "💡 Чудово підходить для довгого зберігання." },
            "Памʼяті батьків": { rip: "115-120 дн.", col: "W", taste: "Легкий мускат", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Оїдіум на ягодах. Захист Луною." },
            "Полуничний": { rip: "115 дн.", col: "R", taste: "Полуниця", bunch: "500-950  г", seed: "З кіст.", care: "⚠️ Тріск від вологи. Контроль поливу + Кальцій." },
            "Полонез 50": { rip: "105 дн.", col: "R", taste: "Мускат", bunch: "800-1400 г", seed: "З кіст.", care: "💡 Своєчасне калійне живлення влітку." },
            "Пегас": { rip: "125 дн.", col: "B", taste: "Гармонійний", bunch: "800-1600 г", seed: "З кіст.", care: "💡 Лоза визріває стабільно, стійка форма." },
            "Руслан": { rip: "115  дн.", col: "B", taste: "Слива", bunch: "800-1600 г", seed: "З кіст.", care: "⚠️ Осипання зав'язі у дощ. Обробка Бором." },
            "Рембо": { rip: "100-105 дн.", col: "B", taste: "Хрусткий", bunch: "800-1600 г", seed: "З кіст.", care: "💡 Добре переносить весняні похолодання." },
            "Рішельє": { rip: "115  дн.", col: "B", taste: "Гармонійний", bunch: "700-1300 г", seed: "З кіст.", care: "⚠️ Оїдіум. Регулярна профілактика Фальконом." },
            "Раджа": { rip: "110-115 дн.", col: "B", taste: "Хрусткий", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Потребує помірного навантаження." },
            "Сенатор": { rip: "120 дн.", col: "R", taste: "Яскравий мускат", bunch: "800-1600 г", seed: "З кіст.", care: "⚠️ Сіра гниль. Свіч у зону грон." },
            "Слава Україні": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "800-1800 г", seed: "З кіст.", care: "⚠️ Кліщ. Санмайт навесні." },
            "Страшенський": { rip: "135 дн.", col: "B", taste: "Простий", bunch: "1000-3000 г", seed: "З кіст.", care: "⚠️ Нерівномірне дозрівання. Відрізати низ грона." },
            "Сон Анжеліки": { rip: "115 дн.", col: "R", taste: "Легкий мускат", bunch: "600-1100 г", seed: "З кіст.", care: "⚠️ Оїдіум восени. Сірка після збору." },
            "сюрприз": { rip: "125 дн.", col: "B", taste: "Гармонійний", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Надійна стійка форма." },
            "Сенсація": { rip: "105-110 дн.", col: "R", taste: "Солодкий", bunch: "800-2000 г", seed: "З кіст.", care: "⚠️ Жирування. Помірне азотне живлення." },
            "Супер вишня": { rip: "115 дн.", col: "R", taste: "Вишня", bunch: "500-900 г", seed: "З кіст.", care: "💡 Щільна шкірка, стійка до тріскання." },
            "Талісман": { rip: "130 дн.", col: "W", taste: "Мускат", bunch: "1000-2500 г", seed: "З кіст.", care: "⚠️ Жіноча квітка. Дозапилення пухівками." },
            "Тігіл": { rip: "115 дн.", col: "W", taste: "Гармонійний", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Регулярне видалення пасинків." },
            "Тасон": { rip: "105 дн.", col: "R", taste: "Мускат", bunch: "500-900 г", seed: "З кіст.", care: "⚠️ Мілдью. Акробат у травні/червні." },
            "Тайсон": { rip: "115  дн.", col: "B", taste: "Хрусткий", bunch: "800-1600 г", seed: "З кіст.", care: "💡 Чудово витримує транспортування." },
            "Тімоша к-ш": { rip: "110-115  дн.", col: "R", taste: "Солодкий", bunch: "600-1100 г", seed: "Безкіст.", care: "💡 ГК на стадії горошини для набору." },
            "Фестіве": { rip: "125 дн.", col: "B", taste: "Солодкий", bunch: "500-900  г", seed: "З кіст.", care: "💡 Висока зимостійкість, для альтанок." },
            "Хамелеон": { rip: "100-105 дн.", col: "R", taste: "Дуже солодкий", bunch: "1000-2500 г", seed: "З кіст.", care: "💡 Дивовижна врожайність. Калій у серпні." },
            "Хілтон": { rip: "115 дн.", col: "R", taste: "Щільний", bunch: "600-1000 г", seed: "З кіст.", care: "💡 Стійкий до розтріскування під дощем." },
            "Цимус": { rip: "95 дн.", col: "W", taste: "Цитрон", bunch: "800-1500 г", seed: "Безкіст.", care: "💡 Вибуховий мускат, стійкий до мілдью." },
            "Чорна хмара": { rip: "115 дн.", col: "B", taste: "Гармонійний", bunch: "800-1500 г", seed: "З кіст.", care: "⚠️ Сіра гниль. Свіч у фазі змикання." },
            "Червона троянда": { rip: "115-120  дн.", col: "R", taste: "Троянда", bunch: "600-1100 г", seed: "З кіст.", care: "💡 Освітлення грон восени для кольору." },
            "Шакіра": { rip: "115 дн.", col: "R", taste: "Приємний", bunch: "800-1400 г", seed: "З кіст.", care: "⚠️ Оїдіум. Профілактика Фальконом." },
            "Юпітер рожевий": { rip: "115 дн.", col: "R", taste: "Мускат", bunch: "500-900 г", seed: "Безкіст.", care: "⚠️ Сіра гниль у дощову погоду." },
            "Юпітер": { rip: "115  дн.", col: "B", taste: "Ізабельний мускат", bunch: "400-650 г", seed: "Безкіст.", care: "💡 Може зимувати без укриття." },
            "Юліан": { rip: "100  дн.", col: "R", taste: "Приємний мускат", bunch: "800-1800 г", seed: "З кіст.", care: "⚠️ Слабкий колір. Калійне живлення." }
        };

        let varietyData = {};
        let vineyardQuantities = {};
        let customVarieties = {};
        let deletedVarieties = [];
        let nurseryVarieties = {};

        function initEncyclopediaData() {
            try {
                const savedCustom = localStorage.getItem('viticulture-custom-varieties');
                if (savedCustom) customVarieties = JSON.parse(savedCustom);
            } catch(e) { console.error("Error loading custom varieties", e); }

            try {
                const savedDeleted = localStorage.getItem('viticulture-deleted-varieties');
                if (savedDeleted) deletedVarieties = JSON.parse(savedDeleted);
            } catch(e) { console.error("Error loading deleted varieties", e); }

            try {
                const savedQuantities = localStorage.getItem('viticulture-vineyard-quantities');
                if (savedQuantities) vineyardQuantities = JSON.parse(savedQuantities);
            } catch(e) { console.error("Error loading vineyard quantities", e); }

            try {
                const savedNursery = localStorage.getItem('viticulture-nursery-varieties');
                if (savedNursery) nurseryVarieties = JSON.parse(savedNursery);
            } catch(e) { console.error("Error loading nursery varieties", e); }

            varietyData = { ...defaultVarietyData };
            deletedVarieties.forEach(name => {
                delete varietyData[name];
            });
            Object.assign(varietyData, customVarieties);
        }

                const phasesData = {
            1: { 
                title: "Пробудження бруньок", 
                time: "Квітень", 
                mix: "Нордокс (4г) / Медян Екстра (5г). pH 6.0", 
                protectionActions: [
                    { product: "Стара кора", dosage: "—", method: "Механічно", work: "Очищення штамбів від старої кори" },
                    { product: "Нордокс / Медян Екстра", dosage: "4г / 5г на 1л", method: "Обприскування", work: "Обробка лози мідьвмісними препаратами" },
                    { product: "Колоїдна сірка", dosage: "За інструкцією", method: "Внесення під кущ", work: "Проти кліща навесні" }
                ],
                protectionTips: [
                    "Очищуйте штамби обережно металевою щіткою, щоб не пошкодити живу деревину.",
                    "Обробку міддю проводити по голій лозі при середньодобовій температурі не нижче +5°C.",
                    "Колоїдна сірка випаровується і створює захисний бар'єр проти зимуючих стадій кліща."
                ],
                nutrition: "Сухе внесення в ґрунт: Аміачна селітра (30г/кущ) + YaraMila Complex. рН поливної води: 6.0",
                nutritionActions: [
                    { product: "Аміачна селітра", dosage: "30г/кущ", method: "Сухе внесення в ґрунт", work: "Азотне підживлення на старті" },
                    { product: "YaraMila Complex", dosage: "За інструкцією", method: "Сухе внесення", work: "Комплексне підживлення" }
                ],
                nutritionTips: [
                    "Контролюйте рН поливної води (цільовий pH 6.0) для кращого засвоєння елементів живлення.",
                    "Добрива обов'язково закладати у вологий ґрунт на глибину 10-15 см або поєднувати з поливом."
                ],
                icon: "❄️" 
            },
            2: { 
                title: "Старт вегетації (3-5 листків)", 
                time: "Травень", 
                mix: "Хорус (0.3г) + Пенкоцеб (2г) + Санмайт (1г) на 1л води. pH 5.5", 
                protectionActions: [
                    { product: "Хорус + Пенкоцеб + Санмайт", dosage: "0.3г + 2г + 1г на 1л", method: "Обприскування", work: "Захист баковою сумішшю" },
                    { product: "Триходерма", dosage: "За інструкцією", method: "Проливання ґрунту", work: "Біозахист проти кореневих грибків" }
                ],
                protectionTips: [
                    "Зробіть паузу 2 дні після обробки перед іншими зеленими операціями.",
                    "Санмайт ефективно знищує літнього кліща. Бажаний рН суміші: 5.5."
                ],
                nutrition: "Позакореневе (по листу): Карбамід (15г/10л) + Агріфлекс (2г/10л) як стимулятор. рН води: 6.0",
                nutritionActions: [
                    { product: "Карбамід", dosage: "15г/10л", method: "По листу (позакореневе)", work: "Азотне живлення лози" },
                    { product: "Агріфлекс", dosage: "2г/10л", method: "По листу", work: "Стимуляція росту (антистрес)" }
                ],
                nutritionTips: [
                    "Для обприскування по листу готуйте воду з рН 6.0.",
                    "Не проводьте позакореневі обробки в спеку чи під прямим сонцем (краще ввечері)."
                ],
                icon: "🌿" 
            },
            3: { 
                title: "Перед цвітінням", 
                time: "Кінець Травня", 
                mix: "Акробат (2г) + Фалькон (0.5мл) + Кораген (0.15мл) + Вертімек (1мл) на 1л. pH 5.5", 
                protectionActions: [
                    { product: "Акр. + Фальк. + Кораг. + Верт.", dosage: "2г + 0.5мл + 0.15мл + 1мл / 1л", method: "Дрібнодисперсне обприскування", work: "Повна бакова обробка перед цвітінням" }
                ],
                protectionTips: [
                    "Це найважливіша обробка сезону на випередження хвороб (мілдью, оїдіум) та шкідників.",
                    "Особливо ретельно обприскуйте зону майбутніх суцвіть.",
                    "Перед додаванням Бору воду обов'язково підкислити лимонною кислотою до рН 5.5."
                ],
                nutrition: "Крапельне підживлення: Агріфлекс. По листу: Бор (15г/10л) + Плантафол 10-54-10 (високий фосфор). рН: 5.5",
                nutritionActions: [
                    { product: "Агріфлекс", dosage: "За інструкцією", method: "Крапельне підживлення", work: "Крапельне внесення стимулятора" },
                    { product: "Бор (борна кислота)", dosage: "15г/10л", method: "По листу (позакореневе)", work: "Стимуляція цвітіння та зав'язування ягід" },
                    { product: "Плантафол 10-54-10", dosage: "25г/10л", method: "По листу", work: "Фосфорне підживлення суцвіть" }
                ],
                nutritionTips: [
                    "Бор покращує проростання пилку та зменшує горошіння ягід.",
                    "Фосфор стимулює енергетичний обмін під час майбутнього цвітіння."
                ],
                icon: "🌼" 
            },
            4: { 
                title: "Формування ягоди (Горошина)", 
                time: "Червень", 
                mix: "Танос (0.6г) + Луна Експірієнс (1.5мл) на 1л води. pH 5.5", 
                protectionActions: [
                    { product: "Танос + Луна Експірієнс", dosage: "0.6г + 1.5мл на 1л", method: "Обприскування", work: "Захист від мілдью, оїдіуму та антракнозу" }
                ],
                protectionTips: [
                    "Обробка проводиться, коли ягоди досягають розміру горошини.",
                    "Припиніть активне внесення азоту в ґрунт, щоб уникнути жирування лози.",
                    "Застосовуйте біостимулятори поділу клітин (напр., Бенефіт) відразу після захисної обробки."
                ],
                nutrition: "Крапельно: NPK 15-5-30 (20г/кущ). По листу: Benefit PZ (25мл/10л) для росту ягід. рН: 6.0",
                nutritionActions: [
                    { product: "NPK 15-5-30", dosage: "20г/кущ", method: "Крапельне зрошення", work: "Калійно-азотне живлення" },
                    { product: "Benefit PZ", dosage: "25мл/10л", method: "По листу (позакореневе)", work: "Стимуляція збільшення розміру ягоди" }
                ],
                nutritionTips: [
                    "Контролюйте рН робочого розчину для поливу (цільовий рН: 6.0).",
                    "Benefit PZ стимулює поділ клітин у молодому навколопліднику ягоди."
                ],
                icon: "🟢" 
            },
            5: { 
                title: "Змикання ягід у гроні", 
                time: "Липень", 
                mix: "Свіч (1г) + Проклейм (0.4г) на 1л води. pH 5.5", 
                protectionActions: [
                    { product: "Свіч + Проклейм", dosage: "1г + 0.4г на 1л", method: "Направлене обприскування", work: "Захист грон від сірої гнилі та гусені" },
                    { product: "Листя навколо грон", dosage: "—", method: "Ручне видалення", work: "Провітрювання (освітлення) грон" }
                ],
                protectionTips: [
                    "Направляйте струмінь обприскувача безпосередньо всередину грон, поки вони не зімкнулися.",
                    "Освітлюйте грона (видаляйте листя навколо) тільки з ранкового боку, щоб уникнути сонячних опіків ягоди в полудень.",
                    "Внесення калію по листу прискорює визрівання лози."
                ],
                nutrition: "Крапельно: Монофосфат Калію (30г/кущ). По листу: Плантафол 5-15-45 (високий калій). рН: 6.0",
                nutritionActions: [
                    { product: "Монофосфат Калію", dosage: "30г/кущ", method: "Крапельне зрошення", work: "Калійно-фосфорне живлення куща" },
                    { product: "Плантафол 5-15-45", dosage: "25г/10л", method: "По листу", work: "Калійне підживлення для лози та цукру" }
                ],
                nutritionTips: [
                    "Калій на цій стадії є пріоритетним для накопичення сухої речовини в ягодах і визрівання деревини."
                ],
                icon: "🍇" 
            },
            6: { 
                title: "Дозрівання ягід", 
                time: "Серпень", 
                mix: "Скала (1мл) + Тіовіт Джет (4г) на 1л води. pH 6.5", 
                protectionActions: [
                    { product: "Скала + Тіовіт Джет", dosage: "1мл + 4г на 1л", method: "Обприскування", work: "Фінішний захист від оїдіуму та гнилей" }
                ],
                protectionTips: [
                    "Скала та Тіовіт Джет мають короткий термін очікування (захист перед збором врожаю).",
                    "Встановіть суворий контроль поливу: обмежте воду для запобігання тріску ягід від надлишку вологи.",
                    "Обробку Тіовітом проводити тільки при температурі повітря < 30°C, інакше можливі опіки шкірки."
                ],
                nutrition: "Крапельно: Сульфат Калію (30г/кущ). По листу: Хелат Кальцію (Брексил Са) проти розтріскування. рН: 6.0",
                nutritionActions: [
                    { product: "Сульфат Калію", dosage: "30г/кущ", method: "Крапельне зрошення", work: "Внесення калію для цукристості" },
                    { product: "Брексил Са (Хелат кальцію)", dosage: "20г/10л", method: "По листу (позакореневе)", work: "Внесення кальцію для міцності шкірки" }
                ],
                nutritionTips: [
                    "Кальцій робить клітинні стінки ягід еластичнішими, що суттєво зменшує розтріскування після дощів.",
                    "Завжди підкислюйте воду для кальцію до рН 6.0."
                ],
                icon: "☀️" 
            },
            7: { 
                title: "Осіння підготовка & лоза", 
                time: "Жовтень - Листопад", 
                mix: "Залізний купорос (300-400г на 10л води) по голій лозі. pH 4.0", 
                protectionActions: [
                    { product: "Залізний купорос", dosage: "300-400г на 10л", method: "Викорінююче обприскування", work: "Осіння обробка лози та ґрунту" },
                    { product: "Вода", dosage: "50-80л/кущ", method: "Глибокий полив", work: "Вологозарядний передзимовий полив" },
                    { product: "Лоза", dosage: "—", method: "Ручна обрізка", work: "Осіння обрізка кущів" },
                    { product: "Агроволокно / Земля", dosage: "—", method: "Ручне укриття", work: "Зимове укриття винограднику" }
                ],
                protectionTips: [
                    "Обрізку проводять після опадання листя та перших легких приморозків.",
                    "Вологозарядний полив запобігає вимерзанню кореневої системи в суху зиму.",
                    "Укривайте кущі тільки сухими матеріалами після встановлення стабільних морозів."
                ],
                nutrition: "Внесення під перекопування: Суперфосфат (40г/м²) + перепрілий перегній. рН: 6.5",
                nutritionActions: [
                    { product: "Суперфосфат", dosage: "40г/м²", method: "Внесення під перекопування", work: "Запас фосфору на наступний сезон" },
                    { product: "Перепрілий перегній", dosage: "1-2 відра під кущ", method: "Мульчування та перекопування", work: "Органічне живлення винограднику" }
                ],
                nutritionTips: [
                    "Цільовий рН ґрунту восени: 6.5. Внесення фосфору восени забезпечить розвиток коренів ранньою весною."
                ],
                icon: "❄️" 
            }
        };

        const colorMap = { "W": "#84cc16", "R": "#f43f5e", "B": "#7e22ce" };
        const weightMap = { "W": 1, "R": 2, "B": 3 };
        
        const grapeSVG = (hex) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="${hex}" class="mr-2 inline-block"><circle cx="9" cy="9" r="3"/><circle cx="15" cy="9" r="3"/><circle cx="12" cy="13" r="3"/><circle cx="8" cy="14" r="3"/><circle cx="16" cy="14" r="3"/><path d="M12 2v4" stroke="#15803d" stroke-width="2"/></svg>`;

        // Dashboard (Sprint 2): зведення стану з реальних даних застосунку.
        function renderDashboard() {
            if (!document.getElementById('tab-overview')) return;
            const sat = Math.round(totalSAT || 0);
            const phaseId = getRecommendedPhaseId(totalSAT || 0);
            const uppers = { 1: 200, 2: 450, 3: 800, 4: 1000, 5: 1500, 6: 2000 };
            const phaseName = (phasesData[phaseId] && phasesData[phaseId].title) || ('Фаза ' + phaseId);

            document.getElementById('dash-sat').textContent = sat + '°';
            document.getElementById('dash-sat-sub').textContent = 'накопичено за сезон';
            document.getElementById('dash-phase-badge').textContent = 'Фаза ' + phaseId + ' · ' + phaseName;

            const nextEl = document.getElementById('dash-next');
            const nextSub = document.getElementById('dash-next-sub');
            if (phaseId < 7 && uppers[phaseId]) {
                nextEl.textContent = Math.max(0, uppers[phaseId] - sat) + '°';
                const np = phasesData[phaseId + 1];
                nextSub.textContent = np ? ('далі: ' + np.title) : '';
            } else {
                nextEl.textContent = '—';
                nextSub.textContent = 'Фінальна фаза сезону';
            }

            const vCount = (typeof varietyData === 'object' && varietyData) ? Object.keys(varietyData).length : 0;
            let bushes = 0;
            if (typeof vineyardQuantities === 'object' && vineyardQuantities) {
                Object.values(vineyardQuantities).forEach(n => { bushes += (parseInt(n) || 0); });
            }
            document.getElementById('dash-varieties').textContent = vCount;
            document.getElementById('dash-varieties-sub').textContent = bushes + ' кущів на ділянці';

            const active = Array.isArray(todoList) ? todoList.filter(t => !t.completed).length : 0;
            document.getElementById('dash-tasks').textContent = active;

            // Phase timeline
            const track = document.getElementById('dash-phase-track');
            const labels = document.getElementById('dash-phase-labels');
            track.innerHTML = '';
            labels.innerHTML = '';
            for (let p = 1; p <= 7; p++) {
                const step = document.createElement('div');
                step.className = 'phase-step' + (p < phaseId ? ' done' : '') + (p === phaseId ? ' current' : '');
                track.appendChild(step);
                const lbl = document.createElement('span');
                lbl.className = 'phase-lbl' + (p === phaseId ? ' active' : '');
                lbl.textContent = (phasesData[p] && phasesData[p].title) ? phasesData[p].title.split(' ')[0] : ('Ф' + p);
                labels.appendChild(lbl);
            }

            // Threats for current phase
            const tc = document.getElementById('dash-threats');
            const th = phaseThreats[phaseId];
            if (th) {
                const rows = [
                    { sev: '#C94040', d: th.pathogens },
                    { sev: '#E8A020', d: th.disorders },
                    { sev: '#E8A020', d: th.pests }
                ].filter(r => r.d);
                tc.innerHTML = rows.map(r => `
                    <div class="threat-row">
                        <span class="threat-dot" style="background:${r.sev}"></span>
                        <div>
                            <p class="threat-name">${escapeHtml(r.d.name)}</p>
                            <p class="threat-desc">${escapeHtml(r.d.desc)}</p>
                        </div>
                        <button class="threat-action" data-action="switchTab" data-action-param="phases">Протокол</button>
                    </div>
                `).join('');
            } else {
                tc.innerHTML = '<p class="dash-caption">Немає активних загроз для цієї фази.</p>';
            }

            // Operational tasks checklist (Sprint 3) — protection actions of current phase
            const actions = (phasesData[phaseId] && phasesData[phaseId].protectionActions) || [];
            const checks = phaseChecklists[phaseId] || [];
            const doneCount = actions.reduce((n, _, i) => n + (checks[i] ? 1 : 0), 0);
            const pct = actions.length ? Math.round(doneCount / actions.length * 100) : 0;
            const progEl = document.getElementById('dash-tasks-progress');
            const fillEl = document.getElementById('dash-progress-fill');
            const listEl = document.getElementById('dash-task-list');
            if (progEl) progEl.textContent = doneCount + '/' + actions.length + ' (' + pct + '%)';
            if (fillEl) fillEl.style.width = pct + '%';
            if (listEl) {
                listEl.innerHTML = actions.map((a, i) => `
                    <div class="dash-task-row" data-action="dlg_dashTask" data-phase="${phaseId}" data-idx="${i}">
                        <span class="dash-task-check ${checks[i] ? 'checked' : ''}">${checks[i] ? '✓' : ''}</span>
                        <div>
                            <p class="dash-task-name ${checks[i] ? 'done' : ''}">${escapeHtml(a.work || a.product || '')}</p>
                            <p class="dash-task-meta">${escapeHtml(a.product || '')}${a.dosage ? ' · ' + escapeHtml(a.dosage) : ''}${a.method ? ' · ' + escapeHtml(a.method) : ''}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Мобільна шухляда навігації (sidebar drawer)
        function toggleMobileSidebar() {
            const sb = document.querySelector('.sidebar');
            const bd = document.querySelector('.sidebar-backdrop');
            const open = sb.classList.toggle('open');
            if (bd) bd.classList.toggle('show', open);
        }
        function closeMobileSidebar() {
            const sb = document.querySelector('.sidebar');
            const bd = document.querySelector('.sidebar-backdrop');
            if (sb) sb.classList.remove('open');
            if (bd) bd.classList.remove('show');
        }

        // Sprint 5: Quick Log (FAB) — швидкий запис виконаної роботи в журнал
        let quickLogType = 'Обприскування';
        function openQuickLog() {
            const o = document.getElementById('quicklog-overlay');
            if (o) o.classList.add('show');
        }
        function closeQuickLog() {
            const o = document.getElementById('quicklog-overlay');
            if (o) o.classList.remove('show');
        }
        function setQuickLogType(btn, type) {
            quickLogType = type;
            document.querySelectorAll('#quicklog-types .log-type-chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
        }
        function saveQuickLog() {
            const ta = document.getElementById('quicklog-text');
            const details = ta ? ta.value.trim() : '';
            if (!details) { showToast('Опишіть, що зроблено.', 'warning'); return; }
            const today = new Date().toISOString().split('T')[0];
            const item = {
                id: Date.now() + Math.random(),
                text: quickLogType + ': ' + details,
                dueDate: today,
                completed: true,
                completedDate: today,
                type: 'work',
                weather: null
            };
            if (!Array.isArray(todoList)) todoList = [];
            todoList.push(item);
            localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
            if (typeof renderTodos === 'function') renderTodos();
            if (typeof renderDashboard === 'function') renderDashboard();
            ta.value = '';
            closeQuickLog();
            showToast('Запис додано в журнал.', 'success');
        }

        // Tab Navigation
        function switchTab(id) {
            currentTab = id;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const tabEl = document.getElementById('tab-' + id);
            if (tabEl) tabEl.classList.add('active');

            // Активний стан у sidebar (desktop) і bottom-nav (mobile)
            document.querySelectorAll('.sidebar-nav-item, .bottom-nav-item').forEach(b => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
            const activeNav = document.getElementById('nav-' + id);
            if (activeNav) { activeNav.classList.add('active'); activeNav.setAttribute('aria-current', 'page'); }
            const activeBnav = document.getElementById('bnav-' + id);
            if (activeBnav) activeBnav.classList.add('active');
            closeMobileSidebar();

            if (id === 'products') {
                renderProductGrid();
            } else if (id === 'phases') {
                selectStep(currentActivePhase);
            } else if (id === 'analytics') {
                setTimeout(initChart, 50); // Small delay to ensure canvas is visible
            } else if (id === 'overview') {
                renderDashboard();
            }
        }

        function toggleGuideAccordion(index) {
            const items = document.querySelectorAll('.guide-accordion-item');
            const clickedItem = items[index];
            const isActive = clickedItem.classList.contains('active');
            
            items.forEach(item => item.classList.remove('active'));
            
            if (!isActive) {
                clickedItem.classList.add('active');
            }
        }

        // --- SEASONS & PHASES CHECKLIST LOGIC ---
        function getRecommendedPhaseId(sat) {
            if (sat < 200) return 1;
            if (sat < 450) return 2;
            if (sat < 800) return 3;
            if (sat < 1000) return 4;
            if (sat < 1500) return 5;
            if (sat < 2000) return 6;
            return 7;
        }

                // --- PHASE THREATS DATABASE ---
        const phaseThreats = {
            1: {
                disorders: { name: "Хлороз, підмерзання", desc: "Хлороз через низьку температуру ґрунту (залізне голодування), весняні заморозки.", keyword: "селітра" },
                pathogens: { name: "Чорна плямистість, оїдіум", desc: "Активація зимуючих спор фомопсису та оїдіуму на корі.", keyword: "оїдіум" },
                pests: { name: "Бруньковий кліщ", desc: "Зимуючий кліщ прокидається та пошкоджує лусочки бруньок.", keyword: "кліщ" }
            },
            2: {
                disorders: { name: "Азотне/Магнієве голодування", desc: "Світлішання листя через швидкий ріст за нестачі поживних речовин.", keyword: "азот" },
                pathogens: { name: "Антракноз, оїдіум", desc: "Первинні інфекції антракнозу та оїдіуму на молодих пагонах.", keyword: "оїдіум" },
                pests: { name: "Павутинний кліщ, цикадки", desc: "Вихід кліщів на нижню сторону листя, початок льоту цикадок.", keyword: "кліщ" }
            },
            3: {
                disorders: { name: "Осипання зав'язі (дефіцит Бору)", desc: "Погане запліднення через брак бору та холодну погоду.", keyword: "бор" },
                pathogens: { name: "Мілдью, оїдіум, чорна гниль", desc: "Критичний період зараження майбутніх грон мілдью та оїдіумом.", keyword: "мілдью" },
                pests: { name: "Гронова листовійка", desc: "Літ першого покоління метеликів, відкладання яєць у суцвіття.", keyword: "листовійка" }
            },
            4: {
                disorders: { name: "Сонячні опіки, дефіцит Кальцію", desc: "Опіки ягід при різкому підвищенні температур, нестача еластичності шкірки.", keyword: "кальцій" },
                pathogens: { name: "Мілдью, оїдіум, антракноз", desc: "Швидке ураження молодої ягоди грибками при високій вологості.", keyword: "мілдью" },
                pests: { name: "Павутинний кліщ, совки", desc: "Збільшення популяції павутинного кліща на листі, гусінь совок.", keyword: "кліщ" }
            },
            5: {
                disorders: { name: "Калієве голодування", desc: "Крайовий некроз листя через перенаправлення калію в ягоди.", keyword: "калій" },
                pathogens: { name: "Сіра гниль, оїдіум", desc: "Розвиток сірої гнилі всередині грон, які закриваються для провітрювання.", keyword: "сіра гниль" },
                pests: { name: "Гронова листовійка (2-ге покоління)", desc: "Пошкодження ягід гусеницями другого покоління, що веде до гнилей.", keyword: "листовійка" }
            },
            6: {
                disorders: { name: "Розтріскування ягід, дефіцит Са", desc: "Тріск ягід після дощів через слабкі стінки клітин та надлишок вологи.", keyword: "кальцій" },
                pathogens: { name: "Сіра та біла гнилі, оїдіум", desc: "Зараження дозріваючих грон через тріщини ягід, спалахи оїдіуму.", keyword: "сіра гниль" },
                pests: { name: "Оси, птахи, цикадка Меткальфа", desc: "Пошкодження ягід осами, птахами; виділення липкої роси цикадками.", keyword: "оси" }
            },
            7: {
                disorders: { name: "Невизрівання лози", desc: "Погане накопичення крохмалю, ризик вимерзання через слабке визрівання пагонів.", keyword: "калій" },
                pathogens: { name: "Зимуючі стадії патогенів", desc: "Концентрація спор мілдью та оїдіуму на опалому листі та лозі.", keyword: "залізний купорос" },
                pests: { name: "Зимуючі шкідники під корою", desc: "Шкідники шукають укриття під корою та в ґрунті.", keyword: "кора" }
            }
        };

        let phaseSwaps = {};
        let activeSwapContext = null;
        let selectedAlternativeId = null;

        const phaseSatTargets = {
            1: 0,
            2: 200,
            3: 450,
            4: 800,
            5: 1000,
            6: 1500,
            7: 2000
        };

        function getAverageSatRate() {
            if (satHistory.length < 2) {
                return 12; // default: +12°C active temp accumulation rate per day
            }
            const dates = satHistory.map(h => new Date(h.rawDate));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const diffTime = Math.abs(maxDate - minDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) {
                return 12; // safety default
            }
            
            const totalContr = satHistory.reduce((sum, h) => sum + h.contribution, 0);
            const rate = totalContr / diffDays;
            return rate > 0.5 ? rate : 12;
        }

        function getPhasePrediction(phaseId) {
            const target = phaseSatTargets[phaseId];
            const current = totalSAT;
            
            if (current >= target) {
                return {
                    reached: true,
                    text: `САТ досягнуто (потрібно ${target}°C, зараз ${Math.round(current)}°C)`
                };
            }
            
            let accumulated = current;
            let reachedDayIndex = -1;
            let estDate = null;
            
            // Loop through forecast days
            for (let i = 0; i < forecastDailyTemps.length; i++) {
                const f = forecastDailyTemps[i];
                if (f.temp >= 10) {
                    accumulated += f.temp;
                }
                if (accumulated >= target) {
                    reachedDayIndex = i;
                    estDate = new Date(f.rawDate);
                    break;
                }
            }
            
            let daysNeeded = 0;
            let text = "";
            const rate = getAverageSatRate();
            
            if (reachedDayIndex !== -1 && estDate) {
                daysNeeded = reachedDayIndex + 1;
                const estDateString = estDate.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
                text = `Очікується ${estDateString} (через ${daysNeeded} дн. за прогнозом погоди)`;
                return {
                    reached: false,
                    days: daysNeeded,
                    dateStr: estDateString,
                    rate: rate,
                    target: target,
                    text: text
                };
            } else {
                const diff = target - accumulated;
                const extraDays = Math.ceil(diff / rate);
                daysNeeded = forecastDailyTemps.length + extraDays;
                
                let baseDate;
                if (forecastDailyTemps.length > 0) {
                    baseDate = new Date(forecastDailyTemps[forecastDailyTemps.length - 1].rawDate);
                } else {
                    baseDate = satHistory.length > 0 ? new Date(satHistory[satHistory.length - 1].rawDate) : new Date();
                }
                
                estDate = new Date(baseDate.getTime() + extraDays * 24 * 60 * 60 * 1000);
                const estDateString = estDate.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                const forecastText = forecastDailyTemps.length > 0 ? `прогнозом + ` : ``;
                text = `Очікується ${estDateString} (через ${daysNeeded} дн., ${forecastText}темп +${rate.toFixed(1)}°C/день)`;
                return {
                    reached: false,
                    days: daysNeeded,
                    dateStr: estDateString,
                    rate: rate,
                    target: target,
                    text: text
                };
            }
        }

        function getProductTargets(p) {
            if (p.targets && p.targets.length > 0) return p.targets;
            
            const text = (p.applicationScope || '').toLowerCase();
            const targets = [];
            if (text.includes('оїдіум') || text.includes('оідіум')) targets.push('оїдіум');
            if (text.includes('мілдью')) targets.push('мілдью');
            if (text.includes('сір') || text.includes('гниль') || text.includes('ботритис')) targets.push('сіра гниль');
            if (text.includes('кліщ')) targets.push('кліщі');
            if (text.includes('листовійк')) targets.push('листовійка');
            if (text.includes('азот') || text.includes('селітра') || text.includes('карбамід')) targets.push('азотне живлення');
            if (text.includes('калій') || text.includes('монофосфат')) targets.push('калійне живлення');
            if (text.includes('фосфор') || text.includes('суперфосфат')) targets.push('фосфорне живлення');
            if (text.includes('корен')) targets.push('ріст коренів');
            return targets;
        }

        function getMatchingProductsFromDB(productString) {
            const list = getProductDB();
            const matches = [];
            list.forEach(p => {
                if (productString.toLowerCase().includes(p.name.toLowerCase()) || 
                    p.name.toLowerCase().includes(productString.toLowerCase())) {
                    matches.push(p);
                }
            });
            return matches;
        }

        function getAlternativesForProduct(productString, blockType) {
            const allProducts = getProductDB();
            const origMatched = getMatchingProductsFromDB(productString);
            
            let origTargets = [];
            let origType = blockType === 'protection' ? 'ppp' : 'fertilizer';
            
            if (origMatched.length > 0) {
                origMatched.forEach(p => {
                    origTargets = origTargets.concat(getProductTargets(p));
                });
                origTargets = [...new Set(origTargets)];
                origType = origMatched[0].type;
            } else {
                const text = productString.toLowerCase();
                if (text.includes('оїдіум') || text.includes('оідіум')) origTargets.push('оїдіум');
                if (text.includes('мілдью')) origTargets.push('мілдью');
                if (text.includes('сір') || text.includes('гниль') || text.includes('ботритис')) origTargets.push('сіра гниль');
                if (text.includes('кліщ')) origTargets.push('кліщі');
                if (text.includes('листовійк')) origTargets.push('листовійка');
                if (text.includes('азот') || text.includes('селітра') || text.includes('карбамід')) origTargets.push('азотне живлення');
                if (text.includes('калій') || text.includes('монофосфат')) origTargets.push('калійне живлення');
                if (text.includes('фосфор') || text.includes('суперфосфат')) origTargets.push('фосфорне живлення');
            }
            
            return allProducts.filter(p => {
                if (origMatched.some(om => om.id === p.id)) return false;
                if (p.type !== origType) return false;
                const pTargets = getProductTargets(p);
                return pTargets.some(t => origTargets.includes(t));
            });
        }

        function parseDosageValueAndUnit(dosageStr) {
            const match = dosageStr.match(/^\s*([\d\.]+)\s*([a-zA-Zа-яА-ЯіїєІЇЄ]+)(.*)$/);
            if (match) {
                return {
                    value: parseFloat(match[1]),
                    unit: match[2],
                    suffix: match[3] || ''
                };
            }
            return null;
        }

        function parseAndScaleFallbackDosage(origDosageStr, altProduct) {
            const is10L = origDosageStr.includes('10л');
            const isPerLiter = origDosageStr.includes('/л') || origDosageStr.includes('на 1л') || origDosageStr.includes('/ 1л');
            
            const altDosageL = altProduct.dosage.perLiter;
            const altDosageHa = altProduct.dosage.perHectare;
            const altDosageBush = altProduct.dosage.perBush;
            
            if (is10L && altDosageL && altDosageL !== '—') {
                const nums = altDosageL.match(/[\d\.]+/g);
                if (nums && nums.length > 0) {
                    const scaled = nums.map(n => parseFloat(n) * 10);
                    const unitMatch = altDosageL.match(/[a-zA-Zа-яА-ЯіїєІЇЄ]+/);
                    const unit = unitMatch ? unitMatch[0] : 'г';
                    if (scaled.length > 1) {
                        return `${scaled[0]}-${scaled[1]}${unit}/10л`;
                    }
                    return `${scaled[0]}${unit}/10л`;
                }
            }
            
            if (isPerLiter && altDosageL && altDosageL !== '—') {
                return altDosageL;
            }
            
            if (origDosageStr.includes('га') && altDosageHa && altDosageHa !== '—') {
                return altDosageHa;
            }
            
            if (origDosageStr.includes('кущ') && altDosageBush && altDosageBush !== '—') {
                return altDosageBush;
            }
            
            return altDosageL || altDosageHa || altDosageBush || "За інструкцією";
        }

        function calculateSwappedDosage(origProductName, origDosageStr, altProduct) {
            const db = getProductDB();
            const origProductObj = db.find(p => p.name.toLowerCase() === origProductName.toLowerCase() || origProductName.toLowerCase().includes(p.name.toLowerCase()));
            
            if (!origProductObj) {
                return parseAndScaleFallbackDosage(origDosageStr, altProduct);
            }
            
            const parsedOrig = parseDosageValueAndUnit(origDosageStr);
            if (!parsedOrig) {
                return parseAndScaleFallbackDosage(origDosageStr, altProduct);
            }
            
            if (origProductObj.type === 'fertilizer' && altProduct.type === 'fertilizer') {
                const npkA = origProductObj.composition.npk;
                const npkB = altProduct.composition.npk;
                if (npkA && npkB) {
                    const maxVal = Math.max(npkA.n, npkA.p, npkA.k);
                    let nutrientKey = '';
                    if (maxVal > 0) {
                        if (maxVal === npkA.n) nutrientKey = 'n';
                        else if (maxVal === npkA.p) nutrientKey = 'p';
                        else if (maxVal === npkA.k) nutrientKey = 'k';
                    }
                    if (nutrientKey && npkB[nutrientKey] > 0) {
                        const ratio = npkA[nutrientKey] / npkB[nutrientKey];
                        const newValue = parseFloat((parsedOrig.value * ratio).toFixed(2));
                        return `${newValue}${parsedOrig.unit}${parsedOrig.suffix}`;
                    }
                }
            }
            
            if (origProductObj.type === 'ppp' && altProduct.type === 'ppp') {
                const aiA = origProductObj.composition.activeIngredients || [];
                const aiB = altProduct.composition.activeIngredients || [];
                
                let sharedA = null;
                let sharedB = null;
                for (const a of aiA) {
                    const b = aiB.find(x => x.name.toLowerCase() === a.name.toLowerCase() || 
                                           a.name.toLowerCase().includes(x.name.toLowerCase()) || 
                                           x.name.toLowerCase().includes(a.name.toLowerCase()));
                    if (b) {
                        sharedA = a;
                        sharedB = b;
                        break;
                    }
                }
                
                if (sharedA && sharedB && sharedA.percent > 0 && sharedB.percent > 0) {
                    const ratio = sharedA.percent / sharedB.percent;
                    const newValue = parseFloat((parsedOrig.value * ratio).toFixed(2));
                    return `${newValue}${parsedOrig.unit}${parsedOrig.suffix}`;
                }
            }
            
            return parseAndScaleFallbackDosage(origDosageStr, altProduct);
        }

        function openAlternativeMenu(event, phaseId, actionIdx, blockType, origProduct) {
            event.stopPropagation();
            const s = phasesData[phaseId];
            const actions = blockType === 'protection' ? s.protectionActions : s.nutritionActions;
            
            const origAct = actions[actionIdx];
            const origDosage = origAct.dosage;
            
            activeSwapContext = { phaseId, actionIdx, blockType, origProduct, origDosage };
            
            document.getElementById('swap-orig-name').innerText = origProduct;
            document.getElementById('swap-orig-dosage').innerText = origDosage;
            
            const key = `${phaseId}-${blockType}-${origProduct}`;
            const existingSwap = phaseSwaps[key];
            
            const listContainer = document.getElementById('swap-alternatives-list');
            listContainer.innerHTML = '';
            
            const alts = getAlternativesForProduct(origProduct, blockType);
            
            if (alts.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center text-stone-300 py-8">
                        <span class="text-4xl block mb-2 opacity-30">🤷‍♂️</span>
                        <p class="font-black text-[10px] uppercase tracking-widest opacity-40">Аналогічних препаратів не знайдено</p>
                        <p class="text-[9px] opacity-70 mt-1">Додайте аналоги в базу з такою ж сферою дії.</p>
                    </div>
                `;
                document.getElementById('btn-reset-swap').classList.add('hidden');
            } else {
                document.getElementById('btn-reset-swap').classList.toggle('hidden', !existingSwap);
                selectedAlternativeId = existingSwap ? existingSwap.swappedId : null;
                
                alts.forEach(alt => {
                    const isSelected = existingSwap && existingSwap.swappedId === alt.id;
                    const calculatedDosage = calculateSwappedDosage(origProduct, origDosage, alt);
                    
                    const radioId = `alt-${alt.id}`;
                    listContainer.innerHTML += `
                        <label class="flex items-start gap-3 p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer select-none">
                            <input type="radio" name="alternative-product" id="${radioId}" value="${alt.id}" ${isSelected ? 'checked' : ''} data-action="dlg_selectAlt" data-action-on="change" data-altid="${alt.id}" class="mt-0.5 text-emerald-600 focus:ring-emerald-500 w-4 h-4">
                            <div class="text-xs">
                                <div class="font-black text-emerald-950">${alt.name}</div>
                                <div class="text-[10px] text-stone-500 mt-0.5">${alt.applicationScope}</div>
                                <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                                    <span class="text-[9px] bg-stone-150 text-stone-600 px-1.5 py-0.5 rounded font-semibold">Нова доза: <b>${calculatedDosage}</b></span>
                                    ${alt.composition.npk ? `<span class="text-[9px] bg-stone-150 text-stone-600 px-1.5 py-0.5 rounded font-semibold">NPK: <b>${alt.composition.npk.n}-${alt.composition.npk.p}-${alt.composition.npk.k}</b></span>` : ''}
                                </div>
                            </div>
                        </label>
                    `;
                });
            }
            
            document.getElementById('modal-swap-product').classList.remove('hidden');
        }

        function closeSwapModal() {
            document.getElementById('modal-swap-product').classList.add('hidden');
            activeSwapContext = null;
            selectedAlternativeId = null;
        }

        function confirmProductSwap() {
            if (!activeSwapContext) return;
            if (!selectedAlternativeId) {
                showToast('Виберіть альтернативний препарат зі списку.', 'warning');
                return;
            }
            
            const { phaseId, actionIdx, blockType, origProduct, origDosage } = activeSwapContext;
            const alt = getProductDB().find(p => p.id === selectedAlternativeId);
            if (!alt) return;
            
            const calculatedDosage = calculateSwappedDosage(origProduct, origDosage, alt);
            const key = `${phaseId}-${blockType}-${origProduct}`;
            
            phaseSwaps[key] = {
                swappedId: alt.id,
                product: alt.name,
                dosage: calculatedDosage
            };
            
            localStorage.setItem('viticulture-phase-swaps', JSON.stringify(phaseSwaps));
            showToast(`Препарат «${origProduct}» успішно замінено на «${alt.name}» із розрахунком дозування: ${calculatedDosage}`, 'success');
            
            closeSwapModal();
            selectStep(phaseId);
            
            setTimeout(() => {
                const elements = document.querySelectorAll('.phase-action-item');
                elements.forEach(el => {
                    const dataProd = el.getAttribute('data-product');
                    if (dataProd && dataProd.toLowerCase().includes(alt.name.toLowerCase())) {
                        el.classList.add('ring-2', 'ring-amber-500', 'bg-amber-50/50', 'border-amber-400', 'scale-[1.01]', 'shadow-md');
                        setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-50/50', 'border-amber-400', 'scale-[1.01]', 'shadow-md');
                        }, 3000);
                    }
                });
            }, 100);
        }

        function resetProductSwap() {
            if (!activeSwapContext) return;
            const { phaseId, blockType, origProduct } = activeSwapContext;
            const key = `${phaseId}-${blockType}-${origProduct}`;
            
            if (phaseSwaps[key]) {
                delete phaseSwaps[key];
                localStorage.setItem('viticulture-phase-swaps', JSON.stringify(phaseSwaps));
                showToast(`Заміну для препарату «${origProduct}» скинуто до початкових налаштувань.`, 'info');
            }
            
            closeSwapModal();
            selectStep(phaseId);
        }

        function highlightThreatTreatment(threatKeyword) {
            if (!threatKeyword) return;
            const items = document.querySelectorAll('.phase-action-item');
            let foundCount = 0;
            
            items.forEach(el => {
                const prodName = el.getAttribute('data-product') || '';
                const origProdName = el.getAttribute('data-orig-product') || '';
                
                const pObj = getProductDB().find(p => p.name.toLowerCase() === prodName.toLowerCase() || p.name.toLowerCase() === origProdName.toLowerCase());
                const targets = pObj ? getProductTargets(pObj) : [];
                
                const isMatch = targets.some(t => t.toLowerCase().includes(threatKeyword.toLowerCase()) || threatKeyword.toLowerCase().includes(t.toLowerCase())) ||
                                prodName.toLowerCase().includes(threatKeyword.toLowerCase()) ||
                                origProdName.toLowerCase().includes(threatKeyword.toLowerCase());
                                
                if (isMatch) {
                    foundCount++;
                    el.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50/40', 'border-emerald-400', 'scale-[1.01]', 'shadow-md');
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    
                    setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50/40', 'border-emerald-400', 'scale-[1.01]', 'shadow-md');
                    }, 5000);
                }
            });
            
            if (foundCount > 0) {
                showToast(`Знайдено ${foundCount} засобів профілактики/лікування. Вони виділені рамкою!`, 'success');
            } else {
                showToast(`Для загрози "${threatKeyword}" немає явних засобів у поточному списку фази. Скористайтеся базою препаратів для підбору.`, 'info');
            }
        }

        // --- DETAILED THREAT PROTOCOLS DATABASE (deAgro) ---
        const threatProtocols = {
            '1_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "Хлороз через низьку температуру ґрунту (залізне голодування) виникає, коли коріння не здатне засвоювати залізо з холодного, перезволоженого ґрунту. Молоде листя жовтіє, а жилки залишаються зеленими. Також існує високий ризик зворотних весняних заморозків, які можуть повністю знищити бруньки, що прокидаються.",
                steps: [
                    "Проведіть позакореневе обприскування хелатом заліза (Антихлороз, Ферилен) при перших ознаках пожовтіння листя.",
                    "Уникайте надмірного поливу та розпушуйте міжряддя для покращення аерації та швидшого прогрівання ґрунту коріння.",
                    "Слідкуйте за прогнозом погоди. При загрозі заморозку нижче +2°С застосуйте екстрений протокол (обробка амінокислотами/Мегафолом за 24-12 годин, задимлення або дощування).",
                    "Внесіть азотні добрива (аміачна селітра) після прогрівання ґрунту для потужного старту вегетації."
                ],
                recs: "Хелат заліза (Fe-DTPA або Fe-EDDHA), Мегафол або Аппліплант (амінокислоти), аміачна селітра для прикореневого підживлення."
            },
            '1_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Збудники чорної плямистісті (фомопсис) та оїдіуму зимують у вигляді міцелію та спор під лусочками бруньок і на корі лози. При температури вище +10°С починається їх активний ріст. Інфекція на старті вегетації призводить до відмирання пагонів, плямистості листя та сильного ураження суцвіть у майбутньому.",
                steps: [
                    "Проведіть профілактичне 'викорінююче' обприскування мідьвмісними препаратами або залізним купоросом до повного розкриття бруньок.",
                    "За перших ознак розпускання бруньок ('зелений конус') застосуйте системно-контактні фунгіциди.",
                    "Видаліть та спаліть залишки торішньої лози та опалого листя, якщо це не було зроблено восени.",
                    "Забезпечте хороше провітрювання куща шляхом правильної підв'язки рукавів."
                ],
                recs: "Хорус (працює при низьких температурах від +5°C), мідний купорос або Блу Бордо (контактна дія), Тіовіт Джет (сірка проти оїдіуму та кліща)."
            },
            '1_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Бруньковий виноградний кліщ (свербун) зимує безпосередньо під лусочками бруньок. З початком сокоруху та набухання бруньок він прокидається і починає вигризати молоді зародкові листки всередині бруньки. Пошкоджені бруньки розпускаються деформованими, пагони ростуть пригніченими, суцвіття осипаються.",
                steps: [
                    "Обробіть кущі в період набухання бруньок специфічними акарицидами або колоїдною сіркою.",
                    "Температура повітря під час обробки сіркою повинна бути не менше +15°С для максимального газоподібного ефекту.",
                    "При виявленні вогнищ ураженого листя влітку (характерні здуття-гали з білим або рожевим повстяним нальотом зі зворотного боку), проведіть точкові обробки.",
                    "Видаляйте сильно пошкоджені пагони на початку росту."
                ],
                recs: "Тіовіт Джет (колоїдна сірка - подвійна дія проти кліща та оїдіуму), Масай, Ортус або Вертимек (специфічні акарициди)."
            },
            '2_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "Під час швидкого росту пагонів (довжина 15-30 см) виноград споживає велику кількість азоту та магнію. При нестачі азоту листя набуває блідо-зеленого кольору, ріст уповільнюється. Дефіцит магнію проявляється у вигляді міжжилкового хлорозу (жовті плями між жилками нижнього листя, у червоних сортів - червоні плями), що знижує фотосинтез.",
                steps: [
                    "Внесіть азотні добрива під корінь з поливом або проведіть позакореневе підживлення сечовиною (карбамідом).",
                    "Для швидкого усунення дефіциту магнію обприскайте кущі сульфатом магнію по листу.",
                    "Поєднуйте магнієве підживлення з мікроелементами в хелатній формі для покращення засвоєння.",
                    "Забезпечте рівномірне зволоження ґрунту для активного всмоктування поживних речовин корінням."
                ],
                recs: "Карбамід (сечовина) для азотного старту, Сульфат магнію або Магнікур/Брексіл Магній для листового підживлення."
            },
            '2_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Антракноз активно розвивається за теплої вологої весняної погоди, спричиняючи глибокі виразки на молодих пагонах та чорні плями з фіолетовою облямівкою на листі ('пташине око'). Оїдіум на цьому етапі вражає молодий приріст, утворюючи брудно-сірий пилявий наліт, що призводить до кучерявості листя та зупинки росту пагонів.",
                steps: [
                    "Застосуйте системні фунгіциди широкого спектру дії, що захищають як від антракнозу, так і від оїдіуму та мілдью.",
                    "Проведіть першу нормовану зелену обрізку (виламайте слабкі, подвійні пагони та пагони-двійники) для покращення провітрювання куща.",
                    "Уникайте дощування виноградника у вечірні часи, оскільки крапельна волога на листі понад 2 години провокує антракноз.",
                    "Обробіть кущі до початку цвітіння."
                ],
                recs: "Ридоміл Голд або Квадріс (проти мілдью та антракнозу), Топаз або Фалькон (високоефективні проти оїдіуму)."
            },
            '2_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Павутинний кліщ висмоктує соки з листя, викликаючи його передчасне пожовтіння та засихання. Цикадки (зелена та буйволоподібна) роблять проколи на пагонах та черешках листя, що перекриває висхідний рух поживних речовин і може призвести до відмирання цілих частин пагона вище місця кільцевого пошкодження.",
                steps: [
                    "Ретельно оглядайте зворотний бік листя на наявність тонкої павутини та дрібних кліщів.",
                    "При чисельності понад 5 кліщів на листок застосуйте акарициди системної чи трансламінарної дії.",
                    "Для боротьби з цикадками скошуйте високу траву в міжряддях, де вони розмножуються.",
                    "Застосуйте інсектициди тривалої дії при виявленні дорослих цикадок або їхніх личинок."
                ],
                recs: "Актелік, Вертимек (інсекто-акарициди), Масай або Енвідор (акарициди тривалої дії проти всіх стадій кліща), Актара або Децис проти цикадок."
            },
            '3_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "Дефіцит Бору перед цвітінням є головною причиною поганого проростання пилку, що призводить до незаплідненої зав'язі, масового її осипання та горошіння ягід (утворення дрібних безкісточкових ягід замість повноцінного грона). Холодна або дощова погода під час цвітіння критично посилює цю проблему.",
                steps: [
                    "Обов'язково проведіть два позакореневі підживлення бором: перше за 5-7 днів до початку цвітіння (бутонізація), друге - відразу після завершення цвітіння.",
                    "Використовуйте органічну форму бору (бороглюконат або бормоноетаноламін), яка швидко засвоюється рослиною і не викликає опіків листя.",
                    "Не проводьте обробки безпосередньо під час активного цвітіння, щоб не змити пилок та не перешкодити бджолам.",
                    "Забезпечте помірну вологість ґрунту в зоні коріння."
                ],
                recs: "Бороплюс (Valagro), Брексіл Бор або звичайна Борна кислота (5-10 г на 10 л води, попередньо розчинена в гарячій воді)."
            },
            '3_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Період цвітіння та початок утворення зав'язі є найбільш вразливим моментом усього сезону. Зараження суцвіть мілдью або оїдіумом на цьому етапі призводить до повної втрати врожаю. Грибок мілдью здатний знищити гребінь суцвіття за 24 години, після чого воно буріє та засихає.",
                steps: [
                    "Проведіть обов'язкову, найважливішу профілактичну обробку системними фунгіцидами безпосередньо ПЕРЕД цвітінням (у фазі розпушення бутонів).",
                    "Відразу ПІСЛЯ цвітіння (коли осипаються ковпачки і з'являється зав'язь розміром з 'шпилькову головку') проведіть другу системну обробку.",
                    "Ретельно видаляйте пасинки в зоні грон для покращення циркуляції повітря та швидкого висихання ранкової роси.",
                    "При виявленні свіжих маслянистих плям мілдью застосуйте лікувальні системні препарати негайно."
                ],
                recs: "Ридоміл Голд, Шавіт або Кабріо Топ (потужні двокомпонентні фунгіциди проти мілдью/оїдіуму), Топаз, Фалькон або Магнікур Сенсейшн."
            },
            '3_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Гусениці першого покоління гронової листовійки підгризають бутони, обплітають їх павутиною та знищують квітки винограду. Одне пошкоджене суцвіття може втратити до 40% майбутніх ягід. Утворені рани стають воротами для проникнення сірої гнилі після цвітіння.",
                steps: [
                    "Повісьте феромонні пастки для моніторингу початку льоту метеликів листовійки.",
                    "Через 7-10 днів після початку активного льоту (або при виявленні першої павутини на суцвіттях) проведіть обробку інсектицидами.",
                    "Надавайте перевагу біологічним інсектицидам або препаратам з коротким терміном очікування, щоб зберегти корисних ентомофагів.",
                    "Обробіть ретельно саме зону майбутніх грон."
                ],
                recs: "Кораген (високоефективний проти яєць та гусениць), Проклейм, Вертимек або біологічний Лепідоцид / Бітоксибацилін."
            },
            '4_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "При різкому підвищенні температури повітря понад +32°С та низькій вологості ягоди у фазі 'зеленої горошини' піддаються сильному ультрафіолетовому випромінюванню, що спричиняє сонячні опіки (ягоди зморщуються, буріють, набувають присмаку вареної фракції та всихають). Нестача кальцію призводить до зниження еластичності шкірки, що пізніше викличе масове розтріскування ягід.",
                steps: [
                    "Проведіть листове оброблення препаратами кальцію в хелатній формі для зміцнення клітинних стінок шкірки ягоди.",
                    "Не видаляйте повністю листя, що притіняє грона зі східного та південного боку в спекотні дні.",
                    "При вирощуванні на бідних ґрунтах внесіть кальцієву селітру під корінь з крапельним поливом.",
                    "Застосовуйте антистресанти на основі амінокислот перед хвилями екстремальної спеки."
                ],
                recs: "Брексіл Кальцій (Valagro), Кальбіт З, кальцієва селітра під корінь (окремо від фосфорних добрив!), амінокислоти (Мегафол/Ізабіон)."
            },
            '4_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Молода ягода та гребінь грона у фазі росту є надзвичайно чутливими до зараження мілдью та антракнозом. Будь-які опади понад 5 мм за температури +18...+25°С викликають миттєвий спалах інфекції. Пошкоджені грибком ягоди темніють, зморщуються і повністю всихають, а на пагонах з'являються глибокі виразки антракнозу.",
                steps: [
                    "Проведіть системне обприскування відразу після дощів, якщо термін дії попередньої обробки закінчився (зазвичай більше 10-12 днів).",
                    "Додавайте до бакової суміші фосфіт калію, який стимулює власний імунітет рослини проти несправжньої борошнистої роси.",
                    "Продовжуйте зелені операції: пасинкування, підв'язування пагонів, щоб забезпечити швидке висихання куща після дощу.",
                    "Слідкуйте за нижнім листям куща, де найперше з'являються плями мілдью."
                ],
                recs: "Магнікур Фіно (Інфініто), Ридоміл Голд, Квадріс, Дітан (контактний манкоцеб для захисту від мілдью та антракнозу)."
            },
            '4_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "У суху та спекотну погоду павутинний кліщ розмножується з надзвичайною швидкістю. Пошкоджене листя покривається мармуровими плямами, жовтіє та передчасно обпадає, що позбавляє кущ можливості фотосинтезувати та наливати ягоди. Гусениці бавовняної та інших совок вигризають отвори безпосередньо всередині зелених ягід.",
                steps: [
                    "Проведіть ретельний огляд середнього ярусу листя куща.",
                    "Застосовуйте специфічні акарициди, що знищують дорослих кліщів, німф та яйця, забезпечуючи тривалий захист.",
                    "Проти гусениць совок обробку проводьте у вечірній час, оскільки цей шкідник веде нічний спосіб життя.",
                    "Видаляйте бур'яни під кущами, які є резерватом для совок."
                ],
                recs: "Ортус, Енвідор, Масай, Санмайт (ефективні акарициди), Проклейм або Ампліго проти гусені совок."
            },
            '5_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "Під час розм'якшення ягід та початку накопичення цукру виноград споживає колосальну кількість калію. При його дефіциті починається відтік калію з листя до ягід. Це проявляється як 'крайовий опік' або некроз листя (краї листка жовтіють, буріють і відмирають). Через це лоза погано визріває, а ягоди не здатні набрати високий відсоток цукру.",
                steps: [
                    "Повністю виключіть внесення азотних добрив на цьому етапі, щоб не провокувати буйний ріст зелені.",
                    "Внесіть калійні добрива (монокалій фосфат або сульфат калію) під корінь з крапельним поливом.",
                    "Проведіть кілька позакореневих підживлень монофосфатом калію, поступово збільшуючи концентрацію (від 20-30 г до 50-60 г на 10 л води з інтервалом 7-10 днів).",
                    "Проведіть освітлення зони грон (видаліть старе листя навколо грон для доступу сонця)."
                ],
                recs: "Монокалійфосфат, Сульфат калію (K2SO4), Брексіл Калій, Плантафол 0-25-50."
            },
            '5_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Сіра гниль вражає грона, які починають змикатися. Грибок проникає через мікротравми та розвивається всередині щільних грон, де тримається висока вологість. Одна уражена ягода здатна заразити все гроно за кілька днів, перетворюючи його на гнилу сіру масу. Оїдіум на ягодах, що розм'якшуються, призводить до розриву шкірки та оголення насіння.",
                steps: [
                    "Обов'язково обробіть грона спеціалізованими фунгіцидами-ботрицидами (проти сірої гнилі) безпосередньо перед змиканням ягід у гроні.",
                    "Видаліть листя в зоні грон для забезпечення ідеального провітрювання та швидкого висихання ягід після дощів.",
                    "Ретельно нормуйте кущі водою, щоб запобігти різким коливанням вологості ґрунту, які викликають тріск ягід.",
                    "Проведіть профілактику оїдіуму препаратами з коротким терміном очікування."
                ],
                recs: "Світч (найкращий ботрицид проти сірої гнилі), Хорус, Тельдор або Магнікур Гардіан, колоїдна сірка проти оїдіуму."
            },
            '5_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Гусениці другого та третього поколінь гронової листовійки пошкоджують ягоди, що починають дозрівати. Вони прогризають шкірку та живляться м'якоттю. Кожне таке пошкодження у вологому середовищі миттєво викликає спалах сірої чи кислої гнилі, яка здатна знищити весь врожай за лічені дні.",
                steps: [
                    "Почніть обробку інсектицидами негайно при появі гусениць нового покоління.",
                    "Використовуйте препарати з коротким терміном очікування (3-7 днів), оскільки виноград наближається до збору врожаю.",
                    "Обприскуйте безпосередньо зону грон під листям.",
                    "Встановіть пастки із солодким бродячим сиропом для відволікання та вилову комах."
                ],
                recs: "Проклейм (термін очікування всього 5-7 днів), Кораген, або біопрепарати Актофіт / Фітоверм."
            },
            '6_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "При випаданні сильних дощів після тривалої посухи тиск води всередині ягід різко зростає. Слабкі стінки клітин шкірки (через дефіцит кальцію) не витримують тиску, і ягоди масово тріскаються біля плодоніжки або на кінчику. Тріснуті ягоди загнивають, приваблюють ос та стають повністю непридатними для використання.",
                steps: [
                    "Підтримуйте рівномірну вологість ґрунту за допомогою регулярних мікрополивів у посушливі періоди, щоб уникнути водного шоку для лози.",
                    "Регулярно вносите кальцій по листу на ранніх етапах розвитку для підвищення еластичності шкірки.",
                    "Внесіть калійні добрива, які допомагають регулювати осмотичний тиск у клітинах рослин.",
                    "При виникненні масового тріску негайно зніміть пошкоджені ягоди або проведіть терміновий збір врожаю."
                ],
                recs: "Брексіл Кальцій, Хелат Кальцію, Монофосфат калію для регуляції водного балансу."
            },
            '6_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Тріщини на ягодах стають відчиненими воротами для спор сірої гнилі та бактерій кислих гнилей. Дріжджі та оцтовокислі бактерії починають бурхливе бродіння соку, утворюючи характерний оцтовий запах, який приваблює хмари мошок дрозофіл. Гниль швидко охоплює сусідні здорові ягоди в гроні.",
                steps: [
                    "При появі перших тріщин або гнилі акуратно виріжте пошкоджені ягоди або цілі частини грон спеціальними ножицями з довгими кінцями.",
                    "Обробіть кущі біологічними препаратами або фунгіцидами з мінімальним терміном очікування (1-3 дні).",
                    "Застосуйте підсушуючі засоби (порошок глини, соду або спеціальні препарати), щоб зупинити виділення соку з тріснутих ягід.",
                    "Забезпечте максимальне провітрювання кущів."
                ],
                recs: "Тельдор (термін очікування 3-5 днів), біофунгіциди Фітоспорин, Триходермін або Мікосан, харчова сода (80 г на 10 л води) для підсушування ран."
            },
            '6_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Оси та птахи є головними ворогами стиглого винограду. Вони прокушують шкірку найкращих солодких ягід, випивають сік та залишають порожні оболонки, які миттєво загнивають. Цикадка Меткальфа (біла цикадка) виділяє велику кількість липкої паді, на якій розвивається сажистий грибок, покриваючи ягоди брудним чорним нальотом.",
                steps: [
                    "Одягніть спеціальні захисні сіточки (мішечки з дрібної сітки) на кожне гроно окремо. Це найнадійніший механічний захист від ос та птахів.",
                    "Розвісьте пастки-пляшки з приманкою (кисле пиво, компот з оцтом - бджоли на таку приманку не летять, а оси активно ловляться).",
                    "Знайдіть та знищте гнізда ос навколо виноградника.",
                    "Використовуйте відлякувачі птахів (блискучі стрічки, диски, макети хижаків)."
                ],
                recs: "Спеціальні захисні сітки для грон (осередки 1-2 мм), пляшкові пастки з пивною приманкою, відлякуючі сітки від птахів."
            },
            '7_disorders': {
                icon: "🧪",
                category: "Фізіологічні розлади & дефіцити",
                danger: "Якщо лоза до настання осінніх заморозків залишається зеленою та м'якою, це свідчить про низький вміст крохмалю та цукрів у клітинах. За перших сильних морозів така лоза вимерзне до самої основи куща, що призведе до втрати рукавів та відсутності врожаю в наступному році. Головна причина - надлишок азоту та вологи наприкінці літа.",
                steps: [
                    "Повністю припиніть поливи з кінця серпня.",
                    "Видаліть верхівки пагонів (чеканка) на висоті понад 2-2.2 м для зупинки росту та перенаправлення сил на визрівання кори.",
                    "Проведіть інтенсивні позакореневі обробки калійними добривами високої концентрації (монокалійфосфат 50-100 г на 10 л води щотижня).",
                    "Виріжте всі невизрілі зелені пагони під час осінньої обрізки перед укриттям."
                ],
                recs: "Монофосфат калію (високі дози), Сульфат калію під корінь восени, повне виключення азоту."
            },
            '7_pathogens': {
                icon: "🍄",
                category: "Патогенні ризики (хвороби)",
                danger: "Після збору врожаю на листках та лозі накопичується величезна кількість зимуючих спор мілдью (ооспори), оїдіуму (клейстотеції) та антракнозу. Якщо лишити їх без обробки, навесні відбудеться надзвичайно сильний первинний спалах хвороб, з яким буде вкрай важко боротися.",
                steps: [
                    "Проведіть обов'язкове осіннє викорінююче обприскування кущів та ґрунту під ними після повного опадання листя.",
                    "Зберіть все опале листя винограду та винесіть його за межі ділянки (або глибоко закопайте в землю, чи спаліть).",
                    "Проведіть обрізку кущів, залишаючи лише здорову, повністю визрілу деревину.",
                    "Обробіть зрізи лози садовим варом або дезінфікуючими розчинами."
                ],
                recs: "3% розчин залізного купоросу (300 г на 10 л води) - обробка лози та землі після листопаду, або 3% Бордоська суміш."
            },
            '7_pests': {
                icon: "🕷️",
                category: "Шкідники (комахи/кліщі)",
                danger: "Дорослі особини брунькових та павутинних кліщів, а також щитівки та яйця інших шкідників шукають притулок на зиму. Вони ховаються під лусочками бруньок, у тріщинах старої кори та у верхньому шарі ґрунту навколо штамбу куща. Весною вони прокинуться першими та почнуть знищувати бруньки.",
                steps: [
                    "Очистіть штамби від старої відшарованої кори, де ховаються шкідники.",
                    "Проведіть обробку лози залізним або мідним купоросом восени, що допомагає частково знищити шкідників під лусочками бруньок.",
                    "Перекопайте ґрунт у пристовбурових кругах перед настанням стійких морозів, щоб винести зимуючих комах на поверхню для їх вимерзання.",
                    "Застоясовуйте спеціальні мінерально-олійні emulsions для обробки лози перед зимовим укриттям."
                ],
                recs: "Препарат 30В або аналогічні мінерально-олійні препарати, залізний купорос 3-5% восени."
            }
        };

        let activeThreatKeyword = "";

        function showThreatProtocol(phaseId, threatType) {
            const threatInfo = phaseThreats[phaseId]?.[threatType];
            const protocol = threatProtocols[`${phaseId}_${threatType}`];
            if (!threatInfo || !protocol) {
                showToast("Дані про протокол для цієї загрози відсутні.", "info");
                return;
            }

            activeThreatKeyword = threatInfo.keyword || "";

            document.getElementById("threat-modal-icon").innerText = protocol.icon;
            document.getElementById("threat-modal-title").innerText = threatInfo.name;
            document.getElementById("threat-modal-category").innerText = protocol.category;
            document.getElementById("threat-modal-desc").innerText = threatInfo.desc;
            document.getElementById("threat-modal-danger").innerText = protocol.danger;
            document.getElementById("threat-modal-recs").innerText = protocol.recs;

            const stepsContainer = document.getElementById("threat-modal-steps");
            stepsContainer.innerHTML = "";
            protocol.steps.forEach(step => {
                const li = document.createElement("li");
                li.innerText = step;
                stepsContainer.appendChild(li);
            });

            // If no keyword for highlighting, disable/hide highlight button, otherwise enable
            const highlightBtn = document.getElementById("btn-highlight-threat-in-checklist");
            if (activeThreatKeyword) {
                highlightBtn.style.display = "block";
                highlightBtn.innerText = `🩺 Підсвітити засіб «${activeThreatKeyword}» в чек-листі`;
            } else {
                highlightBtn.style.display = "none";
            }

            document.getElementById("modal-threat-protocol").classList.remove("hidden");
        }

        function closeThreatProtocolModal() {
            document.getElementById("modal-threat-protocol").classList.add("hidden");
        }

        function runThreatHighlightFromModal() {
            if (activeThreatKeyword) {
                closeThreatProtocolModal();
                highlightThreatTreatment(activeThreatKeyword);
            }
        }

        function splitMix(str) {
            if (!str) return [];
            if (str.includes('+')) return str.split('+').map(s => s.trim());
            if (str.includes('/')) return str.split('/').map(s => s.trim());
            return [str.trim()];
        }


        function selectStep(id) {
            const phaseId = Number(id);
            currentActivePhase = phaseId;
            renderPhaseNav();
            const s = phasesData[id];
            
            // Generate checklist state if not exists or lengths changed
            if (!phaseChecklists[id] || phaseChecklists[id].length !== s.protectionActions.length) {
                phaseChecklists[id] = Array(s.protectionActions.length).fill(false);
            }
            if (!phaseNutritionChecklists[id] || phaseNutritionChecklists[id].length !== s.nutritionActions.length) {
                phaseNutritionChecklists[id] = Array(s.nutritionActions.length).fill(false);
            }
            
            const checkedCount = phaseChecklists[id].filter(Boolean).length;
            const percent = s.protectionActions.length ? Math.round((checkedCount / s.protectionActions.length) * 100) : 0;

            const nutritionCheckedCount = phaseNutritionChecklists[id].filter(Boolean).length;
            const nutritionPercent = s.nutritionActions.length ? Math.round((nutritionCheckedCount / s.nutritionActions.length) * 100) : 0;

            // Forecast calculations
            const prediction = getPhasePrediction(id);
            let predictionHTML = '';
            if (prediction.reached) {
                predictionHTML = `
                    <span class="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-200 mt-1">
                        ✅ ${prediction.text}
                    </span>
                `;
            } else {
                predictionHTML = `
                    <span class="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-200 mt-1">
                        ⏳ ${prediction.text}
                    </span>
                `;
            }

            const protTipsHTML = s.protectionTips.map(tip => `<li class="flex items-start gap-2 text-stone-600 text-xs"><span class="text-emerald-500">💡</span><span>${tip}</span></li>`).join('');
            const nutrTipsHTML = s.nutritionTips.map(tip => `<li class="flex items-start gap-2 text-stone-600 text-xs"><span class="text-emerald-500">💡</span><span>${tip}</span></li>`).join('');

            // --- Potential Threats HTML ---
            const threat = phaseThreats[id] || {
                disorders: { name: "Невідомо", desc: "Дані про порушення відсутні.", keyword: "" },
                pathogens: { name: "Невідомо", desc: "Дані про хвороби відсутні.", keyword: "" },
                pests: { name: "Невідомо", desc: "Дані про шкідників відсутні.", keyword: "" }
            };
            
            const threatHTML = `
                <!-- Potential Threats & Risks Widget -->
                <div class="mb-6 bg-stone-50 border border-stone-200/60 p-5 rounded-[28px] shadow-sm">
                    <span class="text-[10px] font-black uppercase text-amber-700 block mb-3 tracking-widest flex items-center gap-1.5 select-none">
                        <span>⚠️</span> Потенційні загрози та ризики фази
                    </span>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Physiological Disorders -->
                        <div class="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between gap-3">
                            <div>
                                <span class="block opacity-50 font-black text-[9px] uppercase tracking-wider text-stone-400 mb-1 select-none">🧪 Фізіологічні розлади & дефіцити</span>
                                <h4 class="font-extrabold text-stone-850 text-xs">${threat.disorders.name}</h4>
                                <p class="text-[10px] text-stone-500 mt-1 leading-relaxed">${threat.disorders.desc}</p>
                            </div>
                            <button data-action="dlg_threat" data-phase="${phaseId}" data-threat="disorders" class="w-full mt-1 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-700 text-stone-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-stone-200/50 hover:border-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer">
                                🩺 Протокол захисту
                            </button>
                        </div>
                        
                        <!-- Pathogens -->
                        <div class="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between gap-3">
                            <div>
                                <span class="block opacity-50 font-black text-[9px] uppercase tracking-wider text-stone-400 mb-1 select-none">🍄 Патогенні ризики (хвороби)</span>
                                <h4 class="font-extrabold text-stone-850 text-xs">${threat.pathogens.name}</h4>
                                <p class="text-[10px] text-stone-500 mt-1 leading-relaxed">${threat.pathogens.desc}</p>
                            </div>
                            <button data-action="dlg_threat" data-phase="${phaseId}" data-threat="pathogens" class="w-full mt-1 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-700 text-stone-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-stone-200/50 hover:border-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer">
                                🩺 Протокол захисту
                            </button>
                        </div>
                        
                        <!-- Pests -->
                        <div class="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col justify-between gap-3">
                            <div>
                                <span class="block opacity-50 font-black text-[9px] uppercase tracking-wider text-stone-400 mb-1 select-none">🕷️ Шкідники (комахи/кліщі)</span>
                                <h4 class="font-extrabold text-stone-850 text-xs">${threat.pests.name}</h4>
                                <p class="text-[10px] text-stone-500 mt-1 leading-relaxed">${threat.pests.desc}</p>
                            </div>
                            <button data-action="dlg_threat" data-phase="${phaseId}" data-threat="pests" class="w-full mt-1 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-700 text-stone-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-stone-200/50 hover:border-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer">
                                🩺 Протокол захисту
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('phase-content').innerHTML = `
                <div class="fade-in h-full flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-6 border-b border-emerald-100 pb-6">
                            <div>
                                <h2 class="text-3xl font-black text-emerald-950">${s.title}</h2>
                                <div class="flex flex-col gap-1 mt-1">
                                    <p class="text-emerald-600 font-bold uppercase tracking-widest text-xs">📅 Орієнтовний термін: ${s.time}</p>
                                    <div>${predictionHTML}</div>
                                </div>
                            </div>
                            <span class="text-6xl opacity-20">${s.icon}</span>
                        </div>
                        
                        ${threatHTML}
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left: Protection and Action Steps -->
                            <div class="space-y-6">
                                <div class="bg-emerald-900 text-white p-5 rounded-3xl shadow-lg border-b-4 border-emerald-700">
                                    <span class="text-[9px] font-black uppercase text-emerald-300 tracking-wider">🛡️ Захисний Баковий Коктейль (дозування на 10л)</span>
                                    <p class="text-sm font-bold mt-1">${s.mix}</p>
                                </div>

                                <!-- Collapsible Recommendations -->
                                <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                    <details class="group">
                                        <summary class="flex justify-between items-center cursor-pointer select-none text-xs font-black uppercase text-emerald-800 tracking-wider">
                                            <span>💡 Рекомендації та замітки</span>
                                            <span class="transition-transform group-open:rotate-180">▼</span>
                                        </summary>
                                        <ul class="mt-3 space-y-2 pl-1">
                                            ${protTipsHTML || '<li class="text-stone-400 text-xs italic">Специфічні рекомендації відсутні</li>'}
                                        </ul>
                                    </details>
                                </div>
                                
                                <div>
                                    <div class="flex justify-between items-center mb-3">
                                        <span class="text-xs font-black uppercase text-stone-500 tracking-wider">📋 Operational tasks (Protection)</span>
                                        <span class="text-xs font-black text-emerald-600">${percent}% виконано</span>
                                    </div>
                                    <ul class="space-y-2.5">
                                        ${s.protectionActions.map((act, idx) => {
                                            const isChecked = phaseChecklists[id][idx] ? 'checked' : '';
                                            const key = `${id}-${idx}`;
                                            const dateVal = phaseChecklistDates[key] || '';
                                            
                                            // Dynamic Product & Dosage Replacement
                                            const parts = splitMix(act.product);
                                            const dosages = splitMix(act.dosage);
                                            
                                            let productHTML = '';
                                            let dosageHTML = '';
                                            let displayProductText = '';
                                            
                                            parts.forEach((p, pIdx) => {
                                                const swapKey = `${id}-protection-${p}`;
                                                const swap = phaseSwaps[swapKey];
                                                const activeProduct = swap ? swap.product : p;
                                                const activeDosage = swap ? swap.dosage : (dosages[pIdx] || '—');
                                                
                                                displayProductText += (pIdx > 0 ? ' + ' : '') + activeProduct;
                                                const dosageClass = swap ? 'text-amber-600 font-black' : 'font-bold';
                                                
                                                productHTML += (pIdx > 0 ? ' <span class="opacity-50">+</span> ' : '') + `
                                                    <button data-action="dlg_altMenu" data-id="${id}" data-idx="${idx}" data-kind="protection" data-product="${p}" class="underline text-emerald-700 hover:text-emerald-950 font-black cursor-pointer text-left" title="Натисніть для заміни препарату">
                                                        ${activeProduct} 🔄
                                                    </button>
                                                `;
                                                
                                                dosageHTML += (pIdx > 0 ? ' + ' : '') + `
                                                    <span class="${dosageClass}">${activeDosage}</span>
                                                `;
                                            });

                                            return `
                                                <li class="flex flex-col bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60 hover:bg-emerald-50/20 transition-all select-none phase-action-item" data-product="${displayProductText}" data-orig-product="${act.product}">
                                                    <div class="flex items-start gap-3 cursor-pointer" data-action="dlg_togglePhase" data-phase="${id}" data-idx="${idx}">
                                                        <input type="checkbox" ${isChecked} class="w-4 h-4 mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none">
                                                        <div class="text-xs text-stone-700 font-medium ${isChecked ? 'line-through opacity-50' : ''}">
                                                            <div class="font-bold text-emerald-950">${act.work}</div>
                                                            <div class="text-[10px] text-stone-500 mt-1 flex flex-wrap gap-1">
                                                                <span class="bg-stone-250/70 px-1.5 py-0.5 rounded">Препарат: ${productHTML}</span>
                                                                <span class="bg-stone-250/70 px-1.5 py-0.5 rounded">Доза: <b>${dosageHTML}</b></span>
                                                                <span class="bg-stone-250/70 px-1.5 py-0.5 rounded">Метод: <b>${act.method}</b></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    ${isChecked ? `
                                                    <div class="flex items-center gap-2 pl-7 mt-2" data-action="dlg_stop">
                                                        <span class="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">Дата виконання:</span>
                                                        <input type="date" value="${dateVal}" data-action="dlg_phaseDate" data-action-on="change" data-phase="${id}" data-idx="${idx}" data-nutri="0" class="bg-transparent border-0 p-0 text-emerald-800 text-[11px] font-black outline-none cursor-pointer focus:underline w-28">
                                                    </div>
                                                    ` : ''}
                                                </li>
                                            `;
                                        }).join('')}
                                    </ul>
                                </div>
                            </div>
                            
                            <!-- Right: Nutrition, pH, and notes -->
                            <div class="bg-emerald-50/50 p-6 rounded-[30px] border border-emerald-100/80 flex flex-col justify-between">
                                <div class="space-y-4">
                                    <div>
                                        <span class="text-[10px] font-black uppercase text-emerald-700 block mb-2 tracking-widest">💧 Кореневе & Позакореневе Живлення</span>
                                        <p class="text-xs text-stone-700 leading-relaxed font-semibold bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">${s.nutrition}</p>
                                    </div>

                                    <!-- Collapsible Recommendations -->
                                    <div class="bg-white/80 p-4 rounded-2xl border border-emerald-100/40">
                                        <details class="group">
                                            <summary class="flex justify-between items-center cursor-pointer select-none text-xs font-black uppercase text-emerald-850 tracking-wider">
                                                <span>💡 Технологічні замітки</span>
                                                <span class="transition-transform group-open:rotate-180">▼</span>
                                            </summary>
                                            <ul class="mt-3 space-y-2 pl-1">
                                                ${nutrTipsHTML || '<li class="text-stone-400 text-xs italic">Специфічні замітки відсутні</li>'}
                                            </ul>
                                        </details>
                                    </div>
                                    
                                    <div>
                                        <div class="flex justify-between items-center mb-3">
                                            <span class="text-xs font-black uppercase text-stone-500 tracking-wider">📋 Operational tasks (Nutrition)</span>
                                            <span class="text-xs font-black text-emerald-600">${nutritionPercent}% виконано</span>
                                        </div>
                                        <ul class="space-y-2.5">
                                            ${s.nutritionActions.map((act, idx) => {
                                                const isChecked = phaseNutritionChecklists[id][idx] ? 'checked' : '';
                                                const key = `${id}-${idx}`;
                                                const dateVal = phaseNutritionChecklistDates[key] || '';
                                                
                                                // Dynamic Product & Dosage Replacement
                                                const parts = splitMix(act.product);
                                                const dosages = splitMix(act.dosage);
                                                
                                                let productHTML = '';
                                                let dosageHTML = '';
                                                let displayProductText = '';
                                                
                                                parts.forEach((p, pIdx) => {
                                                    const swapKey = `${id}-nutrition-${p}`;
                                                    const swap = phaseSwaps[swapKey];
                                                    const activeProduct = swap ? swap.product : p;
                                                    const activeDosage = swap ? swap.dosage : (dosages[pIdx] || '—');
                                                    
                                                    displayProductText += (pIdx > 0 ? ' + ' : '') + activeProduct;
                                                    const dosageClass = swap ? 'text-amber-600 font-black' : 'font-bold';
                                                    
                                                    productHTML += (pIdx > 0 ? ' <span class="opacity-50">+</span> ' : '') + `
                                                        <button data-action="dlg_altMenu" data-id="${id}" data-idx="${idx}" data-kind="nutrition" data-product="${p}" class="underline text-emerald-700 hover:text-emerald-950 font-black cursor-pointer text-left" title="Натисніть для заміни препарату">
                                                            ${activeProduct} 🔄
                                                        </button>
                                                    `;
                                                    
                                                    dosageHTML += (pIdx > 0 ? ' + ' : '') + `
                                                        <span class="${dosageClass}">${activeDosage}</span>
                                                    `;
                                                });

                                                return `
                                                    <li class="flex flex-col bg-white p-3.5 rounded-2xl border border-stone-200/60 hover:bg-emerald-50/20 transition-all select-none phase-action-item" data-product="${displayProductText}" data-orig-product="${act.product}">
                                                        <div class="flex items-start gap-3 cursor-pointer" data-action="dlg_toggleNutrition" data-phase="${id}" data-idx="${idx}">
                                                            <input type="checkbox" ${isChecked} class="w-4 h-4 mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none">
                                                            <div class="text-xs text-stone-700 font-medium ${isChecked ? 'line-through opacity-50' : ''}">
                                                                <div class="font-bold text-emerald-950">${act.work}</div>
                                                                <div class="text-[10px] text-stone-500 mt-1 flex flex-wrap gap-1">
                                                                    <span class="bg-stone-100 px-1.5 py-0.5 rounded">Препарат: ${productHTML}</span>
                                                                    <span class="bg-stone-100 px-1.5 py-0.5 rounded">Доза: <b>${dosageHTML}</b></span>
                                                                    <span class="bg-stone-100 px-1.5 py-0.5 rounded">Метод: <b>${act.method}</b></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        ${isChecked ? `
                                                        <div class="flex items-center gap-2 pl-7 mt-2" data-action="dlg_stop">
                                                            <span class="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">Дата виконання:</span>
                                                            <input type="date" value="${dateVal}" data-action="dlg_phaseDate" data-action-on="change" data-phase="${id}" data-idx="${idx}" data-nutri="1" class="bg-transparent border-0 p-0 text-emerald-800 text-[11px] font-black outline-none cursor-pointer focus:underline w-28">
                                                        </div>
                                                        ` : ''}
                                                    </li>
                                                `;
                                            }).join('')}
                                        </ul>
                                    </div>
                                </div>
                                <div class="mt-6 bg-white/60 p-4 rounded-2xl border border-emerald-100 text-[10px] text-emerald-800 font-medium italic">
                                    💡 Рекомендація: Завжди заміряйте рН робочого розчину перед обприскуванням. Оптимальний рівень для бакових сумішей: 5.5 - 6.0.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function toggleDataManagement() {
            const body = document.getElementById('data-mgmt-body');
            const chevron = document.getElementById('data-mgmt-chevron');
            if (!body) return;
            
            const isCollapsed = body.classList.contains('max-h-0');
            if (isCollapsed) {
                body.classList.remove('max-h-0', 'opacity-0');
                body.classList.add('max-h-[850px]', 'opacity-100');
                if (chevron) chevron.classList.add('rotate-180');
            } else {
                body.classList.remove('max-h-[850px]', 'opacity-100');
                body.classList.add('max-h-0', 'opacity-0');
                if (chevron) chevron.classList.remove('rotate-180');
            }
        }

        let isSyncingWeather = false;

        async function syncWeather(forceRefresh = false) {
            if (isSyncingWeather) {
                showToast('Синхронізація вже триває...', 'warning');
                return;
            }
            isSyncingWeather = true;

            const latInput = document.getElementById('weather-lat');
            const lonInput = document.getElementById('weather-lon');
            const lat = parseFloat(latInput.value) || 49.23;
            const lon = parseFloat(lonInput.value) || 28.46;
            
            localStorage.setItem('weather-lat', lat);
            localStorage.setItem('weather-lon', lon);

            const btn = document.getElementById('btn-sync-sat');
            const spinner = document.getElementById('sync-sat-spinner');
            
            if (btn) btn.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            
            // Check cache (unless forceRefresh is true)
            if (!forceRefresh) {
                const cacheTimestamp = localStorage.getItem('viticulture-weather-sat-sync-timestamp');
                const savedLat = localStorage.getItem('weather-lat-saved');
                const savedLon = localStorage.getItem('weather-lon-saved');
                const satHistoryStr = localStorage.getItem('satHistory');
                const forecastDailyTempsStr = localStorage.getItem('forecastDailyTemps');
                
                if (cacheTimestamp && satHistoryStr && forecastDailyTempsStr && savedLat && savedLon) {
                    const ageMs = Date.now() - parseInt(cacheTimestamp);
                    if (ageMs < 1.5 * 60 * 60 * 1000 && parseFloat(savedLat) === lat && parseFloat(savedLon) === lon) {
                        satHistory = safeParse(satHistoryStr, satHistory);
                        forecastDailyTemps = safeParse(forecastDailyTempsStr, forecastDailyTemps);
                        recalculateSAT();
                        if (typeof updateFrostWarning === 'function') updateFrostWarning();
                        const minsAgo = Math.round(ageMs / 60000);
                        showToast(`Кешовані дані САТ (${minsAgo} хв тому з Open-Meteo). ${satHistory.length} днів.`, 'info');
                        
                        isSyncingWeather = false;
                        if (btn) btn.disabled = false;
                        if (spinner) spinner.classList.add('hidden');
                        return;
                    }
                }
            }
            
            try {
                const todayObj = new Date();
                let year = todayObj.getFullYear();
                
                let isCurrentYear = true;
                if (todayObj.getMonth() < 3) {
                    year = year - 1;
                    isCurrentYear = false;
                }
                
                const startDate = `${year}-04-01`;
                let endArchiveDate;
                
                if (isCurrentYear) {
                    const threeDaysAgoObj = new Date(todayObj.getTime() - 3 * 24 * 60 * 60 * 1000);
                    endArchiveDate = threeDaysAgoObj.toISOString().split('T')[0];
                } else {
                    endArchiveDate = `${year}-10-31`;
                }
                
                let archiveJson = null;
                if (endArchiveDate >= startDate) {
                    try {
                        const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endArchiveDate}&daily=temperature_2m_mean&timezone=auto`;
                        const archiveRes = await fetch(archiveUrl);
                        if (archiveRes.ok) {
                            archiveJson = await archiveRes.json();
                        } else {
                            console.warn('Failed to fetch from Archive API status code:', archiveRes.status);
                        }
                    } catch (archiveErr) {
                        console.error('Archive API fetch failed:', archiveErr);
                    }
                }
                
                let forecastJson = null;
                if (isCurrentYear) {
                    try {
                        let pastDays = 7;
                        if (!archiveJson) {
                            const startDateObj = new Date(year, 3, 1); // April 1st
                            const timeDiff = todayObj.getTime() - startDateObj.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                            pastDays = Math.min(92, Math.max(7, daysDiff + 1));
                        }
                        const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,temperature_2m_min&past_days=${pastDays}&forecast_days=14&timezone=auto`;
                        const forecastRes = await fetch(forecastUrl);
                        if (forecastRes.ok) {
                            forecastJson = await forecastRes.json();
                        } else {
                            console.warn('Failed to fetch from Forecast API status code:', forecastRes.status);
                        }
                    } catch (forecastErr) {
                        console.error('Forecast API fetch failed:', forecastErr);
                    }
                }
                
                const mergedData = new Map();
                const mergedMinData = new Map();
                
                if (archiveJson && archiveJson.daily && archiveJson.daily.time) {
                    for (let i = 0; i < archiveJson.daily.time.length; i++) {
                        const date = archiveJson.daily.time[i];
                        const temp = archiveJson.daily.temperature_2m_mean[i];
                        if (temp !== null && temp !== undefined) {
                            mergedData.set(date, temp);
                        }
                    }
                }
                
                if (forecastJson && forecastJson.daily && forecastJson.daily.time) {
                    for (let i = 0; i < forecastJson.daily.time.length; i++) {
                        const date = forecastJson.daily.time[i];
                        const temp = forecastJson.daily.temperature_2m_mean[i];
                        if (temp !== null && temp !== undefined) {
                            mergedData.set(date, temp);
                        }
                        if (forecastJson.daily.temperature_2m_min) {
                            const minTemp = forecastJson.daily.temperature_2m_min[i];
                            if (minTemp !== null && minTemp !== undefined) {
                                mergedMinData.set(date, minTemp);
                            }
                        }
                    }
                }
                
                const todayStr = todayObj.toISOString().split('T')[0];
                const sortedDates = Array.from(mergedData.keys()).sort();
                
                const newSatHistory = [];
                const newForecastDailyTemps = [];
                
                sortedDates.forEach(date => {
                    const temp = mergedData.get(date);
                    if (date <= todayStr) {
                        if (temp >= 10) {
                            const contribution = parseFloat(temp.toFixed(1));
                            const dateObj = new Date(date);
                            const formattedDate = dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                            newSatHistory.push({
                                rawDate: date,
                                date: formattedDate,
                                temp: temp,
                                contribution: contribution
                            });
                        }
                    } else {
                        const minTemp = mergedMinData.get(date);
                        newForecastDailyTemps.push({
                            rawDate: date,
                            temp: temp,
                            minTemp: minTemp !== undefined ? minTemp : temp
                        });
                    }
                });
                
                if (newSatHistory.length === 0 && newForecastDailyTemps.length === 0) {
                    throw new Error('Отримано порожні дані погоди.');
                }
                
                satHistory = newSatHistory;
                forecastDailyTemps = newForecastDailyTemps;
                
                localStorage.setItem('satHistory', JSON.stringify(satHistory));
                localStorage.setItem('forecastDailyTemps', JSON.stringify(forecastDailyTemps));
                localStorage.setItem('weather-lat-saved', lat);
                localStorage.setItem('weather-lon-saved', lon);
                localStorage.setItem('viticulture-weather-sat-sync-timestamp', Date.now().toString());
                
                recalculateSAT();
                if (typeof updateFrostWarning === 'function') updateFrostWarning();
                showToast(`Синхронізацію САТ завершено! Отримано ${satHistory.length} днів спостережень.`, 'success');
                
            } catch (err) {
                console.error(err);
                showToast(`Не вдалося синхронізувати дані САТ: ${err.message}`, 'error');
            } finally {
                isSyncingWeather = false;
                if (btn) btn.disabled = false;
                if (spinner) spinner.classList.add('hidden');
            }
        }

        async function syncCurrentWeather(forceRefresh = false) {
            const lat = parseFloat(document.getElementById('weather-lat').value) || 49.23;
            const lon = parseFloat(document.getElementById('weather-lon').value) || 28.46;
            
            const btn = document.getElementById('btn-sync-current-weather');
            const btnMgmt = document.getElementById('btn-sync-current-weather-mgmt');
            const spinner = document.getElementById('sync-current-spinner');
            const spinnerMgmt = document.getElementById('sync-current-spinner-mgmt');
            
            // Check cache
            const cacheStr = localStorage.getItem('viticulture-weather-current-cache');
            if (!forceRefresh && cacheStr) {
                try {
                    const cache = JSON.parse(cacheStr);
                    const ageMs = Date.now() - cache.timestamp;
                    if (ageMs < 1.5 * 60 * 60 * 1000 && cache.lat === lat && cache.lon === lon) {
                        document.getElementById('disease-temp').value = cache.temp;
                        document.getElementById('disease-rain').value = cache.rain;
                        document.getElementById('disease-humidity').value = cache.humidity;
                        
                        calculateDiseaseRisk();
                        
                        const minsAgo = Math.round(ageMs / 60000);
                        showToast(`Використано кеш погоди (отримано ${minsAgo} хв тому з Open-Meteo): ${cache.temp}°C, вологість ${cache.humidity}%, опади ${cache.rain} мм`, 'info');
                        return;
                    }
                } catch(e) { console.error(e); }
            }

            if (btn) btn.disabled = true;
            if (btnMgmt) btnMgmt.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (spinnerMgmt) spinnerMgmt.classList.remove('hidden');
            
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&timezone=auto`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Помилка сервера погоди');
                const data = await res.json();
                
                if (data.current) {
                    const temp = Math.round(data.current.temperature_2m);
                    const humidity = Math.round(data.current.relative_humidity_2m);
                    let rain = 0;
                    if (data.daily && data.daily.precipitation_sum && data.daily.precipitation_sum.length > 0) {
                        rain = Math.round(data.daily.precipitation_sum[0]);
                    }
                    
                    document.getElementById('disease-temp').value = temp;
                    document.getElementById('disease-rain').value = rain;
                    document.getElementById('disease-humidity').value = humidity;
                    
                    calculateDiseaseRisk();
                    
                    // Save to cache
                    const newCache = {
                        timestamp: Date.now(),
                        lat,
                        lon,
                        temp,
                        humidity,
                        rain
                    };
                    localStorage.setItem('viticulture-weather-current-cache', JSON.stringify(newCache));
                    
                    showToast(`Дані погоди оновлено успішно! Температура: ${temp}°C, вологість: ${humidity}%, опади за сьогодні: ${rain} мм`, 'success');
                } else {
                    throw new Error('Невірний формат відповіді API');
                }
            } catch (err) {
                console.error(err);
                showToast(`Не вдалося завантажити поточну погоду: ${err.message}`, 'error');
            } finally {
                if (btn) btn.disabled = false;
                if (btnMgmt) btnMgmt.disabled = false;
                if (spinner) spinner.classList.add('hidden');
                if (spinnerMgmt) spinnerMgmt.classList.add('hidden');
            }
        }

        function togglePhaseStep(phaseId, stepIdx) {
            if (!phaseChecklists[phaseId]) {
                phaseChecklists[phaseId] = Array(phasesData[phaseId].protectionActions.length).fill(false);
            }
            phaseChecklists[phaseId][stepIdx] = !phaseChecklists[phaseId][stepIdx];
            
            const key = `${phaseId}-${stepIdx}`;
            if (phaseChecklists[phaseId][stepIdx]) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                phaseChecklistDates[key] = `${yyyy}-${mm}-${dd}`;
            } else {
                delete phaseChecklistDates[key];
            }
            
            localStorage.setItem('phaseChecklists', JSON.stringify(phaseChecklists));
            localStorage.setItem('phaseChecklistDates', JSON.stringify(phaseChecklistDates));
            selectStep(phaseId);
        }

        function toggleNutritionPhaseStep(phaseId, stepIdx) {
            if (!phaseNutritionChecklists[phaseId]) {
                phaseNutritionChecklists[phaseId] = Array(phasesData[phaseId].nutritionActions.length).fill(false);
            }
            phaseNutritionChecklists[phaseId][stepIdx] = !phaseNutritionChecklists[phaseId][stepIdx];
            
            const key = `${phaseId}-${stepIdx}`;
            if (phaseNutritionChecklists[phaseId][stepIdx]) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                phaseNutritionChecklistDates[key] = `${yyyy}-${mm}-${dd}`;
            } else {
                delete phaseNutritionChecklistDates[key];
            }
            
            localStorage.setItem('phaseNutritionChecklists', JSON.stringify(phaseNutritionChecklists));
            localStorage.setItem('phaseNutritionChecklistDates', JSON.stringify(phaseNutritionChecklistDates));
            selectStep(phaseId);
        }

        function updatePhaseStepDate(phaseId, stepIdx, isNutrition, newDate) {
            const key = `${phaseId}-${stepIdx}`;
            if (isNutrition) {
                phaseNutritionChecklistDates[key] = newDate;
                localStorage.setItem('phaseNutritionChecklistDates', JSON.stringify(phaseNutritionChecklistDates));
            } else {
                phaseChecklistDates[key] = newDate;
                localStorage.setItem('phaseChecklistDates', JSON.stringify(phaseChecklistDates));
            }
            selectStep(phaseId);
        }

        function renderPhaseNav() {
            const nav = document.getElementById('phase-nav-container');
            const recPhaseId = getRecommendedPhaseId(totalSAT);
            const items = Object.keys(phasesData).map(k => {
                const kn = Number(k);
                const s = phasesData[k];
                const selected = kn === currentActivePhase;

                // Calculate completion
                if (!phaseChecklists[k] || phaseChecklists[k].length !== s.protectionActions.length) phaseChecklists[k] = Array(s.protectionActions.length).fill(false);
                if (!phaseNutritionChecklists[k] || phaseNutritionChecklists[k].length !== s.nutritionActions.length) phaseNutritionChecklists[k] = Array(s.nutritionActions.length).fill(false);
                const totalSteps = s.protectionActions.length + s.nutritionActions.length;
                const checkedCount = phaseChecklists[k].filter(Boolean).length + phaseNutritionChecklists[k].filter(Boolean).length;
                const percent = totalSteps ? Math.round((checkedCount / totalSteps) * 100) : 0;

                // Status by accumulated heat (САТ): пройдене / поточне / попереду
                const status = kn < recPhaseId ? 'done' : (kn === recPhaseId ? 'current' : 'upcoming');
                let pill;
                if (status === 'done') pill = '<span class="vt-pill done">Завершено</span>';
                else if (status === 'current') pill = `<span class="vt-pill">САТ ${Math.round(totalSAT)}°</span>`;
                else pill = '<span class="vt-pill upcoming">Попереду</span>';

                // Risk chips на обраній фазі
                let riskRow = '';
                if (selected && typeof phaseThreats !== 'undefined' && phaseThreats[kn]) {
                    const th = phaseThreats[kn];
                    const chips = [
                        th.pathogens ? `<span class="risk-chip high">${escapeHtml(th.pathogens.name)}</span>` : '',
                        th.disorders ? `<span class="risk-chip med">${escapeHtml(th.disorders.name)}</span>` : '',
                        th.pests ? `<span class="risk-chip med">${escapeHtml(th.pests.name)}</span>` : ''
                    ].join('');
                    if (chips) riskRow = `<div class="risk-chip-row">${chips}</div>`;
                }

                const dotInner = status === 'done' ? '<i data-lucide="check"></i>' : '';
                const dim = (status === 'upcoming' && !selected) ? ' style="opacity:0.6"' : '';
                return `
                    <div class="vt-item">
                        <div class="vt-dot ${status}">${dotInner}</div>
                        <button data-action="selectStep" data-action-param="${k}" class="vt-card ${selected ? 'selected' : ''}"${dim}>
                            <div class="vt-title-row">
                                <span class="vt-title">${escapeHtml(s.title)}</span>
                                ${pill}
                            </div>
                            <div class="vt-meta">Фаза ${k}${s.time ? ' · ' + escapeHtml(s.time) : ''}${percent > 0 ? ' · ' + percent + '%' : ''}</div>
                            ${riskRow}
                        </button>
                    </div>
                `;
            }).join('');
            nav.innerHTML = `<div class="vert-timeline">${items}</div>`;
            refreshLucide();
        }

        // --- SAT TRACKER LOGIC ---
        function addSAT() {
            const input = document.getElementById('sat-input');
            const dateInput = document.getElementById('sat-date');
            
            const val = parseFloat(input.value);
            const rawDate = dateInput.value;
            
            if (!rawDate) {
                showToast('Будь ласка, оберіть дату для запису.', 'warning');
                return;
            }
            
            if (!isNaN(val)) {
                if (val < 10) {
                    showToast('Для розрахунку САТ враховуються тільки температури від +10°C.', 'warning');
                    return;
                }
                
                const dateObj = new Date(rawDate);
                const formattedDate = dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                
                const contribution = parseFloat(val.toFixed(1));
                
                // Add to history
                satHistory.push({
                    rawDate: rawDate,
                    date: formattedDate,
                    temp: val,
                    contribution: contribution
                });
                
                // Sort history chronologically
                satHistory.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
                
                recalculateSAT();
                input.value = '';
                dateInput.valueAsDate = new Date();
            }
        }

        function deleteSATEntry(index) {
            satHistory.splice(index, 1);
            recalculateSAT();
        }

        function resetSAT() {
            if (confirm('Ви впевнені, що хочете скинути всі дані САТ за сезон?')) {
                satHistory = [];
                recalculateSAT();
            }
        }

        function recalculateSAT() {
            let cumulativeSAT = 0;
            let cumulativeSET = 0;
            
            satHistory.forEach(entry => {
                // Standard calculations (формули — у src/calc.js, тестуються Vitest)
                entry.sat_contribution = Calc.satContribution(entry.temp);
                entry.set_contribution = Calc.setContribution(entry.temp);
                
                // Backwards compatibility
                entry.contribution = entry.sat_contribution;
                
                cumulativeSAT += entry.sat_contribution;
                cumulativeSET += entry.set_contribution;
                
                entry.cumulative = parseFloat(cumulativeSAT.toFixed(1));
                entry.cumulativeSET = parseFloat(cumulativeSET.toFixed(1));
            });
            
            totalSAT = cumulativeSAT;
            totalSET = cumulativeSET;
            localStorage.setItem('satHistory', JSON.stringify(satHistory));
            
            updateSATDisplay();
            renderSATLog();
            updateChart();
            updateMilestoneProgress();
            if (typeof selectStep === 'function') selectStep(currentActivePhase);
        }

        // --- UPDATE DISPLAY ---
        function updateSATDisplay() {
            document.getElementById('sat-total').innerText = Math.round(totalSAT) + '°C';
            
            const headerSatDisplay = document.getElementById('current-sat-display');
            if (headerSatDisplay) {
                headerSatDisplay.innerText = Math.round(totalSAT) + '°';
            }
            const headerCounterLabel = document.getElementById('header-counter-label');
            if (headerCounterLabel) {
                headerCounterLabel.innerText = 'Поточний САТ';
            }
        }

        function renderSATLog() {
            const container = document.getElementById('sat-log-container');
            if (satHistory.length === 0) {
                container.innerHTML = `<p class="text-xs text-stone-400 italic text-center py-4">Немає записів за цей сезон</p>`;
                return;
            }
            
            container.innerHTML = satHistory.map((entry, idx) => {
                const label = 'САТ';
                const contrib = (entry.sat_contribution !== undefined ? entry.sat_contribution : (entry.temp >= 10 ? entry.temp : 0));
                const badgeColor = 'bg-emerald-100 text-emerald-800';
                return `
                    <div class="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-xs font-bold text-stone-700">
                        <div class="flex items-center gap-3">
                            <span class="text-stone-400 font-medium">${entry.date}</span>
                            <span>t° сер: <strong class="text-stone-850">${entry.temp}°C</strong></span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="${badgeColor} px-2 py-0.5 rounded-md font-extrabold text-[9px]">+${contrib.toFixed(1)}° ${label}</span>
                            <button data-action="deleteSATEntry" data-action-param="${idx}" class="text-stone-300 hover:text-rose-500 font-black transition-all ml-1">✕</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateFrostWarning() {
            const container = document.getElementById('frost-forecast-container');
            if (!container) return;
            
            if (!forecastDailyTemps || forecastDailyTemps.length === 0) {
                container.innerHTML = `
                    <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center py-6">
                        <p class="text-xs text-stone-400">Синхронізуйте погоду з API, щоб отримати прогноз приморозків</p>
                    </div>
                `;
                return;
            }
            
            const hasMinTemp = forecastDailyTemps.some(f => f.minTemp !== undefined);
            if (!hasMinTemp) {
                container.innerHTML = `
                    <div class="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center py-6">
                        <p class="text-xs text-stone-400">Синхронізуйте погоду з API, щоб активувати прогноз приморозків</p>
                    </div>
                `;
                return;
            }
            
            // Find all days in the forecast with minTemp <= 2.0
            const frostDays = forecastDailyTemps.filter(f => f.minTemp !== undefined && f.minTemp <= 2.0);
            
            if (frostDays.length > 0) {
                // Sort by temperature ascending to find the most severe frost
                const worstDay = [...frostDays].sort((a, b) => a.minTemp - b.minTemp)[0];
                const dateObj = new Date(worstDay.rawDate);
                const formattedDate = dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                
                const isCritical = worstDay.minTemp <= 0;
                const badgeClass = isCritical ? 'bg-rose-500 text-white border-rose-600' : 'bg-amber-500 text-stone-900 border-amber-600';
                const cardClass = isCritical ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-amber-500/10 border-amber-500/30 text-amber-200';
                const statusTitle = isCritical ? 'КРИТИЧНИЙ РИЗИК!' : 'РИЗИК ПРИМОРОЗКУ!';
                
                let detailsHTML = frostDays.map(f => {
                    const d = new Date(f.rawDate).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                    const color = f.minTemp <= 0 ? 'text-rose-400' : 'text-amber-400';
                    return `<div class="flex justify-between text-[11px] font-bold py-1 border-b border-white/5 last:border-0">
                        <span>${d}</span>
                        <span class="${color}">${f.minTemp}°C</span>
                    </div>`;
                }).join('');
                
                container.innerHTML = `
                    <div class="p-3.5 rounded-2xl border ${cardClass} space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-black uppercase tracking-wider">${statusTitle}</span>
                            <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${badgeClass}">${worstDay.minTemp}°C</span>
                        </div>
                        <p class="text-[10px] opacity-90 leading-tight">
                            Очікується зниження температури до ${worstDay.minTemp}°C (найнижча ${formattedDate}). Запустіть екстрений протокол захисту!
                        </p>
                        <div class="mt-2 pt-2 border-t border-white/10">
                            <p class="text-[9px] font-black uppercase text-stone-400 mb-1">Прогноз ризикових днів:</p>
                            <div class="max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                ${detailsHTML}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Find minimum temperature in forecast to display reassuring info
                const temps = forecastDailyTemps.map(f => f.minTemp !== undefined ? f.minTemp : 99).filter(t => t !== 99);
                const minForecastTemp = temps.length > 0 ? Math.min(...temps) : null;
                const minDay = minForecastTemp !== null ? forecastDailyTemps.find(f => f.minTemp === minForecastTemp) : null;
                
                let minInfoText = '';
                if (minDay) {
                    const dObj = new Date(minDay.rawDate);
                    const fDate = dObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
                    minInfoText = `Найхолодніша ніч: +${minForecastTemp}°C (${fDate}).`;
                }
                
                container.innerHTML = `
                    <div class="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-200 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-black uppercase tracking-wider">ЗАГРОЗ НЕМАЄ</span>
                            <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-emerald-500/30 bg-emerald-500/10">Безпечно</span>
                        </div>
                        <p class="text-[10px] opacity-90 leading-tight">
                            У найближчі 14 днів заморозків не передбачається. Прогноз сприятливий для вегетації.
                        </p>
                        ${minInfoText ? `
                        <div class="pt-2 border-t border-white/5 text-[10px] text-stone-400 flex justify-between font-bold">
                            <span>${minInfoText}</span>
                        </div>` : ''}
                    </div>
                `;
            }
        }

        function updateMilestoneProgress() {
            const bar = document.getElementById('milestone-progress-bar');
            const percentLabel = document.getElementById('milestone-percent');
            const milestoneLabel = document.getElementById('milestone-name');
            const statusLabel = document.getElementById('sat-status-label');
            
            const activeVal = thermalMode === 'sat' ? totalSAT : totalSET;
            
            let milestone = thermalMode === 'sat' ? 200 : 80;
            let label = thermalMode === 'sat' ? "До прокидання бруньки (200°С САТ)" : "До прокидання бруньки (80°С СЕТ)";
            
            if (thermalMode === 'sat') {
                if (totalSAT >= 1000) {
                    milestone = 2500;
                    label = "До повної стиглості ягід (2500°С)";
                } else if (totalSAT >= 800) {
                    milestone = 1000;
                    label = "До формування зав'язі (1000°С)";
                } else if (totalSAT >= 200) {
                    milestone = 800;
                    label = "До початку цвітіння (800°С)";
                }
                
                if (totalSAT >= 2500) {
                    statusLabel.innerText = "Урожай дозрів!";
                } else if (totalSAT >= 1000) {
                    statusLabel.innerText = "Формування ягоди";
                } else if (totalSAT >= 800) {
                    statusLabel.innerText = "Період цвітіння";
                } else if (totalSAT >= 200) {
                    statusLabel.innerText = "Активна вегетація";
                } else {
                    statusLabel.innerText = "Пробудження бруньок";
                }
            } else {
                if (totalSET >= 500) {
                    milestone = 1200;
                    label = "До повної стиглості ягід (1200°С)";
                } else if (totalSET >= 350) {
                    milestone = 500;
                    label = "До формування зав'язі (500°С)";
                } else if (totalSET >= 80) {
                    milestone = 350;
                    label = "До початку цвітіння (350°С)";
                }
                
                if (totalSET >= 1200) {
                    statusLabel.innerText = "Урожай дозрів!";
                } else if (totalSET >= 500) {
                    statusLabel.innerText = "Формування ягоди";
                } else if (totalSET >= 350) {
                    statusLabel.innerText = "Період цвітіння";
                } else if (totalSET >= 80) {
                    statusLabel.innerText = "Активна вегетація";
                } else {
                    statusLabel.innerText = "Пробудження бруньок";
                }
            }
            
            const pct = Math.min(100, Math.round((activeVal / milestone) * 100));
            milestoneLabel.innerText = label;
            percentLabel.innerText = pct + '%';
            bar.style.width = pct + '%';
        }

        // --- CHART.JS INTEGRATION ---
        function initChart() {
            const canvas = document.getElementById('sat-chart');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            const labels = satHistory.length > 0 ? satHistory.map(e => e.date) : ['Старт'];
            const activeData = satHistory.length > 0 
                ? satHistory.map(e => (thermalMode === 'sat' ? e.cumulative : (e.cumulativeSET || 0))) 
                : [0];

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: thermalMode === 'sat' ? 'Накопичений САТ (°C)' : 'Накопичена СЕТ (GDD) (°C)',
                        data: activeData,
                        borderColor: thermalMode === 'sat' ? '#059669' : '#d97706',
                        backgroundColor: thermalMode === 'sat' ? 'rgba(5, 150, 105, 0.05)' : 'rgba(217, 119, 6, 0.05)',
                        borderWidth: 3,
                        pointBackgroundColor: thermalMode === 'sat' ? '#059669' : '#d97706',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: satHistory.length > 0 ? 4 : 0,
                        tension: 0.25,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' },
                            ticks: { font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 10 }, color: '#64748b' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 10 }, color: '#64748b' }
                        }
                    }
                }
            });
        }

        function updateChart() {
            if (chartInstance) {
                chartInstance.data.labels = satHistory.length > 0 ? satHistory.map(e => e.date) : ['Старт'];
                const activeData = satHistory.length > 0 
                    ? satHistory.map(e => (thermalMode === 'sat' ? e.cumulative : (e.cumulativeSET || 0))) 
                    : [0];
                chartInstance.data.datasets[0].data = activeData;
                chartInstance.data.datasets[0].label = thermalMode === 'sat' ? 'Накопичений САТ (°C)' : 'Накопичена СЕТ (GDD) (°C)';
                chartInstance.data.datasets[0].borderColor = thermalMode === 'sat' ? '#059669' : '#d97706';
                chartInstance.data.datasets[0].backgroundColor = thermalMode === 'sat' ? 'rgba(5, 150, 105, 0.05)' : 'rgba(217, 119, 6, 0.05)';
                chartInstance.data.datasets[0].pointBackgroundColor = thermalMode === 'sat' ? '#059669' : '#d97706';
                chartInstance.data.datasets[0].pointRadius = satHistory.length > 0 ? 4 : 0;
                chartInstance.update();
            }
        }

        // --- DISEASE RISK PREDICTOR LOGIC ---
        function calculateDiseaseRisk() {
            const temp = parseFloat(document.getElementById('disease-temp').value) || 0;
            const rain = parseFloat(document.getElementById('disease-rain').value) || 0;
            const hum = parseFloat(document.getElementById('disease-humidity').value) || 0;
            
            // Класифікація ризику — у src/calc.js (правило 6-6-26 та оїдіум; тестується Vitest)
            const mildew = Calc.assessMildew(temp, rain);
            const oidium = Calc.assessOidium(temp, hum);

            // Update UI elements
            updateRiskCard('mildew', mildew.risk, mildew.advice);
            updateRiskCard('oidium', oidium.risk, oidium.advice);
        }

        function updateRiskCard(type, risk, advice) {
            const card = document.getElementById(`${type}-risk-card`);
            const badge = document.getElementById(`${type}-badge`);
            const adviceEl = document.getElementById(`${type}-advice`);
            
            adviceEl.innerText = advice;
            badge.innerText = risk === 'high' ? 'Високий' : (risk === 'medium' ? 'Середній' : 'Низький');
            
            // Class resets
            card.className = "p-4 rounded-3xl border transition-all duration-300 ";
            badge.className = "px-3 py-1 rounded-full text-[10px] font-black uppercase border ";
            
            if (risk === 'high') {
                card.classList.add('bg-rose-950/20', 'border-rose-500/50');
                badge.classList.add('bg-rose-500/20', 'text-rose-400', 'border-rose-500/30');
            } else if (risk === 'medium') {
                card.classList.add('bg-amber-950/20', 'border-amber-500/50');
                badge.classList.add('bg-amber-500/20', 'text-amber-400', 'border-amber-500/30');
            } else {
                card.classList.add('bg-white/5', 'border-white/10');
                badge.classList.add('bg-emerald-500/20', 'text-emerald-400', 'border-emerald-500/30');
            }
        }

        // --- ENCYCLOPEDIA 122 VARIETIES LOGIC ---
        function setColorFilter(color) {
            colorFilter = color;
            
            // Toggle active styles on buttons
            document.querySelectorAll('#color-filter-group button').forEach(btn => {
                btn.className = "px-3.5 py-2 text-xs font-black rounded-xl text-stone-600 hover:text-emerald-950 transition-all";
            });
            document.getElementById('cf-' + color).className = "px-3.5 py-2 text-xs font-black rounded-xl bg-white text-emerald-900 shadow-sm transition-all";
            
            renderVarietiesList();
        }

        // --- SORTING ENCYCLOPEDIA ---
        function sortVarieties() {
            sortMode = document.getElementById('var-sort').value;
            renderVarietiesList();
        }

        function renderVarietiesList() {
            let kish = [], seed = [];
            const query = document.getElementById('var-search').value.toLowerCase();
            
            // Helper parsing for sorting
            const getSortValue = (item) => {
                if (sortMode === 'rip') {
                    // Extract first digits of ripening period
                    return parseFloat(item.rip) || 999;
                } else if (sortMode === 'bunch') {
                    // Extract first digits of bunch weight
                    return parseFloat(item.bunch) || 0;
                }
                return item.name;
            };

            // Filter items
            Object.keys(varietyData).forEach(name => {
                const item = { name: name, ...varietyData[name] };
                
                // Apply search filter
                if (query && !name.toLowerCase().includes(query)) return;
                
                // Apply color filter
                if (colorFilter !== 'all' && item.col !== colorFilter) return;
                
                if (item.seed.includes("Безкіст")) {
                    kish.push(item);
                } else {
                    seed.push(item);
                }
            });

            // Apply sort
            const sortFn = (a, b) => {
                const valA = getSortValue(a);
                const valB = getSortValue(b);
                
                if (sortMode === 'name') {
                    return valA.localeCompare(valB, 'uk');
                } else if (sortMode === 'rip') {
                    return valA - valB;
                } else { // bunch descending
                    return valB - valA;
                }
            };
            
            kish.sort(sortFn);
            seed.sort(sortFn);

            const grid = document.getElementById('var-grid-container');
            
            if (kish.length === 0 && seed.length === 0) {
                grid.innerHTML = `
                    <div class="text-center text-stone-400 py-20 bg-stone-50 rounded-[30px] border border-stone-200/50">
                        <span class="text-5xl block mb-2">🔍</span>
                        <p class="font-bold">Жодного сорту не знайдено за вашим запитом</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = `
                <div class="col-span-full mb-2"><h3 class="font-black text-emerald-900 bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm sticky top-0 z-10 uppercase text-xs tracking-widest">✨ Безкісточкові (Кишмиші)</h3></div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-8 mt-2">${kish.map(v => generateVarBtn(v)).join('')}</div>
                <div class="col-span-full mb-2"><h3 class="font-black text-emerald-900 bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm sticky top-0 z-10 uppercase text-xs tracking-widest">🍇 Столові Сорти</h3></div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">${seed.map(v => generateVarBtn(v)).join('')}</div>
            `;
            
            // Re-highlight the selected variety if it is still visible, otherwise select first visible
            const visibleItems = [...kish, ...seed];
            if (visibleItems.length > 0) {
                const exists = visibleItems.some(v => v.name === activeVar);
                selectVar(exists ? activeVar : visibleItems[0].name);
            }
        }

        function calculateCounters() {
            let total = 0, w = 0, r = 0, b = 0;
            Object.values(varietyData).forEach(item => {
                total++;
                if (item.col === 'W') w++;
                else if (item.col === 'R') r++;
                else if (item.col === 'B') b++;
            });
            document.getElementById('count-all').innerText = total;
            document.getElementById('count-W').innerText = w;
            document.getElementById('count-R').innerText = r;
            document.getElementById('count-B').innerText = b;
        }

        function generateVarBtn(v) {
            const qty = vineyardQuantities[v.name] || 0;
            const qtyBadge = qty > 0 ? ` <span class="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-black">x${qty}</span>` : '';
            return `
                <button data-action="selectVar" data-action-param="${v.name}" data-variety="${v.name}" class="variety-grid-btn px-4 py-3.5 text-left text-xs font-bold border border-stone-200 rounded-2xl text-stone-900 bg-white shadow-sm hover:bg-emerald-50 hover:border-emerald-300 flex items-center justify-between">
                    <span class="truncate flex items-center">${grapeSVG(colorMap[v.col])} <span class="ml-1 truncate">${v.name}</span></span>
                    ${qtyBadge}
                </button>
            `;
        }

        function getPhBadgeClass(ph) {
            if (!ph) return 'bg-stone-100 text-stone-600';
            const val = parseFloat(ph);
            if (val < 5.5) return 'bg-rose-100 text-rose-700 font-black border border-rose-250';
            if (val < 6.0) return 'bg-amber-100 text-amber-700 font-black border border-amber-250';
            if (val <= 7.2) return 'bg-emerald-100 text-emerald-800 font-black border border-emerald-250';
            if (val <= 7.8) return 'bg-teal-100 text-teal-800 font-black border border-teal-250';
            return 'bg-blue-100 text-blue-700 font-black border border-blue-250';
        }

        function getPhLabel(ph) {
            if (!ph) return '—';
            const val = parseFloat(ph);
            if (val < 5.0) return '🔴 Сильнокислий';
            if (val < 5.5) return '⚠️ Кислий';
            if (val < 6.0) return '🟡 Слабкокислий';
            if (val <= 7.2) return '🟢 Нейтральний (Оптимум)';
            if (val <= 7.8) return '🔵 Слабколужний';
            return '❌ Лужний';
        }

        function getMoistureLabel(m) {
            if (m === undefined || m === null) return '—';
            const val = parseInt(m);
            if (val < 30) return '🥀 Сухий (Полив!)';
            if (val < 50) return '💧 Помірно вологий';
            if (val <= 70) return '🌱 Оптимально вологий';
            return '🌊 Перезволожений';
        }

        function updateSoilStatus(name, pH, moisture) {
            if (!customVarieties[name]) {
                customVarieties[name] = { ...varietyData[name] };
            }
            customVarieties[name].soilPH = parseFloat(pH) || 6.5;
            customVarieties[name].soilMoisture = parseInt(moisture) || 50;
            
            localStorage.setItem('viticulture-custom-varieties', JSON.stringify(customVarieties));
            varietyData[name].soilPH = parseFloat(pH) || 6.5;
            varietyData[name].soilMoisture = parseInt(moisture) || 50;
            
            // Re-render details inline
            const displayPh = document.getElementById('soil-ph-val-display');
            const displayPhLbl = document.getElementById('soil-ph-lbl-display');
            const displayMoist = document.getElementById('soil-moist-val-display');
            const displayMoistLbl = document.getElementById('soil-moist-lbl-display');
            
            if (displayPh) {
                displayPh.innerText = pH;
                displayPh.className = `text-xs font-black px-2 py-0.5 rounded-md ${getPhBadgeClass(pH)}`;
            }
            if (displayPhLbl) displayPhLbl.innerText = getPhLabel(pH);
            if (displayMoist) displayMoist.innerText = moisture + '%';
            if (displayMoistLbl) displayMoistLbl.innerText = getMoistureLabel(moisture);
            
            showToast('Показники ґрунту оновлено', 'success');
        }

        function selectVar(name) {
            activeVar = name;
            
            document.querySelectorAll('.variety-grid-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            const btn = document.querySelector(`[data-variety="${name}"]`);
            if (btn) btn.classList.add('selected');
            
            const d = varietyData[name];
            if (!d) return;
            const catInfo = getCatInfoByRip(d.rip);
            const qty = vineyardQuantities[name] || 0;

            const ph = d.soilPH || 6.5;
            const moist = d.soilMoisture !== undefined && d.soilMoisture !== null ? d.soilMoisture : 50;

            document.getElementById('var-details-panel').innerHTML = `
                <div class="fade-in space-y-6">
                    <div class="border-b border-emerald-200/60 pb-4 flex justify-between items-start">
                        <div>
                            <span class="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em] block">Агрономічний паспорт</span>
                            <h3 class="text-2xl font-black text-emerald-950 mt-1 flex items-center gap-1.5">${grapeSVG(colorMap[d.col])} ${name}</h3>
                        </div>
                        <button data-action="deleteVariety" data-action-param="${name}" class="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-600 transition-all text-xs" title="Видалити сорт з колекції">
                            🗑️
                        </button>
                    </div>
                    
                    <!-- Vineyard Quantity Editor -->
                    <div class="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
                        <div>
                            <span class="block opacity-40 uppercase font-black text-[9px] tracking-wide">На винограднику</span>
                            <span id="detail-var-qty-display" class="text-sm font-black text-stone-850 mt-0.5 block">${qty} кущів</span>
                        </div>
                        <div class="flex items-center bg-stone-50 border border-stone-200/60 rounded-xl p-1 gap-1">
                            <button data-action="dlg_changeVineyard" data-name="${name}" data-delta="-1" class="w-8 h-8 rounded-lg bg-white border border-stone-200 font-black text-stone-600 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all">-</button>
                            <input type="number" id="detail-var-qty-input" value="${qty}" min="0" data-action="dlg_setVineyard" data-action-on="change" data-name="${name}" class="w-12 text-center bg-transparent border-none font-black text-xs outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                            <button data-action="dlg_changeVineyard" data-name="${name}" data-delta="1" class="w-8 h-8 rounded-lg bg-white border border-stone-200 font-black text-stone-600 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all">+</button>
                        </div>
                    </div>
                    
                    <!-- 🌱 Показники ґрунту біля куща (Soil pH & Moisture) -->
                    <div class="bg-gradient-to-br from-emerald-50/50 to-stone-50/50 p-4 rounded-3xl border border-emerald-100/70 shadow-sm space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">🌱 Показники ґрунту біля кущів</span>
                            <span class="text-[8px] font-bold text-stone-400 bg-stone-100/80 px-2 py-0.5 rounded-full">Автозбереження</span>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <!-- pH Slider & Badge -->
                            <div class="space-y-2 bg-white p-3.5 rounded-2xl border border-stone-200/40 shadow-sm">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <span class="text-[9px] font-black text-stone-400 uppercase block">pH Кислотність</span>
                                        <span id="soil-ph-lbl-display" class="text-[10px] font-bold text-stone-600 mt-0.5 block">${getPhLabel(ph)}</span>
                                    </div>
                                    <span id="soil-ph-val-display" class="text-xs font-black px-2 py-0.5 rounded-md ${getPhBadgeClass(ph)}">${ph}</span>
                                </div>
                                <div class="flex items-center gap-2 mt-1">
                                    <input type="range" min="4.5" max="8.5" step="0.1" value="${ph}" 
                                           data-action="dlg_soilPhInput" data-action-on="input"
                                           data-action="dlg_soilPh" data-action-on="change" data-name="${name}"
                                           class="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-emerald-600" id="soil-ph-slider">
                                </div>
                            </div>
                            
                            <!-- Moisture Slider & Value -->
                            <div class="space-y-2 bg-white p-3.5 rounded-2xl border border-stone-200/40 shadow-sm">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <span class="text-[9px] font-black text-stone-400 uppercase block">Вологість ґрунту</span>
                                        <span id="soil-moist-lbl-display" class="text-[10px] font-bold text-stone-600 mt-0.5 block">${getMoistureLabel(moist)}</span>
                                    </div>
                                    <span id="soil-moist-val-display" class="text-xs font-black text-sky-600 bg-sky-50 border border-sky-150 px-2 py-0.5 rounded-md">${moist}%</span>
                                </div>
                                <div class="flex items-center gap-2 mt-1">
                                    <input type="range" min="10" max="90" step="5" value="${moist}" 
                                           data-action="dlg_soilMoistInput" data-action-on="input"
                                           data-action="dlg_soilMoist" data-action-on="change" data-name="${name}"
                                           class="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-sky-500" id="soil-moisture-slider">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100/50">
                            <span class="block opacity-40 uppercase font-black text-[9px] mb-1">📅 Термін</span>
                            <span class="font-bold text-stone-800">${d.rip}</span>
                        </div>
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100/50">
                            <span class="block opacity-40 uppercase font-black text-[9px] mb-1">⚖️ Маса грона</span>
                            <span class="font-bold text-stone-800">${d.bunch}</span>
                        </div>
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100/50">
                            <span class="block opacity-40 uppercase font-black text-[9px] mb-1">☀️ Група, САТ & СЕТ</span>
                            <span class="font-bold text-stone-800 block">${catInfo.group}</span>
                            <span class="text-[10px] text-emerald-700 font-bold mt-0.5 block">САТ: ${catInfo.catRange}</span>
                            <span class="text-[10px] text-amber-700 font-bold mt-0.5 block">СЕТ (GDD): ${catInfo.setRange}</span>
                        </div>
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100/50">
                            <span class="block opacity-40 uppercase font-black text-[9px] mb-1">⏳ Період (таблиця)</span>
                            <span class="font-bold text-stone-800 block">${catInfo.daysRange}</span>
                        </div>
                        <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100/50 col-span-2">
                            <span class="block opacity-40 uppercase font-black text-[9px] mb-1">👅 Смаковий профіль</span>
                            <span class="font-bold text-emerald-800 uppercase tracking-wider text-[11px]">${d.taste}</span>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-3xl border border-emerald-100 shadow-inner">
                        <span class="block text-[10px] font-black uppercase text-emerald-700 mb-2">Агрорекомендація по догляду:</span>
                        <p class="text-[12px] leading-relaxed font-medium text-stone-700 italic">${d.care}</p>
                    </div>
                </div>
            `;
        }

        function deleteVariety(name) {
            if (confirm(`Ви впевнені, що хочете видалити сорт "${name}" з вашої колекції?`)) {
                if (customVarieties[name]) {
                    delete customVarieties[name];
                    localStorage.setItem('viticulture-custom-varieties', JSON.stringify(customVarieties));
                }
                if (defaultVarietyData[name] && !deletedVarieties.includes(name)) {
                    deletedVarieties.push(name);
                    localStorage.setItem('viticulture-deleted-varieties', JSON.stringify(deletedVarieties));
                }
                if (vineyardQuantities[name] !== undefined) {
                    delete vineyardQuantities[name];
                    localStorage.setItem('viticulture-vineyard-quantities', JSON.stringify(vineyardQuantities));
                }
                
                initEncyclopediaData();
                calculateCounters();
                initSatChecker();
                renderVarietiesList();
                
                document.getElementById('var-details-panel').innerHTML = `
                    <div class="text-center text-stone-300 py-32">
                        <span class="text-7xl block mb-4 opacity-20">🍇</span>
                        <p class="font-black text-sm uppercase tracking-widest opacity-40">Виберіть сорт зі списку</p>
                    </div>
                `;
            }
        }

        function changeVineyardQuantity(name, amount) {
            let current = vineyardQuantities[name] || 0;
            current = Math.max(0, current + amount);
            setVineyardQuantity(name, current);
        }

        function setVineyardQuantity(name, val) {
            const num = Math.max(0, parseInt(val) || 0);
            vineyardQuantities[name] = num;
            localStorage.setItem('viticulture-vineyard-quantities', JSON.stringify(vineyardQuantities));
            
            const display = document.getElementById('detail-var-qty-display');
            if (display) display.innerText = `${num} кущів`;
            
            const input = document.getElementById('detail-var-qty-input');
            if (input) input.value = num;
            
            renderVarietiesList();
        }

        function openAddVarietyModal() {
            document.getElementById('modal-add-variety').classList.remove('hidden');
            document.getElementById('form-add-variety').reset();
            document.getElementById('add-var-autocomplete-badge').classList.add('hidden');
            document.getElementById('add-var-name').focus();
        }

        function closeAddVarietyModal() {
            document.getElementById('modal-add-variety').classList.add('hidden');
        }

        async function fetchVarietyInfoAI() {
            const name = document.getElementById('add-var-name').value.trim();
            if (!name) {
                alert('Будь ласка, спочатку введіть назву сорту винограду для пошуку через AI.');
                return;
            }
            
            const btn = document.querySelector('button[data-action="fetchVarietyInfoAI"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span>⏳ Шукаємо...</span>';
            
            const systemInstruction = "Ти — досвідчений український агроном та ампелограф. Повертай лише валідний JSON за схемою.";
            const prompt = `Знайди детальну агрономічну інформацію про сорт винограду "${name}".
Поверни відповідь виключно у форматі JSON із такими полями (мовою відповіді має бути українська):
{
  "name": "Назва сорту українською",
  "rip": "кількість днів дозрівання (наприклад: '110-115 дн.')",
  "col": "колір ягоди: 'W' (білий), 'R' (червоний/рожевий), 'B' (чорний/синій)",
  "taste": "опис смаку (наприклад: 'Мускат з тонами шавлії')",
  "bunch": "середня вага грона (наприклад: '600-1000 г')",
  "seed": "наявність кісточок: 'З кіст.' або 'Безкіст.'",
  "care": "короткі особливості догляду та вразливості сорту (до 150 символів)"
}
Якщо сорт не знайдено, поверни:
{
  "error": "Сорт не знайдено"
}`;

            try {
                const responseText = await fetchGeminiAPI(prompt, systemInstruction, true);
                const data = cleanAIJson(responseText);

                if (data.error) {
                    alert(`AI не знайшов сорт "${name}". Спробуйте іншу або точнішу назву.`);
                    return;
                }
                
                if (data.col) {
                    let colVal = 'W';
                    const c = data.col.toUpperCase();
                    if (c === 'B' || c.includes('ЧОРН') || c.includes('СИН') || c.includes('BLACK') || c.includes('ТЕМН') || c.includes('BLUE')) {
                        colVal = 'B';
                    } else if (c === 'R' || c.includes('РОЖ') || c.includes('ЧЕРВ') || c.includes('ROSE') || c.includes('RED') || c.includes('PINK')) {
                        colVal = 'R';
                    }
                    document.getElementById('add-var-color').value = colVal;
                }
                if (data.rip) document.getElementById('add-var-rip').value = data.rip;
                if (data.bunch) document.getElementById('add-var-bunch').value = data.bunch;
                if (data.seed) {
                    let seedVal = 'З кіст.';
                    const s = data.seed.toLowerCase();
                    if (s.includes('без') || s.includes('кишмиш') || s.includes('seedless')) {
                        seedVal = 'Безкіст.';
                    }
                    document.getElementById('add-var-seed').value = seedVal;
                }
                if (data.taste) document.getElementById('add-var-taste').value = data.taste;
                if (data.care) document.getElementById('add-var-care').value = data.care;
                if (data.name) document.getElementById('add-var-name').value = data.name;
                
                const inputsToHighlight = ['add-var-name', 'add-var-color', 'add-var-rip', 'add-var-bunch', 'add-var-seed', 'add-var-taste', 'add-var-care'];
                inputsToHighlight.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.classList.add('ring-2', 'ring-emerald-500', 'border-emerald-500');
                        setTimeout(() => {
                            el.classList.remove('ring-2', 'ring-emerald-500', 'border-emerald-500');
                        }, 2500);
                    }
                });
            } catch (err) {
                console.error(err);
                showToast(`Не вдалося завантажити дані від AI: ${err.message}`, 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }

        function saveCustomVariety(event) {
            event.preventDefault();
            const name = document.getElementById('add-var-name').value.trim();
            const col = document.getElementById('add-var-color').value;
            const rip = document.getElementById('add-var-rip').value.trim();
            const bunch = document.getElementById('add-var-bunch').value.trim() || "—";
            const seed = document.getElementById('add-var-seed').value;
            const taste = document.getElementById('add-var-taste').value.trim() || "Гармонійний";
            const care = document.getElementById('add-var-care').value.trim() || "Агрорекомендації відсутні.";
            const qty = parseInt(document.getElementById('add-var-qty').value) || 0;
            
            // Programmatic validation (bypass silent HTML5 required)
            if (!name) {
                showToast('Будь ласка, введіть назву сорту.', 'warning');
                document.getElementById('add-var-name').focus();
                return;
            }
            if (!rip) {
                showToast('Будь ласка, вкажіть термін дозрівання.', 'warning');
                document.getElementById('add-var-rip').focus();
                return;
            }
            
            const delIdx = deletedVarieties.indexOf(name);
            if (delIdx > -1) {
                deletedVarieties.splice(delIdx, 1);
                localStorage.setItem('viticulture-deleted-varieties', JSON.stringify(deletedVarieties));
            }
            
            customVarieties[name] = { rip, col, taste, bunch, seed, care };
            localStorage.setItem('viticulture-custom-varieties', JSON.stringify(customVarieties));
            
            if (qty > 0) {
                vineyardQuantities[name] = qty;
                localStorage.setItem('viticulture-vineyard-quantities', JSON.stringify(vineyardQuantities));
            }
            
            initEncyclopediaData();
            calculateCounters();
            initSatChecker();
            renderVarietiesList();
            
            // Reset form and close variety modal explicitly
            document.getElementById('form-add-variety').reset();
            closeAddVarietyModal();
            
            showToast(`Сорт «${name}» успішно збережено!`, 'success');
            
            setTimeout(() => {
                selectVar(name);
                const btn = document.querySelector(`[data-variety="${name}"]`);
                if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }

        function handleAddVarNameInput() {
            const name = document.getElementById('add-var-name').value.trim();
            const badge = document.getElementById('add-var-autocomplete-badge');
            const matchKey = Object.keys(defaultVarietyData).find(k => k.toLowerCase() === name.toLowerCase());
            if (matchKey) {
                const d = defaultVarietyData[matchKey];
                document.getElementById('add-var-name').value = matchKey;
                document.getElementById('add-var-color').value = d.col;
                document.getElementById('add-var-rip').value = d.rip;
                document.getElementById('add-var-bunch').value = d.bunch;
                document.getElementById('add-var-seed').value = d.seed.includes("Безкіст") ? "Безкіст." : "З кіст.";
                document.getElementById('add-var-taste').value = d.taste;
                document.getElementById('add-var-care').value = d.care;
                if (badge) badge.classList.remove('hidden');
            } else {
                if (badge) badge.classList.add('hidden');
            }
        }

        let activeEncyclopediaTab = 'collection';
        
        function setEncyclopediaTab(tab) {
            activeEncyclopediaTab = tab;
            const collectionBlock = document.getElementById('encyclopedia-collection-block');
            const nurseryBlock = document.getElementById('encyclopedia-nursery-block');
            
            const btnCollection = document.getElementById('btn-encyclopedia-collection');
            const btnNursery = document.getElementById('btn-encyclopedia-nursery');
            
            if (tab === 'collection') {
                collectionBlock.classList.remove('hidden');
                nurseryBlock.classList.add('hidden');
                
                btnCollection.className = "flex-1 py-2 rounded-xl text-xs font-black transition-all bg-emerald-600 text-white shadow-sm";
                btnNursery.className = "flex-1 py-2 rounded-xl text-xs font-black transition-all text-stone-500 hover:text-stone-850";
                
                renderVarietiesList();
            } else {
                collectionBlock.classList.add('hidden');
                nurseryBlock.classList.remove('hidden');
                
                btnCollection.className = "flex-1 py-2 rounded-xl text-xs font-black transition-all text-stone-500 hover:text-stone-850";
                btnNursery.className = "flex-1 py-2 rounded-xl text-xs font-black transition-all bg-emerald-600 text-white shadow-sm";
                
                initNurseryDatalist();
                renderNurseryList();
            }
        }

        function initNurseryDatalist() {
            const list = document.getElementById('nursery-varieties-list');
            if (list) {
                list.innerHTML = Object.keys(varietyData).map(name => `<option value="${name}">`).join('');
            }
        }

        function handleNurseryNameInput() {
            const name = document.getElementById('nursery-add-name').value.trim();
            const matchKey = Object.keys(varietyData).find(k => k.toLowerCase() === name.toLowerCase());
            if (matchKey) {
                const d = varietyData[matchKey];
                document.getElementById('nursery-add-name').value = matchKey;
                document.getElementById('nursery-add-color').value = d.col;
            }
        }

        function addNurseryItem(event) {
            event.preventDefault();
            const name = document.getElementById('nursery-add-name').value.trim();
            const col = document.getElementById('nursery-add-color').value;
            const qty = parseInt(document.getElementById('nursery-add-qty').value) || 1;
            const note = document.getElementById('nursery-add-note').value.trim() || "";
            
            if (!name) return;
            
            if (nurseryVarieties[name]) {
                nurseryVarieties[name].qty += qty;
                if (note) nurseryVarieties[name].note = note;
            } else {
                nurseryVarieties[name] = { col, qty, note };
            }
            
            localStorage.setItem('viticulture-nursery-varieties', JSON.stringify(nurseryVarieties));
            document.getElementById('form-add-nursery').reset();
            renderNurseryList();
        }

        function changeNurseryQuantity(name, amount) {
            if (!nurseryVarieties[name]) return;
            nurseryVarieties[name].qty = Math.max(1, nurseryVarieties[name].qty + amount);
            localStorage.setItem('viticulture-nursery-varieties', JSON.stringify(nurseryVarieties));
            renderNurseryList();
        }

        function deleteNurseryItem(name) {
            if (confirm(`Видалити сорт "${name}" з розсадника?`)) {
                delete nurseryVarieties[name];
                localStorage.setItem('viticulture-nursery-varieties', JSON.stringify(nurseryVarieties));
                renderNurseryList();
            }
        }

        function transplantToVineyard(name) {
            if (!nurseryVarieties[name]) return;
            const nurseryItem = nurseryVarieties[name];
            
            const inputQty = prompt(`Скільки кущів сорту "${name}" висадити на виноградник? (Доступно: ${nurseryItem.qty})`, nurseryItem.qty);
            if (inputQty === null) return;
            
            const qtyToPlant = Math.max(1, Math.min(nurseryItem.qty, parseInt(inputQty) || 0));
            if (!qtyToPlant) return;
            
            if (!varietyData[name]) {
                if (defaultVarietyData[name]) {
                    const delIdx = deletedVarieties.indexOf(name);
                    if (delIdx > -1) {
                        deletedVarieties.splice(delIdx, 1);
                        localStorage.setItem('viticulture-deleted-varieties', JSON.stringify(deletedVarieties));
                    }
                } else {
                    customVarieties[name] = {
                        rip: "115 дн.",
                        col: nurseryItem.col,
                        taste: "Гармонійний",
                        bunch: "500-800 г",
                        seed: "З кіст.",
                        care: "Висаджено з розсадника."
                    };
                    localStorage.setItem('viticulture-custom-varieties', JSON.stringify(customVarieties));
                }
            }
            
            vineyardQuantities[name] = (vineyardQuantities[name] || 0) + qtyToPlant;
            localStorage.setItem('viticulture-vineyard-quantities', JSON.stringify(vineyardQuantities));
            
            nurseryItem.qty -= qtyToPlant;
            if (nurseryItem.qty <= 0) {
                delete nurseryVarieties[name];
            }
            localStorage.setItem('viticulture-nursery-varieties', JSON.stringify(nurseryVarieties));
            
            initEncyclopediaData();
            renderNurseryList();
            
            alert(`Успішно висаджено ${qtyToPlant} кущів сорту "${name}" на виноградник!`);
        }

        function renderNurseryList() {
            const container = document.getElementById('nursery-grid-container');
            const summaryBadge = document.getElementById('nursery-summary');
            if (!container) return;
            
            const keys = Object.keys(nurseryVarieties);
            let totalQty = 0;
            
            if (keys.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center text-stone-400 py-20 bg-stone-50 rounded-[30px] border border-stone-200/50">
                        <span class="text-5xl block mb-2">🌱</span>
                        <p class="font-bold">Розсадник порожній</p>
                        <p class="text-xs mt-1">Додайте живці або саджанці у школку за допомогою форми ліворуч.</p>
                    </div>
                `;
                if (summaryBadge) summaryBadge.innerText = "Усього: 0 шт.";
                return;
            }
            
            container.innerHTML = keys.map(name => {
                const item = nurseryVarieties[name];
                totalQty += item.qty;
                const grapeColor = colorMap[item.col] || "#10b981";
                const noteText = item.note ? `<p class="text-[10px] text-stone-500 italic mt-1 font-medium bg-stone-100/50 p-1.5 rounded-lg border border-stone-200/30 truncate">${item.note}</p>` : '';
                
                return `
                    <div class="bg-white p-5 rounded-3xl border border-stone-200/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="text-sm font-black text-stone-850 flex items-center gap-1.5">${grapeSVG(grapeColor)} ${name}</h4>
                                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${item.col === 'W' ? 'bg-lime-50 text-lime-700' : item.col === 'R' ? 'bg-rose-50 text-rose-700' : 'bg-purple-50 text-purple-700'}">
                                    ${item.col === 'W' ? 'Біла ягода' : item.col === 'R' ? 'Рожева ягода' : 'Чорна ягода'}
                                </span>
                                ${noteText}
                            </div>
                            <button data-action="deleteNurseryItem" data-action-param="${name}" class="text-stone-400 hover:text-rose-500 transition-all text-xs p-1" title="Видалити з розсадника">
                                🗑️
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between pt-2 border-t border-stone-100">
                            <div class="flex items-center bg-stone-50 border border-stone-200/50 rounded-xl p-1 gap-1">
                                <button data-action="dlg_changeNursery" data-name="${name}" data-delta="-1" class="w-7 h-7 rounded-lg bg-white border border-stone-200 font-black text-stone-600 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all text-xs">-</button>
                                <span class="w-8 text-center font-black text-xs text-stone-800">${item.qty}</span>
                                <button data-action="dlg_changeNursery" data-name="${name}" data-delta="1" class="w-7 h-7 rounded-lg bg-white border border-stone-200 font-black text-stone-600 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all text-xs">+</button>
                            </div>
                            
                            <button data-action="transplantToVineyard" data-action-param="${name}" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1">
                                🌱 Висадити
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            if (summaryBadge) summaryBadge.innerText = `Усього: ${totalQty} шт.`;
        }

        function filterVarieties() {
            renderVarietiesList();
        }

        // --- VITICULTURE CAT AND RIPENING SUITABILITY CHECKER ---
        function getCatInfoByRip(ripStr) {
            const numbers = ripStr.match(/\d+/g);
            if (!numbers || numbers.length === 0) {
                return { group: "Невідомо", catRange: "—", setRange: "—", daysRange: "—", minCat: 0, maxCat: 0, minSet: 0, maxSet: 0 };
            }
            
            let days = 0;
            if (numbers.length === 1) {
                days = parseInt(numbers[0]);
            } else {
                days = (parseInt(numbers[0]) + parseInt(numbers[1])) / 2;
            }
            
            if (days <= 97) {
                return { group: "Ультраранні", catRange: "1900-2000°C", setRange: "500-650°C", daysRange: "90-95 днів", minCat: 1900, maxCat: 2000, minSet: 500, maxSet: 650 };
            } else if (days <= 107) {
                return { group: "Надранні", catRange: "2000-2100°C", setRange: "650-750°C", daysRange: "100-105 днів", minCat: 2000, maxCat: 2100, minSet: 650, maxSet: 750 };
            } else if (days <= 114) {
                return { group: "Дуже ранні", catRange: "2100-2200°C", setRange: "750-850°C", daysRange: "110-115 днів", minCat: 2100, maxCat: 2200, minSet: 750, maxSet: 850 };
            } else if (days <= 122) {
                return { group: "Ранні", catRange: "2300-2500°C", setRange: "850-1050°C", daysRange: "115-120 днів", minCat: 2300, maxCat: 2500, minSet: 850, maxSet: 1050 };
            } else if (days <= 134) {
                return { group: "Ранньо-середні", catRange: "2600-2700°C", setRange: "1050-1150°C", daysRange: "125-135 днів", minCat: 2600, maxCat: 2700, minSet: 1050, maxSet: 1150 };
            } else if (days <= 140) {
                return { group: "Середні", catRange: "2700-2800°C", setRange: "1150-1250°C", daysRange: "135-140 днів", minCat: 2700, maxCat: 2800, minSet: 1150, maxSet: 1250 };
            } else if (days <= 150) {
                return { group: "Середньо-пізні", catRange: "2800-2900°C", setRange: "1250-1350°C", daysRange: "140-150 днів", minCat: 2800, maxCat: 2900, minSet: 1250, maxSet: 1350 };
            } else if (days <= 160) {
                return { group: "Пізні", catRange: "2900-3000°C", setRange: "1350-1450°C", daysRange: "150-160 днів", minCat: 2900, maxCat: 3000, minSet: 1350, maxSet: 1450 };
            } else {
                return { group: "Дуже пізні", catRange: "3000-3200°C", setRange: "1450-1650°C", daysRange: "160-170 днів", minCat: 3000, maxCat: 3200, minSet: 1450, maxSet: 1650 };
            }
        }

        function initSatChecker() {
            const datalist = document.getElementById('sat-check-varieties');
            if (datalist) {
                datalist.innerHTML = Object.keys(varietyData).map(name => `
                    <option value="${name}">
                `).join('');
            }
            
            const savedLocalSat = localStorage.getItem('user-local-sat');
            if (savedLocalSat) {
                const localSatInput = document.getElementById('sat-check-local-sat');
                if (localSatInput) localSatInput.value = savedLocalSat;
            }
            
            runSatSuitabilityCheck();
        }

        function runSatSuitabilityCheck() {
            const nameInputEl = document.getElementById('sat-check-name');
            if (!nameInputEl) return;
            const nameInput = nameInputEl.value.trim();
            
            const localSatEl = document.getElementById('sat-check-local-sat');
            const localValInput = localSatEl ? (parseFloat(localSatEl.value) || (thermalMode === 'sat' ? 2700 : 1200)) : (thermalMode === 'sat' ? 2700 : 1200);
            
            localStorage.setItem('user-local-sat', localValInput);
            
            const resultCard = document.getElementById('sat-check-result-card');
            if (!resultCard) return;
            
            if (!nameInput) {
                resultCard.innerHTML = `
                    <div class="text-center text-emerald-300/50 py-4">
                        <span class="text-3xl block mb-2">🍇</span>
                        <p class="text-xs font-black uppercase tracking-widest">Введіть сорт винограду для аналізу</p>
                    </div>
                `;
                return;
            }
            
            const d = varietyData[nameInput];
            if (!d) {
                resultCard.innerHTML = `
                    <div class="text-center text-rose-300/80 py-4">
                        <span class="text-3xl block mb-2">🤷‍♂️</span>
                        <p class="text-xs font-black uppercase tracking-widest">Сорт "${nameInput}" не знайдено в базі</p>
                        <p class="text-[10px] mt-1 opacity-70">Оберіть сорт із випадаючого списку або перевірте правильність написання.</p>
                    </div>
                `;
                return;
            }
            
            const catInfo = getCatInfoByRip(d.rip);
            
            const targetMin = thermalMode === 'sat' ? catInfo.minCat : catInfo.minSet;
            const targetMax = thermalMode === 'sat' ? catInfo.maxCat : catInfo.maxSet;
            const targetRange = thermalMode === 'sat' ? catInfo.catRange : catInfo.setRange;
            const label = thermalMode === 'sat' ? 'САТ' : 'СЕТ';
            
            const diffMax = localValInput - targetMax;
            const diffMin = localValInput - targetMin;
            
            let statusBadgeClass = '';
            let statusText = '';
            let sugarText = '';
            let icon = '';
            let advice = '';
            
            if (localValInput >= targetMax) {
                statusBadgeClass = 'bg-emerald-500 text-white';
                statusText = 'Сприятливий клімат';
                sugarText = 'Відмінний цукор (18-22% і більше), ягода визріє на 100% навіть у холодні сезони.';
                icon = '🟢';
                advice = `Запас тепла становить <strong>+${Math.round(diffMax)}°C ${label}</strong>. Ягода повністю визріє, а лоза встигне добре підготуватися до зими.`;
            } else if (localValInput >= targetMin) {
                statusBadgeClass = 'bg-amber-500 text-white';
                statusText = 'Гранична зона визрівання';
                sugarText = 'Задовільний або середній цукор (15-17%). Ягода визріє повністю лише в теплі сезони.';
                icon = '🟡';
                advice = `Запас ${label} мінімальний (від <strong>${Math.round(diffMin)}°C</strong> до <strong>${Math.round(diffMax)}°C</strong>). Рекомендується посадка з південної сторони будівель, видалення листя біля грон та нормування врожаю.`;
            } else {
                statusBadgeClass = 'bg-rose-500 text-white';
                statusText = 'Ризик недозрівання';
                sugarText = 'Низький рівень цукру, ягода залишиться кислою або не встигне забарвитися.';
                icon = '🔴';
                advice = `Нестача тепла становить <strong>${Math.abs(Math.round(diffMin))}°C ${label}</strong>. Сорт не рекомендується для відкритого ґрунту у вашому регіоні. Потрібна теплиця або пристінна культура.`;
            }
            
            resultCard.innerHTML = `
                <div class="space-y-4 fade-in">
                    <div class="flex items-center justify-between gap-4 flex-wrap">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">${icon}</span>
                            <div>
                                <h4 class="font-black text-white text-sm">${nameInput}</h4>
                                <p class="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">${catInfo.group} • ${label}: ${targetRange}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusBadgeClass}">${statusText}</span>
                    </div>
                    
                    <div class="bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/40 text-xs space-y-2">
                        <div>
                            <span class="block text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">🍭 Цукронакопичення</span>
                            <p class="text-white font-medium">${sugarText}</p>
                        </div>
                        <div class="border-t border-emerald-800/40 pt-2">
                            <span class="block text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">📋 Агро-рекомендація</span>
                            <p class="text-emerald-100">${advice}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // --- SPECIALIZED VITICULTURE CALCULATORS LOGIC ---
        let activeScenario = 'root-feeding';
        let rootStep = 1;
        let foliarStep = 1;
        let protectionWaterMode = 'bushes';
        let protectionMixerItems = [];
        let foliarWaterVolume = 7;
        let foliarAreaSotka = 0;

        function switchScenario(scenarioId) {
            activeScenario = scenarioId;
            const scenarios = ['root-feeding', 'foliar-spraying'];
            scenarios.forEach(s => {
                const btn = document.getElementById(`scenario-btn-${s}`);
                const content = document.getElementById(`scenario-${s}`);
                if (s === scenarioId) {
                    btn.className = 'px-6 py-2.5 rounded-xl text-xs font-black transition-all bg-emerald-500 text-white shadow-md';
                    content.classList.remove('hidden');
                } else {
                    btn.className = 'px-6 py-2.5 rounded-xl text-xs font-black transition-all text-emerald-300 hover:text-white';
                    content.classList.add('hidden');
                }
            });
            localStorage.setItem('activeScenario', scenarioId);
            runAllCalculations();
        }

        function goToStep(scenario, step) {
            if (step < 1 || step > 3) return;
            
            if (scenario === 'root') {
                rootStep = step;
                for (let i = 1; i <= 3; i++) {
                    const el = document.getElementById(`root-step-${i}`);
                    if (el) {
                        if (i === step) {
                            el.classList.remove('hidden');
                            el.style.opacity = '0';
                            requestAnimationFrame(() => { el.style.opacity = '1'; });
                        } else {
                            el.classList.add('hidden');
                        }
                    }
                }
                // Sync NPK data to Step 2 when entering it
                if (step === 2) syncNPKToFertigation();
                if (step === 3) renderECGuardian();
            } else {
                foliarStep = step;
                for (let i = 1; i <= 3; i++) {
                    const el = document.getElementById(`foliar-step-${i}`);
                    if (el) {
                        if (i === step) {
                            el.classList.remove('hidden');
                            el.style.opacity = '0';
                            requestAnimationFrame(() => { el.style.opacity = '1'; });
                        } else {
                            el.classList.add('hidden');
                        }
                    }
                }
                if (step === 2) {
                    runFoliarStep2();
                    const waterReminder = document.getElementById('foliar-step2-water-reminder');
                    if (waterReminder) waterReminder.innerText = foliarWaterVolume.toFixed(1) + ' л';
                }
                if (step === 3) renderFoliarProtocol();
            }
            
            renderWizardProgress(scenario, step);
            saveCalculatorsState();
        }

        function renderWizardProgress(scenario, currentStep) {
            const prefix = scenario === 'root' ? 'root' : 'foliar';
            for (let i = 1; i <= 3; i++) {
                const stepEl = document.getElementById(`${prefix}-wiz-${i}`);
                if (!stepEl) continue;
                const circle = stepEl.querySelector('div');
                const label = stepEl.querySelector('span');
                
                if (i < currentStep) {
                    circle.className = 'w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-black transition-all duration-300';
                    circle.innerHTML = '✓';
                    label.className = 'text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap';
                } else if (i === currentStep) {
                    circle.className = 'w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-emerald-500/30 transition-all duration-300';
                    circle.innerHTML = i;
                    label.className = 'text-[9px] font-black text-emerald-300 uppercase tracking-widest whitespace-nowrap';
                } else {
                    circle.className = 'w-9 h-9 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-sm font-black transition-all duration-300';
                    circle.innerHTML = i;
                    label.className = 'text-[9px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap';
                }
            }
            for (let i = 1; i <= 2; i++) {
                const conn = document.getElementById(`${prefix}-wiz-conn-${i}${i+1}`);
                if (conn) {
                    conn.className = i < currentStep 
                        ? 'w-8 sm:w-12 h-0.5 bg-emerald-600 mx-1 sm:mx-2 mb-5 transition-all duration-300' 
                        : 'w-8 sm:w-12 h-0.5 bg-white/15 mx-1 sm:mx-2 mb-5 transition-all duration-300';
                }
            }
        }

        function updateSharedBushes(val) {
            const numericVal = parseInt(val) || 1;
            document.getElementById('shared-bushes').value = numericVal;
            localStorage.setItem('viticulture-bushes-count', numericVal);
            runAllCalculations();
        }

        const npkPresets = {
            start: { n: 15, p: 5, k: 5 },
            prebloom: { n: 10, p: 15, k: 10 },
            berry: { n: 10, p: 10, k: 25 },
            autumn: { n: 0, p: 20, k: 30 }
        };

        function applyNPKPhasePreset() {
            const preset = document.getElementById('npk-phase-preset').value;
            if (preset && preset !== 'custom') {
                const values = npkPresets[preset];
                document.getElementById('npk-target-n').value = values.n;
                document.getElementById('npk-target-p').value = values.p;
                document.getElementById('npk-target-k').value = values.k;
            }
            runNPKCalculations();
        }

        const defaultDryFertilizers = [
            { name: "Карбамід (Сечовина)", n: 46, p: 0, k: 0, category: "n_fertilizer" },
            { name: "Аміачна селітра", n: 34, p: 0, k: 0, category: "n_fertilizer" },
            { name: "Кальцієва селітра Ca(NO₃)₂", n: 15, p: 0, k: 0, category: "n_fertilizer" },
            { name: "Сульфат амонію (NH₄)₂SO₄", n: 21, p: 0, k: 0, category: "n_fertilizer" },
            { name: "Натрієва селітра NaNO₃", n: 16, p: 0, k: 0, category: "n_fertilizer" },
            { name: "Монофосфат калію (0-52-34)", n: 0, p: 52, k: 34, category: "pk_fertilizer" },
            { name: "Сульфат калію K₂SO₄", n: 0, p: 0, k: 50, category: "pk_fertilizer" },
            { name: "Суперфосфат подвійний (0-46-0)", n: 0, p: 46, k: 0, category: "pk_fertilizer" },
            { name: "Суперфосфат простий (0-20-0)", n: 0, p: 20, k: 0, category: "pk_fertilizer" },
            { name: "Калімагнезія (0-0-28 + 10% Mg)", n: 0, p: 0, k: 28, category: "pk_fertilizer" },
            { name: "Хлористий калій KCl", n: 0, p: 0, k: 60, category: "pk_fertilizer" },
            { name: "MAP Амофос (12-52-0)", n: 12, p: 52, k: 0, category: "pk_fertilizer" },
            { name: "Діамофос (21-53-0)", n: 21, p: 53, k: 0, category: "pk_fertilizer" },
            { name: "YaraMila Complex (12-11-18)", n: 12, p: 11, k: 18, category: "complex_fertilizer" },
            { name: "Нітроамофоска (16-16-16)", n: 16, p: 16, k: 16, category: "complex_fertilizer" },
            { name: "Плантафол 20-20-20", n: 20, p: 20, k: 20, category: "complex_fertilizer" },
            { name: "Плантафол 10-54-10 (Високий P)", n: 10, p: 54, k: 10, category: "complex_fertilizer" },
            { name: "Плантафол 5-15-45 (Високий K)", n: 5, p: 15, k: 45, category: "complex_fertilizer" },
            { name: "Мастер 18-18-18+3", n: 18, p: 18, k: 18, category: "complex_fertilizer" }
        ];

        let dryFertilizers = [];

        function initDryFertilizers() {
            const dbProducts = getProductDB();
            const dbFertilizers = dbProducts.filter(p => p && (p.type === 'fertilizer' || (p.category && p.category.includes('fertilizer'))));
            
            dryFertilizers = dbFertilizers.map(p => {
                const comp = p.composition || {};
                const npk = comp.npk || {};
                return {
                    name: p.name,
                    n: npk.n || 0,
                    p: npk.p || 0,
                    k: npk.k || 0,
                    checked: false,
                    dose: 0
                };
            });
            
            const savedState = localStorage.getItem('viticulture-dry-fert-state');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    dryFertilizers.forEach(f => {
                        const saved = state.find(s => 
                            s.name.toLowerCase() === f.name.toLowerCase() ||
                            f.name.toLowerCase().includes(s.name.toLowerCase()) ||
                            s.name.toLowerCase().includes(f.name.toLowerCase())
                        );
                        if (saved) {
                            f.checked = saved.checked;
                            f.dose = saved.dose;
                        }
                    });
                } catch(e) { console.error(e); }
            } else {
                dryFertilizers.forEach(f => {
                    if (f.name.includes("Карбамід") || f.name.includes("Монофосфат") || f.name.includes("Сульфат")) {
                        f.checked = true;
                    }
                });
            }
            
            renderNPKFertilizersList();
            runNPKCalculations();
        }

        function resetDryFertilizers() {
            if (confirm('Бажаєте скинути вибрані добрива та дози до початкового стану?')) {
                localStorage.removeItem('viticulture-dry-fert-state');
                initDryFertilizers();
                showToast('Стан добрив скинуто до початкового.', 'info');
            }
        }

        function filterNPKFertilizers() {
            const query = document.getElementById('npk-search-input').value.toLowerCase().trim();
            renderNPKFertilizersList(query);
        }

        function searchProductDBAndAdd(query) {
            const products = getProductDB();
            const match = products.find(p => p.name.toLowerCase().includes(query.toLowerCase()) && 
                                           (p.type === 'fertilizer' || p.category.includes('fertilizer')));
            if (match) {
                const exists = dryFertilizers.find(f => f.name.toLowerCase() === match.name.toLowerCase());
                if (exists) {
                    exists.checked = true;
                    showToast(`Добриво «${match.name}» вже було у списку, його активовано.`, 'info');
                } else {
                    const n = match.composition.npk ? (match.composition.npk.n || 0) : 0;
                    const p = match.composition.npk ? (match.composition.npk.p || 0) : 0;
                    const k = match.composition.npk ? (match.composition.npk.k || 0) : 0;
                    dryFertilizers.push({ name: match.name, n, p, k, checked: true, dose: 0 });
                    showToast(`Додано «${match.name}» з Бази Препаратів!`, 'success');
                }
                document.getElementById('npk-search-input').value = '';
                saveDryFertilizersState();
                renderNPKFertilizersList();
                runNPKCalculations();
            } else {
                if (confirm(`Добриво «${query}» не знайдено. Бажаєте додати його до Бази Препаратів?`)) {
                    switchTab('products');
                    openAddProductModal(query, 'n_fertilizer');
                }
            }
        }

        function editFertilizer(index) {
            const item = dryFertilizers[index];
            const name = prompt(`Редагування «${item.name}». Нова назва:`, item.name);
            if (name === null) return;
            const newName = name.trim();
            if (!newName) return;
            const nStr = prompt(`Вміст Азоту (N %) для ${newName}:`, item.n);
            if (nStr === null) return;
            const n = parseInt(nStr) || 0;
            const pStr = prompt(`Вміст Фосфору (P %) для ${newName}:`, item.p);
            if (pStr === null) return;
            const p = parseInt(pStr) || 0;
            const kStr = prompt(`Вміст Калію (K %) для ${newName}:`, item.k);
            if (kStr === null) return;
            const k = parseInt(kStr) || 0;
            dryFertilizers[index].name = newName;
            dryFertilizers[index].n = n;
            dryFertilizers[index].p = p;
            dryFertilizers[index].k = k;
            let customList = [];
            const custom = localStorage.getItem('viticulture-custom-dry-fert');
            if (custom) { try { customList = JSON.parse(custom); } catch(e) {} }
            const cIdx = customList.findIndex(f => f.name.toLowerCase() === item.name.toLowerCase());
            if (cIdx > -1) {
                customList[cIdx] = { name: newName, n, p, k };
                localStorage.setItem('viticulture-custom-dry-fert', JSON.stringify(customList));
            }
            saveDryFertilizersState();
            renderNPKFertilizersList();
            runNPKCalculations();
            showToast(`Добриво «${newName}» оновлено.`, 'success');
        }

        function deleteFertilizer(index) {
            const item = dryFertilizers[index];
            if (confirm(`Видалити «${item.name}» зі списку?`)) {
                dryFertilizers.splice(index, 1);
                let customList = [];
                const custom = localStorage.getItem('viticulture-custom-dry-fert');
                if (custom) { try { customList = JSON.parse(custom); } catch(e) {} }
                const cIdx = customList.findIndex(f => f.name.toLowerCase() === item.name.toLowerCase());
                if (cIdx > -1) {
                    customList.splice(cIdx, 1);
                    localStorage.setItem('viticulture-custom-dry-fert', JSON.stringify(customList));
                }
                saveDryFertilizersState();
                renderNPKFertilizersList();
                runNPKCalculations();
                showToast(`Добриво «${item.name}» видалено.`, 'info');
            }
        }

        function renderNPKFertilizersList(query = '') {
            const container = document.getElementById('npk-fertilizers-list');
            if (!container) return;
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;
            const filtered = dryFertilizers.map((item, index) => ({ ...item, originalIndex: index }))
                .filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
            if (filtered.length === 0 && query.length > 0) {
                container.innerHTML = `
                    <div class="text-center p-4 text-xs text-stone-300">
                        <p class="mb-2">Добриво «${query}» не знайдено в списку.</p>
                        <button type="button" data-action="searchProductDBAndAdd" data-action-param="${query}" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all">
                            🔍 Знайти в Базі Препаратів
                        </button>
                    </div>
                `;
                return;
            }
            container.innerHTML = filtered.map((item) => {
                const checked = item.checked ? 'checked' : '';
                const disabled = item.checked ? '' : 'disabled';
                const dose = item.dose !== undefined ? item.dose : 0;
                const totalWeightG = dose * bushes;
                const totalWeightStr = totalWeightG >= 1000 
                    ? (totalWeightG / 1000).toFixed(2) + ' кг' 
                    : Math.round(totalWeightG) + ' г';
                return `
                    <div class="flex items-center gap-3 bg-emerald-900/30 p-3 rounded-2xl border border-emerald-800/30">
                        <input type="checkbox" id="npk-check-${item.originalIndex}" data-action="dlg_toggleNPK" data-action-on="change" data-idx="${item.originalIndex}" ${checked} class="rounded text-emerald-650 focus:ring-emerald-500 bg-white/10 border-white/20 h-4 w-4 cursor-pointer">
                        <div class="flex-grow min-w-0">
                            <span class="text-xs font-bold text-white block truncate">${item.name}</span>
                            <span class="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest text-shadow-glow">N:${item.n}% P:${item.p}% K:${item.k}%</span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" data-action="editFertilizer" data-action-param="${item.originalIndex}" class="p-1 text-stone-400 hover:text-emerald-450 text-[11px] transition-colors" title="Редагувати">✏️</button>
                            <button type="button" data-action="deleteFertilizer" data-action-param="${item.originalIndex}" class="p-1 text-stone-400 hover:text-rose-500 text-[11px] transition-colors" title="Видалити">🗑️</button>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <input type="number" id="npk-dose-${item.originalIndex}" value="${dose}" min="0" data-action="dlg_npkDose" data-action-on="input" data-idx="${item.originalIndex}" ${disabled} class="w-16 p-1.5 rounded-lg bg-white/5 border border-white/20 outline-none text-center text-xs font-black text-white focus:bg-white/10 focus:border-emerald-400 transition-all disabled:opacity-30">
                            <span class="text-[9px] text-emerald-300 font-bold">г/кущ</span>
                        </div>
                        <span class="text-[11px] font-black text-emerald-300 w-20 text-right shrink-0">${totalWeightStr}</span>
                    </div>
                `;
            }).join('');
        }

        function toggleNPKFertilizer(index) {
            const checkbox = document.getElementById(`npk-check-${index}`);
            dryFertilizers[index].checked = checkbox.checked;
            saveDryFertilizersState();
            renderNPKFertilizersList();
            runNPKCalculations();
        }

        function updateNPKDose(index, val) {
            dryFertilizers[index].dose = parseFloat(val) || 0;
            saveDryFertilizersState();
            renderNPKFertilizersList();
            runNPKCalculations();
        }

        function saveDryFertilizersState() {
            const state = dryFertilizers.map(f => ({ name: f.name, checked: !!f.checked, dose: f.dose || 0 }));
            localStorage.setItem('viticulture-dry-fert-state', JSON.stringify(state));
        }

        function addCustomFertilizer() {
            const nameInput = document.getElementById('npk-custom-name');
            const nInput = document.getElementById('npk-custom-n');
            const pInput = document.getElementById('npk-custom-p');
            const kInput = document.getElementById('npk-custom-k');
            const name = nameInput.value.trim();
            const n = parseInt(nInput.value) || 0;
            const p = parseInt(pInput.value) || 0;
            const k = parseInt(kInput.value) || 0;
            if (!name) { showToast('Будь ласка, введіть назву добрива.', 'warning'); return; }
            const newDbProduct = {
                id: `prod-${Date.now()}`, name, type: "fertilizer",
                category: (n > 20) ? "n_fertilizer" : "complex_fertilizer",
                composition: { activeIngredients: [], npk: { n, p, k }, micronutrients: {} },
                dosage: { perLiter: "2-3 г/л", perHectare: "—", perBush: "20-30 г" },
                applicationScope: "Створено через калькулятор NPK",
                compatibility: { compatible: [], incompatible: [], notes: "" },
                techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "—", phOptimal: "6.0" },
                isCustom: true, updatedAt: new Date().toISOString().split('T')[0]
            };
            const products = getProductDB();
            const exists = products.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (exists) {
                if (exists.type === 'fertilizer' && exists.composition) {
                    exists.composition.npk = { n, p, k };
                    exists.updatedAt = new Date().toISOString().split('T')[0];
                    saveProductDB();
                }
            } else {
                products.push(newDbProduct);
                saveProductDB();
            }
            initDryFertilizers();
            const addedItem = dryFertilizers.find(f => f.name.toLowerCase() === name.toLowerCase());
            if (addedItem) addedItem.checked = true;
            nameInput.value = ''; nInput.value = ''; pInput.value = ''; kInput.value = '';
            saveDryFertilizersState();
            renderNPKFertilizersList();
            runNPKCalculations();
        }

        function runNPKCalculations() {
            const targetN = parseFloat(document.getElementById('npk-target-n').value) || 0;
            const targetP = parseFloat(document.getElementById('npk-target-p').value) || 0;
            const targetK = parseFloat(document.getElementById('npk-target-k').value) || 0;
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;

            let suppliedN = 0, suppliedP = 0, suppliedK = 0;
            let mixtureDetailsHtml = '';
            let mixtureTotalWeightG = 0;
            let totalDosePerBush = 0;

            dryFertilizers.forEach(item => {
                if (item.checked) {
                    const dose = item.dose || 0;
                    suppliedN += (dose * item.n) / 100;
                    suppliedP += (dose * item.p) / 100;
                    suppliedK += (dose * item.k) / 100;
                    totalDosePerBush += dose;
                    const weightG = dose * bushes;
                    mixtureTotalWeightG += weightG;
                    const weightStr = weightG >= 1000 ? (weightG / 1000).toFixed(2) + ' кг' : Math.round(weightG) + ' г';
                    mixtureDetailsHtml += `
                        <div class="flex justify-between items-center text-xs">
                            <span class="opacity-80">${item.name}</span>
                            <span class="font-bold">${weightStr}</span>
                        </div>
                    `;
                }
            });

            const pctN = targetN > 0 ? Math.round((suppliedN / targetN) * 100) : 0;
            const pctP = targetP > 0 ? Math.round((suppliedP / targetP) * 100) : 0;
            const pctK = targetK > 0 ? Math.round((suppliedK / targetK) * 100) : 0;

            const statNEl = document.getElementById('npk-stat-n');
            if (statNEl) statNEl.innerText = `${suppliedN.toFixed(1)} / ${targetN} г (${pctN}%)`;
            const statPEl = document.getElementById('npk-stat-p');
            if (statPEl) statPEl.innerText = `${suppliedP.toFixed(1)} / ${targetP} г (${pctP}%)`;
            const statKEl = document.getElementById('npk-stat-k');
            if (statKEl) statKEl.innerText = `${suppliedK.toFixed(1)} / ${targetK} г (${pctK}%)`;

            updateProgressBar('npk-bar-n', pctN);
            updateProgressBar('npk-bar-p', pctP);
            updateProgressBar('npk-bar-k', pctK);

            const summaryEl = document.getElementById('npk-results-summary');
            if (summaryEl) {
                summaryEl.innerHTML = mixtureDetailsHtml || `<div class="text-center text-emerald-300/40 py-2 text-xs">Немає обраних добрив</div>`;
            }
            const totalMixtureEl = document.getElementById('npk-total-weight-mixture');
            if (totalMixtureEl) totalMixtureEl.innerText = (mixtureTotalWeightG / 1000).toFixed(2) + ' кг';

            // Auto-sync fert-dry-dose with total NPK dose
            const fertDryDoseEl = document.getElementById('fert-dry-dose');
            if (fertDryDoseEl && totalDosePerBush > 0) {
                fertDryDoseEl.value = Math.round(totalDosePerBush * 10) / 10;
            }

            localStorage.setItem('viticulture-npk-target-n', targetN);
            localStorage.setItem('viticulture-npk-target-p', targetP);
            localStorage.setItem('viticulture-npk-target-k', targetK);
            
            const currentPreset = document.getElementById('npk-phase-preset').value;
            if (currentPreset && currentPreset !== 'custom') {
                const presetVals = npkPresets[currentPreset];
                if (presetVals && (presetVals.n !== targetN || presetVals.p !== targetP || presetVals.k !== targetK)) {
                    document.getElementById('npk-phase-preset').value = 'custom';
                }
            }
            saveCalculatorsState();
        }

        function updateProgressBar(barId, pct) {
            const bar = document.getElementById(barId);
            if (!bar) return;
            bar.style.width = Math.min(pct, 100) + '%';
            if (pct < 90) {
                bar.className = "bg-amber-500 h-full rounded-full transition-all duration-300";
            } else if (pct <= 110) {
                bar.className = "bg-emerald-500 h-full rounded-full transition-all duration-300";
            } else {
                bar.className = "bg-rose-500 h-full rounded-full transition-all duration-300";
            }
        }

        function autoSolveNPK() {
            const targetN = parseFloat(document.getElementById('npk-target-n').value) || 0;
            const targetP = parseFloat(document.getElementById('npk-target-p').value) || 0;
            const targetK = parseFloat(document.getElementById('npk-target-k').value) || 0;
            const checkedFertilizers = dryFertilizers.filter(f => f.checked);
            if (checkedFertilizers.length === 0) {
                alert('Оберіть хоча б одне добриво (галочкою) для автоматичного розрахунку.');
                return;
            }
            dryFertilizers.forEach(f => { if (f.checked) f.dose = 0; });
            let remainingN = targetN, remainingP = targetP, remainingK = targetK;
            const fertP = checkedFertilizers.find(f => f.p > 0);
            if (fertP && remainingP > 0) {
                const dose = (remainingP * 100) / fertP.p;
                fertP.dose = Math.round(dose * 10) / 10;
                remainingN -= (fertP.dose * fertP.n) / 100;
                remainingK -= (fertP.dose * fertP.k) / 100;
                remainingP = 0;
            }
            const fertK = checkedFertilizers.find(f => f.k > 0 && f.p === 0) || checkedFertilizers.find(f => f.k > 0);
            if (fertK && remainingK > 0) {
                const dose = (remainingK * 100) / fertK.k;
                fertK.dose = Math.round(((fertK.dose || 0) + dose) * 10) / 10;
                remainingN -= (dose * fertK.n) / 100;
                remainingK = 0;
            }
            const fertN = checkedFertilizers.find(f => f.n > 0 && f.p === 0 && f.k === 0) || checkedFertilizers.find(f => f.n > 0);
            if (fertN && remainingN > 0) {
                const dose = (remainingN * 100) / fertN.n;
                fertN.dose = Math.round(((fertN.dose || 0) + dose) * 10) / 10;
                remainingN = 0;
            }
            dryFertilizers.forEach(f => { if (f.checked && f.dose < 0) f.dose = 0; });
            saveDryFertilizersState();
            renderNPKFertilizersList();
            runNPKCalculations();
        }

        // ═══ NPK → Fertigation Sync (Root Step 1 → Step 2) ═══
        function syncNPKToFertigation() {
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;
            const summaryEl = document.getElementById('root-step2-npk-summary');
            const totalDoseEl = document.getElementById('root-step2-total-dose');
            let totalDose = 0;
            let html = '';
            dryFertilizers.forEach(item => {
                if (item.checked && item.dose > 0) {
                    totalDose += item.dose;
                    const weightG = item.dose * bushes;
                    const weightStr = weightG >= 1000 ? (weightG / 1000).toFixed(2) + ' кг' : Math.round(weightG) + ' г';
                    html += `<div class="flex justify-between items-center py-1"><span>${item.name} <span class="text-emerald-400/60">(${item.dose} г/кущ)</span></span><span class="font-black text-white">${weightStr}</span></div>`;
                }
            });
            if (summaryEl) summaryEl.innerHTML = html || '<p class="text-emerald-300/50 text-center py-2">Немає обраних добрив у Кроку 1</p>';
            if (totalDoseEl) totalDoseEl.innerText = totalDose > 0 ? Math.round(totalDose * 10) / 10 + ' г' : '0 г';
            // Auto-update fert-dry-dose
            const fertDryDoseEl = document.getElementById('fert-dry-dose');
            if (fertDryDoseEl && totalDose > 0) fertDryDoseEl.value = Math.round(totalDose * 10) / 10;
            runFertigationCalculations();
        }

        // ═══ ROOT STEP 2: Fertigation Calculations ═══
        function toggleVenturiMode() {
            const useVenturiEl = document.getElementById('fert-use-venturi');
            const useVenturi = useVenturiEl ? useVenturiEl.checked : true;
            const container = document.getElementById('venturi-inputs-container');
            const cardContent = document.getElementById('fert-card-stock-content');
            const cardDisabled = document.getElementById('fert-card-stock-disabled');
            if (useVenturi) {
                if (container) container.classList.remove('hidden');
                if (cardContent) cardContent.classList.remove('hidden');
                if (cardDisabled) cardDisabled.classList.add('hidden');
            } else {
                if (container) container.classList.add('hidden');
                if (cardContent) cardContent.classList.add('hidden');
                if (cardDisabled) cardDisabled.classList.remove('hidden');
            }
            runFertigationCalculations();
        }

        function applyFertInjectPreset() {
            const val = document.getElementById('fert-inject-ratio').value;
            const kInput = document.getElementById('fert-inject-k');
            if (val !== 'custom') {
                kInput.value = val;
                kInput.readOnly = true;
                kInput.classList.add('opacity-60');
            } else {
                kInput.readOnly = false;
                kInput.classList.remove('opacity-60');
            }
            runFertigationCalculations();
        }

        function runFertigationCalculations() {
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;
            const drippersPerBush = parseInt(document.getElementById('fert-drippers').value) || 2;
            const flowRate = parseFloat(document.getElementById('fert-dripper-flow').value) || 2.0;
            const targetWater = parseFloat(document.getElementById('fert-water-target').value) || 15;
            const dryDose = parseFloat(document.getElementById('fert-dry-dose').value) || 10;
            const stockVol = parseFloat(document.getElementById('fert-stock-vol').value) || 10;
            const injectK = parseFloat(document.getElementById('fert-inject-k').value) || 0.01;
            
            const totalWater = bushes * targetWater;
            document.getElementById('fert-res-water').innerText = totalWater;
            
            const runtimeHoursVal = targetWater / (drippersPerBush * flowRate);
            const hours = Math.floor(runtimeHoursVal);
            const minutes = Math.round((runtimeHoursVal - hours) * 60);
            document.getElementById('fert-res-time').innerText = `${hours} год ${minutes} хв`;
            
            const totalMass = bushes * dryDose;
            document.getElementById('fert-res-mass').innerText = totalMass >= 1000 
                ? (totalMass / 1000).toFixed(2) + ' кг' 
                : Math.round(totalMass) + ' г';
                
            const concVal = totalWater > 0 ? (totalMass / totalWater) : 0;
            document.getElementById('fert-res-conc').innerText = concVal.toFixed(2) + ' г/л';
            
            const ecVal = concVal * 1.2;
            document.getElementById('fert-res-ec').innerText = ecVal.toFixed(2);
            
            const useVenturiEl = document.getElementById('fert-use-venturi');
            const useVenturi = useVenturiEl ? useVenturiEl.checked : true;
            
            if (useVenturi) {
                const stockMassGrams = totalWater > 0 && injectK > 0 
                    ? (totalMass * stockVol) / (totalWater * injectK) 
                    : 0;
                document.getElementById('fert-res-stock').innerText = stockMassGrams >= 1000 
                    ? (stockMassGrams / 1000).toFixed(2) + ' кг' 
                    : Math.round(stockMassGrams) + ' г';
                document.getElementById('fert-res-stock-vol').innerText = stockVol + ' л';
                document.getElementById('fert-res-bush-mix-vol').innerText = targetWater.toFixed(1) + ' л';
                const stockPerBushL = targetWater * injectK;
                const stockPerBushStr = stockPerBushL < 1.0 
                    ? Math.round(stockPerBushL * 1000) + ' мл' 
                    : stockPerBushL.toFixed(2) + ' л';
                document.getElementById('fert-res-bush-stock-vol').innerText = stockPerBushStr;
            } else {
                document.getElementById('fert-res-stock').innerText = '0 г';
                document.getElementById('fert-res-stock-vol').innerText = '0 л';
                document.getElementById('fert-res-bush-mix-vol').innerText = targetWater.toFixed(1) + ' л';
                document.getElementById('fert-res-bush-stock-vol').innerText = '0 мл';
            }
            
            saveCalculatorsState();
        }

        // ═══ ROOT STEP 3: EC Guardian ═══
        function checkECGuardian(ecValue) {
            if (ecValue > 2.5) return { status: 'danger',  color: 'rose',    barPct: 100, msg: '🚫 КРИТИЧНО! Ризик хімічного опіку коріння солями. Збільште об\'єм води або зменште дозу.' };
            if (ecValue > 2.0) return { status: 'warning', color: 'orange',  barPct: 80,  msg: '⚠️ Підвищена солоність. Рекомендуємо збільшити об\'єм води на кущ або знизити дозу.' };
            if (ecValue > 1.5) return { status: 'caution', color: 'amber',   barPct: 60,  msg: '🟡 Помірна солоність. Прийнятно для дорослих кущів з розвиненою кореневою системою.' };
            return { status: 'safe', color: 'emerald', barPct: Math.max(10, (ecValue / 2.0) * 100), msg: '✅ Безпечний рівень EC. Можна вносити без ризику.' };
        }

        function renderECGuardian() {
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;
            const targetWater = parseFloat(document.getElementById('fert-water-target').value) || 15;
            const dryDose = parseFloat(document.getElementById('fert-dry-dose').value) || 10;
            const totalWater = bushes * targetWater;
            const totalMass = bushes * dryDose;
            const concVal = totalWater > 0 ? (totalMass / totalWater) : 0;
            const ecVal = concVal * 1.2;
            
            const ec = checkECGuardian(ecVal);

            // Update EC Guardian display
            const ecValueEl = document.getElementById('ec-guardian-value');
            if (ecValueEl) ecValueEl.innerText = ecVal.toFixed(2);
            
            const ecBarEl = document.getElementById('ec-guardian-bar');
            if (ecBarEl) {
                ecBarEl.style.width = Math.min(ec.barPct, 100) + '%';
                const colorMap = { emerald: 'bg-emerald-500', amber: 'bg-amber-500', orange: 'bg-orange-500', rose: 'bg-rose-500' };
                ecBarEl.className = `${colorMap[ec.color] || 'bg-emerald-500'} h-full rounded-full transition-all duration-500`;
            }

            // Update params
            const massEl = document.getElementById('ec-param-mass');
            if (massEl) massEl.innerText = totalMass >= 1000 ? (totalMass/1000).toFixed(2) + ' кг' : totalMass + ' г';
            const waterEl = document.getElementById('ec-param-water');
            if (waterEl) waterEl.innerText = totalWater + ' л';
            const concEl = document.getElementById('ec-param-conc');
            if (concEl) concEl.innerText = concVal.toFixed(2) + ' г/л';

            // Salinity alert
            const alertBox = document.getElementById('fert-salinity-alert');
            if (alertBox) {
                if (ec.status === 'danger' || ec.status === 'warning') {
                    alertBox.innerHTML = `
                        <div class="bg-${ec.color}-950/70 border border-${ec.color}-800/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-${ec.color}-200">
                            <span class="text-xl">⚠️</span>
                            <div>
                                <strong class="text-${ec.color}-100 uppercase font-black">EC = ${ecVal.toFixed(2)} mS/cm</strong>
                                <p class="mt-1 opacity-90">${ec.msg}</p>
                            </div>
                        </div>
                    `;
                } else {
                    alertBox.innerHTML = `
                        <div class="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-300">
                            <span class="text-xl">✅</span>
                            <div>
                                <strong class="text-emerald-100 uppercase font-black">EC = ${ecVal.toFixed(2)} mS/cm</strong>
                                <p class="mt-0.5 opacity-80">${ec.msg}</p>
                            </div>
                        </div>
                    `;
                }
            }

            // Final protocol
            renderRootProtocol(bushes, totalWater, totalMass, ecVal);
        }

        function renderRootProtocol(bushes, totalWater, totalMass, ecVal) {
            const protocolEl = document.getElementById('root-final-protocol');
            if (!protocolEl) return;
            const useVenturi = document.getElementById('fert-use-venturi')?.checked;
            const stockVol = parseFloat(document.getElementById('fert-stock-vol')?.value) || 10;
            const injectK = parseFloat(document.getElementById('fert-inject-k')?.value) || 0.01;
            
            let recipeLines = '';
            dryFertilizers.forEach(item => {
                if (item.checked && item.dose > 0) {
                    const wG = item.dose * bushes;
                    const wStr = wG >= 1000 ? (wG/1000).toFixed(2) + ' кг' : Math.round(wG) + ' г';
                    recipeLines += `<tr><td class="py-1 pr-4">${item.name}</td><td class="py-1 pr-4 font-black text-white">${item.dose} г/кущ</td><td class="py-1 font-black text-white">${wStr}</td></tr>`;
                }
            });
            if (!recipeLines) recipeLines = '<tr><td colspan="3" class="py-2 text-center text-emerald-400/50">Немає обраних добрив</td></tr>';

            let venturiInfo = '';
            if (useVenturi) {
                const stockMass = totalWater > 0 && injectK > 0 ? (totalMass * stockVol) / (totalWater * injectK) : 0;
                const stockStr = stockMass >= 1000 ? (stockMass/1000).toFixed(2) + ' кг' : Math.round(stockMass) + ' г';
                venturiInfo = `<p>🧪 <strong>Маточний бак (${stockVol} л):</strong> засипати ${stockStr} добрива, розчинити, підключити Вентурі (K=${injectK}).</p>`;
            }

            protocolEl.innerHTML = `
                <table class="w-full text-xs"><thead><tr class="text-emerald-400 font-black uppercase text-[10px]"><th class="text-left py-1">Добриво</th><th class="text-left py-1">Доза/кущ</th><th class="text-left py-1">Всього</th></tr></thead><tbody>${recipeLines}</tbody></table>
                <hr class="border-emerald-800/40 my-3">
                <p>🍇 <strong>Кущів:</strong> ${bushes} | 💧 <strong>Вода:</strong> ${totalWater} л | 📊 <strong>EC:</strong> ${ecVal.toFixed(2)} mS/cm</p>
                ${venturiInfo}
            `;
        }

        // ═══ FOLIAR: Sprayer & Mix Functions ═══
        function updateProtectionWaterFromPhase() {
            const phaseSelect = document.getElementById('protection-leaf-phase');
            const overrideInput = document.getElementById('protection-water-override');
            if (phaseSelect && overrideInput) overrideInput.value = phaseSelect.value;
            runFoliarStep1();
        }

        function switchWaterMode(mode) {
            protectionWaterMode = mode;
            const btnBushes = document.getElementById('water-mode-btn-bushes');
            const btnArea = document.getElementById('water-mode-btn-area');
            const inputsBushes = document.getElementById('water-inputs-bushes');
            const inputsArea = document.getElementById('water-inputs-area');
            if (mode === 'bushes') {
                btnBushes.className = 'flex-1 py-2 rounded-lg text-[10px] font-black transition-all bg-emerald-500 text-white shadow';
                btnArea.className = 'flex-1 py-2 rounded-lg text-[10px] font-black transition-all text-emerald-300 hover:text-white';
                inputsBushes.classList.remove('hidden');
                inputsArea.classList.add('hidden');
            } else {
                btnBushes.className = 'flex-1 py-2 rounded-lg text-[10px] font-black transition-all text-emerald-300 hover:text-white';
                btnArea.className = 'flex-1 py-2 rounded-lg text-[10px] font-black transition-all bg-emerald-500 text-white shadow';
                inputsBushes.classList.add('hidden');
                inputsArea.classList.remove('hidden');
            }
            runFoliarStep1();
        }

        function runFoliarStep1() {
            const bushes = parseInt(document.getElementById('shared-bushes').value) || 0;
            if (protectionWaterMode === 'bushes') {
                const leafPhaseRate = parseFloat(document.getElementById('protection-water-override').value) || 0.7;
                foliarWaterVolume = bushes * leafPhaseRate;
                foliarAreaSotka = foliarWaterVolume / 6.0;
                document.getElementById('protection-water-explanation').innerText = `Розраховано на основі ${bushes} кущів по ${leafPhaseRate} л`;
            } else {
                foliarAreaSotka = parseFloat(document.getElementById('protection-area').value) || 1.5;
                const sprayRate = parseFloat(document.getElementById('protection-spray-rate').value) || 6.0;
                foliarWaterVolume = foliarAreaSotka * sprayRate;
                document.getElementById('protection-water-explanation').innerText = `Розраховано для ${foliarAreaSotka} соток при нормі ${sprayRate} л/сотку`;
            }
            document.getElementById('protection-water-volume').innerText = foliarWaterVolume.toFixed(1) + ' л';
            saveCalculatorsState();
        }

        function addProtectionMixerRow(name = '', dose = 3, unit = '10l') {
            const id = Date.now() + Math.random().toString(36).substr(2, 9);
            protectionMixerItems.push({ id, name, dose, unit });
            renderProtectionMixer();
            runFoliarStep2();
        }

        function deleteProtectionMixerRow(id) {
            protectionMixerItems = protectionMixerItems.filter(item => item.id != id);
            renderProtectionMixer();
            runFoliarStep2();
        }

        function updateMixerItem(id, field, value) {
            const item = protectionMixerItems.find(i => i.id == id);
            if (item) {
                item[field] = field === 'dose' ? (parseFloat(value) || 0) : value;
                runFoliarStep2();
            }
        }

        function renderProtectionMixer() {
            const container = document.getElementById('protection-mixer-rows');
            if (protectionMixerItems.length === 0) {
                container.innerHTML = `<div class="text-center py-6 text-xs text-emerald-300/50 bg-emerald-900/20 rounded-2xl border border-dashed border-emerald-850">Бакова суміш порожня. Натисніть "+ Додати препарат".</div>`;
                return;
            }
            container.innerHTML = protectionMixerItems.map(item => `
                <div class="grid grid-cols-1 md:grid-cols-12 gap-3 bg-emerald-900/30 p-3 rounded-2xl border border-emerald-850 items-center">
                    <div class="col-span-12 md:col-span-5">
                        <label class="block md:hidden text-[9px] font-black uppercase text-emerald-400 mb-1">Назва препарату</label>
                        <input type="text" value="${item.name}" placeholder="напр. Хорус / Танос" data-action="dlg_mixerName" data-action-on="input" data-id="${item.id}" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-xs font-bold text-white focus:bg-white/10 focus:border-emerald-400 transition-all">
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <label class="block md:hidden text-[9px] font-black uppercase text-emerald-400 mb-1">Доза</label>
                        <input type="number" value="${item.dose}" min="0.1" step="0.1" data-action="dlg_mixerDose" data-action-on="input" data-id="${item.id}" class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-xs font-bold text-white text-center focus:bg-white/10 focus:border-emerald-400 transition-all">
                    </div>
                    <div class="col-span-6 md:col-span-3">
                        <label class="block md:hidden text-[9px] font-black uppercase text-emerald-400 mb-1">Тип дозування</label>
                        <select data-action="dlg_mixerUnit" data-action-on="change" data-id="${item.id}" class="w-full px-3 py-2.5 rounded-xl bg-emerald-900 border border-emerald-700 outline-none font-bold text-xs text-white cursor-pointer hover:bg-emerald-800 transition-all">
                            <option value="10l" ${item.unit === '10l' ? 'selected' : ''}>г (мл) на 10 л води</option>
                            <option value="sotka" ${item.unit === 'sotka' ? 'selected' : ''}>г (мл) на 1 сотку</option>
                        </select>
                    </div>
                    <div class="col-span-12 md:col-span-1 text-right md:text-center mt-2 md:mt-0">
                        <button data-action="deleteProtectionMixerRow" data-action-param="${item.id}" class="p-2.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-900/50 hover:bg-rose-900/40 transition-all text-xs font-bold w-full md:w-auto">✕</button>
                    </div>
                </div>
            `).join('');
        }

        function runFoliarStep2() {
            const waterVolume = foliarWaterVolume;
            const areaSotka = foliarAreaSotka;
            
            const recipeList = document.getElementById('protection-final-recipe-list');
            if (protectionMixerItems.length === 0) {
                if (recipeList) recipeList.innerHTML = `<li class="py-2 text-center text-emerald-400/70">Суміш порожня. Додайте препарати вище.</li>`;
            } else {
                if (recipeList) recipeList.innerHTML = protectionMixerItems.map(item => {
                    let computedWeight = 0;
                    let calcDetail = '';
                    if (item.unit === '10l') {
                        computedWeight = (waterVolume / 10.0) * item.dose;
                        calcDetail = `(${waterVolume.toFixed(1)} л / 10 л × ${item.dose} г/мл)`;
                    } else {
                        computedWeight = areaSotka * item.dose;
                        calcDetail = `(${areaSotka.toFixed(2)} сотки × ${item.dose} г/мл)`;
                    }
                    const dosePerL = waterVolume > 0 ? (computedWeight / waterVolume) : 0;
                    const dosePerLStr = dosePerL.toFixed(dosePerL < 0.01 ? 4 : 3).replace(/\.?0+$/, '');
                    const itemNameHtml = item.name ? `<strong>${item.name}</strong>` : `<span class="italic text-white/50">Без назви</span>`;
                    return `
                        <li class="py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] text-emerald-400">⚫</span>
                                <div>${itemNameHtml} <span class="text-[10px] text-emerald-300/60 ml-2">${calcDetail}</span></div>
                            </div>
                            <div class="flex flex-col items-end self-end sm:self-auto mt-1 sm:mt-0">
                                <span class="bg-emerald-800 text-white font-black px-3.5 py-1 rounded-xl text-xs border border-emerald-700/60">${computedWeight.toFixed(1)} г (мл)</span>
                                <span class="text-[10px] text-emerald-300/70 mt-0.5">${dosePerLStr} г(мл) на 1 л води</span>
                            </div>
                        </li>
                    `;
                }).join('');
            }

            // Update acid calculation
            const acidMass = (waterVolume / 10.0) * 1.0;
            const acidEl = document.getElementById('protection-acid-result');
            if (acidEl) acidEl.innerText = acidMass.toFixed(1) + ' г';

            saveCalculatorsState();
        }

        // ═══ FOLIAR STEP 3: pH & Protocol ═══
        function renderFoliarProtocol() {
            const waterVolume = foliarWaterVolume;
            const acidMass = (waterVolume / 10.0) * 1.0;
            const protocolEl = document.getElementById('foliar-final-protocol');
            if (!protocolEl) return;

            let recipeLines = '';
            protectionMixerItems.forEach(item => {
                if (item.name) {
                    let weight = 0;
                    if (item.unit === '10l') weight = (waterVolume / 10.0) * item.dose;
                    else weight = foliarAreaSotka * item.dose;
                    recipeLines += `<tr><td class="py-1 pr-4">${item.name}</td><td class="py-1 font-black text-white">${weight.toFixed(1)} г (мл)</td></tr>`;
                }
            });
            if (!recipeLines) recipeLines = '<tr><td colspan="2" class="py-2 text-center text-emerald-400/50">Немає препаратів у суміші</td></tr>';

            protocolEl.innerHTML = `
                <div class="bg-emerald-900/30 p-4 rounded-2xl border border-emerald-800/40 space-y-3">
                    <p class="text-xs font-black text-white uppercase">📋 Порядок приготування:</p>
                    <ol class="list-decimal list-inside space-y-1.5 text-xs text-emerald-200/90">
                        <li>Наберіть <strong class="text-white">${waterVolume.toFixed(1)} л</strong> води в обприскувач</li>
                        <li>Додайте <strong class="text-white">${acidMass.toFixed(1)} г</strong> лимонної кислоти, перемішайте (pH → 5.5)</li>
                        <li>Послідовно додайте препарати згідно рецепту нижче</li>
                        <li>Ретельно перемішайте та починайте обробку</li>
                    </ol>
                </div>
                <table class="w-full text-xs mt-3"><thead><tr class="text-emerald-400 font-black uppercase text-[10px]"><th class="text-left py-1">Препарат</th><th class="text-left py-1">Доза на ${waterVolume.toFixed(1)} л</th></tr></thead><tbody>${recipeLines}</tbody></table>
                <hr class="border-emerald-800/40 my-2">
                <p class="text-[10px] text-emerald-400/60">💧 Загальний об'єм: ${waterVolume.toFixed(1)} л | 🍋 Лимонна кислота: ${acidMass.toFixed(1)} г | 🎯 Цільове pH: 5.5</p>
            `;
        }

        // ═══ STATE MANAGEMENT ═══
        function runAllCalculations() {
            runNPKCalculations();
            runFoliarStep1();
            runFoliarStep2();
            runFertigationCalculations();
        }

        function saveCalculatorsState() {
            const state = {
                activeScenario: activeScenario,
                rootStep: rootStep,
                foliarStep: foliarStep,
                npkPhasePreset: document.getElementById('npk-phase-preset').value,
                npkTargetN: document.getElementById('npk-target-n').value,
                npkTargetP: document.getElementById('npk-target-p').value,
                npkTargetK: document.getElementById('npk-target-k').value,
                protectionWaterMode: protectionWaterMode,
                protectionLeafPhase: document.getElementById('protection-leaf-phase').value,
                protectionWaterOverride: document.getElementById('protection-water-override').value,
                protectionArea: document.getElementById('protection-area').value,
                protectionSprayRate: document.getElementById('protection-spray-rate').value,
                protectionMixerItems: protectionMixerItems,
                fertDrippers: document.getElementById('fert-drippers').value,
                fertDripperFlow: document.getElementById('fert-dripper-flow').value,
                fertWaterTarget: document.getElementById('fert-water-target').value,
                fertDryDose: document.getElementById('fert-dry-dose').value,
                fertStockVol: document.getElementById('fert-stock-vol').value,
                fertInjectRatio: document.getElementById('fert-inject-ratio').value,
                fertInjectK: document.getElementById('fert-inject-k').value,
                fertUseVenturi: document.getElementById('fert-use-venturi').checked
            };
            localStorage.setItem('viticulture-calculators-state', JSON.stringify(state));
        }

        function loadCalculatorsState() {
            const cachedBushes = localStorage.getItem('viticulture-bushes-count');
            if (cachedBushes) document.getElementById('shared-bushes').value = cachedBushes;
            
            initDryFertilizers();
            
            const cachedStateStr = localStorage.getItem('viticulture-calculators-state');
            if (!cachedStateStr) {
                protectionMixerItems = [
                    { id: '1', name: 'Хорус', dose: 3, unit: '10l' },
                    { id: '2', name: 'Топаз', dose: 4, unit: '10l' }
                ];
                renderProtectionMixer();
                runAllCalculations();
                return;
            }
            
            try {
                const state = JSON.parse(cachedStateStr);
                
                if (state.npkPhasePreset) document.getElementById('npk-phase-preset').value = state.npkPhasePreset;
                if (state.npkTargetN) document.getElementById('npk-target-n').value = state.npkTargetN;
                if (state.npkTargetP) document.getElementById('npk-target-p').value = state.npkTargetP;
                if (state.npkTargetK) document.getElementById('npk-target-k').value = state.npkTargetK;
                
                if (state.protectionWaterMode) {
                    protectionWaterMode = state.protectionWaterMode;
                    switchWaterMode(protectionWaterMode);
                }
                if (state.protectionLeafPhase) document.getElementById('protection-leaf-phase').value = state.protectionLeafPhase;
                if (state.protectionWaterOverride) document.getElementById('protection-water-override').value = state.protectionWaterOverride;
                if (state.protectionArea) document.getElementById('protection-area').value = state.protectionArea;
                if (state.protectionSprayRate) document.getElementById('protection-spray-rate').value = state.protectionSprayRate;
                if (state.protectionMixerItems) {
                    protectionMixerItems = state.protectionMixerItems;
                } else {
                    protectionMixerItems = [];
                }
                renderProtectionMixer();
                
                if (state.fertDrippers) document.getElementById('fert-drippers').value = state.fertDrippers;
                if (state.fertDripperFlow) document.getElementById('fert-dripper-flow').value = state.fertDripperFlow;
                if (state.fertWaterTarget) document.getElementById('fert-water-target').value = state.fertWaterTarget;
                if (state.fertDryDose) document.getElementById('fert-dry-dose').value = state.fertDryDose;
                if (state.fertStockVol) document.getElementById('fert-stock-vol').value = state.fertStockVol;
                if (state.fertInjectRatio) document.getElementById('fert-inject-ratio').value = state.fertInjectRatio;
                if (state.fertInjectK) document.getElementById('fert-inject-k').value = state.fertInjectK;
                if (state.hasOwnProperty('fertUseVenturi')) {
                    document.getElementById('fert-use-venturi').checked = state.fertUseVenturi;
                } else {
                    document.getElementById('fert-use-venturi').checked = true;
                }
                toggleVenturiMode();
                applyFertInjectPreset();
                
                // Restore scenario and wizard steps
                const scenario = state.activeScenario || localStorage.getItem('activeScenario') || 'root-feeding';
                switchScenario(scenario);
                
                if (state.rootStep && state.rootStep > 1) {
                    goToStep('root', state.rootStep);
                }
                if (state.foliarStep && state.foliarStep > 1) {
                    goToStep('foliar', state.foliarStep);
                }
                
            } catch (e) {
                console.error("Error loading calculator state:", e);
                protectionMixerItems = [
                    { id: '1', name: 'Хорус', dose: 3, unit: '10l' },
                    { id: '2', name: 'Топаз', dose: 4, unit: '10l' }
                ];
                renderProtectionMixer();
            }
            
            runAllCalculations();
        }


                // --- GEMINI AI ASSISTANT & VARIETY ANALYZER LOGIC ---
        let aiMode = 'analyzer';
        let aiCandidates = [];
        // Поточний сорт із перевірки САТ — для кнопки «Зберегти в кандидати» (B2).
        let satCheckCandidate = null;
        let aiChatHistory = [];
        let selectedChatAttachment = null;

        function checkGeminiStatus() {
            const key = localStorage.getItem('viticulture-gemini-key');
            const icon = document.getElementById('ai-status-icon');
            const title = document.getElementById('ai-status-title');
            const desc = document.getElementById('ai-status-desc');
            const inputContainer = document.getElementById('ai-key-input-container');
            const activeContainer = document.getElementById('ai-key-active-container');
            
            if (key && key.trim().length > 0) {
                if (icon) icon.innerText = '🟢';
                if (title) title.innerText = 'AI Асистент активний (Gemini 1.5 Flash)';
                if (desc) desc.innerText = 'Інтелектуальний аналіз та чат-консультації активовані';
                if (inputContainer) inputContainer.classList.add('hidden');
                if (activeContainer) activeContainer.classList.remove('hidden');
            } else {
                if (icon) icon.innerText = '🔴';
                if (title) title.innerText = 'AI Асистент не підключений';
                if (desc) desc.innerText = 'Для активації інтелектуальних порад потрібен Gemini API ключ';
                if (inputContainer) inputContainer.classList.remove('hidden');
                if (activeContainer) activeContainer.classList.add('hidden');
            }
        }

        function saveGeminiKey() {
            const input = document.getElementById('gemini-key-input');
            const rawKey = input ? input.value.trim() : '';
            if (!rawKey) {
                alert('Будь ласка, введіть API ключ.');
                return;
            }
            // Clean up surrounding quotes if any
            const cleanKey = rawKey.replace(/^["']|["']$/g, '').trim();
            if (!cleanKey.startsWith('AIzaSy') && !cleanKey.startsWith('AQ.')) {
                if (!confirm('Попередження: зазвичай API ключі Gemini починаються з літер "AIzaSy" або "AQ.". Ваш ключ виглядає інакше. Зберегти цей ключ попри попередження?')) {
                    return;
                }
            }
            localStorage.setItem('viticulture-gemini-key', cleanKey);
            if (input) input.value = '';
            checkGeminiStatus();
            alert('API Ключ успішно збережено!');
        }

        function deleteGeminiKey() {
            if (confirm('Ви впевнені, що хочете видалити API ключ? AI асистент перестане працювати.')) {
                localStorage.removeItem('viticulture-gemini-key');
                checkGeminiStatus();
            }
        }

        function copyAutoSetupLink() {
            const key = localStorage.getItem('viticulture-gemini-key');
            if (!key) return;
            // Use query param (?gemini_key=) — messaging apps (iMessage, WhatsApp, Telegram, Viber)
            // silently strip URL fragments (#...) when sharing links, which broke key delivery.
            // The key is removed from the URL immediately via replaceState on page load,
            // so it never lingers in the address bar or browser history.
            const link = window.location.origin + window.location.pathname + '?gemini_key=' + encodeURIComponent(key);
            navigator.clipboard.writeText(link).then(() => {
                alert('Посилання автоналаштування скопійовано! Надішліть його батькам, щоб вони автоматично підключили AI.');
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                alert('Не вдалося скопіювати автоматично. Ваше посилання:\n' + link);
            });
        }

        function switchAiMode(mode) {
            aiMode = mode;
            const btnAnalyzer = document.getElementById('ai-mode-btn-analyzer');
            const btnChat = document.getElementById('ai-mode-btn-chat');
            const panelAnalyzer = document.getElementById('ai-panel-analyzer');
            const panelChat = document.getElementById('ai-panel-chat');
            
            if (mode === 'analyzer') {
                if (btnAnalyzer) btnAnalyzer.className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all bg-emerald-500 text-white shadow-md';
                if (btnChat) btnChat.className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all text-stone-500 hover:text-stone-850';
                if (panelAnalyzer) panelAnalyzer.classList.remove('hidden');
                if (panelChat) panelChat.classList.add('hidden');
            } else {
                if (btnAnalyzer) btnAnalyzer.className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all text-stone-500 hover:text-stone-850';
                if (btnChat) btnChat.className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all bg-emerald-500 text-white shadow-md';
                if (panelAnalyzer) panelAnalyzer.classList.add('hidden');
                if (panelChat) panelChat.classList.remove('hidden');
                setTimeout(() => {
                    const transcript = document.getElementById('ai-chat-transcript');
                    if (transcript) transcript.scrollTop = transcript.scrollHeight;
                }, 50);
            }
        }

        function openQuotaHelpModal() {
            const modal = document.getElementById('modal-gemini-quota-help');
            if (modal) modal.classList.remove('hidden');
        }

        function closeQuotaHelpModal() {
            const modal = document.getElementById('modal-gemini-quota-help');
            if (modal) modal.classList.add('hidden');
        }

        // Strips markdown code fences from AI responses and parses JSON.
        // Needed as fallback when models ignore responseMimeType (e.g. older gemini-pro).
        function cleanAIJson(text) {
            let s = (text || '').trim();
            if (s.startsWith('```')) {
                s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
            }
            return JSON.parse(s);
        }

        // Cache for discovered model URL to avoid re-listing models every time.
        // Stores { url, keyPrefix } so cache is invalidated when key changes.
        let _cachedGeminiModel = null;

        async function discoverGeminiModel(key) {
            if (_cachedGeminiModel && _cachedGeminiModel.keyPrefix === key.slice(0, 12)) return _cachedGeminiModel.url;
            
            console.log('[discoverGeminiModel] Шукаю доступні моделі...');
            const listUrls = [
                `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
                `https://generativelanguage.googleapis.com/v1/models?key=${key}`
            ];
            
            // Preferred models in priority order — newest stable first.
            // Uses prefix matching so "gemini-2.5-flash" catches "gemini-2.5-flash-preview-05-20" etc.
            const preferredModels = [
                'gemini-2.5-flash',
                'gemini-2.5-pro',
                'gemini-2.0-flash-001',
                'gemini-2.0-flash-lite-001',
                'gemini-2.0-flash',
                'gemini-1.5-flash-002',
                'gemini-1.5-pro-002',
                'gemini-1.5-flash',
                'gemini-1.5-pro'
            ];
            
            for (const listUrl of listUrls) {
                try {
                    const apiVersion = listUrl.includes('/v1beta/') ? 'v1beta' : 'v1';
                    console.log(`[discoverGeminiModel] Спроба ${apiVersion}...`);
                    const resp = await fetch(listUrl);
                    if (!resp.ok) {
                        console.warn(`[discoverGeminiModel] ${apiVersion} => HTTP ${resp.status}`);
                        continue;
                    }
                    const data = await resp.json();
                    const models = data.models || [];
                    console.log(`[discoverGeminiModel] Знайдено ${models.length} моделей у ${apiVersion}`);
                    
                    // Log all available model names
                    const modelNames = models.map(m => m.name).join(', ');
                    console.log(`[discoverGeminiModel] Доступні: ${modelNames}`);
                    
                    // Find the best model that supports generateContent
                    for (const preferred of preferredModels) {
                        const found = models.find(m => {
                            const name = m.name || '';
                            const shortName = name.replace('models/', '');
                            const supportsGenerate = !m.supportedGenerationMethods || 
                                m.supportedGenerationMethods.includes('generateContent');
                            return (shortName === preferred || shortName.startsWith(preferred)) && supportsGenerate;
                        });
                        if (found) {
                            const modelId = (found.name || '').replace('models/', '');
                            const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent?key=${key}`;
                            console.log(`[discoverGeminiModel] ✅ Обрано модель: ${modelId} (${apiVersion})`);
                            _cachedGeminiModel = { url, keyPrefix: key.slice(0, 12) };
                            return url;
                        }
                    }

                    // If no preferred model found, pick ANY model that supports generateContent
                    const anyModel = models.find(m => {
                        return !m.supportedGenerationMethods ||
                            m.supportedGenerationMethods.includes('generateContent');
                    });
                    if (anyModel) {
                        const modelId = (anyModel.name || '').replace('models/', '');
                        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelId}:generateContent?key=${key}`;
                        console.log(`[discoverGeminiModel] ⚠️ Запасна модель: ${modelId} (${apiVersion})`);
                        _cachedGeminiModel = { url, keyPrefix: key.slice(0, 12) };
                        return url;
                    }
                } catch (e) {
                    console.warn(`[discoverGeminiModel] Помилка:`, e.message);
                }
            }
            return null;
        }

        // Запасні моделі Gemini — використовуються, лише коли авто-визначення (discoverGeminiModel)
        // не спрацювало. ЄДИНЕ місце для оновлення ID моделей, коли вони застаріють (B6).
        const GEMINI_FALLBACK_MODELS = [
            { version: 'v1beta', model: 'gemini-2.5-flash' },
            { version: 'v1beta', model: 'gemini-2.0-flash-001' },
            { version: 'v1', model: 'gemini-1.5-flash-002' }
        ];
        function geminiFallbackUrls(key) {
            return GEMINI_FALLBACK_MODELS.map(m =>
                `https://generativelanguage.googleapis.com/${m.version}/models/${m.model}:generateContent?key=${key}`);
        }

        async function fetchGeminiAPI(prompt, systemInstruction = '', jsonMode = false, attachment = null, contentsOverride = null) {
            const rawKey = localStorage.getItem('viticulture-gemini-key');
            if (!rawKey) {
                throw new Error('API ключ не знайдено. Будь ласка, збережіть ключ у верхній панелі.');
            }
            // Trim, clean surrounding quotes, and encode the key
            const key = encodeURIComponent(rawKey.trim().replace(/^["']|["']$/g, ''));
            
            // Step 1: Discover the best available model
            const discoveredUrl = await discoverGeminiModel(key);
            
            // Build URLs to try: discovered model first, then fallbacks
            const urlsToTry = [];
            if (discoveredUrl) {
                urlsToTry.push(discoveredUrl);
            }
            // Запасні моделі (єдине джерело — GEMINI_FALLBACK_MODELS), коли discovery не спрацював (B6).
            urlsToTry.push(...geminiFallbackUrls(key));
            // Remove duplicates
            const uniqueUrls = [...new Set(urlsToTry)];
            
            let contents;
            if (contentsOverride) {
                contents = contentsOverride;
            } else {
                const parts = [{ text: prompt }];
                if (attachment) {
                    parts.push({
                        inlineData: {
                            mimeType: attachment.mimeType,
                            data: attachment.data
                        }
                    });
                }
                contents = [{ parts }];
            }

            const requestBody = { contents };

            if (systemInstruction) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemInstruction }]
                };
            }

            if (jsonMode) {
                requestBody.generationConfig = { responseMimeType: 'application/json' };
            }

            let lastError = null;
            let allErrors = [];
            for (let i = 0; i < uniqueUrls.length; i++) {
                const url = uniqueUrls[i];
                const modelName = url.match(/models\/([^:]+)/)?.[1] || 'unknown';
                
                // Allow up to 2 retries for rate limit (429) errors
                for (let retry = 0; retry <= 2; retry++) {
                    if (retry > 0) {
                        console.log(`[fetchGeminiAPI] Повтор ${retry}/2 для ${modelName}...`);
                    } else {
                        console.log(`[fetchGeminiAPI] Спроба ${i+1}/${uniqueUrls.length}: ${modelName}`);
                    }
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 45000);
                        
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(requestBody),
                            signal: controller.signal
                        });
                        clearTimeout(timeoutId);
                        
                        console.log(`[fetchGeminiAPI] ${modelName} => HTTP ${response.status}`);
                        
                        if (response.ok) {
                            const data = await response.json();
                            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (textResponse) {
                                console.log(`[fetchGeminiAPI] ✅ Успіх від ${modelName}, відповідь ${textResponse.length} символів`);
                                return textResponse;
                            } else {
                                const reason = data.candidates?.[0]?.finishReason || 'невідомо';
                                console.warn(`[fetchGeminiAPI] ${modelName}: HTTP 200, але текст відсутній. finishReason: ${reason}`, JSON.stringify(data).substring(0, 500));
                                lastError = `${modelName}: відповідь без тексту (${reason})`;
                                allErrors.push(lastError);
                                break; // Don't retry on 200 with empty response
                            }
                        } else if (response.status === 429 && retry < 2) {
                            // Rate limited — extract retry delay and wait
                            const errData = await response.json().catch(() => ({}));
                            const errMsg = errData.error?.message || '';
                            // Try to extract delay from "Please retry in 17.979611419s"
                            const delayMatch = errMsg.match(/retry in ([\d.]+)s/i);
                            let waitSec = delayMatch ? Math.ceil(parseFloat(delayMatch[1])) + 2 : 20;
                            waitSec = Math.min(waitSec, 60); // Cap at 60s
                            
                            console.log(`[fetchGeminiAPI] 429 Rate Limited. Чекаю ${waitSec} сек...`);
                            showToast(`⏳ Квота перевищена. Автоповтор через ${waitSec} сек...`, 'warning');
                            
                            await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
                            continue; // Retry the same URL
                        } else {
                            const errData = await response.json().catch(() => ({}));
                            lastError = `${modelName}: ${errData.error?.message || response.statusText}`;
                            allErrors.push(lastError);
                            console.warn(`[fetchGeminiAPI] ${modelName}: HTTP ${response.status} — ${lastError}`);
                            
                            if (response.status === 403 || response.status === 401) {
                                _cachedGeminiModel = null;
                            }
                            break; // Don't retry on non-429 errors
                        }
                    } catch (e) {
                        if (e.name === 'AbortError') {
                            lastError = `${modelName}: таймаут 45 сек`;
                        } else {
                            lastError = `${modelName}: ${e.message}`;
                        }
                        allErrors.push(lastError);
                        console.warn(`[fetchGeminiAPI] ${lastError}`);
                        break; // Don't retry on network errors
                    }
                }
            }
            
            // Clear cache on total failure
            _cachedGeminiModel = null;
            const errorDetails = allErrors.length > 0 ? allErrors.join('; ') : 'Невідома помилка';
            throw new Error(`API Error: ${errorDetails}. Спробовано ${uniqueUrls.length} моделей.`);
        }

        async function analyzeAICandidate() {
            const input = document.getElementById('ai-analyzer-input');
            const name = input ? input.value.trim() : '';
            if (!name) {
                alert('Будь ласка, введіть назву сорту.');
                return;
            }
            
            const spinner = document.getElementById('ai-analyzer-spinner');
            const resultBox = document.getElementById('ai-analyzer-result');
            
            if (spinner) spinner.classList.remove('hidden');
            if (resultBox) resultBox.innerHTML = `
                <div class="text-center py-12">
                    <div class="animate-spin text-3xl inline-block mb-3">⏳</div>
                    <p class="text-xs font-black uppercase tracking-widest text-stone-400">Шукаємо інформацію про сорт "${name}"...</p>
                </div>
            `;
            
            const systemInstruction = "Ти — досвідчений український ампелограф (експерт із сортів винограду). Повертай лише валідний JSON за схемою.";
            const prompt = `Знайди детальну агрономічну інформацію про сорт винограду "${name}".
Поверни відповідь виключно у форматі JSON із такими полями (мовою відповіді має бути українська):
{
  "name": "Назва сорту українською",
  "rip": "кількість днів дозрівання (наприклад: '110-115 дн.')",
  "col": "колір ягоди: 'W' (білий), 'R' (червоний/рожевий), 'B' (чорний/синій)",
  "taste": "опис смаку (наприклад: 'Мускат з тонами шавлії')",
  "bunch": "середня вага грона (наприклад: '600-1000 г')",
  "seed": "наявність кісточок: 'З кіст.' або 'Безкіст.'",
  "care": "короткі особливості догляду та вразливості сорту (до 150 символів)",
  "sat_required": "необхідна сума активних температур (число, наприклад: 2100)"
}
Якщо такий сорт винограду не існує взагалі, поверни JSON з одним єдиним полем:
{
  "error": "Сорт не знайдено"
}`;

            try {
                const responseText = await fetchGeminiAPI(prompt, systemInstruction, true);
                const data = cleanAIJson(responseText);

                if (data.error) {
                    resultBox.innerHTML = `
                        <div class="text-center text-rose-500 py-12">
                            <span class="text-3xl block mb-2">🤷‍♂️</span>
                            <strong class="text-sm font-black uppercase tracking-wider block">Сорт не знайдено</strong>
                            <p class="text-xs text-stone-500 mt-1">Штучний інтелект не знайшов перевірених даних про сорт винограду "${name}".</p>
                        </div>
                    `;
                    return;
                }
                
                // Compute local SAT suitability
                const localSatInput = (totalSAT > 100 ? totalSAT : 2700);
                const catInfo = getCatInfoByRip(data.rip);
                
                // Override min/max CAT using sat_required from Gemini if provided
                if (data.sat_required) {
                    const satVal = parseInt(data.sat_required);
                    catInfo.minCat = satVal - 50;
                    catInfo.maxCat = satVal + 50;
                    catInfo.catRange = `${satVal}°C`;
                }
                
                const satDiff = localSatInput - catInfo.maxCat;
                const satMinDiff = localSatInput - catInfo.minCat;
                
                let statusClass = '';
                let statusText = '';
                let icon = '';
                
                if (localSatInput >= catInfo.maxCat) {
                    statusClass = 'bg-emerald-500 text-white';
                    statusText = 'Сприятливий клімат';
                    icon = '🟢';
                } else if (localSatInput >= catInfo.minCat) {
                    statusClass = 'bg-amber-500 text-white';
                    statusText = 'Гранична зона визрівання';
                    icon = '🟡';
                } else {
                    statusClass = 'bg-rose-500 text-white';
                    statusText = 'Ризик недозрівання';
                    icon = '🔴';
                }
                
                // Render result card with dynamic saving button.
                // Зберігаємо об'єкт у змінній замість вбудовування JSON у onclick — інакше
                // апострофи/лапки в полях ламають обробник (B2).
                satCheckCandidate = data;
                resultBox.innerHTML = `
                    <div class="space-y-5 text-left fade-in">
                        <div class="flex items-center justify-between gap-4 flex-wrap border-b border-stone-200/60 pb-3">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">${icon}</span>
                                <div>
                                    <h4 class="font-black text-emerald-950 text-sm">${data.name}</h4>
                                    <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">${catInfo.group} • САТ: ${catInfo.catRange}</p>
                                </div>
                            </div>
                            <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                                <span class="block opacity-50 font-black text-[9px] uppercase mb-0.5">📅 Термін</span>
                                <span class="font-bold text-stone-850">${data.rip}</span>
                            </div>
                            <div class="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                                <span class="block opacity-50 font-black text-[9px] uppercase mb-0.5">⚖️ Гроно</span>
                                <span class="font-bold text-stone-850">${data.bunch}</span>
                            </div>
                            <div class="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                                <span class="block opacity-50 font-black text-[9px] uppercase mb-0.5">👅 Смаковий профіль</span>
                                <span class="font-bold text-stone-850 truncate block">${data.taste}</span>
                            </div>
                            <div class="bg-white p-3 rounded-xl border border-stone-100 shadow-sm">
                                <span class="block opacity-50 font-black text-[9px] uppercase mb-0.5">🧬 Кісточки</span>
                                <span class="font-bold text-stone-850">${data.seed}</span>
                            </div>
                        </div>
                        
                        <div class="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-xs">
                            <span class="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-0.5">📝 Особливості догляду:</span>
                            <p class="text-stone-700 italic font-medium">${data.care}</p>
                        </div>
                        
                        <button data-action="dlg_saveCandidate" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm">
                            <span>＋</span> Зберегти в кандидати на посадку
                        </button>
                    </div>
                `;
            } catch (err) {
                resultBox.innerHTML = `
                    <div class="text-center text-rose-500 py-12 px-4">
                        <span class="text-3xl block mb-2">⚠️</span>
                        <strong class="text-sm font-black uppercase tracking-wider block">Помилка аналізу</strong>
                        <p class="text-xs text-stone-600 mt-1 leading-relaxed">${err.message}</p>
                    </div>
                `;
                if (err.message.includes('limit: 0') || err.message.toLowerCase().includes('quota') || err.message.includes('429')) {
                    openQuotaHelpModal();
                }
            } finally {
                if (spinner) spinner.classList.add('hidden');
            }
        }

        function saveAICandidate(candidate) {
            if (aiCandidates.some(c => c.name.toLowerCase() === candidate.name.toLowerCase())) {
                alert('Сорт "' + candidate.name + '" вже додано до списку кандидатів.');
                return;
            }
            
            aiCandidates.push(candidate);
            localStorage.setItem('viticulture-ai-candidates', JSON.stringify(aiCandidates));
            renderAICandidates();
            alert('Сорт "' + candidate.name + '" збережено у список кандидатів!');
        }

        function deleteAICandidate(index) {
            if (confirm('Видалити сорт "' + aiCandidates[index].name + '" зі списку кандидатів?')) {
                aiCandidates.splice(index, 1);
                localStorage.setItem('viticulture-ai-candidates', JSON.stringify(aiCandidates));
                renderAICandidates();
            }
        }

        function renderAICandidates() {
            const container = document.getElementById('ai-candidates-list');
            const countBadge = document.getElementById('ai-candidates-count');
            
            if (countBadge) countBadge.innerText = aiCandidates.length;
            
            if (!container) return;
            
            if (aiCandidates.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-stone-300 py-16">
                        <span class="text-5xl block mb-3 opacity-30">📋</span>
                        <p class="font-black text-xs uppercase tracking-widest opacity-40">Список кандидатів порожній</p>
                        <p class="text-[10px] opacity-70 mt-1">Знайдіть новий сорт зліва та натисніть "Зберегти в кандидати".</p>
                    </div>
                `;
                return;
            }
            
            const localSatInput = (totalSAT > 100 ? totalSAT : 2700);
            
            container.innerHTML = aiCandidates.map((c, index) => {
                const catInfo = getCatInfoByRip(c.rip);
                if (c.sat_required) {
                    const satVal = parseInt(c.sat_required);
                    catInfo.minCat = satVal - 50;
                    catInfo.maxCat = satVal + 50;
                }
                
                let badgeClass = '';
                let badgeText = '';
                
                if (localSatInput >= catInfo.maxCat) {
                    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                    badgeText = 'Визріє';
                } else if (localSatInput >= catInfo.minCat) {
                    badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                    badgeText = 'Гранично';
                } else {
                    badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                    badgeText = 'Не визріє';
                }
                
                const colHex = c.col === 'W' ? '#f5f5f4' : (c.col === 'R' ? '#f43f5e' : '#1e1b4b');
                
                return `
                    <div class="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-sm hover:border-emerald-300 transition-all">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <h5 class="text-xs font-black text-stone-850 flex items-center">
                                    ${grapeSVG(colHex)} ${c.name}
                                </h5>
                                <p class="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">${catInfo.group} • САТ ${c.sat_required ? c.sat_required + '°C' : catInfo.catRange}</p>
                            </div>
                            <button data-action="deleteAICandidate" data-action-param="${index}" class="text-stone-300 hover:text-rose-500 font-black transition-all text-xs">✕</button>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-1 text-[10px] font-bold text-stone-700 bg-white p-2 rounded-xl border border-stone-100">
                            <div>
                                <span class="block text-[8px] uppercase tracking-wider text-stone-400">📅 Термін</span>
                                ${c.rip}
                            </div>
                            <div>
                                <span class="block text-[8px] uppercase tracking-wider text-stone-400">⚖️ Гроно</span>
                                ${c.bunch}
                            </div>
                            <div>
                                <span class="block text-[8px] uppercase tracking-wider text-stone-400">🧬 Кіст.</span>
                                ${c.seed}
                            </div>
                        </div>

                        <div class="flex items-center justify-between text-[10px] gap-2 pt-1">
                            <span class="px-2 py-0.5 border text-[9px] font-black uppercase rounded-md ${badgeClass}">${badgeText}</span>
                            <span class="text-stone-400 italic font-medium truncate max-w-[70%]">${c.taste}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function handleChatFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('Можна надсилати лише зображення.', 'error');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showToast('Розмір файлу перевищує 10 МБ.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                const base64Data = dataUrl.split(',')[1];
                
                selectedChatAttachment = {
                    mimeType: file.type,
                    data: base64Data,
                    name: file.name,
                    sizeText: formatBytes(file.size),
                    url: dataUrl
                };

                const imgPreview = document.getElementById('ai-chat-preview-img');
                const filenamePreview = document.getElementById('ai-chat-preview-filename');
                const sizePreview = document.getElementById('ai-chat-preview-size');
                const containerPreview = document.getElementById('ai-chat-image-preview');

                if (imgPreview) imgPreview.src = dataUrl;
                if (filenamePreview) filenamePreview.innerText = file.name;
                if (sizePreview) sizePreview.innerText = selectedChatAttachment.sizeText;
                if (containerPreview) containerPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function clearChatAttachment() {
            selectedChatAttachment = null;
            const fileInput = document.getElementById('ai-chat-file-input');
            const containerPreview = document.getElementById('ai-chat-image-preview');
            if (fileInput) fileInput.value = '';
            if (containerPreview) containerPreview.classList.add('hidden');
        }

        async function sendAgroChatMessage() {
            const input = document.getElementById('ai-chat-input');
            const message = input ? input.value.trim() : '';
            if (!message && !selectedChatAttachment) return;
            
            const transcript = document.getElementById('ai-chat-transcript');
            const spinner = document.getElementById('ai-chat-spinner');
            
            let userMsgHtml = `<div class="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-sm text-xs font-semibold leading-relaxed">`;
            if (selectedChatAttachment) {
                userMsgHtml += `<img src="${selectedChatAttachment.url}" class="max-w-full max-h-48 rounded-lg mb-2 border border-emerald-500/30 object-contain">`;
            }
            if (message) {
                userMsgHtml += `<div>${message}</div>`;
            }
            userMsgHtml += `</div>`;

            if (transcript) {
                transcript.innerHTML += `
                    <div class="flex gap-3 max-w-[85%] ml-auto justify-end">
                        ${userMsgHtml}
                        <div class="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm flex-shrink-0">🍇</div>
                    </div>
                `;
                transcript.scrollTop = transcript.scrollHeight;
            }

            if (input) input.value = '';
            
            if (spinner) spinner.classList.remove('hidden');
            
            // Build text context for history
            let historyText = message;
            if (selectedChatAttachment) {
                historyText = `[Зображення: ${selectedChatAttachment.name}]` + (message ? ` ${message}` : '');
            }
            
            aiChatHistory.push({ role: 'user', content: historyText });
            if (aiChatHistory.length > 15) aiChatHistory.shift();
            localStorage.setItem('viticulture-ai-chat-history', JSON.stringify(aiChatHistory));
            
            const systemInstruction = "Ти — досвідчений український агроном-консультант, експерт з виноградарства. Відповідай чітко, коротко, структуровано, українською мовою. Твої поради мають бути практичними, адаптованими під клімат України, з акцентом на безпечне застосування препаратів (ЗЗР) та добрив. Пиши структурованими списками.";

            // Build native Gemini multi-turn contents array from history.
            // The last entry is the current user message (already pushed above).
            const multiTurnContents = aiChatHistory.map((turn, idx) => {
                const isLastUser = idx === aiChatHistory.length - 1 && turn.role === 'user';
                const parts = [{ text: turn.content }];
                // Attach image to the last user message if present
                if (isLastUser && selectedChatAttachment) {
                    parts.push({ inlineData: { mimeType: selectedChatAttachment.mimeType, data: selectedChatAttachment.data } });
                }
                return { role: turn.role === 'model' ? 'model' : 'user', parts };
            });

            clearChatAttachment();

            try {
                const responseText = await fetchGeminiAPI('', systemInstruction, false, null, multiTurnContents);
                aiChatHistory.push({ role: 'model', content: responseText });
                localStorage.setItem('viticulture-ai-chat-history', JSON.stringify(aiChatHistory));
                
                const formattedResponse = responseText.replace(/\n/g, '<br>');
                
                if (transcript) {
                    transcript.innerHTML += `
                        <div class="flex gap-3 max-w-[85%] fade-in">
                            <div class="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm flex-shrink-0">👨‍🌾</div>
                            <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100 text-xs font-medium text-stone-850 leading-relaxed">
                                ${formattedResponse}
                            </div>
                        </div>
                    `;
                }
            } catch (err) {
                if (transcript) {
                    transcript.innerHTML += `
                        <div class="flex gap-3 max-w-[85%] fade-in">
                            <div class="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-sm flex-shrink-0">⚠️</div>
                            <div class="bg-rose-50 p-3.5 rounded-2xl shadow-sm border border-rose-100 text-xs font-bold text-rose-700 leading-relaxed">
                                Помилка запиту: ${err.message}
                            </div>
                        </div>
                    `;
                }
                if (err.message.includes('limit: 0') || err.message.toLowerCase().includes('quota') || err.message.includes('429')) {
                    openQuotaHelpModal();
                }
            } finally {
                if (spinner) spinner.classList.add('hidden');
                if (transcript) transcript.scrollTop = transcript.scrollHeight;
            }
        }

        // --- AI ASSISTANT ADDITIONAL FEATURES ---
        let recognition = null;
        let isListening = false;

        function toggleVoiceInput() {
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!window.SpeechRecognition) {
                alert("Голосове введення не підтримується у вашому браузері. Спробуйте Google Chrome або Safari.");
                return;
            }

            if (!recognition) {
                recognition = new window.SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'uk-UA';

                recognition.onstart = () => {
                    isListening = true;
                    const btn = document.getElementById('btn-voice-input');
                    if (btn) {
                        btn.innerText = '🛑';
                        btn.classList.add('animate-pulse', 'text-rose-600', 'bg-rose-50');
                        btn.title = "Слухаю... Натисніть, щоб зупинити";
                    }
                };

                recognition.onend = () => {
                    isListening = false;
                    const btn = document.getElementById('btn-voice-input');
                    if (btn) {
                        btn.innerText = '🎙️';
                        btn.classList.remove('animate-pulse', 'text-rose-600', 'bg-rose-50');
                        btn.title = "Голосове введення";
                    }
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event);
                    isListening = false;
                    const btn = document.getElementById('btn-voice-input');
                    if (btn) {
                        btn.innerText = '🎙️';
                        btn.classList.remove('animate-pulse', 'text-rose-600', 'bg-rose-50');
                    }
                    if (event.error !== 'no-speech') {
                        alert(`Помилка голосового введення: ${event.error}`);
                    }
                };

                recognition.onresult = (event) => {
                    const resultText = event.results[0][0].transcript;
                    const input = document.getElementById('ai-chat-input');
                    if (input && resultText) {
                        input.value = (input.value + " " + resultText).trim();
                        input.focus();
                    }
                };
            }

            if (isListening) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch (e) {
                    console.error(e);
                }
            }
        }

        // Sprint 4: підказки для порожнього стану AI-чату
        const SUGGESTED_PROMPTS = [
            { icon: '🍇', text: 'Проаналізуй сорт Аватар для Вінниці', category: 'Сорти' },
            { icon: '🔬', text: 'Що таке горошина і як їй запобігти?', category: 'Хвороби' },
            { icon: '💧', text: 'Розрахуй дози NPK для 50 кущів', category: 'Живлення' },
            { icon: '🛡️', text: 'Протокол захисту від мілдью', category: 'Захист' },
            { icon: '📅', text: 'Підбери 3 ранніх зимостійких сорти', category: 'Сорти' },
            { icon: '⚗️', text: 'Скільки лимонної кислоти для pH 5.5?', category: 'Хімія' }
        ];
        function fillAiPrompt(i) {
            const p = SUGGESTED_PROMPTS[i];
            if (!p) return;
            const input = document.getElementById('ai-chat-input');
            if (input) { input.value = p.text; input.focus(); }
        }

        function renderAgroChatHistory() {
            const transcript = document.getElementById('ai-chat-transcript');
            if (!transcript) return;
            
            transcript.innerHTML = `
                <div class="flex gap-3 max-w-[85%]">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm flex-shrink-0">👨‍🌾</div>
                    <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100 text-xs font-medium text-stone-850 leading-relaxed">
                        Вітаю! Я ваш персональний асистент-агроном. Запитайте мене про будь-яку проблему з виноградом, хвороби, шкідників, підживлення чи обрізку.
                    </div>
                </div>
            `;

            // Sprint 4: empty state з підказками-промптами
            if (!aiChatHistory || aiChatHistory.length === 0) {
                transcript.innerHTML += `
                    <div class="ai-empty-title">Спробуйте запитати:</div>
                    <div class="suggested-grid">
                        ${SUGGESTED_PROMPTS.map((p, i) => `
                            <button type="button" class="suggested-prompt" data-action="fillAiPrompt" data-action-param="${i}">
                                <span class="sp-text">${p.icon} ${escapeHtml(p.text)}</span>
                                <span class="sp-cat">${escapeHtml(p.category)}</span>
                            </button>
                        `).join('')}
                    </div>
                `;
            }

            aiChatHistory.forEach(turn => {
                if (turn.role === 'user') {
                    // Екрануємо введений користувачем текст перед вставкою в innerHTML (B5).
                    let displayText = escapeHtml(turn.content);
                    if (displayText.startsWith('[Зображення:')) {
                        displayText = displayText.replace(/^\[Зображення:\s*([^\]]+)\]/, '📷 <span class="opacity-75 italic text-[10px] font-bold block mb-1 border-b border-emerald-500/20 pb-0.5">$1</span>');
                    }
                    transcript.innerHTML += `
                        <div class="flex gap-3 max-w-[85%] ml-auto justify-end">
                            <div class="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-sm text-xs font-semibold leading-relaxed">
                                ${displayText}
                            </div>
                            <div class="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-sm flex-shrink-0">🍇</div>
                        </div>
                    `;
                } else if (turn.role === 'model') {
                    // Екрануємо відповідь AI, потім дозволяємо лише переноси рядків (B5).
                    const formattedResponse = escapeHtml(turn.content).replace(/\n/g, '<br>');
                    transcript.innerHTML += `
                        <div class="flex gap-3 max-w-[85%] fade-in">
                            <div class="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm flex-shrink-0">👨‍🌾</div>
                            <div class="bg-white p-3.5 rounded-2xl shadow-sm border border-emerald-100 text-xs font-medium text-stone-850 leading-relaxed">
                                ${formattedResponse}
                            </div>
                        </div>
                    `;
                }
            });
            
            transcript.scrollTop = transcript.scrollHeight;
        }

        function clearAgroChat() {
            if (confirm("Ви впевнені, що хочете очистити діалог?")) {
                aiChatHistory = [];
                localStorage.removeItem('viticulture-ai-chat-history');
                renderAgroChatHistory();
            }
        }

        // --- THERMAL TRACKER MODE SWITCHER ---
        function setThermalMode(mode) {
            thermalMode = 'sat';
            localStorage.setItem('viticulture-thermal-mode', 'sat');
            
            const trackerTitle = document.getElementById('tracker-title');
            if (trackerTitle) trackerTitle.innerText = "Трекер САТ";
            const trackerSubtitle = document.getElementById('tracker-subtitle');
            if (trackerSubtitle) trackerSubtitle.innerText = "Сума Активних Температур (t° >= 10°C)";
            const trackerDisplayLabel = document.getElementById('tracker-display-label');
            if (trackerDisplayLabel) trackerDisplayLabel.innerText = "Накопичений САТ сезону:";
            const trackerBaseLabel = document.getElementById('tracker-base-label');
            if (trackerBaseLabel) trackerBaseLabel.innerText = "Базова температура старту: 10°C";
            
            const localLabel = document.getElementById('sat-check-local-label');
            if (localLabel) localLabel.innerText = "САТ місцевості (°C):";
            
            updateSATDisplay();
            renderSATLog();
            updateChart();
            updateMilestoneProgress();
            runSatSuitabilityCheck();
        }

        // --- GIBBERELLIC ACID (GA3) CALCULATOR LOGIC ---
        function calculateGA3() {
            const vol = parseFloat(document.getElementById('ga3-volume').value) || 0;
            const ppm = parseFloat(document.getElementById('ga3-ppm').value) || 0;
            const formulation = parseFloat(document.getElementById('ga3-formulation').value) || 100;

            // Формула — у src/calc.js (тестується Vitest)
            const formulationMg = Calc.ga3FormulationMg(vol, ppm, formulation);
            document.getElementById('ga3-result').innerText = Calc.formatGA3Result(formulationMg);
        }

        // --- TO-DO LIST & JOURNAL OF OPERATIONS LOGIC ---
        let isJournalCollapsed = false;

        function toggleJournalCollapse() {
            isJournalCollapsed = !isJournalCollapsed;
            localStorage.setItem('isJournalCollapsed', JSON.stringify(isJournalCollapsed));
            applyJournalCollapseState();
        }

        function applyJournalCollapseState() {
            const body = document.getElementById('todo-card-body');
            const header = document.getElementById('todo-card-header');
            const chevron = document.getElementById('todo-card-chevron');
            
            if (isJournalCollapsed) {
                body.classList.remove('max-h-[1500px]', 'opacity-100', 'mt-6');
                body.classList.add('max-h-0', 'opacity-0', 'mt-0', 'pointer-events-none');
                header.classList.remove('pb-6', 'border-b', 'border-emerald-100');
                header.classList.add('pb-0');
                chevron.classList.add('rotate-180');
            } else {
                body.classList.remove('max-h-0', 'opacity-0', 'mt-0', 'pointer-events-none');
                body.classList.add('max-h-[1500px]', 'opacity-100', 'mt-6');
                header.classList.remove('pb-0');
                header.classList.add('pb-6', 'border-b', 'border-emerald-100');
                chevron.classList.remove('rotate-180');
            }
        }

        let todoList = [];
        let currentTodoType = 'work';

        function setTodoType(type) {
            currentTodoType = type;
            const types = ['work', 'treatment', 'issue'];
            types.forEach(t => {
                const btn = document.getElementById('btn-todo-type-' + t);
                if (btn) {
                    if (t === type) {
                        btn.className = "flex-1 py-2 px-1 rounded-xl font-black text-[10px] uppercase border transition-all bg-emerald-600 text-white border-emerald-600 select-none";
                    } else {
                        btn.className = "flex-1 py-2 px-1 rounded-xl font-black text-[10px] uppercase border transition-all bg-white text-stone-600 border-stone-200 hover:bg-stone-50 select-none";
                    }
                }
            });

            const treatDiv = document.getElementById('todo-fields-treatment');
            const issueDiv = document.getElementById('todo-fields-issue');

            if (type === 'treatment') {
                if (treatDiv) treatDiv.classList.remove('hidden');
                if (issueDiv) issueDiv.classList.add('hidden');
                populateTreatmentProducts();
            } else if (type === 'issue') {
                if (treatDiv) treatDiv.classList.add('hidden');
                if (issueDiv) issueDiv.classList.remove('hidden');
            } else {
                if (treatDiv) treatDiv.classList.add('hidden');
                if (issueDiv) issueDiv.classList.add('hidden');
            }
        }

        function populateTreatmentProducts() {
            const select = document.getElementById('todo-treatment-product');
            if (!select) return;
            select.innerHTML = '';
            
            const list = getProductDB() || [];
            list.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.name;
                opt.innerText = `${p.name} (${getProductTypeLabel(p.type)})`;
                select.appendChild(opt);
            });
        }

        function getProductTypeLabel(type) {
            if (type === 'fertilizer') return 'Добриво';
            if (type === 'ppp') return 'ЗЗР';
            if (type === 'supplement') return 'Стимулятор';
            return 'Інше';
        }

        function handleTodoTextInput() {
            const input = document.getElementById('todo-text');
            const parseBtn = document.getElementById('btn-todo-ai-parse');
            if (!parseBtn || !input) return;
            const hasGeminiKey = localStorage.getItem('viticulture-gemini-key');
            if (hasGeminiKey && input.value.trim().length > 5) {
                parseBtn.classList.remove('hidden');
            } else {
                parseBtn.classList.add('hidden');
            }
        }

        let voiceRecognition = null;
        let isRecordingVoice = false;

        function toggleTodoVoice() {
            window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!window.SpeechRecognition) {
                showToast("Голосове розпізнавання не підтримується у вашому браузері. Скористайтеся Google Chrome або Safari.", "error");
                return;
            }

            if (!voiceRecognition) {
                voiceRecognition = new window.SpeechRecognition();
                voiceRecognition.continuous = false;
                voiceRecognition.interimResults = false;
                voiceRecognition.lang = 'uk-UA';

                voiceRecognition.onstart = () => {
                    isRecordingVoice = true;
                    const btn = document.getElementById('btn-todo-voice');
                    const icon = document.getElementById('voice-icon-symbol');
                    if (btn) btn.classList.add('bg-rose-100', 'text-rose-600', 'ring-2', 'ring-rose-400', 'animate-pulse');
                    if (icon) icon.innerText = '🛑';
                    showToast("Слухаю... Говоріть українською мовою.", "info");
                };

                voiceRecognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const input = document.getElementById('todo-text');
                    if (input) {
                        input.value = (input.value ? input.value + ' ' : '') + transcript;
                        handleTodoTextInput();
                    }
                    showToast("Голос розпізнано успішно!", "success");
                };

                voiceRecognition.onerror = (event) => {
                    console.error("Speech recognition error", event.error);
                    showToast(`Помилка голосу: ${event.error}`, "error");
                    stopVoiceRecording();
                };

                voiceRecognition.onend = () => {
                    stopVoiceRecording();
                };
            }

            if (isRecordingVoice) {
                voiceRecognition.stop();
            } else {
                voiceRecognition.start();
            }
        }

        function stopVoiceRecording() {
            isRecordingVoice = false;
            const btn = document.getElementById('btn-todo-voice');
            const icon = document.getElementById('voice-icon-symbol');
            if (btn) {
                btn.classList.remove('bg-rose-100', 'text-rose-600', 'ring-2', 'ring-rose-400', 'animate-pulse');
            }
            if (icon) {
                icon.innerText = '🎙️';
            }
        }

        async function parseTodoTextAI() {
            const key = localStorage.getItem('viticulture-gemini-key');
            if (!key) {
                showToast("Для використання ШІ-парсингу введіть ключ API Gemini у Налаштуваннях.", "warning");
                return;
            }

            const textInput = document.getElementById('todo-text');
            const textVal = textInput ? textInput.value.trim() : '';
            if (!textVal) return;

            const parseBtn = document.getElementById('btn-todo-ai-parse');
            const origHTML = parseBtn.innerHTML;
            parseBtn.disabled = true;
            parseBtn.innerHTML = '⏳';

            try {
                const productsList = getProductDB().map(p => p.name).join(', ');
                
                const systemPrompt = `You are a helper that extracts structured data from ukrainian notes about vineyard operations.
Identify:
1. Type of log: "work" (for general jobs like pruning, binding, weed removal), "treatment" (spraying or applying products/fertilizers like Horus, Ridomil, Plantafol), "issue" (finding diseases/pests/chlorosis/frosts/pests).
2. Product name if type is "treatment", strictly matching or very similar to one of these: ${productsList}. If not found in the list, just write its name.
3. Dosage if type is "treatment" (e.g. "3 г/л", "10 мл" etc. or null).
4. Issue type if type is "issue", strictly matching one of these: "Мілдью", "Оїдіум", "Сіра гниль", "Антракноз", "Бруньковий кліщ", "Павутинний кліщ", "Гронова листовійка", "Хлороз", "Заморозки", "Дефіцит живлення".
5. Severity if type is "issue" (either "🟢 Низька", "🟡 Середня", "🔴 Висока").

Return ONLY a valid raw JSON object matching this structure, with no markdown wrappers, no backticks, no comments:
{
  "type": "work" | "treatment" | "issue",
  "productName": "string or null",
  "productDose": "string or null",
  "issueType": "string or null",
  "issueSeverity": "string or null",
  "cleanedText": "Ukrainian string describing the task clearly, translated to short formal style"
}`;

                const jsonTextRaw = await fetchGeminiAPI(`${systemPrompt}\n\nInput text to parse: "${textVal}"`, '', true);
                if (!jsonTextRaw) throw new Error('Не отримано відповіді від ШІ');
                let cleanedJsonText = jsonTextRaw.trim();
                if (cleanedJsonText.startsWith('```')) {
                    cleanedJsonText = cleanedJsonText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
                }
                const parsed = JSON.parse(cleanedJsonText);

                if (parsed.type) {
                    setTodoType(parsed.type);
                    if (parsed.cleanedText && textInput) {
                        textInput.value = parsed.cleanedText;
                    }
                    if (parsed.type === 'treatment' && parsed.productName) {
                        const select = document.getElementById('todo-treatment-product');
                        if (select) {
                            for (let opt of select.options) {
                                if (opt.value.toLowerCase().includes(parsed.productName.toLowerCase()) || 
                                    parsed.productName.toLowerCase().includes(opt.value.toLowerCase())) {
                                    opt.selected = true;
                                    break;
                                }
                            }
                        }
                        const doseInput = document.getElementById('todo-treatment-dose');
                        if (parsed.productDose && doseInput) {
                            doseInput.value = parsed.productDose;
                        }
                    }
                    if (parsed.type === 'issue' && parsed.issueType) {
                        const select = document.getElementById('todo-issue-type');
                        if (select) {
                            for (let opt of select.options) {
                                if (opt.value.toLowerCase().includes(parsed.issueType.toLowerCase())) {
                                    opt.selected = true;
                                    break;
                                }
                            }
                        }
                        const sevSelect = document.getElementById('todo-issue-severity');
                        if (parsed.issueSeverity && sevSelect) {
                            sevSelect.value = parsed.issueSeverity;
                        }
                    }
                    showToast("ШІ успішно структурував надиктовану замітку!", "success");
                }
            } catch (err) {
                console.error("AI parsing error", err);
                showToast("Не вдалося розпарсити за допомогою ШІ. Спробуйте ввести вручну.", "info");
            } finally {
                if (parseBtn) {
                    parseBtn.disabled = false;
                    parseBtn.innerHTML = origHTML;
                }
            }
        }

        function addTodoItem() {
            const textInput = document.getElementById('todo-text');
            const dateInput = document.getElementById('todo-due-date');
            const directCheck = document.getElementById('todo-is-completed-direct');
            
            const text = textInput ? textInput.value.trim() : '';
            const dueDate = dateInput ? dateInput.value : '';
            const isCompletedDirect = directCheck ? directCheck.checked : false;
            
            if (!text) {
                alert('Будь ласка, введіть опис роботи або скористайтеся надиктованим текстом.');
                return;
            }

            const item = {
                id: Date.now() + Math.random(),
                text: text,
                dueDate: dueDate || null,
                completed: false,
                completedDate: null,
                type: currentTodoType,
                weather: null
            };

            if (currentTodoType === 'treatment') {
                const prodSelect = document.getElementById('todo-treatment-product');
                const doseInput = document.getElementById('todo-treatment-dose');
                item.productName = prodSelect ? prodSelect.value : '';
                item.productDose = doseInput ? doseInput.value.trim() : '';
            } else if (currentTodoType === 'issue') {
                const issueSelect = document.getElementById('todo-issue-type');
                const sevSelect = document.getElementById('todo-issue-severity');
                item.issueType = issueSelect ? issueSelect.value : '';
                item.issueSeverity = sevSelect ? sevSelect.value : '';
            }

            if (isCompletedDirect) {
                item.completed = true;
                item.completedDate = dueDate || new Date().toISOString().split('T')[0];
                
                // Fetch and attach current weather log
                let weatherData = null;
                const cacheStr = localStorage.getItem('viticulture-weather-current-cache');
                if (cacheStr) {
                    try {
                        const cache = JSON.parse(cacheStr);
                        weatherData = {
                            temp: cache.temp,
                            humidity: cache.humidity,
                            rain: cache.rain
                        };
                    } catch(e) {}
                }
                if (!weatherData) {
                    const tempEl = document.getElementById('disease-temp');
                    if (tempEl) {
                        weatherData = {
                            temp: parseInt(tempEl.value) || 20,
                            humidity: parseInt(document.getElementById('disease-humidity')?.value) || 60,
                            rain: parseFloat(document.getElementById('disease-rain')?.value) || 0
                        };
                    }
                }
                item.weather = weatherData;
            }
            
            todoList.push(item);
            
            if (textInput) textInput.value = '';
            if (directCheck) directCheck.checked = false;
            
            const doseInput = document.getElementById('todo-treatment-dose');
            if (doseInput) doseInput.value = '';

            localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
            
            const parseBtn = document.getElementById('btn-todo-ai-parse');
            if (parseBtn) parseBtn.classList.add('hidden');

            renderTodos();
            showToast("Запис успішно додано!", "success");
        }

        function toggleTodoItem(id) {
            const item = todoList.find(t => t.id == id);
            if (item) {
                item.completed = !item.completed;
                if (item.completed) {
                    const today = new Date();
                    const yyyy = today.getFullYear();
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const dd = String(today.getDate()).padStart(2, '0');
                    item.completedDate = `${yyyy}-${mm}-${dd}`;
                    
                    // Fetch and attach current weather log
                    let weatherData = null;
                    const cacheStr = localStorage.getItem('viticulture-weather-current-cache');
                    if (cacheStr) {
                        try {
                            const cache = JSON.parse(cacheStr);
                            weatherData = {
                                temp: cache.temp,
                                humidity: cache.humidity,
                                rain: cache.rain
                            };
                        } catch(e) {}
                    }
                    if (!weatherData) {
                        const tempEl = document.getElementById('disease-temp');
                        if (tempEl) {
                            weatherData = {
                                temp: parseInt(tempEl.value) || 20,
                                humidity: parseInt(document.getElementById('disease-humidity')?.value) || 60,
                                rain: parseFloat(document.getElementById('disease-rain')?.value) || 0
                            };
                        }
                    }
                    item.weather = weatherData;
                } else {
                    item.completedDate = null;
                    item.weather = null;
                }
                localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
                renderTodos();
            }
        }

        function updateTodoCompletedDate(id, newDate) {
            const item = todoList.find(t => t.id == id);
            if (item) {
                item.completedDate = newDate;
                localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
                renderTodos();
            }
        }

        function deleteTodoItem(id) {
            todoList = todoList.filter(t => t.id != id);
            localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
            renderTodos();
        }

        function clearCompletedTodos() {
            if (confirm('Ви впевнені, що хочете очистити весь журнал виконаних робіт?')) {
                todoList = todoList.filter(t => !t.completed);
                localStorage.setItem('vineyardTodo', JSON.stringify(todoList));
                renderTodos();
            }
        }

        function renderTodos() {
            const activeList = document.getElementById('todo-active-list');
            const completedList = document.getElementById('todo-completed-list');
            const stats = document.getElementById('todo-stats');
            
            const activeTasks = todoList.filter(t => !t.completed);
            const completedTasks = todoList.filter(t => t.completed);
            
            activeTasks.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            
            completedTasks.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
            
            // Render active list
            if (activeTasks.length === 0) {
                if (activeList) activeList.innerHTML = `<p class="text-xs text-stone-400 italic text-center py-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200">Немає запланованих робіт</p>`;
            } else {
                if (activeList) activeList.innerHTML = activeTasks.map(t => {
                    let dateBadge = '';
                    if (t.dueDate) {
                        const dateObj = new Date(t.dueDate);
                        const formatted = dateObj.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        dateBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-md font-bold">До: ${formatted}</span>`;
                    }
                    
                    let typeBadge = `<span class="bg-stone-100 text-stone-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">✍️ Робота</span>`;
                    if (t.type === 'treatment') {
                        typeBadge = `<span class="bg-purple-100 text-purple-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">🧪 ${t.productName} (${t.productDose || 'Без дози'})</span>`;
                    } else if (t.type === 'issue') {
                        typeBadge = `<span class="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">⚠️ ${t.issueType} (${t.issueSeverity})</span>`;
                    }
                    
                    return `
                        <div class="flex items-start justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm hover:border-emerald-300 transition-all select-none">
                            <div class="flex items-start gap-3 flex-grow mr-2 cursor-pointer" data-action="toggleTodoItem" data-action-param="${t.id}">
                                <input type="checkbox" class="w-4.5 h-4.5 mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none">
                                <div>
                                    <p class="text-xs text-stone-800 font-semibold leading-normal">${t.text}</p>
                                    <div class="mt-2 flex flex-wrap items-center gap-1.5">${typeBadge} ${dateBadge}</div>
                                </div>
                            </div>
                            <button data-action="dlg_deleteTodo" data-id="${t.id}" class="text-stone-300 hover:text-rose-500 font-black transition-all">✕</button>
                        </div>
                    `;
                }).join('');
            }
            
            // Render completed list (Journal)
            if (completedTasks.length === 0) {
                if (completedList) completedList.innerHTML = `<p class="text-xs text-stone-400 italic text-center py-10">Журнал пустий. Виконуйте завдання, щоб зафіксувати дату!</p>`;
            } else {
                if (completedList) completedList.innerHTML = completedTasks.map(t => {
                    let weatherBadge = '';
                    if (t.weather) {
                        weatherBadge = `<span class="bg-blue-50/50 text-blue-800 text-[9px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-blue-100">🌦️ ${t.weather.temp}°C • 💧 ${t.weather.humidity}% • ☔ ${t.weather.rain}мм</span>`;
                    }
                    
                    let typeBadge = `<span class="bg-stone-100 text-stone-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-stone-200">✍️ Робота</span>`;
                    if (t.type === 'treatment') {
                        typeBadge = `<span class="bg-purple-100 text-purple-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-purple-200">🧪 ${t.productName} (${t.productDose || 'Без дози'})</span>`;
                    } else if (t.type === 'issue') {
                        const sevColor = t.issueSeverity.includes('Висока') ? 'bg-rose-100 text-rose-800 border-rose-200' : (t.issueSeverity.includes('Середня') ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200');
                        typeBadge = `<span class="${sevColor} text-[9px] font-black uppercase px-2 py-0.5 rounded-md border">⚠️ ${t.issueType} (${t.issueSeverity})</span>`;
                    }
                    
                    return `
                        <div class="flex items-start justify-between bg-white p-4 rounded-2xl border border-emerald-100/50 shadow-sm hover:border-emerald-300 transition-all select-none">
                            <div class="flex items-start gap-3 flex-grow mr-2 cursor-pointer" data-action="toggleTodoItem" data-action-param="${t.id}">
                                <input type="checkbox" checked class="w-4.5 h-4.5 mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none">
                                <div class="flex-grow">
                                    <p class="text-xs text-stone-500 line-through font-bold decoration-emerald-500/30">${t.text}</p>
                                    <div class="flex flex-wrap items-center gap-1.5 mt-2">${typeBadge} ${weatherBadge}</div>
                                    <div class="flex items-center gap-2 mt-2" data-action="dlg_stop">
                                        <span class="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">Дата:</span>
                                        <input type="date" value="${t.completedDate}" data-action="dlg_todoDate" data-action-on="change" data-id="${t.id}" class="bg-transparent border-0 p-0 text-emerald-800 text-[11px] font-black outline-none cursor-pointer focus:underline w-28">
                                    </div>
                                </div>
                            </div>
                            <button data-action="dlg_deleteTodo" data-id="${t.id}" class="text-stone-300 hover:text-rose-500 font-black transition-all ml-2">✕</button>
                        </div>
                    `;
                }).join('');
            }
            
            if (stats) stats.innerText = `Виконано: ${completedTasks.length} з ${todoList.length}`;
            updateSmartRecommendations();
            updateDeagroAnalyticsUI();
        }

        function updateSmartRecommendations() {
            const completed = todoList.filter(t => t.completed);
            const treatments = completed.filter(t => t.type === 'treatment');
            const issues = completed.filter(t => t.type === 'issue');
            
            let recs = [];
            
            // Check NPK ratio
            let totalN = 0;
            treatments.forEach(t => {
                const prod = getProductDB().find(p => p.name === t.productName);
                if (prod && prod.composition && prod.composition.npk) {
                    totalN += prod.composition.npk.n || 0;
                }
            });
            if (totalN > 100) {
                recs.push("⚠️ Внесено велику кількість азоту за сезон. Щоб уникнути жирування пагонів, змістіть баланс підживлення на калій та фосфор (монофосфат калію).");
            }
            
            // Check recent rain and mildew prevention
            const diseaseRain = document.getElementById('disease-rain')?.value || 0;
            const rainAmount = parseFloat(diseaseRain) || 0;
            if (rainAmount > 5) {
                const lastMildewTreatment = treatments.find(t => {
                    const prod = getProductDB().find(p => p.name === t.productName);
                    return prod && prod.targets && prod.targets.some(tar => tar.toLowerCase().includes('мілдью'));
                });
                
                if (!lastMildewTreatment) {
                    recs.push("🌧️ Зафіксовано опади понад 5 мм за останні дні, а профілактичних обробок проти мілдью не виявлено! Рекомендується захисна обробка (Ридоміл Голд чи Танос).");
                } else {
                    const daysAgo = Math.round((Date.now() - new Date(lastMildewTreatment.completedDate).getTime()) / (1000 * 60 * 60 * 24));
                    if (daysAgo > 10) {
                        recs.push(`🌧️ Пройшли дощі. З моменту останньої обробки проти мілдью препаратом «${lastMildewTreatment.productName}» минуло ${daysAgo} днів. Захисний бар'єр послаблено.`);
                    }
                }
            }
            
            // Check active issues
            issues.forEach(issue => {
                if (issue.issueSeverity.includes('Висока') || issue.issueSeverity.includes('Середня')) {
                    recs.push(`🩹 Активна загроза: <strong>${issue.issueType}</strong> (${issue.issueSeverity}). Запустіть відповідний протокол лікування!`);
                }
            });
            
            const recsBox = document.getElementById('deagro-smart-recommendations-box');
            if (recsBox) {
                if (recs.length > 0) {
                    recsBox.innerHTML = `
                        <div class="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2 mb-3">
                            <span class="block text-[8px] font-black uppercase text-amber-700 tracking-widest">🧠 Адаптивні рекомендації deAgro:</span>
                            <ul class="space-y-1 text-[10px] text-stone-600 font-medium list-disc pl-3 leading-relaxed">
                                ${recs.map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                    recsBox.classList.remove('hidden');
                } else {
                    recsBox.innerHTML = '';
                    recsBox.classList.add('hidden');
                }
            }
        }

        function updateDeagroAnalyticsUI() {
            const completed = todoList.filter(t => t.completed);
            
            const totalTreatments = completed.filter(t => t.type === 'treatment').length;
            const totalIssues = completed.filter(t => t.type === 'issue').length;
            const totalWorks = completed.filter(t => t.type === 'work').length;
            
            const totalLogsCount = completed.length || 1;
            
            const treatmentsVal = document.getElementById('stat-total-treatments');
            if (treatmentsVal) treatmentsVal.innerText = totalTreatments;
            const barTreatments = document.getElementById('bar-total-treatments');
            if (barTreatments) barTreatments.style.width = `${(totalTreatments / totalLogsCount) * 100}%`;
            
            const issuesVal = document.getElementById('stat-total-issues');
            if (issuesVal) issuesVal.innerText = totalIssues;
            const barIssues = document.getElementById('bar-total-issues');
            if (barIssues) barIssues.style.width = `${(totalIssues / totalLogsCount) * 100}%`;
            
            const worksVal = document.getElementById('stat-total-works');
            if (worksVal) worksVal.innerText = totalWorks;
            const barWorks = document.getElementById('bar-total-works');
            if (barWorks) barWorks.style.width = `${(totalWorks / totalLogsCount) * 100}%`;
            
            let rainyDays = 0;
            let totalTemp = 0;
            let tempCount = 0;
            
            completed.forEach(t => {
                if (t.weather) {
                    if (t.weather.rain > 0) {
                        rainyDays++;
                    }
                    if (t.weather.temp) {
                        totalTemp += t.weather.temp;
                        tempCount++;
                    }
                }
            });
            
            const rainyEl = document.getElementById('stat-rainy-days');
            if (rainyEl) rainyEl.innerText = rainyDays;
            
            const tempEl = document.getElementById('stat-avg-temp');
            if (tempEl) {
                if (tempCount > 0) {
                    tempEl.innerText = `${Math.round(totalTemp / tempCount)}°C`;
                } else {
                    tempEl.innerText = '—';
                }
            }
        }

        async function generateDeagroAIAnalysis() {
            const key = localStorage.getItem('viticulture-gemini-key');
            if (!key) {
                showToast("Введіть Gemini API Key у налаштуваннях для активації ШІ-Аналітика.", "warning");
                return;
            }
            
            const outputBox = document.getElementById('deagro-ai-audit-output');
            if (!outputBox) return;
            
            const origContent = outputBox.innerHTML;
            outputBox.innerHTML = `
                <div class="flex items-center gap-2 text-stone-500 py-4 justify-center">
                    <span class="animate-spin text-lg">⏳</span>
                    <span>ШІ аналізує хронограф та погоду виноградника...</span>
                </div>
            `;
            
            try {
                const completedLogs = todoList.filter(t => t.completed).map(t => {
                    return {
                        date: t.completedDate,
                        type: t.type,
                        text: t.text,
                        productName: t.productName || null,
                        productDose: t.productDose || null,
                        issueType: t.issueType || null,
                        issueSeverity: t.issueSeverity || null,
                        weather: t.weather || null
                    };
                });
                
                let varietiesText = 'Не вказано';
                try {
                    let activeVarieties = [];
                    Object.keys(varietyData).forEach(name => {
                        const qty = vineyardQuantities[name] || 0;
                        if (qty > 0) {
                            const d = varietyData[name];
                            let desc = `${name} (${qty} кущів, колір: ${d.col === 'W' ? 'білий' : 'червоний'}, термін: ${d.rip}`;
                            if (d.soilPH) desc += `, pH ґрунту: ${d.soilPH}`;
                            if (d.soilMoisture) desc += `, вологість ґрунту: ${d.soilMoisture}%`;
                            desc += `)`;
                            activeVarieties.push(desc);
                        }
                    });
                    if (activeVarieties.length > 0) {
                        varietiesText = activeVarieties.join(', ');
                    }
                } catch(e) {}
                
                const satVal = document.getElementById('sat-total')?.innerText || '0°C';
                
                const prompt = `Ви — провідний агроном-виноградар (ШІ-асистент deAgro).
Проаналізуйте хронологію операцій на винограднику та погодні метрики за цей сезон вегетації.

Вхідні дані виноградника:
- Сорти винограду у колекції: ${varietiesText}
- Поточна сума активних температур (САТ): ${satVal}
- Історія виконаних робіт, обробок ЗЗР та загроз (з датами та зафіксованою погодою):
${JSON.stringify(completedLogs, null, 2)}

Будь ласка, згенеруйте стислий, але глибокий агрономічний звіт українською мовою. Організуйте його за такими пунктами (використовуйте смайли та чітке маркування):
1. 📊 **Загальний стан**: Коротко оцініть інтенсивність обробок та дотримання термінів відносно накопиченого САТ.
2. ⚠️ **Виявлені помилки та ризики**: Проаналізуйте збіг опадів, обробок та спалахів хвороб. Наприклад: якщо контактні препарати змило дощем, або якщо є велика затримка між обробками від оїдіуму/мілдью, або дисбаланс добрив.
3. 🎯 **Адаптивний план**: Конкретні рекомендації щодо захисту чи підживлення на наступні тижні з огляду на вирощувані сорти (наприклад, технічні чи столові) та САТ.

Пишіть дуже професійно, ємко, без зайвої «води». Форматуйте текст красивими HTML тегами (наприклад, strong, em, ul, li, br) для виведення в компактне віконце.`;

                const rawTextRaw = await fetchGeminiAPI(prompt, '', false);
                if (!rawTextRaw) throw new Error('Не отримано відповіді від ШІ');
                let rawText = rawTextRaw.replace(/```html/g, '').replace(/```/g, '').trim();
                
                outputBox.innerHTML = `
                    <div class="space-y-3">
                        <span class="block text-[8px] font-black uppercase text-purple-700 tracking-widest">✨ Результат ШІ-аналізу deAgro:</span>
                        <div class="text-[10px] text-stone-750 font-semibold space-y-2 leading-relaxed bg-purple-50/30 p-3 rounded-2xl border border-purple-100/50">
                            ${rawText}
                        </div>
                    </div>
                `;
                
                showToast("Адаптивний ШІ-аналіз сезону успішно сформовано!", "success");
            } catch(err) {
                console.error("deagro AI analysis failed", err);
                showToast("Не вдалося сформувати ШІ-аналіз: " + err.message, "error");
                outputBox.innerHTML = origContent;
            }
        }

        // Єдиний предикат: які ключі localStorage входять у резервну копію (O10).
        // API-ключ Gemini навмисно ВИКЛЮЧЕНО, щоб він не витікав у файл бекапу (приватність).
        const BACKUP_EXTRA_KEYS = ['satHistory', 'forecastDailyTemps', 'phaseChecklists', 'phaseChecklistDates', 'phaseNutritionChecklists', 'phaseNutritionChecklistDates', 'vineyardTodo', 'isJournalCollapsed', 'user-local-sat', 'activeScenario', 'weather-lat', 'weather-lon', 'weather-lat-saved', 'weather-lon-saved'];
        const BACKUP_EXCLUDE_KEYS = ['viticulture-gemini-key'];
        function isBackupKey(key) {
            if (!key || BACKUP_EXCLUDE_KEYS.includes(key)) return false;
            return key.startsWith('viticulture-') || BACKUP_EXTRA_KEYS.includes(key);
        }

        function exportDatabase() {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (isBackupKey(key)) {
                    data[key] = localStorage.getItem(key);
                }
            }
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `GrapeGrew_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function importDatabase(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    const keys = Object.keys(data);
                    const valid = keys.some(key => key.startsWith('viticulture-') || key === 'satHistory' || key === 'vineyardTodo');
                    if (!valid && keys.length > 0) {
                        alert('Помилка: файл не містить валідних даних GrapeGrew.');
                        return;
                    }
                    
                    if (confirm('Ви впевнені, що хочете імпортувати резервну копію? Поточні дані у додатку будуть перезаписані!')) {
                        // Clear existing keys
                        const keysToRemove = [];
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (isBackupKey(key)) {
                                keysToRemove.push(key);
                            }
                        }
                        keysToRemove.forEach(k => localStorage.removeItem(k));
                        
                        // Set imported keys
                        for (const key in data) {
                            if (data.hasOwnProperty(key)) {
                                localStorage.setItem(key, data[key]);
                            }
                        }
                        
                        alert('Базу даних успішно відновлено! Сторінка буде перезавантажена.');
                        window.location.reload();
                    }
                } catch (err) {
                    console.error(err);
                    alert('Помилка при зчитуванні файлу резервної копії.');
                }
            };
            reader.readAsText(file);
        }


        // === PRODUCT DATABASE SYSTEM (Module 5) ===
        const defaultProductDB = [
            // Fertilizers (Dry / Liquid)
            { id: "p1", targets: ["азотне живлення"],name: "Карбамід (Сечовина)", category: "n_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 46, p: 0, k: 0 }, micronutrients: {} }, dosage: { perLiter: "1.5-2.0 г/л", perHectare: "15-20 кг/га", perBush: "15-30 г" }, applicationScope: "Азотне живлення, прискорення росту пагонів", compatibility: { compatible: ["Аміачна селітра", "Плантафол"], incompatible: ["Кальцієва селітра"], notes: "Не змішувати з кальцієвими добривами." }, techSpecs: { waitPeriod: "—", maxTreatments: 4, tempRange: "10-25°C", phOptimal: "6.0-7.0" } },
            { id: "p2", targets: ["азотне живлення"],name: "Аміачна селітра", category: "n_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 34, p: 0, k: 0 }, micronutrients: {} }, dosage: { perLiter: "2.0-3.0 г/л", perHectare: "20-30 кг/га", perBush: "20-30 г" }, applicationScope: "Ранньовесняний старт, азотне підживлення", compatibility: { compatible: ["Сульфат амонію"], incompatible: ["Суперфосфат"], notes: "Не змішувати з суперфосфатом заздалегідь." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "5-20°C", phOptimal: "5.5-6.5" } },
            { id: "p3", targets: ["азотне живлення", "вершинна гниль", "кальцій"],name: "Кальцієва селітра", category: "n_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 15, p: 0, k: 0 }, micronutrients: { "Ca": 27 } }, dosage: { perLiter: "2.0 г/л", perHectare: "20 кг/га", perBush: "20 г" }, applicationScope: "Профілактика вершинної гнилі, зміцнення шкірки ягід", compatibility: { compatible: ["Брексил Ca"], incompatible: ["Сульфат калію", "Монофосфат калію"], notes: "Утворює осад при змішуванні з сульфатами і фосфатами." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "6.0-6.5" } },
            { id: "p4", targets: ["калійне живлення", "фосфорне живлення"],name: "Монофосфат калію", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 52, k: 34 }, micronutrients: {} }, dosage: { perLiter: "2.0-4.0 г/л", perHectare: "20-40 кг/га", perBush: "30 г" }, applicationScope: "Визрівання лози, накопичення цукрів у ягодах", compatibility: { compatible: ["Сульфат калію", "Плантафол 5-15-45"], incompatible: ["Кальцієва селітра", "Брексил Ca"], notes: "Не змішувати з кальцієвими препаратами." }, techSpecs: { waitPeriod: "—", maxTreatments: 5, tempRange: "10-25°C", phOptimal: "5.5-6.0" } },
            { id: "p5", targets: ["калійне живлення"],name: "Сульфат калію", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 0, k: 50 }, micronutrients: {} }, dosage: { perLiter: "2.0-3.0 г/л", perHectare: "20-30 кг/га", perBush: "30 г" }, applicationScope: "Калійне живлення, посухостійкість, якість ягід", compatibility: { compatible: ["Монофосфат калію"], incompatible: ["Кальцієва селітра"], notes: "Утворює гіпс при змішуванні з кальцієм." }, techSpecs: { waitPeriod: "—", maxTreatments: 4, tempRange: "10-25°C", phOptimal: "5.8-6.5" } },
            { id: "p6", targets: ["азотне живлення", "калійне живлення", "фосфорне живлення"],name: "YaraMila Complex", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 12, p: 11, k: 18 }, micronutrients: { "Mg": 2.7, "S": 20 } }, dosage: { perLiter: "—", perHectare: "150-300 кг/га", perBush: "50-80 г" }, applicationScope: "Основне ґрунтове внесення навесні", compatibility: { compatible: [], incompatible: [], notes: "Вноситься безпосередньо в ґрунт." }, techSpecs: { waitPeriod: "—", maxTreatments: 1, tempRange: "—", phOptimal: "6.0-6.8" } },
            { id: "p7", targets: ["азотне живлення", "калійне живлення", "фосфорне живлення"],name: "Нітроамофоска (16-16-16)", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 16, p: 16, k: 16 }, micronutrients: {} }, dosage: { perLiter: "—", perHectare: "200-300 кг/га", perBush: "40-50 г" }, applicationScope: "Весняне комплексне підживлення виноградника", compatibility: { compatible: [], incompatible: [], notes: "Сухе внесення під перекопування." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "—", phOptimal: "6.0-7.0" } },
            { id: "p8", targets: ["азотне живлення", "калійне живлення", "фосфорне живлення"],name: "Плантафол 20-20-20", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 20, p: 20, k: 20 }, micronutrients: {} }, dosage: { perLiter: "2.0-2.5 г/л", perHectare: "2.0-2.5 кг/га", perBush: "—" }, applicationScope: "Позакореневе збалансоване живлення", compatibility: { compatible: ["Хорус", "Скор", "Актара"], incompatible: ["Лужні препарати"], notes: "Ідеальний партнер для бакових сумішей." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "6.0-6.5" } },
            { id: "p9", targets: ["фосфорне живлення"],name: "Плантафол 10-54-10", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 10, p: 54, k: 10 }, micronutrients: {} }, dosage: { perLiter: "2.0-2.5 г/л", perHectare: "2.0-2.5 кг/га", perBush: "—" }, applicationScope: "Стимуляція бутонізації та цвітіння", compatibility: { compatible: ["Хорус", "Борна кислота"], incompatible: ["Кальцієва селітра"], notes: "Підкислює розчин." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "10-25°C", phOptimal: "5.5-6.0" } },
            { id: "p10", targets: ["калійне живлення"],name: "Плантафол 5-15-45", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 5, p: 15, k: 45 }, micronutrients: {} }, dosage: { perLiter: "2.5-3.0 г/л", perHectare: "2.5-3.0 кг/га", perBush: "—" }, applicationScope: "Визрівання ягід, накопичення цукру та калію", compatibility: { compatible: ["Монофосфат калію"], incompatible: ["Кальцієва селітра"], notes: "Вносити у серпні перед збором." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "6.0-6.2" } },
            { id: "p11", targets: ["калійне живлення", "хлороз"],name: "Калімагнезія", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 0, k: 28 }, micronutrients: { "Mg": 10 } }, dosage: { perLiter: "—", perHectare: "150-250 кг/га", perBush: "40 г" }, applicationScope: "Внесення під кущ проти магнієвого хлорозу лози", compatibility: { compatible: [], incompatible: [], notes: "Повільно розчиняється у ґрунті." }, techSpecs: { waitPeriod: "—", maxTreatments: 1, tempRange: "—", phOptimal: "6.2-7.0" } },
            { id: "p12", targets: ["азотне живлення"],name: "Сульфат амонію", category: "n_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 21, p: 0, k: 0 }, micronutrients: { "S": 24 } }, dosage: { perLiter: "2.0-3.0 г/л", perHectare: "20-30 кг/га", perBush: "25 г" }, applicationScope: "Азотно-сірчане живлення, підкислення ґрунту", compatibility: { compatible: ["Суперфосфат"], incompatible: ["Лужні добрива"], notes: "Не змішувати з вапном або золою." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "5.5-6.5" } },
            { id: "p13", targets: ["азотне живлення"],name: "Натрієва селітра", category: "n_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 16, p: 0, k: 0 }, micronutrients: { "Na": 26 } }, dosage: { perLiter: "1.5-2.0 г/л", perHectare: "15-20 кг/га", perBush: "20 г" }, applicationScope: "Азотне підживлення на кислих ґрунтах", compatibility: { compatible: [], incompatible: [], notes: "Лужне фізіологічно добриво." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "10-25°C", phOptimal: "6.5-7.5" } },
            { id: "p14", targets: ["фосфорне живлення", "ріст коренів"],name: "Суперфосфат подвійний", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 46, k: 0 }, micronutrients: { "S": 6 } }, dosage: { perLiter: "—", perHectare: "100-200 кг/га", perBush: "30 г" }, applicationScope: "Основне фосфорне живлення для росту коренів", compatibility: { compatible: ["Сульфат калію"], incompatible: ["Аміачна селітра", "Карбамід"], notes: "Уникати передчасного змішування з азотними селітрами." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "—", phOptimal: "6.0-6.8" } },
            { id: "p15", targets: ["фосфорне живлення"],name: "Суперфосфат простий", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 20, k: 0 }, micronutrients: { "Ca": 8, "S": 10 } }, dosage: { perLiter: "—", perHectare: "200-300 кг/га", perBush: "40 г" }, applicationScope: "Джерело фосфору, кальцію та сірки", compatibility: { compatible: ["Сульфат калію"], incompatible: ["Вапно"], notes: "При вапнуванні вносити окремо." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "—", phOptimal: "6.0-6.8" } },
            { id: "p16", targets: ["калійне живлення"],name: "Хлористий калій", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 0, p: 0, k: 60 }, micronutrients: {} }, dosage: { perLiter: "—", perHectare: "100-150 кг/га", perBush: "25 г" }, applicationScope: "Калійне живлення (бажано вносити з осені)", compatibility: { compatible: [], incompatible: [], notes: "Виноград чутливий до хлору, застосовувати обережно." }, techSpecs: { waitPeriod: "—", maxTreatments: 1, tempRange: "—", phOptimal: "6.0-7.0" } },
            { id: "p17", targets: ["азотне живлення", "фосфорне живлення"],name: "MAP Амофос", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 12, p: 52, k: 0 }, micronutrients: {} }, dosage: { perLiter: "1.5-2.0 г/л", perHectare: "15-20 кг/га", perBush: "25 г" }, applicationScope: "Концентроване фосфорно-азотне добриво", compatibility: { compatible: ["Сульфат калію"], incompatible: ["Кальцієва селітра"], notes: "Не поєднувати з кальцієм у розчині." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "5.5-6.5" } },
            { id: "p18", targets: ["азотне живлення", "фосфорне живлення"],name: "Діамофос", category: "pk_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 21, p: 53, k: 0 }, micronutrients: {} }, dosage: { perLiter: "1.0-2.0 г/л", perHectare: "10-15 кг/га", perBush: "20 г" }, applicationScope: "Висококонцентроване азотно-фосфорне підживлення", compatibility: { compatible: [], incompatible: ["Кальцієва селітра"], notes: "Утворює осад з кальцієвими добривами." }, techSpecs: { waitPeriod: "—", maxTreatments: 2, tempRange: "10-25°C", phOptimal: "6.0-6.8" } },
            { id: "p19", targets: ["азотне живлення", "калійне живлення", "фосфорне живлення"],name: "Мастер 18-18-18+3", category: "complex_fertilizer", type: "fertilizer", composition: { activeIngredients: [], npk: { n: 18, p: 18, k: 18 }, micronutrients: { "Mg": 3 } }, dosage: { perLiter: "2.0-2.5 г/л", perHectare: "2.0-2.5 кг/га", perBush: "25 г" }, applicationScope: "Комплексне збалансоване добриво з магнієм", compatibility: { compatible: ["Актара", "Скор"], incompatible: ["Лужні препарати"], notes: "Повністю водорозчинне безхлорне добриво." }, techSpecs: { waitPeriod: "—", maxTreatments: 4, tempRange: "10-25°C", phOptimal: "6.0-6.5" } },
            
            // Fungicides
            { id: "p20", targets: ["оїдіум", "сіра гниль"],name: "Хорус 75 WG", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Ципродиніл", percent: 75 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.3 г/л", perHectare: "0.3 кг/га", perBush: "—" }, applicationScope: "Оїдіум, сіра гниль, чорна плямистість (на старті)", compatibility: { compatible: ["Скор", "Актара", "Плантафол"], incompatible: [], notes: "Ефективний при низьких температурах (+3..+15°C)." }, techSpecs: { waitPeriod: "14 днів", maxTreatments: 3, tempRange: "3-20°C", phOptimal: "5.5-6.5" } },
            { id: "p21", targets: ["оїдіум"],name: "Скор 250 EC", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Дифеноконазол", percent: 25 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.2 мл/л", perHectare: "0.2 л/га", perBush: "—" }, applicationScope: "Оїдіум, чорна гниль, фомопсис", compatibility: { compatible: ["Хорус", "Кораген", "Актара"], incompatible: [], notes: "Високосистемна дія при температурах вище +15°C." }, techSpecs: { waitPeriod: "30 днів", maxTreatments: 3, tempRange: "15-28°C", phOptimal: "6.0-6.5" } },
            { id: "p22", targets: ["оїдіум"],name: "Фалькон 460 EC", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Тебуконазол", percent: 16.7 }, { name: "Спіроксамін", percent: 25 }, { name: "Тріадименол", percent: 4.3 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.5 мл/л", perHectare: "0.4 л/га", perBush: "—" }, applicationScope: "Потужний захист від оїдіуму та лікування", compatibility: { compatible: ["Акробат", "Кораген"], incompatible: ["Лужні"], notes: "Трикомпонентний системний фунгіцид." }, techSpecs: { waitPeriod: "30 днів", maxTreatments: 4, tempRange: "12-25°C", phOptimal: "5.5-6.0" } },
            { id: "p23", targets: ["мілдью"],name: "Танос 50 WG", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Фамоксадон", percent: 25 }, { name: "Цимоксаніл", percent: 25 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.6 г/л", perHectare: "0.6 кг/га", perBush: "—" }, applicationScope: "Захист від мілдью, стійкість до змивання дощем", compatibility: { compatible: ["Луна Експірієнс", "Вертімек"], incompatible: [], notes: "Швидке проникнення в лист за 10 хв." }, techSpecs: { waitPeriod: "30 днів", maxTreatments: 3, tempRange: "12-25°C", phOptimal: "6.0-6.5" } },
            { id: "p24", targets: ["мілдью"],name: "Ридоміл Голд", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Манкоцеб", percent: 64 }, { name: "Мефеноксам", percent: 4 }], npk: null, micronutrients: {} }, dosage: { perLiter: "2.5 г/л", perHectare: "2.5 кг/га", perBush: "—" }, applicationScope: "Захист від мілдью, системно-контактна дія", compatibility: { compatible: ["Топаз", "Актара"], incompatible: ["Бордоська рідина"], notes: "Не змішувати з лужними розчинами." }, techSpecs: { waitPeriod: "40 днів", maxTreatments: 3, tempRange: "10-25°C", phOptimal: "6.0-6.5" } },
            { id: "p25", targets: ["оїдіум", "сіра гниль"],name: "Свіч 62.5 WG", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Ципродиніл", percent: 37.5 }, { name: "Флудіоксоніл", percent: 25 }], npk: null, micronutrients: {} }, dosage: { perLiter: "1.0 г/л", perHectare: "1.0 кг/га", perBush: "—" }, applicationScope: "Найкращий захист від сірої гнилі, білої гнилі, оїдіуму", compatibility: { compatible: ["Проклейм", "Топаз"], incompatible: [], notes: "Застосовувати у фазі змикання ягід та перед збором." }, techSpecs: { waitPeriod: "7-14 днів", maxTreatments: 2, tempRange: "10-25°C", phOptimal: "5.5-6.5" } },
            { id: "p26", targets: ["оїдіум", "кліщі"],name: "Тіовіт Джет", category: "fungicide", type: "ppp", composition: { activeIngredients: [{ name: "Сірка", percent: 80 }], npk: null, micronutrients: {} }, dosage: { perLiter: "4.0-8.0 г/л", perHectare: "5.0-8.0 кг/га", perBush: "—" }, applicationScope: "Контактний захист від оїдіуму та кліщів", compatibility: { compatible: ["Скала"], incompatible: ["Масляні препарати"], notes: "Інтервал після масляних обробок — не менше 14 днів." }, techSpecs: { waitPeriod: "30 днів", maxTreatments: 4, tempRange: "18-28°C", phOptimal: "6.5-7.5" } },

            // Insecticides / Acaricides
            { id: "p30", targets: ["листовійка"],name: "Актара 25 WG", category: "insecticide", type: "ppp", composition: { activeIngredients: [{ name: "Тіаметоксам", percent: 25 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.15 г/л", perHectare: "0.15 кг/га", perBush: "—" }, applicationScope: "Системний захист від цикадок, попелиць, довгоносиків", compatibility: { compatible: ["Хорус", "Скор", "Плантафол"], incompatible: [], notes: "Добре працює через корінь (полив)." }, techSpecs: { waitPeriod: "20 днів", maxTreatments: 2, tempRange: "10-25°C", phOptimal: "6.0-7.0" } },
            { id: "p31", targets: ["листовійка"],name: "Кораген 20 SC", category: "insecticide", type: "ppp", composition: { activeIngredients: [{ name: "Хлорантраніліпрол", percent: 20 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.15-0.2 мл/л", perHectare: "0.15-0.2 л/га", perBush: "—" }, applicationScope: "Гусінь листовійки, гронова листовійка, совки", compatibility: { compatible: ["Фалькон", "Скор"], incompatible: [], notes: "Безпечний для бджіл." }, techSpecs: { waitPeriod: "20 днів", maxTreatments: 2, tempRange: "10-30°C", phOptimal: "5.5-7.0" } },
            { id: "p32", targets: ["листовійка"],name: "Проклейм 5 SG", category: "insecticide", type: "ppp", composition: { activeIngredients: [{ name: "Емамектин бензоат", percent: 5 }], npk: null, micronutrients: {} }, dosage: { perLiter: "0.4 г/л", perHectare: "0.4 кг/га", perBush: "—" }, applicationScope: "Листовійка у фазі формування ягоди та змикання", compatibility: { compatible: ["Свіч", "Топаз"], incompatible: ["Лужні"], notes: "Швидко проникає в рослину, контактно-шлунковий." }, techSpecs: { waitPeriod: "14 днів", maxTreatments: 2, tempRange: "15-28°C", phOptimal: "6.0-6.5" } },
            { id: "p33", targets: ["кліщі"],name: "Вертімек 018 EC", category: "acaricide", type: "ppp", composition: { activeIngredients: [{ name: "Абамектин", percent: 1.8 }], npk: null, micronutrients: {} }, dosage: { perLiter: "1.0 мл/л", perHectare: "1.0 л/га", perBush: "—" }, applicationScope: "Боротьба з кліщами (зудень, павутинний, бруньковий)", compatibility: { compatible: ["Скор", "Танос"], incompatible: [], notes: "Трансламінарна дія, швидкий захист." }, techSpecs: { waitPeriod: "28 днів", maxTreatments: 2, tempRange: "15-25°C", phOptimal: "5.5-6.5" } },

            // Biostimulants
            { id: "p40", targets: ["заморозки", "посуха", "опік"],name: "Мегафол", category: "biostimulant", type: "supplement", composition: { activeIngredients: [{ name: "Амінокислоти", percent: 28 }], npk: null, micronutrients: {} }, dosage: { perLiter: "2.0-3.0 мл/л", perHectare: "2.0-3.0 л/га", perBush: "—" }, applicationScope: "Антистресант при заморозках, граді, посусі", compatibility: { compatible: ["Плантафол", "Актара"], incompatible: ["Масла", "Мідь"], notes: "Не поєднувати з мідьвмісними препаратами." }, techSpecs: { waitPeriod: "—", maxTreatments: 5, tempRange: "—", phOptimal: "6.0-6.5" } },
            { id: "p41", targets: ["ріст коренів", "заморозки", "посуха"],name: "Агріфлекс", category: "biostimulant", type: "supplement", composition: { activeIngredients: [{ name: "Гумінові кислоти", percent: 80 }], npk: null, micronutrients: {} }, dosage: { perLiter: "1.0-2.0 г/л", perHectare: "1.0-2.0 кг/га", perBush: "5 г" }, applicationScope: "Стимуляція кореневої системи, антистресовий ефект", compatibility: { compatible: [], incompatible: ["Кальцій"], notes: "Покращує структуру ґрунту." }, techSpecs: { waitPeriod: "—", maxTreatments: 4, tempRange: "—", phOptimal: "6.5-7.5" } },
            { id: "p42", targets: ["калійне живлення"],name: "Бенефіт PZ", category: "biostimulant", type: "supplement", composition: { activeIngredients: [{ name: "Рослинні нуклеотиди", percent: 100 }], npk: null, micronutrients: {} }, dosage: { perLiter: "2.5-3.0 мл/л", perHectare: "2.5-3.0 л/га", perBush: "—" }, applicationScope: "Збільшення розміру ягоди шляхом поділу клітин", compatibility: { compatible: ["Максикроп"], incompatible: [], notes: "Вносити у фазі горошини 2-3 рази." }, techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "15-25°C", phOptimal: "6.0-6.5" } }
        ];

        let productDB = [];
        let currentProductFilter = 'all';
        let activeProduct = null;

        function getProductDB() {
            if (productDB.length === 0) {
                initProductDB();
            }
            return productDB;
        }

        function initProductDB() {
            productDB = JSON.parse(JSON.stringify(defaultProductDB));
            
            // 1. Load saved custom products from viticulture-product-db first
            const saved = localStorage.getItem('viticulture-product-db');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    const customItems = parsed.filter(item => item.isCustom);
                    
                    // Remove default items that have custom overrides (by ID)
                    customItems.forEach(custom => {
                        productDB = productDB.filter(p => p.id !== custom.id);
                    });
                    
                    productDB = productDB.concat(customItems);
                } catch(e) { console.error("Error loading custom products", e); }
            }

            // 2. Migrate legacy custom dry fertilizers once (if any) and clear the legacy key
            const oldCustomFert = localStorage.getItem('viticulture-custom-dry-fert');
            if (oldCustomFert) {
                try {
                    const parsed = JSON.parse(oldCustomFert);
                    let migratedAny = false;
                    parsed.forEach((f, idx) => {
                        // Check if it already exists by name (case-insensitive) in productDB
                        const exists = productDB.some(p => p.name.toLowerCase() === f.name.toLowerCase());
                        if (!exists) {
                            const newProd = {
                                id: `migrated-${idx}-${Date.now()}`,
                                name: f.name,
                                category: (f.n > 20) ? "n_fertilizer" : "complex_fertilizer",
                                type: "fertilizer",
                                composition: {
                                    activeIngredients: [],
                                    npk: { n: f.n || 0, p: f.p || 0, k: f.k || 0 },
                                    micronutrients: {}
                                },
                                dosage: { perLiter: "2-3 г/л", perHectare: "—", perBush: "20 г" },
                                applicationScope: "Кастомне добриво (перенесено)",
                                compatibility: { compatible: [], incompatible: [], notes: "" },
                                techSpecs: { waitPeriod: "—", maxTreatments: 3, tempRange: "—", phOptimal: "6.0" },
                                isCustom: true
                            };
                            productDB.push(newProd);
                            migratedAny = true;
                        }
                    });
                    
                    // Clear legacy key permanently so it never runs again
                    localStorage.removeItem('viticulture-custom-dry-fert');
                    
                    if (migratedAny) {
                        saveProductDB();
                    }
                } catch(e) { console.error("Error migrating fertilizers", e); }
            }
            
            // 3. De-duplicate any pre-existing duplicates in productDB by name (case-insensitive)
            const seenNames = new Set();
            let duplicatesFound = false;
            productDB = productDB.filter(p => {
                if (p.isCustom) {
                    const nameKey = p.name.toLowerCase().trim();
                    // Automatically filter out the legacy custom carbamide with 0/0/0 NPK
                    if (nameKey === 'карбамід') {
                        const npk = p.composition?.npk || {};
                        if ((npk.n || 0) === 0 && (npk.p || 0) === 0 && (npk.k || 0) === 0) {
                            duplicatesFound = true;
                            return false; // discard
                        }
                    }
                    if (seenNames.has(nameKey)) {
                        duplicatesFound = true;
                        return false; // discard duplicate
                    }
                    seenNames.add(nameKey);
                }
                return true;
            });
            
            if (duplicatesFound) {
                saveProductDB();
            }
            
            updateProductCategoryCounters();
        }

        function saveProductDB() {
            const custom = productDB.filter(p => p.isCustom);
            localStorage.setItem('viticulture-product-db', JSON.stringify(custom));
            updateProductCategoryCounters();
        }

        function updateProductCategoryCounters() {
            const counts = { all: productDB.length, fertilizer: 0, ppp: 0, supplement: 0 };
            productDB.forEach(p => {
                if (counts[p.type] !== undefined) {
                    counts[p.type]++;
                }
            });
            
            const elAll = document.getElementById('prod-count-all');
            if (elAll) elAll.innerText = counts.all;
            const elFert = document.getElementById('prod-count-fertilizer');
            if (elFert) elFert.innerText = counts.fertilizer;
            const elPpp = document.getElementById('prod-count-ppp');
            if (elPpp) elPpp.innerText = counts.ppp;
            const elSupp = document.getElementById('prod-count-supplement');
            if (elSupp) elSupp.innerText = counts.supplement;
        }

        function setProductFilter(filter) {
            currentProductFilter = filter;
            document.querySelectorAll('#product-category-filter-group button').forEach(b => {
                b.classList.remove('bg-white', 'text-emerald-900', 'shadow-sm');
                b.classList.add('text-stone-600', 'hover:text-emerald-950');
            });
            const activeBtn = document.getElementById('pcf-' + filter);
            if (activeBtn) {
                activeBtn.classList.remove('text-stone-600', 'hover:text-emerald-950');
                activeBtn.classList.add('bg-white', 'text-emerald-900', 'shadow-sm');
            }
            renderProductGrid();
        }

        function filterProducts() {
            renderProductGrid();
        }

        function renderProductGrid() {
            const container = document.getElementById('prod-grid-container');
            if (!container) return;
            
            const searchVal = document.getElementById('prod-search').value.toLowerCase().trim();
            
            let list = productDB;
            
            if (currentProductFilter !== 'all') {
                list = list.filter(p => p.type === currentProductFilter);
            }
            
            if (searchVal) {
                list = list.filter(p =>
                    (p.name || '').toLowerCase().includes(searchVal) ||
                    (p.applicationScope || '').toLowerCase().includes(searchVal) ||
                    (p.composition && p.composition.activeIngredients && p.composition.activeIngredients.some(ai => (ai.name || '').toLowerCase().includes(searchVal)))
                );
            }
            
            if (list.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-stone-300 py-32 bg-stone-50 rounded-3xl border border-stone-200/50">
                        <span class="text-5xl block mb-3 opacity-30">📦</span>
                        <p class="font-black text-xs uppercase tracking-widest opacity-40">Препаратів не знайдено</p>
                    </div>
                `;
                return;
            }
            
            // Sort list alphabetically
            list.sort((a, b) => a.name.localeCompare(b.name));
            
            const categoryBadges = {
                fungicide: { label: "🛡️ Фунгіцид", class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                insecticide: { label: "🐛 Інсектицид", class: "bg-amber-100 text-amber-800 border-amber-200" },
                acaricide: { label: "🕷️ Акарицид", class: "bg-red-100 text-red-800 border-red-200" },
                n_fertilizer: { label: "🟢 Азотне добриво", class: "bg-blue-100 text-blue-800 border-blue-200" },
                pk_fertilizer: { label: "🟡 Фосфорно-Калійне", class: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                complex_fertilizer: { label: "🔵 Комплексне добриво", class: "bg-indigo-100 text-indigo-800 border-indigo-200" },
                biostimulant: { label: "🌱 Біостимулятор", class: "bg-teal-100 text-teal-800 border-teal-200" },
                micronutrient: { label: "⚡ Мікроелемент", class: "bg-purple-100 text-purple-800 border-purple-200" },
                other: { label: "📦 Інше", class: "bg-stone-100 text-stone-850 border-stone-200" }
            };

            container.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${list.map(p => {
                        const badge = categoryBadges[p.category] || categoryBadges.other;
                        const activeClass = (activeProduct && activeProduct.id === p.id) ? 'border-emerald-600 bg-emerald-50/20' : 'border-stone-100 bg-stone-50 hover:bg-stone-100/50';
                        
                        let compositionText = 'Склад: ';
                        if (p.type === 'fertilizer' && p.composition.npk) {
                            compositionText += `N:${p.composition.npk.n}% P:${p.composition.npk.p}% K:${p.composition.npk.k}%`;
                        } else if (p.composition.activeIngredients && p.composition.activeIngredients.length > 0) {
                            compositionText += p.composition.activeIngredients.map(ai => `${ai.name} (${ai.percent}%)`).join(', ');
                        } else {
                            compositionText += p.composition.npk ? "Комплексне" : "Не вказано";
                        }
                        
                        return `
                            <div data-action="selectProduct" data-action-param="${p.id}" data-product-id="${p.id}" class="p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-sm ${activeClass}">
                                <div>
                                    <div class="flex justify-between items-start gap-2">
                                        <h4 class="font-black text-emerald-950 text-sm leading-snug truncate">${p.name}</h4>
                                        <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.class} shrink-0">${badge.label}</span>
                                    </div>
                                    <p class="text-[10px] text-stone-500 font-bold uppercase tracking-wider mt-1 truncate">${compositionText}</p>
                                </div>
                                <div class="flex justify-between items-center text-[10px] border-t border-stone-200/50 pt-2.5 mt-1">
                                    <span class="text-stone-500 font-medium truncate max-w-[150px]">Ціль: <b>${p.applicationScope}</b></span>
                                    <span class="text-emerald-700 font-black shrink-0">Доза: ${p.dosage.perLiter || p.dosage.perBush || '—'}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function selectProduct(id) {
            const p = productDB.find(prod => prod.id === id);
            if (!p) return;
            activeProduct = p;
            
            // Re-render grid to update active outline
            renderProductGrid();
            
            const panel = document.getElementById('prod-details-panel');
            if (!panel) return;
            
            let compositionHTML = '';
            if (p.type === 'fertilizer' && p.composition.npk) {
                compositionHTML = `
                    <div class="flex gap-2.5 mt-1">
                        <div class="bg-blue-50 border border-blue-150 px-2.5 py-1 rounded-xl text-center flex-1">
                            <span class="text-[9px] font-black uppercase text-blue-500 block">N</span>
                            <span class="text-xs font-black text-blue-900">${p.composition.npk.n}%</span>
                        </div>
                        <div class="bg-yellow-50 border border-yellow-150 px-2.5 py-1 rounded-xl text-center flex-1">
                            <span class="text-[9px] font-black uppercase text-yellow-600 block">P</span>
                            <span class="text-xs font-black text-yellow-900">${p.composition.npk.p}%</span>
                        </div>
                        <div class="bg-red-50 border border-red-150 px-2.5 py-1 rounded-xl text-center flex-1">
                            <span class="text-[9px] font-black uppercase text-red-600 block">K</span>
                            <span class="text-xs font-black text-red-900">${p.composition.npk.k}%</span>
                        </div>
                    </div>
                `;
            } else if (p.composition.activeIngredients && p.composition.activeIngredients.length > 0) {
                compositionHTML = `
                    <ul class="space-y-1.5 mt-1">
                        ${p.composition.activeIngredients.map(ai => `
                            <li class="bg-white border border-stone-200/60 p-2 rounded-xl text-[11px] font-semibold text-stone-700 flex justify-between">
                                <span>🧪 ${ai.name}</span>
                                <span class="text-emerald-700 font-black">${ai.percent}%</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            } else {
                compositionHTML = '<p class="text-xs text-stone-400 italic">Склад не вказано</p>';
            }

            const isDefaultOverride = defaultProductDB.some(d => d.id === p.id);
            const deleteBtnHTML = p.isCustom 
                ? `<button data-action="deleteProduct" data-action-param="${p.id}" class="flex-1 py-2.5 rounded-xl border border-rose-250 text-rose-600 font-bold hover:bg-rose-50 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-1">${isDefaultOverride ? '🗑️ Скинути' : '🗑️ Видалити'}</button>`
                : `<button disabled class="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-400 font-bold text-[11px] uppercase tracking-wider cursor-not-allowed opacity-50 flex items-center justify-center gap-1" title="Системний препарат не можна видалити">🔒 Системний</button>`;
                
            panel.innerHTML = `
                <div class="fade-in space-y-5">
                    <div class="border-b border-stone-200 pb-3">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="text-lg font-black text-emerald-950 leading-tight">${p.name}</h3>
                            <button data-action="editProduct" data-action-param="${p.id}" class="text-stone-400 hover:text-emerald-700 transition-colors p-1" title="Редагувати препарат">✏️</button>
                        </div>
                        <p class="text-[10px] text-stone-400 uppercase tracking-widest font-black mt-1">${p.type === 'fertilizer' ? 'Добриво' : p.type === 'ppp' ? 'Засіб захисту рослин' : 'Агро-Стимулятор'}</p>
                    </div>
                    
                    <div class="space-y-3.5 text-xs text-stone-700">
                        <div>
                            <span class="text-[9px] font-black uppercase text-stone-400 block tracking-widest mb-1">Склад / Формула:</span>
                            ${compositionHTML}
                        </div>
                        
                        <div>
                            <span class="text-[9px] font-black uppercase text-stone-400 block tracking-widest mb-0.5">Дозування & Внесення:</span>
                            <div class="bg-white p-3 rounded-2xl border border-stone-200/60 space-y-1.5 font-bold text-[11px]">
                                <div class="flex justify-between"><span>На 10л води:</span><span class="text-emerald-700">${p.dosage.perLiter || '—'}</span></div>
                                <div class="flex justify-between"><span>На 1 кущ:</span><span class="text-emerald-700">${p.dosage.perBush || '—'}</span></div>
                                <div class="flex justify-between"><span>Норма на 1 га:</span><span class="text-emerald-700">${p.dosage.perHectare || '—'}</span></div>
                            </div>
                        </div>

                        <div>
                            <span class="text-[9px] font-black uppercase text-stone-400 block tracking-widest mb-0.5">Сфера застосування:</span>
                            <p class="font-semibold text-stone-800 bg-white p-3 rounded-2xl border border-stone-200/60">${p.applicationScope || 'Не вказано'}</p>
                        </div>

                        <div>
                            <span class="text-[9px] font-black uppercase text-stone-400 block tracking-widest mb-0.5">Сумісність:</span>
                            <div class="bg-stone-100/50 p-3 rounded-2xl border border-stone-200/40 text-[11px] space-y-1">
                                <div><span class="text-emerald-700 font-extrabold">Сумісний з:</span> ${p.compatibility.compatible?.join(', ') || '—'}</div>
                                <div><span class="text-rose-600 font-extrabold">Несумісний з:</span> ${p.compatibility.incompatible?.join(', ') || '—'}</div>
                                ${p.compatibility.notes ? `<div class="text-[10px] text-stone-500 italic mt-1">${p.compatibility.notes}</div>` : ''}
                            </div>
                        </div>

                        <div>
                            <span class="text-[9px] font-black uppercase text-stone-400 block tracking-widest mb-0.5">Технологічні параметри:</span>
                            <div class="grid grid-cols-2 gap-2 text-[10px] bg-white p-3 rounded-2xl border border-stone-200/60 font-semibold">
                                <div>⏱️ Термін очікування: <b>${p.techSpecs.waitPeriod || '—'}</b></div>
                                <div>🔄 Макс. обробок: <b>${p.techSpecs.maxTreatments || '—'}</b></div>
                                <div>🌡️ Температури: <b>${p.techSpecs.tempRange || '—'}</b></div>
                                <div>💧 Оптимальний рН: <b>${p.techSpecs.phOptimal || '—'}</b></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2 border-t border-stone-200/60 pt-4 mt-2">
                        ${deleteBtnHTML}
                        <button data-action="editProduct" data-action-param="${p.id}" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-1">✏️ Редагувати</button>
                    </div>
                </div>
            `;
        }

        function setProductPhotoLoading(isLoading) {
            const idle = document.getElementById('prod-photo-status-idle');
            const loading = document.getElementById('prod-photo-status-loading');
            const dropzone = document.getElementById('prod-photo-dropzone');
            
            if (isLoading) {
                if (idle) idle.classList.add('hidden');
                if (loading) loading.classList.remove('hidden');
                if (dropzone) {
                    dropzone.classList.remove('bg-purple-50/50', 'border-purple-200');
                    dropzone.classList.add('bg-purple-100/50', 'border-purple-400');
                }
            } else {
                if (idle) idle.classList.remove('hidden');
                if (loading) loading.classList.add('hidden');
                if (dropzone) {
                    dropzone.classList.remove('bg-purple-100/50', 'border-purple-400');
                    dropzone.classList.add('bg-purple-50/50', 'border-purple-200');
                }
            }
        }

        async function handleProductPhotoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const key = localStorage.getItem('viticulture-gemini-key');
            if (!key) {
                showToast("Введіть Gemini API Key у налаштуваннях для сканування упаковки.", "warning");
                event.target.value = '';
                return;
            }
            
            setProductPhotoLoading(true);
            
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif') {
                try {
                    if (typeof heic2any === 'undefined') {
                        throw new Error("Бібліотека конвертації HEIC завантажується, спробуйте ще раз через секунду.");
                    }
                    showToast("Перетворюємо формат HEIC з iPhone...", "info");
                    
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8
                    });
                    
                    const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    const jpegFile = new File([finalBlob], "converted.jpg", { type: "image/jpeg" });
                    compressImageAndProcess(jpegFile);
                } catch (err) {
                    console.error("HEIC Conversion failed:", err);
                    showToast(`Помилка конвертації HEIC: ${err.message}`, "danger");
                    setProductPhotoLoading(false);
                }
            } else {
                compressImageAndProcess(file);
            }
            
            event.target.value = '';
        }

        function compressImageAndProcess(file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const maxDim = 1000;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxDim) {
                            height = Math.round(height * maxDim / width);
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = Math.round(width * maxDim / height);
                            height = maxDim;
                        }
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    const base64Content = compressedDataUrl.split(',')[1];
                    
                    showToast('📸 Фото стиснуто, надсилаю на розпізнавання...', 'info');
                    analyzeProductPhotoAI(base64Content, 'image/jpeg').catch(err => {
                        console.error('[compressImageAndProcess] analyzeProductPhotoAI rejected:', err);
                    });
                };
                img.onerror = function(err) {
                    console.error("Image load failed:", err);
                    showToast("Не вдалося завантажити зображення. Спробуйте інше фото.", "danger");
                    setProductPhotoLoading(false);
                };
                img.src = event.target.result;
            };
            reader.onerror = function(error) {
                showToast("Помилка читання зображення.", "danger");
                setProductPhotoLoading(false);
            };
        }

        async function analyzeProductPhotoAI(base64Data, mimeType) {
            const key = localStorage.getItem('viticulture-gemini-key');
            if (!key) {
                showToast("Введіть Gemini API Key у налаштуваннях.", "warning");
                setProductPhotoLoading(false);
                return;
            }
            
            const prompt = `Аналізуй це зображення упаковки/етикетки препарату для сільського господарства (добриво, фунгіцид, інсектицид, акарицид, стимулятор тощо) та отримамай всі деталі.
Поверни виключно JSON об'єкт наступної структури:
{
  "name": "Назва препарату (напр. Скор 250 EC)",
  "type": "ppp" або "fertilizer" або "supplement",
  "category": "fungicide" або "insecticide" або "acaricide" або "n_fertilizer" або "pk_fertilizer" або "complex_fertilizer" або "biostimulant" або "micronutrient" або "other",
  "n": 0,
  "p": 0,
  "k": 0,
  "composition": "Діюча речовина або склад (наприклад: дифеноконазол 250 г/л)",
  "doseL": "Норма дозування на 10 літрів води (наприклад: 2 мл / 10л води або 3-5 г / 10л)",
  "doseHa": "Норма дозування на гектар (наприклад: 0.2 л/га)",
  "scope": "Призначення / спектр дії / шкідники чи хвороби (наприклад: мілдью, оїдіум, сіра гниль)",
  "compatibility": "Сумісність з іншими препаратами або застереження",
  "wait": "Термін очікування до збору врожаю (наприклад: 30 днів)",
  "ph": "Оптимальний pH розчину (наприклад: 5.5 - 6.5)"
}
Усі текстові описи повертай українською мовою. Якщо параметр не знайдено на етикетці, залиш значення порожнім рядком або 0.
Не пиши жодних передмов чи додаткових пояснень, поверни лише чистий JSON.`;

            try {
                showToast('🔄 Надсилаю запит до AI... Зачекайте до 30 сек.', 'info');
                
                const jsonText = await fetchGeminiAPI(prompt, '', true, {
                    mimeType: mimeType,
                    data: base64Data
                });
                
                
                if (!jsonText) throw new Error("Не отримано відповіді від ШІ");
                
                let cleanedJsonText = jsonText.trim();
                if (cleanedJsonText.startsWith('```')) {
                    cleanedJsonText = cleanedJsonText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
                }
                
                const parsed = JSON.parse(cleanedJsonText);
                
                if (parsed.name) document.getElementById('add-prod-name').value = parsed.name;
                if (parsed.type) document.getElementById('add-prod-type').value = parsed.type;
                if (parsed.category) document.getElementById('add-prod-category').value = parsed.category;
                
                // NPK
                if (parsed.n) document.getElementById('add-prod-n').value = parsed.n;
                if (parsed.p) document.getElementById('add-prod-p').value = parsed.p;
                if (parsed.k) document.getElementById('add-prod-k').value = parsed.k;
                
                if (parsed.composition) document.getElementById('add-prod-composition').value = parsed.composition;
                if (parsed.doseL) document.getElementById('add-prod-dose-l').value = parsed.doseL;
                if (parsed.doseHa) document.getElementById('add-prod-dose-ha').value = parsed.doseHa;
                if (parsed.scope) document.getElementById('add-prod-scope').value = parsed.scope;
                if (parsed.compatibility) document.getElementById('add-prod-compatibility').value = parsed.compatibility;
                if (parsed.wait) document.getElementById('add-prod-wait').value = parsed.wait;
                if (parsed.ph) document.getElementById('add-prod-ph').value = parsed.ph;
                
                handleProductTypeChange();
                showToast('✨ Препарат «' + (parsed.name || '?') + '» успішно розпізнано! Перевірте дані та збережіть.', 'success');
                // Scroll the form to the bottom so the sticky Save button is visible
                setTimeout(() => {
                    const formEl = document.getElementById('form-add-product');
                    if (formEl) formEl.scrollTop = formEl.scrollHeight;
                }, 120);
            } catch (err) {
                console.error('[analyzeProductPhotoAI] ПОМИЛКА:', err);
                showToast('❌ Помилка розпізнавання: ' + err.message, 'danger');
                if (err.message.includes('limit: 0') || err.message.toLowerCase().includes('quota') || err.message.includes('429')) {
                    openQuotaHelpModal();
                }
            } finally {
                setProductPhotoLoading(false);
            }
        }

        function openAddProductModal(prefilledName = '', prefilledCategory = 'fungicide') {
            document.getElementById('form-add-product').reset();
            document.getElementById('add-prod-id').value = '';
            document.getElementById('product-modal-title').innerText = "➕ Новий препарат";
            setProductPhotoLoading(false);
            handleProductTypeChange();
            
            if (prefilledName) {
                document.getElementById('add-prod-name').value = prefilledName;
                document.getElementById('add-prod-category').value = prefilledCategory;
                handleProductCategoryChange();
                handleAddProductNameInput();
            }
            
            document.getElementById('modal-add-product').classList.remove('hidden');
        }

        function closeAddProductModal() {
            document.getElementById('modal-add-product').classList.add('hidden');
        }

        function handleProductTypeChange() {
            const type = document.getElementById('add-prod-type').value;
            const npkFields = document.getElementById('npk-fields');
            if (type === 'fertilizer') {
                npkFields.classList.remove('hidden');
            } else {
                npkFields.classList.add('hidden');
            }
        }

        function handleProductCategoryChange() {
            const category = document.getElementById('add-prod-category').value;
            const typeSelect = document.getElementById('add-prod-type');
            if (category.includes('fertilizer')) {
                typeSelect.value = 'fertilizer';
            } else if (['fungicide', 'insecticide', 'acaricide'].includes(category)) {
                typeSelect.value = 'ppp';
            } else if (category === 'biostimulant' || category === 'micronutrient') {
                typeSelect.value = 'supplement';
            }
            handleProductTypeChange();
        }

        function handleAddProductNameInput() {
            const nameInput = document.getElementById('add-prod-name');
            const name = nameInput.value.trim().toLowerCase();
            const badge = document.getElementById('add-prod-autocomplete-badge');
            
            if (!name || name.length < 2) {
                if (badge) badge.classList.add('hidden');
                return;
            }
            
            // Search defaults
            const match = defaultProductDB.find(p => p.name.toLowerCase().includes(name));
            if (match && badge) {
                badge.classList.remove('hidden');
                badge.innerText = `Знайдено: ${match.name} (Клацніть для автозаповнення)`;
                badge.style.cursor = 'pointer';
                badge.onclick = () => {
                    autofillProductFields(match);
                    badge.classList.add('hidden');
                };
            } else {
                if (badge) badge.classList.add('hidden');
            }
        }

        function autofillProductFields(p) {
            document.getElementById('add-prod-name').value = p.name;
            document.getElementById('add-prod-type').value = p.type;
            handleProductTypeChange();
            
            document.getElementById('add-prod-category').value = p.category;
            
            if (p.type === 'fertilizer' && p.composition.npk) {
                document.getElementById('add-prod-n').value = p.composition.npk.n || 0;
                document.getElementById('add-prod-p').value = p.composition.npk.p || 0;
                document.getElementById('add-prod-k').value = p.composition.npk.k || 0;
            }
            
            let comp = '';
            if (p.composition.activeIngredients && p.composition.activeIngredients.length > 0) {
                comp = p.composition.activeIngredients.map(ai => `${ai.name} ${ai.percent}%`).join(', ');
            } else if (p.composition.npk) {
                comp = `NPK ${p.composition.npk.n}-${p.composition.npk.p}-${p.composition.npk.k}`;
            }
            document.getElementById('add-prod-composition').value = comp;
            document.getElementById('add-prod-dose-l').value = p.dosage.perLiter || '';
            document.getElementById('add-prod-dose-ha').value = p.dosage.perHectare || '';
            document.getElementById('add-prod-scope').value = p.applicationScope || '';
            document.getElementById('add-prod-compatibility').value = p.compatibility.notes || '';
            document.getElementById('add-prod-wait').value = p.techSpecs.waitPeriod || '';
            document.getElementById('add-prod-ph').value = p.techSpecs.phOptimal || '';
            
            showToast(`Препарат «${p.name}» автозаповнено.`, 'success');
        }

        async function fetchProductInfoAI() {
            const name = document.getElementById('add-prod-name').value.trim();
            if (!name) {
                showToast('Введіть назву препарату для AI-запиту.', 'warning');
                return;
            }
            
            const btn = document.getElementById('btn-prod-ai-fill');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>⏳ Аналіз...</span>';
            btn.disabled = true;
            
            try {
                const systemPrompt = `Ти — експерт-агроном. Поверни JSON з інформацією про препарат для виноградарства за його назвою.
Формат відповіді STRICT JSON:
{
    "name": "Назва препарату (наприклад, Хорус 75 WG)",
    "category": "n_fertilizer, pk_fertilizer, complex_fertilizer, fungicide, insecticide, acaricide, biostimulant, micronutrient або other",
    "type": "fertilizer, ppp або supplement",
    "composition": {
        "activeIngredients": [ {"name": "назва діючої речовини", "percent": 75} ],
        "npk": {"n": 0, "p": 0, "k": 0}
    },
    "dosage": {
        "perLiter": "0.3 г/л",
        "perHectare": "0.6 кг/га"
    },
    "applicationScope": "Спектр дії (наприклад, Оїдіум, сіра гниль)",
    "compatibility": {
        "notes": "Особливості сумісності"
    },
    "techSpecs": {
        "waitPeriod": "14 днів",
        "maxTreatments": 3,
        "tempRange": "12-25°C",
        "phOptimal": "5.5-6.5"
    }
}`;
                const prompt = `Препарат: "${name}". Знайди його склад, діючі речовини, призначення, дозування для винограду та сумісність. Поверни строго JSON.`;
                const response = await fetchGeminiAPI(prompt, systemPrompt, true);
                
                // Clean markdown wrappers if any
                let cleanJsonStr = response.trim();
                if (cleanJsonStr.startsWith('```')) {
                    cleanJsonStr = cleanJsonStr.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
                }
                
                const parsed = JSON.parse(cleanJsonStr);
                
                // Prefill fields
                document.getElementById('add-prod-name').value = parsed.name || name;
                document.getElementById('add-prod-type').value = parsed.type || 'ppp';
                handleProductTypeChange();
                document.getElementById('add-prod-category').value = parsed.category || 'fungicide';
                
                if (parsed.type === 'fertilizer' && parsed.composition?.npk) {
                    document.getElementById('add-prod-n').value = parsed.composition.npk.n || 0;
                    document.getElementById('add-prod-p').value = parsed.composition.npk.p || 0;
                    document.getElementById('add-prod-k').value = parsed.composition.npk.k || 0;
                }
                
                let comp = '';
                if (parsed.composition?.activeIngredients && parsed.composition.activeIngredients.length > 0) {
                    comp = parsed.composition.activeIngredients.map(ai => `${ai.name} ${ai.percent}%`).join(', ');
                } else if (parsed.composition?.npk) {
                    comp = `NPK ${parsed.composition.npk.n}-${parsed.composition.npk.p}-${parsed.composition.npk.k}`;
                }
                
                document.getElementById('add-prod-composition').value = comp;
                document.getElementById('add-prod-dose-l').value = parsed.dosage?.perLiter || '';
                document.getElementById('add-prod-dose-ha').value = parsed.dosage?.perHectare || '';
                document.getElementById('add-prod-scope').value = parsed.applicationScope || '';
                document.getElementById('add-prod-compatibility').value = parsed.compatibility?.notes || '';
                document.getElementById('add-prod-wait').value = parsed.techSpecs?.waitPeriod || '';
                document.getElementById('add-prod-ph').value = parsed.techSpecs?.phOptimal || '';
                
                showToast(`Препарат «${parsed.name}» завантажено через AI!`, 'success');
            } catch (err) {
                console.error(err);
                showToast(`Помилка AI: ${err.message}`, 'error');
                if (err.message.includes('limit: 0') || err.message.toLowerCase().includes('quota') || err.message.includes('429')) {
                    openQuotaHelpModal();
                }
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        function saveCustomProduct(event) {
            event.preventDefault();
            const id = document.getElementById('add-prod-id').value;
            const name = document.getElementById('add-prod-name').value.trim();
            const type = document.getElementById('add-prod-type').value;
            const category = document.getElementById('add-prod-category').value;
            const compositionInput = document.getElementById('add-prod-composition').value.trim();
            const doseL = document.getElementById('add-prod-dose-l').value.trim();
            const doseHa = document.getElementById('add-prod-dose-ha').value.trim();
            const scope = document.getElementById('add-prod-scope').value.trim();
            const compatibility = document.getElementById('add-prod-compatibility').value.trim();
            const waitPeriod = document.getElementById('add-prod-wait').value.trim();
            const phOptimal = document.getElementById('add-prod-ph').value.trim();
            
            if (!name) {
                showToast('Вкажіть назву препарату.', 'warning');
                return;
            }
            
            // Build NPK and active ingredients from user input
            let npk = null;
            let activeIngredients = [];
            
            const targets = [];
            const scopeLower = scope.toLowerCase();
            if (scopeLower.includes('оїдіум') || scopeLower.includes('оідіум')) targets.push('оїдіум');
            if (scopeLower.includes('мілдью')) targets.push('мілдью');
            if (scopeLower.includes('сір') || scopeLower.includes('гниль') || scopeLower.includes('ботритис')) targets.push('сіра гниль');
            if (scopeLower.includes('кліщ')) targets.push('кліщі');
            if (scopeLower.includes('листовійк')) targets.push('листовійка');
            if (scopeLower.includes('азот') || scopeLower.includes('селітра') || scopeLower.includes('карбамід')) targets.push('азотне живлення');
            if (scopeLower.includes('калій') || scopeLower.includes('монофосфат')) targets.push('калійне живлення');
            if (scopeLower.includes('фосфор') || scopeLower.includes('суперфосфат')) targets.push('фосфорне живлення');
            if (scopeLower.includes('корен')) targets.push('ріст коренів');
            if (scopeLower.includes('вершинн')) targets.push('вершинна гниль');
            if (scopeLower.includes('опік')) targets.push('опік');
            if (scopeLower.includes('замороз')) targets.push('заморозки');
            if (scopeLower.includes('посух')) targets.push('посуха');
            if (scopeLower.includes('хлороз')) targets.push('хлороз');
            
            if (type === 'fertilizer') {
                const n = parseInt(document.getElementById('add-prod-n').value) || 0;
                const p = parseInt(document.getElementById('add-prod-p').value) || 0;
                const k = parseInt(document.getElementById('add-prod-k').value) || 0;
                npk = { n, p, k };
            } else {
                // Parse ingredients like "Діметоморф 9%, Манкоцеб 60%"
                if (compositionInput) {
                    const parts = compositionInput.split(',');
                    parts.forEach(part => {
                        const match = part.match(/(.*?)\s*(\d+)\s*%/);
                        if (match) {
                            activeIngredients.push({ name: match[1].trim(), percent: parseInt(match[2]) });
                        } else {
                            activeIngredients.push({ name: part.trim(), percent: 100 });
                        }
                    });
                }
            }
            
            const product = {
                id: id || `prod-${Date.now()}`,
                name: name,
                type: type,
                category: category,
                composition: {
                    activeIngredients: activeIngredients,
                    npk: npk,
                    micronutrients: {}
                },
                targets: targets,
                dosage: {
                    perLiter: doseL,
                    perHectare: doseHa,
                    perBush: type === 'fertilizer' ? '20-30 г' : null
                },
                applicationScope: scope,
                compatibility: {
                    compatible: [],
                    incompatible: [],
                    notes: compatibility
                },
                techSpecs: {
                    waitPeriod: waitPeriod,
                    maxTreatments: 3,
                    tempRange: "10-25°C",
                    phOptimal: phOptimal
                },
                isCustom: true,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            if (id) {
                // Update
                const idx = productDB.findIndex(p => p.id === id);
                if (idx > -1) {
                    productDB[idx] = product;
                    showToast(`Препарат «${name}» оновлено.`, 'success');
                }
            } else {
                // Add
                productDB.push(product);
                showToast(`Препарат «${name}» додано в базу.`, 'success');
            }
            
            saveProductDB();
            closeAddProductModal();
            renderProductGrid();
            
            // Auto select newly saved product
            selectProduct(product.id);
            
            // Sync with NPK calculator if it's a fertilizer
            if (type === 'fertilizer' || category.includes('fertilizer')) {
                initDryFertilizers();
                if (typeof renderNPKFertilizersList === 'function') renderNPKFertilizersList();
                if (typeof runNPKCalculations === 'function') runNPKCalculations();
            }
        }

        function editProduct(id) {
            const p = productDB.find(prod => prod.id === id);
            if (!p) return;
            
            document.getElementById('add-prod-id').value = p.id;
            document.getElementById('add-prod-name').value = p.name;
            document.getElementById('add-prod-type').value = p.type;
            handleProductTypeChange();
            
            document.getElementById('add-prod-category').value = p.category;
            
            if (p.type === 'fertilizer' && p.composition && p.composition.npk) {
                document.getElementById('add-prod-n').value = p.composition.npk.n || 0;
                document.getElementById('add-prod-p').value = p.composition.npk.p || 0;
                document.getElementById('add-prod-k').value = p.composition.npk.k || 0;
            }
            
            let comp = '';
            if (p.composition) {
                if (p.composition.activeIngredients && p.composition.activeIngredients.length > 0) {
                    comp = p.composition.activeIngredients.map(ai => `${ai.name} ${ai.percent}%`).join(', ');
                } else if (p.composition.npk) {
                    comp = `NPK ${p.composition.npk.n || 0}-${p.composition.npk.p || 0}-${p.composition.npk.k || 0}`;
                }
            }
            
            document.getElementById('add-prod-composition').value = comp;
            document.getElementById('add-prod-dose-l').value = p.dosage.perLiter || '';
            document.getElementById('add-prod-dose-ha').value = p.dosage.perHectare || '';
            document.getElementById('add-prod-scope').value = p.applicationScope || '';
            document.getElementById('add-prod-compatibility').value = p.compatibility.notes || '';
            document.getElementById('add-prod-wait').value = p.techSpecs.waitPeriod || '';
            document.getElementById('add-prod-ph').value = p.techSpecs.phOptimal || '';
            
            document.getElementById('product-modal-title').innerText = "✏️ Редагувати препарат";
            document.getElementById('modal-add-product').classList.remove('hidden');
        }

        function deleteProduct(id) {
            const p = productDB.find(prod => prod.id === id);
            if (!p) return;
            
            const isDefaultOverride = defaultProductDB.some(d => d.id === id);
            if (!p.isCustom && !isDefaultOverride) {
                showToast('Системні препарати не можна видаляти.', 'error');
                return;
            }
            
            const confirmMsg = isDefaultOverride 
                ? `Ви впевнені, що хочете скинути налаштування препарату «${p.name}» до початкових?`
                : `Ви впевнені, що хочете видалити препарат «${p.name}» з бази?`;
                
            if (confirm(confirmMsg)) {
                if (isDefaultOverride) {
                    // Restore from defaultProductDB
                    const original = defaultProductDB.find(d => d.id === id);
                    const idx = productDB.findIndex(prod => prod.id === id);
                    if (idx > -1 && original) {
                        productDB[idx] = JSON.parse(JSON.stringify(original));
                    }
                    showToast(`Налаштування препарату «${p.name}» скинуто до початкових.`, 'success');
                    saveProductDB();
                    renderProductGrid();
                    selectProduct(id);
                } else {
                    // Delete completely
                    productDB = productDB.filter(prod => prod.id !== id);
                    
                    // Also clean up from viticulture-custom-dry-fert to prevent re-migration
                    const oldCustomFert = localStorage.getItem('viticulture-custom-dry-fert');
                    if (oldCustomFert) {
                        try {
                            let customList = JSON.parse(oldCustomFert);
                            customList = customList.filter(f => f.name.toLowerCase() !== p.name.toLowerCase());
                            localStorage.setItem('viticulture-custom-dry-fert', JSON.stringify(customList));
                        } catch(e) { console.error("Error cleaning custom dry fert list on deletion", e); }
                    }

                    showToast(`Препарат «${p.name}» видалено з бази.`, 'info');
                    saveProductDB();
                    renderProductGrid();
                    activeProduct = null;
                    document.getElementById('prod-details-panel').innerHTML = `
                        <div class="text-center text-stone-300 py-32">
                            <span class="text-7xl block mb-4 opacity-20">🗄</span>
                            <p class="font-black text-sm uppercase tracking-widest opacity-40">Виберіть препарат зі списку</p>
                        </div>
                    `;
                }
                
                // Sync with NPK calculator if it's a fertilizer
                if (p.type === 'fertilizer' || p.category.includes('fertilizer')) {
                    initDryFertilizers();
                }
            }
        }

        // Window Onload initialization
        window.onload = () => {
            initProductDB();
            // Load SAT History
            const cachedSAT = localStorage.getItem('satHistory');
            if (cachedSAT) {
                try {
                    satHistory = JSON.parse(cachedSAT);
                    recalculateSAT();
                } catch(e) { console.error(e); }
            }
            
            // Load Phase Checklist
            const cachedChecklists = localStorage.getItem('phaseChecklists');
            if (cachedChecklists) {
                phaseChecklists = safeParse(cachedChecklists, phaseChecklists);
            }

            // Load Phase Checklist Dates
            const cachedChecklistDates = localStorage.getItem('phaseChecklistDates');
            if (cachedChecklistDates) {
                phaseChecklistDates = safeParse(cachedChecklistDates, phaseChecklistDates);
            }

            // Load Phase Nutrition Checklist
            const cachedNutritionChecklists = localStorage.getItem('phaseNutritionChecklists');
            if (cachedNutritionChecklists) {
                phaseNutritionChecklists = safeParse(cachedNutritionChecklists, phaseNutritionChecklists);
            }

            // Load Phase Nutrition Checklist Dates
            const cachedNutritionChecklistDates = localStorage.getItem('phaseNutritionChecklistDates');
            if (cachedNutritionChecklistDates) {
                phaseNutritionChecklistDates = safeParse(cachedNutritionChecklistDates, phaseNutritionChecklistDates);
            }

            // Load Todo List
            const cachedTodo = localStorage.getItem('vineyardTodo');
            if (cachedTodo) {
                todoList = safeParse(cachedTodo, todoList);
            }

            // Load Journal Collapse State
            const cachedCollapse = localStorage.getItem('isJournalCollapsed');
            if (cachedCollapse) {
                isJournalCollapsed = safeParse(cachedCollapse, isJournalCollapsed);
                applyJournalCollapseState();
            }
            
            // Load weather lat/lon from localStorage
            const cachedLat = localStorage.getItem('weather-lat');
            const cachedLon = localStorage.getItem('weather-lon');
            if (cachedLat) document.getElementById('weather-lat').value = cachedLat;
            if (cachedLon) document.getElementById('weather-lon').value = cachedLon;
            
            // Add listeners to save changes
            document.getElementById('weather-lat').addEventListener('change', (e) => {
                localStorage.setItem('weather-lat', e.target.value);
            });
            document.getElementById('weather-lon').addEventListener('change', (e) => {
                localStorage.setItem('weather-lon', e.target.value);
            });
            
            const keyInput = document.getElementById('gemini-key-input');
            if (keyInput) {
                const savedKey = localStorage.getItem('viticulture-gemini-key');
                if (savedKey) {
                    keyInput.value = savedKey;
                }
                keyInput.addEventListener('input', (e) => {
                    const val = e.target.value.trim().replace(/^["']|["']$/g, '');
                    if (val.startsWith('AIzaSy') || val.startsWith('AQ.')) {
                        if (val.length >= 35) {
                            localStorage.setItem('viticulture-gemini-key', val);
                            checkGeminiStatus();
                        }
                    }
                });
            }
            
            // Load Gemini API Key from URL — supports both ?query and #fragment forms.
            // Query param is primary because messaging apps (iMessage, WhatsApp etc.) strip fragments.
            // Key is erased from the address bar immediately so it never stays in browser history.
            // IMPORTANT: URLSearchParams.get() already percent-decodes values, so we must NOT call
            // decodeURIComponent() again — doing so crashes with URIError on keys that contain %
            // (e.g. some AQ.-format Google keys), which would silently abort the entire onload handler.
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                // URLSearchParams.get() returns already-decoded value (or null)
                const rawKeyParam = urlParams.get('gemini_key') || hashParams.get('gemini_key');
                if (rawKeyParam) {
                    const cleanParam = rawKeyParam.trim().replace(/^["']|["']$/g, '');
                    if (cleanParam) {
                        localStorage.setItem('viticulture-gemini-key', cleanParam);
                        checkGeminiStatus();
                        // Show a prominent banner — a brief toast is easy to miss
                        const maskedKey = cleanParam.slice(0, 8) + '...' + cleanParam.slice(-4);
                        const banner = document.createElement('div');
                        banner.id = 'ai-key-received-banner';
                        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(90deg,#059669,#047857);color:#fff;padding:14px 20px;text-align:center;font-family:inherit;font-size:14px;font-weight:800;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
                        banner.innerHTML = '🟢 AI-ключ отримано (' + maskedKey + ')! Асистент активовано — натисніть, щоб закрити.';
                        banner.onclick = () => banner.remove();
                        document.body.prepend(banner);
                        setTimeout(() => { if (banner.parentNode) banner.remove(); }, 12000);
                    } else {
                        console.warn('[key-from-url] Key param was present but empty after cleaning.');
                    }
                    // Always strip the key from the URL regardless of whether it was valid
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (e) {
                // Never let URL key parsing crash the rest of the app init
                console.error('[key-from-url] Failed to process gemini_key param:', e);
            }
            
            // Load saved candidates
            const cachedCandidates = localStorage.getItem('viticulture-ai-candidates');
            if (cachedCandidates) {
                try {
                    aiCandidates = JSON.parse(cachedCandidates);
                } catch(e) { console.error(e); }
            }
            
            // Load Forecast Daily Temps
            const cachedForecast = localStorage.getItem('forecastDailyTemps');
            if (cachedForecast) {
                forecastDailyTemps = safeParse(cachedForecast, forecastDailyTemps);
            }

            // Load active thermal mode
            const cachedMode = localStorage.getItem('viticulture-thermal-mode');
            if (cachedMode) {
                thermalMode = cachedMode;
            }
            
            // Setup default dates to today
            document.getElementById('sat-date').valueAsDate = new Date();
            document.getElementById('todo-due-date').valueAsDate = new Date();
            
            // Load Phase swaps
            try {
                const savedSwaps = localStorage.getItem('viticulture-phase-swaps');
                if (savedSwaps) {
                    phaseSwaps = JSON.parse(savedSwaps);
                }
            } catch(e) { console.error("Error loading phase swaps", e); }
            
            // Render components
            selectStep(getRecommendedPhaseId(totalSAT));
            initEncyclopediaData();
            calculateCounters();
            renderVarietiesList();
            setThermalMode(thermalMode); // Restores active mode САТ/СЕТ and displays
            loadCalculatorsState();
            calculateGA3();
            calculateDiseaseRisk();
            updateFrostWarning();
            renderTodos();
            initSatChecker();
            checkGeminiStatus();
            renderAICandidates();
            
            // Load AI chat history
            const cachedChat = localStorage.getItem('viticulture-ai-chat-history');
            if (cachedChat) {
                try {
                    aiChatHistory = JSON.parse(cachedChat);
                    renderAgroChatHistory();
                } catch(e) { console.error(e); }
            }
            
            // Init cumulative temperature chart
            setTimeout(initChart, 200);

            // Dashboard як стартовий екран (Sprint 2)
            renderDashboard();
            switchTab('overview');

            // Replace all emoji text nodes with SVG images (Twemoji).
            // Fixes "small squares" on old Android / Windows devices that lack updated emoji fonts.
            if (window.twemoji) {
                twemoji.parse(document.body, {
                    folder: 'svg',
                    ext: '.svg',
                    base: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/'
                });
            }

            // Lucide: рендер SVG-іконок навігації (data-lucide) — Redesign Sprint 1
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        };
    
