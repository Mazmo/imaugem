# IMAUGEM — Cloudflare Fix: Unblock Search Engine Crawlers

**Data:** Abril 2026
**Domínio:** www.imaugem.pt
**IP confirmado:** 104.21.86.253 (rede Cloudflare)
**Problema:** site:imaugem.pt = 0 resultados no Google. O Googlebot não consegue indexar o site.

---

## DIAGNÓSTICO CONFIRMADO

A auditoria confirma que **todos os pedidos automatizados a imaugem.pt retornam HTTP 403**.
O IP `104.21.86.253` pertence à rede Cloudflare (ASN AS13335).
A ausência de resultados no Google + Wayback Machine (0 snapshots) confirma que **nenhum crawler consegue aceder ao site**.

**Possíveis fontes do bloqueio no Cloudflare (verificar por esta ordem):**

| # | Fonte | Onde verificar | Probabilidade |
|---|---|---|---|
| 1 | Bot Fight Mode / Super Bot Fight Mode | Security → Bots | 🔴 Alta |
| 2 | WAF Managed Rules (OWASP / Cloudflare) | Security → WAF → Managed Rules | 🟠 Média |
| 3 | Custom Rules / Firewall Rules existentes | Security → WAF → Custom Rules | 🟠 Média |
| 4 | Rate Limiting Rules | Security → WAF → Rate Limiting | 🟡 Baixa |
| 5 | Under Attack Mode activo | Overview do domínio | 🟡 Baixa |
| 6 | Bloqueio na origem (servidor) | Origin → configuração do servidor | 🟡 Baixa |

---

## SOLUÇÃO COMPLETA — EXECUTAR POR ESTA ORDEM

### PASSO 1 — Criar WAF Custom Rule para permitir verified bots (MAIS IMPORTANTE)

**Caminho:** Cloudflare Dashboard → imaugem.pt → Security → WAF → Custom Rules → Create Rule

**Configuração da regra:**

```
Nome da regra:   Allow Verified Search Bots
Descrição:       Permite Googlebot, Bingbot e outros crawlers verificados

Expressão (modo visual):
  Campo: Bot Management → Verified Bot
  Operador: equals
  Valor: true

OU em modo de texto (Expression Editor):
  (cf.bot_management.verified_bot)

Acção:  Skip
Skip:   ✅ All remaining custom rules
        ✅ Super Bot Fight Mode rules
        ✅ WAF Managed Rules
        ✅ Rate limiting rules

Posição: PRIMEIRO na lista (mais alta prioridade)
```

**Se "Verified Bot" não estiver disponível no plano**, usar esta expressão alternativa:

```
(http.user_agent contains "Googlebot") or
(http.user_agent contains "bingbot") or
(http.user_agent contains "Bingbot") or
(http.user_agent contains "AdsBot-Google") or
(http.user_agent contains "Mediapartners-Google") or
(http.user_agent contains "GPTBot") or
(http.user_agent contains "ClaudeBot") or
(http.user_agent contains "PerplexityBot") or
(http.user_agent contains "DuckDuckBot") or
(http.user_agent contains "archive.org_bot") or
(http.user_agent contains "ia_archiver")
```

> ⚠️ Nota: A correspondência por User-Agent é menos segura (pode ser falsificada). A opção `cf.bot_management.verified_bot` é recomendada quando disponível (planos Pro+).

---

### PASSO 2 — Verificar e corrigir Bot Fight Mode

**Caminho:** Cloudflare Dashboard → imaugem.pt → Security → Bots

**Opções possíveis:**

| Configuração que pode ver | O que fazer |
|---|---|
| Bot Fight Mode: ON | Deixar ON, mas garantir que a regra do Passo 1 está criada |
| Super Bot Fight Mode: Definitely Automated → Block | Mudar para **Allow** ou **Log** |
| Super Bot Fight Mode: Verified Bots → Block | Mudar para **Allow** |
| Super Bot Fight Mode: Verified Bots → Allow | ✅ Correcto — não alterar |

