import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
from app.services.health_check import check_openalex_health, check_epo_health

def run():
    print("=" * 60)
    print("RUNNING HEALTH CHECK DIAGNOSTICS")
    print("=" * 60)
    
    oa = check_openalex_health()
    print("OPENALEX DIAGNOSTIC:")
    print(f"  Configured: {'YES' if oa.get('configured') else 'NO'}")
    print(f"  Auth status: {oa.get('auth_status')}")
    print(f"  HTTP status: {oa.get('http_status')}")
    print(f"  Category: {oa.get('category')}")
    print(f"  Total matching: {oa.get('total_matching')}")
    print(f"  Records received: {oa.get('records_received')}")
    print(f"  Data received: {'YES' if oa.get('data_received') else 'NO'}")
    print(f"  Sample title: {oa.get('sample_title')}")
    print(f"  Message: {oa.get('message')}")
    
    print("\nEPO OPS DIAGNOSTIC:")
    epo = check_epo_health()
    print(f"  Consumer credentials configured: {'YES' if epo.get('configured') else 'NO'}")
    print(f"  Auth status: {epo.get('auth_status')}")
    print(f"  Token received: {'YES' if epo.get('token_received') else 'NO'}")
    print(f"  Category: {epo.get('category')}")
    print(f"  Search status: {epo.get('search_status')}")
    print(f"  Records received: {epo.get('records_received')}")
    print(f"  Actual data: {'YES' if epo.get('data_received') else 'NO'}")
    print(f"  Message: {epo.get('message')}")
    print("=" * 60)

if __name__ == "__main__":
    run()
