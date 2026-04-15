# IMAUGEM — Plano de Execução: Google, Bing, Maps e Motores de Busca IA

**Data:** Abril 2026
**Domínio:** https://www.imaugem.pt
**Ficheiros de suporte:** `seo/schema.json`, `seo/llms.txt`, `seo/robots.txt`, `seo/sitemap.xml`, `seo/meta-tags.html`

---

## SEPARAÇÃO DE RESPONSABILIDADES

| O que foi feito/preparado (sem login externo) | O que requer login ou acesso do proprietário |
|---|---|
| schema.org JSON-LD completo (`seo/schema.json`) | Painel CloudFlare — permitir Googlebot/Bingbot |
| llms.txt pronto para publicar (`seo/llms.txt`) | Google Search Console — verificação e sitemap |
| robots.txt otimizado (`seo/robots.txt`) | Bing Webmaster Tools — verificação e sitemap |
| sitemap.xml template (`seo/sitemap.xml`) | Google Business Profile — completar e verificar |
| meta-tags HTML template (`seo/meta-tags.html`) | Bing Places — criar/verificar perfil |
| Checklist completa de diretórios | Apple Maps Connect — criar perfil |
| Copy pronto para todas as plataformas (ver ficheiro copy) | Redes sociais — publicar copy e atualizar perfis |
| Auditoria técnica detalhada | Portais imobiliários — registar/atualizar listagens |

---

## PASSO 1 — CLOUDFLARE (URGENTE — SEM ISTO NADA FUNCIONA)

**Responsável:** Proprietário (acesso ao painel CloudFlare)
**Tempo estimado:** 15 minutos
**Impacto:** Desbloqueia toda a indexação

### Ações no painel CloudFlare (cloudflare.com → domínio imaugem.pt):

**Opção A (recomendada) — Verificar configuração de Bots:**
1. Entrar em **Security → Bots**
2. Verificar se "Bot Fight Mode" ou "Super Bot Fight Mode" está ativado
3. Se sim, verificar se "Allow verified bots" está selecionado
4. Se não, ativar a opção que permite bots verificados (Googlebot, Bingbot incluídos automaticamente)

**Opção B — Criar regra de firewall explícita:**
1. Ir a **Security → WAF → Custom Rules**
2. Criar regra:
   - **Nome:** Allow Search Engine Bots
   - **Expressão:** `(cf.client.bot) or (http.user_agent contains "Googlebot") or (http.user_agent contains "bingbot")`
   - **Ação:** Allow
3. Colocar esta regra no topo (maior prioridade)

**Opção C — Se "Under Attack Mode" estiver ativo:**
1. Ir a **Overview** do domínio
2. Verificar o nível de segurança no painel direito
3. Se estiver em "Under Attack", mudar para "High" ou "Medium"

**Como confirmar que funcionou:**
```
# Testar com user-agent do Googlebot (via curl local):
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" https://www.imaugem.pt/ -I
# Deve retornar HTTP 200, não 403
```

---

## PASSO 2 — FICHEIROS TÉCNICOS NO SITE

**Responsável:** Proprietário / Developer do site
**Tempo estimado:** 30–60 minutos
**Pré-requisito:** Passo 1 concluído (CloudFlare configurado)

### 2.1 robots.txt
Substituir o `robots.txt` atual pelo conteúdo de `seo/robots.txt`.
Publicar em: `https://www.imaugem.pt/robots.txt`

### 2.2 sitemap.xml
Usar `seo/sitemap.xml` como base. Adaptar os URLs às páginas reais do site.
Publicar em: `https://www.imaugem.pt/sitemap.xml`

### 2.3 Schema.org JSON-LD
Adicionar o conteúdo de `seo/schema.json` como `<script type="application/ld+json">` no `<head>` de **todas** as páginas.

Ou, inserir o bloco completo de `seo/meta-tags.html` no `<head>` (inclui schema + OG + Twitter + geo tags).

### 2.4 llms.txt
Publicar o conteúdo de `seo/llms.txt` em:
`https://www.imaugem.pt/llms.txt`
(Para que ChatGPT, Perplexity, Claude e outros possam ler informação estruturada sobre o negócio)

### 2.5 Verificação de títulos e meta descriptions
Depois de acesso ao CMS, verificar/corrigir:

