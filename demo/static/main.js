// Import TemplateEngine and plugins
// Adjust these imports based on your actual build setup
import { TemplateEngine } from '@/TemplateEngine.js'
import { PartialsPlugin } from '@/plugins/partials.js'
import { LayoutPlugin } from '@/plugins/layout.js'
import { HelpersPlugin } from '@/plugins/helpers.js'
import { I18nPlugin } from '@/plugins/i18n.js'
import { StrictModePlugin } from '@/plugins/strict.js'

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
            name: 'Alice Martin',
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
// SECTION 2.1: PARTIALS
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
            { name: 'Alice MArtin', role: 'Frontend Dev', email: 'alice@example.com', joined: '2023-01-15' },
            { name: 'Bob Marley', role: 'Backend Dev', email: 'bob@example.com', joined: '2023-03-22' },
            { name: 'Carole Laure', role: 'UI/UX Designer', email: 'carole@example.com', joined: '2023-06-10' }
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
// SECTION 2.2: DYNAMIC PARTIALS
// ============================================================================

const dynamicEngine = new TemplateEngine()
    .use(PartialsPlugin)

// Define different card types
dynamicEngine.partial('loadingCard', `
  <div class="card" style="text-align: center; padding: 3rem;">
    <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
    <div style="color: var(--text-muted);">Loading...</div>
  </div>
`)

dynamicEngine.partial('errorCard', `
  <div class="card" style="border-left: 4px solid var(--danger);">
    <div style="font-size: 2rem; margin-bottom: 0.5rem;">❌</div>
    <h4 style="color: var(--danger);">Error</h4>
    <p style="color: var(--text-muted);">[[= message ]]</p>
  </div>
`)

dynamicEngine.partial('successCard', `
  <div class="card" style="border-left: 4px solid var(--success);">
    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
    <h4 style="color: var(--success);">Success</h4>
    <p style="color: var(--text-muted);">[[= message ]]</p>
  </div>
`)

dynamicEngine.partial('dataCard', `
  <div class="card">
    <h4>[[= title ]]</h4>
    <p style="color: var(--text-muted);">[[= description ]]</p>
    <div style="font-size: 2rem; font-weight: 700; color: var(--primary); margin-top: 1rem;">
      [[= value ]]
    </div>
  </div>
`)

let currentState = 'loading'

window.renderDynamic = function() {
    const dynamicTemplate = `
    <div style="margin-bottom: 2rem;">
      <h3>Current State: <span style="color: var(--primary);">[[= state ]]</span></h3>
      [[> (cardType) ]]
    </div>

    <h3 style="margin-top: 2rem;">Component Gallery</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      [[ components.forEach(comp => { ]]
        [[> (comp.type) ]]
      [[ }) ]]
    </div>
  `

    const stateData = {
        loading: {
            state: 'loading',
            cardType: 'loadingCard'
        },
        error: {
            state: 'error',
            cardType: 'errorCard',
            message: 'Failed to load data. Please try again.'
        },
        success: {
            state: 'success',
            cardType: 'successCard',
            message: 'Data loaded successfully!'
        },
        data: {
            state: 'data',
            cardType: 'dataCard',
            title: 'Active Users',
            description: 'Total users this month',
            value: '1,234'
        }
    }

    const dynamicData = {
        ...stateData[currentState],
        components: [
            { type: 'loadingCard' },
            { type: 'errorCard', message: 'Connection timeout' },
            { type: 'successCard', message: 'Order completed' },
            { type: 'dataCard', title: 'Revenue', description: 'This quarter', value: '$45.2K' }
        ]
    }

    document.getElementById('dynamic-output').innerHTML = dynamicEngine.render(dynamicTemplate, dynamicData)
}

