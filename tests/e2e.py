"""
End-to-end acceptance tests for Ever After Memoir.

Runs against a running site (BASE) connected to a Supabase project that has
an admin user and a non-admin user. Usage:

  BASE=http://localhost:3100 ADMIN_EMAIL=... ADMIN_PASSWORD=... \
  OTHER_EMAIL=... OTHER_PASSWORD=... SUPABASE_URL=... ANON_KEY=... \
  UPLOAD_IMAGE=path/to/photo.jpg BAD_FILE=path/to/file.txt \
  python3 tests/e2e.py

Each check prints PASS/FAIL. The script exits non-zero if any check fails.
Note: it creates and then deletes test content in the database.
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('BASE', 'http://localhost:3100')
results = []
console_errors = []


def check(name, fn):
    try:
        fn()
        results.append((name, True, ''))
        print(f'PASS  {name}')
    except Exception as e:  # noqa: BLE001
        msg = str(e).split('\n')[0][:220]
        results.append((name, False, msg))
        print(f'FAIL  {name} — {msg}')


def http(path, method='GET', data=None, headers=None):
    req = urllib.request.Request(BASE + path if path.startswith('/') else path, method=method, data=data, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def new_page(browser, **kw):
    ctx = browser.new_context(**kw)
    page = ctx.new_page()
    page.on('console', lambda m: console_errors.append(f'{page.url}: {m.text}') if m.type == 'error' else None)
    page.on('pageerror', lambda e: console_errors.append(f'{page.url}: {e}'))
    return ctx, page


def login(page, email, password):
    page.goto(f'{BASE}/admin/login')
    page.get_by_label('Email').fill(email)
    page.get_by_label('Password').fill(password)
    page.get_by_role('button', name='Sign in').click()


def save_and_publish(page):
    page.get_by_role('button', name=re.compile(r'^Publish')).click()
    expect(page.get_by_text(re.compile(r'Published|Update published'))).to_be_visible(timeout=15000)


with sync_playwright() as p:
    browser = p.chromium.launch()
    stamp = str(int(time.time()))[-6:]

    # 1. Public navigation, desktop and mobile
    def t1():
        for vp in ({'width': 1440, 'height': 900}, {'width': 360, 'height': 760}):
            ctx, page = new_page(browser, viewport=vp)
            for path in ['/', '/stories', '/services', '/about', '/contact', '/privacy', '/stories/a-day-to-remember']:
                r = page.goto(BASE + path, wait_until='domcontentloaded')
                assert r and r.status == 200, f'{path} returned {r.status if r else None}'
                page.wait_for_timeout(300)
                sw = page.evaluate('document.documentElement.scrollWidth')
                assert sw <= vp['width'], f'{path} overflows horizontally at {vp["width"]}px ({sw}px)'
                # html has overflow-x: clip, so also check nothing is pushed off-screen
                off = page.evaluate('''w => [...document.querySelectorAll('header a, header button, main a, main button')]
                    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && (r.right > w + 1 || r.left < -1) && !e.closest('.no-scrollbar, .marquee, [aria-hidden=true]') })
                    .map(e => (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 40))''', vp['width'])
                assert not off, f'{path} at {vp["width"]}px: off-screen controls {off[:3]}'
            if vp['width'] == 360:
                page.goto(BASE + '/')
                page.get_by_role('button', name='Open menu').click()
                page.get_by_role('dialog', name='Menu').get_by_role('link', name='Stories').click()
                page.wait_for_url(f'{BASE}/stories')
            ctx.close()
    check('1  Public pages load on desktop and mobile without horizontal overflow', t1)

    # 2. Protected admin
    def t2():
        ctx, page = new_page(browser)
        for path in ['/admin', '/admin/inquiries', '/admin/media', '/preview', '/preview/stories/a-day-to-remember']:
            page.goto(BASE + path)
            assert '/admin/login' in page.url, f'{path} did not redirect to login'
        ctx.close()
        status, _ = http('/admin/login')
        assert status == 200
    check('2  Signed-out visitors are sent to the login page', t2)

    # 3. Login / logout, non-admin refused
    admin_ctx, admin = new_page(browser, viewport={'width': 1440, 'height': 1000})
    def t3():
        ctx, page = new_page(browser)
        login(page, os.environ['OTHER_EMAIL'], os.environ['OTHER_PASSWORD'])
        expect(page.get_by_text('This account doesn’t have admin access.')).to_be_visible()
        login(page, os.environ['ADMIN_EMAIL'], 'wrong-password')
        expect(page.get_by_text('don’t match an admin account')).to_be_visible()
        ctx.close()
        login(admin, os.environ['ADMIN_EMAIL'], os.environ['ADMIN_PASSWORD'])
        admin.wait_for_url(f'{BASE}/admin')
        expect(admin.get_by_role('heading', name='Overview')).to_be_visible()
        # logout and back in
        admin.get_by_role('button', name='Sign out').first.click()
        admin.wait_for_url(re.compile(r'/admin/login'))
        login(admin, os.environ['ADMIN_EMAIL'], os.environ['ADMIN_PASSWORD'])
        admin.wait_for_url(f'{BASE}/admin')
    check('3  Admin can sign in and out; non-admins and wrong passwords are refused', t3)

    new_headline = f'Your day, as it felt {stamp}'
    # 4/5. Homepage edit → draft invisible → publish → live
    def t4():
        admin.goto(f'{BASE}/admin/homepage')
        field = admin.locator('#home-hero-headline')
        field.fill(new_headline)
        admin.get_by_role('button', name='Save draft').click()
        expect(admin.get_by_text('Draft saved')).to_be_visible()
        _, html = http('/')
        assert new_headline not in html, 'draft headline leaked to the public homepage'
        admin.goto(f'{BASE}/preview')
        expect(admin.locator('h1 .sr-only').first).to_have_text(new_headline)
        admin.goto(f'{BASE}/admin/homepage')
        save_and_publish(admin)
    check('4  Homepage text saves as a private draft, previews, then publishes', t4)

    def t5():
        time.sleep(1)
        _, html = http('/')
        assert new_headline in html, 'published headline not on the live homepage'
    check('5  Live homepage shows the published headline after refresh', t5)

    # 6. Upload and reuse
    uploaded_alt = f'Test upload {stamp}'
    def t6():
        admin.goto(f'{BASE}/admin/media')
        admin.get_by_label('Upload files').set_input_files(os.environ['UPLOAD_IMAGE'])
        expect(admin.get_by_role('heading', name='File details')).to_be_visible(timeout=20000)
        admin.locator('#m-alt').fill(uploaded_alt)
        admin.get_by_role('button', name='Save details').click()
        expect(admin.get_by_text('Details saved')).to_be_visible()
    check('6a Owner can upload a photo and add alt text', t6)

    story_title = f'E2E Story {stamp}'
    story_slug = f'e2e-story-{stamp}'
    story_url = {'admin': ''}
    # 7. Create draft story using the uploaded photo
    def t7():
        admin.goto(f'{BASE}/admin/stories')
        admin.get_by_role('button', name='New story').click()
        admin.wait_for_url(re.compile(r'/admin/stories/[0-9a-f-]{36}'))
        story_url['admin'] = admin.url
        admin.locator('#story-title').fill(story_title)
        expect(admin.locator('#story-slug')).to_have_value(story_slug)
        admin.get_by_role('button', name='Choose photo').first.click()
        dialog = admin.get_by_role('dialog', name='Choose a photo')
        dialog.get_by_role('button', name=re.compile(re.escape(uploaded_alt))).click()
        dialog.get_by_role('button', name='Use this photo').click()
        admin.get_by_role('button', name='Save draft').click()
        expect(admin.get_by_text('Draft saved')).to_be_visible()
    check('7  Owner can create a story draft and reuse an uploaded photo', t7)

    def t8():
        _, html = http('/stories')
        assert story_title not in html
        status, _ = http(f'/stories/{story_slug}')
        assert status == 404, f'draft story page returned {status}'
    check('8  Unpublished story is hidden from the public', t8)

    def t9():
        admin.goto(f'{BASE}/preview/stories/{story_slug}')
        expect(admin.locator('h1 .sr-only').first).to_have_text(story_title)
        ctx, page = new_page(browser)
        page.goto(f'{BASE}/preview/stories/{story_slug}')
        assert '/admin/login' in page.url
        ctx.close()
    check('9  Draft preview works for the admin only', t9)

    def t10():
        admin.goto(story_url['admin'])
        save_and_publish(admin)
        time.sleep(1)
        _, html = http('/stories')
        assert story_title in html, 'published story missing from /stories'
        status, _ = http(f'/stories/{story_slug}')
        assert status == 200
    check('10 Publishing a story puts it on the website', t10)

    def t11():
        admin.goto(story_url['admin'])
        admin.locator('#story-excerpt').fill(f'Edited excerpt {stamp}')
        save_and_publish(admin)
        time.sleep(1)
        _, html = http(f'/stories/{story_slug}')
        assert f'Edited excerpt {stamp}' in html
    check('11 Editing and republishing updates the live story', t11)

    def t12():
        admin.goto(story_url['admin'])
        admin.get_by_role('button', name='Unpublish').click()
        admin.get_by_role('dialog').get_by_role('button', name='Unpublish').click()
        expect(admin.get_by_text('Unpublished — removed from the website')).to_be_visible()
        time.sleep(1)
        _, html = http('/stories')
        assert story_title not in html
        status, _ = http(f'/stories/{story_slug}')
        assert status == 404, f'unpublished story returned {status}'
    check('12 Unpublishing removes the story from lists and its page', t12)

    # 13. Services & pricing
    price = f'From RM {stamp}'
    def t13():
        admin.goto(f'{BASE}/admin/services')
        admin.get_by_role('link', name='Wedding Day Content').click()
        admin.locator('#services-price').fill(price)
        admin.get_by_role('switch', name='Show the price on the website').click()
        admin.get_by_role('button', name='Save draft').click()
        expect(admin.get_by_text('Draft saved')).to_be_visible()
        _, html = http('/services')
        assert price not in html, 'draft price leaked publicly'
        save_and_publish(admin)
        time.sleep(1)
        _, html = http('/services')
        assert price in html, 'published price missing'
        # put it back
        admin.get_by_role('switch', name='Show the price on the website').click()
        admin.locator('#services-price').fill('')
        save_and_publish(admin)
    check('13 Services and prices: drafts hidden, publishing shows them', t13)

    # 14/15. Inquiry form
    couple = f'E2E Couple {stamp}'
    def t14():
        ctx, page = new_page(browser, viewport={'width': 390, 'height': 900})
        page.goto(f'{BASE}/contact')
        form = page.locator('#inquiry')
        form.get_by_role('button', name='Send inquiry').click()
        expect(form.get_by_text('Please tell us your name')).to_be_visible()
        form.get_by_label('Your name').fill(couple)
        form.get_by_label('Email').fill(f'couple{stamp}@test.local')
        form.get_by_label('Wedding date').fill('2030-06-15')
        form.get_by_label('Location or venue').fill('Kuantan')
        form.get_by_label('Type of celebration').select_option(index=1)
        form.get_by_label('Service you’re interested in').select_option(index=1)
        form.get_by_label('Tell us about your day').fill('Hello from the automated test.')
        form.get_by_role('checkbox').check()
        page.wait_for_timeout(3200)
        form.get_by_role('button', name='Send inquiry').click()
        expect(page.get_by_text('we have your message')).to_be_visible(timeout=15000)
        ctx.close()
    check('14 Public inquiry form validates and submits', t14)

    # 14b. Booking calendar -> WhatsApp, and the admin availability screen
    booker = f'E2E Booker {stamp}'
    def t14b():
        ctx, page = new_page(browser, viewport={'width': 1280, 'height': 900})
        wa = []
        ctx.route('https://wa.me/**', lambda route: (wa.append(route.request.url), route.fulfill(status=200, body='whatsapp')))
        page.goto(f'{BASE}/contact#book')
        cal = page.locator('#book')
        day = cal.locator('[data-day]:not([disabled])').first
        expect(day).to_be_visible()
        picked = day.get_attribute('data-day')
        day.click()
        cal.get_by_role('button', name='Continue on WhatsApp').click()
        expect(cal.get_by_text('Please tell us your name')).to_be_visible()
        page.locator('#bk-fullName').fill(booker)
        page.locator('#bk-celebrationType').select_option(index=1)
        page.locator('#bk-serviceInterest').select_option(index=1)
        page.locator('#bk-location').fill('Kuantan')
        cal.locator('input[name=consent]').check()
        page.wait_for_timeout(2700)
        cal.get_by_role('button', name='Continue on WhatsApp').click()
        page.wait_for_url('https://wa.me/**', timeout=15000)
        assert wa and 'text=' in wa[0], 'no WhatsApp redirect'
        ctx.close()
        # Owner marks it booked; the public calendar then shows that date as booked
        admin.goto(f'{BASE}/admin/inquiries')
        admin.get_by_role('link', name=re.compile(booker)).click()
        admin.locator('#inq-status').select_option('booked')
        expect(admin.get_by_text(re.compile('closed on your booking calendar'))).to_be_visible()
        ctx2, pub = new_page(browser, viewport={'width': 1280, 'height': 900})
        pub.goto(f'{BASE}/contact?date={picked}#book')
        btn = pub.locator(f'[data-day="{picked}"]')
        expect(btn).to_be_disabled()
        assert 'booked' in (btn.get_attribute('aria-label') or '').lower()
        ctx2.close()
        # Re-open the date from the admin calendar so reruns stay clean
        admin.goto(f'{BASE}/admin/availability')
        target = admin.locator(f'[data-admin-day="{picked}"]')
        for _ in range(24):
            if target.count():
                break
            admin.get_by_role('button', name='Next months').click()
        target.click()
        admin.get_by_role('button', name='Available', exact=True).click()
        expect(admin.get_by_text(re.compile('marked available'))).to_be_visible()
    check('14b Booking calendar sends the couple to WhatsApp; booked dates close', t14b)

    def t15():
        admin.goto(f'{BASE}/admin/inquiries')
        admin.get_by_role('link', name=re.compile(couple)).click()
        admin.locator('#inq-status').select_option('contacted')
        expect(admin.get_by_text('Marked as contacted')).to_be_visible()
        admin.locator('#inq-note').fill('Called back')
        admin.get_by_role('button', name='Add note').click()
        expect(admin.get_by_text('Called back')).to_be_visible()
    check('15 Inquiry appears in the admin inbox; status and notes work', t15)

    def t16():
        url, key = os.environ['SUPABASE_URL'], os.environ['ANON_KEY']
        for table in ['inquiries', 'inquiry_notes', 'admin_users', 'audit_log']:
            status, body = http(f'{url}/rest/v1/{table}?select=*', headers={'apikey': key, 'Authorization': f'Bearer {key}'})
            assert status in (401, 403) or 'permission denied' in body, f'{table}: anon got {status} {body[:80]}'
        status, body = http(f'{url}/rest/v1/stories?select=draft', headers={'apikey': key, 'Authorization': f'Bearer {key}'})
        assert 'permission denied' in body, 'anon could read story drafts'
        status, _ = http('/api/inquiry')
        assert status == 405, f'GET /api/inquiry returned {status}'
    check('16 Inquiries, notes and drafts are not readable through the public API', t16)

    def t17():
        ctx, page = new_page(browser)
        login(page, os.environ['ADMIN_EMAIL'], os.environ['ADMIN_PASSWORD'])
        page.wait_for_url(f'{BASE}/admin')
        page.goto(f'{BASE}/admin/homepage')
        expect(page.locator('#home-hero-headline')).to_have_value(new_headline)
        page.goto(f'{BASE}/admin/inquiries')
        expect(page.get_by_text(couple)).to_be_visible()
        ctx.close()
    check('17 Changes persist across sessions and devices', t17)

    def t18():
        admin.goto(f'{BASE}/admin/media')
        admin.get_by_label('Upload files').set_input_files(os.environ['BAD_FILE'])
        expect(admin.get_by_text(re.compile('only JPG, PNG'))).to_be_visible()
        # publish failure: give the story a slug that a live story already uses
        admin.goto(story_url['admin'])
        admin.locator('#story-slug').fill('a-day-to-remember')
        admin.get_by_role('button', name='Save draft').click()
        expect(admin.get_by_role('alert').filter(has_text='already uses the web address')).to_be_visible()
        status, _ = http('/stories/a-day-to-remember')
        assert status == 200, 'live story affected by failed save'
    check('18 Upload and publish errors are reported clearly and nothing breaks', t18)

    def t19():
        ctx, page = new_page(browser)
        page.goto(BASE + '/')
        hrefs = set(page.eval_on_selector_all('a[href^="/"]', 'els => els.map(e => e.getAttribute("href"))'))
        for h in sorted(hrefs):
            status, _ = http(h)
            assert status == 200, f'{h} returned {status}'
        ctx.close()
    check('19 Every internal link on the homepage works', t19)

    def t20():
        ctx, page = new_page(browser, reduced_motion='reduce')
        page.goto(BASE + '/about')
        page.wait_for_timeout(400)
        assert page.evaluate("getComputedStyle(document.querySelector('.marquee-track') || document.body).animationName") in ('none', ''), 'marquee still animating'
        opacity = page.evaluate("getComputedStyle(document.querySelector('h1 [aria-hidden] .inline-block .inline-block')).opacity")
        assert float(opacity) > 0.99, f'headline hidden under reduced motion (opacity {opacity})'
        ctx.close()
    check('20 Reduced-motion preference is respected', t20)

    # Clean up test content
    def cleanup():
        admin.goto(story_url['admin'])
        admin.get_by_role('button', name='Delete').click()
        admin.get_by_role('dialog').get_by_role('button', name='Delete permanently').click()
        admin.wait_for_url(f'{BASE}/admin/stories')
    check('-- cleanup: delete test story', cleanup)

    def t21():
        relevant = [e for e in console_errors if 'favicon' not in e and 'Failed to load resource' not in e]
        assert not relevant, f'{len(relevant)} console errors, first: {relevant[0][:200]}'
    check('21 No console errors on any page visited', t21)

    browser.close()

failed = [r for r in results if not r[1]]
print(f'\n{len(results) - len(failed)}/{len(results)} checks passed')
if console_errors:
    print('Console messages:', json.dumps(console_errors[:10], indent=1))
sys.exit(1 if failed else 0)
