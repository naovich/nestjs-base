# 🔐 NestJS Base - Authentication Module

**NestJS project with complete authentication system and VibeCoding guardrails**

Based on the VibeCoding NestJS template with all quality guardrails pre-configured.

> 🎯 **Objectif:** Projet NestJS complet avec authentification (JWT, refresh tokens, guards) et toutes les **configurations strictes** déjà en place.

---

## 🚀 Démarrer un Nouveau Projet

### 1. Cloner le Template

```bash
# Cloner dans un nouveau dossier
git clone https://github.com/naovich/vibecoding-nestjs.git mon-nouveau-projet
cd mon-nouveau-projet

# Supprimer l'historique Git du template
rm -rf .git

# Initialiser un nouveau repo Git
git init
git add .
git commit -m "chore: init from vibecoding-nestjs template"
```

### 2. Personnaliser

```bash
# Mettre à jour package.json
npm pkg set name="mon-nouveau-projet"
npm pkg set description="Description de mon projet"
npm pkg set author="Votre Nom"

# Installer les dépendances
npm install
```

### 3. Développer

```bash
# Lancer le serveur de dev
npm run start:dev

# Tests en mode watch
npm test

# Build production
npm run build
```

### 4. Adapter le Contenu

- Modifier `src/` avec vos modules/controllers/services
- Créer vos DTOs, entities, modules selon vos besoins
- Mettre à jour `README.md` avec la doc de votre projet
- **Garder** `AGENT.md` et `CLAUDE.md` pour les règles de développement

---

## ⚡ Quick Start (Développement)

```bash
npm install          # Installation
npm run start:dev    # Développement
npm test             # Tests
npm run build        # Build production
```

---

## 🎯 Ce Que Ce Template N'EST PAS

Ce template **ne fournit pas** de code pré-fait:

- ❌ Pas de modules métier (Users, Auth, etc.)
- ❌ Pas de base de données configurée
- ❌ Pas d'authentification
- ❌ Pas de structure folders imposée
- ❌ Pas d'ORM (Prisma/TypeORM/Mongoose)

**Pourquoi ?** Parce que **ça dépend de votre projet**.

---

## ✅ Ce Que Ce Template FOURNIT

Des **guardrails** pour que l'IA et les devs ne fassent pas n'importe quoi:

### 1. **Configurations Strictes**

- ✅ **TypeScript Strict Mode** - Zero tolerance pour `: any`
- ✅ **ESLint + SonarJS** - Complexité max 15
- ✅ **Prettier + Husky** - Auto-format au commit
- ✅ **Jest TDD** - Coverage minimum 80%
- ✅ **Line Endings** - LF uniquement (pas de CRLF)

### 2. **Documentation IA**

- ✅ **AGENT.md** - Guide complet avec toutes les règles pour devs et IA
- ✅ **CLAUDE.md** - Instructions pour Claude Code CLI
- ✅ **FILE_TREE.md** - Arborescence auto-générée (pré-commit)
- ✅ **CODEBASE.md** - Carte des exports auto-générée (pré-commit)

### 3. **Quality Gates Automatiques**

**Pre-commit hooks** (bloquent si échec):

- ✅ Génération FILE_TREE.md + CODEBASE.md
- ✅ ESLint --fix (lint + format)
- ✅ TypeScript type-check
- ✅ Tests sur fichiers modifiés

**Pre-push hooks** (bloquent si échec):

- ✅ Build TypeScript complet
- ✅ Tous les tests
- ✅ Vérification coverage ≥ 80%

**Commit message hook**:

- ✅ Format obligatoire: `type(scope): description`

Résultat : **Impossible de pusher du mauvais code** 🎯

---

## 📚 Documentation Automatique

Deux fichiers sont **générés automatiquement** avant chaque commit :

### 📄 `CODEBASE.md`

**Carte de tous les exports du projet** (functions, classes, types)

- Généré par : `npm run map`
- Contenu : Signatures + JSDoc de tous les exports
- Usage : **Éviter les duplications** - consulte ce fichier avant de créer une nouvelle fonction/service

**Exemple :**

```markdown
## 📁 src/

### app.service.ts

**Functions:**

- `getHello` _(export)_
  - Returns a greeting message
```

### 📁 `FILE_TREE.md`

**Arborescence complète du projet**