**Configuração correcta do Super Bot Fight Mode (se disponível):**
- Definitely automated: `Allow` ou `Managed Challenge`
- Verified bots: `Allow`
- Static resource protection: pode manter ON
- Crawler hints: **Activar** (ajuda o Googlebot)

---

### PASSO 3 — Verificar Under Attack Mode

**Caminho:** Cloudflare Dashboard → imaugem.pt → Overview (painel direito)

- Se o nível de segurança aparecer como **"I'm Under Attack!"** → mudar para **"High"** ou **"Medium"**
- "I'm Under Attack!" lança um JavaScript challenge que Googlebot não consegue completar

---

### PASSO 4 — Verificar WAF Managed Rules

**Caminho:** Cloudflare Dashboard → imaugem.pt → Security → WAF → Managed Rules

- Verificar se existem regras que possam estar a bloquear bots com base em padrões de request
- A regra criada no Passo 1 com `Skip: WAF Managed Rules` já deve resolver isto

---

### PASSO 5 — Verificar Custom Rules / Firewall Rules existentes

**Caminho:** Cloudflare Dashboard → imaugem.pt → Security → WAF → Custom Rules

- Verificar se existe alguma regra que bloqueie por IP, ASN, país, ou padrão de request
- Mover a nova regra do Passo 1 para o TOPO da lista

---

### PASSO 6 — Activar Crawler Hints (recomendado)

**Caminho:** Cloudflare Dashboard → imaugem.pt → Speed → Optimization → Crawler Hints

- Activar: **ON**
- Esta funcionalidade notifica o Google e Bing quando o conteúdo muda (como um sitemap em tempo real)

---

## VERIFICAÇÃO — Como confirmar que funcionou

Após aplicar as alterações, testar com:

```bash
# Testar com Googlebot user-agent
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -sI https://www.imaugem.pt/ | grep -E "HTTP|cf-ray|server|x-robots"

# Resultado esperado DEPOIS da correção:
# HTTP/2 200
# server: cloudflare
# cf-ray: [algum valor]

# Resultado ANTES (erro):
# HTTP/2 403
```

**Também verificar em:**
- Google Search Console → URL Inspection → `https://www.imaugem.pt/` → Test Live URL
- Bing Webmaster Tools → URL Inspection

---

## REGRA WAF COMPLETA — Formato JSON (para importação/referência)

```json
{
  "description": "Allow Verified Search Bots",
  "expression": "(cf.bot_management.verified_bot)",
  "action": "skip",
  "action_parameters": {
    "ruleset": "current",
    "phases": [
      "http_request_firewall_custom",
      "http_request_firewall_managed",
      "http_ratelimit",
      "http_request_sbfm"
    ],
    "products": [
      "waf",
      "rateLimit",
      "bic",
      "hot",
      "securityLevel"
    ]
  },
  "enabled": true
}
```

---

## APÓS RESOLVER O CLOUDFLARE — Próximos passos imediatos

1. Publicar `robots.txt` → `https://www.imaugem.pt/robots.txt`
2. Publicar `sitemap.xml` → `https://www.imaugem.pt/sitemap.xml`
3. Publicar `llms.txt` → `https://www.imaugem.pt/llms.txt`
4. Inserir `schema.json` no `<head>` de todas as páginas (via `meta-tags.html`)
5. Google Search Console → verificar domínio → submeter sitemap
6. Bing Webmaster Tools → verificar domínio → submeter sitemap
7. Google Business Profile → verificar se está reclamado e completo

---

## REFERÊNCIAS CLOUDFLARE

- Bot Fight Mode: https://developers.cloudflare.com/bots/get-started/free/
- Super Bot Fight Mode: https://developers.cloudflare.com/bots/get-started/pro/
- WAF Custom Rules: https://developers.cloudflare.com/waf/custom-rules/
- Verified Bots: https://developers.cloudflare.com/bots/concepts/verified-bots/
- Crawler Hints: https://developers.cloudflare.com/speed/optimization/other/crawler-hints/
