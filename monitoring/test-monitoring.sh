#!/bin/bash
curl -f http://localhost:3100/ready || exit 1
curl -f http://localhost:3005/login || exit 1
echo "Monitoring OK"
