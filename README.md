# Admission Calendar 2026 🎓

বাংলাদেশের বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সম্পূর্ণ ক্যালেন্ডার — আবেদন, পরীক্ষা, ফলাফল ও প্রয়োজনীয় সকল তথ্য এক জায়গায়।
এখন ইউজার লগইন/রেজিস্ট্রেশন, পার্সোনাল বুকমার্ক, জিপিএ-ভিত্তিক আবেদনযোগ্য বিশ্ববিদ্যালয় সাজেশন এবং একটি সম্পূর্ণ
অ্যাডমিন প্যানেল সহ।

---

## ✨ Features

- 📅 সম্পূর্ণ ভর্তি ক্যালেন্ডার (আবেদন / পরীক্ষা / প্রবেশপত্র / ফলাফল) — গেস্ট ইউজাররাও দেখতে পারবেন
- 🔐 ইমেইল/পাসওয়ার্ড ও Google দিয়ে সাইন আপ/সাইন ইন (Firebase Authentication)
- ⭐ পছন্দের বিশ্ববিদ্যালয় বুকমার্ক করা (লগইন প্রয়োজন)
- 🎓 SSC + HSC জিপিএ দিয়ে স্বয়ংক্রিয়ভাবে আবেদনযোগ্য বিশ্ববিদ্যালয়ের তালিকা
- 🛠️ অ্যাডমিন প্যানেল — বিশ্ববিদ্যালয় ও ইউজার প্রোফাইল যোগ/সম্পাদনা/মুছে ফেলা/ফিল্টার করা
- 🔔 টোস্ট নোটিফিকেশন — লগআউট অবস্থায় প্রিমিয়াম ফিচার ব্যবহারের চেষ্টা করলে
- 🌗 ডার্ক/লাইট থিম, রেসপন্সিভ ডিজাইন, লাইভ কাউন্টডাউন টাইমার
- ℹ️ About Us / Privacy Policy / Contact পেজ (টেলিগ্রাম গ্রুপ লিংকসহ)

---

## 📁 Project Structure

```
├── index.html              # প্রধান ক্যালেন্ডার পেজ (public)
├── login.html               # সাইন ইন পেজ
├── register.html            # রেজিস্ট্রেশন পেজ
├── profile.html              # ইউজার প্রোফাইল (তথ্য / বুকমার্ক / যোগ্য বিশ্ববিদ্যালয়)
├── admin.html                # অ্যাডমিন প্যানেল (শুধুমাত্র info.itzmahin@gmail.com)
├── about.html / privacy.html / contact.html
├── assets/
│   ├── firebase-config.js    # আপনার Firebase কনফিগারেশন এখানে বসান
│   ├── common.css            # শেয়ার্ড ডিজাইন সিস্টেম
│   ├── common.js             # হেডার/ফুটার, থিম, টোস্ট, অথ-স্টেট
│   ├── calendar.js            # index.html এর লজিক
│   ├── auth.js                 # লগইন/রেজিস্ট্রেশন লজিক
│   ├── profile.js              # প্রোফাইল পেজ লজিক
│   └── admin.js                # অ্যাডমিন প্যানেল লজিক
├── seed/
│   ├── universities-seed.json  # data.json থেকে রূপান্তরিত প্রাথমিক ডাটা
│   └── import.js                # Firestore এ ডাটা ইম্পোর্ট করার স্ক্রিপ্ট (ঐচ্ছিক)
├── firestore.rules             # Firestore সিকিউরিটি রুলস
└── favicon / icons (অপরিবর্তিত)
```

> পুরনো `data.json`, `script.js`, `style.css` ফাইলগুলো আর ব্যবহার হচ্ছে না — সমস্ত ডাটা এখন Firestore থেকে লোড হয়।
> `seed/universities-seed.json` এ পুরনো `data.json` এর সব তথ্য একত্র করে রাখা হয়েছে, যা আপনি Firestore-এ ইম্পোর্ট করতে পারবেন।

---

