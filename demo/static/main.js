// Import TemplateEngine and plugins
// Adjust these imports based on your actual build setup
import { TemplateEngine } from '../../src/TemplateEngine.js'
import { PartialsPlugin } from '../../src/plugins/partials.js'
import { HelpersPlugin } from '../../src/plugins/helpers.js'
import { I18nPlugin } from '../../src/plugins/i18n.js'
import { StrictModePlugin } from '../../src/plugins/strict.js'

// ============================================================================
// SECTION 1: BASIC USAGE
// ============================================================================

const basicEngine = new TemplateEngine()

const renderBasic = function() {
    const template = document.getElementById('basic-template').value
    const output = document.getElementById('basic-output')

    const data = {
        title: 'Dashboard',
        user: {
            name: 'Alice Johnson',
            role: 'Developer'
        },
        notifications: 5
    }

    try {
        const html = basicEngine.render(template, data)
        output.innerHTML = html
    } catch (error) {
        output.innerHTML = `<div class="error-message">Error: ${error.message}</div>`
    }
}

// Auto-render on load
renderBasic()

// ============================================================================
// SECTION 2: PARTIALS
// ============================================================================

const partialsEngine = new TemplateEngine().use(PartialsPlugin)

// Define partials
partialsEngine.partial('usercard', `
  <div class="card">
    <h3>[[= member.name ]]</h3>
    <p><strong>Role:</strong> <span class="badge badge-success">[[= member.role ]]</span></p>
    <p><strong>Email:</strong> [[= member.email ]]</p>
    <p><strong>Joined:</strong> [[= member.joined ]]</p>
  </div>
`)

partialsEngine.partial('statcard', `
  <div class="card">
    <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">[[= stat.value ]]</div>
    <div style="color: var(--text-muted); margin-top: 0.5rem;">[[= stat.label ]]</div>
  </div>
`)

const renderPartials = function() {
    const partialsTemplate = `
    <h3>Team Members</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      [[ team.forEach(member => { ]]
        [[> usercard ]]
      [[ }) ]]
    </div>

    <h3>Statistics</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
      [[ stats.forEach(stat => { ]]
        [[> statcard ]]
      [[ }) ]]
    </div>
  `

    const partialsData = {
        team: [
            { name: 'Alice Johnson', role: 'Frontend Dev', email: 'alice@example.com', joined: '2023-01-15' },
            { name: 'Bob Smith', role: 'Backend Dev', email: 'bob@example.com', joined: '2023-03-22' },
            { name: 'Carol Williams', role: 'UI/UX Designer', email: 'carol@example.com', joined: '2023-06-10' }
        ],
        stats: [
            { value: '1,234', label: 'Active Users' },
            { value: '56', label: 'Projects' },
            { value: '89%', label: 'Uptime' },
            { value: '$12.5K', label: 'Revenue' }
        ]
    }

    document.getElementById('partials-output').innerHTML = partialsEngine.render(partialsTemplate, partialsData)
}

// Auto-render on load
renderPartials()

// ============================================================================
// SECTION 3: HELPERS
// ============================================================================

const helpersEngine = new TemplateEngine().use(HelpersPlugin)

// Define helpers
helpersEngine.helper('currency', (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price)
})

helpersEngine.helper('formatDate', (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})

helpersEngine.helper('truncate', (text, length = 50) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
})

helpersEngine.helper('statusBadge', (status) => {
    const badges = {
        active: '<span class="badge badge-success">Active</span>',
        pending: '<span class="badge badge-warning">Pending</span>',
        inactive: '<span class="badge badge-danger">Inactive</span>'
    }
    return badges[status] || status
})