window.changeState = function(state) {
    currentState = state
    // Update UI
    document.querySelectorAll('.state-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    event.target.classList.add('active')

    renderDynamic()
}

// Initial render
renderDynamic()

// ============================================================================
// SECTION 2.3: PARAMS PARTIALS
// ============================================================================


const paramsEngine = new TemplateEngine()
    .use(PartialsPlugin)

// Define reusable button component
paramsEngine.partial('button', `
  <button class="btn" style="
    background: var(--[[= variant ]]);
    padding: [[= size === 'small' ? '0.5rem 1rem' : size === 'large' ? '1rem 2rem' : '0.75rem 1.5rem' ]];
    font-size: [[= size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem' ]];
    opacity: [[= typeof disabled !== 'undefined' && disabled === 'true' ? '0.5' : '1' ]];
    cursor: [[= typeof disabled !== 'undefined' && disabled === 'true' ? 'not-allowed' : 'pointer' ]];
  ">
    [[= label ]]
  </button>
`)
// Define alert component
paramsEngine.partial('alert', `
  <div class="card" style="
    border-left: 4px solid var(--[[= type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger' ]]);
    background: rgba([[= type === 'success' ? '16, 185, 129' : type === 'warning' ? '245, 158, 11' : '239, 68, 68' ]], 0.1);
  ">
    <div style="display: flex; align-items: start; gap: 1rem;">
      <div style="font-size: 1.5rem;">
        [[= type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌' ]]
      </div>
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">[[= title ]]</h4>
        <p style="margin: 0; color: var(--text-muted);">[[= message ]]</p>
      </div>
    </div>
  </div>
`)

// Define card component
paramsEngine.partial('productCard', `
  <div class="product-card">
    <div class="product-image" style="background: linear-gradient(135deg, var(--primary), var(--[[= color ]]));">
      [[= icon ]]
    </div>
    <div class="product-info">
      <div class="product-title">[[= name ]]</div>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0.5rem 0;">
        [[= description ]]
      </p>
      <div class="product-price">[[= price ]]</div>
      [[ if (typeof badge !== 'undefined' && badge) { ]]
        <span class="badge badge-[[= badge ]]" style="margin-top: 0.5rem; display: inline-block;">[[= badgeText ]]</span>
      [[ } ]]
    </div>
  </div>
`)

const renderParams = function() {
    const paramsTemplate = `
    <h3>Button Variants</h3>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;">
      [[> button variant="primary" size="small" label="Small Primary" ]]
      [[> button variant="primary" size="medium" label="Medium Primary" ]]
      [[> button variant="primary" size="large" label="Large Primary" ]]
      [[> button variant="secondary" size="medium" label="Secondary" ]]
      [[> button variant="danger" size="medium" label="Delete" ]]
      [[> button variant="success" size="medium" label="Confirm" ]]
      [[> button variant="primary" size="medium" label="Disabled" disabled="true" ]]
    </div>

    <h3>Alert Components</h3>
    <div style="display: grid; gap: 1rem; margin-bottom: 2rem;">
      [[> alert type="success" title="Success!" message="Your changes have been saved successfully." ]]
      [[> alert type="warning" title="Warning" message="This action cannot be undone." ]]
      [[> alert type="error" title="Error" message="Failed to process your request." ]]
    </div>

    <h3>Product Cards with Parameters</h3>
    <div class="product-grid">
      [[> productCard
          name="Premium Plan"
          icon="🚀"
          color="secondary"
          description="Perfect for growing teams"
          price="$49/mo"
          badge="success"
          badgeText="Popular" ]]

      [[> productCard
          name="Enterprise Plan"
          icon="💼"
          color="primary"
          description="For large organizations"
          price="$299/mo"
          badge="warning"
          badgeText="New" ]]

      [[> productCard
          name="Starter Plan"
          icon="⭐"
          color="success"
          description="Great for individuals"
          price="$9/mo" ]]
    </div>
  `

    document.getElementById('params-output').innerHTML = paramsEngine.render(paramsTemplate, {})
}

// Auto-render on load
renderParams()

// ============================================================================
// SECTION 3.1: LAYOUT PLUGIN - BASIC
// ============================================================================

const layoutEngine = new TemplateEngine().use(LayoutPlugin)

// Define base layout
layoutEngine.layout('base', `
  <html>
    <head>
      <title>[[= title ]]</title>
      [[block:styles]]
        <style>
          body.body-basic-layout { font-family: system-ui; padding: 2rem; background: var(--bg); }
          .page-header { background: var(--primary); color: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
          .page-content { background: var(--bg-lighter); padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
          .page-footer { text-align: center; color: var(--text-muted); padding: 1rem; }
        </style>
      [[/block]]
    </head>
    <body class="body-basic-layout">
      [[block:header]]
        <div class="page-header">
          <h1>Default Header</h1>
        </div>
      [[/block]]
      [[block:content]][[/block]]
      [[block:footer]]
        <div class="page-footer">
          <p>© 2026 My Site. All rights reserved.</p>
        </div>
      [[/block]]
    </body>
  </html>
`)

let currentLayoutContent = 'home'

function renderLayout() {
    const templates = {
        home: `
          [[extends:base]]
          [[block:styles]]
            [[parent]]
            <style>.highlight { color: var(--primary); font-weight: 600; }</style>
          [[/block]]
          [[block:header]]
            <div class="page-header">
              <h1>🏠 Home Page</h1>
              <p style="margin-top: 0.5rem; opacity: 0.9;">Welcome to our amazing website</p>
            </div>
          [[/block]]
          [[block:content]]
            <div class="page-content">
              <h2>Welcome!</h2>
              <p>This is the <span class="highlight">home page</span> extending the base layout.</p>
              <p>Notice how the styles and footer are inherited from the base layout, but we've customized the header and content.</p>
              <ul>
                <li>✅ Base layout provides the HTML structure</li>
                <li>✅ Custom header with emoji and description</li>
                <li>✅ Extended styles with [[parent]] directive</li>
                <li>✅ Footer automatically inherited</li>
              </ul>
            </div>
          [[/block]]
        `,
        about: `
          [[extends:base]]
          [[block:styles]]
            [[parent]]
            <style>
              .team-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
              .team-card { background: var(--bg); padding: 1.5rem; border-radius: 8px; text-align: center; }
            </style>
          [[/block]]
          [[block:content]]
            <div class="page-content">
              <h2>About Us</h2>
              <p>We're a team of passionate developers building amazing things.</p>
              <div class="team-grid">
                <div class="team-card">
                  <div style="font-size: 3rem;">👨‍💻</div>
                  <h3>Alice</h3>
                  <p style="color: var(--text-muted);">Frontend Dev</p>
                </div>
                <div class="team-card">
                  <div style="font-size: 3rem;">👩‍💻</div>
                  <h3>Bob</h3>
                  <p style="color: var(--text-muted);">Backend Dev</p>
                </div>
                <div class="team-card">
                  <div style="font-size: 3rem;">🎨</div>
                  <h3>Carol</h3>
                  <p style="color: var(--text-muted);">Designer</p>
                </div>
              </div>
            </div>
          [[/block]]
        `,
        contact: `
          [[extends:base]]
          [[block:header]]
            <div class="page-header">
              <h1>📧 Contact Us</h1>
            </div>
          [[/block]]
          [[block:content]]
            <div class="page-content">
              <h2>Get in Touch</h2>
              <p>We'd love to hear from you!</p>
              <div style="margin-top: 1.5rem;">
                <p>📧 Email: contact@example.com</p>
                <p>📱 Phone: +33 6 010 203 045</p>
                <p>📍 Free street</p>
              </div>
              <button class="btn" style="margin-top: 1.5rem;">Send Message</button>
            </div>
          [[/block]]
        `
    }

    const html = layoutEngine.render(templates[currentLayoutContent], {
        title: currentLayoutContent.charAt(0).toUpperCase() + currentLayoutContent.slice(1)
    })

    document.getElementById('layout-output').innerHTML = html
}

window.switchLayoutContent = function(content) {
    currentLayoutContent = content

    // Update UI
    document.querySelectorAll('.content-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    event.target.classList.add('active')

    renderLayout()
}

// Initial render
renderLayout()

// ============================================================================
// SECTION 3.1: LAYOUT PLUGIN - MULTI-LEVEL
// ============================================================================

const multiLayoutEngine = new TemplateEngine().use(LayoutPlugin)

// Base layout
multiLayoutEngine.layout('base', `
  <div style="border: 3px solid var(--primary); border-radius: 8px; overflow: hidden;">
    <div style="background: var(--primary); color: white; padding: 0.5rem 1rem; font-weight: 600;">
      🌐 Base Layout (Level 1)
    </div>
    <div style="padding: 1rem;">
      [[block:styles]]
        <div style="background: var(--bg-lighter); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
          📄 <code>base.css</code> loaded
        </div>
      [[/block]]
      [[block:content]][[/block]]
    </div>
  </div>
`)

// Admin layout extends base
multiLayoutEngine.layout('admin', `
  [[extends:base]]
  [[block:styles]]
    [[parent]]
    <div style="background: var(--bg-lighter); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
      🔐 <code>admin.css</code> loaded
    </div>
  [[/block]]
  [[block:content]]
    <div style="border: 2px solid var(--secondary); border-radius: 8px; overflow: hidden; margin-bottom: 1rem;">
      <div style="background: var(--secondary); color: white; padding: 0.5rem 1rem; font-weight: 600;">
        🔑 Admin Layout (Level 2)
      </div>
      <div style="padding: 1rem;">
        <div style="background: var(--bg); padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
          🧭 <strong>Admin Navigation:</strong> Dashboard | Users | Settings | Reports
        </div>
        [[block:main]][[/block]]
      </div>
    </div>
  [[/block]]
`)

let currentAdminPage = 'dashboard'

function renderMultiLayout() {
    const pages = {
        dashboard: `
          [[extends:admin]]
          [[block:styles]]
            [[parent]]
            <div style="background: var(--bg-lighter); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
              📊 <code>dashboard.css</code> loaded
            </div>
          [[/block]]
          [[block:main]]
            <div style="border: 2px solid var(--success); border-radius: 8px; overflow: hidden;">
              <div style="background: var(--success); color: white; padding: 0.5rem 1rem; font-weight: 600;">
                📊 Dashboard Page (Level 3)
              </div>
              <div style="padding: 1rem;">
                <h3 style="margin-top: 0;">Dashboard Overview</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                  <div class="card" style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary);">1,234</div>
                    <div style="color: var(--text-muted);">Active Users</div>
                  </div>
                  <div class="card" style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--success);">89%</div>
                    <div style="color: var(--text-muted);">Uptime</div>
                  </div>
                  <div class="card" style="text-align: center;">
                    <div style="font-size: 2rem; color: var(--secondary);">$12.5K</div>
                    <div style="color: var(--text-muted);">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          [[/block]]
        `,
        users: `
          [[extends:admin]]
          [[block:styles]]
            [[parent]]
            <div style="background: var(--bg-lighter); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
              👥 <code>users.css</code> loaded
            </div>
          [[/block]]
          [[block:main]]
            <div style="border: 2px solid var(--primary); border-radius: 8px; overflow: hidden;">
              <div style="background: var(--primary); color: white; padding: 0.5rem 1rem; font-weight: 600;">
                👥 Users Management (Level 3)
              </div>
              <div style="padding: 1rem;">
                <h3 style="margin-top: 0;">User List</h3>
                <div style="background: var(--bg); padding: 1rem; border-radius: 4px;">
                  <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                    👤 <strong>Alice Johnson</strong> - alice@example.com
                  </div>
                  <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                    👤 <strong>Bob Smith</strong> - bob@example.com
                  </div>
                  <div style="padding: 0.5rem 0;">
                    👤 <strong>Carol Williams</strong> - carol@example.com
                  </div>
                </div>
              </div>
            </div>
          [[/block]]
        `,
        settings: `
          [[extends:admin]]
          [[block:styles]]
            [[parent]]
            <div style="background: var(--bg-lighter); padding: 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
              ⚙️ <code>settings.css</code> loaded
            </div>
          [[/block]]
          [[block:main]]
            <div style="border: 2px solid var(--warning); border-radius: 8px; overflow: hidden;">
              <div style="background: var(--warning); color: white; padding: 0.5rem 1rem; font-weight: 600;">
                ⚙️ Settings Page (Level 3)
              </div>
              <div style="padding: 1rem;">
                <h3 style="margin-top: 0;">Application Settings</h3>
                <div style="background: var(--bg); padding: 1rem; border-radius: 4px;">
                  <label style="display: block; margin-bottom: 0.5rem;">
                    <input type="checkbox" checked> Enable notifications
                  </label>
                  <label style="display: block; margin-bottom: 0.5rem;">
                    <input type="checkbox" checked> Dark mode
                  </label>
                  <label style="display: block; margin-bottom: 0.5rem;">
                    <input type="checkbox"> Two-factor authentication
                  </label>
                  <button class="btn" style="margin-top: 1rem;">Save Settings</button>
                </div>
              </div>
            </div>
          [[/block]]
        `
    }

    const html = multiLayoutEngine.render(pages[currentAdminPage], {})
    document.getElementById('layout-multi-output').innerHTML = html
}

window.switchAdminPage = function(page) {
    currentAdminPage = page

    // Update UI
    document.querySelectorAll('.admin-btn').forEach(btn => {
        btn.classList.remove('active')
    })
    event.target.classList.add('active')

    renderMultiLayout()
}

// Initial render
renderMultiLayout()

// ============================================================================
// SECTION 4.1: HELPERS BASIC
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
// SECTION 4.2: HELPERS CHAINABLE
// ============================================================================
const chainEngine = new TemplateEngine().use(HelpersPlugin)

chainEngine
    .helper('upper', s => s.toUpperCase())
    .helper('lower', s => s.toLowerCase())
    .helper('trim', s => s.trim())
    .helper('truncate', (s, len) => s.length > len ? s.slice(0, len) + '...' : s)
    .helper('wrap', (s, tag) => `<${tag}>${s}</${tag}>`)
    .helper('slugify', s => s.toLowerCase().replace(/\s+/g, '-'))
    .helper('prefix', (s, pre) => pre + s)

const renderChain = function() {
    const input = document.getElementById('chain-input').value
    console.log(input)

    const template = `
<div style="background: var(--bg-lighter); padding: 2rem; border-radius: 8px;">
  <h3>Input</h3>
  <code style="background: var(--bg); padding: 0.5rem; border-radius: 4px; display: block; margin-bottom: 2rem;">"[[= text ]]"</code>

  <h3>Standard Helpers</h3>
  <div style="margin-bottom: 2rem;">
    <p><strong>Upper:</strong> [[= helpers.upper(text) ]]</p>
    <p><strong>Trimmed:</strong> "[[= helpers.trim(text) ]]"</p>
    <p><strong>Slugified:</strong> [[= helpers.slugify(text) ]]</p>
  </div>

  <h3>Chainable Composition</h3>
  <div style="margin-bottom: 2rem;">
    <p><strong>trim().upper():</strong> [[= helpers(text).trim().upper() ]]</p>
    <p><strong>trim().slugify():</strong> [[= helpers(text).trim().slugify() ]]</p>
    <p><strong>trim().truncate(10).upper():</strong> [[= helpers(text).trim().truncate(10).upper() ]]</p>
  </div>

  <h3>Complex Chain with HTML</h3>
  <p>[[-helpers(text).trim().upper().wrap("strong").wrap("em") ]]</p>

  <h3>User Card Example</h3>
  <div class="card">
    <h4 style="margin-top: 0;">[[-helpers(user.name).trim().upper().wrap("strong") ]]</h4>
    <p><strong>Bio:</strong> [[-helpers(user.bio).trim().truncate(50).wrap("em") ]]</p>
    <p><strong>Slug:</strong> <code>[[= helpers(user.name).trim().slugify() ]]</code></p>
    <div style="margin-top: 0.5rem;">
      [[ user.tags.forEach(tag => { ]]
        <span class="badge badge-success">[[-helpers(tag).upper().prefix("#") ]]</span>
      [[ }) ]]
    </div>
  </div>
</div>
`

    const data = {
        text: input,
        user: {
            name: input || 'Robert Michu',
            bio: '  Software engineer passionate about clean code and minimal design. Loves open source.  ',
            tags: ['javascript', 'templates', 'minimal']
        }
    }

    document.getElementById('chain-output').innerHTML = chainEngine.render(template, data)
}

// window.updateChainDemo = renderChain

renderChain()




// ============================================================================
// SECTION 5: i18n
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
// SECTION 6: STRICT MODE
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