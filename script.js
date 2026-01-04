// ===== Programming cursor + Matrix trail =====

const cursorEl = document.querySelector('.code-cursor');
const cursorIcon = document.querySelector('.code-cursor-icon');

// На тач-устройствах курсор и матрица не нужны
const isTouch = matchMedia('(pointer: coarse)').matches;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

if (isTouch) {
    if (cursorEl) cursorEl.style.display = 'none';
    const c = document.getElementById('matrixTrail');
    if (c) c.style.display = 'none';
} else {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorEl) {
            cursorEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }
    });

    // Реакция на клики (лёгкий "пульс")
    window.addEventListener('mousedown', () => {
        if (!cursorIcon) return;
        cursorIcon.style.transform = 'scale(0.92)';
    });
    window.addEventListener('mouseup', () => {
        if (!cursorIcon) return;
        cursorIcon.style.transform = 'scale(1)';
    });
}

// ===== Matrix trail canvas =====

const canvas = document.getElementById('matrixTrail');
let ctx = null;

if (!isTouch && canvas) {
    ctx = canvas.getContext('2d', { alpha: true });

    function resizeCanvas() {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789abcdefghijklmnopqrstuvwxyz<>/[]{};=+-_".split("");
    const particles = [];
    const MAX_PARTICLES = 240;

    function spawnParticles(x, y) {
        // плотность следа
        const count = 6;

        for (let i = 0; i < count; i++) {
            if (particles.length > MAX_PARTICLES) particles.shift();

            particles.push({
                x: x + (Math.random() * 14 - 7),
                y: y + (Math.random() * 14 - 7),
                vy: 0.25 + Math.random() * 0.9,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.035,
                char: glyphs[(Math.random() * glyphs.length) | 0],
                size: 12 + (Math.random() * 7),
                glow: 0.3 + Math.random() * 0.55
            });
        }
    }

    function tick() {
        // Слой затухания (делает "шлейф")
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        spawnParticles(mouseX, mouseY);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const alpha = Math.max(0, p.life);

            ctx.font = `${p.size}px ui-monospace, Menlo, Consolas, monospace`;
            ctx.shadowColor = `rgba(0,255,120,${p.glow * alpha})`;
            ctx.shadowBlur = 10;

            ctx.fillStyle = `rgba(80,255,140,${0.78 * alpha})`;
            ctx.fillText(p.char, p.x, p.y);
        }

        requestAnimationFrame(tick);
    }

    // Если reduce motion — не запускаем матрицу
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) tick();
    else canvas.style.display = 'none';
}

// ===== Плавный скролл по навигации и кнопке "Связаться" =====

function smoothScrollTo(targetSelector) {
    const el = document.querySelector(targetSelector);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollTo(href);
    });
});

const floatButton = document.querySelector('.floating-contact');
if (floatButton) {
    floatButton.addEventListener('click', () => {
        const target = floatButton.dataset.scroll || '#contact';
        smoothScrollTo(target);
    });
}

// ===== Мультиязычность =====

