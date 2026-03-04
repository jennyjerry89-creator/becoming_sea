import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Я, ты, море — туры под ключ',
  description: 'Турагентство «Я, ты, море»: индивидуальный подбор путешествий, проверенные отели и сопровождение под ключ.',
  openGraph: {
    title: 'Я, ты, море — туры под ключ',
    description: 'Подбор тура за 30 минут. Напишите нам в WhatsApp или Telegram.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
