# Fuzzy Lab — Interactive Fuzzy Logic Decision and Control System

> A standalone, high-performance web application designed for academic and practical demonstration of **Fuzzy Logic (Nebulous Logic)**.
> Zero external dependencies, 100% client-side execution, fully compatible with **GitHub Pages** and offline environments.

---

## Overview

In classical Boolean logic, decisions are binary: **0 or 1, False or True**. However, real-world dynamics operate across continuous, gradual spectrums — concepts such as *"moderate traffic"*, *"comfortable temperature"*, or *"cognitive exhaustion"* do not possess rigid boundaries.

**Fuzzy Lab** unites two foundational and contrasting domains of Fuzzy Logic within a unified, modern interface:
1. **Industrial Control & Automation:** *Smart Traffic Light with Dynamic Green Signal Timing*.
2. **Expert Systems & Decision Support:** *Cognitive Fatigue and Burnout Risk Assessment*.
3. **Educational Visualizer:** *Real-time canvas rendering of membership functions and live Mamdani rule activation inspector*.

---

## Theoretical Foundations of Fuzzy Logic

The Fuzzy Lab engine implements the complete inference lifecycle across three stages:

```
┌──────────────────┐       ┌────────────────────────┐       ┌───────────────────┐
│   CRISP INPUTS   │ ───>  │     FUZZIFICATION      │ ───>  │   MAMDANI RULES   │
│ (e.g. 35 cars)   │       │   µ(x) in [0.0, 1.0]   │       │   IF ... THEN ... │
└──────────────────┘       └────────────────────────┘       └─────────┬─────────┘
                                                                      │
┌──────────────────┐       ┌────────────────────────┐                 │
│   CRISP OUTPUT   │ <───  │    DEFUZZIFICATION     │ <───────────────┘
│ (e.g. Green 65s) │       │   (Center of Gravity)  │
└──────────────────┘       └────────────────────────┘
```

### 1. Membership Functions (Fuzzification)
Maps scalar input values into degrees of truth µ(x) ∈ [0, 1]:

* **Triangular Function (a, b, c):**
  ```text
  µ_tri(x; a, b, c) = max( 0, min( (x - a)/(b - a), (c - x)/(c - b) ) )
  ```

* **Trapezoidal Function (a, b, c, d):**
  ```text
  µ_trap(x; a, b, c, d) = max( 0, min( (x - a)/(b - a), 1, (d - x)/(d - c) ) )
  ```

---

### 2. Mamdani Inference Method
* **Conjunction (AND Operator):** Minimum T-norm:
  ```text
  α_r = min( µ_1(x_1), µ_2(x_2), ... )
  ```

* **Consequent Implication:** Each active rule clips its corresponding output membership function at height α_r.

* **Aggregation:** Maximum S-norm combines all active rule contributions into an aggregated fuzzy area:
  ```text
  µ_agg(y) = max_r( min( α_r, µ_out,r(y) ) )
  ```

---

### 3. Defuzzification via Center of Gravity (Centroid / COG)
Computes the center of mass across the discretized output universe of discourse (N = 100 steps):

```text
           N
           Σ [ y_i · µ_agg(y_i) ]
          i=1
  y* = ─────────────────────────────
                  N
                  Σ [ µ_agg(y_i) ]
                 i=1
```

* **Burnout 0%–100% Score Normalization:**
  ```text
  Score = clamp( 0, 100, ((y* - 13.83) / (85.44 - 13.83)) × 100 )
  ```

---

## Module 1: Smart Traffic Light (Control & Automation)

Traditional traffic controllers run on rigid timers (e.g., fixed 30 seconds), causing unnecessary queues on busy avenues while empty cross streets hold green signals.

* **Inputs:**
  * **Main Road Queue ($0$ to $50$ cars):** `Low`, `Medium`, `High`.
  * **Secondary Road Queue ($0$ to $50$ cars):** `Low`, `Medium`, `High`.
* **Output:**
  * **Green Signal Duration ($10$ to $90$ seconds):** `Short`, `Medium`, `Long`.
* **Benchmark:** Displays real-time flow efficiency gain relative to standard fixed-time controllers.

---

## Module 2: Burnout Risk Assessment (Decision Support)

Models human subjective reasoning regarding cognitive fatigue and burnout risk based on lifestyle and academic workload.

* **Inputs:**
  * **Sleep Duration ($0$ to $12$ hours):** `Low`, `Adequate`, `High`.
  * **Upcoming Deadlines ($0$ to $10$ assignments):** `Low`, `Moderate`, `Critical`.
  * **Daily Screen Time ($0$ to $14$ hours):** `Light`, `Normal`, `Excessive`.
* **Output:**
  * **Burnout Risk Score ($0\%$ to $100\%$):** `Low`, `Moderate`, `Critical`.
* **Diagnostics:** Features a continuous arc gauge and dynamic ergonomic recommendations.

---

## Presentation Guide (Script for 3 to 5 Minutes)

1. **Introduction (30s):**
   > "Good afternoon. This project demonstrates Fuzzy Logic across two core domains: Machine Control (Smart Traffic Light) and Human Decision Support (Burnout Assessment). Unlike traditional binary systems, Fuzzy Logic provides smooth, human-like reasoning over continuous variables."

2. **Traffic Light Demonstration (1m30s):**
   > "In the Traffic Light module, adjusting the main avenue to 45 cars and the side street to 5 cars smoothly scales the green signal to approximately 80 seconds. If both streets reach 25 cars, it balances to 50 seconds without abrupt jumps."

3. **Burnout Assessment Demonstration (1m):**
   > "In the Burnout module, a routine of 8 hours of sleep with 2 deadlines keeps the risk low (15%). Reducing sleep to 3.5 hours and increasing deadlines to 8 pushes the score into the critical zone (85%), triggering immediate cognitive rest advice."

4. **Mathematical Engine & Visualizer (1m):**
   > "In the engine tab, we inspect the live mathematics: triangular and trapezoidal curves, vertical membership indicators, active Mamdani rules with alpha weights, and final Centroid defuzzification."

---

## Deployment & Local Execution

### 1. Local Execution
Double-click `index.html` in your file explorer to open it in any web browser. No web server, dependencies, or compilers required.

### 2. GitHub Pages Deployment
1. Initialize repository and push:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Fuzzy Lab"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```
2. Navigate to **Settings > Pages** in your GitHub repository.
3. Under **Branch**, select `main` and `/ (root)`.
4. Click **Save**. Your site will be live at `https://USERNAME.github.io/REPOSITORY/`.
