#!/usr/bin/env python3
"""
Script de prueba para verificar la API
"""

import requests
import json

BASE_URL = "http://localhost:9000"

def test_login():
    """Probar login"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "admin@normetales.com", "password": "admin123"}
    )
    print("=== LOGIN ===")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Token: {data['access_token'][:50]}...")
    print(f"Usuario: {data['user']['nombre']} - {data['user']['rol']}")
    return data['access_token']


def test_protected_endpoints(token):
    """Probar endpoints protegidos"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n=== /auth/me ===")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    
    print("\n=== /vehiculos (admin) ===")
    response = requests.get(f"{BASE_URL}/vehiculos/", headers=headers)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2)[:500])


if __name__ == "__main__":
    try:
        token = test_login()
        test_protected_endpoints(token)
    except Exception as e:
        print(f"Error: {e}")