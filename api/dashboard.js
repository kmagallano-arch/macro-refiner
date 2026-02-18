module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Macro Refiner - Usage Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6; min-height: 100vh; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .logo-text h1 { font-size: 24px; color: #1f2937; }
    .logo-text p { font-size: 14px; color: #6b7280; }
    .refresh-btn { padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .refresh-btn:hover { background: #4f46e5; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-label { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1f2937; }
    .stat-value.cost { color: #059669; }
    .stat-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .chart-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .chart-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
    .bar-chart { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 100px; font-size: 13px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-container { flex: 1; height: 24px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 4px; transition: width 0.5s ease; }
    .bar-value { width: 60px; text-align: right; font-size: 13px; font-weight: 500; color: #374151; }
    .table-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .table-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
    td { padding: 12px; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    tr:hover { background: #f9fafb; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .badge-wismo { background: #dbeafe; color: #1d4ed8; }
    .badge-return { background: #fef3c7; color: #b45309; }
    .badge-cancel { background: #fee2e2; color: #dc2626; }
    .badge-general { background: #e5e7eb; color: #374151; }
    .badge-escalation { background: #fecaca; color: #991b1b; }
    .badge-subscription { background: #d1fae5; color: #065f46; }
    .loading { text-align: center; padding: 48px; color: #6b7280; }
    .spinner { width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px; color: #6b7280; }
    .empty-state-icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <div class="logo-icon">✨</div>
        <div class="logo-text">
          <h1>Macro Refiner</h1>
          <p>Usage Dashboard</p>
        </div>
      </div>
      <button class="refresh-btn" onclick="loadData()">🔄 Refresh</button>
    </header>
    <div id="content">
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading usage data...</p>
      </div>
    </div>
  </div>
  <script>
    const SUPABASE_URL = 'https://hqopedhvtlnbpgnvbvhu.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxb3BlZGh2dGxuYnBnbnZidmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTkwMDQsImV4cCI6MjA4NTc3NTAwNH0.rSnz2mcUbh8uVbUJkVsZe2BbhQL56nBKqe7fxceJWSg';
    
    async function fetchData() {
      const response = await fetch(SUPABASE_URL + '/rest/v1/usage_logs?select=*&order=created_at.desc&limit=1000', {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
      });
      return response.json();
    }
    
    function getDateRange(data, days) {
      const now = new Date();
      const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
      return data.filter(d => new Date(d.created_at) >= cutoff);
    }
    
    function calculateStats(data) {
      const today = getDateRange(data, 1);
      const week = getDateRange(data, 7);
      const month = getDateRange(data, 30);
      const sumCost = (arr) => arr.reduce((sum, d) => sum + (parseFloat(d.estimated_cost) || 0), 0);
      return {
        today: { count: today.length, cost: sumCost(today) },
        week: { count: week.length, cost: sumCost(week) },
        month: { count: month.length, cost: sumCost(month) },
        total: { count: data.length, cost: sumCost(data) }
      };
    }
    
    function groupBy(data, key) {
      const groups = {};
      data.forEach(d => {
        const value = d[key] || 'Unknown';
        groups[value] = (groups[value] || 0) + 1;
      });
      return Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }
    
    function formatCost(cost) { return '$' + cost.toFixed(2); }
    
    function getCategoryBadge(category) {
      const cat = (category || 'general').toLowerCase();
      let badgeClass = 'badge-general';
      if (cat.includes('wismo')) badgeClass = 'badge-wismo';
      else if (cat.includes('return')) badgeClass = 'badge-return';
      else if (cat.includes('cancel')) badgeClass = 'badge-cancel';
      else if (cat.includes('escalation')) badgeClass = 'badge-escalation';
      else if (cat.includes('subscription')) badgeClass = 'badge-subscription';
      return '<span class="badge ' + badgeClass + '">' + (category || 'General') + '</span>';
    }
    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    function renderDashboard(data) {
      if (!data || data.length === 0) {
        document.getElementById('content').innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No usage data yet</h3><p>Data will appear here once agents start using Macro Refiner</p></div>';
        return;
      }
      const stats = calculateStats(data);
      const byAgent = groupBy(data, 'agent_name');
      const byCategory = groupBy(data, 'category');
      const maxAgent = byAgent[0]?.[1] || 1;
      const maxCategory = byCategory[0]?.[1] || 1;
      const recent = data.slice(0, 20);
      
      document.getElementById('content').innerHTML = 
        '<div class="stats-grid">' +
          '<div class="stat-card"><div class="stat-label">Today</div><div class="stat-value">' + stats.today.count + '</div><div class="stat-sub">generations</div></div>' +
          '<div class="stat-card"><div class="stat-label">This Week</div><div class="stat-value">' + stats.week.count + '</div><div class="stat-sub">generations</div></div>' +
          '<div class="stat-card"><div class="stat-label">This Month</div><div class="stat-value">' + stats.month.count + '</div><div class="stat-sub">generations</div></div>' +
          '<div class="stat-card"><div class="stat-label">Monthly Cost (Est.)</div><div class="stat-value cost">' + formatCost(stats.month.cost) + '</div><div class="stat-sub">based on Haiku pricing</div></div>' +
        '</div>' +
        '<div class="charts-grid">' +
          '<div class="chart-card"><div class="chart-title">👤 Top Agents</div><div class="bar-chart">' +
            byAgent.map(function(item) { return '<div class="bar-row"><div class="bar-label" title="' + item[0] + '">' + item[0] + '</div><div class="bar-container"><div class="bar-fill" style="width: ' + (item[1] / maxAgent) * 100 + '%"></div></div><div class="bar-value">' + item[1] + '</div></div>'; }).join('') +
          '</div></div>' +
          '<div class="chart-card"><div class="chart-title">📁 By Category</div><div class="bar-chart">' +
            byCategory.map(function(item) { return '<div class="bar-row"><div class="bar-label" title="' + item[0] + '">' + item[0] + '</div><div class="bar-container"><div class="bar-fill" style="width: ' + (item[1] / maxCategory) * 100 + '%"></div></div><div class="bar-value">' + item[1] + '</div></div>'; }).join('') +
          '</div></div>' +
        '</div>' +
        '<div class="table-card"><div class="table-title">🕐 Recent Activity</div><table><thead><tr><th>Time</th><th>Agent</th><th>Category</th><th>Ticket</th><th>Type</th><th>Cost</th></tr></thead><tbody>' +
          recent.map(function(row) { return '<tr><td>' + formatDate(row.created_at) + '</td><td>' + (row.agent_name || 'Unknown') + '</td><td>' + getCategoryBadge(row.category) + '</td><td>' + (row.ticket_id || '-') + '</td><td>' + (row.action_type || 'generate') + '</td><td>' + formatCost(parseFloat(row.estimated_cost) || 0) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    }
    
    async function loadData() {
      document.getElementById('content').innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading usage data...</p></div>';
      try {
        const data = await fetchData();
        renderDashboard(data);
      } catch (error) {
        document.getElementById('content').innerHTML = '<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Error loading data</h3><p>' + error.message + '</p></div>';
      }
    }
    
    loadData();
  </script>
</body>
</html>
  `);
};
```

6. Click **"Commit changes"**

---

**Access at:**
```
https://macro-refiner.vercel.app/api/dashboard
