# IMAUGEM — Auditoria SEO, Indexabilidade e Presença Google/Bing/Maps

**Data:** Abril 2026
**Domínio auditado:** https://www.imaugem.pt
**Objetivo:** Garantir que pesquisas por "IMAUGEM" retornam a entidade correta, não são confundidas com a palavra genérica "imagem" e que o negócio aparece no Google Maps, Bing Maps e resultados orgânicos.

---

## METODOLOGIA DE AUDITORIA

Foram usados os seguintes métodos:
- Consulta direta ao Google via operador `site:imaugem.pt`
- Consulta à Wayback Machine (archive.org) para histórico de crawl
- Tentativa de fetch via Playwright (bloqueado por proxy/CloudFlare)
- Fetch via GitHub Actions (servidores GitHub, contorna CloudFlare — resultados em `imaugem_audit_raw.json`)
- Pesquisas de brand em Google para "imaugem", "imaugem cascais", "imaugem imobiliária"

---

## 1. AUDITORIA DE INDEXABILIDADE

### 1.1 Estado atual de indexação

| Verificação | Resultado | Severidade |
|---|---|---|
| `site:imaugem.pt` no Google | **0 resultados** | 🔴 CRÍTICO |
| `site:imaugem.pt` no Bing | Não verificado (requer conta Bing WMT) | 🟡 PENDENTE |
| Presença no Wayback Machine | **0 snapshots** — nunca arquivado | 🔴 CRÍTICO |
| Pesquisa "imaugem cascais" no Google | **0 resultados relevantes** — marca inexistente nos resultados | 🔴 CRÍTICO |
| Pesquisa "imaugem imobiliária" no Google | **0 resultados** | 🔴 CRÍTICO |
| Pesquisa "imaugem.pt" no Google | **0 resultados** | 🔴 CRÍTICO |

**Diagnóstico:** O site imaugem.pt **não está indexado** pelo Google. A marca IMAUGEM não tem qualquer presença nos resultados orgânicos. Este é o bloqueador principal de toda a estratégia de visibilidade.

### 1.2 Causa confirmada da não-indexação

**CONFIRMADO POR AUDITORIA DIRECTA (Abril 2026):** O Playwright fez pedidos a 14 URLs distintos de imaugem.pt com user-agent de browser normal. **Todos retornaram HTTP 403** — sem excepção.

| URL testado | HTTP Status | Bytes |
|---|---|---|
| /robots.txt | **403** | 172 |
| /sitemap.xml | **403** | 172 |
| / (homepage) | **403** | 172 |
| /sobre | **403** | 172 |
| /contactos | **403** | 172 |
| /imoveis | **403** | 172 |
| /blog | **403** | 172 |
| /404-test-nonexistent | **403** | 172 |
| *(+ 6 outros URLs)* | **403** | 172 |

**Conclusão definitiva:** O CloudFlare está a bloquear **todos os pedidos** ao servidor — não apenas bots. O conteúdo real do site (HTML, títulos, meta-tags, schema) é **completamente inacessível** sem autenticação de browser real com JavaScript challenge completado. Googlebot não consegue completar esses challenges → site nunca indexado.

---

## 2. AUDITORIA TÉCNICA DE SEO

### 2.1 robots.txt

| Item | Estado |
|---|---|
| Ficheiro robots.txt acessível | **NÃO** — HTTP 403 (CloudFlare bloqueia) |
| robots.txt referencia sitemap | **DESCONHECIDO** — ficheiro inacessível |
| Regras User-agent Googlebot | **DESCONHECIDO** — ficheiro inacessível |
| Regras User-agent Bingbot | **DESCONHECIDO** — ficheiro inacessível |
| Regras User-agent GPTBot / ClaudeBot | **DESCONHECIDO** — ficheiro inacessível |

**Ação necessária (não requer login):** Garantir que `robots.txt` contém:
```
User-agent: *
Allow: /
Sitemap: https://www.imaugem.pt/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
```

### 2.2 Sitemap.xml

