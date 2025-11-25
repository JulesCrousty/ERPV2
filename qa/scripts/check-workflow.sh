#!/bin/bash
set -e

if [ ! -f backend/src/modules/workflow/workflow.module.ts ]; then
  echo "Workflow module missing" >&2
  exit 1
fi

grep -q "WorkflowInstancesService" backend/src/modules/workflow/services/workflow-instances.service.ts && \
  echo "Workflow services ready" || { echo "WorkflowInstancesService missing"; exit 1; }
