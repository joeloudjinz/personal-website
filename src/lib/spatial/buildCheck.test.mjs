import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distPath, isSpatialPage, missingRoutes, pageProblems, REQUIRED_ROUTES } from './buildCheck.ts';

const spatial = (body) => `<!doctype html><html lang="en" data-sp-root class="sp-day"><body>${body}</body></html>`;
const plain = (body) => `<!doctype html><html lang="en"><body>${body}</body></html>`;

test('distPath turns a built file into the route it serves', () => {
  assert.equal(distPath('index.html'), '/');
  assert.equal(distPath('404.html'), '/404');
  assert.equal(distPath('about/index.html'), '/about');
  assert.equal(distPath('tags/system-design/index.html'), '/tags/system-design');
});

test('a Spatial page is recognised by data-sp-root on <html>', () => {
  assert.equal(isSpatialPage(spatial('')), true);
  assert.equal(isSpatialPage(plain('<div data-sp-root></div>')), false);
});

test('a Spatial page needs exactly one h1', () => {
  assert.deepEqual(pageProblems('/x', spatial('<h1 class="a">One</h1>')), []);
  assert.equal(pageProblems('/x', spatial('<h2>None</h2>')).length, 1);
  assert.equal(pageProblems('/x', spatial('<h1>One</h1><h1>Two</h1>')).length, 1);
});

test('the h1 rule leaves the showcase pages alone', () => {
  assert.deepEqual(pageProblems('/inzsh', plain('<h1>a</h1><h1>b</h1>')), []);
});

test('review notes and placeholders are caught on any page', () => {
  assert.equal(pageProblems('/x', plain('<a href="mailto:[EMAIL]">Email me</a>')).length, 1);
  assert.equal(pageProblems('/x', spatial('<h1>t</h1><p>[3D bubble · turns toward the pointer]</p>')).length, 1);
  assert.deepEqual(pageProblems('/x', plain('<p>An array is written [1, 2, 3].</p>')), []);
});

test('a route that is no longer built is reported', () => {
  assert.deepEqual(missingRoutes(REQUIRED_ROUTES), []);
  assert.deepEqual(missingRoutes(REQUIRED_ROUTES.filter((route) => route !== '/about')), ['/about']);
});