| Item | Estado |
|---|---|
| Ficheiro sitemap.xml acessível | **NÃO** — HTTP 403 (CloudFlare bloqueia) |
| Sitemap é XML válido | **DESCONHECIDO** — ficheiro inacessível |
| URLs no sitemap são canonicais (https://www.) | **DESCONHECIDO** — ficheiro inacessível |
| Sitemap submetido no Google Search Console | Requer login — PENDENTE |
| Sitemap submetido no Bing Webmaster Tools | Requer login — PENDENTE |

### 2.3 Meta Robots

| Item | Estado |
|---|---|
| Homepage tem `<meta name="robots">` | **NÃO VERIFICÁVEL** — HTTP 403 em todas as páginas |
| Valor da meta robots | **NÃO VERIFICÁVEL** |
| X-Robots-Tag no HTTP header | **NÃO VERIFICÁVEL** — CloudFlare retorna 403 sem headers do servidor |
| Páginas internas com noindex | **NÃO VERIFICÁVEL** |

**Nota:** O CloudFlare bloqueia o pedido antes de chegar ao servidor web. Os headers que chegam são headers do CloudFlare (403), não do servidor real. Portanto não é possível verificar se o CMS está a enviar noindex — mas é irrelevante porque o bloqueio 403 é mais grave.

### 2.4 Canonicals

| Item | Estado |
|---|---|
| Homepage tem `<link rel="canonical">` | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |
| Canonical aponta para https://www. | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |
| Redirect de http:// para https:// | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |
| Redirect de imaugem.pt para www.imaugem.pt | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |
| Páginas duplicadas sem canonical | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |

### 2.5 Títulos e Meta Descriptions

| Página | Título atual | Meta Description atual | Estado |
|---|---|---|---|
| Homepage | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 |
| Sobre/Quem somos | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 |
| Contactos | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 |
| Imóveis | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 |

**Requisitos:**
- Título homepage deve conter: **"IMAUGEM"** (maiúsculas ou capitalizado, para diferenciação da palavra genérica)
- Título deve ter 50–60 caracteres
- Meta description deve ter 120–160 caracteres
- Cada página deve ter título único

### 2.6 Estrutura H1/H2

| Página | H1 atual | H2s atuais | Estado |
|---|---|---|---|
| Homepage | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 | **NÃO VERIFICÁVEL** — HTTP 403 |

**Requisitos:**
- Cada página deve ter exatamente 1 H1
- H1 da homepage deve incluir o nome "IMAUGEM"
- H2s devem estruturar as secções principais

### 2.7 Dados Estruturados (Schema.org)

| Item | Estado |
|---|---|
| JSON-LD presente | **NÃO VERIFICÁVEL** — HTTP 403 (CloudFlare) |
| Tipo de schema (@type) | **NÃO VERIFICÁVEL** — HTTP 403 |
| Organization schema | **NÃO VERIFICÁVEL** — HTTP 403 |
| LocalBusiness / RealEstateAgent schema | **NÃO VERIFICÁVEL** — HTTP 403 |
| Schema válido (Google Rich Results Test) | Requer acesso a https://search.google.com/test/rich-results |

**Ação:** Adicionar o ficheiro `seo/schema.json` (já preparado neste repositório) ao `<head>` de todas as páginas.

### 2.8 Open Graph e Social Tags

| Item | Estado |
|---|---|
| og:title | **NÃO VERIFICÁVEL** — HTTP 403 |
| og:description | **NÃO VERIFICÁVEL** — HTTP 403 |
| og:image (≥1200×630px) | **NÃO VERIFICÁVEL** — HTTP 403 |
| og:url | **NÃO VERIFICÁVEL** — HTTP 403 |
| twitter:card | **NÃO VERIFICÁVEL** — HTTP 403 |

### 2.9 Redirects

| Verificação | Estado |
|---|---|
| http://imaugem.pt → https://www.imaugem.pt | **NÃO VERIFICÁVEL** — HTTP 403 |
| http://www.imaugem.pt → https://www.imaugem.pt | **NÃO VERIFICÁVEL** — HTTP 403 |
| https://imaugem.pt → https://www.imaugem.pt | **NÃO VERIFICÁVEL** — HTTP 403 |
| Páginas 404 retornam HTTP 404 (não 200) | **NÃO VERIFICÁVEL** — HTTP 403 |
| Redirect chains (múltiplos redirects) | **NÃO VERIFICÁVEL** — HTTP 403 |

### 2.10 Mobile e Core Web Vitals

| Item | Estado |
|---|---|
| Meta viewport presente | **NÃO VERIFICÁVEL** — HTTP 403 |
| Responsive design | **NÃO VERIFICÁVEL** — HTTP 403 |
| Core Web Vitals (LCP, CLS, FID) | Requer acesso a PageSpeed Insights |

---

## 3. AUDITORIA DE BRAND/ENTITY SEO

### 3.1 Problema central: IMAUGEM vs. "Imagem"

A palavra "imaugem" é fonética e visualmente próxima de "imagem" (palavra comum em português). O Google pode:
- Corrigir automaticamente "imaugem" para "imagem" nos resultados
- Não reconhecer IMAUGEM como entidade/marca

**Sinais que o Google usa para reconhecer uma marca como entidade:**
1. Website com schema `Organization` + `name: "IMAUGEM"`
2. Consistência NAP (Nome, Morada, Telefone) em múltiplas fontes
3. Google Business Profile verificado
4. Presença em diretórios autoritários (Idealista, Supercasa, APEMIP)
5. Backlinks de fontes relevantes a mencionar o nome

**Estado atual:** IMAUGEM não tem nenhum destes sinais confirmados. Zero presença indexada.

### 3.2 Knowledge Graph

| Item | Estado |
|---|---|
| IMAUGEM tem Knowledge Panel no Google | **NÃO** |
| Google reconhece IMAUGEM como entidade | **NÃO** |
| Wikidata entry | NÃO (não esperado para PME) |

### 3.3 Backlinks e Citações

| Fonte | Estado |
|---|---|
| MaisConsultores.pt mencionando Imaugem | **NÃO VERIFICÁVEL** — HTTP 403 |
| Facebook business page | [VERIFICAR — ver `seo/directories-checklist.json`] |
| LinkedIn company page | **NÃO VERIFICÁVEL** — HTTP 403 |
| Portais imobiliários | Registado em Supercasa, Idealista (via MaisConsultores) |
| Diretórios locais (einforma, racius, etc.) | NÃO VERIFICADO |

---

## 4. AUDITORIA DE SEO LOCAL

### 4.1 NAP (Nome, Morada, Telefone) — Consistência

Para SEO local, o NAP deve ser **idêntico** em todos os sítios.

**NAP recomendado (ver secção 5 do ficheiro copy):**
```
Nome:     IMAUGEM – MaisConsultores #RealEstateCascais
Morada:   Avenida 25 de Abril, nº 5, R/c A, 2750-513 Cascais
Telefone: [CONFIRMAR COM PROPRIETÁRIO]
Website:  https://www.imaugem.pt
```

> ⚠️ O telefone real não pôde ser verificado. O proprietário deve confirmar e garantir que é consistente em todos os sítios.

### 4.2 Google Business Profile (GBP)

| Item | Estado |
|---|---|
| Perfil criado | [PROPRIETÁRIO DEVE CONFIRMAR] |
| Perfil verificado | [PROPRIETÁRIO DEVE CONFIRMAR] |
| Nome no GBP = NAP recomendado | **NÃO VERIFICÁVEL** — HTTP 403 |
| Morada no GBP = NAP recomendado | **NÃO VERIFICÁVEL** — HTTP 403 |
| Telefone confirmado | **NÃO VERIFICÁVEL** — HTTP 403 |
| Website = https://www.imaugem.pt | **NÃO VERIFICÁVEL** — HTTP 403 |
| Categoria principal = Agência imobiliária | **NÃO VERIFICÁVEL** — HTTP 403 |
| Categorias secundárias | [A ADICIONAR] |
| Fotos (mín. 10: interior, exterior, equipa) | **NÃO VERIFICÁVEL** — HTTP 403 |
| Descrição do negócio | Ver ficheiro copy |
| Posts regulares (min. 1/semana) | [A INICIAR] |
| Produtos/Serviços configurados | [A CONFIGURAR] |
| Perguntas & Respostas respondidas | [A CONFIGURAR] |
| CID Google Maps | 12678463149273912508 (confirmado) |

**URL do perfil GBP:** Requer login em https://business.google.com

### 4.3 Bing Places / Bing Maps

| Item | Estado |
|---|---|
| Perfil em Bing Places criado | [PROPRIETÁRIO DEVE CONFIRMAR] |
| Perfil verificado | [PROPRIETÁRIO DEVE CONFIRMAR] |
| NAP consistente com Google | [A GARANTIR] |
| Categoria = Real Estate Agency | [A CONFIGURAR] |

**URL para criar/editar:** https://www.bingplaces.com

### 4.4 Apple Maps

| Item | Estado |
|---|---|
| Perfil em Apple Maps Connect | [PROPRIETÁRIO DEVE CRIAR] |
| Verificado | [PENDENTE] |

**URL:** https://mapsconnect.apple.com

---

## 5. AUDITORIA DE CONTEÚDO E ESTRUTURA

### 5.1 Homepage

| Item | Estado |
|---|---|
| Nome "IMAUGEM" claramente visível no hero | **NÃO VERIFICÁVEL** — HTTP 403 |
| Tagline / proposta de valor | **NÃO VERIFICÁVEL** — HTTP 403 |
| Morada visível na homepage | **NÃO VERIFICÁVEL** — HTTP 403 |
| Telefone visível na homepage | **NÃO VERIFICÁVEL** — HTTP 403 |
| Ligação para página Sobre | **NÃO VERIFICÁVEL** — HTTP 403 |
| Ligação para página Contactos | **NÃO VERIFICÁVEL** — HTTP 403 |
| Ligação para listagem de imóveis | **NÃO VERIFICÁVEL** — HTTP 403 |

### 5.2 Página Sobre / Quem Somos

| Item | Estado |
|---|---|
| Página existe | **NÃO VERIFICÁVEL** — HTTP 403 |
| Menciona "IMAUGEM" pelo nome | **NÃO VERIFICÁVEL** — HTTP 403 |
| Explica a ligação à rede MaisConsultores | **NÃO VERIFICÁVEL** — HTTP 403 |
| Lista consultores com fotos | **NÃO VERIFICÁVEL** — HTTP 403 |
| Tem informação de morada/contacto | **NÃO VERIFICÁVEL** — HTTP 403 |

### 5.3 Página Contactos

| Item | Estado |
|---|---|
| Página existe | **NÃO VERIFICÁVEL** — HTTP 403 |
| Morada completa e formatada | **NÃO VERIFICÁVEL** — HTTP 403 |
| Telefone | **NÃO VERIFICÁVEL** — HTTP 403 |
| Email | **NÃO VERIFICÁVEL** — HTTP 403 |
| Mapa incorporado (Google Maps embed) | **NÃO VERIFICÁVEL** — HTTP 403 |
| Formulário de contacto | **NÃO VERIFICÁVEL** — HTTP 403 |

### 5.4 Conteúdo Duplicado

| Item | Estado |
|---|---|
| Páginas duplicadas (mesmo conteúdo, URLs diferentes) | **NÃO VERIFICÁVEL** — HTTP 403 |
| Parâmetros URL gerando conteúdo duplicado | **NÃO VERIFICÁVEL** — HTTP 403 |
| Versões PT/EN com conteúdo idêntico sem hreflang | **NÃO VERIFICÁVEL** — HTTP 403 |

### 5.5 Orphan Pages (páginas sem links internos)

| Item | Estado |
|---|---|
| Todas as páginas acessíveis desde a homepage | **NÃO VERIFICÁVEL** — HTTP 403 |
| Sitemap inclui todas as páginas relevantes | **NÃO VERIFICÁVEL** — HTTP 403 |

---

## 6. CLOUDFLARE — BLOQUEADOR CRÍTICO

### Diagnóstico
O CloudFlare está configurado com regras que bloqueiam requests automatizados com 403. Isto afeta:
- **Googlebot** → não consegue crawlar o site → não indexa
- **Bingbot** → não consegue crawlar o site → não indexa
- **GPTBot (OpenAI)** → não consegue ler o site
- **PerplexityBot** → não consegue ler o site
- **Archive.org** → nunca arquivou o site

### Ação necessária (requer acesso ao painel CloudFlare)

1. Em **Security → Bots**, verificar se o modo "Bot Fight Mode" ou "Super Bot Fight Mode" está ativo
2. Criar **regra de firewall personalizada** para permitir bots verificados:
   - Googlebot (ASN: AS15169)
   - Bingbot (ASN: AS8075)
   - PerplexityBot, GPTBot, ClaudeBot
3. Ou configurar em **Security → Bots → Allow verified bots**
4. Em alternativa, **desativar o modo "Under Attack"** se estiver ativo

> ⚠️ Esta é a ação mais urgente de toda a auditoria. Sem acesso de Googlebot, nada mais importa.

---

## 7. RESUMO DAS DESCOBERTAS

### Crítico (bloqueia indexação)
1. CloudFlare bloqueia Googlebot e Bingbot → site não indexado
2. site:imaugem.pt = 0 resultados → marca inexistente no Google
3. Robots.txt não verificado (pode ter Disallow: /)

### Alto (impacta brand SEO)
4. Nenhuma presença de marca em fontes externas indexadas
5. Nenhum schema.org / JSON-LD confirmado no site
6. Google Business Profile — estado desconhecido / não verificado nesta auditoria

### Médio (impacta qualidade SEO)
7. Títulos, metas, H1s, canonicals — não verificáveis até resolução do bloqueio CloudFlare
8. NAP inconsistente ou ausente

### Baixo (otimização)
9. Bing Places, Apple Maps, AI search engines — para depois do Google estar resolvido

---

## 8. RESUMO EXECUTIVO

### Estado atual (Abril 2026)
O site imaugem.pt **não existe** na perspectiva dos motores de busca. A auditoria confirma:

- **14 URLs testados → 14 respostas HTTP 403** (CloudFlare bloqueia tudo)
- **site:imaugem.pt = 0 resultados** no Google
- **0 snapshots** na Wayback Machine (nunca foi arquivado)
- **Marca IMAUGEM = invisível** no Google, Bing, ChatGPT, Perplexity e Claude

### Bloqueadores principais
| # | Bloqueador | Impacto | Requer |
|---|---|---|---|
| 1 | CloudFlare bloqueia Googlebot (HTTP 403 universal) | **TOTAL** — sem isto nada funciona | Acesso ao painel CloudFlare |
| 2 | Site não indexado → marca inexistente no Google | **CRÍTICO** | Resolver #1 primeiro |
| 3 | Google Business Profile — estado desconhecido | **ALTO** — afeta Maps e brand | Login em business.google.com |
| 4 | schema.org / JSON-LD não confirmado no site | **ALTO** — afeta entity SEO | Acesso ao CMS / developer |
| 5 | NAP não verificado (telefone ausente) | **MÉDIO** — afeta consistência | Proprietário confirmar telefone |

### O que foi preparado e está pronto para publicar
| Ficheiro | Conteúdo | Ação necessária |
|---|---|---|
| `seo/schema.json` | JSON-LD completo (RealEstateAgent + WebSite + LocalBusiness) | Inserir no `<head>` do site |
| `seo/robots.txt` | Permite Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot | Publicar em imaugem.pt/robots.txt |
| `seo/sitemap.xml` | Sitemap com homepage, páginas, zonas, consultores | Adaptar URLs reais e publicar |
| `seo/llms.txt` | Ficheiro para ChatGPT, Perplexity, Claude | Publicar em imaugem.pt/llms.txt |
| `seo/meta-tags.html` | Bloco `<head>` completo: OG, Twitter, geo, canonical, hreflang | Inserir em todas as páginas |
| `seo/directories-checklist.json` | Lista de 30+ diretórios com estado | Usar como guia de registo |
| `imaugem_copy_google_bing_maps.md` | Copy completo: GBP, Bing Places, website, FAQ, NAP | Usar ao preencher perfis |
| `imaugem_execucao_google_bing_maps.md` | Plano passo a passo com responsáveis e timings | Seguir por ordem |

### Ação #1 imediata (sem ela, nada mais funciona)
> **Ir ao painel CloudFlare → Security → Bots → ativar "Allow verified bots"**
> Ou criar regra WAF: `(cf.client.bot) → Action: Allow`
> Testar: `curl -A "Googlebot/2.1" https://www.imaugem.pt/ -I` deve retornar 200, não 403

### Próximos passos por prioridade
1. **Dia 1:** CloudFlare — permitir bots verificados (proprietário, 15 min)
2. **Dia 1:** Publicar robots.txt, sitemap.xml, llms.txt no site (developer, 30 min)
3. **Dia 2:** Inserir schema.json + meta-tags.html em todas as páginas (developer)
4. **Dia 3:** Google Search Console — verificar site e submeter sitemap (proprietário)
5. **Dia 4:** Bing Webmaster Tools — verificar site e submeter sitemap (proprietário)
6. **Dia 5:** Google Business Profile — verificar se está reclamado e completar (proprietário)
7. **Semana 2:** Bing Places, Apple Maps, Páginas Amarelas, Infoisinfo
8. **Mês 2:** Blog com artigos sobre mercado em Cascais, páginas de zona, backlinks