| Página | Título recomendado | Meta description recomendada |
|---|---|---|
| Homepage | `IMAUGEM – Imobiliária em Cascais \| Compra, Venda e Arrendamento` | `Agência imobiliária em Cascais. IMAUGEM, integrada na rede MaisConsultores #RealEstateCascais. Especialistas na Linha de Cascais, Estoril e arredores.` |
| Sobre/Quem Somos | `Quem Somos \| IMAUGEM – Imobiliária em Cascais` | `Conheça a equipa IMAUGEM. Consultores imobiliários especializados na Linha de Cascais, Estoril, Birre e São Domingos de Rana.` |
| Contactos | `Contactos \| IMAUGEM – Imobiliária em Cascais` | `Fale com a equipa IMAUGEM. Morada: Avenida 25 de Abril, nº 5, R/c A, 2750-513 Cascais. Contacte-nos para comprar, vender ou arrendar.` |
| Imóveis | `Imóveis em Cascais \| IMAUGEM` | `Veja todos os imóveis disponíveis na Linha de Cascais, Estoril e arredores. IMAUGEM – MaisConsultores #RealEstateCascais.` |

---

## PASSO 3 — GOOGLE SEARCH CONSOLE

**Responsável:** Proprietário
**URL:** https://search.google.com/search-console
**Tempo estimado:** 20 minutos

### Ações:
1. **Adicionar propriedade:** `https://www.imaugem.pt`
2. **Verificar** usando um destes métodos:
   - Tag HTML no `<head>` (método mais simples)
   - Ficheiro HTML na raiz do site
   - DNS record (requer acesso ao DNS)
3. **Submeter sitemap:** Search Console → Sitemaps → Adicionar `https://www.imaugem.pt/sitemap.xml`
4. **Solicitar indexação da homepage:** URL Inspection → Enter URL → Request Indexing
5. **Verificar cobertura:** após 48–72h, verificar em Indexing → Pages se existem erros

### O que monitorizar após verificação:
- Páginas indexadas vs. excluídas
- Erros de crawl (especialmente erros 403)
- Core Web Vitals
- Pesquisas que levam ao site (após indexação)

---

## PASSO 4 — BING WEBMASTER TOOLS

**Responsável:** Proprietário
**URL:** https://www.bing.com/webmasters
**Tempo estimado:** 15 minutos

### Ações:
1. **Criar conta** com conta Microsoft (Outlook/Hotmail)
2. **Adicionar site:** `https://www.imaugem.pt`
3. **Verificar** (método mais simples: tag meta no `<head>`)
4. **Submeter sitemap:** Sitemaps → Submit sitemap → `https://www.imaugem.pt/sitemap.xml`
5. **Importar do Google Search Console** (opção disponível no Bing WMT — poupa tempo)

> **Nota:** O Microsoft Copilot (IA da Microsoft) usa os dados do Bing. Estar bem indexado no Bing aumenta a visibilidade no Copilot.

---

## PASSO 5 — GOOGLE BUSINESS PROFILE

**Responsável:** Proprietário
**URL:** https://business.google.com
**Tempo estimado:** 45–60 minutos + 5 dias para verificação por carta/telefone

O Google Maps CID 12678463149273912508 está confirmado. O perfil existe no Google Maps. É necessário verificar se está **reclamado e verificado** pelo proprietário.

### Checklist de otimização do perfil:

**Informações básicas:**
- [ ] Nome: `IMAUGEM – MaisConsultores #RealEstateCascais` (consistente com NAP)
- [ ] Categoria principal: `Agência imobiliária`
- [ ] Categorias secundárias: `Empresa de gestão imobiliária`, `Consultoria de investimentos imobiliários`
- [ ] Morada: `Avenida 25 de Abril, nº 5, R/c A, 2750-513 Cascais`
- [ ] Telefone: [confirmar número real]
- [ ] Website: `https://www.imaugem.pt`
- [ ] Horário de funcionamento: [confirmar]

**Descrição do negócio:**
Usar o texto de "Google Business Description" do ficheiro `imaugem_copy_google_bing_maps.md`

**Fotos (mínimo recomendado):**
- [ ] Logo da empresa (400×400px mínimo)
- [ ] Foto da fachada do escritório
- [ ] Foto do interior do escritório
- [ ] Fotos da equipa
- [ ] 5–10 fotos de imóveis representativos
- [ ] Foto de capa (1080×608px)

**Serviços:**
- [ ] Adicionar serviços: Compra e venda de imóveis, Arrendamento, Avaliação imobiliária, Consultoria de investimento

**Posts (após verificação):**
- Publicar 1 post/semana com novos imóveis ou notícias do mercado
- Usar palavras "IMAUGEM", "Cascais", "imobiliária" consistentemente

---

## PASSO 6 — BING PLACES / BING MAPS

**Responsável:** Proprietário
**URL:** https://www.bingplaces.com
**Tempo estimado:** 20 minutos + verificação

### Ações:
1. Aceder a https://www.bingplaces.com
2. Pesquisar "IMAUGEM Cascais" — se o perfil já existir, reclamá-lo; se não, criá-lo
3. Preencher com o NAP exato (igual ao Google Business Profile)
4. Categoria: `Real Estate Agency`
5. Usar a descrição "Bing Places Description" do ficheiro copy
6. Verificar por telefone ou email

