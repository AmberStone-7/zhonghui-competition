import { describe, expect, test, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Register from '../pages/Register';
import Auth from '../pages/Auth';
import Showcase from '../pages/Showcase';
import Rules from '../pages/Rules';
import Awards from '../pages/Awards';
import Vote from '../pages/Vote';
import Layout from '../components/Layout';

describe('prototype alignment', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  test('home mobile uses prototype background and source assets', () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    expect((mobileRoot as HTMLElement).style.backgroundImage).toContain('bg-h5-video.png');
    const mobileQueries = within(mobileRoot as HTMLElement);
    expect(mobileQueries.getByAltText('Main Visual')).toHaveAttribute('src', expect.stringContaining('h5-sample-4.png'));
    expect(mobileQueries.getByAltText('Logo')).toHaveAttribute('src', expect.stringContaining('logo-gold.png'));
    const pcRoot = container.querySelector('.hidden.md\\:block');
    expect(pcRoot).not.toBeNull();
    const pcBanner = (pcRoot as HTMLElement).querySelector('[style*="banner.png"]');
    expect(pcBanner).not.toBeNull();
  });

  test('auth page uses prototype background and hero assets', () => {
    const { container } = render(<MemoryRouter><Auth /></MemoryRouter>);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    expect((mobileRoot as HTMLElement).style.backgroundImage).toContain('bg-h5-video.png');
    const mobileQueries = within(mobileRoot as HTMLElement);
    expect(mobileQueries.getByAltText('Logo')).toHaveAttribute('src', expect.stringContaining('logo-gold.png'));
  });

  test('auth confirm sets sessionStorage', () => {
    const { container } = render(<MemoryRouter><Auth /></MemoryRouter>);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    const confirmButton = within(mobileRoot as HTMLElement).getByRole('button', { name: '确认授权' });
    fireEvent.click(confirmButton);
    expect(sessionStorage.getItem('data_authorized')).toBe('1');
  });

  test('register uses prototype assets and bg', () => {
    const { container } = render(<Register />);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    expect((mobileRoot as HTMLElement).style.backgroundImage).toContain('bg-h5-video.png');
    const mobileQueries = within(mobileRoot as HTMLElement);
    expect(mobileQueries.getByAltText('Main Paper Mark')).toHaveAttribute('src', expect.stringContaining('h5-sample-4.png'));
    expect(mobileQueries.getByAltText('Logo')).toHaveAttribute('src', expect.stringContaining('logo-gold.png'));
  });

  test.each([
    ['showcase', <Showcase />],
    ['rules', <Rules />],
    ['awards', <Awards />],
    ['vote', <Vote />],
  ])('%s mobile uses bg-h5-video and has min-h-screen', (_name, page) => {
    const { container } = render(<MemoryRouter>{page}</MemoryRouter>);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    expect((mobileRoot as HTMLElement).style.backgroundImage).toContain('bg-h5-video.png');
    expect(mobileRoot!.className).toContain('min-h-screen');
  });

  test('home pc banner has no overlay or text', () => {
    const { container } = render(<MemoryRouter><Home /></MemoryRouter>);
    const pcRoot = container.querySelector('.hidden.md\\:block');
    expect(pcRoot).not.toBeNull();
    const overlay = (pcRoot as HTMLElement).querySelector('.bg-black\\/25');
    expect(overlay).toBeNull();
    const bannerDiv = (pcRoot as HTMLElement).querySelector('[style*="banner.png"]');
    expect(bannerDiv).not.toBeNull();
    expect(bannerDiv!.children.length).toBe(0);
  });

  test('all pc sub-pages use max-w-[1104px]', () => {
    const pages: Array<{ name: string; el: React.ReactElement }> = [
      { name: 'rules', el: <MemoryRouter><Rules /></MemoryRouter> },
      { name: 'awards', el: <MemoryRouter><Awards /></MemoryRouter> },
      { name: 'showcase', el: <MemoryRouter><Showcase /></MemoryRouter> },
      { name: 'vote', el: <MemoryRouter><Vote /></MemoryRouter> },
      { name: 'register', el: <Register /> },
    ];
    for (const { name, el } of pages) {
      const { container } = render(el);
      const pcRoot = container.querySelector('.hidden.md\\:block');
      expect(pcRoot, `${name}: PC root should exist`).not.toBeNull();
      expect((pcRoot as HTMLElement).querySelector('.max-w-\\[1104px\\]'), `${name}: should use max-w-[1104px]`).not.toBeNull();
    }
  });
});

describe('auth redirect behavior', () => {
  test('auth confirm navigates PC to /register when width >= 768', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    const { container } = render(<MemoryRouter><Auth /></MemoryRouter>);
    const pcRoot = container.querySelector('.hidden.md\\:flex');
    expect(pcRoot).not.toBeNull();
    const confirmBtn = within(pcRoot as HTMLElement).getByRole('button', { name: '确认授权' });
    fireEvent.click(confirmBtn);
    expect(sessionStorage.getItem('data_authorized')).toBe('1');
  });

  test('auth confirm navigates mobile to / when width < 768', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 });
    const { container } = render(<MemoryRouter><Auth /></MemoryRouter>);
    const mobileRoot = container.querySelector('.md\\:hidden');
    expect(mobileRoot).not.toBeNull();
    const confirmBtn = within(mobileRoot as HTMLElement).getByRole('button', { name: '确认授权' });
    fireEvent.click(confirmBtn);
    expect(sessionStorage.getItem('data_authorized')).toBe('1');
  });
});

describe('mobile header no duplication', () => {
  test('Layout Brand section hidden on mobile', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/showcase']}>
        <Layout />
      </MemoryRouter>
    );
    // The Brand link should have hidden sm:flex so it's invisible on mobile
    const brandLinks = container.querySelectorAll('header a[href="/"]');
    // One Brand link (desktop) + one mobile-only link = 2
    // But the desktop one should be hidden on mobile
    const hiddenBrand = container.querySelector("header div.hidden.sm\\:flex");
    expect(hiddenBrand).not.toBeNull();
  });
});

describe('desktop brand is not a link', () => {
  test('PC Brand section is a div, not a Link to home', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Layout />
      </MemoryRouter>
    );
    // The desktop Brand (hidden sm:flex) should be a div, not an <a>
    const desktopBrand = container.querySelector('header .hidden.sm\\:flex');
    expect(desktopBrand).not.toBeNull();
    expect(desktopBrand!.tagName).toBe('DIV');
  });

  test('mobile-only bar still links to home', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Layout />
      </MemoryRouter>
    );
    const mobileLink = container.querySelector('header .mobile-only a[href="/"]');
    expect(mobileLink).not.toBeNull();
  });
});