window.renderHelpers = function() {
    // Product catalog demo
    const helpersTemplate = `
    <h3>Product Catalog</h3>
    <div class="product-grid">
      [[ products.forEach(product => { ]]
        <div class="product-card">
          <div class="product-image">[[= product.emoji ]]</div>
          <div class="product-info">
            <div class="product-title">[[= product.name ]]</div>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0.5rem 0;">
              [[= helpers.truncate(product.description, 60) ]]
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
              <div class="product-price">[[= helpers.currency(product.price) ]]</div>
              [[-helpers.statusBadge(product.status) ]]
            </div>
            <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.5rem;">
              Added: [[= helpers.formatDate(product.addedDate) ]]
            </div>
          </div>
        </div>
      [[ }) ]]
    </div>
  `

    const helpersData = {
        products: [
            {
                name: 'Laptop Pro',
                emoji: '💻',
                description: 'High-performance laptop with stunning display and amazing battery life',
                price: 1299.99,
                status: 'active',
                addedDate: '2024-11-15'
            },
            {
                name: 'Wireless Mouse',
                emoji: '🖱️',
                description: 'Ergonomic wireless mouse with precision tracking',
                price: 49.99,
                status: 'active',
                addedDate: '2024-12-01'
            },
            {
                name: 'Mechanical Keyboard',
                emoji: '⌨️',
                description: 'Premium mechanical keyboard with RGB lighting and customizable keys',
                price: 159.99,
                status: 'pending',
                addedDate: '2025-01-05'
            },
            {
                name: 'USB-C Hub',
                emoji: '🔌',
                description: 'Multi-port USB-C hub for all your connectivity needs',
                price: 79.99,
                status: 'inactive',
                addedDate: '2024-10-20'
            },
            {
                name: 'Webcam HD',
                emoji: '📹',
                description: 'Crystal clear 4K webcam perfect for video calls and streaming',
                price: 129.99,
                status: 'active',
                addedDate: '2024-12-15'
            },
            {
                name: 'Headphones',
                emoji: '🎧',
                description: 'Noise-cancelling headphones with superior sound quality',
                price: 249.99,
                status: 'active',
                addedDate: '2024-11-30'
            }
        ]
    }

    document.getElementById('helpers-output').innerHTML = helpersEngine.render(helpersTemplate, helpersData)
}

// Auto-render on load
renderHelpers()

// ============================================================================
// SECTION 4: i18n
// ============================================================================

const i18nEngine = new TemplateEngine().use(I18nPlugin).use(HelpersPlugin)

// Setup translations
i18nEngine.translations = {
    en: {
        welcome: 'Welcome back, {name}!',
        dashboard: 'Dashboard',
        stats_title: 'Your Statistics',
        total_sales: 'Total Sales',
        active_projects: 'Active Projects',
        team_members: 'Team Members',
        notifications: 'Notifications',
        recent_activity: 'Recent Activity',
        completed_task: '{user} completed task "{task}"',
        joined_team: '{user} joined the team',
        new_message: 'New message from {user}',
        view_all: 'View All'
    },
    fr: {
        welcome: 'Bienvenue, {name} !',
        dashboard: 'Tableau de bord',
        stats_title: 'Vos statistiques',
        total_sales: 'Ventes totales',
        active_projects: 'Projets actifs',
        team_members: 'Membres de l\'équipe',
        notifications: 'Notifications',
        recent_activity: 'Activité récente',
        completed_task: '{user} a terminé la tâche "{task}"',
        joined_team: '{user} a rejoint l\'équipe',
        new_message: 'Nouveau message de {user}',
        view_all: 'Voir tout'
    },
    es: {
        welcome: '¡Bienvenido, {name}!',
        dashboard: 'Panel de control',
        stats_title: 'Tus estadísticas',
        total_sales: 'Ventas totales',
        active_projects: 'Proyectos activos',
        team_members: 'Miembros del equipo',
        notifications: 'Notificaciones',
        recent_activity: 'Actividad reciente',
        completed_task: '{user} completó la tarea "{task}"',
        joined_team: '{user} se unió al equipo',
        new_message: 'Nuevo mensaje de {user}',
        view_all: 'Ver todo'
    }
}

i18nEngine.helper('currency', (price) => {
    const formats = {
        en: { style: 'currency', currency: 'USD' },
        fr: { style: 'currency', currency: 'EUR' },
        es: { style: 'currency', currency: 'EUR' }
    }
    const locale = i18nEngine.locale || 'en'
    return new Intl.NumberFormat(locale, formats[locale]).format(price)
})

