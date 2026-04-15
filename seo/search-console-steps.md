# IMAUGEM — Google Search Console + Bing Webmaster Tools
## Guia de submissão passo a passo

**Pré-requisito:** Cloudflare corrigido (ver `seo/cloudflare-fix.md`). Sem isto, a submissão não tem efeito.

---

## PARTE 1 — GOOGLE SEARCH CONSOLE

**URL:** https://search.google.com/search-console
**Conta necessária:** Google account (Gmail ou Google Workspace)
**Tempo estimado:** 20 minutos + 48–72h para indexação inicial

### 1.1 Adicionar propriedade

1. Aceder a https://search.google.com/search-console
2. Clicar **"Add property"** (canto superior esquerdo)
3. Seleccionar tipo **"URL prefix"**
4. Inserir: `https://www.imaugem.pt/`
5. Clicar **"Continue"**

### 1.2 Verificar propriedade (escolher método)

**Método A — HTML tag (recomendado, mais simples):**
1. Copiar o código meta tag que o GSC fornece:
   ```html
   <meta name="google-site-verification" content="CÓDIGO_AQUI">
   ```
2. Inserir no `<head>` da homepage (antes de qualquer outro script)
3. Publicar a alteração no site
4. Clicar **"Verify"** no GSC

**Método B — HTML file:**
1. Fazer download do ficheiro HTML que o GSC fornece
2. Fazer upload para a raiz do site: `https://www.imaugem.pt/googleXXXXXX.html`
3. Clicar **"Verify"**

**Método C — DNS record (requer acesso ao painel Cloudflare):**
1. GSC fornece um TXT record: `google-site-verification=XXXXXX`
2. No Cloudflare: imaugem.pt → DNS → Records → Add record
   - Type: TXT
   - Name: @
   - Content: `google-site-verification=XXXXXX`
3. Aguardar propagação DNS (5–60 minutos)
4. Clicar **"Verify"** no GSC

### 1.3 Submeter sitemap

1. No painel GSC: **Indexing → Sitemaps** (menu esquerdo)
2. Campo "Add a new sitemap": inserir `sitemap.xml`
3. Clicar **"Submit"**
4. Estado deve aparecer como "Success" em poucos minutos

### 1.4 Solicitar indexação da homepage

1. **URL Inspection** (caixa de pesquisa no topo do GSC)
2. Inserir: `https://www.imaugem.pt/`
3. Clicar **"Request Indexing"**
4. Repetir para: `/sobre-nos`, `/contactos`, `/imoveis/comprar`, `/imoveis/arrendar`

### 1.5 O que monitorizar (após 48–72h)

| Secção GSC | O que verificar |
|---|---|
| Indexing → Pages | Páginas indexadas vs. excluídas. Meta: >5 páginas indexadas |
| Indexing → Pages → Reason: "Crawled – not indexed" | Conteúdo fraco — melhorar texto |
| Indexing → Pages → Reason: "Blocked by robots.txt" | Verificar robots.txt |
| Indexing → Pages → Reason: "Server error (5xx)" | Problema no servidor |
| Performance → Search results | Pesquisas que trazem tráfego (aparece após ~1 semana) |
| Security & Manual Actions | Verificar se há penalizações |
| Core Web Vitals | LCP, CLS, FID — métricas de performance |

---

## PARTE 2 — BING WEBMASTER TOOLS

**URL:** https://www.bing.com/webmasters
**Conta necessária:** Microsoft account (Outlook, Hotmail, ou conta empresarial Microsoft)
**Tempo estimado:** 15 minutos
**Bonus:** O Microsoft Copilot (IA) usa dados do Bing — estar indexado no Bing = visibilidade no Copilot

### 2.1 Criar conta e adicionar site

1. Aceder a https://www.bing.com/webmasters
2. Fazer login com conta Microsoft
3. Clicar **"Add your site"**
4. Inserir: `https://www.imaugem.pt/`
5. Clicar **"Add"**

### 2.2 Importar do Google Search Console (mais rápido)

Se o GSC já estiver verificado:
1. Na página de adição de site, clicar **"Import from Google Search Console"**
2. Autorizar acesso à conta Google
3. O Bing importa automaticamente: sitemap, verificação e configurações

### 2.3 Verificar manualmente (se não importar do GSC)

**Método A — Meta tag:**
1. Copiar o código que o Bing fornece:
   ```html
   <meta name="msvalidate.01" content="CÓDIGO_AQUI">
   ```
2. Inserir no `<head>` da homepage
3. Clicar **"Verify"**

**Método B — XML file:**
1. Download do ficheiro BingSiteAuth.xml
2. Upload para `https://www.imaugem.pt/BingSiteAuth.xml`
3. Clicar **"Verify"**

### 2.4 Submeter sitemap

1. **Configuration → Sitemaps** (menu esquerdo)
2. Clicar **"Submit sitemap"**
3. Inserir: `https://www.imaugem.pt/sitemap.xml`
4. Clicar **"Submit"**

### 2.5 Submeter URLs para indexação rápida

1. **URL Submission** → **Submit URLs**
2. Inserir URLs um por linha:
   ```
   https://www.imaugem.pt/
   https://www.imaugem.pt/sobre-nos
   https://www.imaugem.pt/contactos
   https://www.imaugem.pt/imoveis/comprar
   https://www.imaugem.pt/imoveis/arrendar
   ```
3. Clicar **"Submit"**
4. Limite: 10 URLs/dia no plano gratuito

### 2.6 O que monitorizar

| Secção BWT | O que verificar |
|---|---|
| Dashboard → Index Coverage | Páginas indexadas pelo Bing |
| Reports → Crawl Information | Erros de crawl |
| Reports → Search Performance | Pesquisas no Bing |
| Diagnostics → Fetch as Bingbot | Testar se o Bing consegue aceder |

---

## PARTE 3 — VERIFICAÇÃO RÁPIDA (após tudo configurado)

### Teste Google (após 48–72h):
```
site:imaugem.pt
```
→ Deve começar a mostrar resultados

### Teste Bing:
```
site:imaugem.pt
```
→ No bing.com

### Teste de indexação da marca:
```
"IMAUGEM" imobiliária
imaugem cascais
```
→ O site deve aparecer nos primeiros resultados

---

## LINHAS TEMPORAIS ESPERADAS

| Acção | Tempo para efeito |
|---|---|
| Verificação GSC/BWT | Imediato |
| Primeiras páginas indexadas pelo Google | 3–7 dias |
| Primeiras pesquisas na Performance | 7–14 dias |
| Indexação completa do site | 2–4 semanas |
| Ranking para "imobiliária cascais" | 2–6 meses (SEO competitivo) |
| Ranking para "imaugem" (brand query) | 1–4 semanas após indexação |
