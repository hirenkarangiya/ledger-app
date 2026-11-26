import { useState } from 'react';
import Sidebar from './components/Sidebar';
import AccountCards from './components/AccountCards';
import MonthlyChart from './components/MonthlyChart';
import CategoryDonut from './components/CategoryDonut';
import AddTransactionForm from './components/AddTransactionForm';
import TransactionTable from './components/TransactionTable';

const currentYear = new Date().getFullYear();

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

export default function App() {
  // The year is shared by both charts, so it lives in the parent component
  const [year, setYear] = useState(currentYear);

  return (
    <div className="app">
      <Sidebar />

      <main className="main" id="dashboard">
        <header className="page-header page-header-row">
          <div>
            <h1>Good {greeting()}, Hiren! 👋</h1>
            <p className="muted">Here's how your finances are looking this year.</p>
          </div>
          <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
          </select>
        </header>

        <AccountCards />

        <div className="grid-2-1">
          <MonthlyChart year={year} />
          <CategoryDonut year={year} />
        </div>

        <AddTransactionForm />

        <div id="transactions">
          <TransactionTable />
        </div>
      </main>
    </div>
  );
}