## 🔥 Firebase Setup (ধাপে ধাপে)

### ১. Firebase প্রজেক্ট তৈরি করুন
1. [Firebase Console](https://console.firebase.google.com/) এ যান → **Add project**
2. প্রজেক্টের নাম দিন (যেমনঃ `admission-calendar`) এবং তৈরি করুন

### ২. Web App যোগ করুন
1. প্রজেক্ট ওভারভিউ থেকে **</> (Web)** আইকনে ক্লিক করুন
2. অ্যাপের নাম দিন, রেজিস্টার করুন
3. যে `firebaseConfig` অবজেক্ট দেখাবে, সেটি কপি করে `assets/firebase-config.js` ফাইলে বসান

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### ৩. Authentication চালু করুন
1. **Build → Authentication → Get started**
2. **Sign-in method** ট্যাবে গিয়ে চালু করুনঃ
   - **Email/Password**
   - **Google**
3. Google সাইন-ইন চালু করার সময় একটি support email দিতে হবে — আপনার ইমেইল দিন

### ৪. Firestore Database চালু করুন
1. **Build → Firestore Database → Create database**
2. **Production mode** সিলেক্ট করুন, নিকটতম region বেছে নিন
3. তৈরি হওয়ার পর **Rules** ট্যাবে গিয়ে এই রিপোর `firestore.rules` ফাইলের কনটেন্ট পেস্ট করে **Publish** করুন

### ৫. Authorized domain যোগ করুন (Google সাইন-ইনের জন্য জরুরি)
GitHub Pages এ ডিপ্লয় করার পর, **Authentication → Settings → Authorized domains** এ গিয়ে
আপনার GitHub Pages ডোমেইন (যেমনঃ `yourusername.github.io`) যোগ করুন।

### ৬. প্রাথমিক বিশ্ববিদ্যালয় ডাটা যোগ করুন
দুইটি উপায়ে করতে পারেনঃ

**সহজ উপায় — অ্যাডমিন প্যানেল থেকে ম্যানুয়ালি যোগ করুন:**
1. `info.itzmahin@gmail.com` দিয়ে রেজিস্টার/সাইন ইন করুন (এই ইমেইলটিই অ্যাডমিন হিসেবে ধরা হয়)
2. প্রোফাইল আইকন → **অ্যাডমিন প্যানেল** এ যান
3. **নতুন বিশ্ববিদ্যালয়** বাটনে ক্লিক করে একে একে তথ্য যোগ করুন

**দ্রুত উপায় — বাল্ক ইম্পোর্ট স্ক্রিপ্ট চালান:**
```bash
cd seed
npm install firebase-admin
# Firebase Console → Project settings → Service accounts → Generate new private key
# ডাউনলোড করা ফাইলটি seed/serviceAccountKey.json নামে সেভ করুন
node import.js
```
এটি `universities-seed.json` এর সব ৫২টি এন্ট্রি Firestore এ যোগ করে দেবে। **এরপর অ্যাডমিন প্যানেল থেকে
প্রতিটি এন্ট্রি রিভিউ করে নিন** — যেহেতু এটি পুরনো `data.json` থেকে স্বয়ংক্রিয়ভাবে একত্রিত করা, কিছু এন্ট্রি
(যেমন `DU` আবেদন সারি বনাম `DU (A)` পরীক্ষার সারি) ম্যানুয়ালি মার্জ/ঠিক করা প্রয়োজন হতে পারে। প্রতিটি
বিশ্ববিদ্যালয়ের জন্য `requiredGPA` (আবেদনের জন্য প্রয়োজনীয় সম্মিলিত SSC+HSC জিপিএ) যোগ করতে ভুলবেন না —
এটি ছাড়া প্রোফাইল পেজের "যোগ্য বিশ্ববিদ্যালয়" ফিচার কাজ করবে না।

---

## 👑 Admin Access

অ্যাডমিন প্যানেল (`admin.html`) শুধুমাত্র **`info.itzmahin@gmail.com`** ইমেইল দিয়ে লগইন করা অ্যাকাউন্ট থেকে
অ্যাক্সেস করা যাবে। এই ইমেইলটি `assets/firebase-config.js` এর `ADMIN_EMAIL` ভ্যারিয়েবলে এবং
`firestore.rules` ফাইলে সেট করা আছে — অ্যাডমিন ইমেইল পরিবর্তন করতে চাইলে দুই জায়গাতেই আপডেট করুন।

> **নোটঃ** অ্যাডমিন প্যানেল থেকে ইউজার "মুছে ফেলা" শুধুমাত্র তাদের Firestore প্রোফাইল ডাটা মুছে ফেলে —
> Firebase Authentication থেকে সম্পূর্ণ অ্যাকাউন্ট মুছতে হলে Firebase Admin SDK ব্যবহার করে একটি
> Cloud Function লিখতে হবে (ক্লায়েন্ট-সাইড কোড থেকে অন্য ইউজারের auth অ্যাকাউন্ট মোছা সম্ভব নয়, এটি
> Firebase এর একটি নিরাপত্তা সীমাবদ্ধতা)।

---

## 🚀 Deploy করুন GitHub Pages এ

1. একটি নতুন GitHub রিপোজিটরি তৈরি করুন
2. এই ফোল্ডারের সব ফাইল পুশ করুনঃ
   ```bash
   git init
   git add .
   git commit -m "Admission Calendar with Firebase auth, bookmarks & admin panel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. GitHub রিপোতে **Settings → Pages** এ যান
4. **Source**: `Deploy from a branch` → Branch: `main` → folder: `/ (root)` সিলেক্ট করে **Save** করুন
5. কিছুক্ষণ পর সাইটটি লাইভ হবে এখানেঃ `https://<your-username>.github.io/<repo-name>/`
6. এই ডোমেইনটি Firebase Console → Authentication → Settings → **Authorized domains** এ যোগ করতে ভুলবেন না
   (নাহলে Google সাইন-ইন কাজ করবে না)

---

## 🗄️ Firestore Data Model

**`universities/{id}`**
```
name, applyLink, applyLinkText, deadline, deadlineCountdown,
admitCard, examDate, examCountdown, negative, calculator (bool),
secondTime (bool), circularLink, resultDate, resultLink,
requiredGPA (number), order (number), active (bool)
```

**`users/{uid}`**
```
name, username, email, photoURL, sscGPA, hscGPA, sscMark, hscMark,
bookmarks (array of university ids), role ("user" | "admin"),
profileComplete (bool), createdAt
```

---

## 🛠️ Local Development

কোনো বিল্ড স্টেপ প্রয়োজন নেই — এটি প্লেইন HTML/CSS/JS। যেকোনো লোকাল সার্ভার দিয়ে চালাতে পারবেনঃ

```bash
python3 -m http.server 8080
# অথবা
npx serve .
```

তারপর ব্রাউজারে `http://localhost:8080` এ যান।

---

## 📌 Notes

- সাইটটি এখন সম্পূর্ণরূপে Firebase নির্ভর — `assets/firebase-config.js` ফাইলে সঠিক কনফিগারেশন না দিলে
  ক্যালেন্ডার ডাটা লোড হবে না এবং লগইন/রেজিস্ট্রেশন কাজ করবে না।
- গেস্ট (লগইন ছাড়া) ইউজাররা ক্যালেন্ডারের সব তথ্য দেখতে পারবেন, কিন্তু বুকমার্ক করতে গেলে বা প্রোফাইল/অ্যাডমিন
  পেজে যেতে চাইলে "ফুল অ্যাক্সেস ও প্রিমিয়াম ফিচারের জন্য সাইন ইন/সাইন আপ করুন" টোস্ট দেখানো হবে।
- Telegram গ্রুপ লিংক ও যোগাযোগের তথ্য পরিবর্তন করতে `contact.html` ও `index.html` এ খুঁজে পরিবর্তন করুন।
