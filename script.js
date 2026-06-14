/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

'use strict';

/* ---------- DOM取得 ---------- */
const header      = document.getElementById('header');
const hamburger   = document.getElementById('hamburger');
const nav         = document.getElementById('nav');
const navLinks    = document.querySelectorAll('.nav-link');
const backToTop   = document.getElementById('backToTop');
const sections    = document.querySelectorAll('section[id]');
const skillFills  = document.querySelectorAll('.skill-fill');

/* ============================================================
   1. スムーズスクロール（ナビリンク・フッターリンク）
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    const target   = document.querySelector(targetId);
    if (!target) return;

    const headerH  = parseInt(getComputedStyle(document.documentElement)
                       .getPropertyValue('--header-h'), 10) || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;

    window.scrollTo({ top, behavior: 'smooth' });

    // モバイルナビを閉じる
    closeNav();
  });
});

/* ============================================================
   2. ハンバーガーメニュー
   ============================================================ */
function openNav() {
  hamburger.classList.add('open');
  nav.classList.add('open');
  hamburger.setAttribute('aria-label', 'メニューを閉じる');
}
function closeNav() {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
  hamburger.setAttribute('aria-label', 'メニューを開く');
}
hamburger.addEventListener('click', () => {
  nav.classList.contains('open') ? closeNav() : openNav();
});

// ナビ外クリックで閉じる
document.addEventListener('click', e => {
  if (!header.contains(e.target)) closeNav();
});

/* ============================================================
   3. スクロール処理（ヘッダー影 / アクティブリンク / Back-to-Top）
   ============================================================ */
let ticking = false;

function onScroll() {
  const scrollY = window.scrollY;

  /* ---- 3-1. ヘッダー影 ---- */
  header.classList.toggle('scrolled', scrollY > 10);

  /* ---- 3-2. アクティブナビリンク ---- */
  const headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10
  ) || 70;

  let currentSection = '';
  sections.forEach(sec => {
    const top    = sec.offsetTop - headerH - 60;
    const bottom = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      currentSection = sec.id;
    }
  });
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${currentSection}`;
    link.classList.toggle('active', isActive);
  });

  /* ---- 3-3. Back-to-Top ---- */
  backToTop.classList.toggle('visible', scrollY > 400);

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });

/* ============================================================
   4. Back-to-Top クリック
   ============================================================ */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================================
   5. IntersectionObserver — フェードインアニメーション
      要素が画面に入ると .in-view を付与してフェードアップ。
      画面から外れると .in-view を外し、再スクロール時に再アニメーションする（双方向）。
      対象要素には JS 側で .fade-up クラスを自動付与するため、
      HTML に直接書かなくてもアニメーションが適用される。
   ============================================================ */
const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, observerOpts);

/* fade-up クラスを自動付与してから監視開始
   ※ .about-text は About セクションの本文ブロック */
document.querySelectorAll(
  '.skill-card, .work-card, .about-text, .section-title'
).forEach(el => {
  el.classList.add('fade-up');
  fadeObserver.observe(el);
});

/* ============================================================
   6. スキルバー アニメーション
      画面に入ったとき data-width の値まで幅を広げ、
      画面から出たときに即座に 0 へリセットする（再入時に再アニメーション）。
      トランジションをリセット後に復元するため、二重の rAF で
      ブラウザの描画タイミングをまたぐ。
   ============================================================ */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const fill  = entry.target;
    const width = fill.dataset.width || '0';
    if (entry.isIntersecting) {
      // 入ったら目標幅まで伸ばす（少し遅延してトランジションを確実に発火させる）
      setTimeout(() => { fill.style.width = width + '%'; }, 100);
    } else {
      // 出たら transition を一時無効にして瞬時に 0 へ戻す
      fill.style.transition = 'none';
      fill.style.width = '0%';
      // 2フレーム後に transition を復元（この間に 0% がブラウザへ反映される）
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fill.style.transition = '';
        });
      });
    }
  });
}, { threshold: 0.5 });

skillFills.forEach(fill => barObserver.observe(fill));

/* ============================================================
   7. 初期実行（ページ読み込み時のスクロール位置に合わせて状態を即反映）
   ============================================================ */
onScroll();
