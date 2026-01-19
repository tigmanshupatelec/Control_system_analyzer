// Advanced Control System Analyzer - Patched & ready-to-paste
class AdvancedControlSystemAnalyzer {
  constructor() {
    // expose instance globally for debugging / external hooks
    window.__advancedAnalyzerInstance = this;

    this.initializeEventListeners();
    this.updateTimeParamsForm();
    this.updateFreqParamsForm();
    this.updateStabParamsForm();
    this.updateCriteriaParamsForm();
    this.populateHelpCards();
  }

  initializeEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Time response events
    const timeOrderEl = document.getElementById('time-system-order');
    if (timeOrderEl) timeOrderEl.addEventListener('change', () => this.updateTimeParamsForm());

    const timeInputTypeEl = document.getElementById('time-input-type');
    if (timeInputTypeEl) timeInputTypeEl.addEventListener('change', () => this.toggleSinusoidalParams());

    const createTimeBtn = document.getElementById('create-time-plot');
    if (createTimeBtn) createTimeBtn.addEventListener('click', () => this.analyzeTimeResponse());

    // Frequency response events
    const freqOrderEl = document.getElementById('freq-system-order');
    if (freqOrderEl) freqOrderEl.addEventListener('change', () => this.updateFreqParamsForm());

    const createFreqBtn = document.getElementById('create-freq-plot');
    if (createFreqBtn) createFreqBtn.addEventListener('click', () => this.analyzeFrequencyResponse());

    // Pole-Zero map button (will exist in updated HTML)
    const pzBtn = document.getElementById('plot-pz-map');
    if (pzBtn) {
      pzBtn.addEventListener('click', () => this.analyzePoleZeroMap());
    }

    // Stability analysis events
    const stabOrderEl = document.getElementById('stab-system-order');
    if (stabOrderEl) stabOrderEl.addEventListener('change', () => this.updateStabParamsForm());

    const stabBtn = document.getElementById('analyze-stability');
    if (stabBtn) stabBtn.addEventListener('click', () => this.analyzeStability());

    // Stability criteria events
    const critOrderEl = document.getElementById('criteria-system-order');
    if (critOrderEl) critOrderEl.addEventListener('change', () => this.updateCriteriaParamsForm());

    const critBtn = document.getElementById('analyze-criteria');
    if (critBtn) critBtn.addEventListener('click', () => this.analyzeStabilityCriteria());
  }

  switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });

    const tab = document.getElementById(tabName);
    if (tab) tab.classList.add('active');

    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    if (btn) btn.classList.add('active');
  }

  toggleSinusoidalParams() {
    const inputTypeEl = document.getElementById('time-input-type');
    if (!inputTypeEl) return;
    const inputType = inputTypeEl.value;
    const sinParams = document.getElementById('sinusoidal-params');

    if (!sinParams) return;

    if (inputType === 'sinusoidal') {
      sinParams.classList.remove('hidden');
    } else {
      sinParams.classList.add('hidden');
    }
  }

  // ===========================
  // Help / Theory Cards
  // ===========================

  populateHelpCards() {
    const timeHelp = document.getElementById('time-help-card');
    if (timeHelp) {
      timeHelp.innerHTML = `
        <h3>Time Response – Quick Theory</h3>
        <ul>
          <li><strong>Step</strong>: Input jumps from 0 to 1 at t = 0.</li>
          <li><strong>Ramp</strong>: Input increases linearly (u(t) = t).</li>
          <li><strong>Parabolic</strong>: Input increases as t²/2.</li>
          <li><strong>Impulse</strong>: Ideal “spike” at t = 0.</li>
          <li><strong>Key parameters</strong>: Rise time (Tr), Peak time (Tp), Settling time (Ts), Maximum overshoot (Mp), steady-state error (Ess).</li>
        </ul>
      `;
    }

    const freqHelp = document.getElementById('freq-help-card');
    if (freqHelp) {
      freqHelp.innerHTML = `
        <h3>Frequency Response – Quick Theory</h3>
        <ul>
          <li><strong>Bode Plot</strong>: Magnitude (dB) and phase (°) vs frequency (rad/s).</li>
          <li><strong>Gain Margin (GM)</strong>: Extra gain possible before instability.</li>
          <li><strong>Phase Margin (PM)</strong>: Extra phase lag possible before instability.</li>
          <li><strong>Root Locus</strong>: Movement of closed-loop poles as K increases from 0 to K<sub>max</sub>.</li>
          <li><strong>Nyquist / Polar</strong>: Show closed-loop stability using the Nyquist criterion.</li>
        </ul>
      `;
    }

    const stabHelp = document.getElementById('stab-help-card');
    if (stabHelp) {
      stabHelp.innerHTML = `
        <h3>Stability – Quick Theory</h3>
        <ul>
          <li>System is <strong>stable</strong> if all poles lie in the left-half of the s-plane (Re(s) &lt; 0).</li>
          <li><strong>BIBO stability</strong>: Every bounded input ⇒ bounded output.</li>
          <li>First/second order systems can be judged from τ, ζ, ω<sub>n</sub>.</li>
          <li>Higher-order stability is checked using Routh–Hurwitz criteria.</li>
        </ul>
      `;
    }

    const critHelp = document.getElementById('criteria-help-card');
    if (critHelp) {
      critHelp.innerHTML = `
        <h3>Routh & Hurwitz – Quick Theory</h3>
        <ul>
          <li><strong>Routh array</strong>: Built from characteristic polynomial coefficients.</li>
          <li>No sign changes in the first column ⇒ all poles in LHP ⇒ stable.</li>
          <li><strong>Hurwitz matrix</strong>: Determinant of principal minors should be &gt; 0 for stability.</li>
          <li>These methods avoid explicit root-finding for high-order polynomials.</li>
        </ul>
      `;
    }
  }

  // ===========================
  // Parameter form generators
  // ===========================

  getFirstOrderForm(prefix = 'time') {
    const labelText =
      prefix === 'freq'
        ? 'Gain (Kmax for Root Locus / K for Bode)'
        : 'Gain (K)';

    return `
      <div class="dynamic-params">
        <div class="param-row">
          <label>${labelText}:</label>
          <input type="number" id="${prefix}-fo-k" value="1" step="0.01">
        </div>
        <div class="param-row">
          <label>Time Constant (τ):</label>
          <input type="number" id="${prefix}-fo-tau" value="1" step="0.01" min="0.1">
        </div>
        <div class="formula-display">
          Transfer Function: G(s) = K / (τs + 1)
        </div>
      </div>`;
  }

  getSecondOrderForm(prefix = 'time') {
    const labelText =
      prefix === 'freq'
        ? 'Gain (Kmax for Root Locus / K for Bode)'
        : 'Gain (K)';

    return `
      <div class="dynamic-params">
        <div class="param-row">
          <label>${labelText}:</label>
          <input type="number" id="${prefix}-so-k" value="1" step="0.01">
        </div>
        <div class="param-row">
          <label>Natural Frequency (ωₙ):</label>
          <input type="number" id="${prefix}-so-wn" value="2" step="0.01" min="0.1">
        </div>
        <div class="param-row">
          <label>Damping Ratio (ζ):</label>
          <input type="number" id="${prefix}-so-zeta" value="0.5" step="0.01" min="0" max="2">
        </div>
        <div class="formula-display">
          Transfer Function: G(s) = K·ωₙ² / (s² + 2ζωₙs + ωₙ²)
        </div>
      </div>`;
  }

  getHigherOrderForm(prefix = 'time') {
    const labelText =
      prefix === 'freq'
        ? 'Gain (Kmax for Root Locus / K for Bode)'
        : 'Gain (K)';

    return `
      <div class="dynamic-params">
        <div class="param-row">
          <label>${labelText}:</label>
          <input type="number" id="${prefix}-ho-k" value="10" step="0.1">
        </div>
        <div class="param-row">
          <label>Numerator Coefficients:</label>
          <input type="text" id="${prefix}-ho-num" value="1" placeholder="e.g., 1,2,1">
        </div>
        <div class="param-row">
          <label>Denominator Coefficients:</label>
          <input type="text" id="${prefix}-ho-den" value="1,3,3,1" placeholder="e.g., 1,3,3,1">
        </div>
        <div class="info-box">
          <strong>Format:</strong> Enter coefficients in descending powers of s<br>
          <strong>Example:</strong> For s² + 3s + 2, enter: 1,3,2
        </div>
      </div>`;
  }

  updateTimeParamsForm() {
    const orderEl = document.getElementById('time-system-order');
    if (!orderEl) return;
    const order = orderEl.value;
    const container = document.getElementById('time-params-dynamic');

    if (!container) return;

    if (order === 'first') {
      container.innerHTML = this.getFirstOrderForm('time');
    } else if (order === 'second') {
      container.innerHTML = this.getSecondOrderForm('time');
    } else {
      container.innerHTML = this.getHigherOrderForm('time');
    }

    this.updateZPKDisplay('time');
  }

  updateFreqParamsForm() {
    const orderEl = document.getElementById('freq-system-order');
    if (!orderEl) return;
    const order = orderEl.value;
    const container = document.getElementById('freq-params-dynamic');

    if (!container) return;

    if (order === 'first') {
      container.innerHTML = this.getFirstOrderForm('freq');
    } else if (order === 'second') {
      container.innerHTML = this.getSecondOrderForm('freq');
    } else {
      container.innerHTML = this.getHigherOrderForm('freq');
    }

    setTimeout(() => this.updateZPKDisplay('freq'), 120);
  }

  updateStabParamsForm() {
    const orderEl = document.getElementById('stab-system-order');
    if (!orderEl) return;
    const order = orderEl.value;
    const container = document.getElementById('stab-params-dynamic');

    if (!container) return;

    if (order === 'first') {
      container.innerHTML = this.getFirstOrderForm('stab');
    } else if (order === 'second') {
      container.innerHTML = this.getSecondOrderForm('stab');
    } else {
      container.innerHTML = this.getHigherOrderForm('stab');
    }

    setTimeout(() => this.updateZPKDisplay('stab'), 120);
  }

  updateCriteriaParamsForm() {
    const orderEl = document.getElementById('criteria-system-order');
    if (!orderEl) return;
    const order = orderEl.value;
    const container = document.getElementById('criteria-params-dynamic');

    if (!container) return;

    if (order === 'first') {
      container.innerHTML = this.getFirstOrderForm('criteria');
    } else if (order === 'second') {
      container.innerHTML = this.getSecondOrderForm('criteria');
    } else {
      container.innerHTML = this.getHigherOrderForm('criteria');
    }
  }

  // ===========================
  // ZPK Display
  // ===========================

  updateZPKDisplay(prefix) {
    const displayId = prefix === 'time' ? 'zpk-display' : `${prefix}-zpk-display`;
    const container = document.getElementById(displayId);
    if (!container) return;

    const orderEl = document.getElementById(`${prefix}-system-order`);
    if (!orderEl) return;
    const order = orderEl.value;
    const zpk = this.calculateZPK(order, prefix);

    container.innerHTML = `
      <h4>Zero-Pole-Gain (ZPK) Form</h4>
      <div class="zpk-content">
        <strong>Zeros:</strong> ${zpk.zeros}<br>
        <strong>Poles:</strong> ${zpk.poles}<br>
        <strong>Gain:</strong> ${zpk.gain}<br>
        <strong>Corner Frequencies:</strong> ${zpk.corners}
      </div>
    `;
  }

  // tolerant equality helper for numeric comparisons
  approximatelyEquals(a, b, tol = 1e-8) {
    return Math.abs(a - b) < tol;
  }

  calculateZPK(order, prefix) {
    try {
      if (order === 'first') {
        const K = parseFloat(document.getElementById(`${prefix}-fo-k`).value || 1);
        const tau = parseFloat(document.getElementById(`${prefix}-fo-tau`).value || 1);

        return {
          zeros: 'None',
          poles: `s = -${(1 / tau).toFixed(3)}`,
          gain: K.toFixed(3),
          corners: `ω_c = ${(1 / tau).toFixed(3)} rad/s`
        };
      } else if (order === 'second') {
        const K = parseFloat(document.getElementById(`${prefix}-so-k`).value || 1);
        const wn = parseFloat(document.getElementById(`${prefix}-so-wn`).value || 2);
        const zeta = parseFloat(document.getElementById(`${prefix}-so-zeta`).value || 0.5);

        let poles;
        if (zeta < 1) {
          const wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          poles = `s = -${(zeta * wn).toFixed(3)} ± j${wd.toFixed(3)}`;
        } else if (this.approximatelyEquals(zeta, 1)) {
          poles = `s = -${wn.toFixed(3)} (repeated)`;
        } else {
          const p1 = -zeta * wn + wn * Math.sqrt(zeta * zeta - 1);
          const p2 = -zeta * wn - wn * Math.sqrt(zeta * zeta - 1);
          poles = `s = ${p1.toFixed(3)}, ${p2.toFixed(3)}`;
        }

        return {
          zeros: 'None',
          poles: poles,
          gain: (K * wn * wn).toFixed(3),
          corners: `ω_n = ${wn.toFixed(3)} rad/s`
        };
      } else {
        return {
          zeros: 'Depends on numerator',
          poles: 'Roots of denominator',
          gain: 'See K, num, den',
          corners: 'From frequency response'
        };
      }
    } catch (error) {
      return { zeros: 'Error', poles: 'Error', gain: 'Error', corners: 'Error' };
    }
  }

  // ===========================
  // Utility functions
  // ===========================

  parseCoeffs(str) {
    try {
      return str.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    } catch (e) {
      return [];
    }
  }

  polynomialToString(coeffs, variable = 's') {
    const n = coeffs.length - 1;
    let terms = [];
    coeffs.forEach((c, i) => {
      if (Math.abs(c) < 1e-10) return;
      const power = n - i;
      let term = '';

      if (c < 0) {
        term += (terms.length === 0 ? '-' : ' - ');
        if (Math.abs(c) !== 1 || power === 0) term += Math.abs(c).toFixed(3);
      } else {
        term += (terms.length === 0 ? '' : ' + ');
        if (Math.abs(c) !== 1 || power === 0) term += c.toFixed(3);
      }

      if (power > 1) term += `${variable}^${power}`;
      else if (power === 1) term += `${variable}`;

      terms.push(term);
    });

    return terms.length ? terms.join('') : '0';
  }

  createTimeArray(endTime = 15, stepSize = 0.05) {
    const points = Math.ceil(endTime / stepSize) + 1;
    return Array.from({ length: points }, (_, i) => i * stepSize);
  }

  createFrequencyArray(minFreq = 0.1, maxFreq = 1000, pointsPerDecade = 50) {
    minFreq = Number(minFreq) || 0.1;
    maxFreq = Number(maxFreq) || 1000;
    pointsPerDecade = Number(pointsPerDecade) || 50;

    if (minFreq <= 0) minFreq = 0.1;
    if (maxFreq <= minFreq) maxFreq = Math.max(minFreq * 10, minFreq + 1);

    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const totalPoints = Math.max(2, Math.ceil((logMax - logMin) * pointsPerDecade));
    const pts = Math.max(2, totalPoints);

    return Array.from({ length: pts }, (_, i) => {
      const frac = (i / (pts - 1));
      const logFreq = logMin + frac * (logMax - logMin);
      return Math.pow(10, logFreq);
    });
  }

  // -----------------------
  // Complex helpers (added)
  // -----------------------
  complexAdd(a, b) {
    return { real: (a.real || 0) + (b.real || 0), imag: (a.imag || 0) + (b.imag || 0) };
  }

  complexMultiply(a, b) {
    const ar = a.real || 0, ai = a.imag || 0;
    const br = b.real || 0, bi = b.imag || 0;
    return { real: ar * br - ai * bi, imag: ar * bi + ai * br };
  }

  complexDivide(a, b) {
    const denom = b.real * b.real + b.imag * b.imag;
    if (Math.abs(denom) < 1e-10) return { real: 0, imag: 0 };
    return {
      real: (a.real * b.real + a.imag * b.imag) / denom,
      imag: (a.imag * b.real - a.real * b.imag) / denom
    };
  }

  complexMagnitude(c) {
    return Math.sqrt(c.real * c.real + c.imag * c.imag);
  }

  complexPhase(c) {
    return Math.atan2(c.imag, c.real);
  }

  complexPower(c, n) {
    if (n === 0) return { real: 1, imag: 0 };
    if (n === 1) return c;

    let result = { real: 1, imag: 0 };
    for (let i = 0; i < n; i++) {
      result = this.complexMultiply(result, c);
    }
    return result;
  }

  // ===========================
  // Polynomial Root Finding (Fallback)
  // ===========================

  findRoots(coeffs) {
    // Remove leading zeros
    while (coeffs.length > 0 && Math.abs(coeffs[0]) < 1e-12) {
      coeffs = coeffs.slice(1);
    }

    if (coeffs.length === 0) return [];
    if (coeffs.length === 1) return [];
    if (coeffs.length === 2) {
      // Linear: ax + b = 0 => x = -b/a
      const a = coeffs[0];
      const b = coeffs[1];
      if (Math.abs(a) < 1e-12) return [];
      return [{ re: -b / a, im: 0 }];
    }
    if (coeffs.length === 3) {
      // Quadratic: ax^2 + bx + c = 0
      const a = coeffs[0];
      const b = coeffs[1];
      const c = coeffs[2];
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        const sqrtD = Math.sqrt(discriminant);
        return [
          { re: (-b + sqrtD) / (2 * a), im: 0 },
          { re: (-b - sqrtD) / (2 * a), im: 0 }
        ];
      } else {
        const real = -b / (2 * a);
        const imag = Math.sqrt(-discriminant) / (2 * a);
        return [
          { re: real, im: imag },
          { re: real, im: -imag }
        ];
      }
    }

    // For higher-order polynomials, use Durand-Kerner method
    return this.durandKerner(coeffs);
  }

  durandKerner(coeffs, maxIterations = 100) {
    const n = coeffs.length - 1;
    if (n <= 0) return [];

    // Normalize polynomial (make leading coefficient 1)
    const a0 = coeffs[0];
    if (Math.abs(a0) < 1e-12) return [];
    const normalized = coeffs.map(c => c / a0);

    // Initial guesses: equally spaced on a circle
    const roots = [];
    const radius = Math.max(1, Math.abs(normalized[normalized.length - 1]));
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n;
      roots.push({
        real: radius * Math.cos(angle),
        imag: radius * Math.sin(angle)
      });
    }

    // Iterate using Durand-Kerner
    for (let iter = 0; iter < maxIterations; iter++) {
      let maxChange = 0;
      const newRoots = [];

      for (let i = 0; i < n; i++) {
        const r = { real: roots[i].real || roots[i].re || 0, imag: roots[i].imag || roots[i].im || 0 };
        let numerator = this.evaluatePolynomial(normalized, r);
        let denominator = { real: 1, imag: 0 };

        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const rj = { real: roots[j].real || roots[j].re || 0, imag: roots[j].imag || roots[j].im || 0 };
            const diff = this.complexSubtract(r, rj);
            denominator = this.complexMultiply(denominator, diff);
          }
        }

        const correction = this.complexDivide(numerator, denominator);
        const newRoot = this.complexSubtract(r, correction);

        const change = this.complexMagnitude(correction);
        maxChange = Math.max(maxChange, change);
        newRoots.push(newRoot);
      }

      roots.splice(0, roots.length, ...newRoots);

      if (maxChange < 1e-10) break;
    }

    return roots.map(r => ({ re: r.real || r.re || 0, im: r.imag || r.im || 0 }));
  }

  evaluatePolynomial(coeffs, x) {
    // Evaluate polynomial at complex point x
    // coeffs are in descending order: [a_n, a_{n-1}, ..., a_0]
    // x should be {real, imag}
    const xComplex = { real: x.real || x.re || 0, imag: x.imag || x.im || 0 };
    let result = { real: 0, imag: 0 };
    const n = coeffs.length - 1;

    for (let i = 0; i < coeffs.length; i++) {
      const power = n - i;
      const term = this.complexPower(xComplex, power);
      const scaled = this.complexMultiply({ real: coeffs[i], imag: 0 }, term);
      result = this.complexAdd(result, scaled);
    }

    return result;
  }

  complexSubtract(a, b) {
    return {
      real: (a.real || a.re || 0) - (b.real || b.re || 0),
      imag: (a.imag || a.im || 0) - (b.imag || b.im || 0)
    };
  }

  // =======================
  // Time Response Analysis
  // =======================

  async analyzeTimeResponse() {
    const plotDiv = document.getElementById('time-plot');
    if (plotDiv) plotDiv.innerHTML = '<div class="loading-spinner">Computing time response...</div>';

    try {
      await new Promise(resolve => setTimeout(resolve, 80));

      const orderEl = document.getElementById('time-system-order');
      const inputTypeEl = document.getElementById('time-input-type');
      if (!orderEl || !inputTypeEl) return;

      const order = orderEl.value;
      const inputType = inputTypeEl.value;

      let params = {};
      if (order === 'first') {
        params = {
          K: parseFloat(document.getElementById('time-fo-k').value || 1),
          tau: parseFloat(document.getElementById('time-fo-tau').value || 1)
        };
      } else if (order === 'second') {
        params = {
          K: parseFloat(document.getElementById('time-so-k').value || 1),
          wn: parseFloat(document.getElementById('time-so-wn').value || 2),
          zeta: parseFloat(document.getElementById('time-so-zeta').value || 0.5)
        };
      } else {
        params = {
          K: parseFloat(document.getElementById('time-ho-k').value || 1),
          num: this.parseCoeffs(document.getElementById('time-ho-num').value || '1'),
          den: this.parseCoeffs(document.getElementById('time-ho-den').value || '1,3,3,1')
        };
      }

      if (inputType === 'sinusoidal') {
        const sinFreqEl = document.getElementById('sin-freq');
        const sinAmpEl = document.getElementById('sin-amp');
        params.sinFreq = sinFreqEl ? parseFloat(sinFreqEl.value || 1) : 1;
        params.sinAmp = sinAmpEl ? parseFloat(sinAmpEl.value || 1) : 1;
      }

      const t = this.createTimeArray(15, 0.05);
      const y = this.computeTimeResponse(order, params, inputType, t);
      const responseParams = this.calculateTimeResponseParams(t, y, inputType);

      if (plotDiv) plotDiv.innerHTML = '';
      this.plotTimeResponse(t, y, order, inputType, params);
      this.updateTimeResponseTable(responseParams);
      this.updateZPKDisplay('time');
      this.updateTimeInterpretation(responseParams, inputType);

    } catch (error) {
      console.error('Time response error:', error);
      if (plotDiv) plotDiv.innerHTML = `<div class="error-message"><h3>Computation Error</h3><p>${error.message}</p></div>`;
    }
  }

  computeTimeResponse(order, params, inputType, t) {
    if (order === 'first') {
      const { K, tau } = params;

      if (inputType === 'step') {
        return t.map(time => K * (1 - Math.exp(-time / tau)));
      } else if (inputType === 'ramp') {
        return t.map(time => K * (time - tau * (1 - Math.exp(-time / tau))));
      } else if (inputType === 'parabolic') {
        return t.map(time =>
          K * (0.5 * time * time - tau * time + tau * tau * (1 - Math.exp(-time / tau)))
        );
      } else if (inputType === 'impulse') {
        return t.map(time => (K / tau) * Math.exp(-time / tau));
      } else if (inputType === 'sinusoidal') {
        // Complete first-order sinusoidal response = transient + steady-state
        const { sinFreq, sinAmp } = params;
        const magnitude = K / Math.sqrt(1 + (sinFreq * tau) * (sinFreq * tau));
        const phase = -Math.atan(sinFreq * tau);
        return t.map(time => {
          // Steady-state component
          const steadyState = magnitude * sinAmp * Math.sin(sinFreq * time + phase);
          // Transient component (decays with time constant τ)
          const transient = -magnitude * sinAmp * Math.sin(phase) * Math.exp(-time / tau);
          return steadyState + transient;
        });
      }

    } else if (order === 'second') {
      const { K, wn, zeta } = params;

      if (inputType === 'step') {
        if (zeta < 1) {
          // Standard underdamped step response formula:
          // c(t) = K × [1 - (e^(-ζωₙt) / √(1-ζ²)) × sin(ωd×t + φ)]
          // where φ = atan(√(1-ζ²)/ζ) = atan2(√(1-ζ²), ζ)
          const wd = wn * Math.sqrt(1 - zeta * zeta);
          const phi = Math.atan2(Math.sqrt(1 - zeta * zeta), zeta);
          return t.map(time => {
            if (time === 0) return 0;
            const expTerm = Math.exp(-zeta * wn * time);
            const sinTerm = Math.sin(wd * time + phi);
            return K * (1 - (expTerm / Math.sqrt(1 - zeta * zeta)) * sinTerm);
          });
        } else if (this.approximatelyEquals(zeta, 1)) {
          return t.map(time => K * (1 - (1 + wn * time) * Math.exp(-wn * time)));
        } else {
          const r1 = -zeta * wn + wn * Math.sqrt(zeta * zeta - 1);
          const r2 = -zeta * wn - wn * Math.sqrt(zeta * zeta - 1);
          return t.map(time => {
            const A = -r2 / (r1 - r2);
            const B = r1 / (r1 - r2);
            return K * (1 + A * Math.exp(r1 * time) + B * Math.exp(r2 * time));
          });
        }

      } else if (inputType === 'ramp') {
        // Second-order ramp response from inverse Laplace transform:
        // For G(s) = Kωn²/(s² + 2ζωns + ωn²) and R(s) = 1/s²
        // c(t) = K[t - 2ζ/ωn + (e^(-ζωnt)/ωd) × ((2ζ²-1)/ωn × sin(ωdt) + 2ζ/ωn × cos(ωdt))]
        if (zeta < 1) {
          const wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          const sigma = zeta * wn;
          return t.map(time => {
            if (time === 0) return 0;
            const expTerm = Math.exp(-sigma * time);
            // Correct transient from standard tables:
            // Transient = (e^(-σt)/ωd) × [((2ζ²-1)/ωn)sin(ωdt) + (2ζ/ωn)cos(ωdt)]
            const A = (2 * zeta * zeta - 1) / wn;
            const B = (2 * zeta) / wn;
            const transient = (expTerm / wd) * (A * Math.sin(wd * time) + B * Math.cos(wd * time));
            const steadyState = time - (2 * zeta / wn);
            return K * (steadyState + transient);
          });
        } else if (this.approximatelyEquals(zeta, 1)) {
          // Critically damped ramp response: c(t) = K[t - 2/ωn + (2/ωn)(1 + ωnt)e^(-ωnt)]
          return t.map(time => {
            const expTerm = Math.exp(-wn * time);
            const steadyState = time - 2 / wn;
            const transient = (2 / wn) * (1 + wn * time) * expTerm;
            return K * (steadyState + transient);
          });
        } else {
          // Overdamped ramp response with proper transient
          const sqrtTerm = Math.sqrt(zeta * zeta - 1);
          const p1 = -zeta * wn + wn * sqrtTerm;
          const p2 = -zeta * wn - wn * sqrtTerm;
          return t.map(time => {
            const steadyState = time - 2 * zeta / wn;
            const A1 = 1 / (2 * wn * wn * sqrtTerm * p1);
            const A2 = -1 / (2 * wn * wn * sqrtTerm * p2);
            const transient = A1 * Math.exp(p1 * time) - A2 * Math.exp(p2 * time);
            return K * (steadyState + transient * wn * wn);
          });
        }

      } else if (inputType === 'parabolic') {
        // Proper second-order parabolic response
        if (zeta < 1) {
          const wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          return t.map(time => {
            if (time === 0) return 0;
            const steadyState = K * (time * time / 2 - 2 * zeta * time / wn + (4 * zeta * zeta - 1) / (wn * wn)) / (wn * wn);
            return steadyState;
          });
        } else {
          return t.map(time => K * (time * time / 2) / (wn * wn));
        }

      } else if (inputType === 'impulse') {
        if (zeta < 1) {
          const wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          return t.map(time =>
            (K * wn / Math.sqrt(Math.max(1e-12, 1 - zeta * zeta))) *
            Math.exp(-zeta * wn * time) *
            Math.sin(wd * time)
          );
        } else {
          return t.map(time => K * wn * wn * time * Math.exp(-wn * time));
        }

      } else if (inputType === 'sinusoidal') {
        // Complete sinusoidal response = transient + steady-state
        const { sinFreq, sinAmp } = params;
        const numerator = K * wn * wn;
        const denomReal = wn * wn - sinFreq * sinFreq;
        const denomImag = 2 * zeta * wn * sinFreq;
        const magnitude = numerator / Math.sqrt(denomReal * denomReal + denomImag * denomImag);
        const phase = -Math.atan2(denomImag, denomReal);

        if (zeta < 1) {
          const wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          return t.map(time => {
            // Steady-state sinusoidal response
            const steadyState = magnitude * sinAmp * Math.sin(sinFreq * time + phase);
            // Transient component (decays exponentially)
            const expTerm = Math.exp(-zeta * wn * time);
            const transient = -magnitude * sinAmp * expTerm * Math.sin(phase) * Math.cos(wd * time) / Math.sqrt(1 - zeta * zeta);
            return steadyState + transient * (time < 10 / (zeta * wn) ? 1 : 0); // Transient dies after ~10 time constants
          });
        } else {
          // For overdamped/critically damped, transient decays faster
          return t.map(time => magnitude * sinAmp * Math.sin(sinFreq * time + phase));
        }
      }

    } else {
      return this.simulateHigherOrderSystem(params, inputType, t);
    }

    return t.map(() => 0);
  }

  simulateHigherOrderSystem(params, inputType, t) {
    const { K, num, den } = params;
    if (!den || den.length === 0) return t.map(() => 0);

    const dt = t.length > 1 ? (t[1] - t[0]) : 0.05;
    const n = den.length - 1;
    if (n <= 0) return t.map(() => 0);

    let d0 = den[0];
    if (Math.abs(d0) < 1e-12) return t.map(() => 0);

    const a = [];
    for (let i = 1; i < den.length; i++) {
      a.push(den[i] / d0);
    }

    let numDesc = (num && num.length) ? num.slice() : [1];
    const m = numDesc.length - 1;

    if (m >= n) {
      // keep lowest n terms (strictly proper)
      numDesc = numDesc.slice(numDesc.length - n);
    }

    while (numDesc.length < n) {
      numDesc.unshift(0);
    }

    const gainFactor = K / d0;
    const b = numDesc.map(c => c * gainFactor);

    const A = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n - 1; i++) {
      A[i][i + 1] = 1;
    }
    for (let j = 0; j < n; j++) {
      A[n - 1][j] = -a[n - 1 - j];
    }

    const B = new Array(n).fill(0);
    B[n - 1] = 1;

    const C = new Array(n);
    for (let j = 0; j < n; j++) {
      C[j] = b[n - 1 - j];
    }
    const D = 0;

    const x = new Array(n).fill(0);
    const y = new Array(t.length).fill(0);

    // Simple RK2 integrator for better stability than Euler
    for (let k = 0; k < t.length; k++) {
      const time = t[k];

      let u = 0;
      if (inputType === 'step') u = 1;
      else if (inputType === 'ramp') u = time;
      else if (inputType === 'parabolic') u = 0.5 * time * time;
      else if (inputType === 'impulse') {
        u = (k === 0) ? 1 / dt : 0;
      } else if (inputType === 'sinusoidal') {
        const { sinFreq, sinAmp } = params;
        u = sinAmp * Math.sin(sinFreq * time);
      }

      // dx = A*x + B*u
      const dx1 = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += A[i][j] * x[j];
        sum += B[i] * u;
        dx1[i] = sum;
      }

      // mid-state
      const xMid = x.map((xi, i) => xi + 0.5 * dt * dx1[i]);

      // compute dx at mid-state
      const dx2 = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) sum += A[i][j] * xMid[j];
        sum += B[i] * u;
        dx2[i] = sum;
      }

      for (let i = 0; i < n; i++) {
        x[i] += dt * dx2[i];
      }

      let yk = 0;
      for (let i = 0; i < n; i++) yk += C[i] * x[i];
      yk += D * u;
      y[k] = yk;
    }

    return y;
  }

  calculateTimeResponseParams(t, y, inputType) {
    if (!t || !y || t.length === 0 || y.length === 0) {
      return { delay: '-', rise: '-', peak: '-', settle: '-', overshoot: '-', ssv: '-', sse: '-' };
    }

    const finalValue = y[y.length - 1];
    let params = {
      delay: '-',
      rise: '-',
      peak: '-',
      settle: '-',
      overshoot: '-',
      ssv: finalValue.toFixed(3),
      sse: '-'
    };

    if (inputType === 'step' && Math.abs(finalValue) > 0.001) {
      // Delay Time (Td) - time to reach 50% of final value
      const val50 = finalValue * 0.5;
      const val10 = finalValue * 0.1;
      const val90 = finalValue * 0.9;
      let t50 = -1, t10 = -1, t90 = -1;

      for (let i = 0; i < y.length; i++) {
        if (t10 === -1 && y[i] >= val10) t10 = t[i];
        if (t50 === -1 && y[i] >= val50) t50 = t[i];
        if (t90 === -1 && y[i] >= val90) { t90 = t[i]; break; }
      }

      // Set delay time
      if (t50 >= 0) {
        params.delay = t50.toFixed(3) + ' s';
      }

      // Set rise time (10% to 90%)
      if (t10 >= 0 && t90 >= 0) {
        params.rise = (t90 - t10).toFixed(3) + ' s';
      }

      const maxVal = Math.max(...y);
      const maxIdx = y.indexOf(maxVal);

      if (maxVal > finalValue * 1.01) {
        params.peak = t[maxIdx].toFixed(3) + ' s';
        params.overshoot = (((maxVal - finalValue) / Math.abs(finalValue)) * 100).toFixed(1) + '%';
      } else {
        params.overshoot = '0%';
      }

      // Settling time (2% tolerance)
      const tolerance = Math.abs(finalValue) * 0.02;
      for (let i = y.length - 1; i >= 0; i--) {
        if (Math.abs(y[i] - finalValue) > tolerance) {
          params.settle = (t[i + 1] ? t[i + 1].toFixed(3) : t[i].toFixed(3)) + ' s';
          break;
        }
      }

      params.sse = (1 - finalValue).toFixed(3);

    } else if (inputType === 'ramp') {
      const inputSlope = 1;
      const outputSlope = (y[y.length - 1] - y[y.length - 2]) / (t[1] - t[0]);
      params.sse = (inputSlope - outputSlope).toFixed(3);
      // For ramp input, time parameters aren't typically defined
      params.delay = 'N/A (ramp input)';
      params.rise = 'N/A (ramp input)';
      params.peak = 'N/A (ramp input)';
      params.settle = 'N/A (ramp input)';
      params.overshoot = 'N/A (ramp input)';

    } else if (inputType === 'parabolic') {
      const finalTime = t[t.length - 1];
      const expectedOutput = 0.5 * finalTime * finalTime;
      params.sse = (expectedOutput - finalValue).toFixed(3);
      // For parabolic input, time parameters aren't typically defined
      params.delay = 'N/A (parabolic input)';
      params.rise = 'N/A (parabolic input)';
      params.peak = 'N/A (parabolic input)';
      params.settle = 'N/A (parabolic input)';
      params.overshoot = 'N/A (parabolic input)';

    } else if (inputType === 'impulse') {
      // For impulse input, standard time parameters don't apply the same way
      params.delay = 'N/A (impulse input)';
      params.rise = 'N/A (impulse input)';
      params.settle = 'N/A (impulse input)';
      params.overshoot = 'N/A (impulse input)';
      params.sse = 'N/A (impulse input)';
      // Find peak for impulse
      const maxVal = Math.max(...y);
      const maxIdx = y.indexOf(maxVal);
      params.peak = t[maxIdx].toFixed(3) + ' s';

    } else if (inputType === 'sinusoidal') {
      // For sinusoidal input, time parameters don't apply
      params.delay = 'N/A (sinusoidal input)';
      params.rise = 'N/A (sinusoidal input)';
      params.peak = 'N/A (sinusoidal input)';
      params.settle = 'N/A (sinusoidal input)';
      params.overshoot = 'N/A (sinusoidal input)';
      params.sse = 'N/A (oscillating)';
    }

    return params;
  }

  plotTimeResponse(t, y, order, inputType, params) {
    const plotData = [{
      x: t,
      y: y,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#8b5cf6', width: 3 },
      name: `${inputType.charAt(0).toUpperCase() + inputType.slice(1)} Response`
    }];

    let inputSignal = [];
    if (inputType === 'step') {
      inputSignal = t.map(() => 1);
    } else if (inputType === 'ramp') {
      inputSignal = t.map(time => time);
    } else if (inputType === 'parabolic') {
      inputSignal = t.map(time => 0.5 * time * time);
    } else if (inputType === 'sinusoidal') {
      const { sinFreq, sinAmp } = params;
      inputSignal = t.map(time => sinAmp * Math.sin(sinFreq * time));
    }

    if (inputSignal.length > 0 && inputType !== 'impulse') {
      plotData.push({
        x: t,
        y: inputSignal,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#22d3ee', width: 2, dash: 'dash' },
        name: 'Input Signal'
      });
    }

    const layout = {
      title: {
        text: `${order.charAt(0).toUpperCase() + order.slice(1)}-Order System: ${inputType.charAt(0).toUpperCase() + inputType.slice(1)} Response`,
        font: { size: 18, color: '#f1f5f9' }
      },
      xaxis: {
        title: { text: 'Time (seconds)', font: { color: '#94a3b8' } },
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      yaxis: {
        title: { text: 'System Output', font: { color: '#94a3b8' } },
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        zerolinecolor: 'rgba(148, 163, 184, 0.3)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      plot_bgcolor: 'rgba(15, 15, 26, 0.5)',
      paper_bgcolor: 'rgba(22, 22, 35, 0)',
      font: { family: 'Inter, sans-serif', size: 12, color: '#94a3b8' },
      margin: { t: 60, b: 50, l: 60, r: 30 },
      showlegend: true,
      legend: { font: { color: '#94a3b8' } }
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
      responsive: true
    };

    Plotly.newPlot('time-plot', plotData, layout, config);
  }

  updateTimeResponseTable(params) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText('time-res-delay', params.delay);
    setText('time-res-rise', params.rise);
    setText('time-res-peak', params.peak);
    setText('time-res-settle', params.settle);
    setText('time-res-overshoot', params.overshoot);
    setText('time-res-ssv', params.ssv);
    setText('time-res-sse', params.sse);
  }

  updateTimeInterpretation(params, inputType) {
    const el = document.getElementById('time-interpretation');
    if (!el) return;

    if (params.rise === '-' && inputType !== 'step') {
      el.textContent = `Non-step input (${inputType}) – only steady-state behaviour and error are shown.`;
      return;
    }

    if (inputType === 'step') {
      const overshootText = params.overshoot || '0%';
      const overshootNum = parseFloat((overshootText || '0').toString());
      const Ts = parseFloat((params.settle || '0').toString());

      let nature = 'well damped';
      if (overshootNum > 25) nature = 'highly underdamped (large overshoot)';
      else if (overshootNum > 5) nature = 'underdamped with moderate overshoot';
      else if (overshootNum === 0) nature = 'overdamped / critically damped (no overshoot)';

      el.textContent =
        `Step response is ${nature}. It reaches steady state around Ts ≈ ${params.settle} s with steady-state value ≈ ${params.ssv} and steady-state error ≈ ${params.sse}.`;
    } else {
      el.textContent =
        `For the selected ${inputType} input, use the plot shape and steady-state error (${params.sse}) to compare system performance.`;
    }
  }

  // ============================
  // Frequency Response + Root Locus
  // ============================

  evaluateTransferFunction(order, params, s) {
    if (order === 'first') {
      const { K, tau } = params;
      // G(jw) = K / (1 + j w tau) -> denom = 1 + j w tau
      const denominator = { real: 1, imag: s * tau };
      return this.complexDivide({ real: K, imag: 0 }, denominator);

    } else if (order === 'second') {
      const { K, wn, zeta } = params;
      const s2 = s * s;
      // denominator = (wn^2 - w^2) + j 2 zeta wn w
      const denominator = { real: wn * wn - s2, imag: 2 * zeta * wn * s };
      const numerator = { real: K * wn * wn, imag: 0 };
      return this.complexDivide(numerator, denominator);

    } else {
      const { K, num, den } = params;
      let numVal = { real: 0, imag: 0 };
      let denVal = { real: 0, imag: 0 };

      const jws = { real: 0, imag: s };

      for (let i = 0; i < num.length; i++) {
        const power = num.length - 1 - i;
        const sPower = this.complexPower(jws, power);
        const term = this.complexMultiply({ real: num[i], imag: 0 }, sPower);
        numVal = this.complexAdd(numVal, term);
      }

      for (let i = 0; i < den.length; i++) {
        const power = den.length - 1 - i;
        const sPower = this.complexPower(jws, power);
        const term = this.complexMultiply({ real: den[i], imag: 0 }, sPower);
        denVal = this.complexAdd(denVal, term);
      }

      const result = this.complexDivide(numVal, denVal);
      return this.complexMultiply({ real: K, imag: 0 }, result);
    }
  }

  async analyzeFrequencyResponse() {
    const plotDiv = document.getElementById('freq-plot');
    if (plotDiv) plotDiv.innerHTML = '<div class="loading-spinner">Computing frequency response...</div>';

    try {
      await new Promise(resolve => setTimeout(resolve, 80));

      const orderEl = document.getElementById('freq-system-order');
      const plotTypeEl = document.getElementById('freq-plot-type');
      if (!orderEl || !plotTypeEl) return;

      const order = orderEl.value;
      const plotType = plotTypeEl.value;

      // validate frequency range (safer parsing)
      let freqMinRaw = document.getElementById('freq-min')?.value;
      let freqMaxRaw = document.getElementById('freq-max')?.value;
      let freqMin = parseFloat(freqMinRaw);
      let freqMax = parseFloat(freqMaxRaw);

      if (!isFinite(freqMin) || freqMin <= 0) {
        freqMin = 0.1;
      }
      if (!isFinite(freqMax) || freqMax <= freqMin) {
        freqMax = freqMin * 1000;
      }
      const showMargins = !!document.getElementById('show-margins')?.checked;

      let params = {};
      if (order === 'first') {
        params = {
          K: parseFloat(document.getElementById('freq-fo-k').value || 1),
          tau: parseFloat(document.getElementById('freq-fo-tau').value || 1)
        };
      } else if (order === 'second') {
        params = {
          K: parseFloat(document.getElementById('freq-so-k').value || 1),
          wn: parseFloat(document.getElementById('freq-so-wn').value || 2),
          zeta: parseFloat(document.getElementById('freq-so-zeta').value || 0.5)
        };
      } else {
        params = {
          K: parseFloat(document.getElementById('freq-ho-k').value || 10),
          num: this.parseCoeffs(document.getElementById('freq-ho-num').value || '1'),
          den: this.parseCoeffs(document.getElementById('freq-ho-den').value || '1,3,3,1')
        };
      }

      if (plotType === 'root-locus') {
        const rlData = this.computeRootLocus(order, params);
        if (plotDiv) plotDiv.innerHTML = '';
        this.plotRootLocus(rlData, order);
        this.updateRootLocusInfo(rlData);
        this.updateFrequencyResponseTable({
          gainMargin: 'N/A (Root Locus mode)',
          phaseMargin: 'N/A (Root Locus mode)',
          gainCrossover: 'N/A (Root Locus mode)',
          phaseCrossover: 'N/A (Root Locus mode)',
          bandwidth: 'N/A (Root Locus mode)',
          resonantPeak: 'N/A (Root Locus mode)',
          cornerFreqs: 'N/A (Root Locus mode)'
        });
        this.updateFrequencyInterpretation(null, rlData);
        this.updateClosedLoopView(order, params, rlData);
        this.updateZPKDisplay('freq');
        return;
      }

      // Bode / Nyquist / Polar
      const freqs = this.createFrequencyArray(freqMin, freqMax);
      const freqResponse = this.computeFrequencyResponse(order, params, freqs);
      const margins = this.calculateStabilityMargins(freqs, freqResponse);

      if (plotDiv) plotDiv.innerHTML = '';
      this.plotFrequencyResponse(freqs, freqResponse, plotType, margins, showMargins);
      this.updateFrequencyResponseTable(margins);
      this.updateFrequencyInterpretation(margins, null);
      this.updateClosedLoopView(order, params, null);
      this.updateZPKDisplay('freq');

    } catch (error) {
      console.error('Frequency response error:', error);
      if (plotDiv) plotDiv.innerHTML = `<div class="error-message"><h3>Computation Error</h3><p>${error.message}</p></div>`;
    }
  }

  computeFrequencyResponse(order, params, freqs) {
    return freqs.map(freq => {
      const response = this.evaluateTransferFunction(order, params, freq);
      return {
        frequency: freq,
        magnitude: this.complexMagnitude(response),
        phase: this.complexPhase(response) * 180 / Math.PI,
        real: response.real,
        imag: response.imag
      };
    });
  }

  /// -------- Root Locus (corrected + robust) --------
  computeRootLocus(order, params) {
    // Build base numerator & denominator (coeff arrays in descending powers)
    let baseNum = [], den = [], KfromField = 100;
    if (order === 'first') {
      const tau = parseFloat(document.getElementById('freq-fo-tau')?.value || 1);
      KfromField = parseFloat(document.getElementById('freq-fo-k')?.value || 100);
      baseNum = [1];            // numerator 1
      den = [tau, 1];           // τ s + 1  -> [τ, 1]
    } else if (order === 'second') {
      const wn = parseFloat(document.getElementById('freq-so-wn')?.value || 2);
      const zeta = parseFloat(document.getElementById('freq-so-zeta')?.value || 0.5);
      KfromField = parseFloat(document.getElementById('freq-so-k')?.value || 100);
      baseNum = [wn * wn];      // wn^2
      den = [1, 2 * zeta * wn, wn * wn]; // s^2 + 2ζωn s + ωn^2
    } else {
      baseNum = this.parseCoeffs(document.getElementById('freq-ho-num')?.value || '1');
      den = this.parseCoeffs(document.getElementById('freq-ho-den')?.value || '1,3,3,1');
      KfromField = parseFloat(document.getElementById('freq-ho-k')?.value || 100);
    }

    // Read RL controls if present
    let Kmin = 0, Kmax = Math.max(50, KfromField), steps = 200;
    const rlKminEl = document.getElementById('rl-k-min');
    const rlKmaxEl = document.getElementById('rl-k-max');
    const rlStepsEl = document.getElementById('rl-k-steps');
    if (rlKminEl && rlKmaxEl && rlStepsEl) {
      const parsedMin = parseFloat(rlKminEl.value);
      const parsedMax = parseFloat(rlKmaxEl.value);
      const parsedSteps = parseInt(rlStepsEl.value, 10);
      if (!isNaN(parsedMin)) Kmin = parsedMin;
      if (!isNaN(parsedMax) && parsedMax > parsedMin) Kmax = parsedMax;
      if (!isNaN(parsedSteps) && parsedSteps > 4) steps = Math.min(Math.max(parsedSteps, 10), 2000);
    }

    if (Kmax <= Kmin) Kmax = Kmin + Math.max(50, Math.abs(Kmin) + 50);

    // pad numerator to same length (descending) as denominator
    const nDen = den.length;
    const nNum = baseNum.length;
    let numPad = baseNum.slice();
    if (nNum < nDen) {
      numPad = new Array(nDen - nNum).fill(0).concat(numPad);
    } else if (nNum > nDen) {
      numPad = numPad.slice(numPad.length - nDen);
    }

    // Helper to get roots either from math.js or fallback to findRoots()
    const safeRoots = (coeffs) => {
      try {
        // Robust conversion to plain JavaScript array
        let coeffsArray = null;

        // First, check if it's already a plain array
        if (Array.isArray(coeffs) && coeffs.constructor === Array) {
          // Create a new plain array to ensure it's not a matrix in disguise
          coeffsArray = Array.from(coeffs);
        } else if (coeffs && typeof coeffs === 'object') {
          // It's an object - try multiple methods to convert to array
          if (typeof math !== 'undefined') {
            // Method 1: Check if it's a math.js matrix using isMatrix
            if (math.isMatrix && typeof math.isMatrix === 'function' && math.isMatrix(coeffs)) {
              try {
                coeffsArray = Array.from(coeffs.toArray().flat());
              } catch (e) {
                // Fallback
              }
            }

            // Method 2: Try math.toArray
            if (!coeffsArray && typeof math.toArray === 'function') {
              try {
                const converted = math.toArray(coeffs);
                coeffsArray = Array.isArray(converted) ? Array.from(converted.flat()) : null;
              } catch (e) {
                // Fallback
              }
            }
          }

          // Method 3: Try toArray method directly
          if (!coeffsArray && typeof coeffs.toArray === 'function') {
            try {
              const converted = coeffs.toArray();
              coeffsArray = Array.isArray(converted) ? Array.from(converted.flat()) : null;
            } catch (e) {
              // Fallback
            }
          }

          // Method 4: Check for _data property (internal matrix structure)
          if (!coeffsArray && coeffs._data) {
            try {
              if (Array.isArray(coeffs._data)) {
                coeffsArray = Array.from(coeffs._data.flat());
              }
            } catch (e) {
              // Fallback
            }
          }

          // Method 5: Try to extract values if it's array-like
          if (!coeffsArray && (coeffs.length !== undefined || coeffs.size !== undefined)) {
            try {
              const len = coeffs.length || coeffs.size || 0;
              coeffsArray = [];
              for (let i = 0; i < len; i++) {
                const val = coeffs[i] || coeffs.get?.(i);
                if (val !== undefined) coeffsArray.push(Number(val));
              }
            } catch (e) {
              // Fallback
            }
          }
        }

        // Final fallback: if still not an array, try to create one
        if (!coeffsArray || !Array.isArray(coeffsArray)) {
          if (Array.isArray(coeffs)) {
            coeffsArray = Array.from(coeffs);
          } else {
            coeffsArray = [];
          }
        }

        // Ensure it's a flat, plain JavaScript array of numbers
        coeffsArray = Array.from(coeffsArray.flat()).map(v => Number(v) || 0);

        // Try math.js polynomialRoot first (correct API)
        if (typeof math !== 'undefined' && typeof math.polynomialRoot === 'function') {
          try {
            const r = math.polynomialRoot(coeffsArray) || [];
            return r.map(rr => {
              if (typeof rr === 'number') return { re: rr, im: 0 };
              if (typeof rr === 'object' && rr !== null) {
                return {
                  re: Number(rr.re ?? rr.real ?? rr.x ?? (Array.isArray(rr) ? rr[0] : 0) ?? 0),
                  im: Number(rr.im ?? rr.imag ?? rr.y ?? (Array.isArray(rr) ? rr[1] : 0) ?? 0)
                };
              }
              return { re: 0, im: 0 };
            });
          } catch (e) {
            console.warn('math.polynomialRoot failed, using fallback:', e);
          }
        }
        // Try legacy math.roots if it exists
        if (typeof math !== 'undefined' && typeof math.roots === 'function') {
          try {
            const r = math.roots(coeffsArray) || [];
            return r.map(rr => {
              if (typeof rr === 'number') return { re: rr, im: 0 };
              return {
                re: Number(rr.re ?? rr.x ?? (Array.isArray(rr) ? rr[0] : 0) ?? 0),
                im: Number(rr.im ?? rr.y ?? (Array.isArray(rr) ? rr[1] : 0) ?? 0)
              };
            });
          } catch (e) {
            console.warn('math.roots failed, using fallback:', e);
          }
        }
        // Fallback to our implementation
        if (typeof this.findRoots === 'function') {
          return this.findRoots(coeffsArray.slice()).map(rr => ({ re: Number(rr.re || 0), im: Number(rr.im || 0) }));
        }
        return [];
      } catch (e) {
        console.warn('safeRoots: root finding failed for coeffs', coeffs, e);
        return [];
      }
    };

    // compute open-loop poles (den roots) and zeros (numPad roots)
    let poles0 = [], zeros = [];
    try {
      const rP = safeRoots(den);
      poles0 = (rP || []).map(r => ({ re: Number(r.re), im: Number(r.im) }));
    } catch (e) {
      console.warn('computeRootLocus: cannot compute open-loop poles:', e);
      poles0 = [];
    }
    try {
      const rZ = safeRoots(numPad);
      zeros = (rZ || []).map(r => ({ re: Number(r.re), im: Number(r.im) }));
    } catch (e) {
      console.warn('computeRootLocus: cannot compute zeros from numerator:', e);
      zeros = [];
    }

    // compute roots for each K and store them
    const rootsByK = [];
    const Kvalues = [];
    for (let i = 0; i <= steps; i++) {
      const K = Kmin + (i / steps) * (Kmax - Kmin);
      Kvalues.push(K);

      // Characteristic polynomial coefficients (descending) D(s) + K·N(s)
      const charPoly = new Array(nDen).fill(0).map((_, idx) => {
        const d = Number(den[idx] || 0);
        const ncoeff = Number(numPad[idx] || 0);
        return d + K * ncoeff;
      });

      const allZero = charPoly.every(v => Math.abs(v) < 1e-12);
      if (allZero) {
        rootsByK.push([]);
        continue;
      }

      try {
        const roots = safeRoots(charPoly);
        const safeRootsArr = (roots || []).map(r => ({ re: Number(r.re), im: Number(r.im) }));
        rootsByK.push(safeRootsArr);
      } catch (err) {
        console.warn(`Root locus: roots failed for K=${K}:`, err);
        rootsByK.push([]);
      }
    }

    // Track pole trajectories: match roots across consecutive K steps by nearest neighbor
    let startIdx = 0;
    while (startIdx < rootsByK.length && (!rootsByK[startIdx] || rootsByK[startIdx].length === 0)) startIdx++;
    const series = [];

    // prepare dataScale for adaptive threshold
    const allRe = [].concat(...(poles0.map(p => p.re)), ...((zeros || []).map(z => z.re)));
    const allIm = [].concat(...(poles0.map(p => p.im)), ...((zeros || []).map(z => z.im)));
    const dataAbs = [].concat(allRe.map(Math.abs), allIm.map(Math.abs));
    const dataScale = dataAbs.length ? Math.max(1, Math.max(...dataAbs)) : 1;
    const MATCH_THRESHOLD = (dataScale * 0.5) ** 2; // squared distance threshold (adaptive)

    if (startIdx < rootsByK.length) {
      const seed = rootsByK[startIdx];
      for (let r = 0; r < seed.length; r++) {
        const arr = new Array(startIdx).fill(null);
        arr.push(seed[r]);
        series.push(arr);
      }

      for (let k = startIdx + 1; k < rootsByK.length; k++) {
        const rootsNow = rootsByK[k] || [];
        const used = new Array(rootsNow.length).fill(false);

        for (let sIdx = 0; sIdx < series.length; sIdx++) {
          const last = series[sIdx][series[sIdx].length - 1];
          if (!last) {
            series[sIdx].push(null);
            continue;
          }

          let bestIdx = -1;
          let bestDist = Infinity;
          for (let r = 0; r < rootsNow.length; r++) {
            if (used[r]) continue;
            const cand = rootsNow[r];
            const dr = cand.re - last.re;
            const di = cand.im - last.im;
            const dist = dr * dr + di * di;
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = r;
            }
          }

          if (bestIdx >= 0 && bestDist < MATCH_THRESHOLD) {
            used[bestIdx] = true;
            series[sIdx].push(rootsNow[bestIdx]);
          } else {
            series[sIdx].push(null);
          }
        }

        for (let r = 0; r < rootsNow.length; r++) {
          if (!used[r]) {
            const newSeries = new Array(k).fill(null);
            newSeries.push(rootsNow[r]);
            series.push(newSeries);
          }
        }
      }
    }

    const traces = series.map((traj, idx) => {
      const x = traj.map(p => (p ? p.re : null));
      const y = traj.map(p => (p ? p.im : null));
      return {
        x,
        y,
        mode: 'lines+markers',
        type: 'scatter',
        marker: { size: 6 },
        line: { width: 2 },
        name: `Pole path ${idx + 1}`
      };
    });

    return {
      traces,
      poles0,
      zeros,
      den: den.slice(),
      numPad: numPad.slice(),
      Kmin,
      Kmax,
      steps
    };
  }

  plotRootLocus(rootData, order) {
    const { traces = [], poles0 = [], zeros = [] } = rootData;
    const styledTraces = (traces || []).map((t, idx) => {
      const palette = ['#1d4ed8', '#0ea5a4', '#7c3aed', '#ef4444', '#f59e0b', '#059669'];
      const color = palette[idx % palette.length];
      return {
        ...t,
        marker: { size: 6, color },
        line: { width: 2, color },
        showlegend: false,
        connectgaps: false
      };
    });

    const polesTrace = {
      x: (poles0 || []).map(p => p.re),
      y: (poles0 || []).map(p => p.im),
      mode: 'markers',
      type: 'scatter',
      marker: { size: 10, color: '#ef4444', symbol: 'x' },
      name: 'Open-loop poles (K=0)'
    };

    const zerosTrace = {
      x: (zeros || []).map(z => z.re),
      y: (zeros || []).map(z => z.im),
      mode: 'markers',
      type: 'scatter',
      marker: { size: 10, color: '#10b981', symbol: 'circle-open' },
      name: 'Open-loop zeros'
    };

    const allX = [].concat(...styledTraces.map(t => t.x.filter(v => v !== null)), polesTrace.x || [], zerosTrace.x || []);
    const allY = [].concat(...styledTraces.map(t => t.y.filter(v => v !== null)), polesTrace.y || [], zerosTrace.y || []);
    const xmin = (allX.length ? Math.min(...allX) : -5) - 1;
    const xmax = (allX.length ? Math.max(...allX) : 5) + 1;
    const ymin = (allY.length ? Math.min(...allY) : -5) - 1;
    const ymax = (allY.length ? Math.max(...allY) : 5) + 1;

    const layout = {
      title: { text: `Root Locus (${order.charAt(0).toUpperCase() + order.slice(1)}-Order System)`, font: { color: '#f1f5f9' } },
      xaxis: {
        title: { text: 'Real Axis', font: { color: '#94a3b8' } },
        zeroline: true,
        zerolinecolor: 'rgba(148, 163, 184, 0.4)',
        range: [xmin, xmax],
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      yaxis: {
        title: { text: 'Imaginary Axis', font: { color: '#94a3b8' } },
        zeroline: true,
        zerolinecolor: 'rgba(148, 163, 184, 0.4)',
        range: [ymin, ymax],
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      shapes: [
        { type: 'line', x0: 0, x1: 0, y0: ymin, y1: ymax, line: { dash: 'dash', width: 1, color: 'rgba(148, 163, 184, 0.5)' } },
        { type: 'rect', x0: xmin, x1: 0, y0: ymin, y1: ymax, fillcolor: 'rgba(34, 197, 94, 0.08)', opacity: 1, line: { width: 0 } }
      ],
      plot_bgcolor: 'rgba(15, 15, 26, 0.5)',
      paper_bgcolor: 'rgba(22, 22, 35, 0)',
      font: { family: 'Inter, sans-serif', color: '#94a3b8' },
      margin: { t: 50, b: 50, l: 60, r: 30 },
      showlegend: true,
      legend: { font: { color: '#94a3b8' } }
    };

    const config = { displayModeBar: true, displaylogo: false, responsive: true };

    const data = [].concat(styledTraces, [polesTrace, zerosTrace]);
    Plotly.newPlot('freq-plot', data, layout, config);
  }

  updateRootLocusInfo(rlData) {
    const infoEl = document.getElementById('freq-rl-info');
    const charEl = document.getElementById('freq-char-eq');
    if (!infoEl && !charEl) return;

    const { den = [], numPad = [], Kmin = 0, Kmax = 0, steps = 0 } = rlData || {};

    if (infoEl) {
      infoEl.textContent = `Root locus plotted for K from ${Number(Kmin).toFixed(3)} to ${Number(Kmax).toFixed(3)} using ${steps} steps.`;
    }

    if (charEl) {
      const D = this.polynomialToString(den, 's');
      const N = this.polynomialToString(numPad, 's');
      charEl.innerHTML = `
        <strong>Characteristic equation:</strong><br>
        D(s) + K·N(s) = 0<br>
        D(s) = ${D}<br>
        N(s) = ${N}<br>
        Closed-loop denominator: D(s) + K·N(s)
      `;
      if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise().catch(() => {/*ignore*/ });
      }
    }
  }

  // -------- Bode / Nyquist / Polar --------

  calculateStabilityMargins(freqs, freqResponse) {
    let gainMargin = '-';
    let phaseMargin = '-';
    let gainCrossover = '-';
    let phaseCrossover = '-';
    let bandwidth = '-';
    let resonantPeak = '-';
    let cornerFreqs = [];

    try {
      // Gain crossover (|G| = 1)
      for (let i = 0; i < freqResponse.length - 1; i++) {
        if (freqResponse[i].magnitude >= 1 && freqResponse[i + 1].magnitude <= 1) {
          gainCrossover = freqResponse[i].frequency.toFixed(3);
          phaseMargin = (180 + freqResponse[i].phase).toFixed(1) + '°';
          break;
        }
      }

      // Phase crossover (phase = -180°)
      for (let i = 0; i < freqResponse.length - 1; i++) {
        if (freqResponse[i].phase >= -180 && freqResponse[i + 1].phase <= -180) {
          phaseCrossover = freqResponse[i].frequency.toFixed(3);
          if (freqResponse[i].magnitude > 1e-12) {
            gainMargin = (20 * Math.log10(1 / freqResponse[i].magnitude)).toFixed(1) + ' dB';
          }
          break;
        }
      }

      // Bandwidth (-3dB)
      const dcGain = freqResponse[0]?.magnitude || 0;
      const targetMag = dcGain / Math.sqrt(2);
      for (let i = 0; i < freqResponse.length; i++) {
        if (freqResponse[i].magnitude <= targetMag) {
          bandwidth = freqResponse[i].frequency.toFixed(3) + ' rad/s';
          break;
        }
      }

      const maxMag = Math.max(...freqResponse.map(r => r.magnitude));
      resonantPeak = (20 * Math.log10(maxMag || 1e-12)).toFixed(1) + ' dB';

      cornerFreqs = this.findCornerFrequencies(freqResponse, freqs);

    } catch (error) {
      console.error('Error calculating margins:', error);
    }

    // If no phase crossover found, GM is infinite (phase never reaches -180°)
    if (gainMargin === '-' && phaseCrossover === '-') {
      gainMargin = '∞ (Infinite)';
      phaseCrossover = 'N/A (phase never reaches -180°)';
    }

    // Add units to gain crossover if found
    if (gainCrossover !== '-') {
      gainCrossover = gainCrossover + ' rad/s';
    }

    return {
      gainMargin,
      phaseMargin,
      gainCrossover,
      phaseCrossover,
      bandwidth,
      resonantPeak,
      cornerFreqs: cornerFreqs.length > 0 ? cornerFreqs.join(', ') + ' rad/s' : '-'
    };
  }

  findCornerFrequencies(freqResponse, freqs) {
    const corners = [];
    const magDB = freqResponse.map(r => 20 * Math.log10(r.magnitude || 1e-12));

    for (let i = 1; i < magDB.length - 1; i++) {
      const slope1 = (magDB[i] - magDB[i - 1]) /
        (Math.log10(freqResponse[i].frequency) - Math.log10(freqResponse[i - 1].frequency || 1));
      const slope2 = (magDB[i + 1] - magDB[i]) /
        (Math.log10(freqResponse[i + 1].frequency) - Math.log10(freqResponse[i].frequency || 1));

      if (Math.abs(slope1 - slope2) > 10) {
        corners.push(freqResponse[i].frequency.toFixed(2) + ' rad/s');
      }
    }

    return corners.slice(0, 5);
  }

  plotFrequencyResponse(freqs, freqResponse, plotType, margins, showMargins) {
    let plotData = [];
    let layout = {};

    if (plotType === 'bode') {
      const magData = {
        x: freqs,
        y: freqResponse.map(r => 20 * Math.log10(Math.abs(r.magnitude || 1e-12))),
        type: 'scatter',
        mode: 'lines',
        line: { color: '#667eea', width: 3 },
        name: 'Magnitude',
        xaxis: 'x',
        yaxis: 'y'
      };

      const phaseData = {
        x: freqs,
        y: freqResponse.map(r => r.phase),
        type: 'scatter',
        mode: 'lines',
        line: { color: '#764ba2', width: 3 },
        name: 'Phase',
        xaxis: 'x2',
        yaxis: 'y2'
      };

      plotData = [magData, phaseData];

      if (showMargins) {
        const wcg = parseFloat(margins.gainCrossover);
        const wcp = parseFloat(margins.phaseCrossover);

        if (!isNaN(wcg) && wcg > 0) {
          plotData.push({
            x: [wcg, wcg],
            y: [-100, 100],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#ef4444', width: 2, dash: 'dash' },
            name: 'Gain Crossover',
            xaxis: 'x',
            yaxis: 'y',
            showlegend: true
          });
        }

        if (!isNaN(wcp) && wcp > 0) {
          plotData.push({
            x: [wcp, wcp],
            y: [-300, 300],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#f59e0b', width: 2, dash: 'dash' },
            name: 'Phase Crossover',
            xaxis: 'x2',
            yaxis: 'y2',
            showlegend: true
          });
        }
      }

      layout = {
        title: { text: 'Bode Plot with Stability Margins', font: { color: '#f1f5f9' } },
        xaxis: {
          type: 'log',
          title: { text: 'Frequency (rad/s)', font: { color: '#94a3b8' } },
          domain: [0, 1],
          anchor: 'y',
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        yaxis: {
          title: { text: 'Magnitude (dB)', font: { color: '#94a3b8' } },
          domain: [0.55, 1],
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        xaxis2: {
          type: 'log',
          title: { text: 'Frequency (rad/s)', font: { color: '#94a3b8' } },
          domain: [0, 1],
          anchor: 'y2',
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        yaxis2: {
          title: { text: 'Phase (degrees)', font: { color: '#94a3b8' } },
          domain: [0, 0.45],
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        plot_bgcolor: 'rgba(15, 15, 26, 0.5)',
        paper_bgcolor: 'rgba(22, 22, 35, 0)',
        font: { family: 'Inter, sans-serif', color: '#94a3b8' },
        showlegend: true,
        legend: { font: { color: '#94a3b8' } },
        margin: { t: 50, b: 50, l: 60, r: 30 }
      };

    } else if (plotType === 'nyquist') {
      plotData = [{
        x: freqResponse.map(r => r.real),
        y: freqResponse.map(r => r.imag),
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#8b5cf6', width: 3 },
        marker: { size: 4 },
        name: 'Nyquist Plot'
      }, {
        x: [-1],
        y: [0],
        type: 'scatter',
        mode: 'markers',
        marker: { color: '#f87171', size: 12, symbol: 'x' },
        name: 'Critical Point (-1,0)'
      }];

      layout = {
        title: { text: 'Nyquist Plot', font: { color: '#f1f5f9' } },
        xaxis: {
          title: { text: 'Real Part', font: { color: '#94a3b8' } },
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          zerolinecolor: 'rgba(148, 163, 184, 0.3)',
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        yaxis: {
          title: { text: 'Imaginary Part', font: { color: '#94a3b8' } },
          gridcolor: 'rgba(148, 163, 184, 0.15)',
          tickfont: { color: '#94a3b8' },
          zerolinecolor: 'rgba(148, 163, 184, 0.3)',
          linecolor: 'rgba(148, 163, 184, 0.3)'
        },
        plot_bgcolor: 'rgba(15, 15, 26, 0.5)',
        paper_bgcolor: 'rgba(22, 22, 35, 0)',
        font: { family: 'Inter, sans-serif', color: '#94a3b8' },
        showlegend: true,
        legend: { font: { color: '#94a3b8' } },
        margin: { t: 50, b: 50, l: 60, r: 30 }
      };

    } else if (plotType === 'polar') {
      plotData = [{
        r: freqResponse.map(r => r.magnitude),
        theta: freqResponse.map(r => r.phase),
        type: 'scatterpolar',
        mode: 'lines',
        line: { color: '#8b5cf6', width: 3 },
        name: 'Polar Plot'
      }];

      layout = {
        title: { text: 'Polar Plot', font: { color: '#f1f5f9' } },
        polar: {
          bgcolor: 'rgba(15, 15, 26, 0.5)',
          radialaxis: {
            title: { text: 'Magnitude', font: { color: '#94a3b8' } },
            gridcolor: 'rgba(148, 163, 184, 0.15)',
            tickfont: { color: '#94a3b8' },
            linecolor: 'rgba(148, 163, 184, 0.3)'
          },
          angularaxis: {
            gridcolor: 'rgba(148, 163, 184, 0.15)',
            tickfont: { color: '#94a3b8' },
            linecolor: 'rgba(148, 163, 184, 0.3)'
          }
        },
        paper_bgcolor: 'rgba(22, 22, 35, 0)',
        font: { family: 'Inter, sans-serif', color: '#94a3b8' },
        showlegend: true,
        legend: { font: { color: '#94a3b8' } },
        margin: { t: 50, b: 50, l: 60, r: 30 }
      };
    }

    const config = {
      displayModeBar: true,
      displaylogo: false,
      responsive: true
    };

    Plotly.newPlot('freq-plot', plotData, layout, config);
  }

  updateFrequencyResponseTable(margins) {
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText('freq-res-gm', margins.gainMargin);
    setText('freq-res-pm', margins.phaseMargin);
    setText('freq-res-wcg', margins.gainCrossover);
    setText('freq-res-wcp', margins.phaseCrossover);
    setText('freq-res-corners', margins.cornerFreqs);
    setText('freq-res-bw', margins.bandwidth);
    setText('freq-res-mr', margins.resonantPeak);
  }

  updateFrequencyInterpretation(margins, rlData) {
    const el = document.getElementById('freq-interpretation');
    if (!el) return;

    if (rlData) {
      const KmaxText = (typeof rlData.Kmax !== 'undefined') ? Number(rlData.Kmax).toFixed(2) : (rlData.Kmax || 0);
      el.textContent =
        `Root locus shows how the closed-loop poles move as gain K varies from 0 to Kmax = ${KmaxText}. If any poles cross into the right-half plane (Re(s) > 0), the closed-loop system becomes unstable.`;
      return;
    }

    if (!margins || !margins.phaseMargin || margins.phaseMargin === '-') {
      el.textContent = 'Bode data computed. Phase margin could not be determined - the system may not have a gain crossover frequency in the selected range.';
      return;
    }

    const pm = margins.phaseMargin;
    const gm = margins.gainMargin;
    const bw = margins.bandwidth;

    // parse pm numeric if possible
    let pmVal = parseFloat(pm);
    if (isNaN(pmVal)) pmVal = 0;

    el.textContent =
      `Phase margin ≈ ${pm} and gain margin ≈ ${gm}. This usually indicates a ${pmVal > 45 ? 'well-damped' : 'moderately damped'} closed-loop response. Bandwidth ≈ ${bw} rad/s indicates the frequency range where the system can follow input changes.`;
  }

  // ============================
  // Closed-loop Transfer Function View
  // ============================

  updateClosedLoopView(order, params, rlData) {
    const el = document.getElementById('closed-loop-display');
    if (!el) return;

    let num = [], den = [], K = 1;
    if (order === 'first') {
      const tau = params?.tau ?? parseFloat(document.getElementById('freq-fo-tau')?.value || 1);
      K = params?.K ?? parseFloat(document.getElementById('freq-fo-k')?.value || 1);
      num = [1];
      den = [tau, 1];
    } else if (order === 'second') {
      const wn = params?.wn ?? parseFloat(document.getElementById('freq-so-wn')?.value || 2);
      const zeta = params?.zeta ?? parseFloat(document.getElementById('freq-so-zeta')?.value || 0.5);
      K = params?.K ?? parseFloat(document.getElementById('freq-so-k')?.value || 1);
      num = [wn * wn];
      den = [1, 2 * zeta * wn, wn * wn];
    } else {
      K = params?.K ?? parseFloat(document.getElementById('freq-ho-k')?.value || 1);
      num = params?.num || this.parseCoeffs(document.getElementById('freq-ho-num')?.value || '1');
      den = params?.den || this.parseCoeffs(document.getElementById('freq-ho-den')?.value || '1,3,3,1');
    }

    if (!num.length || !den.length) {
      el.textContent = 'Closed-loop transfer function cannot be formed (missing numerator/denominator).';
      return;
    }

    const nDen = den.length;
    let numPad = num.slice();
    if (numPad.length < nDen) {
      numPad = new Array(nDen - numPad.length).fill(0).concat(numPad);
    } else if (numPad.length > nDen) {
      numPad = numPad.slice(numPad.length - nDen);
    }

    const Dstr = this.polynomialToString(den, 's');
    const Nstr = this.polynomialToString(numPad, 's');
    const denCL = den.map((d, idx) => d + K * (numPad[idx] || 0));
    const denCLstr = this.polynomialToString(denCL, 's');

    el.innerHTML = `
      <h4>Closed-Loop Transfer Function (Unity Feedback)</h4>
      <p>
        Generic form: <br>
        T(s) = K·N(s) / [D(s) + K·N(s)]<br>
        D(s) = ${Dstr}<br>
        N(s) = ${Nstr}
      </p>
      <p>
        For current K = ${K.toFixed(3)}:<br>
        Denominator: D(s) + K·N(s) = ${denCLstr}
      </p>
    `;
  }

  // ============================
  // Pole-Zero Map (new tab / section)
  // ============================

  analyzePoleZeroMap() {
    const orderEl = document.getElementById('freq-system-order');
    if (!orderEl) return;
    const order = orderEl.value;

    let num, den;
    if (order === 'first') {
      const tau = parseFloat(document.getElementById('freq-fo-tau')?.value || 1);
      num = [1];
      den = [tau, 1];
    } else if (order === 'second') {
      const wn = parseFloat(document.getElementById('freq-so-wn')?.value || 2);
      const zeta = parseFloat(document.getElementById('freq-so-zeta')?.value || 0.5);
      num = [wn * wn];
      den = [1, 2 * zeta * wn, wn * wn];
    } else {
      num = this.parseCoeffs(document.getElementById('freq-ho-num')?.value || '1');
      den = this.parseCoeffs(document.getElementById('freq-ho-den')?.value || '1,3,3,1');
    }

    if (!num.length || !den.length) return;

    // Use safeRoots helper (same as in computeRootLocus)
    const safeRoots = (coeffs) => {
      try {
        // Robust conversion to plain JavaScript array
        let coeffsArray = null;

        // First, check if it's already a plain array
        if (Array.isArray(coeffs) && coeffs.constructor === Array) {
          // Create a new plain array to ensure it's not a matrix in disguise
          coeffsArray = Array.from(coeffs);
        } else if (coeffs && typeof coeffs === 'object') {
          // It's an object - try multiple methods to convert to array
          if (typeof math !== 'undefined') {
            // Method 1: Check if it's a math.js matrix using isMatrix
            if (math.isMatrix && typeof math.isMatrix === 'function' && math.isMatrix(coeffs)) {
              try {
                coeffsArray = Array.from(coeffs.toArray().flat());
              } catch (e) {
                // Fallback
              }
            }

            // Method 2: Try math.toArray
            if (!coeffsArray && typeof math.toArray === 'function') {
              try {
                const converted = math.toArray(coeffs);
                coeffsArray = Array.isArray(converted) ? Array.from(converted.flat()) : null;
              } catch (e) {
                // Fallback
              }
            }
          }

          // Method 3: Try toArray method directly
          if (!coeffsArray && typeof coeffs.toArray === 'function') {
            try {
              const converted = coeffs.toArray();
              coeffsArray = Array.isArray(converted) ? Array.from(converted.flat()) : null;
            } catch (e) {
              // Fallback
            }
          }

          // Method 4: Check for _data property (internal matrix structure)
          if (!coeffsArray && coeffs._data) {
            try {
              if (Array.isArray(coeffs._data)) {
                coeffsArray = Array.from(coeffs._data.flat());
              }
            } catch (e) {
              // Fallback
            }
          }

          // Method 5: Try to extract values if it's array-like
          if (!coeffsArray && (coeffs.length !== undefined || coeffs.size !== undefined)) {
            try {
              const len = coeffs.length || coeffs.size || 0;
              coeffsArray = [];
              for (let i = 0; i < len; i++) {
                const val = coeffs[i] || coeffs.get?.(i);
                if (val !== undefined) coeffsArray.push(Number(val));
              }
            } catch (e) {
              // Fallback
            }
          }
        }

        // Final fallback: if still not an array, try to create one
        if (!coeffsArray || !Array.isArray(coeffsArray)) {
          if (Array.isArray(coeffs)) {
            coeffsArray = Array.from(coeffs);
          } else {
            coeffsArray = [];
          }
        }

        // Ensure it's a flat, plain JavaScript array of numbers
        coeffsArray = Array.from(coeffsArray.flat()).map(v => Number(v) || 0);

        if (typeof math !== 'undefined' && typeof math.polynomialRoot === 'function') {
          // polynomialRoot expects coefficients as individual arguments, not an array
          // coefficients should be in order from constant term to highest degree
          // Math.js expects: polynomialRoot(c0, c1, c2, ...) where c0 is constant, c1 is coefficient of x, etc.
          // Our coeffsArray is in descending order (highest degree first), so we need to reverse it
          const reversedCoeffs = coeffsArray.slice().reverse();
          const r = math.polynomialRoot(...reversedCoeffs) || [];
          return r.map(rr => {
            if (typeof rr === 'number') return { re: rr, im: 0 };
            return {
              re: Number(rr.re ?? rr.real ?? rr.x ?? 0),
              im: Number(rr.im ?? rr.imag ?? rr.y ?? 0)
            };
          });
        }
        if (typeof math !== 'undefined' && typeof math.roots === 'function') {
          // roots also expects coefficients as individual arguments in ascending order
          const r = math.roots(...reversedCoeffs) || [];
          return r.map(rr => {
            if (typeof rr === 'number') return { re: rr, im: 0 };
            return {
              re: Number(rr.re ?? rr.x ?? 0),
              im: Number(rr.im ?? rr.y ?? 0)
            };
          });
        }
        return this.findRoots(coeffsArray.slice()).map(rr => ({ re: Number(rr.re || 0), im: Number(rr.im || 0) }));
      } catch (e) {
        console.warn('Root finding failed:', e);
        const coeffsArray = Array.isArray(coeffs) ? coeffs : (coeffs && typeof coeffs.toArray === 'function' ? coeffs.toArray().flat() : []);
        return this.findRoots(coeffsArray.slice()).map(rr => ({ re: Number(rr.re || 0), im: Number(rr.im || 0) }));
      }
    };

    let poles = [], zeros = [];
    try {
      const rootsP = safeRoots(den);
      poles = rootsP;
    } catch (e) {
      console.warn('PZ map: error computing poles', e);
    }

    try {
      const nDen = den.length;
      let numPad = num.slice();
      if (numPad.length < nDen) {
        numPad = new Array(nDen - numPad.length).fill(0).concat(numPad);
      } else if (numPad.length > nDen) {
        numPad = numPad.slice(numPad.length - nDen);
      }
      const rootsZ = safeRoots(numPad);
      zeros = rootsZ;
    } catch (e) {
      console.warn('PZ map: error computing zeros', e);
    }

    this.plotPoleZeroMap(poles, zeros);
  }

  plotPoleZeroMap(poles, zeros) {
    const pzDiv = document.getElementById('pz-plot');
    if (!pzDiv) return;

    const poleTrace = {
      x: poles.map(p => p.re),
      y: poles.map(p => p.im),
      mode: 'markers',
      type: 'scatter',
      marker: { size: 10, color: '#ef4444', symbol: 'x' },
      name: 'Poles'
    };

    const zeroTrace = {
      x: zeros.map(z => z.re),
      y: zeros.map(z => z.im),
      mode: 'markers',
      type: 'scatter',
      marker: { size: 10, color: '#10b981', symbol: 'circle-open' },
      name: 'Zeros'
    };

    const allX = poles.map(p => p.re).concat(zeros.map(z => z.re));
    const allY = poles.map(p => p.im).concat(zeros.map(z => z.im));
    const xmin = (allX.length ? Math.min(...allX) : -5) - 1;
    const xmax = (allX.length ? Math.max(...allX) : 5) + 1;
    const ymin = (allY.length ? Math.min(...allY) : -5) - 1;
    const ymax = (allY.length ? Math.max(...allY) : 5) + 1;

    const layout = {
      title: { text: 'Pole-Zero Map', font: { color: '#f1f5f9' } },
      xaxis: {
        title: { text: 'Real Axis', font: { color: '#94a3b8' } },
        zeroline: true,
        zerolinecolor: 'rgba(148, 163, 184, 0.4)',
        range: [xmin, xmax],
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      yaxis: {
        title: { text: 'Imaginary Axis', font: { color: '#94a3b8' } },
        zeroline: true,
        zerolinecolor: 'rgba(148, 163, 184, 0.4)',
        range: [ymin, ymax],
        scaleanchor: 'x',
        gridcolor: 'rgba(148, 163, 184, 0.15)',
        tickfont: { color: '#94a3b8' },
        linecolor: 'rgba(148, 163, 184, 0.3)'
      },
      shapes: [
        {
          type: 'line',
          x0: 0,
          x1: 0,
          y0: ymin,
          y1: ymax,
          line: { dash: 'dash', width: 1, color: 'rgba(148, 163, 184, 0.5)' }
        },
        {
          type: 'rect',
          x0: xmin,
          x1: 0,
          y0: ymin,
          y1: ymax,
          fillcolor: 'rgba(34, 197, 94, 0.08)',
          opacity: 1,
          line: { width: 0 }
        }
      ],
      plot_bgcolor: 'rgba(15, 15, 26, 0.5)',
      paper_bgcolor: 'rgba(22, 22, 35, 0)',
      font: { family: 'Inter, sans-serif', color: '#94a3b8' },
      margin: { t: 50, b: 50, l: 60, r: 30 },
      showlegend: true,
      legend: { font: { color: '#94a3b8' } }
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      responsive: true
    };

    Plotly.newPlot('pz-plot', [poleTrace, zeroTrace], layout, config);

    const pzText = document.getElementById('pz-text');
    if (pzText) {
      const poleStr = poles.length
        ? poles.map(p => `${p.re.toFixed(3)} ${p.im >= 0 ? '+' : '-'} j${Math.abs(p.im).toFixed(3)}`).join(', ')
        : 'None';
      const zeroStr = zeros.length
        ? zeros.map(z => `${z.re.toFixed(3)} ${z.im >= 0 ? '+' : '-'} j${Math.abs(z.im).toFixed(3)}`).join(', ')
        : 'None';

      pzText.innerHTML = `
        <strong>Poles:</strong> ${poleStr}<br>
        <strong>Zeros:</strong> ${zeroStr}<br>
        All poles must lie in the left-half plane (Re(s) &lt; 0) for stability.
      `;
    }
  }

  // ============================
  // Stability Analysis (Simple)
  // ============================

  async analyzeStability() {
    const statusDiv = document.getElementById('stability-status');
    if (statusDiv) {
      statusDiv.textContent = 'Analyzing stability...';
      statusDiv.className = 'status-indicator';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 80));

      const orderEl = document.getElementById('stab-system-order');
      if (!orderEl) return;
      const order = orderEl.value;

      let params = {};
      let den = [];
      if (order === 'first') {
        const tau = parseFloat(document.getElementById('stab-fo-tau')?.value || 1);
        params.tau = tau;
        den = [tau, 1];

      } else if (order === 'second') {
        const wn = parseFloat(document.getElementById('stab-so-wn')?.value || 2);
        const zeta = parseFloat(document.getElementById('stab-so-zeta')?.value || 0.5);
        params.wn = wn;
        params.zeta = zeta;
        den = [1, 2 * zeta * wn, wn * wn];

      } else {
        den = this.parseCoeffs(document.getElementById('stab-ho-den')?.value || '1,3,3,1');
      }

      const stabilityResults = this.performStabilityAnalysis(order, params, den);
      this.updateStabilityResults(stabilityResults);

    } catch (error) {
      console.error('Stability analysis error:', error);
      const statusDiv2 = document.getElementById('stability-status');
      if (statusDiv2) {
        statusDiv2.textContent = 'Error in stability analysis';
        statusDiv2.className = 'status-indicator status-unstable';
      }
    }
  }

  performStabilityAnalysis(order, params, den) {
    let poles = [];
    let zeros = [];
    let stable = false;
    let biboStable = false;
    let routhResult = 'N/A';

    try {
      if (order === 'first') {
        const { tau } = params;
        poles = [(-1 / tau).toFixed(3)];
        zeros = ['None'];
        stable = tau > 0;
        biboStable = stable;
        routhResult = stable ? 'Stable' : 'Unstable';

      } else if (order === 'second') {
        const { wn, zeta } = params;

        if (zeta < 1) {
          const real = -zeta * wn;
          const imag = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
          poles = [`${real.toFixed(3)} ± j${imag.toFixed(3)}`];
        } else if (this.approximatelyEquals(zeta, 1)) {
          poles = [(-wn).toFixed(3) + ' (repeated)'];
        } else {
          const p1 = -zeta * wn + wn * Math.sqrt(zeta * zeta - 1);
          const p2 = -zeta * wn - wn * Math.sqrt(zeta * zeta - 1);
          poles = [p1.toFixed(3), p2.toFixed(3)];
        }

        zeros = ['None'];
        stable = wn > 0 && zeta > 0;
        biboStable = stable;
        routhResult = stable ? 'Stable' : 'Unstable';

      } else {
        const routhArray = this.buildRouthArray(den);
        const firstColumn = routhArray.map(row => row[0]).filter(v => typeof v === 'number' && !isNaN(v));
        const signChanges = this.countSignChanges(firstColumn);
        const allPositive = firstColumn.every(v => v > 0);
        stable = (signChanges === 0) && allPositive;
        biboStable = stable;
        routhResult = stable ? 'Stable (Routh-Hurwitz)' : 'Unstable (Routh-Hurwitz)';

        poles = ['See Routh-Hurwitz'];
        zeros = ['Depends on numerator'];
      }

    } catch (error) {
      console.error('Error in stability analysis:', error);
    }

    return {
      stable,
      biboStable,
      poles,
      zeros,
      routhResult
    };
  }

  updateStabilityResults(results) {
    const statusDiv = document.getElementById('stability-status');

    if (statusDiv) {
      if (results.stable) {
        statusDiv.textContent = 'System is STABLE';
        statusDiv.className = 'status-indicator status-stable';
      } else {
        statusDiv.textContent = 'System is UNSTABLE';
        statusDiv.className = 'status-indicator status-unstable';
      }
    }

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('stab-status', results.stable ? 'Stable' : 'Unstable');
    setText('stab-poles', Array.isArray(results.poles) ? results.poles.join(', ') : results.poles);
    setText('stab-zeros', Array.isArray(results.zeros) ? results.zeros.join(', ') : results.zeros);
    setText('stab-bibo', results.biboStable ? 'Yes' : 'No');
    setText('stab-routh', results.routhResult);
  }

  // ============================
  // Stability Criteria (Routh / Hurwitz)
  // ============================

  async analyzeStabilityCriteria() {
    const conclusionDiv = document.getElementById('criteria-conclusion');
    if (conclusionDiv) {
      conclusionDiv.textContent = 'Analyzing stability criteria...';
      conclusionDiv.className = 'status-indicator';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 80));

      const orderEl = document.getElementById('criteria-system-order');
      if (!orderEl) return;
      const order = orderEl.value;

      let den = [];
      if (order === 'first') {
        const tau = parseFloat(document.getElementById('criteria-fo-tau')?.value || 1);
        den = [tau, 1];

      } else if (order === 'second') {
        const wn = parseFloat(document.getElementById('criteria-so-wn')?.value || 2);
        const zeta = parseFloat(document.getElementById('criteria-so-zeta')?.value || 0.5);
        den = [1, 2 * zeta * wn, wn * wn];

      } else {
        den = this.parseCoeffs(document.getElementById('criteria-ho-den')?.value || '1,3,3,1');
      }

      this.generateRouthTable(den);
      this.generateHurwitzTable(den);

    } catch (error) {
      console.error('Stability criteria error:', error);
      if (conclusionDiv) {
        conclusionDiv.textContent = 'Error in stability analysis';
        conclusionDiv.className = 'status-indicator status-unstable';
      }
    }
  }

  generateRouthTable(den) {
    const n = den.length - 1;
    const routhArray = this.buildRouthArray(den);

    let tableHTML = '<table class="routh-array"><thead><tr><th>Power</th>';

    const maxCols = Math.ceil((n + 1) / 2);
    for (let i = 0; i < maxCols; i++) {
      tableHTML += `<th>Col ${i + 1}</th>`;
    }
    tableHTML += '</tr></thead><tbody>';

    for (let i = 0; i <= n; i++) {
      const power = n - i;
      tableHTML += `<tr><td class="routh-row-label">s^${power}</td>`;

      for (let j = 0; j < maxCols; j++) {
        const value = routhArray[i] && routhArray[i][j] !== undefined
          ? (typeof routhArray[i][j] === 'number' ? routhArray[i][j].toFixed(3) : routhArray[i][j])
          : '-';
        tableHTML += `<td>${value}</td>`;
      }
      tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';
    const routhEl = document.getElementById('routh-table');
    if (routhEl) routhEl.innerHTML = tableHTML;

    const firstColumn = routhArray.map(row => row[0]).filter(val => typeof val === 'number' && !isNaN(val));
    const signChanges = this.countSignChanges(firstColumn);

    const conclusionDiv = document.getElementById('criteria-conclusion');
    if (conclusionDiv) {
      if (signChanges === 0 && firstColumn.every(v => v > 0)) {
        conclusionDiv.textContent = 'System is STABLE (No sign changes in first column)';
        conclusionDiv.className = 'status-indicator status-stable';
      } else {
        conclusionDiv.textContent = `System is UNSTABLE (${signChanges} sign changes in first column)`;
        conclusionDiv.className = 'status-indicator status-unstable';
      }
    }
  }

  buildRouthArray(coeffs) {
    let c = coeffs.slice();
    if (!c || c.length === 0) return [];
    if (c[0] < 0) c = c.map(v => -v);

    const n = c.length - 1;
    const routhArray = [];

    // First row: even-indexed coefficients (a_n, a_{n-2}, a_{n-4}, ...)
    const firstRow = [];
    for (let i = 0; i < c.length; i += 2) firstRow.push(c[i]);
    routhArray.push(firstRow);

    // Second row: odd-indexed coefficients (a_{n-1}, a_{n-3}, a_{n-5}, ...)
    const secondRow = [];
    for (let i = 1; i < c.length; i += 2) secondRow.push(c[i]);
    routhArray.push(secondRow);

    const EPS = 1e-12;

    // Build remaining rows using proper Routh-Hurwitz formula
    for (let i = 2; i <= n; i++) {
      let prevRow1 = routhArray[i - 1].slice() || [];
      const prevRow2 = routhArray[i - 2] || [];
      const newRow = [];

      // Check for row of zeros (special case)
      const isRowOfZeros = prevRow1.every(val => Math.abs(val) < EPS);

      if (isRowOfZeros) {
        // SPECIAL CASE: Row of zeros - use auxiliary polynomial derivative method
        // The auxiliary polynomial is formed from the row ABOVE the zero row
        // A(s) = a₀s^m + a₁s^(m-2) + a₂s^(m-4) + ...
        // where m is the power of s for that row (n - (i-2) for row i-2)
        // Take derivative: A'(s) = m·a₀s^(m-1) + (m-2)·a₁s^(m-3) + ...

        const auxRowIndex = i - 2;
        const auxRow = prevRow2;
        const power = n - auxRowIndex; // Starting power for the auxiliary polynomial

        // Compute derivative coefficients
        const derivativeRow = [];
        for (let k = 0; k < auxRow.length; k++) {
          const currentPower = power - 2 * k;
          if (currentPower >= 0) {
            derivativeRow.push(auxRow[k] * currentPower);
          }
        }

        // Replace the zero row with derivative coefficients
        if (derivativeRow.length > 0 && derivativeRow.some(v => Math.abs(v) > EPS)) {
          prevRow1 = derivativeRow;
          routhArray[i - 1] = derivativeRow.slice();
        } else {
          // If derivative is also zeros, use small epsilon as fallback
          prevRow1 = [EPS];
          routhArray[i - 1] = [EPS];
        }
      }

      // First element of previous row (the pivot)
      let pivot = prevRow1[0];

      // Handle single zero first element (not entire row of zeros)
      if (Math.abs(pivot) < EPS && !isRowOfZeros) {
        // Replace single zero with small epsilon to continue
        pivot = EPS;
        routhArray[i - 1][0] = EPS;
      }

      const maxLen = Math.max(prevRow1.length, prevRow2.length);
      for (let j = 0; j < maxLen - 1; j++) {
        const b = prevRow2[j + 1] !== undefined ? prevRow2[j + 1] : 0;
        const c1 = prevRow1[j + 1] !== undefined ? prevRow1[j + 1] : 0;
        const d = prevRow2[0] !== undefined ? prevRow2[0] : 0;

        // Routh formula: (pivot * b - d * c1) / pivot
        const value = (pivot * b - d * c1) / (Math.abs(pivot) < EPS ? EPS : pivot);
        newRow.push(Number.isFinite(value) ? value : 0);
      }

      // If newRow is empty, add a zero
      if (newRow.length === 0) {
        newRow.push(0);
      }

      routhArray.push(newRow);
    }

    return routhArray;
  }

  countSignChanges(column) {
    let changes = 0;
    for (let i = 1; i < column.length; i++) {
      const prev = column[i - 1];
      const curr = column[i];
      if (Math.abs(prev) < 1e-12 || Math.abs(curr) < 1e-12) continue;
      if (Math.sign(curr) !== Math.sign(prev)) changes++;
    }
    return changes;
  }

  generateHurwitzTable(den) {
    const n = den.length - 1;
    const hurwitzMatrix = this.buildHurwitzMatrix(den);

    let tableHTML = '<h4>Hurwitz Matrix</h4>';
    tableHTML += '<table class="hurwitz-matrix"><thead><tr>';
    for (let i = 0; i <= n; i++) tableHTML += `<th>Col ${i + 1}</th>`;
    tableHTML += '</tr></thead><tbody>';

    for (let i = 0; i < n; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j <= n; j++) {
        const value = hurwitzMatrix[i] && hurwitzMatrix[i][j] !== undefined
          ? hurwitzMatrix[i][j].toFixed(3)
          : '0';
        tableHTML += `<td>${value}</td>`;
      }
      tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    tableHTML += '<h4>Principal Minors</h4>';
    tableHTML += '<table class="hurwitz-matrix"><tbody>';

    for (let k = 1; k <= n; k++) {
      const det = this.calculateMinorDeterminant(hurwitzMatrix, k);
      tableHTML += `<tr><td>Δ${k}</td><td>${det.toFixed(3)}</td></tr>`;
    }

    tableHTML += '</tbody></table>';

    const hurwitzEl = document.getElementById('hurwitz-table');
    if (hurwitzEl) hurwitzEl.innerHTML = tableHTML;
  }

  buildHurwitzMatrix(coeffs) {
    // For characteristic polynomial: a_0*s^n + a_1*s^(n-1) + ... + a_n
    // coeffs is in descending order: [a_0, a_1, a_2, ..., a_n]
    // Standard Hurwitz matrix H has element H[i,j] = a_{2i-j+1}
    // where a_k = 0 for k < 0 or k > n
    const n = coeffs.length - 1;
    const a = coeffs.slice();
    const matrix = [];

    // Build n x n Hurwitz matrix
    for (let i = 1; i <= n; i++) {
      const row = [];
      for (let j = 1; j <= n; j++) {
        // Index into coefficient array: 2*i - j
        // But coeffs is 0-indexed, so we need: 2*i - j
        const idx = 2 * i - j;
        if (idx >= 0 && idx < a.length) {
          row.push(a[idx]);
        } else {
          row.push(0);
        }
      }
      matrix.push(row);
    }

    return matrix;
  }

  calculateMinorDeterminant(matrix, size) {
    const sub = matrix.slice(0, size).map(row => row.slice(0, size));
    return this.determinant(sub);
  }

  determinant(m) {
    const n = m.length;
    if (n === 0) return 0;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = m.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j));
      const cofactor = (j % 2 === 0 ? 1 : -1) * m[0][j] * this.determinant(minor);
      det += cofactor;
    }
    return det;
  }
}

// --- Initialization guard: prevents double-init if script is included multiple times ---
if (window.__AdvancedControlSystemAnalyzerInitialized) {
  console.warn('AdvancedControlSystemAnalyzer: already initialized - skipping duplicate load.');
} else {
  window.__AdvancedControlSystemAnalyzerInitialized = true;
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Advanced Control System Analyzer...');
    window.__advancedAnalyzerInstance = new AdvancedControlSystemAnalyzer();
  });
}