const translations = {
    ru: {
        text: {
            brand_name: "Tushkanchik",
            nav_games: "Игры",
            nav_social: "Соц-сети",
            nav_infra: "Сервера и железо",
            nav_contact: "Связаться",

            hero_title: "Привет, я Tushkanchik",
            hero_subtitle: "Делаю сервера, ботов и автоматизации, которые не падают ночью и экономят кучу времени.",
            hero_chip1: "Minecraft-инфраструктура",
            hero_chip2: "Telegram / Discord боты",
            hero_chip3: "Автоматизация процессов",
            hero_bio: "Работаю с Linux-серверами, Minecraft-сетями, ботами и железом. Люблю, когда всё собрано аккуратно, прозрачно и без магии: понятные конфиги, мониторинг и резервные копии.",

            games_title: "Игры",
            games_subtitle: "Minecraft-экосистема от сервера до ботов.",
            mc_title: "Minecraft",
            mc_intro: "Полный цикл работы с Minecraft-проектами: от чистого сервера до продвинутых сборок и интеграций.",

            social_title: "Соц-сети",
            social_subtitle: "Боты, автоматизация и удобные сценарии общения.",
            tg_title: "Telegram",
            tg_text: "Боты на любой вкус и цвет: автоматизация, модерация, игры, системы регистрации и многое другое.",
            tg_link: "Написать в Telegram",

            ds_title: "Discord",
            ds_text: "Игровые боты и инструменты, которые упрощают жизнь админам: автомодерация, модерация, сервисные роли.",
            ds_link: "Discord-сервер",

            waig_title: "WhatsApp & Instagram",
            waig_text: "Автоматизация действий, страничные и бизнес-боты, интегрированные веб-сайты и приложения.",
            waig_link: "Связаться через WhatsApp / Instagram",

            vk_title: "ВКонтакте",
            vk_text: "Страничные и публичные боты, автоматизация действий, мини-игры, модерация и интеграции с другими системами.",
            vk_link: "Страница ВК",

            infra_title: "Сервера и железо",
            infra_subtitle: "Linux-сервера, автоматизация и работа с физическими ПК.",

            linux_title: "Linux-сервера",
            linux_text: "Продуманная конфигурация игровых и сервисных серверов на Ubuntu / Debian.",

            auto_title: "Автоматизация",
            auto_text: "Скрипты и сервисы, которые снимают рутину как на Windows, так и на Linux.",

            hw_title: "Физическое железо",
            hw_text: "Работа с реальными ПК, сборками и обслуживанием.",

            contact_title: "Связаться",
            contact_subtitle: "Опишите задачу — придумаем удобное решение.",
            contact_name_label: "Имя",
            contact_email_label: "Email",
            contact_msg_label: "Сообщение",
            contact_btn: "Отправить",

            contact_socials_title: "Быстрые контакты",
            contact_socials_text: "Проще всего написать в Telegram или Discord — отвечаю там чаще всего.",
            contact_tg: "Telegram",
            contact_ds: "Discord",
            contact_vk: "VK",
            contact_wa: "WhatsApp",
            contact_ig: "Instagram",

            footer_text: "© 2025 Tushkanchik. Можно делиться, но лучше спросить.",
            float_contact: "Связаться"
        },
        lists: {
            mc_list: [
                "Самописные плагины с нуля (Java / Paper / Spigot).",
                "Полная настройка сервера: конфиги, права, анти-дюп, защита.",
                "Создание и сборка готовых проектов под нужды сервера.",
                "Работа с любыми популярными плагинами и их тонкая настройка.",
                "Постоянная поддержка и сопровождение проекта.",
                "Интеграции с Telegram / Discord (онлайн, команды, уведомления).",
                "Настройка бэкапов, авто-рестартов и мониторинга TPS.",
                "Оптимизация производительности для онлайна от маленьких до больших серверов."
            ],
            tg_list: [
                "Модерационные боты: анти-спам, анти-флуд, фильтры.",
                "Анкеты, регистрации и верификации участников.",
                "Игровые ивенты, мини-игры, рейтинги.",
                "Уведомления из Minecraft / других систем прямо в Telegram.",
                "Интеграции с панелями управления и базами данных."
            ],
            ds_list: [
                "Игровые боты с командами, ролями и уровнями.",
                "Автомодерация, логирование действий и гибкая система прав.",
                "Работа с голосовыми каналами: автосоздание, автоочистка, роли.",
                "Интеграции с Minecraft, Telegram и другими платформами.",
                "Хорошее понимание инфраструктуры Discord для сложных сценариев."
            ],
            waig_list: [
                "Бизнес-боты для быстрых ответов и обработки заявок.",
                "Многошаговые сценарии с меню и развилками.",
                "Интеграции с лендингами и мини-приложениями.",
                "Уведомления и напоминания клиентам."
            ],
            vk_list: [
                "Боты для личных страниц и пабликов.",
                "Автоматизация ответов, заявок и заказов.",
                "Игровые механики и мини-игры в сообщениях.",
                "Модерация и фильтрация сообщений.",
                "Интеграции с внешними сервисами и играми."
            ],
            linux_list: [
                "Установка и настройка игровых серверов (Minecraft и др.).",
                "Конфигурация сервисов: Nginx, Docker, базы данных, мониторинг.",
                "Работа с systemd, логами и ротацией (journalctl, logrotate).",
                "Настройка автоматических бэкапов и откатов.",
                "Базовое hardening-настроек и обновления без простоя."
            ],
            auto_list: [
                "Скрипты на Python / Bash / PowerShell под конкретные задачи.",
                "Автоматические рестарты сервисов по расписанию или при сбоях.",
                "Сбор логов и отчётов в удобном формате.",
                "Небольшие утилиты для развёртывания и обновления проектов.",
                "Автоматизация рутинных действий на рабочих станциях Windows и Linux."
            ],
            hw_list: [
                "Полная чистка системных блоков и ноутбуков от пыли.",
                "Диагностика комплектующих и поиск причин нестабильности.",
                "Сборка ПК с нуля под задачи (игры, стрим, сервера).",
                "Замена и апгрейд комплектующих (CPU, GPU, RAM, SSD, БП и т.д.).",
                "Консультации по подбору железа и оптимальной конфигурации."
            ]
        }
    },

    en: {
        text: {
            brand_name: "Tushkanchik",
            nav_games: "Games",
            nav_social: "Social",
            nav_infra: "Servers & Hardware",
            nav_contact: "Contact",

            hero_title: "Hi, I'm Tushkanchik",
            hero_subtitle: "I build servers, bots and automations that stay online at night and save a lot of time.",
            hero_chip1: "Minecraft infrastructure",
            hero_chip2: "Telegram / Discord bots",
            hero_chip3: "Process automation",
            hero_bio: "I work with Linux servers, Minecraft networks, bots and hardware. I like when everything is clean and transparent: clear configs, monitoring and backups.",

            games_title: "Games",
            games_subtitle: "Minecraft ecosystem from server to bots.",
            mc_title: "Minecraft",
            mc_intro: "Full cycle of Minecraft projects: from a clean server to advanced modpacks and integrations.",

            social_title: "Social",
            social_subtitle: "Bots, automation and smooth communication flows.",
            tg_title: "Telegram",
            tg_text: "Bots for any taste: automation, moderation, games, registration flows and much more.",
            tg_link: "Message on Telegram",

            ds_title: "Discord",
            ds_text: "Game bots and tools that make admins’ life easier: automoderation, moderation and service roles.",
            ds_link: "Discord server",

            waig_title: "WhatsApp & Instagram",
            waig_text: "Automation, page/business bots and integrated websites or mini-apps.",
            waig_link: "Contact via WhatsApp / Instagram",

            vk_title: "VK",
            vk_text: "Page and group bots, automation, mini-games, moderation and integrations with other systems.",
            vk_link: "VK page",

            infra_title: "Servers & Hardware",
            infra_subtitle: "Linux servers, automation and real-world PCs.",

            linux_title: "Linux servers",
            linux_text: "Thought-out configuration of game and service servers on Ubuntu / Debian.",

            auto_title: "Automation",
            auto_text: "Scripts and services that remove routine on both Windows and Linux.",

            hw_title: "Hardware",
            hw_text: "Real PCs: building, cleaning and maintenance.",

            contact_title: "Contact",
            contact_subtitle: "Describe your task — we’ll find a clean solution.",
            contact_name_label: "Name",
            contact_email_label: "Email",
            contact_msg_label: "Message",
            contact_btn: "Send",

            contact_socials_title: "Quick contacts",
            contact_socials_text: "The fastest way is Telegram or Discord — I respond there most often.",
            contact_tg: "Telegram",
            contact_ds: "Discord",
            contact_vk: "VK",
            contact_wa: "WhatsApp",
            contact_ig: "Instagram",

            footer_text: "© 2025 Tushkanchik. Feel free to share, but better ask first.",
            float_contact: "Contact"
        },
        lists: {
            mc_list: [
                "Custom plugins from scratch (Java / Paper / Spigot).",
                "Full server setup: configs, permissions, anti-dupe, protection.",
                "Creating and assembling complete projects tailored to your server.",
                "Working with any popular plugins and fine-tuning them.",
                "Ongoing support and maintenance for the project.",
                "Integrations with Telegram / Discord (online status, commands, alerts).",
                "Backup, auto-restart and TPS monitoring setup.",
                "Performance optimization for both small and high-online servers."
            ],
            tg_list: [
                "Moderation bots: anti-spam, anti-flood, filters.",
                "Onboarding forms, registration and user verification.",
                "Game events, mini-games, leaderboards.",
                "Alerts from Minecraft / other systems straight into Telegram.",
                "Integrations with admin panels and databases."
            ],
            ds_list: [
                "Game bots with commands, roles and leveling.",
                "Automoderation, action logging and flexible permissions.",
                "Voice channel management: auto-create, auto-cleanup, role-based.",
                "Integrations with Minecraft, Telegram and other platforms.",
                "Good understanding of Discord infrastructure for complex scenarios."
            ],
            waig_list: [
                "Business bots for fast replies and lead processing.",
                "Multi-step flows with menus and branches.",
                "Integrations with landing pages and mini-apps.",
                "Notifications and reminders for clients."
            ],
            vk_list: [
                "Bots for personal pages and communities.",
                "Automation of replies, requests and orders.",
                "Game mechanics and mini-games in messages.",
                "Moderation and message filtering.",
                "Integrations with external services and games."
            ],
            linux_list: [
                "Installing and configuring game servers (Minecraft and more).",
                "Configuring services: Nginx, Docker, databases, monitoring.",
                "Working with systemd, logs and rotation (journalctl, logrotate).",
                "Automated backups and rollback strategies.",
                "Basic hardening and smooth system updates."
            ],
            auto_list: [
                "Python / Bash / PowerShell scripts for concrete tasks.",
                "Automatic service restarts by schedule or on failures.",
                "Log collection and reporting in a convenient format.",
                "Small utilities for project deployment and updates.",
                "Automation of routine actions on Windows and Linux workstations."
            ],
            hw_list: [
                "Deep cleaning of desktops and laptops.",
                "Diagnostics of components and stability issues.",
                "Custom PC builds for gaming, streaming or servers.",
                "Parts replacement and upgrades (CPU, GPU, RAM, SSD, PSU, etc.).",
                "Consulting on hardware choice and optimal configs."
            ]
        }
    },

    he: {
        text: {
            brand_name: "Tushkanchik",
            nav_games: "משחקים",
            nav_social: "רשתות",
            nav_infra: "שרתים וחומרה",
            nav_contact: "יצירת קשר",

            hero_title: "היי, אני Tushkanchik",
            hero_subtitle: "מקימה שרתים, בוטים ואוטומציות שעובדים בלילה וחוסכים המון זמן.",
            hero_chip1: "תשתית Minecraft",
            hero_chip2: "בוטים ל-Telegram / Discord",
            hero_chip3: "אוטומציה של תהליכים",
            hero_bio: "עובד עם שרתי Linux, רשתות Minecraft, בוטים וחומרה. אוהב שדברים מסודרים ונקיים: קונפיגים ברורים, ניטור וגיבויים.",

            games_title: "משחקים",
            games_subtitle: "אקוסיסטמת Minecraft – מהשרת עד לבוטים.",
            mc_title: "Minecraft",
            mc_intro: "מחזור מלא של פרויקטי Minecraft: משרת נקי עד חבילות מתקדמות ואינטגרציות.",

            social_title: "רשתות חברתיות",
            social_subtitle: "בוטים, אוטומציה וזרימה נוחה של שיחות.",
            tg_title: "Telegram",
            tg_text: "בוטים בכל סגנון: אוטומציה, מודרציה, משחקים, רישום משתמשים ועוד.",
            tg_link: "לכתוב ב-Telegram",

            ds_title: "Discord",
            ds_text: "בוטים למשחקים וכלים שמקלים על אדמינים: אוטומודרציה, מודרציה ותפקידים שירותיים.",
            ds_link: "שרת Discord",

            waig_title: "WhatsApp & Instagram",
            waig_text: "אוטומציה, בוטים עסקיים / דפי אינסטה, אתרים ואפליקציות משולבים.",
            waig_link: "יצירת קשר דרך WhatsApp / Instagram",

            vk_title: "VK",
            vk_text: "בוטים לעמודים ולקבוצות, אוטומציה, משחקונים, מודרציה ואינטגרציות.",
            vk_link: "עמוד VK",

            infra_title: "שרתים וחומרה",
            infra_subtitle: "שרתי Linux, אוטומציה ומחשבים פיזיים.",

            linux_title: "שרתי Linux",
            linux_text: "הגדרה חכמה של שרתי משחק ושירות על Ubuntu / Debian.",

            auto_title: "אוטומציה",
            auto_text: "סקריפטים ושירותים שמורידים את השגרה גם ב-Windows וגם ב-Linux.",

            hw_title: "חומרה פיזית",
            hw_text: "הרכבה, ניקוי ותחזוקה של מחשבים אמיתיים.",

            contact_title: "יצירת קשר",
            contact_subtitle: "תתארו את הצורך – נמצא פתרון ברור ונוח.",
            contact_name_label: "שם",
            contact_email_label: "אימייל",
            contact_msg_label: "הודעה",
            contact_btn: "שליחה",

            contact_socials_title: "קשר מהיר",
            contact_socials_text: "הכי נוח לכתוב ב-Telegram או ב-Discord – שם אני עונה הכי הרבה.",
            contact_tg: "Telegram",
            contact_ds: "Discord",
            contact_vk: "VK",
            contact_wa: "WhatsApp",
            contact_ig: "Instagram",

            footer_text: "© 2025 Tushkanchik. מותר לשתף, אבל עדיף לשאול קודם.",
            float_contact: "קשר"
        },
        lists: {
            mc_list: [
                "תוספים (Plugins) מותאמים אישית מאפס – Java / Paper / Spigot.",
                "הגדרה מלאה של שרת: קונפיגים, הרשאות, אנטי-דופ, הגנות.",
                "בניית חבילות ופרויקטים שלמים לפי הצורך של השרת.",
                "עבודה עם כל הפלגינים הפופולריים וכיוונון עדין שלהם.",
                "ליווי שוטף ותמיכה בשרת.",
                "אינטגרציה עם Telegram / Discord (סטטוס אונליין, פקודות, התראות).",
                "הגדרת גיבויים אוטומטיים, ריסטארט וניטור TPS.",
                "אופטימיזציה לביצועים גם בשרתים קטנים וגם בשרתים עמוסים."
            ],
            tg_list: [
                "בוטי מודרציה: אנטי-ספאם, אנטי-פלוד, פילטרים.",
                "טפסי הרשמה ואימות משתמשים.",
                "אירועי משחק, מיני-משחקים וטבלאות דירוג.",
                "התראות מ-Minecraft או שירותים אחרים ישירות ל-Telegram.",
                "אינטגרציה עם פנלי ניהול ומאגרי מידע."
            ],
            ds_list: [
                "בוטי משחקים עם פקודות, תפקידים ומערכת רמות.",
                "אוטומודרציה, לוגים ומערכת הרשאות גמישה.",
                "ניהול ערוצי קול: יצירה אוטומטית, ניקוי ותפקידים לפי שימוש.",
                "אינטגרציות עם Minecraft, Telegram ופלטפורמות נוספות.",
                "היכרות טובה עם תשתית Discord לסנריוים מורכבים."
            ],
            waig_list: [
                "בוטים עסקיים למענה מהיר וטיפול בפניות.",
                "תרחישים מרובי-שלבים עם תפריטים והתפצלויות.",
                "אינטגרציה עם עמודי נחיתה ומיני-אפליקציות.",
                "התראות ותזכורות ללקוחות."
            ],
            vk_list: [
                "בוטים לעמודים אישיים ולקבוצות.",
                "אוטומציה של תגובות, פניות והזמנות.",
                "מכניקות משחק ומשחקונים בהודעות.",
                "מודרציה וסינון הודעות.",
                "אינטגרציה עם שירותים חיצוניים ועם משחקים."
            ],
            linux_list: [
                "התקנה והגדרה של שרתי משחק (Minecraft ועוד).",
                "הגדרת שירותים: Nginx, Docker, בסיסי נתונים וניטור.",
                "עבודה עם systemd ולוגים (journalctl, logrotate).",
                "גיבויים אוטומטיים ואסטרטגיות שחזור.",
                "קשיחויות בסיסיות ועדכוני מערכת ללא השבתה."
            ],
            auto_list: [
                "סקריפטים ב-Python / Bash / PowerShell לפי צורך.",
                "ריסטארט אוטומטי של שירותים לפי לוח זמנים או כשל.",
                "איסוף לוגים ודוחות בפורמט נוח.",
                "כלים קטנים לפריסה ועדכון פרויקטים.",
                "אוטומציה של פעולות שגרתיות בעמדות Windows ו-Linux."
            ],
            hw_list: [
                "ניקוי עמוק של מחשבים נייחים וניידים מאבק.",
                "אבחון רכיבים וזיהוי בעיות יציבות.",
                "הרכבת מחשבים מאפס למשחקים, סטרים או שרתים.",
                "החלפה ושדרוג רכיבים (CPU, GPU, RAM, SSD, PSU וכו').",
                "ייעוץ בבחירת חומרה וקונפיגורציה מתאימה."
            ]
        }
    }
};

function applyLanguage(lang) {
    const pack = translations[lang];
    if (!pack) return;

    document.documentElement.lang = (lang === 'he') ? 'he' : lang;
    document.body.classList.toggle('lang-he', lang === 'he');

    Object.entries(pack.text).forEach(([key, value]) => {
        document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
            el.textContent = value;
        });
    });

    Object.entries(pack.lists).forEach(([key, items]) => {
        const el = document.querySelector(`[data-i18n-list="${key}"]`);
        if (!el) return;
        el.innerHTML = items.map(item => `<li>${item}</li>`).join("");
    });
}

applyLanguage('ru');

const langButtons = document.querySelectorAll('.lang-btn');
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        applyLanguage(lang);
        langButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
});

// ===== Обработка формы (пока просто алерт) =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Форма пока не отправляет письмо. Настройте backend или сервис форм и замените обработчик в script.js.");
    });
}
