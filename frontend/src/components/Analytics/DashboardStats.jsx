import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import api, { getDashboardStats, resetDataset, getVulnerabilityAnalytics, getKpiMetrics, getTimelineAnalysis, getVaptResults } from '../../services/api';
import StatCard from './StatCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Label, Cell } from 'recharts';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [vaptItems, setVaptItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState([]);
  // Global multi-select filters
  const [selectedEnvs, setSelectedEnvs] = useState([]);
  const [selectedCrits, setSelectedCrits] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [savedViews, setSavedViews] = useState({});
  // Cohort and compare state
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [dashRes, analyticsRes, kpiRes, timelineRes] = await Promise.all([
        getDashboardStats(),
        getVulnerabilityAnalytics({}),
        getKpiMetrics({}),
        getTimelineAnalysis({}),
      ]);
      setStats(dashRes.data);
      setAnalytics(analyticsRes.data);
      setKpi(kpiRes.data);
      setTimeline(timelineRes.data);
      // Fetch raw VAPT items (handle paginated and non-paginated)
      const accumulate = async () => {
        const items = [];
        const response = await getVaptResults({});
        const data = response?.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data?.results) {
          items.push(...data.results);
          let nextUrl = data.next;
          while (nextUrl) {
            const nextRes = await api.get(nextUrl);
            const nextData = nextRes?.data;
            if (nextData?.results?.length) {
              items.push(...nextData.results);
              nextUrl = nextData.next;
            } else {
              nextUrl = null;
            }
          }
          return items;
        }
        return [];
      };
      const allItems = await accumulate();
      setVaptItems(allItems);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load saved views list
    try {
      const raw = localStorage.getItem('dashboardSavedViews');
      if (raw) setSavedViews(JSON.parse(raw) || {});
    } catch (_) {}
    // Read filters from URL
    try {
      const qs = new URLSearchParams(window.location.search);
      const env = (qs.get('env') || '').split(',').filter(Boolean);
      const crit = (qs.get('crit') || '').split(',').filter(Boolean);
      const res = (qs.get('res') || '').split(',').filter(Boolean);
      if (env.length) setSelectedEnvs(env);
      if (crit.length) setSelectedCrits(crit);
      if (res.length) setSelectedResults(res);
    } catch (_) {}
    fetchStats();
  }, []);

  // Sync filters to URL (must be before any return)
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (selectedEnvs.length) qs.set('env', selectedEnvs.join(',')); else qs.delete('env');
    if (selectedCrits.length) qs.set('crit', selectedCrits.join(',')); else qs.delete('crit');
    if (selectedResults.length) qs.set('res', selectedResults.join(',')); else qs.delete('res');
    const newUrl = `${window.location.pathname}?${qs.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [selectedEnvs, selectedCrits, selectedResults]);


  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      return;
    }

    try {
      setResetting(true);
      await resetDataset();
      
      // Refresh the stats after reset
      await fetchStats();
      
      // Show success message
      alert('Dataset reset successfully!');
    } catch (err) {
      console.error('Error resetting dataset:', err);
      alert('Failed to reset dataset. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const toggleInArray = (arrSetter, arr, value) => {
    const set = new Set(arr);
    if (set.has(value)) set.delete(value); else set.add(value);
    arrSetter(Array.from(set));
  };

  // Reusable checkbox dropdown for filters
  const FilterDropdown = ({ label, options, selected, setSelected }) => {
    const [open, setOpen] = useState(false);
    const toggle = (value) => {
      const next = new Set(selected);
      if (next.has(value)) next.delete(value); else next.add(value);
      setSelected(Array.from(next));
    };
    const clearAll = () => setSelected([]);
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <span className="text-sm font-medium">{label}</span>
          {selected.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {selected.length}
            </span>
          )}
          <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
        </button>
        {open && (
          <div className="absolute z-10 mt-2 w-64 origin-top-left rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg">
            <div className="max-h-64 overflow-auto p-2 space-y-1">
              {options.length === 0 ? (
                <div className="px-2 py-1 text-sm text-neutral-500">No options</div>
              ) : (
                options.map(opt => (
                  <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300 dark:border-neutral-700"
                      checked={selected.includes(opt)}
                      onChange={() => toggle(opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex items-center justify-between px-2 py-2 border-t border-neutral-200 dark:border-neutral-800">
              <button className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={clearAll}>Clear</button>
              <button className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Derived KPI metrics
  const totalVulns = stats?.total_vulnerabilities || 0;
  // Apply normalization & deduplication, then global filters
  const normalize = (v) => String(v ?? '').trim();
  const normalizeEnv = (v) => {
    const key = normalize(v).toUpperCase();
    const map = { 'PROD': 'PRODUCTION', 'PRODUCTION': 'PRODUCTION', 'STAGE': 'STAGING', 'STAGING': 'STAGING', 'DEV': 'DEVELOPMENT', 'DEVELOPMENT': 'DEVELOPMENT', 'UAT': 'UAT' };
    return map[key] || normalize(v);
  };
  const normalizeResult = (v) => {
    const s = normalize(v);
    const lower = s.toLowerCase();
    const map = {
      'pass': 'PASS', 'fail': 'FAIL', 'partial': 'PARTIAL', 'not_applicable': 'NOT_APPLICABLE', 'not applicable': 'NOT_APPLICABLE',
      'remediated': 'Remediated', 'risk accepted': 'Risk Accepted', 'plan for remediation': 'Plan for Remediation', 'no evidence of remediation': 'No evidence of remediation', 'unresolved': 'Unresolved', 'risk avoided': 'Risk Avoided'
    };
    return map[lower] || s;
  };
  const normalizeCrit = (v) => {
    const key = normalize(v).toUpperCase();
    const allowed = ['CRITICAL','HIGH','MEDIUM','LOW'];
    return allowed.includes(key) ? key : normalize(v);
  };
  const dedupedItems = (() => {
    const byId = new Map();
    for (const it of vaptItems) {
      const id = it?.vulnerability_id || it?.id;
      if (!id) continue;
      const prev = byId.get(id);
      if (!prev) byId.set(id, it);
      else {
        const pu = new Date(prev.updated_at || prev.created_at || 0).getTime();
        const cu = new Date(it.updated_at || it.created_at || 0).getTime();
        if (cu >= pu) byId.set(id, it);
      }
    }
    return Array.from(byId.values()).map(it => ({
      ...it,
      tested_environment: normalizeEnv(it?.tested_environment),
      result: normalizeResult(it?.result),
      cvss_criticality: normalizeCrit(it?.cvss_criticality),
    }));
  })();
  const filteredItems = dedupedItems.filter(it => {
    const envOk = selectedEnvs.length === 0 || selectedEnvs.includes(normalize(it?.tested_environment));
    const critOk = selectedCrits.length === 0 || selectedCrits.includes(normalize(it?.cvss_criticality));
    const resOk = selectedResults.length === 0 || selectedResults.includes(normalize(it?.result));
    return envOk && critOk && resOk;
  });
  const aggregate = (items, key) => items.reduce((acc, it) => {
    const k = normalize(it?.[key]);
    if (!k) return acc;
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const byResult = aggregate(filteredItems, 'result');
  const byEnvironment = aggregate(filteredItems, 'tested_environment');
  const byCriticality = aggregate(filteredItems, 'cvss_criticality');
  const remediated = byResult['Remediated'] || 0;
  const unresolved = byResult['Unresolved'] || 0;
  const noEvidence = byResult['No evidence of remediation'] || 0;
  const planForRemediation = byResult['Plan for Remediation'] || 0;
  const riskAccepted = byResult['Risk Accepted'] || 0;
  const riskAvoided = byResult['Risk Avoided'] || 0;

  const actionableTotal = remediated + unresolved + noEvidence + planForRemediation + riskAccepted + riskAvoided;
  const remediationRate = actionableTotal > 0 ? Math.round((remediated / actionableTotal) * 100) : 0;
  const openItems = unresolved + noEvidence + planForRemediation;
  const openRate = actionableTotal > 0 ? Math.round((openItems / actionableTotal) * 100) : 0;
  const environmentsCount = Object.keys(byEnvironment || {}).length;
  const avgTestingTimeline = kpi?.avg_testing_timeline ?? null;
  const avgRemediationTimeline = kpi?.avg_remediation_timeline ?? null;

  // Chart data preps
  const envBarData = Object.entries(byEnvironment).map(([name, count]) => ({ name, count }));
  const CRIT_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const critBarData = CRIT_ORDER.map((name) => ({ name, count: byCriticality[name] || 0 }));

  // Timeline: use backend timeline-analysis when available; else fallback to updated_at month grouping
  const monthKey = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    } catch (_) { return ''; }
  };
  const extractTimelinePairs = () => {
    if (timeline && typeof timeline === 'object') {
      if (Array.isArray(timeline.trend)) return timeline.trend;
      if (timeline.trend && typeof timeline.trend === 'object') return Object.entries(timeline.trend).map(([name, count]) => ({ name, count }));
      if (Array.isArray(timeline.buckets)) return timeline.buckets;
      if (timeline.data && typeof timeline.data === 'object') return Object.entries(timeline.data).map(([name, count]) => ({ name, count }));
    }
    return null;
  };
  const backendTrend = extractTimelinePairs();
  let trendData = backendTrend || [];
  if (!backendTrend || backendTrend.length === 0) {
    const trendMap = filteredItems.reduce((acc, it) => {
      const k = monthKey(it?.updated_at);
      if (!k) return acc;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    trendData = Object.entries(trendMap).map(([name, count]) => ({ name, count }));
  }
  trendData.sort((a, b) => new Date(a.name) - new Date(b.name));

  // Options for dropdowns
  const envOptions = Array.from(new Set(vaptItems.map(v => normalize(v.tested_environment)).filter(Boolean)));
  const resultOptions = Array.from(new Set(vaptItems.map(v => normalize(v.result)).filter(Boolean)));
  const stakeholderOptions = Array.from(new Set(dedupedItems.map(v => normalize(v.stakeholders)).filter(Boolean)));

  // Aging buckets (days since created_at)
  const daysSince = (iso) => {
    if (!iso) return Infinity;
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  };
  const agingBucketsCounts = { '0-7': 0, '8-30': 0, '31-60': 0, '61+': 0 };
  filteredItems.forEach((it) => {
    const d = daysSince(it?.created_at);
    if (d <= 7) agingBucketsCounts['0-7'] += 1;
    else if (d <= 30) agingBucketsCounts['8-30'] += 1;
    else if (d <= 60) agingBucketsCounts['31-60'] += 1;
    else agingBucketsCounts['61+'] += 1;
  });
  const agingBarData = Object.entries(agingBucketsCounts).map(([name, count]) => ({ name, count }));
  const overSixtyOneCount = agingBucketsCounts['61+'] || 0;

  // Modal helpers
  const normalizeU = (v) => String(v ?? '').trim().toUpperCase();
  const openModalWithFilter = ({ title, filterFn }) => {
    const items = vaptItems.filter(filterFn);
    setModalTitle(`${title} • ${items.length} item(s)`);
    setModalItems(items);
    setIsModalOpen(true);
  };
  const handleEnvBarClick = (data) => {
    const env = data?.activeLabel || data?.payload?.name || data?.name;
    if (!env) return;
    toggleInArray(setSelectedEnvs, selectedEnvs, env);
  };
  const handleCritBarClick = (data) => {
    const crit = data?.activeLabel || data?.payload?.name || data?.name;
    if (!crit) return;
    toggleInArray(setSelectedCrits, selectedCrits, crit);
  };

  // Trend point click handler (filter by period label if available)
  const handleTrendClick = (data) => {
    const period = data?.activeLabel || data?.payload?.name || data?.name;
    if (!period) return;
    // If timeline endpoint provides mapping (timeline.map), try to use it for date range; otherwise match by created_at month label if available
    const lowerPeriod = String(period).toLowerCase();
    openModalWithFilter({
      title: `Period: ${period}`,
      filterFn: (it) => {
        const created = it?.created_at || '';
        // naive contains match on "YYYY-MM" or month name appearing in label
        return String(created).toLowerCase().includes(lowerPeriod);
      },
    });
  };

  // KPI click handlers
  const openRemediated = () => openModalWithFilter({ title: 'Remediated', filterFn: (it) => it?.result === 'Remediated' });
  const openOpenItems = () => openModalWithFilter({ title: 'Open Items', filterFn: (it) => ['Unresolved','No evidence of remediation','Plan for Remediation'].includes(it?.result) });
  const openRiskAccepted = () => openModalWithFilter({ title: 'Risk Accepted', filterFn: (it) => it?.result === 'Risk Accepted' });

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor your VAPT activities and vulnerabilities</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
          {resetting ? 'Resetting...' : 'Reset Dataset'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Uploads"
          value={stats?.total_uploads || 0}
          icon={CloudArrowUpIcon}
          color="blue"
        />
        <StatCard
          title="Proposals"
          value={stats?.total_proposals || 0}
          icon={DocumentTextIcon}
          color="green"
        />
        <StatCard
          title="Scopes"
          value={stats?.total_scopes || 0}
          icon={ShieldCheckIcon}
          color="blue"
        />
        <StatCard
          title="Vulnerabilities"
          value={filteredItems.length}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
        <StatCard
          title="Critical Issues"
          value={stats?.critical_vulnerabilities || 0}
          icon={ExclamationCircleIcon}
          color="red"
        />
        <StatCard
          title="High Issues"
          value={stats?.high_vulnerabilities || 0}
          icon={ExclamationTriangleIcon}
          color="yellow"
        />
      </div>

      {/* Additional KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
        <StatCard
          title="Remediation Rate"
          value={`${remediationRate}%`}
          icon={ChartPieIcon}
          color="green"
          onClick={openRemediated}
        />
        <StatCard
          title="Open Items"
          value={openItems}
          icon={ExclamationTriangleIcon}
          color="yellow"
          onClick={openOpenItems}
        />
        <StatCard
          title="Open Rate"
          value={`${openRate}%`}
          icon={ChartPieIcon}
          color="red"
        />
        <StatCard
          title="Risk Accepted"
          value={riskAccepted}
          icon={ShieldCheckIcon}
          color="blue"
          onClick={openRiskAccepted}
        />
        <StatCard
          title="Environments"
          value={environmentsCount}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Avg Remediation Timeline"
          value={avgRemediationTimeline != null ? `${Math.round(avgRemediationTimeline)} days` : '—'}
          icon={ArrowPathIcon}
          color="green"
        />
        <StatCard
          title="61+ Days Old"
          value={overSixtyOneCount}
          icon={ExclamationTriangleIcon}
          color="red"
          onClick={() => openModalWithFilter({ title: 'Aging: 61+ days', filterFn: (it) => daysSince(it?.created_at) > 60 })}
        />
      </div>

      {/* Charts Row: Trend and Criticality */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Filters */}
        <div className="xl:col-span-2 p-4 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 mb-2">
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown label="Environment" options={envOptions} selected={selectedEnvs} setSelected={setSelectedEnvs} />
            <FilterDropdown label="CVSS Criticality" options={CRIT_ORDER} selected={selectedCrits} setSelected={setSelectedCrits} />
            <FilterDropdown label="Result" options={resultOptions} selected={selectedResults} setSelected={setSelectedResults} />
            <div className="flex items-center gap-2">
              <span className="text-sm">Cohort:</span>
              <select className="input-base" value={selectedStakeholder} onChange={(e)=>setSelectedStakeholder(e.target.value)}>
                <option value="">Stakeholder (all)</option>
                {stakeholderOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setSelectedEnvs([]); setSelectedCrits([]); setSelectedResults([]); }}>Clear All</button>
              <button className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => {
                const name = prompt('Save current view as:');
                if (!name) return;
                const next = { ...savedViews, [name]: { env: selectedEnvs, crit: selectedCrits, res: selectedResults } };
                setSavedViews(next);
                try { localStorage.setItem('dashboardSavedViews', JSON.stringify(next)); } catch(_) {}
              }}>Save View</button>
              <select className="input-base" onChange={(e) => {
                const key = e.target.value;
                if (!key) return;
                const v = savedViews[key];
                if (!v) return;
                setSelectedEnvs(v.env || []);
                setSelectedCrits(v.crit || []);
                setSelectedResults(v.res || []);
              }}>
                <option value="">Load view…</option>
                {Object.keys(savedViews).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <button className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => {
                const key = prompt('Delete view name:');
                if (!key || !savedViews[key]) return;
                const next = { ...savedViews };
                delete next[key];
                setSavedViews(next);
                try { localStorage.setItem('dashboardSavedViews', JSON.stringify(next)); } catch(_) {}
              }}>Delete View</button>
            </div>
          </div>
          {(selectedEnvs.length > 0 || selectedCrits.length > 0 || selectedResults.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedEnvs.map(v => (
                <span key={`env-${v}`} className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">Env: {v}</span>
              ))}
              {selectedCrits.map(v => (
                <span key={`crit-${v}`} className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">CVSS: {v}</span>
              ))}
              {selectedResults.map(v => (
                <span key={`res-${v}`} className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">Result: {v}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold mb-4">Vulnerabilities Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }} onClick={handleTrendClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#4b5563' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563' }}>
                <Label value="Count" angle={-90} position="insideLeft" fill="#4b5563" />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold mb-4">By CVSS Criticality</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={critBarData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }} onClick={handleCritBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#4b5563' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563' }}>
                <Label value="Count" angle={-90} position="insideLeft" fill="#4b5563" />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
              <Legend />
              <Bar dataKey="count">
                {critBarData.map((entry, index) => {
                  const key = String(entry.name || '').toUpperCase();
                  const color = key === 'CRITICAL' ? '#8B0000' : key === 'HIGH' ? '#FF0000' : key === 'MEDIUM' ? '#f59e0b' : key === 'LOW' ? '#22c55e' : '#6b7280';
                  return <Cell key={`crit-cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Environment chart full width */}
      <div className="mt-6">
        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold mb-4">By Environment</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={envBarData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }} onClick={handleEnvBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" interval={0} tick={{ fill: '#4b5563' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563' }}>
                <Label value="Count" angle={-90} position="insideLeft" fill="#4b5563" />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aging Buckets full width */}
      <div className="mt-6">
        <div className="p-6 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold mb-4">Aging Buckets (days since created)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agingBarData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }} onClick={(data) => {
              const bucket = data?.activeLabel || data?.payload?.name || data?.name;
              if (!bucket) return;
              openModalWithFilter({
                title: `Aging: ${bucket}`,
                filterFn: (it) => {
                  const d = daysSince(it?.created_at);
                  if (bucket === '0-7') return d <= 7;
                  if (bucket === '8-30') return d >= 8 && d <= 30;
                  if (bucket === '31-60') return d >= 31 && d <= 60;
                  return d >= 61;
                },
              });
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" interval={0} tick={{ fill: '#4b5563' }} />
              <YAxis allowDecimals={false} tick={{ fill: '#4b5563' }}>
                <Label value="Count" angle={-90} position="insideLeft" fill="#4b5563" />
              </YAxis>
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }} />
              <Legend />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-4xl mx-4 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-lg font-semibold">{modalTitle}</h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Vulnerability</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Result</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">CVSS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Business</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-neutral-300 uppercase tracking-wider">Environment</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                  {modalItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-600 dark:text-neutral-300">No matching records</td>
                    </tr>
                  ) : (
                    modalItems.map((v) => (
                      <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                        <td className="px-4 py-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{v.vulnerability_id}</div>
                          <div className="text-sm text-gray-600 dark:text-neutral-300 max-w-md truncate" title={v.vulnerability_name}>{v.vulnerability_name}</div>
                        </td>
                        <td className="px-4 py-2 text-sm">{v.result}</td>
                        <td className="px-4 py-2 text-sm">{v.cvss_criticality}</td>
                        <td className="px-4 py-2 text-sm">{v.business_criticality}</td>
                        <td className="px-4 py-2 text-sm">{v.tested_environment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardStats;