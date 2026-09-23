* { box-sizing: border-box; }
html, body {
  margin: 0;
  height: 100%;
  font-family: Arial, sans-serif;
  background: #0f1013;
  color: white;
}
body {
  display: grid;
  place-items: center;
  padding: 18px;
}

.app-shell {
  width: min(1440px, 100%);
  height: min(900px, calc(100vh - 32px));
  min-height: 720px;
  background: #000;
  box-shadow: 0 18px 32px rgba(0,0,0,0.52);
  overflow: hidden;
}

.browser-bar {
  height: 45px;
  background: rgba(27,29,34,0.98);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  font-size: 13px;
  color: #edf3ff;
}
.browser-dots {
  display: flex;
  gap: 8px;
}
.browser-dots i {
  width: 12px;
  height: 12px;
  display: inline-block;
  border-radius: 50%;
  background: #fff;
}
.browser-dots i:nth-child(1) { background: #ff5f57; }
.browser-dots i:nth-child(2) { background: #ffbd2f; }
.browser-dots i:nth-child(3) { background: #28c840; }
.tab {
  padding: 8px 12px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px 8px 0 0;
  border: 1px solid rgba(255,255,255,0.06);
}
.address {
  margin-left: auto;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 6px 14px;
  font-size: 11px;
  color: #dfe9ff;
  max-width: 380px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.simulation {
  position: relative;
  height: calc(100% - 45px);
  background: #02060a;
  overflow: hidden;
}

.temperature-box {
  position: absolute;
  left: 42%;
  top: 28px;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 700;
  z-index: 5;
}

.thermometer {
  position: absolute;
  left: 42%;
  top: 80px;
  width: 26px;
  height: 180px;
  transform: translateX(-50%);
  z-index: 4;
}
.thermo-body {
  position: absolute;
  left: 50%;
  top: 6px;
  transform: translateX(-50%);
  width: 18px;
  height: 120px;
  border: 3px solid rgba(255,255,255,0.7);
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
}
.thermo-fill {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  width: 12px;
  height: 35%;
  background: linear-gradient(to top, #ef4e4e, #ff9966);
  border-radius: 9px;
  transition: height 0.2s ease;
}
.thermo-bulb {
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fa4b4b;
  border: 2px solid rgba(255,255,255,0.22);
}

.chamber-wrap {
  position: absolute;
  left: 48%;
  top: 52%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 470px;
}
.chamber {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 340px;
  height: 390px;
  border-radius: 18px 18px 12px 12px;
  background: linear-gradient(90deg, rgba(118,118,118,0.95), rgba(55,55,55,0.92) 15%, rgba(0,0,0,0.9) 42%, rgba(80,80,80,0.9) 90%);
  box-shadow: inset 0 0 16px rgba(255,255,255,0.18);
  border: 8px solid rgba(194,200,205,0.8);
}
.chamber::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -18px;
  height: 30px;
  background: rgba(123,127,133,0.7);
  border-radius: 50%;
}
#particleCanvas {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 26px;
  bottom: 18px;
  width: auto;
  height: auto;
  display: block;
  background: rgba(0,0,0,0.08);
  border: 4px solid rgba(255,255,255,0.08);
}
.lid {
  position: absolute;
  top: 12px;
  left: 42px;
  right: 42px;
  height: 22px;
  background: linear-gradient(#d9d9d9, #7f8184);
  border: 2px solid rgba(255,255,255,0.72);
  border-radius: 50px;
  z-index: 10;
  cursor: grab;
  touch-action: none;
}
.lid-grip {
  position: absolute;
  right: -18px;
  top: -2px;
  color: #f7d37b;
  font-size: 24px;
}

.bucket {
  position: absolute;
  left: 50%;
  bottom: 88px;
  transform: translateX(-50%);
  width: 140px;
  height: 120px;
  cursor: grab;
  touch-action: none;
  z-index: 7;
}
.bucket-fire {
  height: 32px;
  font-size: 32px;
  text-align: center;
  animation: flicker 0.5s infinite alternate;
}
.bucket-body {
  position: relative;
  width: 100%;
  height: 70px;
  border-radius: 12px 12px 18px 18px;
  background: linear-gradient(180deg, #dfe6ee, #9ea9b9);
  color: #262d32;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  padding-top: 10px;
  box-shadow: inset 0 0 10px rgba(255,255,255,0.25);
}
.bucket-scale {
  width: 64px;
  height: 8px;
  margin: 8px auto 0;
  background: rgba(0,0,0,0.18);
  border-radius: 8px;
  overflow: hidden;
}
.bucket-scale i {
  display: block;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #f55d5d, #ffb252);
}

.pump {
  position: absolute;
  left: 110px;
  bottom: 96px;
  width: 180px;
  height: 150px;
  z-index: 6;
}
.pump-body {
  position: absolute;
  left: 18px;
  bottom: 0;
  width: 46px;
  height: 120px;
  border-radius: 8px 8px 16px 16px;
  background: linear-gradient(90deg, #d13b31, #860f0c 60%, #b63f3b);
  box-shadow: inset 0 0 12px rgba(255,255,255,0.08);
}
.pump-handle {
  position: absolute;
  left: 52px;
  bottom: 42px;
  width: 96px;
  height: 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.22);
  transform-origin: 18px 50%;
  transform: rotate(-25deg);
  cursor: grab;
  touch-action: none;
}
.pump-handle::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e7e7e7;
}

.side-panel {
  position: absolute;
  right: 62px;
  top: 32px;
  width: 240px;
  padding: 12px 10px 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.06);
  border-radius: 10px;
}
.side-panel h3 {
  margin: 0 0 10px;
  font-size: 18px;
  text-align: center;
}
.materials {
  display: grid;
  gap: 8px;
}
.material {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 8px;
  background: rgba(255,255,255,0.03);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 14px;
  cursor: pointer;
}
.material.active {
  border-color: rgba(255,255,255,0.44);
}
.material i {
  display: inline-block;
  width: 15px;
  height: 15px;
  border-radius: 50%;
}
.neon { background: #2ae6ef; }
.argon { background: #ff8ca1; }
.oxygen { background: #ff6c2f; }
.water { background: #afd2ff; }

.phase-buttons {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.phase {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  border: 2px solid #efc869;
  background: rgba(240, 197, 88, 0.25);
  color: #f9f1d3;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.phase.active {
  background: rgba(240, 197, 88, 0.44);
}

.panel-card {
  margin-top: 18px;
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 8px;
  padding: 10px 8px;
  background: rgba(255,255,255,0.02);
}
.panel-card p {
  margin: 8px 0;
  font-size: 12px;
  color: #dfeaf8;
  line-height: 1.5;
}
.hidden { display: none !important; }

.gauge-title {
  font-size: 13px;
  font-weight: 700;
}
.gauge {
  position: relative;
  width: 100%;
  height: 58px;
  margin: 10px 0 8px;
  border: 3px solid rgba(255,255,255,0.18);
  border-bottom: none;
  border-radius: 80px 80px 0 0;
}
.gauge-needle {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 3px;
  height: 40px;
  background: red;
  transform-origin: 50% 100%;
  transform: rotate(-30deg);
  border-radius: 4px;
}

.interaction-controls {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.force {
  flex: 1;
  border-radius: 6px;
  border: 1px solid #b1d8d8;
  background: #1d2228;
  color: white;
  padding: 6px 4px;
  cursor: pointer;
}
.force.active {
  background: #6d2cc7;
}
#forceGraph {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.15);
}

.transport {
  position: absolute;
  left: 39%;
  bottom: 105px;
  display: flex;
  gap: 16px;
}
.transport button, .reset-btn {
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: inset 0 0 18px rgba(255,255,255,0.08);
}
.reset-btn {
  position: absolute;
  right: 84px;
  bottom: 100px;
  background: linear-gradient(135deg, #f4ad38, #ea7d1f);
  font-size: 28px;
}

.bottom-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 82px;
  background: rgba(23,21,27,0.95);
  border-top: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}
.bottom-bar strong {
  font-size: 22px;
}
.tabs {
  display: flex;
  gap: 18px;
}
.nav {
  background: transparent;
  border: none;
  color: #dfe7f8;
  font-size: 14px;
  padding: 10px 8px;
  cursor: pointer;
}
.nav.active {
  color: white;
  border-bottom: 2px solid rgba(255,255,255,0.8);
}

@keyframes flicker {
  to { transform: scale(1.12); }
}

@media (max-width: 1000px) {
  .address { display: none; }
  .side-panel { right: 20px; }
  .temperature-box { left: 32%; }
  .thermometer { left: 32%; }
  .transport { left: 30%; }
}
