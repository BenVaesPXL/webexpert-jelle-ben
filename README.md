# Event Ticketing Platform

Een full-stack webapplicatie voor het beheren en boeken van evenementen, gebouwd met Laravel (backend) en Vue.js (frontend).

## 📋 Inhoudsopgave

- [Vereisten](#vereisten)
- [Installatie](#installatie)
  - [Backend (Laravel)](#backend-laravel)
  - [Frontend (Vue.js)](#frontend-vuejs)
- [Applicatie Starten](#applicatie-starten)
- [Geïmplementeerde Functionaliteit](#geïmplementeerde-functionaliteit)
- [Concepten Buiten de Cursus](#concepten-buiten-de-cursus)

---

## Vereisten

- **PHP** >= 8.2
- **Composer** >= 2.x
- **Node.js** >= 20.19.0 of >= 22.12.0
- **npm** >= 10.x
- **DDEV** (optioneel, aanbevolen) of lokale PHP server

---

## Installatie

### Backend (Laravel)

#### Optie 1: Met DDEV (Aanbevolen)

```bash
# Navigeer naar de Laravel map
cd laravel

# Start DDEV
ddev start

# Installeer PHP dependencies
ddev composer install

# Voer migraties uit (SQL database wordt meegeleverd)
ddev artisan migrate

# Maak storage link voor uploads
ddev artisan storage:link
```

De API draait nu op het DDEV adres (bijv. `https://laravel.ddev.site`)

#### Optie 2: Zonder DDEV

```bash
# Navigeer naar de Laravel map
cd laravel

# Installeer PHP dependencies
composer install

# Kopieer environment bestand
cp .env.example .env

# Voer migraties uit (SQL database wordt meegeleverd)
php artisan migrate

# Maak storage link voor uploads
php artisan storage:link
```

> **Note:** De SQL database wordt meegeleverd met het project.

#### Database Seeding

Bij het seeden van de database wordt automatisch een admin gebruiker aangemaakt:
- **Email:** `admin@test.be`
- **Wachtwoord:** `password`

> **Let op:** Foto's zijn niet standaard opgenomen in de database, maar kunnen handmatig worden toegevoegd via de admin interface.

### Frontend (Vue.js)

```bash
# Navigeer naar de frontend map
cd frontend-webexpert

# Installeer Node dependencies
npm install
```

#### Frontend .env configureren

Maak een `.env` bestand aan in de `frontend-webexpert` map met het adres van je Laravel backend:

```bash
VITE_API_BASE=https://jouw-backend-url.ddev.site/api
```

> **Belangrijk:** Pas `VITE_API_BASE` aan naar het adres waar jouw Laravel backend draait:
> - Met DDEV: `https://laravel.ddev.site/api`
> - Lokaal: `http://localhost:8000/api`

---

## Applicatie Starten

### Met DDEV

```bash
# Backend (in laravel map)
ddev start

# Frontend (in frontend-webexpert map)
npm run dev
```

### Zonder DDEV

```bash
# Backend starten (in laravel map)
php artisan serve

# Frontend starten (in frontend-webexpert map)
npm run dev
```

---

## Geïmplementeerde Functionaliteit

### Models

| Model | Beschrijving |
|-------|-------------|
| **User** | Gebruikers met rollen (user/admin), favorites relatie |
| **Event** | Evenementen met titel, beschrijving, locatie, datum, afbeelding |
| **Ticket** | Tickets per event met type, prijs, aantal, verkoop periode |
| **Booking** | Boekingen van gebruikers met status (confirmed/cancelled) |

### Controllers

| Controller | Endpoints | Beschrijving |
|------------|-----------|--------------|
| **AuthController** | `/register`, `/login`, `/logout`, `/user`, `/user/password` | Authenticatie & wachtwoord wijzigen |
| **EventController** | `/events` CRUD | Evenementen beheer (admin) & lijst (publiek) |
| **TicketController** | `/events/{id}/tickets` CRUD + `/reserve` | Ticket beheer & reserveringen |
| **BookingController** | `/bookings`, `/bookings/{id}/cancel` | Boekingen bekijken & annuleren |
| **FavoriteController** | `/favorites` CRUD | Favoriete evenementen beheren |

### Frontend Views

| View | Beschrijving |
|------|--------------|
| **HomeView** | Homepage met "bijna uitverkocht" evenementen |
| **EventListView** | Alle evenementen met zoeken, lijst/kalender weergave |
| **EventDetailView** | Event details, tickets kopen, favorieten |
| **ProfileView** | Profiel met boekingen, favorieten, wachtwoord wijzigen, annuleren |
| **AdminEventsView** | Admin overzicht van alle evenementen |
| **AdminEventFormView** | Event aanmaken/bewerken met tickets |
| **LoginView** / **RegisterView** | Authenticatie pagina's |

### Stores (Pinia)

| Store | Beschrijving |
|-------|--------------|
| **auth.js** | Authenticatie state, login/logout/register, CSRF token handling |
| **events.js** | Events state, CRUD operaties, tickets, favorieten sync |

---

## Concepten Buiten de Cursus

### 1. File Uploads met FormData

Image uploads via FormData met Laravel method spoofing voor PUT requests:

```javascript
formData.append("_method", "PUT");
const res = await fetch(url, { method: "POST", body: formData });
```

### 2. Pinia State Management

Centralized state management met Pinia voor Vue 3:

```javascript
export const useEventsStore = defineStore("events", {
  state: () => ({ events: [], loading: false }),
  getters: { filteredEvents() { /* computed values */ } },
  actions: { async fetchEvents() { /* API calls */ } }
});
```

### 6. Eloquent Accessors

Custom accessors op het Ticket model:

```php
public function getIsOnSaleAttribute(): bool {
    return $saleStarted && $saleNotEnded;
}
```

### 7. CORS & Cookie Configuration voor SPA

Speciale configuratie voor cross-origin session cookies:

```php
// XSRF-TOKEN cookie met SameSite=None voor cross-origin
->cookie('XSRF-TOKEN', $token, 0, '/', null, false, false, false, 'None');
```

---

## Auteurs

- Jelle & Ben

---

## Licentie

Dit project is gemaakt voor het vak Web Expert aan PXL.
