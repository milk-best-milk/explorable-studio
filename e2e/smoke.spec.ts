import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('home page shows hero and example gallery', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: /play with/i })).toBeVisible()
  await expect(page.getByText('The magic of compound interest')).toBeVisible()
})

test('viewing an example reacts to slider input', async ({ page }) => {
  await page.goto('#/view?ex=compound-interest')
  await expect(page.getByText(/After 30 years/)).toBeVisible()
  await page.getByLabel('Years invested').fill('10')
  await expect(page.getByText(/After 10 years/)).toBeVisible()
})

test('building a block in the editor updates the live preview', async ({ page }) => {
  await page.goto('#/edit')
  await page.getByLabel('Title').fill('My test explainer')
  await page.getByRole('button', { name: /Text/ }).click()
  await expect(page.locator('.es-explainer').getByText('My test explainer')).toBeVisible()
  await expect(page.locator('.es-explainer').getByText(/Write/)).toBeVisible()
})

test('exported standalone HTML boots and is interactive on its own', async ({ page }) => {
  await page.goto('#/edit?ex=compound-interest')
  await expect(page.locator('.es-explainer')).toBeVisible()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /HTML/ }).click(),
  ])
  const html = readFileSync(await download.path(), 'utf8')
  expect(html).toContain('window.__EXPLORABLE_DOC__')

  // Load the exported file's content into a fresh page; it must render with no app server.
  const standalone = await page.context().newPage()
  await standalone.setContent(html, { waitUntil: 'load' })
  await expect(standalone.locator('.es-explainer')).toBeVisible({ timeout: 10_000 })
  await expect(standalone.getByText(/After 30 years/)).toBeVisible()
  await expect(standalone.getByText(/Made with Explorable Studio/)).toBeVisible()
})
