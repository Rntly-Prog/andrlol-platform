export interface AuthorData {
  name: string;
  fullName: string;
  age: number;
  tagline: string;
  description: string;
  photo: string;
  location: string;
  experience: string;
  stats: {
    builds: string;
    guides: string;
    games: string;
  };
  skills: string[];
  games: string[];
  services: string[];
  contacts: {
    discord: {
      username: string;
      server: string;
    };
    telegram: string;
  };
}

export const DEFAULT_AUTHOR: AuthorData = {
  name: 'AndrLol',
  fullName: 'Андрей',
  age: 20,
  tagline: 'Оптимизирую ПК, собираю компьютеры, помогаю выжать максимум FPS',
  description:
    'Андрей, 20 лет. Играю в CS2, PUBG, Stalzone, Lies of P, Horizon Zero Dawn и десятки других проектов. Больше 4 лет занимаюсь оптимизацией Windows, разгоном железа и сборкой игровых ПК под любой бюджет.',
  photo: '/images/author.png',
  location: 'Россия',
  experience: '4+ года в оптимизации ПК и игровых конфигах',
  stats: {
    builds: '50+',
    guides: '30+',
    games: '15+',
  },
  skills: [
    'Сборка и апгрейд ПК',
    'Оптимизация Windows 10/11',
    'Разгон CPU и GPU',
    'Настройка игр под максимальный FPS',
    'Диагностика лагов и фризов',
    'Подбор железа под бюджет',
  ],
  games: ['CS2', 'PUBG', 'Stalzone', 'Lies of P', 'Horizon Zero Dawn', 'Valorant', 'Apex Legends'],
  services: [
    'Персональные конфиги под ваше железо',
    'Удалённая оптимизация системы',
    'Консультации по сборке ПК',
    'Премиум-гайды и эксклюзивные материалы',
  ],
  contacts: {
    discord: {
      username: 'andriuh_haa',
      server: 'https://discord.gg/PMKbrJkEU',
    },
    telegram: '@andriuh_haa',
  },
};