const i18nTemplate = `
  <div style="background: var(--bg-lighter); padding: 2rem; border-radius: 8px;">
    <h2>[[= t("welcome", {name: user.name}) ]]</h2>
    <p style="color: var(--text-muted); margin-bottom: 2rem;">[[= t("dashboard") ]]</p>

    <h3>[[= t("stats_title") ]]</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
      <div class="card">
        <div style="font-size: 2rem; font-weight: 700; color: var(--success);">[[= helpers.currency(stats.sales) ]]</div>
        <div style="color: var(--text-muted);">[[= t("total_sales") ]]</div>
      </div>
      <div class="card">
        <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">[[= stats.projects ]]</div>
        <div style="color: var(--text-muted);">[[= t("active_projects") ]]</div>
      </div>
      <div class="card">
        <div style="font-size: 2rem; font-weight: 700; color: var(--secondary);">[[= stats.teamSize ]]</div>
        <div style="color: var(--text-muted);">[[= t("team_members") ]]</div>
      </div>
    </div>

    <h3>[[= t("recent_activity") ]]</h3>
    <div style="background: var(--bg); padding: 1.5rem; border-radius: 8px;">
      [[ activities.forEach(activity => { ]]
        <div style="padding: 1rem 0; border-bottom: 1px solid var(--border);">
          [[ if (activity.type === 'task') { ]]
            <p>[[= t("completed_task", {user: activity.user, task: activity.task}) ]]</p>
          [[ } else if (activity.type === 'join') { ]]
            <p>[[= t("joined_team", {user: activity.user}) ]]</p>
          [[ } else if (activity.type === 'message') { ]]
            <p>[[= t("new_message", {user: activity.user}) ]]</p>
          [[ } ]]
          <small style="color: var(--text-muted);">[[= activity.time ]]</small>
        </div>
      [[ }) ]]
      <button class="btn" style="margin-top: 1rem;">[[= t("view_all") ]]</button>
    </div>
  </div>
`

const i18nData = {
    user: { name: 'Alex' },
    stats: {
        sales: 45230.50,
        projects: 12,
        teamSize: 8
    },
    activities: [
        { type: 'task', user: 'Sarah', task: 'Update homepage', time: '2 hours ago' },
        { type: 'join', user: 'Michael', time: '5 hours ago' },
        { type: 'message', user: 'Emma', time: '1 day ago' },
        { type: 'task', user: 'James', task: 'Fix bug in checkout', time: '2 days ago' }
    ]
}

let currentLocale = 'en'

function renderI18n() {
    i18nEngine.locale = currentLocale
    i18nEngine.clear() // Clear cache when locale changes
    document.getElementById('i18n-output').innerHTML = i18nEngine.render(i18nTemplate, i18nData)
}

window.switchLang = function(lang) {
    currentLocale = lang

    // Update UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    event.target.classList.add('active')

    renderI18n()
}

// Initial render
renderI18n()

// ============================================================================
// SECTION 5: STRICT MODE
// ============================================================================

const strictEngine = new TemplateEngine().use(StrictModePlugin)
strictEngine.strict = true

window.renderStrict = function() {
    const template = document.getElementById('strict-template').value
    const output = document.getElementById('strict-output')

    // Data with intentional typo (userEmail missing)
    const data = {
        userName: 'John Doe'
        // userEmail is missing - this will trigger strict mode error
    }

    try {
        const html = strictEngine.render(template, data)
        output.innerHTML = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); color: var(--success); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
        ✅ Strict mode passed! All variables are defined.
      </div>
      ${html}
    `
    } catch (error) {
        output.innerHTML = `
      <div class="error-message">
        <strong>❌ Strict Mode Error:</strong><br>
        ${error.message}
      </div>
      <div style="background: var(--bg-lighter); padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
        <h4>Why did this fail?</h4>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">
          Strict mode detected that you're trying to access <code style="background: var(--bg); padding: 0.25rem 0.5rem; border-radius: 4px;">userEmail</code>
          but it's not defined in the data object. This helps catch typos and missing data early!
        </p>
        <p style="color: var(--text-muted); margin-top: 1rem;">
          <strong>Available variables:</strong> <code style="background: var(--bg); padding: 0.25rem 0.5rem; border-radius: 4px;">${Object.keys(data).join(', ')}</code>
        </p>
      </div>
    `
    }
}

// Initial render
renderStrict()

console.log('✨ TemplateEngine Demo loaded successfully!')