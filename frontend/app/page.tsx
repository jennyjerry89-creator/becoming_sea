'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type LeadPayload = {
  name: string;
  phone: string;
  direction?: string;
  dates?: string;
  budget?: string;
  comment?: string;
  source: 'hero' | 'final';
  consent: boolean;
  website: string;
};

const navItems = [
  { href: '#about', label: 'О нас' },
  { href: '#tours', label: 'Туры' },
  { href: '#hotels', label: 'Отели' },
  { href: '#steps', label: 'Этапы работы' },
  { href: '#reviews', label: 'Отзывы' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacts', label: 'Контакты' }
];

const tours = [
  'Мальдивы',
  'Сейшелы',
  'Греция',
  'Турция Премиум',
  'ОАЭ',
  'Бали',
  'Шри-Ланка',
  'Тайланд',
  'Маврикий'
];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('about');
  const [showTop, setShowTop] = useState(false);
  const [expandedTours, setExpandedTours] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [sending, setSending] = useState<'hero' | 'final' | null>(null);
  const [sentMessage, setSentMessage] = useState('');

  const visibleTours = useMemo(() => (expandedTours ? tours : tours.slice(0, 6)), [expandedTours]);

  useEffect(() => {
    const sectionIds = ['about', 'tours', 'hotels', 'steps', 'reviews', 'faq', 'contacts'];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) {
        return null;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return observer;
    });

    const onScroll = () => setShowTop(window.scrollY > window.innerHeight);
    window.addEventListener('scroll', onScroll);

    return () => {
      observers.forEach((observer) => observer?.disconnect());
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const submitLead = async (event: FormEvent<HTMLFormElement>, source: 'hero' | 'final') => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: LeadPayload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      direction: String(formData.get('direction') || '').trim(),
      dates: String(formData.get('dates') || '').trim(),
      budget: String(formData.get('budget') || '').trim(),
      comment: String(formData.get('comment') || '').trim(),
      consent: formData.get('consent') === 'on',
      website: String(formData.get('website') || ''),
      source
    };

    if (!payload.name || !payload.phone || !payload.consent) {
      setSentMessage('Заполните обязательные поля и подтвердите согласие на обработку данных.');
      return;
    }

    setSending(source);
    setSentMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Lead API error');
      }

      event.currentTarget.reset();
      setSentMessage('Спасибо! Мы свяжемся с вами в ближайшее время.');
    } catch {
      setSentMessage('Не удалось отправить заявку. Напишите нам в WhatsApp/Telegram — ответим сразу.');
    } finally {
      setSending(null);
    }
  };

  return (
    <main>
      <header className="header">
        <div className="logo">Я, ты, море</div>
        <nav>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={activeSection === item.href.slice(1) ? 'active' : ''}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a href="tel:+79990000000" className="phone">
          +7 (999) 000-00-00
        </a>
      </header>

      <section className="hero">
        <h1>Путешествия под ключ с персональным турагентом</h1>
        <p>Подберем 3 лучших варианта отдыха за 30 минут: перелет, трансфер, страховка и сопровождение.</p>
        <div className="hero-actions">
          <a href="#contacts" className="btn btn-primary">
            Подобрать идеальный тур
          </a>
          <a href="https://wa.me/79990000000" className="btn btn-ghost">
            Написать в WhatsApp
          </a>
        </div>

        <form className="lead-form" onSubmit={(event) => submitLead(event, 'hero')}>
          <input name="name" placeholder="Ваше имя" required />
          <input name="phone" placeholder="Телефон / Telegram" required />
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" />
          <label className="consent">
            <input type="checkbox" name="consent" required /> Согласен(а) на обработку персональных данных
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending === 'hero'}>
            {sending === 'hero' ? 'Отправка...' : 'Оставить заявку'}
          </button>
        </form>
      </section>

      <section id="about" className="section">
        <h2>О нас</h2>
        <p>Агентство «Я, ты, море» помогает семьям и парам отдыхать спокойно и красиво. Мы берем на себя всю организацию поездки.</p>
      </section>

      <section id="tours" className="section cards">
        <h2>Популярные туры</h2>
        <div className="grid">
          {visibleTours.map((tour) => (
            <article key={tour} className="card">
              <h3>{tour}</h3>
              <p>Премиальный отдых с проверенными партнерами.</p>
              <button className="btn btn-ghost">Хочу такой тур</button>
            </article>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setExpandedTours((prev) => !prev)}>
          {expandedTours ? 'Скрыть' : 'Показать еще'}
        </button>
      </section>

      <section id="hotels" className="section cards">
        <h2>Рекомендуемые отели</h2>
        <div className="grid">
          <article className="card"><h3>5★ One&Only</h3><p>Мальдивы · Романтический отдых</p></article>
          <article className="card"><h3>5★ Four Seasons</h3><p>Сейшелы · Семейный отдых</p></article>
          <article className="card"><h3>4★ Blue Lagoon</h3><p>Греция · Спокойный отдых</p></article>
        </div>
      </section>

      <section id="steps" className="section">
        <h2>Этапы работы</h2>
        <ol>
          <li>Заявка и короткий бриф.</li>
          <li>Уточнение пожеланий по бюджету и формату отдыха.</li>
          <li>Подбор и согласование вариантов.</li>
          <li>Бронирование, документы и сопровождение.</li>
        </ol>
      </section>

      <section id="reviews" className="section cards">
        <h2>Отзывы</h2>
        <div className="grid">
          <blockquote className="card">«Организация на высшем уровне, отдых получился идеальным.» — Анна</blockquote>
          <blockquote className="card">«Подобрали тур под бюджет и поддерживали 24/7.» — Игорь</blockquote>
        </div>
      </section>

      <section id="faq" className="section">
        <h2>FAQ</h2>
        {[
          ['Как происходит подбор тура?', 'Мы собираем пожелания и предлагаем 3–5 вариантов с понятными условиями.'],
          ['Что входит в стоимость?', 'Перелет, проживание, трансферы и страховка — в зависимости от выбранного пакета.'],
          ['Можно ли в рассрочку?', 'Да, доступна рассрочка у партнерских банков.']
        ].map(([question, answer], index) => (
          <div key={question} className="faq-item">
            <button onClick={() => setFaqOpen(faqOpen === index ? null : index)}>{question}</button>
            {faqOpen === index ? <p>{answer}</p> : null}
          </div>
        ))}
      </section>

      <section id="contacts" className="section final-cta">
        <h2>Оставьте заявку — подберем 3 лучших варианта тура за 30 минут</h2>
        <form className="lead-form" onSubmit={(event) => submitLead(event, 'final')}>
          <input name="name" placeholder="Ваше имя" required />
          <input name="phone" placeholder="Телефон" required />
          <input name="direction" placeholder="Направление" />
          <input name="dates" placeholder="Даты" />
          <input name="budget" placeholder="Бюджет" />
          <textarea name="comment" placeholder="Комментарий" />
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" />
          <label className="consent">
            <input type="checkbox" name="consent" required /> Согласен(а) на обработку персональных данных
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending === 'final'}>
            {sending === 'final' ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </form>
        <p>{sentMessage}</p>
      </section>

      {showTop ? (
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Наверх
        </button>
      ) : null}
    </main>
  );
}
