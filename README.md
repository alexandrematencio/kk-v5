# Khan Kluay — kk-v5

Version immersive du site Khan Kluay (cuisine thaïlandaise, Villejuif), construite à partir du branding de **kk-v1** (crème `#FAF4EF`, bleu `#001B95`, rouge thaï `#E22B02` / `#A51931`, Inter, dispositif bilingue thaï/latin, wordmark).

## Ce que cette version apporte

- **Splash intro** — สวัสดี + montée du wordmark, jouée une fois par session, curtain reveal vers le hero, failsafe indépendant du ticker GSAP
- **Burger menu immersif** — overlay plein écran bleu profond, double rideau GSAP, liens typographiques en cascade avec accents thaïs, aperçu de plat en crossfade au survol, fermeture Échap / clic / changement de route
- **Hero scrollytelling** — filigrane thaï géant en contre-parallaxe, plat en parallaxe, wordmark pleine largeur signature
- **Philosophie** — séquence épinglée scrubée (thaï → latin), reprise de v1
- **La carte en index éditorial** — liste des plats + cadre d'aperçu sticky qui crossfade au survol (desktop), vignettes curtain-reveal (mobile), numéros de planche « Pl. 0X »
- **CTA / footer** — bande bleue « Une table vous attend »

Stack : Nuxt 4 · GSAP + ScrollTrigger · Lenis.

## Développement

```bash
npm install
npm run dev   # http://localhost:3005
```

## Vérification headless

```bash
node scripts/verify.mjs 1440 900 desktop
node scripts/verify.mjs 390 844 mobile
```

Captures dans `_shots/`. Le scroll est piloté via l'instance Lenis (`window.__lenis`) par CDP.

## Déploiement

```bash
npm run deploy   # génère avec NUXT_APP_BASE_URL=/kk-v5/ et pousse sur gh-pages
```
