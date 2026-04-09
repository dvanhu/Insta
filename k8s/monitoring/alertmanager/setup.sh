#!/bin/bash

echo "🚀 Applying Alertmanager config..."

kubectl create secret generic alertmanager-monitoring-kube-prometheus-alertmanager \
  --from-file=alertmanager.yaml=alertmanager.yaml \
  -n monitoring \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl delete pod -n monitoring alertmanager-monitoring-kube-prometheus-alertmanager-0

echo "✅ Alertmanager ready!"
