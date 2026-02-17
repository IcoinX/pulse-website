# BRIEF IMPLEMENTATION — PULSE LOGIN HUMAIN (MVP)

## 🎯 OBJECTIF
Ajouter le login wallet en moins de 1h. Zéro friction. Architecture minimale.

---

## 1️⃣ SCHEMA DB (Supabase)

```sql
-- Table users (minimale)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- Table sessions (optionnel pour ce MVP, peut être JWT only)
-- On utilise localStorage + JWT pour l'instant
```

---

## 2️⃣ API ROUTES (Next.js App Router)

### `POST /api/auth/nonce`
Génère un nonce pour la signature.
```json
// Request: { wallet_address: "0x..." }
// Response: { nonce: "random-string-123", expires_at: "..." }
```

### `POST /api/auth/verify`
Vérifie la signature et retourne JWT.
```json
// Request: { 
//   wallet_address: "0x...", 
//   signature: "0x...", 
//   nonce: "random-string-123" 
// }
// Response: { 
//   token: "jwt-token", 
//   user: { id, wallet_address } 
// }
```

### `POST /api/auth/logout`
Invalidate le token (optionnel pour MVP).

---

## 3️⃣ UI COMPONENTS

### `ConnectButton` (Header, droite)
- **Non connecté**: Bouton "Connect Wallet" (style visible, couleur accent)
- **Connecté**: `0xABCD...1234` + dropdown "Disconnect"

### `AuthGuard` (HOC)
- Wrap les pages/actions protégées
- Si non connecté: redirect vers home + toast "Connect wallet to continue"

---

## 4️⃣ FLOW UTILISATEUR

```
1. User clique "Connect Wallet"
2. Modal WalletConnect/MetaMask s'ouvre
3. User sélectionne wallet
4. Frontend appelle /api/auth/nonce
5. Frontend demande signature du message: "Sign in to PULSE\nNonce: XXX"
6. User signe
7. Frontend appelle /api/auth/verify avec signature
8. Backend vérifie signature (ethers.js)
9. Backend crée/récupère user
10. Backend retourne JWT
11. Frontend stocke JWT dans localStorage
12. Toast: "Welcome to PULSE — you're now an active participant."
```

---

## 5️⃣ ACTIONS PROTÉGÉES (post-login)

| Action | Avant | Après |
|--------|-------|-------|
| Challenge event | Caché/désactivé | Visible + actif |
| Vote challenge | Caché/désactivé | Visible + actif |
| Watchlist | Local only | Sync DB + persistant |
| Notifications | Impossible | Toggle visible + fonctionnel |

---

## 6️⃣ PACKAGES REQUIS

```bash
npm install ethers @web3modal/ethereum @web3modal/react wagmi viem
```

---

## 7️⃣ FICHIERS À CRÉER/MODIFIER

### Nouveaux fichiers:
- `app/api/auth/nonce/route.ts`
- `app/api/auth/verify/route.ts`
- `components/ConnectButton.tsx`
- `hooks/useAuth.ts`
- `lib/auth.ts` (JWT utils)

### Modifiés:
- `components/Header.tsx` (ajouter ConnectButton)
- `components/ChallengePanel.tsx` (protéger avec AuthGuard)
- `components/VoteButtons.tsx` (protéger avec AuthGuard)

---

## 8️⃣ MESSAGE DE SIGNATURE

```
Sign in to PULSE Protocol

Wallet: {wallet_address}
Nonce: {nonce}
Timestamp: {timestamp}

This signature proves ownership of your wallet. It does not trigger any blockchain transaction.
```

---

## ⚠️ CONTRAINTES STRICTES

- ❌ PAS d'email/password
- ❌ PAS de KYC
- ❌ PAS de profil complexe (avatar, bio, etc.)
- ❌ PAS de session server-side (JWT only)
- ✅ Wallet uniquement
- ✅ UX < 10 secondes pour se connecter
- ✅ Mobile-friendly (WalletConnect)

---

## ✅ DEFINITION DE "DONE"

- [ ] Bouton "Connect Wallet" visible dans header
- [ ] Connexion fonctionne avec MetaMask
- [ ] Connexion fonctionne avec WalletConnect (mobile)
- [ ] Après connexion: wallet affiché, bouton challenge actif
- [ ] Déconnexion fonctionne
- [ ] Toast de bienvenue affiché
- [ ] Table users créée dans Supabase
- [ ] JWT stocké sécurisément

---

Durée estimée: 45-60 minutes
Priorité: CRITIQUE (bloque toute activation du protocole)
