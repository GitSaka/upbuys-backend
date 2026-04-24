// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const scrapeFacebook = async (pageUrl) => {
//   console.log("🚀 Initialisation de l'aspirateur Facebook Souverain...");

//   // 1. Forcer l'URL mobile pour contourner plus facilement les blocages de connexion
//   const mobileUrl = pageUrl.replace("www.facebook.com", "m.facebook.com");

//   // 🔎 Détection automatique de Chrome sur Windows
//   const chromePaths = [
//     'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//     'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
//     `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
//   ];

//   const executablePath = chromePaths.find(path => fs.existsSync(path));

//   if (!executablePath) {
//     console.error("❌ Google Chrome introuvable sur ce PC.");
//     return { error: "Chrome non trouvé" };
//   }

//   console.log(`✅ Chrome détecté : ${executablePath}`);

//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: false, // On garde visible pour tes tests
//       executablePath,
//       defaultViewport: null,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-notifications',
//         '--window-size=1280,800'
//       ]
//     });

//     const page = await browser.newPage();

//     // ⏱ Timeout global
//     await page.setDefaultNavigationTimeout(120000);

//     // 🧠 User Agent Mobile (Indispensable pour m.facebook.com)
//     await page.setUserAgent(
//       'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
//     );

//     console.log(`🔍 Ouverture de la version mobile : ${mobileUrl}`);

//     await page.goto(mobileUrl, {
//       waitUntil: 'domcontentloaded'
//     });

//     console.log("⏳ Nettoyage de la page et chargement des posts...");
    
//     // 🛡️ SUPPRESSION DES OBSTACLES (Login Pop-ups)
//     await new Promise(resolve => setTimeout(resolve, 8000)); // Pause pour laisser le pop-up venir

//     await page.evaluate(() => {
//       // Liste des sélecteurs de bannières de connexion sur mobile
//       const loginSelectors = [
//         '#login_popup_cta_form', 
//         '[data-sigil="m_login_notice"]', 
//         'div[role="dialog"]',
//         '#header' // On cache parfois le header pour mieux scroller
//       ];
//       loginSelectors.forEach(s => {
//         const el = document.querySelector(s);
//         if (el) el.style.display = 'none';
//       });
//     });

//     // 🖱️ Petit Scroll pour déclencher l'affichage du contenu
//     await page.mouse.wheel({ deltaY: 1000 });
//     await new Promise(resolve => setTimeout(resolve, 3000));

//     const posts = await page.evaluate(() => {
//       const results = [];

//       // Sélecteurs spécifiques à la version Mobile de Facebook 2026
//       const elements = document.querySelectorAll(
//         'article, div[data-sigil="m-mentions-expand"], div._5rgt'
//       );

//       elements.forEach((el, index) => {
//         const text = el.innerText?.trim();
//         // On ne prend que les textes significatifs
//         if (text && text.length > 20) {
//           results.push({
//             id: index + 1,
//             text: text.substring(0, 800), // On limite la taille pour le test
//             capturedAt: new Date().toISOString()
//           });
//         }
//       });

//       return results;
//     });

//     console.log(`✨ ${posts.length} publications extraites sur mobile.`);
//     return posts;

//   } catch (error) {
//     console.error("❌ Erreur Puppeteer :", error.message);
//     return { error: error.message };

//   } finally {
//     if (browser) {
//       await browser.close();
//       console.log("🧹 Navigateur fermé proprement.");
//     }
//   }
// };

// module.exports = { scrapeFacebook };

// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const Post = require('../models/Post'); // On importe le modèle pour sauvegarder

// const scrapeFacebook = async (pageUrl) => {
//   const mobileUrl = pageUrl.replace("www.facebook.com", "m.facebook.com");
//   const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'; // À ajuster selon ton PC

//   const browser = await puppeteer.launch({
//     headless: false,
//     executablePath: chromePath,
//     args: ['--no-sandbox']
//   });

//   try {
//     const page = await browser.newPage();
//     await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36');
    
//     await page.goto(mobileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
//     await new Promise(r => setTimeout(r, 8000)); // Attente pour les posts

//     const posts = await page.evaluate(() => {
//   const results = [];
  
//   // En 2026, on cible des structures plus larges pour ne pas rater le contenu
//   // On cherche les articles ou les div qui contiennent souvent le texte des posts
//   const selectors = [
//     'article', 
//     'div[data-sigil="m-mentions-expand"]', 
//     'div._5rgt', 
//     'div._5pat',
//     'div.story_body_container'
//   ];

//   selectors.forEach(selector => {
//     const items = document.querySelectorAll(selector);
    
//     items.forEach((item, index) => {
//       // On récupère le texte à l'intérieur
//       const text = item.innerText?.trim();
      
//       // On filtre pour éviter les textes vides ou trop courts (comme "Like" ou "Comment")
//       if (text && text.length > 30) {
//         // On vérifie si ce texte n'a pas déjà été ajouté par un autre sélecteur
//         if (!results.find(r => r.content === text)) {
//           results.push({
//             externalId: `fb_${Date.now()}_${index}`,
//             content: text,
//             source: 'Facebook'
//           });
//         }
//       }
//     });
//   });

//   return results;
// });

//     // --- LIAISON AVEC LA BASE DE DONNÉES ---
//     if (posts.length > 0) {
//       await Post.insertMany(posts, { ordered: false }).catch(e => console.log("Doublons ignorés"));
//     }

//     await browser.close();
//     return posts;

//   } catch (error) {
//     if (browser) await browser.close();
//     throw error;
//   }
// };

// module.exports = { scrapeFacebook };


const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Post = require('../models/Post');

const scrapeFacebook = async (pageUrl) => {
  const mobileUrl = pageUrl.replace('www.facebook.com', 'm.facebook.com');

  const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: false,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // ✅ USER AGENT MOBILE
    await page.setUserAgent(
      'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
    );

    // ✅ CHARGEMENT DES COOKIES
    const cookiesPath = path.join(__dirname, '../cookies/facebook.json');
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
    await page.setCookie(...cookies);

    console.log('🍪 Cookies Facebook injectés');

    // ✅ NAVIGATION
    await page.goto(mobileUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    await new Promise(r => setTimeout(r, 8000));

    const posts = await page.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('article');

      elements.forEach((el, index) => {
        const text = el.innerText?.trim();
        if (text && text.length > 50) {
          results.push({
            externalId: `fb_${Date.now()}_${index}`,
            content: text,
            source: 'Facebook'
          });
        }
      });

      return results;
    });

    if (posts.length) {
      await Post.insertMany(posts, { ordered: false })
        .catch(() => console.log('⚠️ Doublons ignorés'));
    }

    await browser.close();
    return posts;

  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
};

module.exports = { scrapeFacebook };