---

## PASSO 7 — APPLE MAPS CONNECT

**Responsável:** Proprietário
**URL:** https://mapsconnect.apple.com
**Tempo estimado:** 20 minutos + verificação

### Ações:
1. Criar conta Apple Business Connect
2. Adicionar o negócio com NAP consistente
3. Verificar por código SMS ou chamada

> Apple Maps alimenta Siri e Apple Intelligence. Relevante para utilizadores iPhone em Portugal.

---

## PASSO 8 — PORTAIS IMOBILIÁRIOS E DIRETÓRIOS

Ver `seo/directories-checklist.json` para lista completa.

**Prioridade máxima (impacto SEO local e brand):**
1. Páginas Amarelas Portugal: https://www.pai.pt
2. Infoisinfo Cascais: https://cascais.infoisinfo.com.pt
3. Kyero (mercado inglês): https://www.kyero.com/add-your-property
4. Rightmove Overseas: https://www.rightmove.co.uk/overseas/

**Regra:** Em todos os diretórios, usar exatamente o mesmo NAP. Qualquer diferença (abreviatura, formato de telefone, etc.) dilui os sinais de SEO local.

---

## PASSO 9 — MOTORES DE BUSCA IA (ChatGPT, Perplexity, Gemini, Copilot)

**Nota:** Os motores de busca IA não têm um "portal de registo". A visibilidade neles é consequência da visibilidade no Google/Bing + conteúdo estruturado.

| Motor IA | Como melhorar visibilidade |
|---|---|
| Google Gemini / AI Overviews | GBP completo + schema.org + bom posicionamento Google |
| Microsoft Copilot | Bing bem indexado + Bing Places verificado |
| ChatGPT (Search) | Bing indexado + llms.txt em imaugem.pt/llms.txt |
| Perplexity | Google + Bing indexados. Perplexity usa múltiplas fontes |
| Claude (Anthropic) | llms.txt + presença em Common Crawl (fontes públicas indexadas) |

**Ação técnica:** Publicar `seo/llms.txt` em `https://www.imaugem.pt/llms.txt` e adicionar `<link rel="llms" href="/llms.txt" type="text/plain">` no `<head>`.

---

## PLANO DE 7 DIAS / 30 DIAS / 90 DIAS

### 7 Dias — Desbloqueio urgente
| Dia | Ação | Responsável |
|---|---|---|
| 1 | Corrigir CloudFlare (permitir Googlebot/Bingbot) | Proprietário |
| 1 | Publicar robots.txt, sitemap.xml, llms.txt no site | Developer |
| 2 | Adicionar schema.org JSON-LD a todas as páginas | Developer |
| 2 | Verificar e corrigir títulos + meta descriptions | Developer |
| 3 | Adicionar site ao Google Search Console + verificar | Proprietário |
| 3 | Submeter sitemap no Google Search Console | Proprietário |
| 4 | Solicitar indexação das páginas principais | Proprietário |
| 4 | Adicionar site ao Bing Webmaster Tools | Proprietário |
| 5 | Verificar Google Business Profile — reclamar/verificar | Proprietário |
| 5 | Completar todas as informações do GBP | Proprietário |
| 6 | Adicionar fotos ao GBP (mínimo 5) | Proprietário |
| 7 | Criar perfil em Bing Places | Proprietário |

### 30 Dias — Consolidação
| Semana | Ações |
|---|---|
| 2 | Adicionar fotos a GBP (completar 10+). Primeiro post no GBP. |
| 2 | Registar em Páginas Amarelas e Infoisinfo Cascais |
| 3 | Criar Apple Maps Connect. Verificar indexação no Google Search Console. |
| 3 | Registar em Kyero e Green-Acres (mercado internacional) |
| 4 | Verificar se Google indexou o site (site:imaugem.pt deve ter resultados) |
| 4 | Publicar 4 posts no GBP (1/semana). Monitorizar CTR. |

### 90 Dias — Crescimento
| Mês | Ações |
|---|---|
| 2 | Criar/otimizar página de blog com artigos sobre mercado em Cascais |
| 2 | Criar páginas de localização (Cascais, Estoril, Birre, São Domingos de Rana) |
| 2 | Registar em Rightmove e Zoopla (mercado UK) |
| 3 | Monitorizar Knowledge Panel — verificar se o Google cria automaticamente |
| 3 | Campanha de pedido de avaliações no GBP |
| 3 | Submeter a mais 5 diretórios locais |
| 3 | Verificar ranking para "imobiliária cascais" e variantes |
