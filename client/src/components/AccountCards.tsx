import { CreditCard, MoreHorizontal, PiggyBank, Wallet } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { formatINR } from '../utils/format';

const icons = {
  savings: PiggyBank,
  checking: Wallet,
  credit_card: CreditCard,
};

// Each card gets a color, cycling through the palette
const tones = ['tone-green', 'tone-blue', 'tone-purple'];

export default function AccountCards() {
  const { data: accounts, isLoading, isError, error } = useAccounts();

  if (isLoading) return <p className="muted">Loading accounts...</p>;
  if (isError) return <p>Could not load accounts: {error.message}</p>;

  return (
    <div className="grid-3">
      {accounts?.map((account, index) => {
        const Icon = icons[account.account_type];
        const balance = Number(account.current_balance);

        return (
          <div key={account.id} className="card account-card">
            <div className={`icon-circle ${tones[index % tones.length]}`}>
              <Icon size={26} />
            </div>
            <div className="info">
              <p className="muted small">{account.name}</p>
              <p className={`amount ${balance < 0 ? 'negative' : ''}`}>{formatINR(balance)}</p>
            </div>
            <MoreHorizontal size={18} className="muted" />
          </div>
        );
      })}
    </div>
  );
}