export default async function run(page, ui) {
  // Check React hydration and component state
  const reactInfo = await page.evaluate(() => {
    const button = document.querySelector('.pd-trigger')
    const container = document.querySelector('.pd-root')
    
    // Check for React internal props
    const hasReactProps = Object.keys(button || {}).some(k => k.startsWith('__react'))
    
    return {
      buttonExists: !!button,
      containerExists: !!container,
      hasReactProps,
      buttonHTML: button?.outerHTML.substring(0, 200),
      buttonOnClick: button?.onclick ? 'has onclick' : 'no onclick'
    }
  })
  
  console.log('React check:')
  console.log(JSON.stringify(reactInfo, null, 2))
  
  // Try direct onclick trigger
  console.log('\nAttempting direct focus and space key...')
  const ref = ui.ref('@e3')
  await ref.focus()
  await page.keyboard.press('Space')
  await page.waitForTimeout(400)
  
  const stateAfterSpace = await page.evaluate(() => {
    const panel = document.querySelector('.pd-panel')
    const button = document.querySelector('.pd-trigger')
    return {
      panelHasOpenClass: panel?.classList.contains('pd-panel-open'),
      ariaExpanded: button?.getAttribute('aria-expanded')
    }
  })
  
  console.log('State after space key:')
  console.log(JSON.stringify(stateAfterSpace, null, 2))
  
  return { reactInfo, stateAfterSpace }
}
