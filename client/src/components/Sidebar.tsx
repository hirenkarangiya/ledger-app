import { ArrowLeftRight, BarChart3, LayoutDashboard, Leaf, Settings, Lightbulb } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'Transactions', icon: ArrowLeftRight, href: '#transactions' },
  { label: 'Reports', icon: BarChart3, href: '#reports' },
  { label: 'Settings', icon: Settings, href: '#settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Leaf className="logo" size={36} />
        <div>
          <strong>Ledger</strong>
          <small>Track • Plan • Grow</small>
        </div>
      </div>

      <nav className="nav">
        {navItems.map(({ label, icon: Icon, href }) => (
          <a key={label} href={href}>
            <Icon size={18} />
            {label}
          </a>
        ))}
      </nav>

      <div className="tip">
        <Lightbulb size={28} color="#22a06b" />
        <strong>Smart tip</strong>
        <p>Try to keep your expenses below 70% of your income.</p>
        <button className="btn-outline">View Tips →</button>
      </div>
    </aside>
  );
}