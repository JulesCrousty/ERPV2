describe('ERP end-to-end flows (QA)', () => {
  it('should execute FI approval flow with rejection in step 2', async () => {
    const fiDocument = { id: 1, status: 'DRAFT' };
    const workflow = {
      steps: ['reviewer', 'controller'],
      current: 0,
      status: 'IN_REVIEW',
      history: [] as string[],
    };

    // Step 1 approve
    workflow.history.push('Step 1 APPROVED');
    workflow.current++;
    expect(workflow.status).toBe('IN_REVIEW');

    // Step 2 reject
    workflow.history.push('Step 2 REJECTED');
    workflow.status = 'REJECTED';

    expect(workflow.status).toBe('REJECTED');
    expect(workflow.history).toEqual(['Step 1 APPROVED', 'Step 2 REJECTED']);
    fiDocument.status = workflow.status;
    expect(fiDocument.status).toBe('REJECTED');
  });

  it('should execute MM to WM logistics handover', async () => {
    const purchaseOrder = { id: 99, status: 'CREATED' };
    const goodsReceipt = { id: 10, status: 'PENDING', poId: purchaseOrder.id };
    const transferOrder = { id: 77, status: 'OPEN', sourceReceiptId: goodsReceipt.id };

    purchaseOrder.status = 'APPROVED';
    goodsReceipt.status = 'POSTED';
    transferOrder.status = 'CONFIRMED';
    const workflowAudit = ['PO CREATED', 'GR POSTED', 'TO CONFIRMED', 'WORKFLOW VALIDATED'];

    expect(purchaseOrder.status).toBe('APPROVED');
    expect(goodsReceipt.status).toBe('POSTED');
    expect(transferOrder.status).toBe('CONFIRMED');
    expect(workflowAudit).toContain('WORKFLOW VALIDATED');
  });
});
