# Doulia — Musa Prototype
Deploy en Vercel en ~5 minutos.

## Estructura
```
musa-doulia/
├── api/
│   └── chat.js        ← serverless function (oculta tu API key)
├── public/
│   └── index.html     ← el prototipo completo
├── vercel.json        ← configuración de rutas
└── README.md
```

## Pasos para deploy

### 1. Obtén tu Anthropic API key
- Ve a https://console.anthropic.com
- Settings → API Keys → Create Key
- Ponle un nombre: "musa-doulia-demo"
- **Recomendado:** en Billing → Usage Limits, pon un límite de $5-10 USD
- Copia la key (empieza con `sk-ant-...`)

### 2. Sube a GitHub
- Ve a https://github.com/new
- Crea un repo público llamado `musa-doulia`
- Sube esta carpeta completa (arrastra los archivos)

### 3. Deploy en Vercel
- Ve a https://vercel.com → "Add New Project"
- Conecta tu GitHub y selecciona el repo `musa-doulia`
- En **Environment Variables** agrega:
  - Name: `ANTHROPIC_API_KEY`
  - Value: `sk-ant-...` (tu key)
- Click **Deploy**

### 4. Comparte el link
Vercel te da un link tipo:
`https://musa-doulia.vercel.app`

¡Comparte ese link con tu clase — funciona en cualquier browser!

## Notas
- Cada mensaje consume ~$0.002 USD de tu cuenta Anthropic
- Con límite de $5 puedes tener ~2,500 mensajes
- Puedes ver el uso en console.anthropic.com
