


import { test, expect, Page } from '@playwright/test';

// Helper function to login has been removed since the forms are now separate.
// Direct interaction will be used in each test.

test.describe.serial('CAFÈ PLEASE E2E Tests', () => {
    let page: Page;
    const ASSISTANT_NAME = 'Bruno Costa'; // OUTBOUND
    const ASSISTANT_PASS = '1234';
    const MANAGER_NAME = 'GESTOR';
    const MANAGER_PASS = '0000';
    const AUTO_APPROVE_ASSISTANT_NAME = 'Ana Silva'; // INBOUND

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
    });
    
    test.beforeEach(async () => {
        await page.goto('/');
        // Clear local storage before each test to ensure a clean state
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();
    });

    test('should show login page with two separate forms', async () => {
        await expect(page.getByRole('heading', { name: 'CAFÈ PLEASE ☕️' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Acesso Assistente' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Acesso Gestor' })).toBeVisible();
    });

    test('should allow an assistant to login and see their dashboard', async () => {
        await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
        await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
        await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
        
        await expect(page.getByRole('heading', { name: 'Novo Pedido' })).toBeVisible();
        await expect(page.getByTestId('pending-requests-list').getByRole('heading', { name: 'Fila de Pedidos Pendentes (OUTBOUND)' })).toBeVisible();
        await expect(page.getByTestId('active-requests-list').getByRole('heading', { name: 'Pedidos em Curso (OUTBOUND)' })).toBeVisible();
    });

    test('should allow a manager to login and see their dashboard', async () => {
        await page.getByLabel('Nome').last().fill(MANAGER_NAME);
        await page.getByLabel('Palavra-passe').last().fill(MANAGER_PASS);
        await page.getByTestId('manager-login-form').getByRole('button', { name: 'Entrar' }).click();

        await expect(page.getByRole('heading', { name: 'Equipa INBOUND' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Ações Rápidas' })).toBeVisible();
    });

    test.describe('Manual Request Flow', () => {
        test('1. Assistant creates a break request', async () => {
            await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
            
            await page.getByLabel('Tipo de Código').selectOption('BREAK');
            await page.getByLabel('Duração').selectOption('15 min');
            await page.getByRole('button', { name: 'Enviar Pedido' }).click();
            
            await expect(page.getByText('Pedido enviado com sucesso!')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Pedido Pendente' })).toBeVisible();
            await expect(page.getByText('1º na fila')).toBeVisible();
        });

        test('2. Manager approves the request', async () => {
            await page.getByLabel('Nome').last().fill(MANAGER_NAME);
            await page.getByLabel('Palavra-passe').last().fill(MANAGER_PASS);
            await page.getByTestId('manager-login-form').getByRole('button', { name: 'Entrar' }).click();
            
            await page.getByRole('link', { name: 'Gerir Pedidos' }).click();
            await expect(page.getByRole('heading', { name: 'Visão Geral dos Pedidos' })).toBeVisible();
            
            const requestCard = page.getByTestId('request-item').filter({ hasText: ASSISTANT_NAME });
            await expect(requestCard).toBeVisible();
            await requestCard.getByRole('button', { name: 'Aprovar' }).click();

            await expect(page.getByText(`Pedido de ${ASSISTANT_NAME} foi aprovado.`)).toBeVisible();
            
            await page.getByRole('button', { name: 'Aprovados' }).click();
            await expect(page.getByText('Aguardando assistente...')).toBeVisible();
        });

        test('3. Assistant accepts the approved request and starts the break', async () => {
            await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();

            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible();
            await page.getByRole('button', { name: 'Aceitar' }).click();

            await expect(page.getByText('Pausa iniciada! Aproveite.')).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Em BREAK' })).toBeVisible();
            await expect(page.getByText('Tempo restante')).toBeVisible();
        });
    });

    test.describe('Assistant Request List Visibility Flow', () => {
        test('1. Assistant creates a request and sees it in the pending list', async () => {
            // Login as assistant
            await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
            
            // Create a request
            await page.getByLabel('Tipo de Código').selectOption('BREAK');
            await page.getByLabel('Duração').selectOption('10 min');
            await page.getByRole('button', { name: 'Enviar Pedido' }).click();
            
            // Verify user status card
            await expect(page.getByRole('heading', { name: 'Pedido Pendente' })).toBeVisible();
            
            // Verify request is in the pending list
            const pendingList = page.getByTestId('pending-requests-list');
            await expect(pendingList.getByRole('heading', { name: 'Fila de Pedidos Pendentes (OUTBOUND)' })).toBeVisible();
            const requestItem = pendingList.getByTestId('request-list-item').filter({ hasText: ASSISTANT_NAME });
            await expect(requestItem).toBeVisible();
            await expect(requestItem.getByText('PENDENTE')).toBeVisible();
    
            // Verify the active list is empty
            const activeList = page.getByTestId('active-requests-list');
            await expect(activeList.getByText('Nenhum assistente em pausa ou código ativo.')).toBeVisible();
        });
    
        test('2. Manager approves the request', async () => {
            // Login as manager
            await page.getByLabel('Nome').last().fill(MANAGER_NAME);
            await page.getByLabel('Palavra-passe').last().fill(MANAGER_PASS);
            await page.getByTestId('manager-login-form').getByRole('button', { name: 'Entrar' }).click();
            
            // Go to request management and approve
            await page.getByRole('link', { name: 'Gerir Pedidos' }).click();
            const requestCard = page.getByTestId('request-item').filter({ hasText: ASSISTANT_NAME });
            await expect(requestCard).toBeVisible();
            await requestCard.getByRole('button', { name: 'Aprovar' }).click();
    
            // Verify notification and list update in manager view
            await expect(page.getByText(`Pedido de ${ASSISTANT_NAME} foi aprovado.`)).toBeVisible();
            await page.getByRole('button', { name: 'Aprovados' }).click();
            await expect(page.getByTestId('request-item').filter({ hasText: ASSISTANT_NAME })).toBeVisible();
        });
    
        test('3. Assistant sees the approved request in the pending list', async () => {
            // Login as assistant again
            await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
    
            // Verify user status card is "Approved"
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible();
    
            // **THE CORE TEST**
            // Verify request is now in the pending list with "APPROVED" status
            const pendingList = page.getByTestId('pending-requests-list');
            await expect(pendingList.getByRole('heading', { name: 'Fila de Pedidos Pendentes (OUTBOUND)' })).toBeVisible();
            const requestItem = pendingList.getByTestId('request-list-item').filter({ hasText: ASSISTANT_NAME });
            await expect(requestItem).toBeVisible();
            await expect(requestItem.getByText('APROVADO')).toBeVisible();
    
            // Verify the active list is still empty
            const activeList = page.getByTestId('active-requests-list');
            await expect(activeList.getByRole('heading', { name: 'Pedidos em Curso (OUTBOUND)' })).toBeVisible();
            await expect(activeList.getByText('Nenhum assistente em pausa ou código ativo.')).toBeVisible();
        });
        
        test('4. Assistant accepts, and request moves to active list', async () => {
            // Login as assistant
            await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
            
            // Accept the break
            await page.getByRole('button', { name: 'Aceitar' }).click();
            await expect(page.getByRole('heading', { name: 'Em BREAK' })).toBeVisible();
    
            // Verify pending list is now empty
            const pendingList = page.getByTestId('pending-requests-list');
            await expect(pendingList.getByText('Nenhum pedido na fila de espera.')).toBeVisible();
            
            // Verify request is in the active list with "ACTIVE" status
            const activeList = page.getByTestId('active-requests-list');
            await expect(activeList.getByRole('heading', { name: 'Pedidos em Curso (OUTBOUND)' })).toBeVisible();
            const requestItem = activeList.getByTestId('request-list-item').filter({ hasText: ASSISTANT_NAME });
            await expect(requestItem).toBeVisible();
            await expect(requestItem.getByText('ATIVO')).toBeVisible();
        });
    });

    test.describe('Auto-Approval Bot Flow', () => {
        test('1. Manager enables auto-approval for Inbound team', async () => {
            await page.getByLabel('Nome').last().fill(MANAGER_NAME);
            await page.getByLabel('Palavra-passe').last().fill(MANAGER_PASS);
            await page.getByTestId('manager-login-form').getByRole('button', { name: 'Entrar' }).click();

            await page.getByRole('link', { name: 'Configurações' }).click();
            await expect(page.getByRole('heading', { name: 'Configurações do Sistema' })).toBeVisible();
            
            await page.getByLabel('Bot Ativo').first().check();
            await page.getByRole('button', { name: 'Salvar Alterações' }).click();
            
            await expect(page.getByText('Configurações salvas com sucesso!')).toBeVisible();
            await page.reload(); 
            await expect(page.getByLabel('Bot Ativo').first()).toBeChecked();
        });

        test('2. Inbound assistant creates a request and it gets auto-approved', async () => {
            await page.getByLabel('Nome').first().fill(AUTO_APPROVE_ASSISTANT_NAME);
            await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
            await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();

            await page.getByLabel('Tipo de Código').selectOption('FOLLOW UP');
            await page.getByLabel('Duração').selectOption('10 min');
            await page.getByRole('button', { name: 'Enviar Pedido' }).click();

            await expect(page.getByRole('heading', { name: 'Pedido Pendente' })).toBeVisible();

            // Wait for the bot (runs every 5s) to approve the request
            await expect(page.getByRole('heading', { name: 'Pedido Aprovado!' })).toBeVisible({ timeout: 7000 });
            await expect(page.getByText('Você tem 30 segundos para aceitar.')).toBeVisible();
        });

        test('3. Manager disables auto-approval to clean up', async () => {
            await page.getByLabel('Nome').last().fill(MANAGER_NAME);
            await page.getByLabel('Palavra-passe').last().fill(MANAGER_PASS);
            await page.getByTestId('manager-login-form').getByRole('button', { name: 'Entrar' }).click();

            await page.getByRole('link', { name: 'Configurações' }).click();
            
            await page.getByLabel('Bot Ativo').first().uncheck();
            await page.getByRole('button', { name: 'Salvar Alterações' }).click();

            await expect(page.getByText('Configurações salvas com sucesso!')).toBeVisible();
            await page.reload();
            await expect(page.getByLabel('Bot Ativo').first()).not.toBeChecked();
        });
    });

    test('should allow assistant to change password', async () => {
        await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
        await page.getByLabel('Palavra-passe').first().fill(ASSISTANT_PASS);
        await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();

        await page.getByRole('button', { name: 'Alterar' }).click();
        
        await expect(page.getByRole('heading', { name: 'Alterar Palavra-passe' })).toBeVisible();
        
        await page.getByLabel('Palavra-passe Atual').fill(ASSISTANT_PASS);
        await page.getByLabel('Nova Palavra-passe').fill('newpass');
        await page.getByLabel('Confirmar Nova Palavra-passe').fill('newpass');
        await page.getByRole('button', { name: 'Salvar Alterações' }).click();

        await expect(page.getByText('Palavra-passe alterada com sucesso!')).toBeVisible();

        await page.getByRole('button', { name: 'LogOut' }).click();

        await page.getByLabel('Nome').first().fill(ASSISTANT_NAME);
        await page.getByLabel('Palavra-passe').first().fill('newpass');
        await page.getByTestId('assistant-login-form').getByRole('button', { name: 'Entrar' }).click();
        await expect(page.getByRole('heading', { name: 'Novo Pedido' })).toBeVisible();

        await page.getByRole('button', { name: 'Alterar' }).click();
        await page.getByLabel('Palavra-passe Atual').fill('newpass');
        await page.getByLabel('Nova Palavra-passe').fill(ASSISTANT_PASS);
        await page.getByLabel('Confirmar Nova Palavra-passe').fill(ASSISTANT_PASS);
        await page.getByRole('button', { name: 'Salvar Alterações' }).click();
        await expect(page.getByText('Palavra-passe alterada com sucesso!')).toBeVisible();
    });
});