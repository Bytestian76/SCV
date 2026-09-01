import React from 'react';
import { ChevronDown } from 'lucide-react';

export const HourlyMovementsChart = ({ data = [] }) => {
  // Puntos de la curva suavizada
  // Eje X: 00:00 (50), 04:00 (130), 08:00 (210), 12:00 (290), 16:00 (370), 20:00 (450), 24:00 (530)
  // Eje Y (0 a 50 movs): 50 -> Y=30, 0 -> Y=180
  
  return (
    <div className="dash-card">
      <div className="card-header">
        <h3>Movimientos por hora</h3>
        <div className="date-pill" style={{ padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
          <span>Hoy</span>
          <ChevronDown size={13} />
        </div>
      </div>

      <div className="chart-container">
        <svg viewBox="0 0 580 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines horizontales */}
          <line x1="40" y1="40" x2="550" y2="40" stroke="#f0f4f1" strokeWidth="1" />
          <line x1="40" y1="80" x2="550" y2="80" stroke="#f0f4f1" strokeWidth="1" />
          <line x1="40" y1="120" x2="550" y2="120" stroke="#f0f4f1" strokeWidth="1" />
          <line x1="40" y1="160" x2="550" y2="160" stroke="#f0f4f1" strokeWidth="1" />

          {/* Etiquetas Eje Y */}
          <text x="20" y="44" fontSize="10" fill="#8a9c93" textAnchor="end">50</text>
          <text x="20" y="84" fontSize="10" fill="#8a9c93" textAnchor="end">40</text>
          <text x="20" y="124" fontSize="10" fill="#8a9c93" textAnchor="end">30</text>
          <text x="20" y="164" fontSize="10" fill="#8a9c93" textAnchor="end">10</text>
          <text x="20" y="184" fontSize="10" fill="#8a9c93" textAnchor="end">0</text>

          {/* Curva y Área de relleno */}
          <path
            d="M 50 170 C 100 170, 110 145, 130 145 C 160 145, 180 85, 210 85 C 240 85, 260 40, 290 40 C 320 40, 340 120, 370 120 C 400 120, 420 85, 450 85 C 480 85, 500 150, 530 160 L 530 180 L 50 180 Z"
            fill="url(#curveGradient)"
          />

          <path
            d="M 50 170 C 100 170, 110 145, 130 145 C 160 145, 180 85, 210 85 C 240 85, 260 40, 290 40 C 320 40, 340 120, 370 120 C 400 120, 420 85, 450 85 C 480 85, 500 150, 530 160"
            fill="none"
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Marcador del punto máximo en 12:00 */}
          <circle cx="290" cy="40" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />

          {/* Tooltip en 12:00 */}
          <g transform="translate(290, 8)">
            <rect x="-42" y="-12" width="84" height="28" rx="6" fill="#ffffff" stroke="#e8eee9" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
            <text x="0" y="0" fontSize="10" fill="#8a9c93" fontWeight="600" textAnchor="middle">12:00</text>
            <text x="0" y="11" fontSize="10" fill="#121d18" fontWeight="700" textAnchor="middle">42 movs</text>
          </g>

          {/* Etiquetas Eje X */}
          <text x="50" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">00:00</text>
          <text x="130" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">04:00</text>
          <text x="210" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">08:00</text>
          <text x="290" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">12:00</text>
          <text x="370" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">16:00</text>
          <text x="450" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">20:00</text>
          <text x="530" y="195" fontSize="10" fill="#8a9c93" textAnchor="middle">24:00</text>
        </svg>
      </div>
    </div>
  );
};
