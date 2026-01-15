import { TemplateEngine } from './TemplateEngine.js'
import { PartialsPlugin, HelpersPlugin, StrictModePlugin } from './plugins'

(() => {
    let tplIndexPosts = document.getElementById('tplIndexPosts'),
        tplUsersList = document.getElementById('tplUsersList'),
        txtTplIndexPosts = tplIndexPosts.textContent,
        txtTplUsersList = tplUsersList.textContent,
        templateEngine = new TemplateEngine(),
        data = {
            title: '<span class="strong">Bienvenue</span>',
            description: "<strong>Découvrez nos articles !</strong>",
            showPosts: true,
            showProducts: false,
            posts: [
                { title: "Un article", url: "http://magazine.com/un-article.html", tags: ["musique", "vidéo"] },
                { title: "Un autre article", url: "http://magazine.com/un-autre-article.html", tags: [] },
                { title: "Un super article", url: "http://magazine.com/un-super-article.html", tags: ["musique", "peintures"] },
            ],
            products: ["Iphone 15", "Samsung S24"],
        },
        users = [
            { name: "Alexandre", interests: "Veut dominer le monde" },
            { name: "Denis", interests: "ha.ckers.org <script src=\"javascript:alert('XSS');\"></script>" },
            { name: "Christelle", interests: "Travaille dehors" },
            { name: "Claude", interests: "Cueille des fleurs pour Angela" }
        ]
    document.getElementById('target_a').innerHTML = templateEngine.render(txtTplIndexPosts, data)
    document.getElementById('target_b').innerHTML = templateEngine.render(txtTplUsersList, { users })


    const engine = new TemplateEngine()
        .use(PartialsPlugin)
        .use(HelpersPlugin)
        .use(StrictModePlugin)

    engine.strict = true
    engine.partial('header', '<h1>Hello</h1>')
    engine.partial('footer', '<h2>Hello</h2>')
    engine.helper('upper', s => s.toUpperCase())

    const html = engine.render(`
    [[> header ]]
    <p>[[= helpers.upper(name) ]]</p>
    [[> footer ]]
`, { name: 'world' })
    console.log(html)
})();