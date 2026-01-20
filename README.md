# 🎛️ Advanced Control System Analyzer

An interactive web-based tool for analyzing and visualizing control system responses. Built to help students understand fundamental control system concepts through visual demonstrations.

![Control System Analyzer](https://img.shields.io/badge/Control%20Systems-Educational%20Tool-purple)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?logo=plotly&logoColor=white)

## 🌐 Live Demo

**[https://tigmanshupatelec.github.io/Control_system_analyzer/](https://tigmanshupatelec.github.io/Control_system_analyzer/)**

---

## 📚 Overview

This tool provides comprehensive analysis of control systems through four main sections:

| Tab | Purpose |
|-----|---------|
| **Time Response Analysis** | Analyze how systems respond to various inputs over time |
| **Frequency / Root Locus** | Study frequency domain behavior and pole movement |
| **Stability Analysis** | Determine system stability using pole locations |
| **Stability Criteria Tables** | Generate Routh-Hurwitz and Hurwitz matrices |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tigmanshupatelec/Control_system_analyzer.git
   cd Control_system_analyzer
   ```

2. **Open with a local server:**
   
   Using Python:
   ```bash
   python -m http.server 5500
   ```
   
   Or using Node.js:
   ```bash
   npx serve .
   ```

3. **Open in browser:**
   ```
   http://127.0.0.1:5500/index.html
   ```

---

## 📖 Complete User Guide

### 🕐 Tab 1: Time Response Analysis

This section analyzes how a system responds to different input signals over time.

#### System Types Supported

| System | Transfer Function | Parameters |
|--------|-------------------|------------|
| **First-Order** | G(s) = K / (τs + 1) | K = Gain, τ = Time Constant |
| **Second-Order** | G(s) = Kωn² / (s² + 2ζωns + ωn²) | K = Gain, ωn = Natural Frequency, ζ = Damping Ratio |
| **Higher-Order** | G(s) = K × N(s) / D(s) | K = Gain, Numerator & Denominator coefficients |

#### Input Types Explained

| Input | Mathematical Form | Physical Meaning |
|-------|-------------------|------------------|
| **Step** | u(t) = 1 for t ≥ 0 | Sudden constant input (like switching ON) |
| **Ramp** | u(t) = t | Linearly increasing input |
| **Parabolic** | u(t) = t²/2 | Accelerating input |
| **Impulse** | u(t) = δ(t) | Instantaneous spike at t=0 |
| **Sinusoidal** | u(t) = A·sin(ωt) | Oscillating input |

#### Output Parameters Calculated

| Parameter | Symbol | Definition |
|-----------|--------|------------|
| **Delay Time** | Td | Time to reach 50% of final value |
| **Rise Time** | Tr | Time from 10% to 90% of final value |
| **Peak Time** | Tp | Time to reach maximum overshoot |
| **Settling Time** | Ts | Time to stay within 2% of final value |
| **Max Overshoot** | Mp | Percentage above final value |
| **Steady-State Error** | Ess | Difference between input and output |

#### How to Use:
1. Select **System Order** (First, Second, or Higher)
2. Enter system parameters (K, τ, ωn, ζ, or coefficients)
3. Select **Input Type**
4. For sinusoidal: set frequency and amplitude
5. Click **"Analyze Time Response"**

---

### 📊 Tab 2: Frequency / Root Locus Analysis

This section provides frequency domain analysis and root locus plotting.

#### Plot Types Available

| Plot | Description | Use Case |
|------|-------------|----------|
| **Bode Plot** | Magnitude (dB) and Phase (°) vs Frequency | Finding gain/phase margins |
| **Nyquist Plot** | Polar plot of G(jω) | Stability assessment |
| **Polar Plot** | Similar to Nyquist | Frequency response visualization |
| **Root Locus** | Pole movement as gain K varies | Gain selection for stability |

#### Frequency Domain Parameters

| Parameter | Symbol | Meaning |
|-----------|--------|---------|
| **Gain Margin** | GM | How much gain can increase before instability |
| **Phase Margin** | PM | How much phase lag before instability |
| **Gain Crossover** | ωgc | Frequency where |G(jω)| = 1 (0 dB) |
| **Phase Crossover** | ωpc | Frequency where ∠G(jω) = -180° |
| **Bandwidth** | ωb | Frequency where gain drops by 3dB |
| **Resonant Peak** | Mr | Maximum magnitude in frequency response |

#### Stability Margin Guidelines

| Margin | Condition | System Behavior |
|--------|-----------|-----------------|
| PM > 45° | ✅ Excellent | Well-damped, stable response |
| PM > 30° | ✅ Good | Acceptable damping |
| PM < 30° | ⚠️ Poor | Oscillatory, may be unstable |
| GM > 6 dB | ✅ Good | Safe stability margin |
| GM < 0 dB | ❌ Unstable | System will oscillate |

#### How to Use:
1. Select **System Order** and enter parameters
2. Choose **Plot Type** (Bode, Nyquist, Polar, Root Locus)
3. Set **Frequency Range** (default: 0.1 to 1000 rad/s)
4. For Root Locus: set K sweep range and steps
5. Click **"Analyze Frequency / Root Locus"**
6. Use **"Plot Pole-Zero Map"** for additional visualization

---

### ⚡ Tab 3: Stability Analysis

This section determines system stability based on pole locations.

#### Stability Conditions

| Condition | Meaning |
|-----------|---------|
| **All poles in LHP** | Left Half Plane (Re(s) < 0) → System is STABLE |
| **Any pole in RHP** | Right Half Plane (Re(s) > 0) → System is UNSTABLE |
| **Poles on jω-axis** | Marginally stable (sustained oscillations) |

#### BIBO Stability
**Bounded-Input Bounded-Output**: If every bounded input produces a bounded output, the system is BIBO stable. This requires all poles to have negative real parts.

#### How to Use:
1. Select **System Order**
2. Enter system parameters
3. Click **"Analyze Stability"**
4. View: System status, poles, zeros, BIBO stability, Routh-Hurwitz result

---

### 📋 Tab 4: Stability Criteria Tables

This section generates mathematical tables for stability analysis.

#### Routh-Hurwitz Array

The Routh array is constructed from the characteristic polynomial coefficients.

**Stability Rule**: 
- Count sign changes in the **first column**
- Number of sign changes = Number of RHP poles
- **No sign changes** + **All positive** = STABLE

**Example**: For s³ + 6s² + 11s + 6 = 0
```
s³ |  1   11
s² |  6    6
s¹ | 10    0
s⁰ |  6    
```
First column: [1, 6, 10, 6] → All positive, no sign changes → STABLE

#### Hurwitz Matrix

The Hurwitz matrix is formed from polynomial coefficients:
- Element H[i,j] = a_{2i-j} (where a_k = 0 for k < 0 or k > n)
- All principal minor determinants must be positive for stability

#### How to Use:
1. Select **System Order**
2. For higher-order: enter denominator coefficients (e.g., "1, 6, 11, 6")
3. Click **"Generate Stability Tables"**
4. View the Routh Array and Hurwitz Matrix with conclusion

---

## 🎓 Control System Theory Reference

### Second-Order System Response Categories

| Damping Ratio (ζ) | System Type | Behavior | Poles |
|-------------------|-------------|----------|-------|
| ζ < 1 | Underdamped | Oscillates before settling | Complex conjugate |
| ζ = 1 | Critically Damped | Fastest settling, no overshoot | Repeated real |
| ζ > 1 | Overdamped | Slow response, no oscillation | Distinct real |

### Key Formulas

**Second-Order Step Response (Underdamped ζ < 1):**
```
c(t) = K[1 - (e^(-ζωnt) / √(1-ζ²)) × sin(ωd×t + φ)]

where:
  ωd = ωn√(1-ζ²)     (Damped natural frequency)
  φ = atan(√(1-ζ²)/ζ) (Phase angle)
```

**Time Domain Specifications:**
```
Rise Time:     Tr ≈ (π - β) / ωd   where β = atan(√(1-ζ²)/ζ)
Peak Time:     Tp = π / ωd
Settling Time: Ts ≈ 4 / (ζωn)      (2% criterion)
Overshoot:     Mp = e^(-πζ/√(1-ζ²)) × 100%
```

**Frequency Domain:**
```
Gain Margin:  GM = -20 log₁₀|G(jωpc)|  where ∠G(jωpc) = -180°
Phase Margin: PM = 180° + ∠G(jωgc)     where |G(jωgc)| = 1
```

---

## 🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Modern dark theme with glassmorphism effects
- **JavaScript (ES6+)** - Control system calculations
- **Plotly.js** - Interactive chart plotting
- **MathJax** - Mathematical formula rendering
- **Math.js** - Complex number operations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Control system formulas based on standard textbooks:
  - Ogata, K. "Modern Control Engineering"
  - Nise, N. "Control Systems Engineering"
  - Dorf, R. & Bishop, R. "Modern Control Systems"
- Built with [Plotly.js](https://plotly.com/javascript/) for interactive charts
- Mathematical rendering by [MathJax](https://www.mathjax.org/)

---

**Made with ❤️ for Control Systems Students**