- Généré par : `npm run tree`
- Contenu : Structure de tous les dossiers et fichiers
- Usage : Vue d'ensemble rapide de l'organisation

**Exemple :**

```
vibecoding-nestjs/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
└── test/
```

---

## 🛠️ Commandes Utiles

```bash
# Documentation (auto à chaque commit)
npm run docs              # Génère FILE_TREE.md + CODEBASE.md

# Documentation enrichie avec AI (optionnel)
npm run map:ai            # CODEBASE.md avec descriptions AI (Claude Code)

# Linting & Formatting
npm run lint              # Vérifier le code
npm run lint:fix          # Corriger automatiquement
npm run format            # Formatter avec Prettier

# Tests
npm test                  # Mode watch
npm run test:ci           # Run once
npm run test:cov          # Avec coverage

# Validation complète (pre-push)
npm run validate          # lint + type-check + tests
```

---

## 🔧 Configuration

### Règles ESLint Strictes

Le projet enforce automatiquement :

- **SonarJS** : Qualité de code (complexité, duplications)
- **Unicorn** : Best practices modernes (Node.js, String methods)
- **JSDoc** : Documentation obligatoire sur exports
- **TypeScript** : No `any`, explicit return types
- **Line Endings** : LF uniquement (pas de CRLF)

Tout commit qui viole ces règles est **automatiquement bloqué**.

---

## 🚨 Workflow de Développement

### 1. Avant de coder

```bash
# Vérifier si la fonction/service existe déjà
cat CODEBASE.md | grep "functionName"
cat FILE_TREE.md | grep "ServiceName"
```

**⚠️ DRY Principle** : Consulte `CODEBASE.md` **avant** de créer du code. Si quelque chose de similaire existe, réutilise ou refactorise.

### 2. Pendant le développement

```bash
# TDD : Tests FIRST !
npm test                 # Mode watch

# Type checking en continu
npm run type-check:watch
```

### 3. Avant le commit

Les **pre-commit hooks** exécutent automatiquement :

- ✅ Génération de FILE_TREE.md + CODEBASE.md
- ✅ ESLint --fix (corrige ce qui peut l'être)
- ✅ Prettier --write (formatage)
- ✅ TypeScript type-check
- ✅ Tests sur fichiers modifiés

**Si ça échoue → commit bloqué**. Corrige les erreurs et recommit.

### 4. Avant le push

Les **pre-push hooks** exécutent :

- ✅ Build TypeScript complet
- ✅ Tous les tests
- ✅ Vérification coverage ≥ 80%

**Sois patient, ça prend ~60 secondes.**

---

## 📝 Convention de Commit

```bash
type(scope): description

# Types valides:
feat, fix, docs, style, refactor, perf, test, build, ci, chore

# Exemples:
git commit -m "feat(users): add user authentication"
git commit -m "fix(auth): resolve token expiration bug"
git commit -m "docs: update README"
```

**Format obligatoire** - commitlint bloquera sinon.

---

## 📖 Documentation Développeur

- [`AGENT.md`](./AGENT.md) - **Guide complet** pour développeurs et AI agents (toutes les règles)
- [`CLAUDE.md`](./CLAUDE.md) - Instructions pour Claude Code CLI
- [`CODEBASE.md`](./CODEBASE.md) - Carte des exports (auto-généré)
- [`FILE_TREE.md`](./FILE_TREE.md) - Arborescence projet (auto-généré)

---

## 🎓 Apprendre Plus

Lis [`AGENT.md`](./AGENT.md) pour :

- Règles de code détaillées
- Best practices NestJS/TypeScript
- Exemples complets
- Workflow TDD
- Guide de debugging

---

## 🧩 Extensions Recommandées

### ORM / Database

```bash
# Prisma
npm install @prisma/client
npm install -D prisma
npx prisma init

# TypeORM
npm install @nestjs/typeorm typeorm mysql2

# Mongoose
npm install @nestjs/mongoose mongoose
```

### Authentication

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

### Validation

```bash
npm install class-validator class-transformer
```

### Config

```bash
npm install @nestjs/config
```

### Swagger

```bash
npm install @nestjs/swagger swagger-ui-express
```

---

**Template créé avec ❤️ pour des projets maintenables et évolutifs.**

**Principe:** Minimal setup + guardrails maximaux = IA qui ne fait pas n'importe quoi 🤖
