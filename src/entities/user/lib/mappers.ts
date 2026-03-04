import { WalletHistoryApiItem, WalletHistoryItem, WalletHistoryType } from '../api';

const walletHistoryTitleMap: Record<WalletHistoryType, string> = {
  CREATE_ORDER: 'Создание ордера',
  BUY_ORDER: 'Покупка ордера',
  BUY_ORDER_OTHER_USER: 'Покупка ордера другим пользователем',
  REFERRAL: 'Реферальная система',
  PAYMENT: 'Пополнение',
  WITHDRAWAL: 'Вывод средств',
  BATTLE_PASS: 'Награда Battle Pass',
};

export const mapWalletHistoryItem = (item: WalletHistoryApiItem): WalletHistoryItem => {
  const d = new Date(item.create_date * 1000);

  const date = `${d.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })} ${d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  })}`;

  const title = walletHistoryTitleMap[item.type] ?? 'Операция';

  return {
    id: item.id,
    currency: item.currency,
    amount: item.value,
    title,
    date,
  };
};
