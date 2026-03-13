const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Iniciando teste do Facebook Pixel...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capturar mensagens do console
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    console.log(`📝 Console: ${text}`);
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.error(`❌ Erro na página: ${error.message}`);
  });
  
  // Navegar para a página de teste
  console.log('🌐 Navegando para http://localhost:3000/facebook-pixel-test.html\n');
  
  try {
    await page.goto('http://localhost:3000/facebook-pixel-test.html', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✓ Página carregada com sucesso\n');
  } catch (error) {
    console.error(`❌ Erro ao carregar página: ${error.message}`);
    await browser.close();
    process.exit(1);
  }
  
  console.log('⏳ Aguardando 5 segundos para disparos automáticos...\n');
  
  // Aguardar 5 segundos para os eventos automáticos dispararem
  await page.waitForTimeout(5000);
  
  // Verificar o conteúdo da div de status
  const statusText = await page.$eval('#status', el => el.innerText);
  
  console.log('📊 RESULTADO DO TESTE:\n');
  console.log('Status na página:', statusText);
  console.log('\n📋 Mensagens do console capturadas:');
  consoleMessages.forEach((msg, index) => {
    console.log(`  ${index + 1}. ${msg}`);
  });
  
  // Verificar se os eventos foram disparados
  const initiateCheckoutDisparado = consoleMessages.some(msg => 
    msg.includes('InitiateCheckout disparado')
  );
  const purchaseDisparado = consoleMessages.some(msg => 
    msg.includes('Purchase disparado')
  );
  
  console.log('\n✅ VERIFICAÇÃO DOS EVENTOS:');
  console.log(`  InitiateCheckout: ${initiateCheckoutDisparado ? '✓ DISPARADO' : '✗ NÃO DISPARADO'}`);
  console.log(`  Purchase: ${purchaseDisparado ? '✓ DISPARADO' : '✗ NÃO DISPARADO'}`);
  
  if (initiateCheckoutDisparado && purchaseDisparado) {
    console.log('\n🎉 SUCESSO! Todos os eventos foram disparados corretamente.');
  } else {
    console.log('\n⚠️  ATENÇÃO! Alguns eventos não foram disparados.');
  }
  
  await browser.close();
  
  // Retornar código de saída apropriado
  process.exit(initiateCheckoutDisparado && purchaseDisparado ? 0 : 1);
})();
