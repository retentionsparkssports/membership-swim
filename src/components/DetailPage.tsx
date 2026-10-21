import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord } from '../types';
import { BrandLogo } from './BrandLogo';
import { ExpiryBanner } from './ExpiryBanner';
import {
  cleanCell,
  getInitials,
  getClassLabel,
  simplifyClassName,
  isRegularClass,
  isTrialChangeClass,
  isMakeUpClass,
  isLeaveAttendance,
  getStatusBadge,
  getSafeWhatsAppLink,
  SUPPORT_WA,
  SUPPORT_LABEL,
} from '../lib/helpers';

interface DetailPageProps {
  student: Student;
  attendance: AttendanceRecord[];
  onBackToDashboard: () => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  student,
  attendance,
  onBackToDashboard,
}) => {
  // Extract quarters and terms
  const { quarterMap, sortedQuarters } = useMemo(() => {
    const map: Record<string, string> = {};
    attendance.forEach((r) => {
      if (r.quarter) {
        if (!map[r.quarter]) {
          map[r.quarter] = r.term || r.quarter;
        }
      }
    });
    const sorted = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return { quarterMap: map, sortedQuarters: sorted };
  }, [attendance]);

  const [selectedQuarter, setSelectedQuarter] = useState<string>(
    sortedQuarters.length > 0 ? sortedQuarters[0] : ''
  );

  const [activeTab, setActiveTab] = useState<string>('__all__');

  // Filter attendance by quarter
  const filteredAttendance = useMemo(() => {
    if (!selectedQuarter) return attendance;
    return attendance.filter((r) => r.quarter === selectedQuarter);
  }, [attendance, selectedQuarter]);

  // Group classes for tabs
  const { classMap, classKeys, trialAll, makeupAll } = useMemo(() => {
    const cmap: Record<string, AttendanceRecord[]> = {};
    filteredAttendance.forEach((r) => {
      if (isRegularClass(r.statusClass)) {
        const classLabel = getClassLabel(r.class_);
        if (classLabel && !cmap[classLabel]) {
          cmap[classLabel] = filteredAttendance.filter(
            (row) => getClassLabel(row.class_) === classLabel
          );
        }
      }
    });

    const ckeys = Object.keys(cmap);
    const trials = filteredAttendance.filter((r) => isTrialChangeClass(r.statusClass));
    const makeups = filteredAttendance.filter((r) => isMakeUpClass(r.statusClass));

    return { classMap: cmap, classKeys: ckeys, trialAll: trials, makeupAll: makeups };
  }, [filteredAttendance]);

  // Filter rows by active tab and sort desc by date
  const rows = useMemo(() => {
    let list: AttendanceRecord[] = [];
    if (activeTab === '__makeup__') {
      list = makeupAll;
    } else if (activeTab === '__trial__') {
      list = trialAll;
    } else if (activeTab === '__all__') {
      list = filteredAttendance;
    } else {
      list = classMap[activeTab] || [];
    }

    return list.slice().sort((a, b) => {
      const dateA = a.rawDate || a.dateStr || '';
      const dateB = b.rawDate || b.dateStr || '';
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.localeCompare(dateA);
    });
  }, [activeTab, makeupAll, trialAll, filteredAttendance, classMap]);

  // Metric counts
  const countPresent = rows.filter((r) => cleanCell(r.attendance) === 'Present').length;
  const countIzin = rows.filter((r) => isLeaveAttendance(r.attendance)).length;
  const countAbsent = rows.length - countPresent - countIzin;
  const countTrial = rows.filter((r) => isTrialChangeClass(r.statusClass)).length;
  const countMakeUp = rows.filter((r) => isMakeUpClass(r.statusClass)).length;

  const isMakeUpTab = activeTab === '__makeup__';
  const isTrialTab = activeTab === '__trial__';

  const cardTitle = isMakeUpTab
    ? 'Informasi Kelas Pengganti'
    : isTrialTab
    ? 'Informasi Kelas Trial'
    : activeTab === '__all__'
    ? 'Riwayat Kehadiran'
    : `Riwayat Kehadiran · ${activeTab}`;

  const waTarget = getSafeWhatsAppLink(student.waLink);
  const waLabel =
    waTarget !== SUPPORT_WA ? 'Hubungi Student Advisor' : `Hubungi ${SUPPORT_LABEL}`;

  return (
    <div>
      <div className="topbar topbar-detail">
        <button
          type="button"
          className="topbar-back"
          onClick={onBackToDashboard}
          aria-label="Kembali ke daftar anak"
          style={{ border: 'none', cursor: 'pointer' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="20"
            height="20"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="topbar-logo">
          <div className="topbar-logo-inner">
            <BrandLogo size="small" />
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="detail-hero">
          <div className="card-top">
            <div className="avatar">{getInitials(student.studentName)}</div>
            <div className="card-info">
              <div className="student-name">{student.studentName}</div>
              <div className="student-id">{student.studentId}</div>
              <div>
                <span className="center-badge">{student.center}</span>
              </div>
            </div>
          </div>
          <ExpiryBanner expiryDateStr={student.expiryDate} />
        </div>

        {/* Term Selector */}
        <div className="term-label">
          <div className="term-dropdown-container">
            <select
              id="term-select"
              className="term-dropdown"
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setActiveTab('__all__');
              }}
            >
              {sortedQuarters.length > 0 ? (
                sortedQuarters.map((q) => (
                  <option key={q} value={q}>
                    {quarterMap[q]}
                  </option>
                ))
              ) : (
                <option value="">Semua Term</option>
              )}
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>

        {/* Class Tabs */}
        <div className="class-tabs-wrap">
          <button
            type="button"
            className={`class-tab ${activeTab === '__all__' ? 'active' : ''}`}
            onClick={() => setActiveTab('__all__')}
          >
            Semua
          </button>

          {classKeys.map((k) => (
            <button
              key={k}
              type="button"
              className={`class-tab ${activeTab === k ? 'active' : ''}`}
              onClick={() => setActiveTab(k)}
            >
              {k}
            </button>
          ))}

          {trialAll.length > 0 && (
            <button
              type="button"
              className={`class-tab class-tab--trial ${activeTab === '__trial__' ? 'active' : ''}`}
              onClick={() => setActiveTab('__trial__')}
            >
              Trial
            </button>
          )}

          {makeupAll.length > 0 && (
            <button
              type="button"
              className={`class-tab class-tab--makeup ${
                activeTab === '__makeup__' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('__makeup__')}
            >
              Make Up
            </button>
          )}
        </div>

        {/* Metrics Row */}
        <div className="metrics-row">
          <div className="metric-chips">
            <div className="metric-chip">
              <div className="mc-icon mc-green">✓</div>
              <div className="mc-num green">{countPresent}</div>
              <div className="mc-lbl">Present</div>
            </div>
            <div className="metric-chip">
              <div className="mc-icon mc-red">✕</div>
              <div className="mc-num red">{countAbsent}</div>
              <div className="mc-lbl">Absent</div>
            </div>
            <div className="metric-chip">
              <div className="mc-icon mc-yellow">!</div>
              <div className="mc-num yellow">{countIzin}</div>
              <div className="mc-lbl">Leave</div>
            </div>
            <div className="metric-chip">
              <div className="mc-icon mc-blue">↗</div>
              <div className="mc-num blue">{countTrial}</div>
              <div className="mc-lbl">Trial</div>
            </div>
            <div className="metric-chip">
              <div className="mc-icon mc-purple">↺</div>
              <div className="mc-num purple">{countMakeUp}</div>
              <div className="mc-lbl">Make Up</div>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="att-card">
          <div className="att-header">
            <div className="att-title">{cardTitle}</div>
          </div>

          {!isMakeUpTab && !isTrialTab && (
            <div className="att-legend">
              <span className="leg-item">
                <span className="att-dot-inline dot-present"></span>Present
              </span>
              <span className="leg-item">
                <span className="att-dot-inline dot-absent"></span>Absent
              </span>
              <span className="leg-item">
                <span className="att-dot-inline dot-leave"></span>Leave
              </span>
            </div>
          )}

          <div className="att-table-wrap">
            {isMakeUpTab || isTrialTab ? (
              rows.length === 0 ? (
                <div className="att-empty" style={{ padding: '24px', textAlign: 'center' }}>
                  Belum ada data {isMakeUpTab ? 'Make Up' : 'Trial'} untuk pilihan ini.
                </div>
              ) : (
                <div className="makeup-cards-list">
                  {rows.map((r, idx) => {
                    const currentClass = simplifyClassName(r.class_, 2) || '-';
                    const tanggalIzin = r.previousDateStr || '-';
                    const kelasAsal = simplifyClassName(r.previousClass) || '-';
                    const tanggalMakeup = r.dateStr || '-';
                    const kelasMakeup = simplifyClassName(r.class_) || '-';
                    const alasan = r.makeupReason || '-';

                    return (
                      <div
                        key={idx}
                        className="makeup-card"
                        style={{
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '14px 16px',
                          marginBottom: '10px',
                        }}
                      >
                        <div
                          className="makeup-card-title"
                          style={{
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            color: '#1a202c',
                            marginBottom: '8px',
                          }}
                        >
                          {currentClass}
                        </div>
                        <div
                          style={{ height: '1px', background: '#edf2f7', marginBottom: '10px' }}
                        ></div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            fontSize: '0.82rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#718096', fontWeight: 500 }}>Kelas Asal</span>
                            <span style={{ color: '#2d3748', fontWeight: 600 }}>{kelasAsal}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#718096', fontWeight: 500 }}>Tanggal Asal</span>
                            <span style={{ color: '#2d3748', fontWeight: 600 }}>{tanggalIzin}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#718096', fontWeight: 500 }}>Kelas Ganti</span>
                            <span style={{ color: '#2b6cb0', fontWeight: 700 }}>{kelasMakeup}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#718096', fontWeight: 500 }}>Tanggal Ganti</span>
                            <span style={{ color: '#2b6cb0', fontWeight: 700 }}>
                              {tanggalMakeup}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#718096', fontWeight: 500 }}>Keterangan</span>
                            <span style={{ color: '#2d3748', fontWeight: 600 }}>{alasan}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : rows.length === 0 ? (
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kelas</th>
                    <th>Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} className="att-empty">
                      Belum ada data attendance untuk pilihan ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kelas</th>
                    <th>Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const cls = simplifyClassName(r.class_);
                    const attendanceLabel = isLeaveAttendance(r.attendance)
                      ? 'Leave'
                      : cleanCell(r.attendance);
                    const { badge, dot } = getStatusBadge(attendanceLabel);
                    const isSpecial =
                      isMakeUpClass(r.statusClass) || isTrialChangeClass(r.statusClass);
                    const previousDetails = simplifyClassName(r.previousClass);
                    const hasPrev = r.previousDateStr || previousDetails;

                    return (
                      <tr key={idx}>
                        <td>
                          <span className={`att-dot-inline ${dot}`}></span>
                          {r.dateStr || '-'}
                        </td>
                        <td>
                          {cls}
                          {isSpecial && r.statusClass && (
                            <span className="reason-tag">{r.statusClass}</span>
                          )}
                          {isSpecial && hasPrev && (
                            <span className="prev-class-tag">
                              ↩ {[r.previousDateStr, previousDetails].filter(Boolean).join(' · ')}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`att-badge ${badge}`}>{attendanceLabel}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* WhatsApp Advisor / Support button */}
        <a
          className="wa-help-btn wa-help-btn--full"
          href={waTarget}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>{' '}
          {waLabel}
        </a>

        <button
          type="button"
          className="back-link"
          onClick={onBackToDashboard}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
        >
          ← Kembali ke daftar anak
        </button>
      </div>
    </div>
  );
};
