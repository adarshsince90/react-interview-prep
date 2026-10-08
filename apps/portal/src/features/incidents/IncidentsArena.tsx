import React, { useState, useEffect } from 'react';
import {
  Flame,
  Activity,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileCode,
  FileText,
  Copy,
  Check,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import { INCIDENT_CASES } from './incidentsData';
import type { IncidentCase, DiagnosticAction } from './types';

export const IncidentsArena: React.FC = () => {
  // Read initial scenario from URL or default to INC-01
  const [selectedCaseId, setSelectedCaseId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const caseParam = params.get('case');
    return INCIDENT_CASES.some(c => c.id === caseParam) ? (caseParam as string) : INCIDENT_CASES[0].id;
  });

  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'P0' | 'P1'>('ALL');
  const [activeTab, setActiveTab] = useState<'timeline' | 'telemetry' | 'diagnostics' | 'hotfix' | 'rca'>('timeline');

  // Interactive diagnostic states
  const [discoveredClues, setDiscoveredClues] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('incident_discovered_clues');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeDiagnosticId, setActiveDiagnosticId] = useState<string | null>(null);
  const [isExecutingDiag, setIsExecutingDiag] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);

  const activeCase: IncidentCase =
    INCIDENT_CASES.find(c => c.id === selectedCaseId) || INCIDENT_CASES[0];

  // Sync URL when selected case changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'incidents');
    url.searchParams.set('case', activeCase.id);
    window.history.replaceState({}, '', url.toString());
  }, [activeCase.id]);

  // Persist discovered clues
  useEffect(() => {
    try {
      localStorage.setItem('incident_discovered_clues', JSON.stringify(discoveredClues));
    } catch {
      // Ignore localStorage write failure
    }
  }, [discoveredClues]);

  // Copy code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  // Run diagnostic action
  const handleRunDiagnostic = (action: DiagnosticAction) => {
    setActiveDiagnosticId(action.id);
    setIsExecutingDiag(true);

    setTimeout(() => {
      setIsExecutingDiag(false);
      setDiscoveredClues(prev => {
        const currentList = prev[activeCase.id] || [];
        if (!currentList.includes(action.id)) {
          return {
            ...prev,
            [activeCase.id]: [...currentList, action.id]
          };
        }
        return prev;
      });
    }, 600);
  };

  const caseClues = discoveredClues[activeCase.id] || [];
  const allCluesFound = caseClues.length >= activeCase.diagnosticActions.length;

  const filteredCases = INCIDENT_CASES.filter(c => {
    if (severityFilter === 'ALL') return true;
    return c.severity === severityFilter;
  });

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', minHeight: 'calc(100vh - 70px)' }}>
      {/* Top Banner Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.08) 50%, rgba(99, 102, 241, 0.08) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)'
              }}
            >
              <Flame size={13} /> Production War Room & Post-Mortem Drills
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <Clock size={13} /> SRE / Staff Incident Simulation Engine
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Enterprise Incident War Room
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem', maxWidth: '780px', lineHeight: 1.5 }}>
            Step into the shoes of a Staff Frontend Architect on call during catastrophic P0/P1 production outages.
            Diagnose live telemetry spikes, interrogate DevTools heap/flame charts, review hotfixes, and lead blameless 5-Whys RCAs.
          </p>
        </div>

        {/* Status Highlights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Simulated Scenarios
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--react-cyan)' }}>
              {INCIDENT_CASES.length} Cases
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Forensic Clues Found
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
              {Object.values(discoveredClues).reduce((acc, curr) => acc + curr.length, 0)} / 12
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Case Arena */}
      <div className="incidents-arena-grid">
        {/* Left Sidebar: Scenario Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.4rem'
            }}
          >
            {(['ALL', 'P0', 'P1'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: severityFilter === sev ? 'var(--react-cyan)' : 'transparent',
                  color: severityFilter === sev ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 150ms ease'
                }}
              >
                {sev === 'ALL' ? 'All Incidents' : `${sev} Outages`}
              </button>
            ))}
          </div>

          {/* Incident Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredCases.map(c => {
              const isSelected = c.id === activeCase.id;
              const clues = discoveredClues[c.id] || [];
              const isP0 = c.severity === 'P0';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                    border: isSelected
                      ? isP0
                        ? '2px solid #ef4444'
                        : '2px solid var(--react-cyan)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: isSelected ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: isP0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: isP0 ? '#f87171' : '#fbbf24',
                          border: isP0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        {c.severity}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {c.id}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: clues.length === c.diagnosticActions.length ? '#10b981' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {clues.length === c.diagnosticActions.length ? (
                        <>
                          <CheckCircle2 size={12} color="#10b981" /> Solved
                        </>
                      ) : (
                        `${clues.length}/${c.diagnosticActions.length} Clues`
                      )}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      margin: '0 0 0.35rem 0',
                      lineHeight: 1.3
                    }}
                  >
                    {c.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {c.tagline}
                  </p>

                  <div
                    style={{
                      marginTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    <span>{c.affectedSystem.split('(')[0].trim()}</span>
                    <span style={{ color: isP0 ? '#f87171' : '#fbbf24', fontWeight: 600 }}>
                      Peak: {c.telemetry.peakBreach} {c.telemetry.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Incident War Room Execution Arena */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            minHeight: '700px'
          }}
        >
          {/* Active Case Top Header */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '5px',
                      background: activeCase.severity === 'P0' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: activeCase.severity === 'P0' ? '#f87171' : '#fbbf24',
                      border: activeCase.severity === 'P0' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)'
                    }}
                  >
                    {activeCase.severity} OUTAGE
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--react-cyan)' }}>
                    {activeCase.id}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {activeCase.affectedSystem}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeCase.title}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: 0 }}>
                  {activeCase.summary}
                </p>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                <CheckCircle2 size={16} /> BLAMELESS POST-MORTEM SIGNED OFF
              </div>
            </div>

            {/* Impact Metric Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
              <div
                style={{
                  background: 'var(--bg-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Users size={14} color="var(--react-cyan)" /> Affected: <strong>{activeCase.activeUsersAffected}</strong>
              </div>
              <div
                style={{
                  background: 'var(--bg-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <TrendingUp size={14} color="#f87171" /> Peak Metric: <strong>{activeCase.telemetry.peakBreach} {activeCase.telemetry.unit}</strong>
              </div>
              <div
                style={{
                  background: 'var(--bg-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Clock size={14} color="#fbbf24" /> Time to Mitigate: <strong>{activeCase.rca.timeToMitigate}</strong>
              </div>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              overflowX: 'auto'
            }}
          >
            {[
              { id: 'timeline', label: '1. War Room Timeline', icon: Clock },
              { id: 'telemetry', label: '2. Live Telemetry Monitor', icon: Activity },
              { id: 'diagnostics', label: '3. Forensic Diagnostics', icon: Search, badge: `${caseClues.length}/${activeCase.diagnosticActions.length}` },
              { id: 'hotfix', label: '4. Architectural Hotfix', icon: FileCode },
              { id: 'rca', label: '5. Executive 5-Whys RCA', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isActive ? 'var(--react-cyan)' : 'var(--bg-primary)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all 150ms ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                        color: isActive ? '#ffffff' : 'var(--text-muted)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab 1: War Room Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Live Incident Communications & Triage Log
                </h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Chronological PagerDuty & Slack #war-room archive
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {activeCase.timelineEvents.map(event => {
                  const isCritical = event.severity === 'critical';
                  const isSuccess = event.severity === 'success';
                  const isWarning = event.severity === 'warning';

                  return (
                    <div
                      key={event.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '0.9rem 1.1rem',
                        position: 'relative'
                      }}
                    >
                      {/* Left Phase Pill */}
                      <div style={{ minWidth: '90px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: isCritical
                              ? 'rgba(239, 68, 68, 0.2)'
                              : isSuccess
                              ? 'rgba(16, 185, 129, 0.2)'
                              : isWarning
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(99, 102, 241, 0.2)',
                            color: isCritical
                              ? '#f87171'
                              : isSuccess
                              ? '#10b981'
                              : isWarning
                              ? '#fbbf24'
                              : '#818cf8',
                            display: 'inline-block',
                            marginBottom: '0.25rem'
                          }}
                        >
                          {event.phase}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {event.timestamp}
                        </div>
                      </div>

                      {/* Right Message Body */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--react-cyan)', marginBottom: '0.2rem' }}>
                          {event.role}
                        </div>
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                          {event.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Live Telemetry Monitor */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                  {activeCase.telemetry.metricName}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {activeCase.telemetry.description}
                </p>
              </div>

              {/* Visual Telemetry Chart */}
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Metric Summary Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Healthy SLA</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
                        &le; {activeCase.telemetry.healthyThreshold} {activeCase.telemetry.unit}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Peak Breach</span>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>
                        {activeCase.telemetry.peakBreach} {activeCase.telemetry.unit}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Red dashed line = SLA Breach Threshold
                  </span>
                </div>

                {/* Bar Graph Simulation */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '1rem',
                    height: '240px',
                    padding: '1rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}
                >
                  {/* Threshold Line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: `${Math.min(90, (activeCase.telemetry.healthyThreshold / activeCase.telemetry.peakBreach) * 200)}px`,
                      borderTop: '2px dashed #f59e0b',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  />

                  {activeCase.telemetry.dataPoints.map((dp, i) => {
                    const heightPercent = Math.min(100, Math.max(8, (dp.value / activeCase.telemetry.peakBreach) * 100));
                    const isBreach = dp.value > activeCase.telemetry.healthyThreshold;

                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          position: 'relative'
                        }}
                      >
                        {/* Value tooltip on hover */}
                        <div
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: isBreach ? '#f87171' : 'var(--text-secondary)',
                            marginBottom: '0.35rem'
                          }}
                        >
                          {dp.value}
                        </div>

                        {/* Bar */}
                        <div
                          style={{
                            width: '80%',
                            height: `${heightPercent}%`,
                            background: isBreach
                              ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)'
                              : 'linear-gradient(180deg, var(--react-cyan) 0%, #0369a1 100%)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 300ms ease'
                          }}
                        />

                        {/* Timestamp */}
                        <span
                          style={{
                            marginTop: '0.45rem',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'monospace'
                          }}
                        >
                          {dp.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Forensic Diagnostics Sandbox */}
          {activeTab === 'diagnostics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Forensic DevTools & Telemetry Diagnostics Sandbox
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                    Execute Chrome DevTools and telemetry inspection actions to uncover the root cause.
                  </p>
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    background: allCluesFound ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.12)',
                    color: allCluesFound ? '#10b981' : 'var(--react-cyan)'
                  }}
                >
                  {allCluesFound ? 'All Forensic Evidence Captured' : `${caseClues.length} of ${activeCase.diagnosticActions.length} Clues Discovered`}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {activeCase.diagnosticActions.map(action => {
                  const isFound = caseClues.includes(action.id);
                  const isCurrent = activeDiagnosticId === action.id;

                  return (
                    <button
                      key={action.id}
                      onClick={() => handleRunDiagnostic(action)}
                      style={{
                        textAlign: 'left',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: isCurrent
                          ? '2px solid var(--react-cyan)'
                          : isFound
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid var(--border-subtle)',
                        background: isFound ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--react-cyan)' }}>
                          {action.category}
                        </span>
                        {isFound && <CheckCircle2 size={15} color="#10b981" />}
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {action.label}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {action.commandOrTool}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inspection Execution Console */}
              {activeDiagnosticId && (
                <div
                  style={{
                    background: 'var(--code-bg, #090d16)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    position: 'relative'
                  }}
                >
                  {isExecutingDiag ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--react-cyan)', fontSize: '0.85rem' }}>
                      <Activity className="animate-spin" size={16} /> Running DevTools diagnostic probe...
                    </div>
                  ) : (
                    (() => {
                      const action = activeCase.diagnosticActions.find(a => a.id === activeDiagnosticId);
                      if (!action) return null;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--react-cyan)', fontWeight: 700 }}>
                              $ {action.commandOrTool}
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                fontWeight: 700
                              }}
                            >
                              {action.evidenceBadge}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--code-text, #f8fafc)' }}>
                            <strong>Diagnostic Hypothesis:</strong> {action.hypothesis}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--emerald-success)' }}>
                            <strong>Finding:</strong> {action.outputSummary}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                            {action.detailedFindings.map((finding, idx) => (
                              <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--code-text, #cbd5e1)', display: 'flex', gap: '0.45rem' }}>
                                <span style={{ color: 'var(--react-cyan)' }}>&gt;</span> {finding}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Architectural Hotfix & Diff */}
          {activeTab === 'hotfix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Architectural Hotfix: {activeCase.hotfix.filename}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    {activeCase.hotfix.explanation}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(activeCase.hotfix.afterCode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    background: codeCopied ? '#10b981' : 'var(--bg-primary)',
                    color: codeCopied ? '#ffffff' : 'var(--text-primary)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {codeCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{codeCopied ? 'Copied Hotfix' : 'Copy Clean Fix'}</span>
                </button>
              </div>

              {/* Side-by-side or stacked diff */}
              <div className="responsive-diff-grid">
                {/* Buggy / Vulnerable Code */}
                <div
                  style={{
                    background: 'var(--code-bg, #090d16)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#f87171',
                      borderBottom: '1px solid rgba(239, 68, 68, 0.25)'
                    }}
                  >
                    ❌ Vulnerable Production Code
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--code-text, #f8fafc)',
                      overflowX: 'auto',
                      lineHeight: 1.5
                    }}
                  >
                    <code>{activeCase.hotfix.beforeCode}</code>
                  </pre>
                </div>

                {/* Hotfix Solution */}
                <div
                  style={{
                    background: 'var(--code-bg, #090d16)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#10b981',
                      borderBottom: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    ✅ Enterprise Architectural Hotfix
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--code-text, #f8fafc)',
                      overflowX: 'auto',
                      lineHeight: 1.5
                    }}
                  >
                    <code>{activeCase.hotfix.afterCode}</code>
                  </pre>
                </div>
              </div>

              {/* Guardrail Box */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}
              >
                <ShieldAlert size={20} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Permanent Architectural Guardrail & CI Regression Prevention
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                    {activeCase.hotfix.architecturalGuardrail}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Executive Post-Mortem & Five Whys RCA */}
          {activeTab === 'rca' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                  {activeCase.rca.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Official SRE Blameless Post-Mortem and Root Cause Analysis document.
                </p>
              </div>

              {/* SLA & Timing Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incident Commander</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {activeCase.rca.incidentCommander}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blast Radius</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f87171', marginTop: '0.2rem' }}>
                    {activeCase.rca.blastRadius}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time to Detect (TTD)</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--react-cyan)', marginTop: '0.2rem' }}>
                    {activeCase.rca.timeToDetect}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Time to Resolve (TTR)</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
                    {activeCase.rca.timeToResolve}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  Executive Summary
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {activeCase.rca.executiveSummary}
                </p>
              </div>

              {/* The Five Whys Stepper */}
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Zap size={16} color="var(--react-cyan)" /> The 5 Whys Root Cause Analysis
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeCase.rca.fiveWhys.map(step => (
                    <div
                      key={step.step}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '0.85rem 1.1rem',
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(2, 132, 199, 0.15)',
                          color: 'var(--react-cyan)',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {step.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.question}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.45 }}>
                          {step.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preventions Roadmap */}
              <div>
                <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem 0' }}>
                  Permanent Prevention & Architectural Remediation Roadmap
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Immediate Actions
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {activeCase.rca.preventions.immediate.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Short-Term Guardrails
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {activeCase.rca.preventions.shortTerm.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Long-Term Architectural
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {activeCase.rca.preventions.longTermArchitectural.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.35rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
