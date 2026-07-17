window.PRIMESCRIPTLAB_CONFIG = {
  brandName: "PrimeScriptLab",
  fiverrUrl: "https://www.fiverr.com/primescriptlab_/make-a-script-for-almost-any-programming-language",
  contactEmail: "your-email@example.com",
  currency: "USD",

  paypal: {
    clientId: "AXPbfcpN4yYBYDteScCtYjCNDlCcumBut9XLDJmJ7wsv1cRdcWxLDmc3Ka0mXhrWLarCJ7WOK_VarRWf",
    businessEmail: "your-paypal-business@example.com",
    paypalMe: ""
  },

  packages: [
    {
      id: "basic",
      name: "Basic",
      title: "Simple Script",
      price: 10,
      deliveryDays: 2,
      revisions: 1,
      description: "A small focused script for one clear task, one input type and simple output.",
      features: {
        sourceCode: true,
        setupNotes: true,
        testing: true,
        installScript: false,
        taskAutomation: false,
        apiIntegration: false,
        revisions: "1",
        delivery: "2 days"
      }
    },
    {
      id: "standard",
      name: "Standard",
      title: "Professional Script",
      price: 25,
      deliveryDays: 4,
      revisions: 2,
      featured: true,
      description: "A production-ready script with cleaner structure, validation, setup notes and testing.",
      features: {
        sourceCode: true,
        setupNotes: true,
        testing: true,
        installScript: true,
        taskAutomation: true,
        apiIntegration: false,
        revisions: "2",
        delivery: "4 days"
      }
    },
    {
      id: "premium",
      name: "Premium",
      title: "Advanced Automation",
      price: 50,
      deliveryDays: 7,
      revisions: 3,
      description: "Complex logic, multiple flows, integrations, documentation and more careful edge cases.",
      features: {
        sourceCode: true,
        setupNotes: true,
        testing: true,
        installScript: true,
        taskAutomation: true,
        apiIntegration: true,
        revisions: "3",
        delivery: "7 days"
      }
    }
  ],

  languages: [
    "Python",
    "JavaScript / Node.js",
    "PHP",
    "Java",
    "C#",
    "C++",
    "Lua / Roblox",
    "HTML / CSS",
    "SQL",
    "Other"
  ],

  scriptTypes: [
    "Automation script",
    "Data scraping or parsing",
    "API integration",
    "Discord, Telegram or bot script",
    "Game or Roblox script",
    "Bug fix or improvement",
    "File converter",
    "Website helper",
    "School or learning project",
    "Custom utility"
  ],

  services: [
    {
      title: "Automation scripts",
      detail: "Turn repetitive computer, file, spreadsheet or web tasks into a script that runs reliably.",
      tags: ["Python", "Node.js", "C#"]
    },
    {
      title: "Data tools",
      detail: "Clean, convert, scrape, validate or export data from CSV, JSON, Excel, APIs and websites.",
      tags: ["CSV", "Excel", "APIs"]
    },
    {
      title: "Bots and integrations",
      detail: "Build small bots, API clients, webhooks and integrations for apps, websites and services.",
      tags: ["Discord", "Telegram", "REST"]
    },
    {
      title: "Game scripts",
      detail: "Gameplay logic, Roblox/Lua systems, Unity/C# helpers, inventory, UI and admin utilities.",
      tags: ["Lua", "Roblox", "Unity"]
    },
    {
      title: "Bug fixes",
      detail: "Repair broken scripts, improve existing code, add missing behavior and explain what changed.",
      tags: ["Debug", "Refactor", "Improve"]
    },
    {
      title: "Almost any language",
      detail: "If your project uses a different language, the order form supports custom requests.",
      tags: ["Java", "C++", "Other"]
    }
  ],

  addons: [
    {
      id: "rush",
      label: "Rush priority",
      price: 20,
      description: "Moves the request to a faster delivery queue."
    },
    {
      id: "docs",
      label: "Extra documentation",
      price: 10,
      description: "Adds a more detailed usage guide and project notes."
    },
    {
      id: "revision",
      label: "Extra revision",
      price: 8,
      description: "Adds one extra revision after delivery."
    },
    {
      id: "install",
      label: "Install support",
      price: 12,
      description: "Extra help setting up the script on the buyer side."
    }
  ],

  integrationPrice: 12,
  flexibleDiscount: 5
};
