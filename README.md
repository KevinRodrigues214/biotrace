BioTrace

A workout platform featuring a 3D hologram for personalized body visualization, nutrition tracking, workout history, and social features — all in one place, eliminating the need for external apps like MyFitnessPal.

📋 About the Project

BioTrace combines training, nutrition, and muscle recovery into a single platform, using an interactive 3D avatar (hologram) as the central dashboard for the user's body status. Based on completed workouts, diet, and hydration logs, the hologram reflects in real time the fatigue, recovery, or injury level of each muscle group.

🗺️ Page Structure
1. Landing Page

Presentation and conversion page, not a functional part of the app.

Institutional content: what the site is, how it works, benefits.
Direct CTAs: "Get Started" / "See My Hologram".
Interactive demo: short looping video / GIF of the hologram rotating.
Testimonials and social proof from students or personal trainers.
2. Hologram Page (Core of the Site)

Personalized, interactive 3D body visualization — the central muscle status dashboard.

Personalization:

Input data: height, weight, age, and sex (also used on the Nutrition page).
The 3D model visually adjusts based on this data (approximate body type).

Navigation and interaction:

Quick view filters: Front / Back / Side.
Zoom to select a specific muscle, showing which workouts target that area.

Muscle status (colors):

Color	Meaning
🟢 Green	No fatigue / fully recovered
🟠 Orange	Medium fatigue
🔴 Red	High fatigue (recently trained)
🟣 Purple	Injured — automatically blocks workouts affecting that area
The system asks the user whether they still feel pain/fatigue in that muscle and shows the recommended rest time.
Text-based muscle status export (e.g., "Upper body at 85% recovery").
Integration: automatically fed by the Workout History page — completing a workout updates the muscle color on the hologram in real time.
3. Nutrition and Calories

Eliminates the need for external calorie-tracking apps.

Food search/database to automatically calculate calories and macros for meals.
Charts with nutritional breakdown (calories, protein, carbs, fats).
Daily calorie/macro tracking with:
Automatic presets calculated from the user's height, weight, age, and sex.
Manual goal adjustment option.
Hydration goal: daily water intake counter, which impacts the muscle fatigue/recovery calculation.
Protein and calorie intake also factor into recovery speed.
Structured space for meal photo upload (computer vision) — future feature.
4. Workout History and Prescription

Logs workouts and feeds the hologram's muscle recovery status.

History of the last 7+ days of completed workouts.
Pre-built workouts by muscle group (presets).
Custom workout creation by the user.
Smart recommendations: suggests an alternative workout if a muscle is still fatigued, sore, or injured.
"Complete Workout" button: instantly updates the corresponding muscle color on the hologram.
Built-in rest timer between sets.
5. Social Page (Community and Friends)

Displays personal and friends' progress.

Automatically receives completed workouts (optional sharing).
Timeline-style activity feed (e.g., "Carlos completed his Leg workout today at 8:00 AM").
Consistency ranking (gamification) among friends.
Group challenges (e.g., "10,000 steps a day challenge").
6. User Profile and Settings

Account management page.

Change password and profile photo.

Manage biometric data: weight, height, body fat %, age, sex.
🔄 Data Flow Between Pages
Profile (6) ──────────────► Hologram (2)
    │                           ▲
    └──────────────────► Nutrition (3)
                                │
Workout History (4) ───────────┘
    │        ▲
    │        └── Hologram (2) indicates blocked/available muscles
    │
    └──────────────► Social Page (5)

Nutrition/Hydration (3) ──────► influences recovery in Hologram (2)
Profile (6) provides base biometric data for Hologram (2) and Nutrition (3).
Workout History (4) updates muscle colors/status on the Hologram (2) in real time.
Hologram (2) indicates available/blocked muscles, influencing workout recommendations in (4).
Hydration and Nutrition (3) influence the fatigue/recovery calculation in (2).
Workout History (4) feeds the Social Page (5) with completed, shareable workouts.
